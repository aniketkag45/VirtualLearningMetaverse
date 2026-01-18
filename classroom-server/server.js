const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { create } = require('domain');

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
const avatarPositions = new Map(); // Map<classroomId, Map<socketId, {position, rotation}>>
const breakoutSessions = new Map(); // Map<sessionId, Map<socketId, participantData>>
const classroomPolls = new Map(); // Map<classroomId, Array of polls>
const pollResponses = new Map(); // Map<pollId, Map<userId, response>>

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

        // SEND EXISTING POLLS TO NEW JOINER
        const existingPolls = getPollsForClassroom(classroomId);
        if (existingPolls.length > 0) {
            socket.emit('existing-polls', existingPolls);
            console.log(`📊 Sent ${existingPolls.length} existing polls to ${userName}`);
        }

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

    socket.on('avatar-move', ({classroomId, position, rotation}) => {
        const classroom = classrooms.get(classroomId);
        if (!classrooms.has(classroomId)) return;

        if(classroom){
            //store avatar position
            if(!avatarPositions.has(classroomId)){
                avatarPositions.set(classroomId,new Map());
            }
            const classroomAvatars = avatarPositions.get(classroomId);
            classroomAvatars.set(socket.id,{position,rotation});

            //build avatar data with participant info
            const avatarsData = [];
            classroomAvatars.forEach((avatarData,socketId)=>{
                const participant = classroom.get(socketId);
                if(participant){
                    avatarsData.push({
                        id: participant.id,
                        name: participant.name,
                        position: avatarData.position,
                        rotation: avatarData.rotation
                    });
                }
            });
            //broadcast to others
            io.to(classroomId).emit('avatars-updated',{
                avatars:avatarsData
            });
        }
    });

    // WebRTC Signaling - Relay offer/answer/ICE candidates between peers
    // CONCEPT: Server doesn't handle media, just coordinates peer connection setup
    socket.on('webrtc-offer',({classroomId,targetPeerId,signal})=>{
        console.log(`Relaying WebRTC offer from ${socket.id} to ${targetPeerId}`);
        io.to(targetPeerId).emit('webrtc-offer',{
            peerId: socket.id,
            signal: signal
        });
    });

    socket.on('webrtc-answer',({classroomId,targetPeerId,signal})=>{
        console.log(`Relaying WebRTC answer from ${socket.id} to ${targetPeerId}`);
        io.to(targetPeerId).emit('webrtc-answer',{
            peerId: socket.id,
            signal: signal
        });
    });

    socket.on('webrtc-ice-candidate',({classroomId,targetPeerId,signal})=>{
        console.log(`Relaying ICE candidate from ${socket.id} to ${targetPeerId}`);
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

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Socket.io server running on http://localhost:${PORT}`);
});