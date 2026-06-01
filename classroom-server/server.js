require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { AccessToken } = require('livekit-server-sdk');
const { create } = require('domain');

const app = express();
const allowedOrigins = (process.env.FRONTEND_URLS || 'http://localhost:5173,http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const isAllowedOrigin = (origin) => {
    if (!origin) return true;
    if (allowedOrigins.includes(origin)) return true;

    // Allow Vercel preview/production domains for frontend deployments.
    try {
        const { hostname } = new URL(origin);
        return hostname.endsWith('.vercel.app');
    } catch (_error) {
        return false;
    }
};

const corsOptions = {
    origin: (origin, callback) => {
        // Allow non-browser requests (no origin) and configured frontends.
        if (isAllowedOrigin(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ['GET', 'POST']
};

app.use(cors(corsOptions));
app.use(express.json());

app.get('/', (_req, res) => {
    res.status(200).send('VirtualLearningMetaverse Socket server is running');
});

app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.post('/api/livekit/token', async (req, res) => {
    try {
        const apiKey = process.env.LIVEKIT_API_KEY;
        const apiSecret = process.env.LIVEKIT_API_SECRET;
        const livekitUrl = process.env.LIVEKIT_URL || 'ws://localhost:7880';

        if (!apiKey || !apiSecret) {
            res.status(503).json({
                success: false,
                message: 'LiveKit credentials are not configured on the server.'
            });
            return;
        }

        const { roomName, participantName, participantId, role } = req.body || {};
        const safeRoomName = String(roomName || 'default-classroom').slice(0, 120);
        const safeParticipantName = String(participantName || 'Guest').slice(0, 80);
        const safeParticipantId = String(participantId || `${safeParticipantName}-${Date.now()}`).slice(0, 120);

        const token = new AccessToken(apiKey, apiSecret, {
            identity: safeParticipantId,
            name: safeParticipantName,
            ttl: '2h',
            metadata: JSON.stringify({ role: role || 'student' })
        });

        token.addGrant({
            room: safeRoomName,
            roomJoin: true,
            canPublish: true,
            canSubscribe: true,
            canPublishData: true
        });

        res.status(200).json({
            success: true,
            data: {
                token: await token.toJwt(),
                url: livekitUrl,
                roomName: safeRoomName
            }
        });
    } catch (error) {
        console.error('LiveKit token error:', error);
        res.status(500).json({ success: false, message: 'Could not create LiveKit token.' });
    }
});

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: (origin, callback) => {
            if (isAllowedOrigin(origin)) {
                callback(null, true);
                return;
            }

            callback(new Error(`Socket CORS blocked for origin: ${origin}`));
        },
        methods: ['GET', 'POST']
    }
});

// Store active classrooms and participants
const classrooms = new Map();
const avatarPositions = new Map(); // Map<classroomId, Map<socketId, {position, rotation}>>
const breakoutSessions = new Map(); // Map<sessionId, Map<socketId, participantData>>
const classroomPolls = new Map(); // Map<classroomId, Array of polls>
const pollResponses = new Map(); // Map<pollId, Map<userId, response>>
const classroomWhiteboards = new Map(); // Map<classroomId, Array<stroke>>
const classroomWhiteboardPermissions = new Map(); // Map<classroomId, { studentsCanWrite: boolean }>
const classroomViewModes = new Map(); // Map<classroomId, 'video' | 'metaverse'>
const waitingRooms = new Map(); // Map<classroomId, Map<socketId, request>>
const privateChatHistories = new Map(); // Map<classroomId:sortedUserPair, Array<message>>

function getDefaultAvatarPosition(role, index) {
    if (role === 'instructor') {
        return { position: { x: -4.8, y: 1.6, z: -6.6 }, rotation: { x: 0, y: 0, z: 0 } };
    }

    const seats = [
        { x: -6, z: 4.8 }, { x: -2, z: 4.8 }, { x: 2, z: 4.8 }, { x: 6, z: 4.8 },
        { x: -6, z: 1.6 }, { x: -2, z: 1.6 }, { x: 2, z: 1.6 }, { x: 6, z: 1.6 },
        { x: -6, z: -1.6 }, { x: -2, z: -1.6 }, { x: 2, z: -1.6 }, { x: 6, z: -1.6 }
    ];
    const seat = seats[index % seats.length];
    return { position: { x: seat.x, y: 1.6, z: seat.z }, rotation: { x: 0, y: 0, z: 0 } };
}

