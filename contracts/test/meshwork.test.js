const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

const USDC = (n) => BigInt(Math.round(n * 1e6));
const JOB = USDC(10);
const FEE = (JOB * 150n) / 10000n;
const WORKER_CUT = JOB - FEE;

async function deployFixture() {
  const [owner, client, worker, agent, treasury, outsider] = await ethers.getSigners();
  const Mock = await ethers.getContractFactory("MockUSDC");
  const usdc = await Mock.deploy();
  const Registry = await ethers.getContractFactory("MeshworkRegistry");
  const registry = await Registry.deploy();
  const Escrow = await ethers.getContractFactory("MeshworkEscrow");
  const escrow = await Escrow.deploy(await usdc.getAddress(), await registry.getAddress(), treasury.address);
  await registry.setEscrow(await escrow.getAddress());
  await usdc.mint(client.address, USDC(1000));
  await usdc.connect(client).approve(await escrow.getAddress(), USDC(1000));
  return { owner, client, worker, agent, treasury, outsider, usdc, registry, escrow };
}

async function futureDeadline(secs = 86400) {
  return (await time.latest()) + secs;
}

describe("MeshworkRegistry", () => {
  it("registers a human worker and marks it active", async () => {
    const { registry, worker } = await loadFixture(deployFixture);
    await registry.connect(worker).registerWorker("Alice", ["WRITING"], false, "", 0);
    expect(await registry.isRegisteredActive(worker.address)).to.equal(true);
    const w = await registry.getWorker(worker.address);
    expect(w.name).to.equal("Alice");
    expect(w.jobsCompleted).to.equal(0n);
  });

  it("blocks double registration", async () => {
    const { registry, worker } = await loadFixture(deployFixture);
    await registry.connect(worker).registerWorker("Alice", ["WRITING"], false, "", 0);
    await expect(
      registry.connect(worker).registerWorker("Alice2", ["CODING"], false, "", 0)
    ).to.be.revertedWith("Already registered; use updateProfile");
  });

  it("requires an endpoint for agents", async () => {
    const { registry, agent } = await loadFixture(deployFixture);
    await expect(
      registry.connect(agent).registerWorker("Bot", ["TRANSLATION"], true, "", 0)
    ).to.be.revertedWith("Agent needs endpoint");
  });

  it("setActive(false) makes worker inactive", async () => {
    const { registry, worker } = await loadFixture(deployFixture);
    await registry.connect(worker).registerWorker("Alice", ["WRITING"], false, "", 0);
    await registry.connect(worker).setActive(false);
    expect(await registry.isRegisteredActive(worker.address)).to.equal(false);
  });

  it("only escrow can call recordCompletion", async () => {
    const { registry, outsider, worker } = await loadFixture(deployFixture);
    await expect(
      registry.connect(outsider).recordCompletion(worker.address, USDC(5))
    ).to.be.revertedWith("Only escrow");
  });
});

