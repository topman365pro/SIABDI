#!/usr/bin/env bash
set -euo pipefail

CONTAINERS=(
  attendance-web
  attendance-api
  attendance-redis
  attendance-postgres
)

for container in "${CONTAINERS[@]}"; do
  docker rm -f "${container}" >/dev/null 2>&1 || true
done

docker network rm attendance-net >/dev/null 2>&1 || true

echo "Stopped attendance containers. Data volumes are preserved."
