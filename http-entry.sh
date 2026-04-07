#!/bin/sh
# Fail fast if something goes wrong
set -e

echo "Running Prisma migrate..."
bun run migrate:client

echo "Running Prisma generate..."
bun run generate:client

echo "Starting http backend..."
bun run http:be