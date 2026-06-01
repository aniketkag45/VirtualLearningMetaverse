# Lightweight Meet Mode Package

This update improves multi-user performance and keeps the waiting room logic.

## Replace these files

Copy into your local project root and replace:

```txt
classroom-server/server.js
frontend-react/src/pages/ClassroomPage.tsx
frontend-react/src/components/metaverse/MetaverseScene.tsx
frontend-react/src/components/classroom/RealtimeWhiteboard.tsx
frontend-react/src/utils/peerManager.ts
```

## What changed

1. Waiting room remains enabled.
2. Late admitted students automatically enter current teacher-controlled view mode.
3. 3D mode uses aggressive lightweight media mode:
   - camera video sending is detached from peer connections in 3D mode
   - audio remains active
   - video is restored when returning to video view
4. A-Frame renderer pixel ratio is capped.
5. Avatar updates remain imperative for lower lag.
6. Board texture uses direct canvas texture update.

## Important reality

This is the maximum sensible optimization for the current peer-to-peer mesh architecture.
For Google Meet-like smoothness with many students, the next real production step is LiveKit SFU.

## After copying

Stop running terminals with Ctrl+C.

Frontend:

```bash
cd frontend-react
npm run build
npm run dev
```

If build hits memory issue on Windows CMD:

```cmd
set NODE_OPTIONS=--max-old-space-size=4096
npm run build
```

Classroom server:

```bash
cd classroom-server
npm run dev
```

## Test

- Teacher joins.
- Student joins waiting room.
- Teacher admits.
- Teacher moves class to 3D.
- Camera should pause in 3D mode.
- Audio + avatars + board should continue.
- More students should be less laggy than before.
