# Avatar + 3D Performance Fix Package

This package is focused on the issues:

1. No avatars visible in 3D room.
2. 3D scene lagging.

## Replace these files in your local project

```txt
classroom-server/server.js
frontend-react/src/components/metaverse/MetaverseScene.tsx
frontend-react/src/components/classroom/RealtimeWhiteboard.tsx
frontend-react/src/pages/ClassroomPage.tsx
```

## What changed

- Avatars are now created/updated imperatively in A-Frame instead of React re-rendering them every movement packet.
- Every joined user gets a default spawn position immediately.
- Teacher spawns near front board; students spawn near desk seats.
- 3D movement sync now sends only when user actually moves/rotates significantly.
- Scene geometry is lighter.
- A visible `Avatars visible: N` counter is shown in 3D mode.
- Board writing sync remains enabled.

## After copying

Stop frontend and classroom server terminals, then run:

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

## Test

- Open teacher in one browser.
- Open student in incognito.
- Teacher clicks 3D button.
- Check `Avatars visible: N` in bottom-left of the 3D scene.
- Teacher should see student avatar.
- Student should see teacher avatar.

Note: You do not see your own full avatar in first-person view; you see other participants.
