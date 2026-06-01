# Server Crash Hotfix

This fixes the error:

ReferenceError: getPollsForClassroom is not defined

## Replace this file

Copy:

classroom-server/server.js

into your local project:

VirtualLearningMetaverse/classroom-server/server.js

Replace the existing file.

## Then restart classroom server

cd classroom-server
npm run dev

This crash was why the student page showed "No instructor joined" — the server crashed as soon as the teacher joined.
