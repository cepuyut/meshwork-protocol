# MESHWORK PROTOCOL — BUILD BRIEF v3

> Permissionless Work Marketplace for Humans & AI Agents on Arc (Circle's USDC-native L1)
> Author: Ziyama (@fatitihlara)
> Goal: Membangun dApp yang solid sebagai produk nyata (bukan kejar deadline hackathon)
> Stack: Next.js + Tailwind + wagmi/viem + Solidity (Hardhat) + Vercel

> **Apa yang berubah dari v2 (penting):** Brief ini menambal tiga celah arsitektur yang membuat v2 tidak bisa dieksekusi dengan benar — (1) Registry↔Escrow kini terhubung sehingga reputasi benar-benar terisi, (2) model eksekusi agent didefinisikan penuh (terdesentralisasi + agent-kit), (3) dana client tidak bisa terkunci. Plus koreksi fakta Arc (faucet, explorer, alamat USDC) dan urutan build yang siap diberikan ke AI coder.

---

## 0. KEPUTUSAN ARSITEKTUR YANG SUDAH DIKUNCI

Sebelum coding, ini keputusan yang tidak boleh diperdebatkan lagi oleh AI coder. Mereka harus mengikuti ini persis.

1. **Eksekusi agent = terdesentralisasi penuh.** Agent provider menjalankan listener mereka sendiri (key + infra + biaya LLM milik mereka). Meshwork TIDAK PERNAH memegang key siapa pun dan TIDAK menjalankan agent siapa pun. Meshwork hanya menyediakan kontrak, UI, dan satu repo template "agent-kit".
2. **Directed hire untuk agent.** `postJob` menerima parameter opsional `targetWorker`. Jika di-set, hanya address itu yang boleh `acceptJob`. Agent di-hire dengan cara di-target; listener agent hanya memantau job yang ditugaskan ke address-nya.
3. **USDC = ERC-20 6 desimal lewat precompile.** Semua jumlah USDC di kontrak pakai 6 desimal. Alamat USDC = precompile sistem Arc (lihat §2).
4. **Penyimpanan konten = inline string untuk MVP.** Field `descriptionURI` dan `deliverableURI` menyimpan teks pendek langsung, atau IPFS CID untuk konten besar. Tidak ada dependensi storage eksternal wajib di MVP.
5. **Dispute MVP = owner-arbitrated.** Diakui sebagai sentralisasi sementara; ada di kontrak tapi UI-nya minimal. Jalur dekomisi ke arbitrasi/governance dicatat sebagai roadmap, bukan MVP.

---

## 0b. SCOPE LOCK (baca sebelum mulai — anti-melebar)

MVP ini punya SATU tujuan: satu alur kerja lengkap yang hidup di testnet, terverifikasi, dan bisa didemokan. Apa pun di luar itu DITUNDA. AI coder tidak boleh menambah fitur yang tidak ada di daftar "DIBANGUN" tanpa instruksi eksplisit.

**Golden path (definisi "selesai" MVP):**
> Client approve USDC → postJob (target sebuah agent) → listener agent auto-accept → agent panggil LLM → submitWork → client approveWork → USDC split 98.5/1.5 → reputasi agent naik di /workers. Semuanya dari UI, di Arc testnet, kontrak terverifikasi.

**DIBANGUN (in scope):**
- 2 kontrak (Registry + Escrow) sesuai §5.1, dengan tests.
- Halaman: `/marketplace`, `/job/[id]`, `/register`, `/dashboard`, `/workers`. (`/` landing & `/protocol` boleh statis sederhana.)
- agent-kit listener (§5.2) + 1 agent demo yang kamu jalankan sendiri.
- Baca data langsung dari kontrak + events (viem). Tidak perlu backend.

**Comfort layer (DITAMBAHKAN ke MVP — murah, hidup dari event; detail di `design/FEATURE_MAP.md`):**
- Activity & notifikasi in-app (toast tx + panel dari event kontrak) — visibility of system status.
- Empty & first-run states yang mengarahkan.
- Search judul ringan di marketplace (di samping filter).
- Riwayat & receipt job (link tx ke ArcScan) di dashboard.
- Halaman profil worker/agent + tombol "Hire directly".
- Escrow trust line + double-confirm saat release dana.

**TIDAK DIBANGUN di MVP (ditunda, jangan disentuh):**
- Indexer / subgraph (Ponder, envio) — pakai pembacaan kontrak langsung dulu.
- IPFS / storage eksternal — pakai inline string.
- Staking / slashing, reputation decay, agent heartbeat/online-status.
- Governance / arbitrasi terdesentralisasi — dispute tetap owner-only.
- Multi-vertical, pesan in-app (nanti via XMTP), rating/review, notifikasi email/Slack, search canggih/faceted, milestones bertahap — ditunda (detail & alasan di `design/FEATURE_MAP.md`).
- Persiapan mainnet & audit — dicatat sebagai langkah pasca-MVP, bukan sekarang.

Aturan emas: kalau sebuah ide tidak membuat golden path di atas jalan, ia masuk "ditunda", bukan dikerjakan sekarang.

---

## 0c. PELAJARAN DARI PLATFORM SEJENIS (riset kegagalan)

Disarikan dari kegagalan terdokumentasi platform kerja kripto (Braintrust, Ethlance, LaborX, CryptoTask, Bitwage, Talao), arbitrase on-chain (Kleros), dan riset akademik soal A2A payments (AP2, MPP, x402, SoK Blockchain Agent-to-Agent Payments). Tujuannya: jangan ulangi kesalahan ini.

### A. Yang sudah BENAR di desain Meshwork (pertahankan)
- **Tanpa token spekulatif.** BTRST/CTASK gagal karena freelancer langsung jual token → harga jatuh → insentif mati. Meshwork settle 100% dalam USDC. **Keputusan dikunci: Meshwork TIDAK akan punya native token.** Revenue = protocol fee USDC saja.
- **USDC = gas (keunggulan Arc).** Friksi onboarding terbesar platform lama: user wajib beli gas token volatil dulu. Di Arc, gas = USDC, jadi hambatan ini hilang. Tonjolkan ini di UX.
- **Pembayaran terikat ke pengiriman.** Kegagalan inti A2A: agent dibayar lalu kirim sampah. Model escrow kita (client approve setelah lihat deliverable, atau autoRelease) sudah mengikat bayar ↔ hasil. Pertahankan; jangan pernah bayar di muka.

### B. Perbaikan kecil yang DIPAKAI sekarang (hardening, bukan fitur baru)
- **Dispute tidak boleh membekukan dana selamanya.** Bug terkenal Kleros Escrow v2: status dispute nyangkut → dana beku permanen. Kontrak kita punya lubang sama: status `DISPUTED` bergantung penuh pada owner; kalau owner diam, dana beku. **Tambah guard:** simpan `disputedAt`, dan jika owner tidak resolve dalam mis. 14 hari, izinkan refund ke client sebagai fallback. Kecil, tapi menutup risiko fund-freeze.
- **Jangan oversell reputasi mentah.** `jobsCompleted`/`totalEarned` bisa di-wash-trade: bikin client palsu + worker palsu, kerjakan job ke diri sendiri, reputasi naik (biaya cuma fee 1.5%). Untuk MVP: tetap tampilkan, tapi beri label jujur ("unverified on-chain activity"), dan **jangan jadikan dasar ranking/trust otomatis**. Sybil-resistance sungguhan ditunda (lihat C).
- **UI jangan diblokir saat konfirmasi tx.** Kegagalan UX klasik: user nunggu bermenit-menit dengan UI beku. Pakai optimistic UI + state `pending`/`confirmed` dari event, jangan blok layar.
- **Agent-kit = least privilege.** Risiko prompt-injection bisa menguras wallet agent. Aturan untuk template agent-kit: key agent hanya dipakai untuk `acceptJob`/`submitWork`, simpan dana minimum di wallet itu, sanitasi input job sebelum masuk ke prompt LLM, dan jangan beri agent otoritas transfer dana bebas.

### C. Sengaja DITUNDA (tahu masalahnya, bukan sekarang)
- Sybil-resistant reputation (MeritRank/personalized trust graph, reputasi per-kategori dengan verifiable credentials).
- Dispute terdesentralisasi / juri ahli (hindari model token-weighted ala Kleros yang rawan 51% attack & juri tak kompeten).
- Embedded/social wallet untuk onboarding non-kripto, fiat on-ramp.
- Session-voucher/streaming payment (MPP) — hanya relevan untuk nanopayment frekuensi tinggi; model kita per-job, jadi tidak perlu.
- Kepatuhan regulasi lintas yurisdiksi (Bitwage dipaksa matikan USDC payout untuk warga AS 2023) — wajib dipikirkan SEBELUM sentuh dana asli/mainnet, bukan di testnet MVP.

### D. Cold-start (pelajaran terpenting, sudah jadi strategi)
Platform terdesentralisasi mati karena launching global & kosong. Yang berhasil (Airbnb, lalu Talao) mulai dari niche sempit + utilitas single-player. Untuk Meshwork: kunci satu wedge (agent-to-agent / per-API), jadi kedua sisi sendiri di awal (kamu jalankan beberapa agent demo + post job), dan kurasi node pertama secara manual. Jangan optimasi jumlah signup.

---

## 1. VISION

Meshwork adalah **pure protocol** — lapisan koordinasi ekonomi netral untuk manusia dan AI agent.

Kamu tidak mengoperasikan agent. Kamu tidak menanggung biaya LLM siapa pun. Kamu hanya menyediakan **infrastruktur trustless** di mana siapa pun bisa menawarkan jasa (Worker: manusia atau agent), membeli jasa (Client), atau mendaftarkan agent mereka sendiri (Agent Provider).

Setiap transaksi → protocol fee otomatis masuk ke treasury wallet kamu.

```
Kamu        = Smart Contract + UI + agent-kit template
Semua lain  = Peserta yang bawa modal, key, dan kapabilitas mereka sendiri
```

**Positioning**: Bukan Upwork, bukan platform AI. Meshwork adalah *economic coordination layer* — permissionless, trustless, onchain. Dibangun di Arc karena USDC adalah satu-satunya gas yang masuk akal untuk economic protocol.

---

## 2. FAKTA ARC TESTNET (TERVERIFIKASI — ganti yang lama)

| Parameter | Nilai benar |
|---|---|
| Network Name | Arc Testnet |
| Chain ID | `5042002` |
| RPC URL | `https://rpc.testnet.arc.network` |
| Block Explorer | `https://testnet.arcscan.app` (berbasis Blockscout) |
| Explorer API (untuk verify) | `https://testnet.arcscan.app/api` |
| Faucet | `https://faucet.circle.com` |
| Gas token | USDC (native, 18 desimal) |
| USDC ERC-20 interface | precompile `0x3600000000000000000000000000000000000000` (6 desimal) |

> **PENTING — jebakan 18 vs 6 desimal:** USDC di Arc punya dua antarmuka. Native gas = 18 desimal. Antarmuka ERC-20 (yang dipakai kontrak via `transferFrom`/`transfer`/`approve`) = **6 desimal**, di alamat precompile `0x3600…0000`. Semua logika kontrak dan UI pakai 6 desimal. Jangan pernah campur dengan saldo native 18 desimal.
>
> **Catatan validasi:** Arc masih chain muda. Sebelum deploy, konfirmasi ulang alamat precompile USDC, RPC, dan endpoint verify ArcScan ke `https://docs.arc.network` / dokumentasi Circle. Jangan deploy dengan alamat yang belum dicek langsung.
>
> **Update testnet (per 14 Jun 2026):** Arc Testnet di-upgrade ke **node v0.7.2**, aktif **18 Juni 2026 05:00 PT**. Ini upgrade software node (`circlefin/arc-node`) untuk operator node, bukan operasimu — kamu pakai public RPC, jadi tidak perlu menjalankan node sendiri. Implikasi praktis: (1) hindari deploy/demo penting persis di sekitar jendela aktivasi 18 Jun karena bisa ada desync sementara; (2) release notes resmi tidak merinci perubahan fitur, jadi setelah 18 Jun konfirmasi ulang chain ID, alamat precompile USDC, dan perilaku RPC ke docs resmi sebelum deploy. Chain ID 5042002 & precompile `0x3600…0000` diasumsikan tetap kecuali docs menyatakan lain.

---

## 3. MODEL BISNIS

### Alur Dana
```
Client approve USDC ke kontrak Escrow (approve di precompile 0x3600…0000)
        ↓
Client postJob → deposit USDC ke escrow
        ↓
Worker/Agent acceptJob → submitWork (deliverableURI)
        ↓
Client approveWork (atau autoRelease setelah deadline+grace)
        ↓
Escrow split otomatis:
  → 98.5% ke Worker/Agent
  → 1.5% ke Treasury
  → Escrow memanggil Registry.recordCompletion() → reputasi worker naik
```

### Kenapa Sustainable
- Tidak ada biaya LLM (provider bawa key sendiri).
- Hosting murah (Vercel).
- Revenue = protocol fee onchain, permanen.
- Contoh: 1.000 job × $10 = $10.000 volume → fee 1.5% = **$150** ke treasury, tanpa intervensi.

---

## 4. AKTOR

- **👤 Client** — deposit USDC, post job, approve hasil.
- **👷 Human Worker** — daftar di Registry, accept job, submit, dibayar.
- **🤖 Agent Provider** — daftarkan agent (wallet + endpoint + kapabilitas + harga). Jalankan listener sendiri (agent-kit). Bawa key & infra sendiri.
- **🏛️ Protocol (kamu)** — kontrak + UI + agent-kit. Tidak ikut eksekusi. Collect fee.

---

## 5. ARSITEKTUR TEKNIS

### 5.1 Smart Contract Layer

Dua kontrak, dan **kali ini saling terhubung**. Escrow memegang referensi ke Registry dan melaporkan job selesai supaya reputasi terisi. Hanya Escrow yang boleh menulis reputasi.

> **Status build (per 14 Jun 2026):** Kedua kontrak + MockUSDC + test suite + agent-kit sudah ditulis dan ada di repo ini: `contracts/` (Solidity, hardhat config, deploy, `test/meshwork.test.js`) dan `agent-kit/` (listener viem lengkap). Kontrak sudah **compile-verified** dengan solc 0.8.35 + OpenZeppelin v5 (0 error, 0 warning; Escrow 10.2KB bytecode). Tests ditulis dalam sintaks hardhat-toolbox/ethers v6 standar — jalankan lokal: `cd contracts && npm install && npx hardhat test`. AI coder harus **mengedit file yang ada**, bukan membuat ulang dari nol.

#### MeshworkRegistry.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract MeshworkRegistry is Ownable {

    struct Worker {
        address wallet;
        string name;
        string[] capabilities;   // ["WRITING","RESEARCH","TRANSLATION","CODING","DATA"]
        bool isAgent;            // true = AI agent, false = manusia
        string endpoint;         // kosong jika manusia; URL listener jika agent
        uint256 pricePerJob;     // USDC 6 desimal, 0 = negotiable
        uint256 jobsCompleted;
        uint256 totalEarned;     // USDC 6 desimal
        bool isActive;
        bool exists;
        uint256 registeredAt;
    }

    mapping(address => Worker) public workers;
    address[] public workerList;
    address public escrow;       // hanya kontrak ini yang boleh update reputasi

    event WorkerRegistered(address indexed wallet, bool isAgent, string[] capabilities);
    event WorkerUpdated(address indexed wallet);
    event WorkerDeactivated(address indexed wallet);
    event WorkerReactivated(address indexed wallet);
    event CompletionRecorded(address indexed wallet, uint256 amount);
    event EscrowSet(address indexed escrow);

    constructor() Ownable(msg.sender) {}

    modifier onlyEscrow() {
        require(msg.sender == escrow, "Only escrow");
        _;
    }

    function setEscrow(address _escrow) external onlyOwner {
        escrow = _escrow;
        emit EscrowSet(_escrow);
    }

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
        Worker storage w = workers[msg.sender];
        require(w.exists, "Not registered");
        if (w.isAgent) require(bytes(endpoint).length > 0, "Agent needs endpoint");
        w.name = name;
        w.capabilities = capabilities;
        w.endpoint = endpoint;
        w.pricePerJob = pricePerJob;
        emit WorkerUpdated(msg.sender);
    }

    function setActive(bool active) external {
        Worker storage w = workers[msg.sender];
        require(w.exists, "Not registered");
        w.isActive = active;
        if (active) emit WorkerReactivated(msg.sender);
        else emit WorkerDeactivated(msg.sender);
    }

    // Hanya dipanggil Escrow saat job selesai
    function recordCompletion(address worker, uint256 amount) external onlyEscrow {
        Worker storage w = workers[worker];
        if (!w.exists) return; // tidak revert agar pembayaran Escrow tidak gagal
        w.jobsCompleted += 1;
        w.totalEarned += amount;
        emit CompletionRecorded(worker, amount);
    }

    function isRegisteredActive(address wallet) external view returns (bool) {
        return workers[wallet].exists && workers[wallet].isActive;
    }

    function getWorker(address wallet) external view returns (Worker memory) {
        return workers[wallet];
    }

    function getWorkerCount() external view returns (uint256) {
        return workerList.length;
    }

    function getWorkers(uint256 offset, uint256 limit) external view returns (Worker[] memory) {
        uint256 end = offset + limit;
        if (end > workerList.length) end = workerList.length;
        Worker[] memory out = new Worker[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            out[i - offset] = workers[workerList[i]];
        }
        return out;
    }
}
```

#### MeshworkEscrow.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface IMeshworkRegistry {
    function isRegisteredActive(address wallet) external view returns (bool);
    function recordCompletion(address worker, uint256 amount) external;
    function getWorker(address wallet) external view returns (
        address, string memory, string[] memory, bool, string memory,
        uint256, uint256, uint256, bool, bool, uint256
    );
}

contract MeshworkEscrow is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdc;
    IMeshworkRegistry public immutable registry;
    address public treasury;
    uint256 public protocolFeeBps = 150;   // 1.5%
    uint256 public constant GRACE_PERIOD = 3 days;
    uint256 public constant DISPUTE_TIMEOUT = 14 days;

    enum JobStatus { OPEN, ACTIVE, SUBMITTED, COMPLETED, DISPUTED, CANCELLED }

    struct Job {
        uint256 id;
        address client;
        address worker;
        address targetWorker;    // address(0) = open; selain itu hanya target yg boleh accept
        uint256 amount;          // USDC 6 desimal
        uint256 deadline;
        JobStatus status;
        bool workerIsAgent;
        string title;
        string descriptionURI;   // teks inline atau IPFS CID
        string deliverableURI;
        uint256 createdAt;
        uint256 disputedAt;      // 0 jika belum pernah dispute
    }

    uint256 public jobCounter;
    mapping(uint256 => Job) public jobs;
    mapping(address => uint256[]) public clientJobs;
    mapping(address => uint256[]) public workerJobs;

    event JobPosted(uint256 indexed jobId, address indexed client, address indexed targetWorker, uint256 amount, bool workerIsAgent, string title);
    event JobAccepted(uint256 indexed jobId, address indexed worker);
    event WorkSubmitted(uint256 indexed jobId, string deliverableURI);
    event JobCompleted(uint256 indexed jobId, address indexed worker, uint256 workerAmount, uint256 feeAmount);
    event JobCancelled(uint256 indexed jobId);
    event JobReclaimed(uint256 indexed jobId);
    event DisputeRaised(uint256 indexed jobId, address raisedBy);
    event DisputeResolved(uint256 indexed jobId, bool favorWorker);

    constructor(address _usdc, address _registry, address _treasury) Ownable(msg.sender) {
        usdc = IERC20(_usdc);
        registry = IMeshworkRegistry(_registry);
        treasury = _treasury;
    }

    function postJob(
        uint256 amount,
        uint256 deadline,
        string memory title,
        string memory descriptionURI,
        bool workerIsAgent,
        address targetWorker        // address(0) untuk open job
    ) external nonReentrant returns (uint256) {
        require(amount > 0, "Amount = 0");
        require(deadline > block.timestamp, "Deadline in past");
        usdc.safeTransferFrom(msg.sender, address(this), amount);

        jobCounter++;
        jobs[jobCounter] = Job({
            id: jobCounter,
            client: msg.sender,
            worker: address(0),
            targetWorker: targetWorker,
            amount: amount,
            deadline: deadline,
            status: JobStatus.OPEN,
            workerIsAgent: workerIsAgent,
            title: title,
            descriptionURI: descriptionURI,
            deliverableURI: "",
            createdAt: block.timestamp,
            disputedAt: 0
        });
        clientJobs[msg.sender].push(jobCounter);
        emit JobPosted(jobCounter, msg.sender, targetWorker, amount, workerIsAgent, title);
        return jobCounter;
    }

    function acceptJob(uint256 jobId) external {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.OPEN, "Not open");
        require(job.client != msg.sender, "Client != worker");
        require(registry.isRegisteredActive(msg.sender), "Worker not registered/active");
        if (job.targetWorker != address(0)) {
            require(msg.sender == job.targetWorker, "Not the targeted worker");
        }
        job.worker = msg.sender;
        job.status = JobStatus.ACTIVE;
        workerJobs[msg.sender].push(jobId);
        emit JobAccepted(jobId, msg.sender);
    }

    function submitWork(uint256 jobId, string memory deliverableURI) external {
        Job storage job = jobs[jobId];
        require(job.worker == msg.sender, "Not the worker");
        require(job.status == JobStatus.ACTIVE, "Not active");
        job.deliverableURI = deliverableURI;
        job.status = JobStatus.SUBMITTED;
        emit WorkSubmitted(jobId, deliverableURI);
    }

    function approveWork(uint256 jobId) external nonReentrant {
        Job storage job = jobs[jobId];
        require(job.client == msg.sender, "Not the client");
        require(job.status == JobStatus.SUBMITTED, "Not submitted");
        _settle(job);
    }

    function autoRelease(uint256 jobId) external nonReentrant {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.SUBMITTED, "Not submitted");
        require(block.timestamp > job.deadline + GRACE_PERIOD, "Too early");
        _settle(job);
    }

    function _settle(Job storage job) internal {
        uint256 feeAmount = (job.amount * protocolFeeBps) / 10000;
        uint256 workerAmount = job.amount - feeAmount;
        job.status = JobStatus.COMPLETED;
        usdc.safeTransfer(job.worker, workerAmount);
        usdc.safeTransfer(treasury, feeAmount);
        registry.recordCompletion(job.worker, workerAmount);
        emit JobCompleted(job.id, job.worker, workerAmount, feeAmount);
    }

    // Client batalkan job yang belum diambil
    function cancelJob(uint256 jobId) external nonReentrant {
        Job storage job = jobs[jobId];
        require(job.client == msg.sender, "Not the client");
        require(job.status == JobStatus.OPEN, "Not open");
        job.status = JobStatus.CANCELLED;
        usdc.safeTransfer(msg.sender, job.amount);
        emit JobCancelled(jobId);
    }

    // Client tarik dana jika worker accept tapi tidak submit sampai deadline+grace
    function reclaimExpired(uint256 jobId) external nonReentrant {
        Job storage job = jobs[jobId];
        require(job.client == msg.sender, "Not the client");
        require(job.status == JobStatus.ACTIVE, "Not active");
        require(block.timestamp > job.deadline + GRACE_PERIOD, "Too early");
        job.status = JobStatus.CANCELLED;
        usdc.safeTransfer(msg.sender, job.amount);
        emit JobReclaimed(jobId);
    }

    function raiseDispute(uint256 jobId) external {
        Job storage job = jobs[jobId];
        require(job.client == msg.sender || job.worker == msg.sender, "Not a participant");
        require(job.status == JobStatus.ACTIVE || job.status == JobStatus.SUBMITTED, "Bad stage");
        job.status = JobStatus.DISPUTED;
        job.disputedAt = block.timestamp;
        emit DisputeRaised(jobId, msg.sender);
    }

    function resolveDispute(uint256 jobId, bool favorWorker) external onlyOwner nonReentrant {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.DISPUTED, "Not disputed");
        job.status = JobStatus.COMPLETED;
        if (favorWorker) {
            uint256 feeAmount = (job.amount * protocolFeeBps) / 10000;
            uint256 workerAmount = job.amount - feeAmount;
            usdc.safeTransfer(job.worker, workerAmount);
            usdc.safeTransfer(treasury, feeAmount);
            registry.recordCompletion(job.worker, workerAmount);
            emit JobCompleted(jobId, job.worker, workerAmount, feeAmount);
        } else {
            usdc.safeTransfer(job.client, job.amount);
        }
        emit DisputeResolved(jobId, favorWorker);
    }

    // Fallback anti-fund-freeze (pelajaran Kleros): jika owner tidak resolve dalam DISPUTE_TIMEOUT, client boleh refund
    function resolveDisputeTimeout(uint256 jobId) external nonReentrant {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.DISPUTED, "Not disputed");
        require(job.client == msg.sender, "Not the client");
        require(block.timestamp > job.disputedAt + DISPUTE_TIMEOUT, "Owner still has time");
        job.status = JobStatus.CANCELLED;
        usdc.safeTransfer(job.client, job.amount);
        emit DisputeResolved(jobId, false);
    }

    // Views
    function getJob(uint256 jobId) external view returns (Job memory) { return jobs[jobId]; }
    function getClientJobs(address c) external view returns (uint256[] memory) { return clientJobs[c]; }
    function getWorkerJobs(address w) external view returns (uint256[] memory) { return workerJobs[w]; }
    function getJobCount() external view returns (uint256) { return jobCounter; }

    // Admin
    function updateFee(uint256 newFeeBps) external onlyOwner {
        require(newFeeBps <= 500, "Max 5%");
        protocolFeeBps = newFeeBps;
    }
    function updateTreasury(address t) external onlyOwner { treasury = t; }
}
```

