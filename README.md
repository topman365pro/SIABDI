# Sistem Absensi Sekolah

## Local Deployment

Untuk deployment development di Google Cloud Compute Engine, lihat [docs/google-cloud-dev-deployment.md](docs/google-cloud-dev-deployment.md).

### Full Docker Stack

1. Salin environment contoh.

```bash
cp .env.example .env
```

2. Jalankan seluruh stack.

```bash
pnpm docker:dev
```

Compose akan menjalankan `postgres`, `redis`, dependency install, Prisma generate/migrate/seed, `api`, dan `web`.

Frontend tersedia di `http://localhost:3001`, API di `http://localhost:3000/api/v1`, dan Swagger di `http://localhost:3000/api/docs`.

Untuk melihat log aplikasi:

```bash
pnpm docker:logs
```

Untuk mematikan stack tanpa menghapus database:

```bash
pnpm docker:down
```

Untuk reset total database dan volume dependency container:

```bash
pnpm docker:reset
```

### Hybrid Local

Jika ingin menjalankan app dari host dan hanya memakai Docker untuk database:

```bash
cp .env.example .env
pnpm install
docker compose up -d postgres redis
pnpm prisma:generate
pnpm prisma:migrate
pnpm prisma:seed
pnpm dev
```

## Demo Accounts

Semua akun seed memakai password `Password123!`.

| Role | Username |
| --- | --- |
| Admin/TU | `admin.tu` |
| BK | `guru.bk` |
| Guru Mapel | `guru.mapel` |
| Kesiswaan | `petugas.kesiswaan` |
| Orang Tua | `orangtua.demo` |

## Useful Commands

```bash
pnpm build
pnpm test
pnpm test:integration
```
