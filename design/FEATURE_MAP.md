# Meshwork — Feature Map (kelengkapan produk)

Daftar lengkap fitur, dipisah: **Core MVP** (sudah dispek), **Comfort layer** (DITAMBAHKAN ke MVP supaya terasa lengkap & nyaman), dan **Ditunda** (tahu masalahnya, bukan sekarang). Tetap menghormati Scope Lock §0b: yang ditambah hanya yang murah dan tidak butuh backend baru (cukup baca event kontrak).

---

## A. Core MVP — sudah ada di brief
- Kontrak: Registry + Escrow (post → accept → submit → approve → settle; auto-release; reclaim; dispute + timeout).
- Halaman: Landing, Marketplace, Job detail, Register, Dashboard, Workers, Protocol/Docs.
- Agent-kit listener (directed hire).
- Connect wallet + deteksi/switch ke Arc.

---

## B. Comfort layer — TAMBAHKAN ke MVP

Semua ini cukup dari pembacaan event kontrak + state UI. Tanpa server tambahan.

1. **Activity & notifikasi (in-app).** Toast saat tx (`pending → confirmed`) + panel aktivitas yang membaca event (`JobAccepted`, `WorkSubmitted`, `JobCompleted`, `DisputeRaised`). Prinsip Upwork: *visibility of system status*. Bikin user tidak menebak.
2. **Empty & first-run states.** Setiap list punya empty state yang mengarahkan ("Belum ada job, post satu untuk mulai"). Alur pertama: connect wallet → register → post/accept. Mengurangi kebingungan.
3. **Search di marketplace.** Kotak cari judul job di samping filter yang sudah ada. Cepat, ringan.
4. **Riwayat & receipt.** Dashboard menampilkan job lampau dengan link tx ke ArcScan. Transparansi + rasa aman.
5. **Halaman profil worker/agent.** Klik worker → profil: kapabilitas, reputasi (label jujur), job lampau, tombol "Hire directly" (post job dengan `targetWorker` terisi). Melengkapi `/workers`.
6. **Pola escrow & konfirmasi.** Baris "X USDC held in escrow" dekat tombol uang + **double-confirm** saat release. (Sudah di screens, dijadikan wajib.)
7. **Status konsisten di mana-mana.** `StatusBadge` + rail-timeline dipakai seragam di semua halaman.
8. **Bahasa antarmuka manusiawi.** Kata kerja aktif, sentence case, tanpa jargon ("Approve & release funds", bukan "execute settlement tx"). Error menjelaskan + memberi jalan keluar.

---

## C. Ditunda — tahu masalahnya, bukan sekarang

| Fitur | Kenapa ditunda |
|---|---|
| **Pesan in-app (client ↔ worker/agent)** | Butuh infra off-chain. Nanti via **XMTP** (wallet-to-wallet, tanpa server pusat) supaya tetap trustless. Fitur kenyamanan besar, tapi di luar golden path. |
| **Rating / review setelah selesai** | Rawan sybil (lihat docs). Rilis bareng reputasi anti-sybil. |
| **Status agent online/heartbeat** | Butuh sinyal liveness; tambah nanti agar kegagalan agent terlihat. |
| **Saved jobs / shortlist** | Nice-to-have, bukan inti. |
| **Notifikasi email/Slack** | Perlu kanal luar; in-app dulu. |
| **Verifikasi identitas/KYC badge** | Pertimbangan regulasi; jangan sebelum sentuh dana asli. |
| **Milestones (fixed-price bertahap)** | MVP kita satu-deposit per job. Multi-milestone menyusul kalau perlu. |

---

## D. Sengaja DITOLAK (anti-pattern Upwork)
- **Time tracker (screenshot/keystroke).** Invasif & tidak nyaman; model kita berbasis deliverable + approval.
- **Connects (biaya melamar berbayar).** Permissionless; filter spam lewat registrasi + reputasi, bukan biaya.
- **Fee tinggi dua sisi (10–20%).** Kita satu fee 1.5%, transparan.

---

*Aturan tetap: kalau sebuah fitur tidak membuat golden path jalan, ia masuk C, bukan dikerjakan sekarang. Comfort layer (B) ditambahkan karena murah dan langsung menaikkan kenyamanan. Disusun 14 Jun 2026.*
