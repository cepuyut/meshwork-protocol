# UX Comfort Principles — Upwork as reference

Acuan kenyamanan user untuk Meshwork, disarikan dari teardown UX Upwork (marketplace dua sisi yang matang). Tujuan: terasa tenang dan terkendali, bukan ramai. Codex pakai ini saat membangun halaman.

## Yang DIADOPSI dari Upwork

1. **Job posting = wizard bertahap, bukan satu form raksasa.** Satu pertanyaan inti per langkah (Title → Scope → Budget/USDC → target worker/agent). Kurangi beban kognitif (Hick's Law). Saran budget/skill otomatis kalau bisa.
2. **Status selalu terlihat.** Setiap job punya kapsul status berwarna (Open / Active / Submitted / Settled / Disputed). Pakai rail-timeline kita sebagai visual status utama.
3. **Tombol berubah sesuai status & peran.** CTA kontekstual: "Submit Work" untuk worker, "Approve & Release" untuk client, "Raise Dispute" hanya saat relevan. Aksi yang tidak valid tidak pernah muncul.
4. **Escrow yang menenangkan.** Indikator kepercayaan dekat tombol uang ("Funds held in escrow"), dan **konfirmasi dua langkah** sebelum melepas dana (cegah klik tak sengaja).
5. **Progressive disclosure.** Detail rumit/sensitif (fee 1.5%, mekanik dispute, auto-release) disembunyikan dari muka depan → ada di halaman Docs/How-it-works. Landing tetap tenang. (Ini persis permintaan: rangkum lengkap di docs.)
6. **Visibility of system status.** Setiap transaksi onchain → state pending → confirmed + notifikasi. Jangan biarkan user menebak.
7. **Sinyal kepercayaan ringkas & scannable.** Reputasi worker (jobs done, earned) sebagai badge kecil, bukan paragraf. Tapi beri label jujur (lihat catatan reputasi di docs).
8. **Empty & error states sebagai arahan, bukan mood.** "Belum ada job, post satu untuk mulai." Error menjelaskan apa yang salah + cara perbaiki, dengan suara antarmuka.

## Yang DIHINDARI (titik gagal Upwork)

- **Dashboard overload.** Upwork menjejalkan job, stats, forum, iklan premium sekaligus (langgar Miller's Law). Meshwork: dashboard tenang, fokus "My Jobs / My Work", whitespace lega.
- **Navigasi dalam berlapis.** Invoice & dispute Upwork tersembunyi 4–5 klik dalam. Meshwork: detail job & aksi maksimal 2 klik.
- **Friksi anti-spam ala Connects.** Tidak perlu token bidding berbayar; permissionless. Kalau butuh filter spam, pakai cara lain (registrasi + reputasi), bukan biaya melamar.
- **Time-tracker invasif (screenshot/keystroke).** Tidak relevan dan tidak nyaman; model kita berbasis deliverable + approval, bukan surveilans.

## Nada visual yang mendukung kenyamanan
- Latar hangat netral, aksen biru hemat, whitespace lega, tipografi ringan (sudah diterapkan di hero revisi).
- Motion pelan dan sedikit. Hormati `prefers-reduced-motion`.
- Bahasa antarmuka: kata kerja aktif, sentence case, tanpa jargon sistem ("Approve & release funds", bukan "Execute settlement tx").

*Sumber: teardown UX Upwork (dashboard, job posting wizard, proposals, contracts, milestones, escrow, messaging, trust signals) + analisis friksi. Disusun 14 Jun 2026.*
