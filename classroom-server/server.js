const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});

// Store active classrooms and participants
const classrooms = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a classroom
    socket.on('join-classroom', ({ classroomId, userName, role }) => {
        socket.join(classroomId);
        
        // Add participant to classroom
        if (!classrooms.has(classroomId)) {
            classrooms.set(classroomId, new Map());
        }
        
        const classroom = classrooms.get(classroomId);
        classroom.set(socket.id, {
            id: socket.id,
            name: userName,
            role: role,
            isAudioMuted: false,
            isVideoOff: false,
            hasRaisedHand: false,
            isScreenSharing: false // Initialize screen sharing as false
        });

        // Notify all users in classroom
        io.to(classroomId).emit('user-joined', {
            userId: socket.id,
            userName: userName,
            participants: Array.from(classroom.values())
        });

        console.log(`${userName} joined classroom ${classroomId}`);
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

    // Disconnect
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        
        // Remove from all classrooms
        classrooms.forEach((classroom, classroomId) => {
            if (classroom.has(socket.id)) {
                const participant = classroom.get(socket.id);
                classroom.delete(socket.id);
                
                io.to(classroomId).emit('user-left', {
                    userId: socket.id,
                    userName: participant.name,
                    participants: Array.from(classroom.values())
                });
            }
        });
    });
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Socket.io server running on http://localhost:${PORT}`);
});