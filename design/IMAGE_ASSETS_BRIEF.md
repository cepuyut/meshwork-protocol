# Meshwork — Image Asset Brief (3D USDC coins for the hero)

Aset gambar yang dibutuhkan hero (`Hero.tsx`). Generate sebagai **PNG transparan**, lalu taruh di `public/coins/`. Komponen sudah punya fallback, jadi hero tetap jalan sebelum gambar ada.

## Yang perlu di-generate (4 file wajib)

| File | Sudut kamera | Ukuran |
|---|---|---|
| `usdc-front.png` | menghadap depan, miring ~12° | 1024×1024 |
| `usdc-tilt-left.png` | diputar ~35° ke kiri, ketebalan koin terlihat | 1024×1024 |
| `usdc-tilt-right.png` | diputar ~35° ke kanan | 1024×1024 |
| `usdc-edge.png` | hampir menyamping (edge-on), tipis | 1024×1024 |

Opsional: `usdc-stack.png` (2–3 koin bertumpuk) untuk variasi.

## Aturan agar 1 set konsisten
Generate keempatnya dalam **gaya, material, dan pencahayaan yang sama** (kalau tidak, koin terlihat dari "dunia" berbeda). Trik: generate `usdc-front.png` dulu, lalu untuk sisanya tambahkan "same coin, same material and lighting, only rotate the camera as described."

## Spesifikasi material (pakai di semua prompt)
- Koin 3D glossy, enamel biru **#2F6BFF** dengan rim metalik tipis (chrome/perak).
- Emblem putih di muka koin: lingkaran USDC dengan simbol dolar **$** di tengah (gaya logo USDC, jangan tulis teks merek lain).
- Permukaan: clean, sedikit reflektif, soft studio light dari kiri-atas, bayangan halus di permukaan koin sendiri.
- **Background transparan** (alpha), objek di tengah, tidak ada lantai/bayangan jatuh, tidak ada teks tambahan.
- Render bersih, bukan foto realistis berisik; cocok untuk floating UI element.

## Prompt siap-paste (ChatGPT image generation)

**1) usdc-front.png**
```
A single glossy 3D coin, front view tilted ~12 degrees, floating. Deep enamel blue body (#2F6BFF) with a thin metallic silver rim. On the face: a clean white circular USDC emblem with a dollar sign in the center. Soft studio lighting from the top-left, gentle reflections, smooth premium finish. Transparent background (PNG, alpha), object centered, no drop shadow on a floor, no extra text, no logo other than the dollar emblem. Square 1:1, high resolution.
```

**2) usdc-tilt-left.png**
```
The same glossy 3D blue USDC coin, identical material and lighting as before, rotated about 35 degrees to the left so the coin's thickness/edge is visible. Deep enamel blue (#2F6BFF), thin metallic rim, white dollar emblem on the face. Transparent background, centered, no floor shadow, no extra text. Square 1:1, high resolution.
```

**3) usdc-tilt-right.png**
```
The same glossy 3D blue USDC coin, identical material and lighting, rotated about 35 degrees to the right, edge visible on the other side. Deep enamel blue (#2F6BFF), metallic rim, white dollar emblem. Transparent background, centered, no floor shadow, no extra text. Square 1:1, high resolution.
```

**4) usdc-edge.png**
```
The same glossy 3D blue USDC coin viewed nearly edge-on (almost sideways), showing it as a thin disc with a metallic rim and a sliver of the blue face. Identical material and lighting. Transparent background, centered, no floor shadow, no extra text. Square 1:1, high resolution.
```

## Setelah generate
1. Rename hasilnya sesuai tabel di atas.
2. Pastikan benar-benar transparan (kalau ChatGPT kasih background putih, minta ulang "transparent background, PNG with alpha").
3. Taruh di `public/coins/`.
4. (Opsional) kompres dengan TinyPNG agar ringan.
