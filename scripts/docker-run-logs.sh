#!/usr/bin/env bash
set -euo pipefail

if [[ "${1:-}" == "" ]]; then
  docker logs -f attendance-api &
  api_pid=$!
  docker logs -f attendance-web &
  web_pid=$!
  wait "${api_pid}" "${web_pid}"
else
  docker logs -f "$1"
fi
