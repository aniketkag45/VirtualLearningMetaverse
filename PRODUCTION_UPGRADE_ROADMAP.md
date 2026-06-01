# VirtualLearningMetaverse — Production-Grade Upgrade Roadmap

## Current Repository Audit

Repository inspected from: `https://github.com/aniketkag45/VirtualLearningMetaverse.git`

### What exists now

1. **Legacy static prototype**
   - `index.html`
   - `login.html`
   - `dashboard.html`
   - `courses.html`
   - `classroom.html`
   - `css/style.css`
   - `js/script.js`

2. **Modern React frontend**
   - Folder: `frontend-react/`
   - Stack: React 18, TypeScript, Vite, Tailwind, Zustand, Socket.IO client, WebRTC utilities, A-Frame/Three.js.
   - Important pages:
     - `LandingPage.tsx`
     - `LoginPage.tsx`
     - `Dashboard.tsx`
     - `CoursesPage.tsx`
     - `ClassroomPage.tsx`
     - `CourseLearningPage.tsx`
   - Important real-time/3D utilities:
     - `components/metaverse/MetaverseScene.tsx`
     - `utils/peerManager.ts`
     - `utils/spatialAudio.ts`

3. **Node Socket.IO classroom server**
   - Folder: `classroom-server/`
   - Main file: `server.js`
   - Current events include:
     - classroom join/leave
     - public chat
     - avatar movement
     - WebRTC signaling
     - mute/video toggle
     - raise hand
     - screen sharing status
     - breakout rooms
     - live polls

### Build status

Frontend build was tested with:

```bash
cd frontend-react
npm install
npm run build
```

Result: **Build succeeded**.

Observed warnings/issues:

- Large JS bundle: about 1.7 MB minified.
- `node_modules` and `dist` appear to be present in the repository clone. These should not be tracked in a production repository.
- Frontend currently uses demo/localStorage auth, not secure production auth.
- Backend is currently only a volatile in-memory Socket.IO server, not a real persistent production backend.
- Socket server has no JWT validation, no room authorization, no persistence, no rate limits, and no horizontal scalability support.
- Classroom page is too large and should be split into feature modules.

---

## Final Product Vision

Upgrade the project into a unique **AI-powered 3D Virtual Classroom SaaS**:

> A real-time metaverse classroom where teachers and students can join as avatars, move inside a 3D classroom, talk with spatial audio, chat one-to-one or publicly, use a collaborative whiteboard, join breakout rooms, take polls/quizzes, and ask an AI tutor that answers from course/class materials using RAG.

Suggested product name options:

1. **MetaClass AI**
2. **SkillVerse Classroom**
3. **ClassVerse AI**
4. **LearnSphere AI**
5. **EduVerse Agent Studio**

---

## Uniqueness Strategy

Many platforms provide online video classes. Some provide 3D rooms. Some provide AI assistants. This project becomes unique by combining all of these in one focused education experience:

1. **3D spatial classroom**
   - Real-time avatar movement.
   - Teacher zone, student desks, whiteboard, collaboration areas.
   - Spatial audio based on avatar distance.

2. **Real teaching tools inside the metaverse**
   - Shared whiteboard.
   - Screen sharing.
   - Polls.
   - Quizzes.
   - Breakout rooms.
   - Hand raise.
   - Attendance.

3. **AI/RAG classroom assistant**
   - Upload PDFs, notes, videos transcripts, assignments.
   - Ask questions from course material.
   - Answers include citations.
   - Teacher can auto-generate quiz, summary, flashcards, assignments.

4. **Low-bandwidth education mode**
   - Switch between:
     - Video class mode
     - 3D avatar mode
     - Audio-only mode
     - Text-only mode
   - This is highly relevant for rural education.

5. **Teacher control and safety**
   - Mute all.
   - Remove participant.
   - Lock room.
   - Moderated chat.
   - Report/flag behavior.
   - Session recording metadata.