function ensureAvatarPosition(classroomId, socketId, role, index = 0) {
    if (!avatarPositions.has(classroomId)) {
        avatarPositions.set(classroomId, new Map());
    }
    const classroomAvatars = avatarPositions.get(classroomId);
    if (!classroomAvatars.has(socketId)) {
        classroomAvatars.set(socketId, getDefaultAvatarPosition(role, index));
    }
}

function buildAvatarsData(classroomId) {
    const classroom = classrooms.get(classroomId);
    const classroomAvatars = avatarPositions.get(classroomId);
    if (!classroom || !classroomAvatars) return [];

    const avatarsData = [];
    classroomAvatars.forEach((avatarData, socketId) => {
        const participant = classroom.get(socketId);
        if (participant) {
            avatarsData.push({
                id: participant.id,
                name: participant.name,
                role: participant.role,
                isAudioMuted: participant.isAudioMuted,
                hasRaisedHand: participant.hasRaisedHand,
                isScreenSharing: participant.isScreenSharing,
                position: avatarData.position,
                rotation: avatarData.rotation
            });
        }
    });
    return avatarsData;
}

function getWhiteboardPermission(classroomId) {
    if (!classroomWhiteboardPermissions.has(classroomId)) {
        classroomWhiteboardPermissions.set(classroomId, { studentsCanWrite: false });
    }
    return classroomWhiteboardPermissions.get(classroomId);
}

function getPollsForClassroom(classroomId) {
    return classroomPolls.get(classroomId) || [];
}

function findClassroomByPollId(pollId) {
    for (const [classroomId, polls] of classroomPolls.entries()) {
        if (polls.some(poll => poll.id === pollId)) {
            return classroomId;
        }
    }
    return null;
}

function getWaitingRoom(classroomId) {
    if (!waitingRooms.has(classroomId)) {
        waitingRooms.set(classroomId, new Map());
    }
    return waitingRooms.get(classroomId);
}

function addParticipantToClassroom(socket, { classroomId, userName, role }) {
    socket.join(classroomId);
    socket.leave(`waiting:${classroomId}`);

    if (!classrooms.has(classroomId)) {
        classrooms.set(classroomId, new Map());
    }

    const classroom = classrooms.get(classroomId);
    classroom.set(socket.id, {
        id: socket.id,
        name: userName,
        role,
        isAudioMuted: false,
        isVideoOff: false,
        hasRaisedHand: false,
        isScreenSharing: false
    });

    ensureAvatarPosition(classroomId, socket.id, role, classroom.size - 1);

    io.to(classroomId).emit('user-joined', {
        userId: socket.id,
        userName,
        participants: Array.from(classroom.values())
    });

    const existingPolls = getPollsForClassroom(classroomId);
    if (existingPolls.length > 0) {
        socket.emit('existing-polls', existingPolls);
    }

    socket.emit('whiteboard-permission-state', {
        classroomId,
        studentsCanWrite: getWhiteboardPermission(classroomId).studentsCanWrite
    });

    socket.emit('classroom-view-mode-changed', {
        classroomId,
        mode: classroomViewModes.get(classroomId) || 'video',
        controlledBy: 'server-state'
    });

    io.to(classroomId).emit('avatars-updated', {
        avatars: buildAvatarsData(classroomId)
    });
}