> **Catatan untuk AI coder:** Interface `IMeshworkRegistry.getWorker` di atas hanya ilustrasi; di praktik panggil Registry lewat ABI yang dihasilkan, bukan tuple manual. Yang wajib persis adalah `isRegisteredActive` dan `recordCompletion`. `recordCompletion` sengaja tidak revert kalau worker tidak ada, supaya pembayaran tidak pernah gagal karena masalah reputasi.

### 5.2 Agent-Kit (listener terdesentralisasi) — KOMPONEN BARU

Ini bagian yang hilang di v2. Meshwork mengirim repo template ini; Agent Provider menjalankannya sendiri. Tidak ada bagian dari ini yang berjalan di infra Meshwork.

Alur listener:
```
1. Watch event JobPosted di MeshworkEscrow yang targetWorker == myAgentWallet
2. acceptJob(jobId)                              (ditandatangani key agent sendiri)
3. Ambil descriptionURI → panggil LLM provider (key sendiri) → hasil
4. submitWork(jobId, deliverableURI)             (ditandatangani key agent sendiri)
5. (opsional) tunggu approveWork dari client
```

Kontrak template (Node/viem), disederhanakan:
```ts
// agent-kit/listener.ts  (Agent Provider menjalankan ini di infra mereka)
import { createPublicClient, createWalletClient, http, webSocket } from "viem";
import { privateKeyToAccount } from "viem/accounts";
// chain config: chainId 5042002, rpc https://rpc.testnet.arc.network
// ESCROW_ADDRESS, AGENT_PRIVATE_KEY, OPENROUTER_API_KEY -> semua punya provider

// 1) subscribe ke event JobPosted dgn filter targetWorker = akun agent
// 2) on event: tulis acceptJob(jobId)
// 3) fetch description, panggil LLM, hasilkan deliverable
// 4) tulis submitWork(jobId, deliverable)
```

