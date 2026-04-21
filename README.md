# Sistem Absensi Digital Monorepo Archive

Repo ini sudah dipisah menjadi dua repository standalone dengan fresh Git history.

Repo aktif:

- Backend API: [topman365pro/SIABDI-api](https://github.com/topman365pro/SIABDI-api)
- Frontend Web: [topman365pro/SIABDI-web](https://github.com/topman365pro/SIABDI-web)

Kode lama di repo ini tetap dipertahankan sebagai arsip dan referensi migrasi. Development dan deployment baru sebaiknya dilakukan dari repo backend/frontend terpisah.

## Quick Start Repo Baru

Backend:

```bash
git clone git@github.com:topman365pro/SIABDI-api.git
cd SIABDI-api
cp .env.example .env
pnpm install
pnpm dev
```

Frontend:

```bash
git clone git@github.com:topman365pro/SIABDI-web.git
cd SIABDI-web
cp .env.example .env
pnpm install
pnpm dev
```
