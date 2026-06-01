# Performance Hotfix: 3D Classroom Lag + Avatar Spawn

Copy this package into your local `VirtualLearningMetaverse/` project root and replace existing files.

## Files included

```txt
classroom-server/server.js
frontend-react/src/components/metaverse/MetaverseScene.tsx
frontend-react/src/components/classroom/RealtimeWhiteboard.tsx
frontend-react/src/pages/ClassroomPage.tsx
```

## What this hotfix improves

1. Reduces 3D position sync from 100ms to 250ms.
2. Throttles React avatar re-render updates to reduce lag.
3. Prevents the server from echoing every avatar movement back to the same sender.
4. Adds default spawn positions for teacher and students, so avatars appear even before movement.
5. Reduces some room geometry for better FPS.
6. Makes the 3D whiteboard texture refresh more reliably.
7. Keeps teacher board lock/unlock and force-3D controls.

## After copying

Restart both terminals:

```bash
# Terminal 1
cd frontend-react
npm run build
npm run dev

# Terminal 2
cd classroom-server
npm run dev
```

## Test

1. Teacher and student join classroom.
2. Teacher clicks 3D button.
3. Everyone should enter 3D.
4. Teacher and student should see each other's avatars.
5. Teacher writes on Board tab.
6. Writing should appear on the 3D board.
7. Check if lag is reduced.

## If still laggy

Next step will be switching avatar rendering from React-rendered A-Frame entities to imperative A-Frame entity updates, which is faster for real-time metaverse rooms.