Spesifikasi yang Meshwork dokumentasikan (bukan kode Meshwork): format job → deliverable, dan rekomendasi agent menyimpan `deliverableURI` sebagai teks inline (MVP) atau IPFS CID.

Untuk DEMO milikmu sendiri: jalankan SATU instance agent-kit dengan key/treasury terpisah supaya bisa menunjukkan alur penuh. Itu sah karena memang persis cara provider lain nanti memakainya.

### 5.3 Frontend (Next.js + Tailwind + wagmi/viem)

Halaman MVP (urut prioritas):
```
/                Landing + live stats (total jobs, USDC settled, workers, agents)
/marketplace     Job board + filter (type/capability/amount/status), tombol Post Job
/job/[id]        Detail job, timeline dari events, action sesuai role & status
/register        Form Human Worker & Agent Provider → tulis ke Registry
/dashboard       My Jobs (client) | My Work (worker), stats
/workers         Directory worker+agent dgn reputasi NYATA (jobsCompleted/totalEarned)
/protocol        Stats transparan + alamat kontrak (terverifikasi) + spec agent-kit
```
Hooks: `useRegistry.ts`, `useEscrow.ts`. Flow Post Job = `approve(0x3600…, amount)` lalu `postJob(...)`. Tampilkan dua langkah ini eksplisit di UI.

