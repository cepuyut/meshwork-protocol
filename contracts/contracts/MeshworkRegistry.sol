// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MeshworkRegistry is Ownable {
    struct Worker {
        address wallet;
        string name;
        string[] capabilities;
        bool isAgent;
        string endpoint;
        uint256 pricePerJob;
        uint256 jobsCompleted;
        uint256 totalEarned;
        bool isActive;
        bool exists;
        uint256 registeredAt;
    }

    mapping(address => Worker) public workers;
    address[] public workerList;
    address public escrow;

    event WorkerRegistered(address indexed wallet, bool isAgent, string[] capabilities);
    event WorkerUpdated(address indexed wallet);
    event WorkerDeactivated(address indexed wallet);
    event WorkerReactivated(address indexed wallet);
    event EscrowSet(address indexed escrow);
    event CompletionRecorded(address indexed wallet, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function registerWorker(
        string memory name,
        string[] memory capabilities,
        bool isAgent,
        string memory endpoint,
        uint256 pricePerJob
    ) external {
        require(!workers[msg.sender].exists, "Already registered; use updateProfile");
        if (isAgent) require(bytes(endpoint).length > 0, "Agent needs endpoint");

        workers[msg.sender] = Worker({
            wallet: msg.sender,
            name: name,
            capabilities: capabilities,
            isAgent: isAgent,
            endpoint: endpoint,
            pricePerJob: pricePerJob,
            jobsCompleted: 0,
            totalEarned: 0,
            isActive: true,
            exists: true,
            registeredAt: block.timestamp
        });
        workerList.push(msg.sender);
        emit WorkerRegistered(msg.sender, isAgent, capabilities);
    }

    function updateProfile(
        string memory name,
        string[] memory capabilities,
        string memory endpoint,
        uint256 pricePerJob
    ) external {
        require(workers[msg.sender].exists, "Not registered");
        // FIX C-3: was bytes(capabilities).length which is always non-zero
        require(capabilities.length > 0, "Capabilities required");
        workers[msg.sender].name = name;
        workers[msg.sender].capabilities = capabilities;
        workers[msg.sender].endpoint = endpoint;
        workers[msg.sender].pricePerJob = pricePerJob;
        emit WorkerUpdated(msg.sender);
    }

    function setActive(bool active) external {
        require(workers[msg.sender].exists, "Not registered");
        workers[msg.sender].isActive = active;
        if (!active) emit WorkerDeactivated(msg.sender);
        else emit WorkerReactivated(msg.sender);
    }

    function setEscrow(address _escrow) external onlyOwner {
        escrow = _escrow;
        emit EscrowSet(_escrow);
    }

    function recordCompletion(address worker, uint256 amount) external {
        require(msg.sender == escrow, "Only escrow");
        if (!workers[worker].isActive) return;
        workers[worker].jobsCompleted += 1;
        workers[worker].totalEarned += amount;
        emit CompletionRecorded(worker, amount);
    }

    function getWorker(address wallet) external view returns (Worker memory) {
        return workers[wallet];
    }

    // FIX H-4: guard against offset >= length (underflow)
    function getWorkers(uint256 offset, uint256 limit) external view returns (Worker[] memory) {
        if (offset >= workerList.length) return new Worker[](0);
        uint256 end = offset + limit;
        if (end > workerList.length) end = workerList.length;
        Worker[] memory result = new Worker[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = workers[workerList[i]];
        }
        return result;
    }

    function getWorkerCount() external view returns (uint256) {
        return workerList.length;
    }

    function isRegisteredActive(address wallet) external view returns (bool) {
        return workers[wallet].exists && workers[wallet].isActive;
    }

    // NEW: for agent-only job enforcement (H-2)
    function isRegisteredActiveAgent(address wallet) external view returns (bool) {
        return workers[wallet].exists && workers[wallet].isActive && workers[wallet].isAgent;
    }
}