function notifyTeachersOfWaitingRoom(classroomId) {
    const waiting = Array.from(getWaitingRoom(classroomId).values());
    io.to(classroomId).emit('admission-requests-state', { classroomId, requests: waiting });
}

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a classroom. Teachers enter directly; students wait until admitted.
    socket.on('join-classroom', ({ classroomId, userName, role }) => {
        const normalizedRole = role === 'instructor' ? 'instructor' : 'student';

        // Teachers/instructors enter directly and receive current waiting list.
        if (normalizedRole === 'instructor') {
            addParticipantToClassroom(socket, { classroomId, userName, role: normalizedRole });
            notifyTeachersOfWaitingRoom(classroomId);
            console.log(`${userName} joined classroom ${classroomId} as instructor`);
            return;
        }

        // Students go to waiting room first, like Google Meet.
        const request = {
            id: socket.id,
            socketId: socket.id,
            classroomId,
            userName: userName || 'Student',
            role: 'student',
            requestedAt: Date.now()
        };

        socket.join(`waiting:${classroomId}`);
        socket.data.pendingAdmission = request;
        getWaitingRoom(classroomId).set(socket.id, request);

        socket.emit('waiting-room-status', {
            classroomId,
            status: 'waiting',
            message: 'Waiting for teacher to let you in...'
        });

        notifyTeachersOfWaitingRoom(classroomId);
        console.log(`${request.userName} is waiting for admission to ${classroomId}`);
    });

    socket.on('admit-student', ({ classroomId, studentSocketId }) => {
        const classroom = classrooms.get(classroomId);
        const teacher = classroom?.get(socket.id);
        if (!teacher || teacher.role !== 'instructor') {
            socket.emit('admission-error', { message: 'Only the teacher can admit students.' });
            return;
        }

        const waitingRoom = getWaitingRoom(classroomId);
        const request = waitingRoom.get(studentSocketId);
        const studentSocket = io.sockets.sockets.get(studentSocketId);
        if (!request || !studentSocket) {
            waitingRoom.delete(studentSocketId);
            notifyTeachersOfWaitingRoom(classroomId);
            return;
        }

        waitingRoom.delete(studentSocketId);
        addParticipantToClassroom(studentSocket, {
            classroomId,
            userName: request.userName,
            role: 'student'
        });

        studentSocket.emit('admission-approved', { classroomId });
        notifyTeachersOfWaitingRoom(classroomId);
        console.log(`${request.userName} admitted to ${classroomId}`);
    });

    socket.on('reject-student', ({ classroomId, studentSocketId }) => {
        const classroom = classrooms.get(classroomId);
        const teacher = classroom?.get(socket.id);
        if (!teacher || teacher.role !== 'instructor') {
            socket.emit('admission-error', { message: 'Only the teacher can reject students.' });
            return;
        }

        const waitingRoom = getWaitingRoom(classroomId);
        const request = waitingRoom.get(studentSocketId);
        const studentSocket = io.sockets.sockets.get(studentSocketId);
        waitingRoom.delete(studentSocketId);

        if (studentSocket) {
            studentSocket.emit('admission-rejected', {
                classroomId,
                message: 'Teacher did not admit you to this classroom.'
            });
            studentSocket.leave(`waiting:${classroomId}`);
        }

        notifyTeachersOfWaitingRoom(classroomId);
        console.log(`${request?.userName || studentSocketId} rejected from ${classroomId}`);
    });


    // Send chat message
    socket.on('send-message', ({ classroomId, message, senderName }) => {
        const chatMessage = {
            id: Date.now().toString(),
            senderId: socket.id,
            senderName: senderName,
            message: message,
            timestamp: new Date()
        };
        
        io.to(classroomId).emit('receive-message', chatMessage);
    });

    // Send one-to-one private classroom message
    socket.on('send-private-message', ({ classroomId, targetUserId, message, senderName }) => {
        const classroom = classrooms.get(classroomId);
        const sender = classroom?.get(socket.id);
        const recipient = classroom?.get(targetUserId);

        if (!classroom || !sender || !recipient) {
            socket.emit('private-message-error', { message: 'Private message failed. User is no longer in this classroom.' });
            return;
        }

        const trimmedMessage = typeof message === 'string' ? message.trim() : '';
        if (!trimmedMessage) return;

        const privateMessage = {
            id: `pm-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
            classroomId,
            senderId: socket.id,
            senderName: senderName || sender.name,
            recipientId: targetUserId,
            recipientName: recipient.name,
            message: trimmedMessage.slice(0, 2000),
            timestamp: new Date(),
            isPrivate: true
        };

        const historyKey = getPrivateChatHistoryKey(classroomId, socket.id, targetUserId);
        const history = privateChatHistories.get(historyKey) || [];
        history.push(privateMessage);
        privateChatHistories.set(historyKey, history.slice(-500));

        socket.emit('receive-private-message', privateMessage);
        io.to(targetUserId).emit('receive-private-message', privateMessage);
    });

    socket.on('private-chat-history', ({ classroomId, peerId }) => {
        const classroom = classrooms.get(classroomId);
        if (!classroom || !classroom.has(socket.id) || !classroom.has(peerId)) return;

        const historyKey = getPrivateChatHistoryKey(classroomId, socket.id, peerId);
        socket.emit('private-chat-history', {
            classroomId,
            peerId,
            messages: privateChatHistories.get(historyKey) || []
        });
    });

    // Teacher can force everyone into/out of 3D classroom mode.
    socket.on('set-classroom-view-mode', ({ classroomId, mode }) => {
        const classroom = classrooms.get(classroomId);
        const participant = classroom?.get(socket.id);

        if (!participant || participant.role !== 'instructor') {
            socket.emit('classroom-view-mode-error', { message: 'Only the teacher can control everyone\'s classroom view.' });
            return;
        }

        const safeMode = mode === 'metaverse' ? 'metaverse' : 'video';
        classroomViewModes.set(classroomId, safeMode);
        io.to(classroomId).emit('classroom-view-mode-changed', {
            classroomId,
            mode: safeMode,
            controlledBy: socket.id
        });
    });

    // ============================================
    // REAL-TIME WHITEBOARD EVENTS
    // ============================================
    socket.on('whiteboard-request-state', ({ classroomId }) => {
        const strokes = classroomWhiteboards.get(classroomId) || [];
        socket.emit('whiteboard-state', { classroomId, strokes });
        socket.emit('whiteboard-permission-state', {
            classroomId,
            studentsCanWrite: getWhiteboardPermission(classroomId).studentsCanWrite
        });
    });

    socket.on('whiteboard-set-permission', ({ classroomId, studentsCanWrite }) => {
        const classroom = classrooms.get(classroomId);
        const participant = classroom?.get(socket.id);

        if (!participant || participant.role !== 'instructor') {
            socket.emit('whiteboard-error', { message: 'Only the teacher can control whiteboard permissions.' });
            return;
        }

        const permission = { studentsCanWrite: Boolean(studentsCanWrite) };
        classroomWhiteboardPermissions.set(classroomId, permission);
        io.to(classroomId).emit('whiteboard-permission-state', { classroomId, ...permission });
    });

    socket.on('whiteboard-stroke', ({ classroomId, stroke }) => {
        const classroom = classrooms.get(classroomId);
        const participant = classroom?.get(socket.id);
        if (!classroom || !participant || !stroke) return;

        const permission = getWhiteboardPermission(classroomId);
        if (participant.role !== 'instructor' && !permission.studentsCanWrite) {
            socket.emit('whiteboard-error', { message: 'The teacher has locked student writing on the board.' });
            return;
        }

        const safeStroke = {
            ...stroke,
            classroomId,
            userId: socket.id,
            userName: participant.name,
            createdAt: Date.now(),
            points: Array.isArray(stroke.points) ? stroke.points.slice(0, 5000) : []
        };

        const strokes = classroomWhiteboards.get(classroomId) || [];
        strokes.push(safeStroke);
        classroomWhiteboards.set(classroomId, strokes.slice(-2000)); // Memory safety for prototype gateway

        // Broadcast to everyone including sender so 3D board textures update everywhere.
        io.to(classroomId).emit('whiteboard-stroke', safeStroke);
    });

    socket.on('whiteboard-clear', ({ classroomId }) => {
        const classroom = classrooms.get(classroomId);
        const participant = classroom?.get(socket.id);

        if (!participant || participant.role !== 'instructor') {
            socket.emit('whiteboard-error', { message: 'Only the instructor can clear the whiteboard.' });
            return;
        }

        classroomWhiteboards.set(classroomId, []);
        io.to(classroomId).emit('whiteboard-cleared', { classroomId, clearedBy: socket.id });
    });

    socket.on('avatar-move', ({classroomId, position, rotation}) => {
        const classroom = classrooms.get(classroomId);
        if (!classroom || !classroom.has(socket.id)) return;

        if(!avatarPositions.has(classroomId)){
            avatarPositions.set(classroomId,new Map());
        }
        const classroomAvatars = avatarPositions.get(classroomId);
        classroomAvatars.set(socket.id,{position,rotation});

        // Broadcast to other users only. The sender already knows their own position.
        socket.to(classroomId).emit('avatars-updated',{
            avatars: buildAvatarsData(classroomId)
        });
    });


    // WebRTC Signaling - Relay offer/answer/ICE candidates between peers
    // CONCEPT: Server doesn't handle media, just coordinates peer connection setup
    socket.on('webrtc-offer',({classroomId,targetPeerId,signal})=>{
        // console.log(`Relaying WebRTC offer from ${socket.id} to ${targetPeerId}`);
        io.to(targetPeerId).emit('webrtc-offer',{
            peerId: socket.id,
            signal: signal
        });
    });

    socket.on('webrtc-answer',({classroomId,targetPeerId,signal})=>{
        // console.log(`Relaying WebRTC answer from ${socket.id} to ${targetPeerId}`);
        io.to(targetPeerId).emit('webrtc-answer',{
            peerId: socket.id,
            signal: signal
        });
    });

    socket.on('webrtc-ice-candidate',({classroomId,targetPeerId,signal})=>{
        // ICE candidates can be very noisy; do not log every candidate in production/dev performance mode.
        io.to(targetPeerId).emit('webrtc-ice-candidate',{
            peerId: socket.id,
            signal: signal
        });
    });

    // Raise hand
    socket.on('raise-hand', ({ classroomId, hasRaised }) => {
        const classroom = classrooms.get(classroomId);
        if (classroom && classroom.has(socket.id)) {
            const participant = classroom.get(socket.id);
            participant.hasRaisedHand = hasRaised;
            
            io.to(classroomId).emit('hand-raised', {
                userId: socket.id,
                hasRaised: hasRaised,
                participants: Array.from(classroom.values())
            });
            io.to(classroomId).emit('avatars-updated', { avatars: buildAvatarsData(classroomId) });
        }
    });

    socket.on('user-typing',({classroomId,userName})=>{
        socket.to(classroomId).emit('typing',{
            userName:userName
        });
    });

    socket.on('stop-typing',({classroomId,userName})=>{
        socket.to(classroomId).emit('stop-typing',{
            userName:userName
        });
    });

    // Mute/unmute audio
    socket.on('toggle-audio', ({ classroomId, isMuted }) => {
        const classroom = classrooms.get(classroomId);
        if (classroom && classroom.has(socket.id)) {
            const participant = classroom.get(socket.id);
            participant.isAudioMuted = isMuted;
            
            io.to(classroomId).emit('audio-toggled', {
                userId: socket.id,
                isMuted: isMuted,
                participants: Array.from(classroom.values())
            });
            io.to(classroomId).emit('avatars-updated', { avatars: buildAvatarsData(classroomId) });
        }
    });

    // Toggle video
    socket.on('toggle-video', ({ classroomId, isOff }) => {
        const classroom = classrooms.get(classroomId);
        if (classroom && classroom.has(socket.id)) {
            const participant = classroom.get(socket.id);
            participant.isVideoOff = isOff;
            
            io.to(classroomId).emit('video-toggled', {
                userId: socket.id,
                isOff: isOff,
                participants: Array.from(classroom.values())
            });
        }
    });

    socket.on('toggle-mute-all', ({ classroomId, shouldMute }) => {
        const classroom = classrooms.get(classroomId);
        if (classroom && classroom.get(socket.id)?.role === 'instructor') {
            classroom.forEach((participant) => {
                if (participant.role === 'student') {
                    participant.isAudioMuted = shouldMute;
                }
            });
            
            io.to(classroomId).emit('audio-toggled', {
                userId: shouldMute ? null : 'unmute-all',
                isMuted: shouldMute,
                participants: Array.from(classroom.values())
            });
        }
    });

   

    socket.on('remove-participant', ({ classroomId, participantId }) => {
        const classroom = classrooms.get(classroomId);
        if (classroom && classroom.get(socket.id)?.role === 'instructor') {
            let targetSocketId = null;
            classroom.forEach((participant, socketId) => {
                if(participant.id === participantId){
                    targetSocketId = socketId;
                }
            }); 
            if (targetSocketId) {
                io.to(targetSocketId).emit('force-disconnect');
                classroom.delete(targetSocketId);
                io.to(classroomId).emit('user-left', {
                    participants: Array.from(classroom.values())
                });
            }
        }
    });

    // STEP-BY-STEP: Handle leave classroom event
    socket.on('leave-classroom', ({ classroomId }) => {
        console.log('User leaving classroom:', socket.id, classroomId);
        
        // STEP 1: Get the classroom from our Map
        const classroom = classrooms.get(classroomId);
        if (!classroom) return; // If classroom doesn't exist, exit
        
        // STEP 2: Get participant info before removing
        const participant = classroom.get(socket.id);
        
        // STEP 3: Remove participant from classroom Map
        classroom.delete(socket.id);
        
        // STEP 4: Tell everyone else in the room that user left
        io.to(classroomId).emit('user-left', {
            userId: socket.id,
            userName: participant?.name || 'Unknown',
            participants: Array.from(classroom.values())
        });
        
        // STEP 5: Remove socket from the room
        socket.leave(classroomId);
        
        console.log(`${participant?.name} left classroom ${classroomId}`);
    });

    // STEP-BY-STEP: Handle screen share event
    socket.on('screen-share', ({ classroomId, isSharing }) => {
        console.log('📥 STEP 3: Server received screen-share event:', { classroomId, isSharing, socketId: socket.id });
        
        // STEP 1: Get the classroom from our Map
        const classroom = classrooms.get(classroomId);
        console.log('📋 STEP 4: Classroom found?', classroom ? 'YES' : 'NO');

        // STEP 2: Update participant's screen share status
        if (classroom && classroom.has(socket.id)) {
            const participant = classroom.get(socket.id);
            participant.isScreenSharing = isSharing;
            console.log('✅ STEP 5: Updated participant:', participant);

            // STEP 3: Tell everyone in the room
            io.to(classroomId).emit('screen-share-updated', {
                userId: socket.id,
                isSharing: isSharing,
                participants: Array.from(classroom.values())
            });
            console.log('📢 STEP 6: Broadcasted to room:', classroomId);
        } else {
            console.log('❌ ERROR: Classroom or participant not found!');
        }
        
        console.log(`Screen sharing ${isSharing ? 'started' : 'stopped'} by ${socket.id}`);
    });

    socket.on('create-breakout-rooms',({classroomId,session})=>{
        console.log(`📝 Creating breakout rooms in ${classroomId}`);
        breakoutSessions.set(classroomId, session);  // Store full session object
        io.to(classroomId).emit('breakout-rooms-created',{
            session
        });
         console.log(`✅ Created ${session.rooms.length} rooms`);
    });

    socket.on('join-breakout-room',({classroomId, roomId, userId})=>{
        console.log(`➡️ User ${userId} joining breakout room ${roomId} in classroom ${classroomId}`);
        const session = breakoutSessions.get(classroomId);
        if(!session){
            console.log('❌ ERROR: No breakout session found!');
            return;
        }
        const room = session.rooms.find(r=>r.id===roomId);
        if(!room){
            console.log('❌ ERROR: No such breakout room found!');
            return;
        }
        
        console.log(`📋 Room ${roomId} participants BEFORE join:`, room.participants);
        
        if(!room.participants.includes(userId)){
            room.participants.push(userId);
        }
        
        console.log(`📋 Room ${roomId} participants AFTER join:`, room.participants);
        
        socket.leave(classroomId);
        socket.join(roomId);
        
        const peerIds = room.participants.filter(id=>id!==userId);
        console.log(`📨 Sending room-peers-list to ${userId} with peerIds:`, peerIds);
        
        socket.emit('room-peers-list',{
            peerIds,
            roomId
        });
        
        console.log(`📢 Broadcasting user-joined-room to room ${roomId} (except ${userId})`);
        socket.to(roomId).emit('user-joined-room',{
            userId,
            roomId
        });
        
       breakoutSessions.set(classroomId,session);
       
       // Broadcast updated session to ALL users in the classroom
       io.to(classroomId).emit('breakout-session-updated', { session });
       
        console.log(`✅ User ${userId} joined breakout room ${roomId}`);
    });

    socket.on('leave-breakout-room',({classroomId, roomId, userId})=>{
        console.log(`⬅️ User ${userId} leaving breakout room ${roomId} in classroom ${classroomId}`);
        const session = breakoutSessions.get(classroomId);
        if(!session){
            console.log('❌ ERROR: No breakout session found!');
            return;
        }
        const room = session.rooms.find(r=>r.id===roomId);
        if(room){
            room.participants = room.participants.filter(id=>id!==userId);
            socket.leave(room.id);
            socket.to(room.id).emit('user-left-room',{
                userId,
                roomId: room.id
            });
        }
        socket.join(classroomId);
        breakoutSessions.set(classroomId,session);
        
        // Broadcast updated session to ALL users in the classroom
        io.to(classroomId).emit('breakout-session-updated', { session });
        
        console.log(`✅ User ${userId} left breakout room ${roomId}`);
    });

    socket.on('close-breakout-rooms',({classroomId})=>{
        console.log(`🔒 Closing breakout rooms in classroom ${classroomId}`);
        const session = breakoutSessions.get(classroomId);
        if(!session){
            console.log('❌ ERROR: No breakout session found!');
            return;
        }
        session.rooms.forEach(room=>{
            room.participants.forEach(userId=>{
                const participantSocket = Array.from(io.sockets.sockets.values()).find(s=>s.id===userId);
                if(participantSocket){
                    participantSocket.leave(room.id);
                    participantSocket.join(classroomId);
                }
            });
        });
        breakoutSessions.delete(classroomId);
        
        // Notify everyone that rooms are closed
        io.to(classroomId).emit('breakout-rooms-closed');
        
        // Get all participants back in main classroom
        const classroom = classrooms.get(classroomId);
        if(classroom) {
            const participantsList = Array.from(classroom.values());
            // Tell each user who else is back in the main room
            participantsList.forEach(participant => {
                io.to(participant.id).emit('main-room-participants', {
                    participants: participantsList.filter(p => p.id !== participant.id).map(p => p.id)
                });
            });
        }
        
        console.log(`✅ Closed breakout rooms in classroom ${classroomId}`);
    });

    socket.on('braodcast-to-breakout-room',({classroomId, roomId, message})=>{
        const session = breakoutSessions.get(classroomId);
        if(!session){
            console.log('❌ ERROR: No breakout session found!');
            return;
        }
        session.rooms.forEach(room=>{
            if(room.id===roomId){
                room.participants.forEach(userId=>{
                    io.to(userId).emit('breakout-room-message',{
                        roomId,
                        message
                    });
                });
            }
        });
    });

    // ============================================
// POLL EVENTS
// ============================================
socket.on('create-poll', (pollData) => {
    console.log('📊 Creating poll:', pollData);
    
    // 1. Generate unique poll ID
    const pollId = `poll-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // 2. Build complete poll object
    const poll = {
        id: pollId,
        ...pollData,
        createdAt: Date.now() // Server timestamp
    };
    
    // 3. Store in memory
    const classroomId = pollData.classroomId;
    const existingPolls = classroomPolls.get(classroomId) || [];
    existingPolls.push(poll);
    classroomPolls.set(classroomId, existingPolls);
    
    // 4. Initialize empty responses array for this poll
    pollResponses.set(pollId, []);
    
    // 5. Broadcast to entire classroom
    io.to(classroomId).emit('poll-created', poll);
    
    console.log(`✅ Poll ${pollId} created and broadcast to ${classroomId}`);
});

socket.on('submit-poll-response', (responseData) => {
    console.log('🗳️ Received vote:', responseData);
    
    const { pollId, userId, userName, selectedOptionIds, timestamp } = responseData;
    
    // 1. CHECK FOR DUPLICATE VOTE (CRITICAL!)
    const existingResponses = pollResponses.get(pollId) || [];
    const hasAlreadyVoted = existingResponses.some(r => r.userId === userId);
    
    if (hasAlreadyVoted) {
        console.log(`❌ User ${userId} already voted on poll ${pollId}`);
        socket.emit('vote-error', { message: 'You have already voted on this poll' });
        return;
    }
    
    // 2. STORE RESPONSE
    const response = {
        pollId,
        userId,
        userName,
        selectedOptionIds,
        timestamp: Date.now() // Server timestamp
    };
    existingResponses.push(response);
    pollResponses.set(pollId, existingResponses);
    
    // 3. FIND CLASSROOM AND UPDATE POLL VOTE COUNTS
    const classroomId = findClassroomByPollId(pollId);
    if (!classroomId) {
        console.log('❌ Classroom not found for poll');
        return;
    }
    
    const polls = classroomPolls.get(classroomId) || [];
    const poll = polls.find(p => p.id === pollId);
    
    if (poll) {
        // Increment voteCount for each selected option
        selectedOptionIds.forEach(optionId => {
            const option = poll.options.find(opt => opt.id === optionId);
            if (option) {
                option.voteCount = (option.voteCount || 0) + 1;
            }
        });
        
        // Update poll in storage
        classroomPolls.set(classroomId, polls);
        
        // 4. BROADCAST UPDATED POLL
        io.to(classroomId).emit('poll-updated', poll);
        
        console.log(`✅ Vote recorded. Poll ${pollId} now has ${existingResponses.length} responses`);
    }
});

socket.on('close-poll', ({ pollId }) => {
    console.log('🔒 Closing poll:', pollId);
    
    // 1. FIND THE POLL
    const classroomId = findClassroomByPollId(pollId);
    if (!classroomId) {
        console.log('❌ Poll not found');
        return;
    }
    
    const polls = classroomPolls.get(classroomId) || [];
    const poll = polls.find(p => p.id === pollId);
    
    if (!poll) {
        console.log('❌ Poll not found in classroom');
        return;
    }
    
    // 2. MARK AS INACTIVE
    poll.isActive = false;
    classroomPolls.set(classroomId, polls);
    
    // 3. CALCULATE RESULTS
    const responses = pollResponses.get(pollId) || [];
    const totalResponses = responses.length;
    
    const results = {
        pollId,
        totalResponses,
        optionResults: poll.options.map(option => ({
            optionId: option.id,
            text: option.text,
            voteCount: option.voteCount || 0,
            percentage: totalResponses > 0 
                ? Math.round((option.voteCount || 0) / totalResponses * 100) 
                : 0
        })),
        respondedUserIds: responses.map(r => r.userId)
    };
    
    // 4. BROADCAST CLOSURE
    io.to(classroomId).emit('poll-closed', { poll, results });
    
    console.log(`✅ Poll ${pollId} closed with ${totalResponses} responses`);
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function getWhiteboardPermission(classroomId) {
  if (!classroomWhiteboardPermissions.has(classroomId)) {
    // Default: students can watch the board, teacher controls writing.
    classroomWhiteboardPermissions.set(classroomId, { studentsCanWrite: false });
  }
  return classroomWhiteboardPermissions.get(classroomId);
}

function getPrivateChatHistoryKey(classroomId, userA, userB) {
  return `${classroomId}:${[userA, userB].sort().join(':')}`;
}

/**
 * Find which classroom a poll belongs to
 * @param {string} pollId 
 * @returns {string|null} classroomId or null if not found
 */
function findClassroomByPollId(pollId) {
  for (const [classroomId, polls] of classroomPolls.entries()) {
    if (polls.some(poll => poll.id === pollId)) {
      return classroomId;
    }
  }
  return null;
}

/**
 * Get all polls for a classroom
 * @param {string} classroomId 
 * @returns {Array} Array of polls
 */
function getPollsForClassroom(classroomId) {
  return classroomPolls.get(classroomId) || [];
}

/**
 * Check if user has voted on a poll
 * @param {string} pollId 
 * @param {string} userId 
 * @returns {boolean}
 */
function hasUserVoted(pollId, userId) {
  const responses = pollResponses.get(pollId) || [];
  return responses.some(r => r.userId === userId);
}



    // Disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);

        const pendingAdmission = socket.data.pendingAdmission;
        if (pendingAdmission?.classroomId) {
            getWaitingRoom(pendingAdmission.classroomId).delete(socket.id);
            notifyTeachersOfWaitingRoom(pendingAdmission.classroomId);
        }
        
        // Remove from all classrooms
        classrooms.forEach((classroom, classroomId) => {
            if (classroom.has(socket.id)) {
                const participant = classroom.get(socket.id);
                classroom.delete(socket.id);

                 //cleanup avatar positions
        avatarPositions.forEach((classroomAvatars, classroomId) => {
            if(classroomAvatars.has(socket.id)){
                classroomAvatars.delete(socket.id);
            }
        });
                
                io.to(classroomId).emit('user-left', {
                    userId: socket.id,
                    userName: participant.name,
                    participants: Array.from(classroom.values())
                });
            }
        });
    });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`Socket.io server running on port ${PORT}`);
    console.log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);
});