# Google Cloud Development Deployment

Panduan ini untuk menjalankan development environment SIABDI di Google Cloud Compute Engine setelah Anda masuk ke terminal SSH VM.

Asumsi:
- VM menggunakan Ubuntu 22.04/24.04 LTS.
- Repository diakses lewat SSH GitHub: `git@github.com:topman365pro/SIABDI.git`.
- Deployment untuk testing/development, bukan production.
- Akses yang disarankan adalah SSH tunnel. Jangan buka port database ke publik.

## 1. Siapkan VM Dari Google Cloud Console

Rekomendasi awal:
- Region: `asia-southeast2` Jakarta.
- Machine type: minimal `e2-standard-2` untuk menjalankan web, API, Postgres, Redis, dan build dependency.
- Boot disk: Ubuntu LTS, minimal 30 GB.
- Firewall: cukup SSH. Jangan buka `3000`, `3001`, atau `5432` untuk mode tunnel.

## 2. Masuk SSH Ke VM

Dari laptop:

```bash
gcloud compute ssh NAMA_VM --zone=asia-southeast2-a
```

Jika belum pakai `gcloud`, Anda juga bisa masuk lewat tombol SSH di Google Cloud Console.

## 3. Install Docker, Git, Dan Git LFS

Jalankan ini di terminal SSH VM:

```bash
sudo apt-get update
sudo apt-get install -y ca-certificates curl git git-lfs gnupg lsb-release openssl

sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

. /etc/os-release
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin

sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"
git lfs install
```

Aktifkan group Docker tanpa logout:

```bash
newgrp docker
```

Verifikasi:

```bash
docker --version
git lfs version
```

Alternatif setelah repo sudah ada, Anda bisa menjalankan skrip:

```bash
./scripts/gcloud-vm-bootstrap.sh
```

## 4. Siapkan Akses GitHub SSH Dari VM

Cek apakah VM sudah punya SSH key:

```bash
ls -la ~/.ssh
```

Jika belum ada key:

```bash
ssh-keygen -t ed25519 -C "gcp-siabdi-dev" -f ~/.ssh/id_ed25519
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub
```

Tambahkan output public key ke GitHub:
- GitHub `Settings`
- `SSH and GPG keys`
- `New SSH key`

Test:

```bash
ssh -T git@github.com
```

## 5. Clone Repository

```bash
mkdir -p ~/apps
cd ~/apps
git clone git@github.com:topman365pro/SIABDI.git
cd SIABDI
```

## 6. Buat Environment File

Untuk akses via SSH tunnel:

```bash
cp .env.gcloud.example .env
```

Ganti secret JWT:

```bash
ACCESS_SECRET="$(openssl rand -base64 48)"
REFRESH_SECRET="$(openssl rand -base64 48)"

sed -i "s|replace-with-long-random-access-secret|$ACCESS_SECRET|" .env
sed -i "s|replace-with-long-random-refresh-secret|$REFRESH_SECRET|" .env
```

Pastikan nilai ini tetap untuk mode SSH tunnel:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1
CORS_ORIGIN=http://localhost:3001
```

Jika nanti Anda memakai public IP/domain langsung, ubah ke alamat yang dilihat browser, misalnya:

```env
NEXT_PUBLIC_API_BASE_URL=http://YOUR_VM_EXTERNAL_IP:3000/api/v1
CORS_ORIGIN=http://YOUR_VM_EXTERNAL_IP:3001
```

## 7. Jalankan Stack

```bash
bash scripts/docker-run-dev.sh
```

Lihat status container:

```bash
docker ps --filter name=attendance
```

Lihat log:

```bash
bash scripts/docker-run-logs.sh
```

Pada start pertama, Skrip docker-run akan menjalankan:
- dependency install
- Prisma generate
- Prisma migrate
- Prisma seed
- API
- Web

## 8. Akses Dari Laptop Menggunakan SSH Tunnel

Buka terminal baru di laptop, bukan di VM:

```bash
gcloud compute ssh NAMA_VM \
  --zone=asia-southeast2-a \
  -- -L 3000:localhost:3000 -L 3001:localhost:3001
```

Lalu buka dari browser laptop:
- Frontend: `http://localhost:3001`
- API: `http://localhost:3000/api/v1`
- Swagger: `http://localhost:3000/api/docs`

## 9. Akun Demo

Semua akun seed memakai password:

```text
Password123!
```

Username:
- `admin.tu`
- `guru.bk`
- `guru.mapel`
- `petugas.kesiswaan`
- `orangtua.demo`

## 10. Update Deployment Setelah Ada Perubahan Git

Di terminal SSH VM:

```bash
cd ~/apps/SIABDI
git pull
bash scripts/docker-run-dev.sh
```

Jika hanya ingin restart container tanpa menjalankan Prisma migrate/seed:

```bash
SKIP_DB_INIT=1 bash scripts/docker-run-dev.sh
```

## 11. Reset Total Data Development

Ini menghapus database dan dependency volume container:

```bash
bash scripts/docker-run-reset.sh
bash scripts/docker-run-dev.sh
```

## 12. Troubleshooting

Jika `docker` butuh sudo:

```bash
newgrp docker
```

Jika frontend tidak bisa memanggil API:
- Pastikan SSH tunnel membuka port `3000` dan `3001`.
- Pastikan `.env` memakai `NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api/v1` untuk tunnel.
- Jika tidak memakai tunnel dan membuka frontend dari public IP/domain, pastikan `NEXT_PUBLIC_API_BASE_URL` dan `CORS_ORIGIN` memakai public IP/domain yang sama dengan browser.
- Restart web setelah mengubah `.env`:

```bash
bash scripts/docker-run-dev.sh
```

Jika API gagal konek database:

```bash
docker logs attendance-postgres
docker logs attendance-api
```

Jika port dipakai service lain:

```bash
sudo lsof -i :3000
sudo lsof -i :3001
```

## Catatan Tentang "venv"

Project ini tidak membutuhkan Python virtual environment. Development environment-nya adalah VM + Docker. Dependency Node, API, web, Postgres, dan Redis dijalankan di container.