---

## Target Production Architecture

```text
React + TypeScript Frontend
        |
        | HTTPS REST + WebSocket/SSE/Socket.IO
        v
Spring Boot Main Backend
        |
        |-- Auth + JWT + Refresh Tokens
        |-- Users / Roles / Schools / Classrooms
        |-- Courses / Lessons / Assignments
        |-- RAG Knowledge Base APIs
        |-- Attendance / Analytics / Reports
        |-- Persistent chat / whiteboard / poll history
        |
        |---------- PostgreSQL
        |---------- Redis
        |---------- S3-compatible Object Storage
        |---------- Vector DB: pgvector or Qdrant
        |---------- LLM Provider / Local LLM
        |
        v
Realtime Gateway
        |
        |-- Socket.IO events
        |-- Avatar movement
        |-- WebRTC signaling
        |-- Live whiteboard
        |-- Presence
```

### Backend recommendation

For your preference, use **Java Spring Boot** as the main backend.

Keep Node.js Socket.IO initially as a **Realtime Gateway** because your current classroom features are already built around Socket.IO.

Later, either:

1. Keep Node.js permanently for low-latency real-time events, or
2. migrate realtime to Spring WebSocket after the core product is stable.

Recommended for fastest success:

```text
Spring Boot = secure business backend + database + AI/RAG
Node Socket.IO = realtime classroom gateway
React = frontend
```

---

## Production Feature Modules

## 1. Authentication and Roles

### Must have

- Real register/login.
- JWT access token and refresh token.
- Roles:
  - STUDENT
  - TEACHER
  - ADMIN
  - SCHOOL_OWNER
- Protected API routes.
- Socket authentication using JWT.

### Current gap

Current login is demo-only and stores fake users in localStorage.

---

## 2. Course and Classroom Management

### Entities

- Course
- Lesson
- Enrollment
- LiveClassroomSession
- AttendanceRecord
- Assignment
- Material

### Features

- Teacher creates course.
- Teacher schedules live class.
- Student enrolls.
- Student joins only enrolled classroom.
- Attendance is recorded automatically from socket join/leave.

---

## 3. Real-Time 3D Classroom

### Current status

Already exists partially:

- A-Frame classroom scene.
- Basic desks/walls/whiteboard.
- Avatar position syncing through `avatar-move` and `avatars-updated`.
- Spatial audio utility exists.

### Upgrade requirements

1. Replace basic sphere avatars with proper low-poly avatars.
2. Smooth interpolation for remote avatar movement.
3. Add name tags and status icons above avatars:
   - muted
   - hand raised
   - speaking
   - screen sharing
4. Add teacher podium and whiteboard zone.
5. Add interactive seats/desks.
6. Add classroom minimap.
7. Add collision boundaries.
8. Add role-based spawn positions:
   - teacher near board
   - students near desks
9. Add 3D whiteboard texture synced with real-time whiteboard.
10. Add performance modes:
   - low quality
   - medium quality
   - high quality

---

## 4. Real-Time Whiteboard

### Required features

- Pen tool.
- Eraser.
- Color picker.
- Stroke width.
- Clear board for teacher.
- Undo/redo later.
- Save whiteboard snapshots.
- Sync all strokes to everyone in the classroom.
- Use same whiteboard as texture in 3D classroom later.

### Production implementation

- Client draws on canvas.
- Every stroke is sent as vector data, not image pixels.
- Server stores strokes per classroom.
- Late joiners receive existing whiteboard state.
- Teacher-only clear permission.
- Persist final board snapshots in Spring backend/S3.

---

## 5. Public and Private Chat

### Required features

- Public class chat.
- One-to-one private chat.
- Teacher announcements.
- File attachments later.
- Moderation controls.
- Message persistence.

### Current gap

Only public in-memory classroom chat exists.

---

## 6. Video, Audio, and Screen Sharing

### Current status