### 5.3b UI WORK BRIEF (detail per halaman — tetap dalam scope §0b, tanpa halaman baru)

Memperdalam §5.3 dari level halaman ke level komponen + flow. Halaman PERSIS seperti yang dikunci di §0b; jangan tambah halaman.

**Arah desain (hindari "generic AI dashboard").**
- Estetika protocol/fintech yang bersih dan utilitarian. Bukan dark-mode hacker, bukan gradient ungu, bukan 3 feature-card.
- Mono font untuk address & angka USDC; sans bersih untuk teks. Status pakai badge berwarna + label (jangan andalkan warna saja).
- Mobile-responsive (collapse 1 kolom < 700px). Format angka dari 6 desimal (mis. `9_850_000` → `9.85 USDC`).

**Pola global (dipakai semua halaman):**
- **Connect wallet** (wagmi). Deteksi chain: kalau bukan Arc 5042002, tampilkan banner "Switch to Arc Testnet" + tombol switch. Gate aksi write di balik koneksi wallet.
- **UX transaksi non-blocking** (pelajaran §0c): setiap write = tombol → sign di wallet → state `pending` inline + link ke ArcScan → `confirmed` → refetch optimistic. JANGAN blok seluruh layar saat nunggu konfirmasi.
- **Sumber data = kontrak + events** (tanpa indexer di MVP): marketplace iterasi `getJobCount()` + `getJob(id)`; stats agregat dari events (`JobPosted`, `JobCompleted`). Cukup untuk skala MVP.
- **Label reputasi jujur** (§0c): tampilkan `jobsCompleted`/`totalEarned` dengan keterangan "unverified on-chain activity", jangan jadi dasar ranking/trust otomatis.
- **Dua langkah Post Job eksplisit:** Step 1 `approve(0x3600…0000, amount)` → Step 2 `postJob(...)`. Tunjukkan progress 1/2 dan 2/2 di UI.

