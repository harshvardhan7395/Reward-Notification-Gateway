# Reward Notification Gateway

A real-time notification service that delivers reward events to users via WebSockets, backed by Redis Pub/Sub for horizontal scalability. Built with NestJS and TypeScript.

## What it demonstrates

This service solves a concrete problem in any high-scale offer-wall or rewarded-acquisition platform: how do you push a live "you earned X coins" event to a specific user when your WebSocket servers run as multiple pods behind a load balancer?

The answer is Redis Pub/Sub as a fan-out backbone. When a reward event fires (from an advertiser postback, a game completion, a survey submit), any pod can publish it. Every pod is subscribed to the same Redis channel. The pod that holds the target user's socket delivers it. The others discard it silently. The client never knows which pod served it.

Key concepts demonstrated:
- **WebSocket lifecycle** — JWT authentication at the handshake (not on first message), connection/disconnect handlers, per-user socket registry
- **Redis Pub/Sub fan-out** — two ioredis clients (pub/sub must be separate), channel subscription, listener dispatch
- **NestJS architecture** — gateway, service, controller, module wiring, `@Inject()` tokens for testable providers
- **Horizontal scalability** — the design works identically with 1 pod or 100; no sticky sessions required
- **Test-first development** — 10 unit tests covering guard rejection, socket registry, event delivery, and message parsing

## Tech stack

| Layer | Technology |
|---|---|
| Framework | NestJS 10, TypeScript 5 |
| WebSockets | socket.io via `@nestjs/platform-socket.io` |
| Message broker | Redis 7 Pub/Sub via ioredis |
| Auth | JWT via `@nestjs/jwt` |
| Testing | Jest, `@nestjs/testing` |
| Infra | Docker Compose |

## Architecture

```
Browser (socket.io client)
       │  JWT handshake
       ▼
NotificationsGateway (NestJS WebSocket gateway)
       │  register userId → socket
       ▼
NotificationsService (in-memory Map<userId, Socket>)

                    ┌─────────────────────┐
POST /rewards/trigger  │  RewardsController  │
       │            └──────────┬──────────┘
       │                       │ publishReward()
       ▼                       ▼
                         RedisService
                        ┌────┴────┐
                       pub      sub
                        │        │
                        └──Redis─┘
                          channel: "rewards"
                               │
                    (all pods receive)
                               │
                    NotificationsGateway.onReward()
                               │
                    NotificationsService.sendReward()
                               │
                    socket.emit('reward', payload)
                               │
                    Browser receives toast ✓
```

## How to run

**Prerequisites:** Docker, Node 20+

```bash
# 1. Clone and install
git clone <repo-url>
cd reward-notification-gateway
npm install

# 2. Start Redis
docker compose up redis -d

# 3. Start the app
npm run start:dev

# 4. Open the demo
open http://localhost:3000/demo.html
```

Enter a user ID (e.g. `user-42`) and click Connect. Then trigger a reward from a second terminal:

```bash
curl -s -X POST http://localhost:3000/rewards/trigger \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-42","amount":50,"description":"Completed survey"}'
```

The toast appears in the browser in under 100ms.

To simulate multi-pod fan-out (the core concept), open two terminal tabs and start the app on different ports:

```bash
# Terminal 1
PORT=3000 npm run start:dev

# Terminal 2
PORT=3001 npm run start:dev
```

Connect the browser to port 3000. Trigger the reward via port 3001. The event still arrives — because both pods share the same Redis channel.

## Tests

```bash
npm test
# 10 tests across 3 suites — guard, service, Redis
```

## Known limitations and production paths

| Limitation | Production path |
|---|---|
| Missed events when client is offline | Write each event to a Redis Sorted Set (keyed by userId, scored by timestamp, TTL 5min). On reconnect, drain and replay. For full durability, use Redis Streams with consumer groups. |
| No reconnection backoff in demo client | socket.io's `reconnectionDelay` + `reconnectionDelayMax` + jitter handles this out of the box in production clients. |
| JWT secret in env var | Use a secret manager (GCP Secret Manager, AWS Secrets Manager) and rotate regularly. |
| In-memory socket map per pod | Correct with Redis Pub/Sub. The map only needs to hold connections local to this pod. |
| No rate limiting on `/rewards/trigger` | In production this endpoint would be internal only (not exposed via ingress) or gated by an API key. |