- Native WebRTC manager exists.
- Socket.IO signaling exists.
- Screen sharing status exists.

### Production upgrades

- Add TURN server support for real-world networks.
- Add connection quality indicator.
- Add reconnect logic.
- Limit peer mesh size; for many students use SFU later.
- Recommended later SFU: LiveKit, mediasoup, or Janus.

### Important warning

Peer-to-peer mesh WebRTC works for small classes. For production classes with 20+ users, use SFU architecture.

---

## 7. Breakout Rooms

### Current status

Breakout rooms already exist partially.

### Upgrade requirements

- Fix room join/leave event payload consistency.
- Teacher can move students between rooms.
- Teacher can visit any room.
- Broadcast teacher message to all rooms.
- Auto-return timer.
- Persist breakout activity summary.

---

## 8. Polls and Quizzes

### Current status

Live polls exist in memory.

### Upgrade requirements

- Persist poll questions and responses.
- Export results.
- AI-generated polls from current lecture/topic.
- Add quiz mode with timer and scoring.

---

## 9. AI/RAG Classroom Assistant

### User-facing features

1. Student asks:
   - “Explain today’s topic simply.”
   - “Give me examples from the uploaded PDF.”
   - “Create revision notes.”
   - “What did teacher explain about OOP?”

2. Teacher asks:
   - “Generate quiz from this chapter.”
   - “Find weak students from poll/quiz results.”
   - “Create assignment from today’s lecture.”
   - “Summarize class discussion.”

### RAG pipeline

1. Upload material.
2. Extract text.
3. Chunk text.
4. Generate embeddings.
5. Store in vector DB.
6. Retrieve relevant chunks.
7. Generate cited answer.
8. Verify answer is supported by sources.

### Recommended Spring Boot AI stack

- Spring Boot 3.x
- Spring AI or LangChain4j
- PostgreSQL + pgvector or Qdrant
- Apache Tika for document parsing
- S3 for uploaded files

---

## 10. Production UI/UX Plan

### Remove/clean

- Remove old static HTML prototype from final deployed app or move it to `/legacy-prototype`.
- Remove `node_modules` and `dist` from Git tracking.
- Remove duplicate auth stores:
  - `src/store/authStore.ts`
  - `src/stores/authStore.ts`
  - keep only `src/stores/useAuthStore.ts`.
- Split `ClassroomPage.tsx` into smaller modules.

### New layout

1. Landing page
   - Modern SaaS hero.
   - Product demo section.
   - 3D classroom preview.
   - AI/RAG feature section.
   - Pricing/waitlist later.

2. Dashboard
   - Upcoming live classes.
   - Enrolled courses.
   - Progress analytics.
   - AI tutor shortcut.
   - Recent classroom recordings/notes.

3. Classroom page
   - Main stage area.
   - Toggle: Video / 3D / Whiteboard.
   - Right dock: Chat / People / Polls / AI Tutor / Breakouts.
   - Bottom call controls.

4. Teacher studio
   - Create class.
   - Upload material.
   - Generate quiz.
   - Manage students.
   - View analytics.

---

## Recommended Implementation Phases

## Phase 1 — Clean and Stabilize Current App

- Remove tracked `node_modules` and `dist`.
- Keep React app as primary frontend.
- Keep Socket.IO server as realtime gateway.
- Split large classroom component.
- Add typed socket events.
- Add runtime validation.
- Add `.env.example` for frontend and server.
- Add Docker Compose for local development.

## Phase 2 — Real Classroom Features

- Real-time whiteboard.
- One-to-one private chat.
- Teacher announcements.
- Better avatar movement.
- Classroom attendance tracking.
- Persistent sessions.

## Phase 3 — Spring Boot Backend

- Create `backend-spring/`.
- Add auth.
- Add PostgreSQL schema.
- Add users/courses/classrooms/enrollments.
- Add JWT-secured APIs.
- Make React login use backend.
- Make Socket.IO validate JWT with Spring-issued token.

