# Update Package: 3D Live Classroom Board + Teacher Controls

Copy these files into your local `VirtualLearningMetaverse/` project root and replace existing files.

## Files to replace/add

```txt
classroom-server/server.js
frontend-react/tailwind.config.js
frontend-react/src/components/metaverse/MetaverseScene.tsx
frontend-react/src/components/classroom/RealtimeWhiteboard.tsx
frontend-react/src/pages/ClassroomPage.tsx
frontend-react/src/types/aframe.d.ts
AI_IMPLEMENTATION_NOTES.md
```

## What this update adds

1. Live whiteboard appears inside the 3D classroom scene.
2. Teacher can lock/unlock student writing.
3. Students can watch board updates even when writing is locked.
4. Teacher can force everyone into 3D classroom mode or back to video mode.
5. 3D classroom has improved stage, desks, board, lighting, humanoid avatars, name tags, and status indicators.

## After copying

Run frontend build:

```bash
cd frontend-react
npm run build
npm run dev
```

Run classroom server:

```bash
cd classroom-server
npm run dev
```

## Test checklist

1. Open teacher in browser 1.
2. Open student in incognito/browser 2.
3. Teacher clicks 3D button: everyone should move to 3D view.
4. Teacher opens Board tab and writes: board should update in 3D scene.
5. Student opens Board tab: should be locked by default.
6. Teacher clicks `Students Locked` to enable student writing.
7. Student writes: teacher and 3D board should see update.
8. Teacher clicks 3D button again: everyone returns to video view.
