# How to Manually Copy These Changes Into Your Local Project

This folder is a manual copy package. It contains the changed/new files in the exact same structure as your project.

## Your local project root

Your local root should be the folder that contains:

```txt
frontend-react/
classroom-server/
index.html
README.md
```

Example Windows:

```txt
C:\Users\YourName\Desktop\VirtualLearningMetaverse
```

Example Mac/Linux:

```txt
/Users/YourName/Desktop/VirtualLearningMetaverse
```

## Step 1 — Backup first

Before copying, make a backup of your project folder.

Or create a Git branch:

```bash
git checkout -b local-test-production-upgrade
```

## Step 2 — Copy files

Copy everything from this `manual-copy-package/` folder into your local `VirtualLearningMetaverse/` folder.

When your computer asks:

```txt
Replace existing files?
```

Choose:

```txt
Yes / Replace
```

This will add new files and replace modified files at the correct paths.

## Step 3 — Delete duplicate old auth files

Delete these two files from your local project if they exist:

```txt
frontend-react/src/store/authStore.ts
frontend-react/src/stores/authStore.ts
```

The app now uses only:

```txt
frontend-react/src/stores/useAuthStore.ts
```

## Step 4 — Install and test frontend

Open terminal in your local project:

```bash
cd frontend-react
npm install
npm run build
npm run dev
```

Open the local URL shown by Vite, usually:

```txt
http://localhost:3000
```

## Step 5 — Test realtime classroom server

Open another terminal:

```bash
cd classroom-server
npm install
npm run dev
```

It should run at:

```txt
http://localhost:3001
```

## Step 6 — Test classroom features

1. Browser 1: Login with Demo Teacher.
2. Browser 2/incognito: Login with Demo Student.
3. Join classroom.
4. Test:
   - Public chat
   - Private chat
   - Whiteboard
   - Polls
   - 3D classroom
   - Avatar movement
   - Mic/video controls

## Step 7 — Optional Spring Boot backend

For backend you need:

- Java 21+
- Maven
- PostgreSQL

Then run:

```bash
cd backend-spring
mvn spring-boot:run
```

Or use Docker:

```bash
docker compose -f docker-compose.dev.yml up --build
```

## Important

Do not push to GitHub until local testing is complete.

After testing successfully:

```bash
git add .
git commit -m "Add production classroom features and Spring Boot backend foundation"
git push origin local-test-production-upgrade
```