## Phase 4 — AI/RAG

- Upload course materials.
- Document parser.
- Chunking + embeddings.
- Vector search.
- AI assistant chat.
- Teacher quiz/assignment generator.
- Student learning assistant.

## Phase 5 — 3D Metaverse Polish

- Avatar models.
- Smoother movement.
- 3D whiteboard texture.
- Teacher pointer/laser.
- Interactive objects.
- Avatar emotes: raise hand, clap, confused, agree.
- Seat selection.

## Phase 6 — Production Readiness

- Redis adapter for Socket.IO scaling.
- Database persistence.
- Rate limits.
- Audit logs.
- Observability.
- CI/CD.
- Docker deployment.
- Security testing.
- TURN server.

---

## Priority Backlog

### P0 — Must fix before production

- Real backend authentication.
- JWT-secured socket connection.
- Remove `node_modules` and `dist` from repo.
- Persistent database.
- CORS hardening.
- Error boundaries in React.
- Proper environment configuration.
- Rate limits.
- Input validation.

### P1 — Core unique classroom features

- Real-time whiteboard.
- 3D avatar movement smoothing.
- One-to-one private chat.
- Attendance tracking.
- Teacher classroom controls.
- AI tutor from course material.

### P2 — Advanced features

- AI quiz generator.
- AI assignment generator.
- 3D whiteboard texture.
- Live captions/transcripts.
- Class summary after session.
- Multilingual translation.

### P3 — Scale features

- SFU media server.
- Redis Socket.IO adapter.
- Analytics dashboards.
- Billing/subscriptions.
- Mobile app.

---

## Immediate Next Engineering Tasks

1. Create real-time whiteboard module. ✅ Initial Socket.IO + canvas version implemented in this workspace.
2. Add private one-to-one chat event model. ✅ Initial Socket.IO + UI version implemented in this workspace.
3. Refactor `ClassroomPage.tsx` into smaller components.
4. Add Spring Boot backend skeleton. ✅ Initial Java 21/Spring Boot foundation added in `backend-spring/`.
5. Connect frontend login to Spring backend. ✅ Login flow now calls `/api/auth/login` with demo fallback buttons.
6. Add course/classroom database model.
7. Add RAG knowledge-base APIs.

---

## Suggested Folder Structure After Refactor

```text
frontend-react/src/
  app/
    App.tsx
    routes.tsx
  components/
    classroom/
      ClassroomLayout.tsx
      ClassroomHeader.tsx
      ClassroomStage.tsx
      ClassroomControls.tsx
      ClassroomSidebar.tsx
      ChatPanel.tsx
      PrivateChatPanel.tsx
      ParticipantsPanel.tsx
      WhiteboardPanel.tsx
      PollsPanel.tsx
      BreakoutPanel.tsx
      AITutorPanel.tsx
    metaverse/
      MetaverseScene.tsx
      Avatar.tsx
      ClassroomObjects.tsx
      Whiteboard3D.tsx
  hooks/
    classroom/
      useClassroomSocket.ts
      useWebRTC.ts
      useWhiteboard.ts
      useAvatarSync.ts
  services/
    apiClient.ts
    authApi.ts
    courseApi.ts
    classroomApi.ts
  stores/
    useAuthStore.ts
    useCourseStore.ts
    useClassroomStore.ts
  types/
    socketEvents.ts
    classroom.ts
    whiteboard.ts
```

---

## Success Definition

The project becomes production-grade when:

- Users can register/login securely.
- Teachers can create real classrooms.
- Students can enroll and join only allowed rooms.
- Real-time video/audio/chat/avatar movement works reliably.
- Whiteboard, polls, breakout rooms, and private chat work in real time.
- Class data persists in the database.
- AI tutor answers from uploaded class material with citations.
- App is dockerized and deployable.
- Codebase is modular, typed, tested, and maintainable.