**Komponen reusable yang harus dibuat dulu:**
`TxButton` (handle sign→pending→confirmed + error), `StatusBadge` (OPEN/ACTIVE/SUBMITTED/COMPLETED/DISPUTED/CANCELLED), `AmountUSDC` (format 6 desimal), `AddressPill` (truncate + link ArcScan), `JobCard`, `WorkerCard`, `CapabilityTag`, `ConnectGate`.

**Per halaman (komponen + flow + acceptance):**

- **`/` Landing.** Hero + 4 stat tile (total jobs `getJobCount`, USDC settled = jumlah dari event `JobCompleted`, jumlah worker, jumlah agent dari Registry). CTA: Post a Job / Register / Deploy an Agent. ✅ *Stat mencerminkan data on-chain.*
- **`/marketplace`.** Grid `JobCard` + filter (type human/agent, capability, range amount, status). Tombol Post Job → modal form (dua langkah approve→postJob). ✅ *Bisa post job lengkap dengan langkah approve, job baru muncul di board.*
- **`/job/[id]`.** Detail + timeline dari events. Tombol aksi muncul sesuai role & status: Accept (worker, OPEN), Submit (worker, ACTIVE), Approve/Dispute (client, SUBMITTED), Reclaim (client, ACTIVE+expired), AutoRelease (siapa pun, SUBMITTED+expired), ResolveDisputeTimeout (client, DISPUTED+expired). ✅ *Tombol yang tampil selalu cocok dengan role+status; aksi salah tidak pernah muncul.*
- **`/register`.** Form Human Worker (name, capabilities) & Agent Provider (name, endpoint wajib, price, capabilities) → `registerWorker`; kalau sudah ada → `updateProfile`. ✅ *Setelah daftar, worker aktif & muncul di `/workers`.*
- **`/dashboard`.** Tab My Jobs (client, dari `getClientJobs`) | My Work (worker, dari `getWorkerJobs`). Stats total spent/earned. Quick action per job. ✅ *Menampilkan job milik wallet yang terhubung.*
- **`/workers`.** Directory dari `getWorkers(offset, limit)` dengan paginasi. Filter capability/type. `WorkerCard` + reputasi berlabel jujur. ✅ *Setelah satu job selesai, `jobsCompleted`/`totalEarned` worker bertambah.*
- **`/protocol`.** Boleh statis. Alamat kontrak (link ArcScan terverifikasi), fee 1.5%, treasury, link spec agent-kit. ✅ *Alamat menaut ke kontrak terverifikasi.*

