#!/usr/bin/env bash
set -euo pipefail

"$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/docker-run-down.sh"

VOLUMES=(
  attendance_postgres_data
  attendance_pnpm_store
  attendance_root_node_modules
  attendance_api_node_modules
  attendance_web_node_modules
)

for volume in "${VOLUMES[@]}"; do
  docker volume rm "${volume}" >/dev/null 2>&1 || true
done

echo "Removed attendance containers, network, and data volumes."
