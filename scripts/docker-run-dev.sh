#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NETWORK_NAME="attendance-net"
NODE_IMAGE="${NODE_IMAGE:-node:25-alpine}"
POSTGRES_IMAGE="${POSTGRES_IMAGE:-postgres:16-alpine}"
REDIS_IMAGE="${REDIS_IMAGE:-redis:7-alpine}"

POSTGRES_CONTAINER="attendance-postgres"
REDIS_CONTAINER="attendance-redis"
API_CONTAINER="attendance-api"
WEB_CONTAINER="attendance-web"

POSTGRES_VOLUME="attendance_postgres_data"
PNPM_VOLUME="attendance_pnpm_store"
ROOT_NODE_MODULES_VOLUME="attendance_root_node_modules"
API_NODE_MODULES_VOLUME="attendance_api_node_modules"
WEB_NODE_MODULES_VOLUME="attendance_web_node_modules"

DATABASE_URL_IN_DOCKER="postgresql://postgres:postgres@${POSTGRES_CONTAINER}:5432/attendance_db?schema=public"

if [[ ! -f "${APP_ROOT}/.env" ]]; then
  echo "Missing .env. Create it first:"
  echo "  cp .env.gcloud.example .env"
  exit 1
fi

docker network inspect "${NETWORK_NAME}" >/dev/null 2>&1 || docker network create "${NETWORK_NAME}" >/dev/null

for volume in \
  "${POSTGRES_VOLUME}" \
  "${PNPM_VOLUME}" \
  "${ROOT_NODE_MODULES_VOLUME}" \
  "${API_NODE_MODULES_VOLUME}" \
  "${WEB_NODE_MODULES_VOLUME}"; do
  docker volume inspect "${volume}" >/dev/null 2>&1 || docker volume create "${volume}" >/dev/null
done

remove_container() {
  docker rm -f "$1" >/dev/null 2>&1 || true
}

run_node_task() {
  local container_name="$1"
  local command="$2"

  remove_container "${container_name}"

  docker run --rm \
    --name "${container_name}" \
    --network "${NETWORK_NAME}" \
    --workdir /app \
    --env-file "${APP_ROOT}/.env" \
    -e "DATABASE_URL=${DATABASE_URL_IN_DOCKER}" \
    -v "${APP_ROOT}:/app" \
    -v "${PNPM_VOLUME}:/pnpm/store" \
    -v "${ROOT_NODE_MODULES_VOLUME}:/app/node_modules" \
    -v "${API_NODE_MODULES_VOLUME}:/app/apps/api/node_modules" \
    -v "${WEB_NODE_MODULES_VOLUME}:/app/apps/web/node_modules" \
    "${NODE_IMAGE}" \
    sh -c "npm install -g pnpm@10.11.0 && pnpm config set store-dir /pnpm/store && ${command}"
}

start_postgres() {
  if docker ps --format '{{.Names}}' | grep -qx "${POSTGRES_CONTAINER}"; then
    echo "Postgres already running."
    return
  fi

  remove_container "${POSTGRES_CONTAINER}"

  docker run -d \
    --name "${POSTGRES_CONTAINER}" \
    --restart unless-stopped \
    --network "${NETWORK_NAME}" \
    -e POSTGRES_DB=attendance_db \
    -e POSTGRES_USER=postgres \
    -e POSTGRES_PASSWORD=postgres \
    -p 5432:5432 \
    -v "${POSTGRES_VOLUME}:/var/lib/postgresql/data" \
    "${POSTGRES_IMAGE}" >/dev/null
}

start_redis() {
  if docker ps --format '{{.Names}}' | grep -qx "${REDIS_CONTAINER}"; then
    echo "Redis already running."
    return
  fi

  remove_container "${REDIS_CONTAINER}"

  docker run -d \
    --name "${REDIS_CONTAINER}" \
    --restart unless-stopped \
    --network "${NETWORK_NAME}" \
    -p 6379:6379 \
    "${REDIS_IMAGE}" >/dev/null
}

wait_for_postgres() {
  echo "Waiting for Postgres..."
  for _ in $(seq 1 60); do
    if docker exec "${POSTGRES_CONTAINER}" pg_isready -U postgres -d attendance_db >/dev/null 2>&1; then
      echo "Postgres is ready."
      return
    fi
    sleep 2
  done

  echo "Postgres did not become ready in time."
  docker logs "${POSTGRES_CONTAINER}" || true
  exit 1
}

start_api() {
  remove_container "${API_CONTAINER}"

  docker run -d \
    --name "${API_CONTAINER}" \
    --restart unless-stopped \
    --network "${NETWORK_NAME}" \
    --workdir /app \
    --env-file "${APP_ROOT}/.env" \
    -e "DATABASE_URL=${DATABASE_URL_IN_DOCKER}" \
    -p 3000:3000 \
    -v "${APP_ROOT}:/app" \
    -v "${PNPM_VOLUME}:/pnpm/store" \
    -v "${ROOT_NODE_MODULES_VOLUME}:/app/node_modules" \
    -v "${API_NODE_MODULES_VOLUME}:/app/apps/api/node_modules" \
    "${NODE_IMAGE}" \
    sh -c "npm install -g pnpm@10.11.0 && pnpm config set store-dir /pnpm/store && pnpm --filter api dev" >/dev/null
}

start_web() {
  remove_container "${WEB_CONTAINER}"

  docker run -d \
    --name "${WEB_CONTAINER}" \
    --restart unless-stopped \
    --network "${NETWORK_NAME}" \
    --workdir /app \
    --env-file "${APP_ROOT}/.env" \
    -e NEXT_TELEMETRY_DISABLED=1 \
    -p 3001:3001 \
    -v "${APP_ROOT}:/app" \
    -v "${PNPM_VOLUME}:/pnpm/store" \
    -v "${ROOT_NODE_MODULES_VOLUME}:/app/node_modules" \
    -v "${WEB_NODE_MODULES_VOLUME}:/app/apps/web/node_modules" \
    "${NODE_IMAGE}" \
    sh -c "npm install -g pnpm@10.11.0 && pnpm config set store-dir /pnpm/store && pnpm --filter web exec next dev --hostname 0.0.0.0 --port 3001" >/dev/null
}

start_postgres
start_redis
wait_for_postgres

echo "Installing dependencies..."
run_node_task "attendance-deps" "pnpm install --frozen-lockfile=false"

if [[ "${SKIP_DB_INIT:-0}" != "1" ]]; then
  echo "Running Prisma generate, migrate, and seed..."
  run_node_task "attendance-db-init" "pnpm --filter api prisma:generate && pnpm --filter api prisma:migrate && pnpm --filter api prisma:seed"
else
  echo "Skipping db-init because SKIP_DB_INIT=1."
fi

echo "Starting API and web..."
start_api
start_web

echo "Stack is running."
echo "Frontend: http://localhost:3001"
echo "API:      http://localhost:3000/api/v1"
echo "Swagger:  http://localhost:3000/api/docs"
