# LiveKit SFU Migration Package

This package starts the correct production migration from peer-to-peer WebRTC mesh to LiveKit SFU.

## Why this is needed

Your current peer-to-peer mesh becomes laggy with 3+ people because every browser sends/receives video directly to every other browser.

LiveKit works like Google Meet style architecture:

- each user sends media once to LiveKit server
- LiveKit distributes optimized streams
- much better for many students

## Replace/add these files

Copy this package into your local `VirtualLearningMetaverse/` root and replace files.

```txt
classroom-server/package.json
classroom-server/package-lock.json
classroom-server/server.js
classroom-server/.env.example

frontend-react/package.json
frontend-react/package-lock.json
frontend-react/.env.example
frontend-react/src/components/classroom/LiveKitClassroom.tsx
frontend-react/src/components/metaverse/MetaverseScene.tsx
frontend-react/src/components/classroom/RealtimeWhiteboard.tsx
frontend-react/src/pages/ClassroomPage.tsx
frontend-react/src/utils/peerManager.ts

docker-compose.dev.yml
```

## Local LiveKit setup option A: Docker recommended

From project root:

```bash
docker run --rm ^
  -p 7880:7880 ^
  -p 7881:7881 ^
  -p 7882:7882/udp ^
  livekit/livekit-server:latest ^
  --dev --bind 0.0.0.0
```

PowerShell version:

```powershell
docker run --rm `
  -p 7880:7880 `
  -p 7881:7881 `
  -p 7882:7882/udp `
  livekit/livekit-server:latest `
  --dev --bind 0.0.0.0
```

LiveKit dev mode uses:

```txt
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
LIVEKIT_URL=ws://localhost:7880
```

## Local env files

Create/update `classroom-server/.env`:

```env
PORT=3001
FRONTEND_URLS=http://localhost:5173,http://localhost:3000
LIVEKIT_URL=ws://localhost:7880
LIVEKIT_API_KEY=devkey
LIVEKIT_API_SECRET=secret
```

Create/update `frontend-react/.env`:

```env
VITE_SOCKET_URL=http://localhost:3001
VITE_API_BASE_URL=http://localhost:8080/api
VITE_LIVEKIT_ENABLED=true
VITE_LIVEKIT_URL=ws://localhost:7880
VITE_LIVEKIT_TOKEN_URL=http://localhost:3001/api/livekit/token
```

## Install and run

Terminal 1: LiveKit server using Docker command above.

Terminal 2: classroom server

```bash
cd classroom-server
npm install
npm run dev
```

Terminal 3: frontend

```bash
cd frontend-react
npm install
npm run build
npm run dev
```

## What changes

- LiveKit handles audio/video/screen share.
- Socket.IO still handles waiting room, admissions, 3D movement, whiteboard, polls, teacher controls.
- Old peer-to-peer media is skipped when `VITE_LIVEKIT_ENABLED=true`.
- In 3D mode, LiveKit camera is disabled but audio remains active.
- In video mode, LiveKit video grid is used.

## Test

1. Start LiveKit server.
2. Start classroom-server.
3. Start frontend.
4. Teacher joins.
5. Student waits.
6. Teacher admits.
7. Video tiles should be LiveKit-powered.
8. Add 2nd/3rd student; video should be smoother and more consistent than P2P.
9. Teacher moves everyone to 3D; LiveKit camera disables, audio continues.
10. Teacher returns to video; LiveKit video returns.

## Production note

For real deployment, use LiveKit Cloud or a properly configured LiveKit server with TURN, TLS, and secure token generation from Spring Boot.
