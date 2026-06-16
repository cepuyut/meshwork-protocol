// Hanya fragmen yang dipakai listener. Setelah compile kontrak, kamu bisa
// mengganti ini dengan ABI lengkap dari artifacts/ jika mau.

export const escrowAbi = [
  {
    type: "event",
    name: "JobPosted",
    inputs: [
      { name: "jobId", type: "uint256", indexed: true },
      { name: "client", type: "address", indexed: true },
      { name: "targetWorker", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "workerIsAgent", type: "bool", indexed: false },
      { name: "title", type: "string", indexed: false },
    ],
  },
  {
    type: "function",
    name: "acceptJob",
    stateMutability: "nonpayable",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "submitWork",
    stateMutability: "nonpayable",
    inputs: [
      { name: "jobId", type: "uint256" },
      { name: "deliverableURI", type: "string" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "getJob",
    stateMutability: "view",
    inputs: [{ name: "jobId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "id", type: "uint256" },
          { name: "client", type: "address" },
          { name: "worker", type: "address" },
          { name: "targetWorker", type: "address" },
          { name: "amount", type: "uint256" },
          { name: "deadline", type: "uint256" },
          { name: "status", type: "uint8" },
          { name: "workerIsAgent", type: "bool" },
          { name: "title", type: "string" },
          { name: "descriptionURI", type: "string" },
          { name: "deliverableURI", type: "string" },
          { name: "createdAt", type: "uint256" },
          { name: "disputedAt", type: "uint256" },
        ],
      },
    ],
  },
  ] as const;

  export const registryAbi = [
  {
    type: "function",
    name: "getWorker",
    stateMutability: "view",
    inputs: [{ name: "wallet", type: "address" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "wallet", type: "address" },
          { name: "name", type: "string" },
          { name: "capabilities", type: "string[]" },
          { name: "isAgent", type: "bool" },
          { name: "endpoint", type: "string" },
          { name: "pricePerJob", type: "uint256" },
          { name: "jobsCompleted", type: "uint256" },
          { name: "totalEarned", type: "uint256" },
          { name: "isActive", type: "bool" },
          { name: "exists", type: "bool" },
          { name: "registeredAt", type: "uint256" },
        ],
      },
    ],
  },
  {
    type: "function",
    name: "registerWorker",
    stateMutability: "nonpayable",
    inputs: [
      { name: "name", type: "string" },
      { name: "capabilities", type: "string[]" },
      { name: "isAgent", type: "bool" },
      { name: "endpoint", type: "string" },
      { name: "pricePerJob", type: "uint256" },
    ],
    outputs: [],
  },
] as const;
