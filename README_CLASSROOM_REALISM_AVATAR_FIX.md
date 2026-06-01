# Classroom Realism + Avatar + Board Fix

This package fixes:

1. Avatars appearing at the wrong/back side.
2. Self avatar not visible.
3. Teacher/student viewpoints not feeling like a real classroom.
4. 3D board writing not updating reliably.
5. More lag reduction.

## Replace these files

Copy this package into your local `VirtualLearningMetaverse/` project root and replace:

```txt
classroom-server/server.js
frontend-react/src/components/metaverse/MetaverseScene.tsx
frontend-react/src/components/classroom/RealtimeWhiteboard.tsx
frontend-react/src/pages/ClassroomPage.tsx
```

## What changed

- Teacher camera starts on stage looking at students.
- Student camera starts near desk looking at teacher/board.
- Self avatar is now visible and labeled `You`.
- Teacher avatar is placed on stage.
- Student avatar is placed near desks.
- Avatars are updated imperatively in A-Frame for better performance.
- Board texture uses direct Three.js CanvasTexture for more reliable live board updates.
- Renderer pixel ratio is capped to reduce lag.
- Position updates send less frequently and only when movement/rotation is significant.

## After copying

Stop old servers with Ctrl+C, then run:

```bash
cd frontend-react
npm run build
npm run dev
```

Second terminal:

```bash
cd classroom-server
npm run dev
```

## If npm run build gives memory error

Use this on Windows CMD:

```cmd
set NODE_OPTIONS=--max-old-space-size=4096
npm run build
```

PowerShell:

```powershell
$env:NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

## Test

1. Teacher and student join.
2. Teacher clicks 3D button.
3. Teacher should start near stage and see student avatar at desks.
4. Student should start from desk side and see teacher avatar on stage.
5. Both should also see a `You` avatar.
6. Teacher writes on Board tab.
7. Writing should appear on the 3D board.