**Acceptance keseluruhan UI:** golden path §0b bisa didemokan penuh dari UI tanpa sentuh kode.

### 5.4 Hardhat config (dengan verify ArcScan)
```javascript
// hardhat.config.js
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: { version: "0.8.20", settings: { optimizer: { enabled: true, runs: 200 } } },
  networks: {
    arcTestnet: {
      url: process.env.ARC_RPC_URL,            // https://rpc.testnet.arc.network
      chainId: 5042002,
      accounts: [process.env.DEPLOYER_PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: { arcTestnet: "placeholder" },     // Blockscout tidak butuh key asli
    customChains: [{
      network: "arcTestnet",
      chainId: 5042002,
      urls: { apiURL: "https://testnet.arcscan.app/api", browserURL: "https://testnet.arcscan.app" },
    }],
  },
};
```

### 5.5 Deploy script (urutan benar: Registry → Escrow → setEscrow)
```javascript
// scripts/deploy.js
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  const USDC = process.env.USDC_ARC_TESTNET;        // 0x3600000000000000000000000000000000000000
  const TREASURY = process.env.TREASURY_ADDRESS || deployer.address;

  const Registry = await ethers.getContractFactory("MeshworkRegistry");
  const registry = await Registry.deploy();
  await registry.waitForDeployment();

  const Escrow = await ethers.getContractFactory("MeshworkEscrow");
  const escrow = await Escrow.deploy(USDC, await registry.getAddress(), TREASURY);
  await escrow.waitForDeployment();

  // WAJIB: hubungkan supaya recordCompletion bisa dipanggil
  await (await registry.setEscrow(await escrow.getAddress())).wait();

  console.log("Registry:", await registry.getAddress());
  console.log("Escrow:  ", await escrow.getAddress());
}
main().catch((e) => { console.error(e); process.exit(1); });
```

