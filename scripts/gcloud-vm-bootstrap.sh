#!/usr/bin/env bash
set -euo pipefail

if [[ "$(id -u)" -eq 0 ]]; then
  echo "Run this script as the regular SSH user, not root."
  exit 1
fi

if ! command -v sudo >/dev/null 2>&1; then
  echo "sudo is required."
  exit 1
fi

echo "Updating package index..."
sudo apt-get update

echo "Installing base packages..."
sudo apt-get install -y ca-certificates curl git git-lfs gnupg lsb-release openssl

echo "Installing Docker Engine..."
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

. /etc/os-release
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" \
  | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null

sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin

echo "Enabling Docker service..."
sudo systemctl enable --now docker

if ! groups "$USER" | grep -q '\bdocker\b'; then
  echo "Adding $USER to docker group..."
  sudo usermod -aG docker "$USER"
fi

echo "Initializing Git LFS..."
git lfs install

echo "Bootstrap completed."
echo "Important: log out and SSH back in, or run: newgrp docker"
echo "Then verify with: docker --version && docker run hello-world"
