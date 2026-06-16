// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IRegistry {
    function isRegisteredActive(address wallet) external view returns (bool);
    function isRegisteredActiveAgent(address wallet) external view returns (bool); // H-2
    function recordCompletion(address worker, uint256 amount) external;
}

contract MeshworkEscrow is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    IRegistry public immutable registry;
    address public immutable treasury;

    uint256 public constant FEE_BPS = 150; // 1.5%
    uint256 public constant DISPUTE_TIMEOUT = 14 days;

    enum Status { Open, Active, Submitted, Settled, Disputed, Cancelled }

    struct Job {
        uint256 id;
        address client;
        address worker;
        address targetWorker;
        uint256 amount;
        uint256 deadline;
        Status status;
        bool workerIsAgent;
        string title;
        string descriptionURI;
        string deliverableURI;
        uint256 createdAt;
        uint256 disputedAt;
    }

    Job[] public jobs;
    mapping(address => uint256[]) public clientJobs;
    mapping(address => uint256[]) public workerJobs;

    event JobPosted(uint256 indexed jobId, address indexed client, address indexed targetWorker, uint256 amount, bool workerIsAgent, string title);
    event JobAccepted(uint256 indexed jobId, address indexed worker);
    event WorkSubmitted(uint256 indexed jobId, address indexed worker);
    event WorkApproved(uint256 indexed jobId, address indexed worker, uint256 workerAmount, uint256 feeAmount);
    event JobCancelled(uint256 indexed jobId);
    event DisputeRaised(uint256 indexed jobId);
    event JobReclaimedExpired(uint256 indexed jobId);
    event WorkerClaimedSubmitted(uint256 indexed jobId); // C-1 fix

    constructor(address _usdc, address _registry, address _treasury) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        registry = IRegistry(_registry);
        treasury = _treasury;
    }

    function postJob(
        uint256 amount,
        uint256 deadline,
        string memory title,
        string memory descriptionURI,
        bool workerIsAgent,
        address targetWorker
    ) external nonReentrant returns (uint256) {
        require(amount > 0, "Amount required");
        require(deadline > block.timestamp, "Deadline must be future");
        if (targetWorker != address(0)) {
            require(registry.isRegisteredActive(targetWorker), "Target not registered");
        }
        usdc.safeTransferFrom(msg.sender, address(this), amount);
        uint256 jobId = jobs.length;
        jobs.push(Job({
            id: jobId,
            client: msg.sender,
            worker: address(0),
            targetWorker: targetWorker,
            amount: amount,
            deadline: deadline,
            status: Status.Open,
            workerIsAgent: workerIsAgent,
            title: title,
            descriptionURI: descriptionURI,
            deliverableURI: "",
            createdAt: block.timestamp,
            disputedAt: 0
        }));
        clientJobs[msg.sender].push(jobId);
        emit JobPosted(jobId, msg.sender, targetWorker, amount, workerIsAgent, title);
        return jobId;
    }

    function acceptJob(uint256 jobId) external nonReentrant {
        Job storage job = jobs[jobId];
        require(job.status == Status.Open, "Not open");
        // FIX H-3: reject expired jobs
        require(block.timestamp <= job.deadline, "Job has expired");
        require(registry.isRegisteredActive(msg.sender), "Worker not registered");
        // FIX H-2: enforce agent-only jobs on-chain
        if (job.workerIsAgent) {
            require(registry.isRegisteredActiveAgent(msg.sender), "This job requires an agent worker");
        }
        if (job.targetWorker != address(0)) {
            require(msg.sender == job.targetWorker, "Not target worker");
        }
        job.worker = msg.sender;
        job.status = Status.Active;
        workerJobs[msg.sender].push(jobId);
        emit JobAccepted(jobId, msg.sender);
    }

    function submitWork(uint256 jobId, string memory deliverableURI) external nonReentrant {
        Job storage job = jobs[jobId];
        require(job.status == Status.Active, "Not active");
        require(job.worker == msg.sender, "Not worker");
        job.deliverableURI = deliverableURI;
        job.status = Status.Submitted;
        emit WorkSubmitted(jobId, msg.sender);
    }

    function approveWork(uint256 jobId) external nonReentrant {
        Job storage job = jobs[jobId];
        require(job.status == Status.Submitted, "Not submitted");
        require(job.client == msg.sender, "Not client");
        _settle(job);
    }

    // FIX M-2: restrict cancel to Open only — once accepted, worker is protected
    function cancelJob(uint256 jobId) external nonReentrant {
        Job storage job = jobs[jobId];
        require(job.client == msg.sender, "Not client");
        require(job.status == Status.Open, "Can only cancel open jobs");
        job.status = Status.Cancelled;
        usdc.safeTransfer(msg.sender, job.amount);
        emit JobCancelled(jobId);
    }

    // FIX C-1: reclaimExpired only applies to Active (worker accepted but never submitted)
    // Submitted status is protected — use workerClaimSubmitted instead
    function reclaimExpired(uint256 jobId) external nonReentrant {
        Job storage job = jobs[jobId];
        require(job.client == msg.sender, "Not client");
        require(job.status == Status.Active, "Only active jobs can be reclaimed");
        require(block.timestamp > job.deadline, "Not expired");
        job.status = Status.Cancelled;
        usdc.safeTransfer(msg.sender, job.amount);
        emit JobReclaimedExpired(jobId);
    }

    // NEW C-1: worker can claim payment if client ignores a submitted job past deadline
    function workerClaimSubmitted(uint256 jobId) external nonReentrant {
        Job storage job = jobs[jobId];
        require(job.status == Status.Submitted, "Not submitted");
        require(job.worker == msg.sender, "Not worker");
        require(block.timestamp > job.deadline, "Deadline not passed");
        _settle(job);
        emit WorkerClaimedSubmitted(jobId);
    }

    function raiseDispute(uint256 jobId) external nonReentrant {
        Job storage job = jobs[jobId];
        require(job.status == Status.Submitted, "Not submitted");
        require(job.client == msg.sender, "Not client");
        job.status = Status.Disputed;
        job.disputedAt = block.timestamp;
        emit DisputeRaised(jobId);
    }

    function resolveDispute(uint256 jobId, bool payWorker) external onlyOwner nonReentrant {
        Job storage job = jobs[jobId];
        require(job.status == Status.Disputed, "Not disputed");
        if (payWorker) {
            _settle(job);
        } else {
            job.status = Status.Cancelled;
            usdc.safeTransfer(job.client, job.amount);
        }
    }

    function reclaimTimedOutDispute(uint256 jobId) external nonReentrant {
        Job storage job = jobs[jobId];
        require(job.status == Status.Disputed, "Not disputed");
        require(block.timestamp > job.disputedAt + DISPUTE_TIMEOUT, "Timeout not reached");
        _settle(job);
    }

    function _settle(Job storage job) internal {
        uint256 fee = (job.amount * FEE_BPS) / 10000;
        uint256 workerAmount = job.amount - fee;
        job.status = Status.Settled;
        usdc.safeTransfer(job.worker, workerAmount);
        usdc.safeTransfer(treasury, fee);
        registry.recordCompletion(job.worker, workerAmount);
        emit WorkApproved(job.id, job.worker, workerAmount, fee);
    }

    function getJob(uint256 jobId) external view returns (Job memory) {
        return jobs[jobId];
    }

    function getJobCount() external view returns (uint256) {
        return jobs.length;
    }

    function getClientJobs(address c) external view returns (uint256[] memory) {
        return clientJobs[c];
    }

    function getWorkerJobs(address w) external view returns (uint256[] memory) {
        return workerJobs[w];
    }
}