---

## 6. ROADMAP BUILD (berbasis fase, bukan deadline)

Tanpa tekanan hackathon — fokus benar dulu, cepat kemudian. Tiap fase punya **acceptance criteria** yang harus lulus sebelum lanjut.

**Fase 1 — Contracts + tests (fondasi).**
- Tulis Registry & Escrow sesuai §5.1. Tulis Hardhat tests untuk: happy path, fee split 98.5/1.5, recordCompletion menaikkan reputasi, acceptJob menolak non-registered, reclaimExpired refund client, autoRelease, dispute.
- ✅ Lulus jika: semua test hijau di jaringan lokal, coverage ≥ alur utama.

**Fase 2 — Deploy + verify Arc.**
- Faucet USDC dari faucet.circle.com, deploy via script, `setEscrow`, verify kedua kontrak di ArcScan.
- ✅ Lulus jika: kedua kontrak terverifikasi & saling terhubung di testnet.arcscan.app.

**Fase 3 — Frontend core flow.**
- wagmi + Arc chain config, connect wallet, `/marketplace`, Post Job (approve→postJob), accept/submit/approve. Baca state dari events.
- ✅ Lulus jika: satu manusia bisa post→accept→submit→approve end-to-end dari UI, USDC split terlihat di explorer.

**Fase 4 — Registry & reputasi.**
- `/register`, `/workers` dengan reputasi NYATA dari Registry, `/dashboard`.
- ✅ Lulus jika: setelah job selesai, jobsCompleted & totalEarned worker bertambah di `/workers`.

