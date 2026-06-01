# VirtualLearningMetaverse Spring Boot Backend

Production backend foundation for the AI-powered 3D virtual classroom platform.

## Requirements

- Java 21+
- Maven 3.9+
- PostgreSQL 15+

## Run locally

```bash
createdb vlm
mvn spring-boot:run
```

Default API:

```txt
http://localhost:8080/api
```

## Current modules

- Auth foundation: `/api/auth/register`, `/api/auth/login`
- Courses: `/api/courses`
- Classroom sessions: `/api/classroom-sessions`
- RAG placeholder: `/api/rag/ask`

## Next backend tasks

1. Add JWT authentication filter.
2. Connect React login to `/api/auth/login`.
3. Add enrollment and classroom authorization.
4. Let Socket.IO gateway validate Spring JWT.
5. Add material upload and RAG pipeline.
