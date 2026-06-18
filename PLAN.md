# Plan: Real-time Reward Notification Gateway

Status: Completed
Created: 2026-06-17
Completed: 2026-06-17

## What we're building
A NestJS + TypeScript backend demonstrating WebSocket fan-out via Redis Pub/Sub — targeting the Almedia Backend Engineer role. A user connects via WebSocket (JWT-authenticated at handshake), a REST endpoint triggers a reward event, Redis Pub/Sub fans it out across all pods, and the correct user sees a live toast notification in their browser.

## Done looks like
`docker compose up` → open `localhost:3000/demo` → paste userId → run curl trigger → toast appears in browser in <100ms.

## Test scenarios
- should reject the WebSocket connection when no JWT is provided in the handshake
- should reject the WebSocket connection when the JWT is expired or invalid
- should establish a WebSocket connection when a valid JWT is provided
- should deliver a reward event to the correct connected user when the REST trigger is called
- should not deliver a reward event to a different user's socket
- should publish to Redis Pub/Sub when the REST trigger endpoint is called
- should emit to the user's socket when the Redis subscriber receives a reward event

## Tasks
- [x] Task 1 — Scaffold NestJS project + Docker Compose (15 min)
- [x] Task 2 — JWT module + WsJwtGuard with unit tests (25 min)
- [x] Task 3 — RewardsGateway with connection handlers + unit tests (25 min)
- [x] Task 4 — RedisService — publisher + subscriber via ioredis (20 min)
- [x] Task 5 — POST /rewards/trigger REST endpoint (15 min)
- [x] Task 6 — Wire Redis subscriber → gateway fan-out (15 min)
- [x] Task 7 — HTML demo client (15 min)
- [x] Task 8 — README (15 min)

**Total: 2h 25min**

## Cut list (drop in this order if time runs short)
1. Multiple simultaneous browser tabs demo
2. Missed-event buffer on reconnect
3. Exponential backoff in HTML client
4. /metrics endpoint
5. E2E test with socket.io-client