**Fase 5 — Agent-kit + alur agent penuh.**
- Repo agent-kit listener, jalankan satu agent demo. Directed-hire dari UI.
- ✅ Lulus jika: client target agent → listener auto-accept → auto-submit → approve → split, tanpa intervensi manual.

**Fase 6 — Hardening (sebelum dianggap "produk").**
- `/protocol` page, dokumentasi spec, edge cases UI (dispute, reclaim), dan rencana **audit keamanan** sebelum mainnet. Pertimbangkan IPFS untuk konten besar.

---

## 7. TECH STACK

| Layer | Tech |
|---|---|
| Blockchain | Arc Testnet (Chain ID 5042002) |
| Smart Contract | Solidity ^0.8.20, OpenZeppelin (Ownable, SafeERC20, ReentrancyGuard), Hardhat |
| Frontend | Next.js 14 + Tailwind |
| Wallet | wagmi v2 + viem |
| Agent-kit | Node + viem + LLM provider (key milik provider) |
| Hosting | Vercel |
| Explorer | ArcScan (Blockscout) |

---

## 8. ENVIRONMENT VARIABLES
```env
# contracts/.env (JANGAN commit)
ARC_RPC_URL=https://rpc.testnet.arc.network
USDC_ARC_TESTNET=0x3600000000000000000000000000000000000000
DEPLOYER_PRIVATE_KEY=
TREASURY_ADDRESS=

# app/.env.local
NEXT_PUBLIC_CHAIN_ID=5042002
NEXT_PUBLIC_RPC_URL=https://rpc.testnet.arc.network
NEXT_PUBLIC_REGISTRY_ADDRESS=
NEXT_PUBLIC_ESCROW_ADDRESS=
NEXT_PUBLIC_USDC_ADDRESS=0x3600000000000000000000000000000000000000

# agent-kit/.env (dipegang Agent Provider, BUKAN Meshwork)
AGENT_PRIVATE_KEY=
OPENROUTER_API_KEY=
ESCROW_ADDRESS=
```

---

## 9. URUTAN PERINTAH UNTUK CODEX / CLAUDE CODE

Setup:
```bash
mkdir meshwork && cd meshwork && git init
mkdir contracts && cd contracts && npm init -y
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox dotenv
npm install @openzeppelin/contracts
npx hardhat init   # JavaScript project
cd ..
npx create-next-app@latest app --typescript --tailwind --app --src-dir --import-alias "@/*"
cd app && npm install wagmi viem @tanstack/react-query && cd ..
mkdir agent-kit && cd agent-kit && npm init -y && npm install viem dotenv openai && cd ..
```

Urutan instruksi (ikuti acceptance criteria §6 di tiap langkah):
1. `contracts/contracts/MeshworkRegistry.sol` (§5.1)
2. `contracts/contracts/MeshworkEscrow.sol` (§5.1)
3. `contracts/test/*.test.js` — tulis tests SEBELUM deploy (Fase 1)
4. `contracts/hardhat.config.js` (§5.4)
5. `contracts/scripts/deploy.js` (§5.5)
6. `app/src/lib/contracts.ts` — ABI + address
7. `app/src/lib/wagmi.ts` — Arc chain config
8. `app/src/hooks/useRegistry.ts`, `useEscrow.ts`
9. `app/src/app/marketplace/page.tsx`, `job/[id]/page.tsx`
10. `app/src/app/register/page.tsx`, `workers/page.tsx`, `dashboard/page.tsx`
11. `agent-kit/listener.ts` (§5.2) + README cara pakai
12. `app/src/app/protocol/page.tsx` + spec agent-kit

---

## 10. NARRATIVE

> "Masalah sebenarnya bukan freelancer butuh Upwork yang lebih baik. Masalahnya: koordinasi ekonomi — antar manusia, antar AI agent, antar manusia dan agent — belum punya infrastruktur netral. Meshwork adalah infrastruktur itu. Dibangun di Arc, ditenagai USDC, dimiliki tak seorang pun. Aku cuma yang membangun jalannya. Semua orang lain yang berkendara di atasnya."

**Arc alignment:** USDC-native settlement · escrow + auto-split onchain · agent economy permissionless · transparan & auditable · agent coordinate/contract/settle value.

---

## 11. RESOURCES
- Arc docs: https://docs.arc.network
- Faucet: https://faucet.circle.com
- Explorer: https://testnet.arcscan.app
- RPC: https://rpc.testnet.arc.network
- USDC precompile: `0x3600000000000000000000000000000000000000`
- OpenZeppelin: https://docs.openzeppelin.com/contracts
- wagmi: https://wagmi.sh · viem: https://viem.sh

---

*v3 — Pure Protocol Architecture, gaps patched. Disusun ulang dari v2 (Sonnet/Claude) oleh Sauna, Jun 14 2026.*
