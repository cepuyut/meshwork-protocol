import type { Address } from "viem";

export const USDC_ADDRESS = (process.env.NEXT_PUBLIC_USDC_ADDRESS ||
  "0x3600000000000000000000000000000000000000") as Address;
export const REGISTRY_ADDRESS = (process.env.NEXT_PUBLIC_REGISTRY_ADDRESS || "") as Address;
export const ESCROW_ADDRESS = (process.env.NEXT_PUBLIC_ESCROW_ADDRESS || "") as Address;

export const USDC_DECIMALS = 6;
export const PROTOCOL_FEE_BPS = 150;

export const isConfigured = () => !!ESCROW_ADDRESS && !!REGISTRY_ADDRESS;

export const JOB_STATUS = ["Open", "Active", "Submitted", "Settled", "Disputed", "Cancelled"] as const;
export type JobStatus = (typeof JOB_STATUS)[number];

export const CAPABILITIES = ["WRITING", "RESEARCH", "TRANSLATION", "CODING", "DATA"] as const;

export const jobTupleComponents = [
  { name: "id", type: "uint256" }, { name: "client", type: "address" }, { name: "worker", type: "address" },
  { name: "targetWorker", type: "address" }, { name: "amount", type: "uint256" }, { name: "deadline", type: "uint256" },
  { name: "status", type: "uint8" }, { name: "workerIsAgent", type: "bool" }, { name: "title", type: "string" },
  { name: "descriptionURI", type: "string" }, { name: "deliverableURI", type: "string" }, { name: "createdAt", type: "uint256" }, { name: "disputedAt", type: "uint256" },
] as const;

export const erc20Abi = [
  { type: "function", name: "approve", stateMutability: "nonpayable", inputs: [{ name: "spender", type: "address" }, { name: "amount", type: "uint256" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "allowance", stateMutability: "view", inputs: [{ name: "owner", type: "address" }, { name: "spender", type: "address" }], outputs: [{ type: "uint256" }] },
  { type: "function", name: "balanceOf", stateMutability: "view", inputs: [{ name: "account", type: "address" }], outputs: [{ type: "uint256" }] },
] as const;

export const escrowAbi = [
  { type: "function", name: "getJobCount", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "getJob", stateMutability: "view", inputs: [{ name: "jobId", type: "uint256" }], outputs: [{ type: "tuple", components: jobTupleComponents }] },
  { type: "function", name: "getClientJobs", stateMutability: "view", inputs: [{ name: "c", type: "address" }], outputs: [{ type: "uint256[]" }] },
  { type: "function", name: "getWorkerJobs", stateMutability: "view", inputs: [{ name: "w", type: "address" }], outputs: [{ type: "uint256[]" }] },
  { type: "function", name: "postJob", stateMutability: "nonpayable", inputs: [
    { name: "amount", type: "uint256" }, { name: "deadline", type: "uint256" }, { name: "title", type: "string" },
    { name: "descriptionURI", type: "string" }, { name: "workerIsAgent", type: "bool" }, { name: "targetWorker", type: "address" },
  ], outputs: [{ type: "uint256" }] },
  { type: "function", name: "acceptJob", stateMutability: "nonpayable", inputs: [{ name: "jobId", type: "uint256" }], outputs: [] },
  { type: "function", name: "submitWork", stateMutability: "nonpayable", inputs: [{ name: "jobId", type: "uint256" }, { name: "deliverableURI", type: "string" }], outputs: [] },
  { type: "function", name: "approveWork", stateMutability: "nonpayable", inputs: [{ name: "jobId", type: "uint256" }], outputs: [] },
  { type: "function", name: "cancelJob", stateMutability: "nonpayable", inputs: [{ name: "jobId", type: "uint256" }], outputs: [] },
  { type: "function", name: "reclaimExpired", stateMutability: "nonpayable", inputs: [{ name: "jobId", type: "uint256" }], outputs: [] },
  { type: "function", name: "raiseDispute", stateMutability: "nonpayable", inputs: [{ name: "jobId", type: "uint256" }], outputs: [] },
  { type: "function", name: "workerClaimSubmitted", stateMutability: "nonpayable", inputs: [{ name: "jobId", type: "uint256" }], outputs: [] },
    { type: "event", name: "JobPosted", inputs: [
    { name: "jobId", type: "uint256", indexed: true }, { name: "client", type: "address", indexed: true }, { name: "targetWorker", type: "address", indexed: true },
    { name: "amount", type: "uint256", indexed: false }, { name: "workerIsAgent", type: "bool", indexed: false }, { name: "title", type: "string", indexed: false },
  ] },
  { type: "event", name: "WorkApproved", inputs: [
    { name: "jobId", type: "uint256", indexed: true }, { name: "worker", type: "address", indexed: true }, { name: "workerAmount", type: "uint256", indexed: false }, { name: "feeAmount", type: "uint256", indexed: false },
  ] },
] as const;

export const workerTupleComponents = [
  { name: "wallet", type: "address" }, { name: "name", type: "string" }, { name: "capabilities", type: "string[]" },
  { name: "isAgent", type: "bool" }, { name: "endpoint", type: "string" }, { name: "pricePerJob", type: "uint256" },
  { name: "jobsCompleted", type: "uint256" }, { name: "totalEarned", type: "uint256" }, { name: "isActive", type: "bool" },
  { name: "exists", type: "bool" }, { name: "registeredAt", type: "uint256" },
] as const;

export const registryAbi = [
  { type: "function", name: "getWorkerCount", stateMutability: "view", inputs: [], outputs: [{ type: "uint256" }] },
  { type: "function", name: "getWorkers", stateMutability: "view", inputs: [{ name: "offset", type: "uint256" }, { name: "limit", type: "uint256" }], outputs: [{ type: "tuple[]", components: workerTupleComponents }] },
  { type: "function", name: "getWorker", stateMutability: "view", inputs: [{ name: "wallet", type: "address" }], outputs: [{ type: "tuple", components: workerTupleComponents }] },
  { type: "function", name: "isRegisteredActive", stateMutability: "view", inputs: [{ name: "wallet", type: "address" }], outputs: [{ type: "bool" }] },
  { type: "function", name: "isRegisteredActiveAgent", stateMutability: "view", inputs: [{ name: "wallet", type: "address" }], outputs: [{ type: "bool" }] },
    { type: "function", name: "registerWorker", stateMutability: "nonpayable", inputs: [
        { name: "name", type: "string" }, { name: "capabilities", type: "string[]" }, { name: "isAgent", type: "bool" }, { name: "endpoint", type: "string" }, { name: "pricePerJob", type: "uint256" },
      ], outputs: [] },
      { type: "function", name: "updateProfile", stateMutability: "nonpayable", inputs: [
        { name: "name", type: "string" }, { name: "capabilities", type: "string[]" }, { name: "endpoint", type: "string" }, { name: "pricePerJob", type: "uint256" },
      ], outputs: [] },
      { type: "function", name: "setActive", stateMutability: "nonpayable", inputs: [{ name: "active", type: "bool" }], outputs: [] },
    ] as const;
