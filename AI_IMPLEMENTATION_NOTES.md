# AI Agent Implementation Notes

## Completed in this workspace

### 1. Repository inspection

Inspected the current project and identified:

- React + TypeScript frontend in `frontend-react/`
- Socket.IO realtime server in `classroom-server/`
- Legacy static HTML prototype at repo root
- Existing 3D/A-Frame classroom, avatar sync, WebRTC signaling, breakout rooms, and polls
- Missing production backend, persistent database, real auth, RAG, secure sockets, and production deployment structure

### 2. Build verification

Verified frontend build:

```bash
cd frontend-react
npm install
npm run build
```

Result: build succeeded.

Verified Socket.IO server syntax:

```bash
cd classroom-server
node --check server.js
```

Result: no syntax errors.

### 3. Production roadmap added

Created:

- `PRODUCTION_UPGRADE_ROADMAP.md`

This contains the full production-grade plan for:

- 3D classroom
- realtime collaboration
- Spring Boot backend
- AI/RAG classroom assistant
- secure auth
- persistent database
- deployment
- refactoring

### 4. Real-time whiteboard implemented

Added frontend files:

- `frontend-react/src/components/classroom/RealtimeWhiteboard.tsx`
- `frontend-react/src/types/whiteboard.ts`

Modified frontend:

- `frontend-react/src/pages/ClassroomPage.tsx`

Changes:

- Added a new `Board` tab in the classroom sidebar.
- Added realtime canvas whiteboard.
- Added pen tool.
- Added eraser tool.
- Added color selector.
- Added stroke width control.
- Added teacher-only clear board action.
- Added late-joiner whiteboard state sync.

Modified Socket.IO server:

- `classroom-server/server.js`

Added events:

- `whiteboard-request-state`
- `whiteboard-state`
- `whiteboard-stroke`
- `whiteboard-clear`
- `whiteboard-cleared`
- `whiteboard-error`

Current whiteboard persistence is in-memory on the realtime gateway. Production persistence should later be moved to Spring Boot/PostgreSQL/S3.

### 5. Private one-to-one chat implemented

Added frontend file:

- `frontend-react/src/components/classroom/PrivateChatPanel.tsx`

Modified frontend:

- `frontend-react/src/pages/ClassroomPage.tsx`
- `frontend-react/src/types/classroom.ts`

Modified Socket.IO server:

- `classroom-server/server.js`

Added events:

- `send-private-message`
- `receive-private-message`
- `private-chat-history`
- `private-message-error`

Current private chat history is in-memory on the realtime gateway. Production persistence should later be handled by Spring Boot `chat_messages` table.

### 6. Spring Boot backend foundation added

Added:

- `backend-spring/`

Backend modules currently included:

- Auth register/login foundation
- JWT generation and request filter
- Users table/entity
- Courses table/entity/API
- Classroom sessions table/entity/API
- RAG placeholder endpoint
- Flyway initial schema
- PostgreSQL configuration
- Dockerfile

Note: this sandbox only has Java 11 and no Maven, so the Spring Boot backend was created but not compiled here. It is configured for Java 21 and Maven.

### 7. Frontend backend auth integration added

Modified:

- `frontend-react/src/lib/api.ts`
- `frontend-react/src/stores/useAuthStore.ts`
- `frontend-react/src/pages/LoginPage.tsx`

The login page now attempts Spring Boot login through `/api/auth/login`. Demo login buttons remain available for local classroom testing when the backend is not running.

### 8. Docker/local development foundation added

Added:

- `docker-compose.dev.yml`
- `backend-spring/Dockerfile`
- `classroom-server/Dockerfile`
- `frontend-react/Dockerfile`
- `frontend-react/nginx.conf`

### 9. Duplicate auth stores removed

Removed unused duplicate files:

- `frontend-react/src/store/authStore.ts`
- `frontend-react/src/stores/authStore.ts`

The app now uses only:

- `frontend-react/src/stores/useAuthStore.ts`

### 10. 3D avatar self-render bug fixed

Modified:

- `frontend-react/src/pages/ClassroomPage.tsx`

Fix:

- `MetaverseScene` now receives `mySocketId` as `currentUserId`, not `user.id`.
- Spatial audio avatar comparison now uses the active socket ID.

Reason:

- Avatar IDs from the socket server are socket IDs, but the previous code compared them with local user IDs. This could cause the current user's own avatar to appear incorrectly in the 3D scene.

## Important production notes

1. `node_modules` and `dist` appear in the cloned repository. They should be removed from Git tracking.
2. The current auth is demo/localStorage only.
3. Socket server stores data in memory only.
4. For large video classrooms, peer-to-peer mesh WebRTC will not scale. Add SFU later.
5. Spring Boot should become the source of truth for users, courses, classrooms, materials, auth, and RAG.

### 11. 3D live board and teacher classroom control added

Modified:

- `frontend-react/src/components/metaverse/MetaverseScene.tsx`
- `frontend-react/src/components/classroom/RealtimeWhiteboard.tsx`
- `frontend-react/src/pages/ClassroomPage.tsx`
- `frontend-react/src/types/aframe.d.ts`
- `classroom-server/server.js`

Added capabilities:

- The live whiteboard now appears as a synced texture inside the 3D classroom scene.
- Teacher can lock/unlock student writing on the board.
- Students can watch board updates in 2D and 3D even when writing is locked.
- Teacher can move all participants into 3D classroom mode or back to video mode.
- 3D scene has an upgraded classroom layout, stage, desks, board frame, more humanoid avatars, name tags, and status indicators.

## Suggested next implementation step

Split `ClassroomPage.tsx` into smaller components and then connect protected frontend APIs to Spring Boot:

- `ChatPanel.tsx`
- `ParticipantsPanel.tsx`
- `WhiteboardPanel.tsx`
- `PollsPanel.tsx`
- `BreakoutPanel.tsx`
- `ClassroomControls.tsx`
- `ClassroomStage.tsx`

After that, start `backend-spring/` with:

- Spring Boot 3
- PostgreSQL
- JWT auth
- Users/courses/classrooms/enrollments schema