describe("MeshworkEscrow", () => {
  it("posts a job and escrows USDC", async () => {
    const { escrow, usdc, client } = await loadFixture(deployFixture);
    const tx = await escrow.connect(client).postJob(JOB, await futureDeadline(), "Tx", "desc", false, ethers.ZeroAddress);
    await tx.wait();
    const jobId = 0n;
    expect(await usdc.balanceOf(await escrow.getAddress())).to.equal(JOB);
    const job = await escrow.getJob(jobId);
    expect(job.status).to.equal(0);
    expect(job.amount).to.equal(JOB);
    expect(job.id).to.equal(jobId);
  });

  it("runs full flow and splits 98.5/1.5 + bumps reputation", async () => {
    const { escrow, registry, usdc, client, worker, treasury } = await loadFixture(deployFixture);
    await registry.connect(worker).registerWorker("Alice", ["WRITING"], false, "", 0);
    const tx = await escrow.connect(client).postJob(JOB, await futureDeadline(), "Tx", "desc", false, ethers.ZeroAddress);
    await tx.wait();
    const jobId = 0n;
    await escrow.connect(worker).acceptJob(jobId);
    await escrow.connect(worker).submitWork(jobId, "ipfs://result");
    const before = await usdc.balanceOf(worker.address);
    await expect(escrow.connect(client).approveWork(jobId))
      .to.emit(escrow, "WorkApproved").withArgs(jobId, worker.address, WORKER_CUT, FEE);
    expect(await usdc.balanceOf(worker.address)).to.equal(before + WORKER_CUT);
    expect(await usdc.balanceOf(treasury.address)).to.equal(FEE);
    const w = await registry.getWorker(worker.address);
    expect(w.jobsCompleted).to.equal(1n);
    expect(w.totalEarned).to.equal(WORKER_CUT);
  });

  it("rejects accept from non-registered worker", async () => {
    const { escrow, client, outsider } = await loadFixture(deployFixture);
    const tx = await escrow.connect(client).postJob(JOB, await futureDeadline(), "Tx", "desc", false, ethers.ZeroAddress);
    await tx.wait();
    const jobId = 0n;
    await expect(escrow.connect(outsider).acceptJob(jobId)).to.be.revertedWith("Worker not registered");
  });

  it("client can accept own job (guard removed per audit)", async () => {
    const { escrow, registry, client } = await loadFixture(deployFixture);
    await registry.connect(client).registerWorker("Self", ["WRITING"], false, "", 0);
    const tx = await escrow.connect(client).postJob(JOB, await futureDeadline(), "Tx", "desc", false, ethers.ZeroAddress);
    await tx.wait();
    const jobId = 0n;
    await expect(escrow.connect(client).acceptJob(jobId))
      .to.emit(escrow, "JobAccepted").withArgs(jobId, client.address);
  });

  it("directed hire: only the targeted agent can accept", async () => {
      const { escrow, registry, client, worker, agent } = await loadFixture(deployFixture);
      await registry.connect(worker).registerWorker("Alice", ["WRITING"], true, "https://alice.example/exec", 0);
      await registry.connect(agent).registerWorker("Bot", ["TRANSLATION"], true, "https://agent.example/exec", 0);
    const tx = await escrow.connect(client).postJob(JOB, await futureDeadline(), "Tx", "desc", true, agent.address);
    await tx.wait();
    const jobId = 0n;
    await expect(escrow.connect(worker).acceptJob(jobId)).to.be.revertedWith("Not target worker");
    await expect(escrow.connect(agent).acceptJob(jobId)).to.emit(escrow, "JobAccepted").withArgs(jobId, agent.address);
  });

  it("cancelJob refunds client while OPEN", async () => {
    const { escrow, usdc, client } = await loadFixture(deployFixture);
    const before = await usdc.balanceOf(client.address);
    const tx = await escrow.connect(client).postJob(JOB, await futureDeadline(), "Tx", "desc", false, ethers.ZeroAddress);
    await tx.wait();
    const jobId = 0n;
    await escrow.connect(client).cancelJob(jobId);
    expect(await usdc.balanceOf(client.address)).to.equal(before);
  });

  it("cannot cancel once ACTIVE", async () => {
    const { escrow, registry, client, worker } = await loadFixture(deployFixture);
    await registry.connect(worker).registerWorker("Alice", ["WRITING"], false, "", 0);
    const tx = await escrow.connect(client).postJob(JOB, await futureDeadline(), "Tx", "desc", false, ethers.ZeroAddress);
    await tx.wait();
    const jobId = 0n;
    await escrow.connect(worker).acceptJob(jobId);
    await expect(escrow.connect(client).cancelJob(jobId)).to.be.revertedWith("Can only cancel open jobs");
  });

  it("reclaimExpired refunds client if worker ghosts past deadline", async () => {
    const { escrow, registry, usdc, client, worker } = await loadFixture(deployFixture);
    await registry.connect(worker).registerWorker("Alice", ["WRITING"], false, "", 0);
    const dl = await futureDeadline(100);
    const tx = await escrow.connect(client).postJob(JOB, dl, "Tx", "desc", false, ethers.ZeroAddress);
    await tx.wait();
    const jobId = 0n;
    await escrow.connect(worker).acceptJob(jobId);
    await expect(escrow.connect(client).reclaimExpired(jobId)).to.be.revertedWith("Not expired");
    await time.increaseTo(dl + 1);
    const before = await usdc.balanceOf(client.address);
    await expect(escrow.connect(client).reclaimExpired(jobId))
      .to.emit(escrow, "JobReclaimedExpired").withArgs(jobId);
    expect(await usdc.balanceOf(client.address)).to.equal(before + JOB);
  });

  it("workerClaimSubmitted pays worker after deadline", async () => {
    const { escrow, registry, usdc, client, worker } = await loadFixture(deployFixture);
    await registry.connect(worker).registerWorker("Alice", ["WRITING"], false, "", 0);
    const dl = await futureDeadline(100);
    const tx = await escrow.connect(client).postJob(JOB, dl, "Tx", "desc", false, ethers.ZeroAddress);
    await tx.wait();
    const jobId = 0n;
    await escrow.connect(worker).acceptJob(jobId);
    await escrow.connect(worker).submitWork(jobId, "ipfs://r");
    await expect(escrow.connect(worker).workerClaimSubmitted(jobId)).to.be.revertedWith("Deadline not passed");
    await time.increaseTo(dl + 1);
    const before = await usdc.balanceOf(worker.address);
    await expect(escrow.connect(worker).workerClaimSubmitted(jobId))
      .to.emit(escrow, "WorkerClaimedSubmitted").withArgs(jobId);
    expect(await usdc.balanceOf(worker.address)).to.equal(before + WORKER_CUT);
  });

  it("resolveDispute favoring worker pays worker + fee", async () => {
    const { escrow, registry, usdc, owner, client, worker, treasury } = await loadFixture(deployFixture);
    await registry.connect(worker).registerWorker("Alice", ["WRITING"], false, "", 0);
    const tx = await escrow.connect(client).postJob(JOB, await futureDeadline(), "Tx", "desc", false, ethers.ZeroAddress);
    await tx.wait();
    const jobId = 0n;
    await escrow.connect(worker).acceptJob(jobId);
    await escrow.connect(worker).submitWork(jobId, "ipfs://r");
    await escrow.connect(client).raiseDispute(jobId);
    await expect(escrow.connect(owner).resolveDispute(jobId, true))
      .to.emit(escrow, "WorkApproved").withArgs(jobId, worker.address, WORKER_CUT, FEE);
    expect(await usdc.balanceOf(worker.address)).to.equal(WORKER_CUT);
    expect(await usdc.balanceOf(treasury.address)).to.equal(FEE);
  });

  it("resolveDispute favoring client refunds full amount", async () => {
    const { escrow, registry, usdc, owner, client, worker } = await loadFixture(deployFixture);
    await registry.connect(worker).registerWorker("Alice", ["WRITING"], false, "", 0);
    const before = await usdc.balanceOf(client.address);
    const tx = await escrow.connect(client).postJob(JOB, await futureDeadline(), "Tx", "desc", false, ethers.ZeroAddress);
    await tx.wait();
    const jobId = 0n;
    await escrow.connect(worker).acceptJob(jobId);
    await escrow.connect(worker).submitWork(jobId, "ipfs://r");
    await escrow.connect(client).raiseDispute(jobId);
    await escrow.connect(owner).resolveDispute(jobId, false);
    expect(await usdc.balanceOf(client.address)).to.equal(before);
    const job = await escrow.getJob(jobId);
    expect(job.status).to.equal(5);
  });

  it("only owner can resolve a dispute", async () => {
    const { escrow, registry, client, worker } = await loadFixture(deployFixture);
    await registry.connect(worker).registerWorker("Alice", ["WRITING"], false, "", 0);
    const tx = await escrow.connect(client).postJob(JOB, await futureDeadline(), "Tx", "desc", false, ethers.ZeroAddress);
    await tx.wait();
    const jobId = 0n;
    await escrow.connect(worker).acceptJob(jobId);
    await escrow.connect(worker).submitWork(jobId, "ipfs://r");
    await escrow.connect(client).raiseDispute(jobId);
    await expect(escrow.connect(client).resolveDispute(jobId, false))
      .to.be.revertedWithCustomError(escrow, "OwnableUnauthorizedAccount");
  });

  it("reclaimTimedOutDispute settles to worker after DISPUTE_TIMEOUT", async () => {
    const { escrow, registry, usdc, client, worker } = await loadFixture(deployFixture);
    await registry.connect(worker).registerWorker("Alice", ["WRITING"], false, "", 0);
    const tx = await escrow.connect(client).postJob(JOB, await futureDeadline(), "Tx", "desc", false, ethers.ZeroAddress);
    await tx.wait();
    const jobId = 0n;
    await escrow.connect(worker).acceptJob(jobId);
    await escrow.connect(worker).submitWork(jobId, "ipfs://r");
    await escrow.connect(client).raiseDispute(jobId);
    await expect(escrow.reclaimTimedOutDispute(jobId)).to.be.revertedWith("Timeout not reached");
    await time.increase(14 * 86400 + 1);
    const before = await usdc.balanceOf(worker.address);
    await expect(escrow.reclaimTimedOutDispute(jobId))
      .to.emit(escrow, "WorkApproved").withArgs(jobId, worker.address, WORKER_CUT, FEE);
    expect(await usdc.balanceOf(worker.address)).to.equal(before + WORKER_CUT);
  });
});