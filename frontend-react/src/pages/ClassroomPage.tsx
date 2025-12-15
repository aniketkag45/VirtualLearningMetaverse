import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, Monitor, Hand, PhoneOff,X } from 'lucide-react';
import { Participant, ChatMessage } from '../types/classroom';
import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../stores/useAuthStore';
import toast, { Toaster } from 'react-hot-toast';

const playSound = (soundType: 'join' | 'leave' | 'message'|'notification') => {
    const frequencies : { [key: string]: number } = {
        join: 800,
        leave: 400,
        message: 600,
        notification: 1000
    };

    try{
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

          oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = frequencies[soundType];
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
        console.log('Audio not supported');
    }
};
    

const ClassroomPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    
    // State
    const [isMuted, setIsMuted] = useState(false);
    const [isForceMuted, setIsForceMuted] = useState(false); // Add this line
    const [areAllStudentsMuted, setAreAllStudentsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [hasRaisedHand, setHasRaisedHand] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [messageInput, setMessageInput] = useState('');
    const [activeTab, setActiveTab] = useState<'chat' | 'participants'>('chat');
    const [selectedParticipant, setSelectedParticipant] = useState<string | null>(null);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [sessionDuration, setSessionDuration] = useState(0);
     const [participants, setParticipants] = useState<Participant[]>([]);
    const [typingUsers, setTypingUsers] = useState<string[]>([]);
const participantsRef = useRef<Participant[]>([]);
useEffect(() => {
    participantsRef.current = participants;
}, [participants]);

    const socketRef = useRef<Socket | null>(null);
const { user } = useAuthStore();
const classroomId = courseId || 'default-classroom';


    const handleSendMessage = () => {
    if (messageInput.trim() && socketRef.current) {
        socketRef.current.emit('send-message', {
            classroomId: classroomId,
            message: messageInput,
            senderName: user?.name || 'Guest'
        });
        setMessageInput('');
    }
};

    // STEP-BY-STEP: Leave Classroom Handler
    const handleLeaveClassroom = () => {
        if (socketRef.current) {
            // STEP 1: Tell server we're leaving (so others get notified)
            socketRef.current.emit('leave-classroom', {
                classroomId: classroomId
            });
            
            // STEP 2: Disconnect our socket connection
            socketRef.current.disconnect();
            
            // STEP 3: Navigate back to dashboard
            navigate('/dashboard');
        }
    };

    const handleScreenShare = () => {
    const newState = !isScreenSharing; // Toggle the state
    console.log('🖥️ STEP 1: Button clicked! New state:', newState);
    setIsScreenSharing(newState);
    
    if (socketRef.current) {
        console.log('📤 STEP 2: Emitting to server:', { classroomId, isSharing: newState });
        socketRef.current.emit('screen-share', { // Event name
            classroomId: classroomId,
            isSharing: newState
        });
    } else {
        console.log('❌ ERROR: Socket not connected!');
    }
};

const handleToggleMic = () => {
    if(isForceMuted && isMuted) {
        toast.error('You have been muted by the instructor.', {
        icon: '🔇',
        duration: 3000,
    });
        return; // Prevent toggling if force muted
    }
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);

// If unmuting, clear force muted state
    if (!newMuteState) {
        setIsForceMuted(false);
    }


    if (socketRef.current) {
        socketRef.current.emit('toggle-audio', {
            classroomId: classroomId,
            isMuted: newMuteState
        });
    }
}

const handleToggleCamera = () => {
    const newVideoState = !isVideoOff;
    setIsVideoOff(newVideoState);
    if (socketRef.current) {
        socketRef.current.emit('toggle-video', {
            classroomId: classroomId,
            isOff: newVideoState
        });
    }
}

const handleToggleMuteAll = () => {
    if(user?.userType === 'teacher') {
        const newMuteAllState = !areAllStudentsMuted;
        socketRef.current?.emit('toggle-mute-all', {
            classroomId: classroomId,
            shouldMute: newMuteAllState
        });
        setAreAllStudentsMuted(newMuteAllState);

        toast.success(newMuteAllState ? 'All students have been muted.' : 'All students have been unmuted.', {
            icon: newMuteAllState ? '🔇' : '🔊',
            duration: 3000,
        });
    }
}

const handleRemoveParticipant = (participantId: string) => {
    if(user?.userType === 'teacher') {
        socketRef.current?.emit('remove-participant', {
            classroomId: classroomId,
            participantId: participantId
        });
    }
}

const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

const handleTyping = () => {
    if (socketRef.current) {
        socketRef.current.emit('user-typing', {
            classroomId: classroomId,
            userName: user?.name
        });
        
        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        // Auto stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            handleStopTyping();
        }, 2000);
    }
};

const handleStopTyping = () => {
    if (socketRef.current) {
        socketRef.current.emit('stop-typing', {
            classroomId: classroomId,
            userName: user?.name 
        });
    }
}

    // Connect to Socket.io server
useEffect(() => {
    socketRef.current = io('http://localhost:3001');
    
    // Join classroom
    socketRef.current.emit('join-classroom', {
        classroomId: classroomId,
        userName: user?.name || 'Guest',
        role: user?.userType === 'teacher' ? 'instructor' : 'student'
    });

    // Listen for new users
    socketRef.current.on('user-joined', ({ participants }) => {
        setParticipants(participants);
        const newParticipant = participants[participants.length - 1];
            if(newParticipant && newParticipant.id !== user?.id) {
                playSound('join');
                toast.success(`${newParticipant.name} has joined the classroom.`, {
                    icon: '👋',
                    duration: 3000,
                });
            }
        
    });

    // Listen for messages
    socketRef.current.on('receive-message', (message) => {
        setMessages((prev) => [...prev, message]);
        if(message.senderId !== user?.id)
            playSound('message');
    });

    // Listen for user leaving
    socketRef.current.on('user-left', ({ participants }) => {

        const leftParticipant = participantsRef.current.find(p => !participants.find((n: Participant) => n.id === p.id));
        setParticipants(participants);
       if(leftParticipant && leftParticipant.id !== user?.id) {
        playSound('leave');
        toast.error(`${leftParticipant.name} has left the classroom.`, {
            icon: '👋',
            duration: 3000,
        });
    }
    });

    socketRef.current.on('typing', ({ userName }) => {
        setTypingUsers((prev) => {
            if(!prev.includes(userName) && userName !== user?.name) {
                return [...prev, userName];
            }
            return prev;
        });
    });

    socketRef.current.on('stop-typing', ({ userName }) => {
        setTypingUsers((prev) => prev.filter(name => name !== userName));
    });

    // Listen for hand raised
    socketRef.current.on('hand-raised', ({ participants }) => {
        setParticipants(participants);
    });


    // Listen for screen share updates
    socketRef.current.on('screen-share-updated', ({ participants }) => {
        console.log('📺 Received screen-share-updated. Participants:', participants);
        setParticipants(participants);
    });

    //Listen for audio toggled
    socketRef.current.on('audio-toggled', ({ participants, userId }) => {
    console.log('🎤 Received audio-toggled. Participants:', participants);
    if (participants) {
        setParticipants(participants);
        // If instructor muted all (userId is null) and you're a student
        if (user?.userType === 'student' && userId === null) {
            setIsMuted(true);
            setIsForceMuted(true); // Set force muted state
            toast('You have been muted by the instructor.', {
                icon: '⚠️',
                duration: 3000,
            });
        }

        //if instructor unmuted all 
        if(user?.userType === 'student' && userId === 'unmute-all') {
            setIsMuted(false);
            setIsForceMuted(false); // Remove force muted state
            toast('You have been unmuted by the instructor.', {
                icon: '🔊',
                duration: 3000,
            });
        }
    } else {
        console.error('❌ ERROR: participants is undefined!');
    }
});



    //Listen for video toggled
    socketRef.current.on('video-toggled', ({ participants }) => {
        console.log('📹 Received video-toggled. Participants:', participants);
        if (participants) {
            setParticipants(participants);
        } else {
            console.error('❌ ERROR: participants is undefined!');
        }
    });

    socketRef.current.on('force-disconnect', () => {
            toast.error('You have been removed from the classroom by the instructor.',{
        icon: '🚫',
        duration: 4000,
            });
            setTimeout(() => {
            navigate('/dashboard');},2000);
        
    });

  

    // Cleanup on unmount
    return () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
    };
}, [classroomId, user?.name]);

  const formatDuration = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

useEffect(() => {
    const timer = setInterval(() => {
        setSessionDuration((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
}, []);
    return (
        <div className="h-screen bg-gray-900 flex flex-col">
            <Toaster position="top-right" />
            {/* Header */}
            <div className="bg-gray-800 text-white px-6 py-3 flex justify-between items-center">
                <h1 className="text-xl font-bold">Virtual Classroom - Course {courseId}</h1>
                <div className="flex items-center gap-4">
                    <span className="text-green-400">● Live</span>
                    <span className="text-gray-400">{participants?.length || 0} Participants</span>
                </div>
                 <div className="text-right">
        <p className="text-gray-400 text-sm">Session Duration</p>
        <p className="text-white font-mono text-lg">{formatDuration(sessionDuration)}</p>
    </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Video Area */}
                <div className="flex-1 p-4 overflow-y-auto">
                   {/* Instructor Video (Large) */}
{participants.filter(p => p.role === 'instructor').map((instructor) => (
    <div key={instructor.id} className="bg-gray-800 rounded-lg mb-4 aspect-video flex items-center justify-center relative">
        <div className="text-center">
            <Video className="w-16 h-16 text-gray-500 mx-auto mb-2" />
            <p className="text-white text-xl">{instructor.name}</p>
            <p className="text-gray-400 text-sm">Instructor</p>
            <div className="mt-2 flex gap-2 justify-center">
                {instructor.isAudioMuted ? (
                    <MicOff className="w-5 h-5 text-red-500" />
                ) : (
                    <Mic className="w-5 h-5 text-green-500" />
                )}
                {instructor.isVideoOff ? (
                    <VideoOff className="w-5 h-5 text-red-500" />
                ) : (
                    <Video className="w-5 h-5 text-green-500" />
                )}
            </div>
        </div>
        {instructor.hasRaisedHand && (
            <div className="absolute top-2 right-2 bg-yellow-500 rounded-full p-2">
                <Hand className="w-6 h-6 text-white" />
            </div>
        )}
        {instructor.isScreenSharing && (
            <div className="absolute top-2 left-2 bg-green-500 rounded-full p-2">
                <Monitor className="w-5 h-5 text-white" />
            </div>
        )}
    </div>
))}

{/* If no instructor, show placeholder */}
{participants.filter(p => p.role === 'instructor').length === 0 && (
    <div className="bg-gray-800 rounded-lg mb-4 aspect-video flex items-center justify-center">
        <div className="text-center">
            <Video className="w-16 h-16 text-gray-500 mx-auto mb-2" />
            <p className="text-white">Waiting for Instructor...</p>
            <p className="text-gray-400 text-sm">No instructor has joined yet</p>
        </div>
    </div>
)}

                    {/* Student Videos Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {participants.filter(p => p.role === 'student').map((participant) => {
                            console.log('🎥 Rendering participant:', participant.name, 'isScreenSharing:', participant.isScreenSharing);
                            return (
                            <div 
                                key={participant.id} 
                                onClick={() => setSelectedParticipant(participant.id)}
                                className={`bg-gray-800 rounded-lg aspect-video flex items-center justify-center relative cursor-pointer transition-all hover:ring-2 hover:ring-blue-500 ${
                                    selectedParticipant === participant.id ? 'ring-2 ring-blue-500' : ''
                                }`}
                            >
                                <div className="text-center">
                                    <Video className="w-8 h-8 text-gray-500 mx-auto" />
                                    <p className="text-white text-sm mt-1">{participant.name}</p>
                                     <div className="mt-1 flex gap-1 justify-center">
                                    {participant.isAudioMuted ? (
                                        <MicOff className="w-4 h-4 text-red-500" />
                                    ) : (
                                        <Mic className="w-4 h-4 text-green-500" />
                                    )}
                                    {participant.isVideoOff ? (
                                        <VideoOff className="w-4 h-4 text-red-500" />
                                    ) : (
                                        <Video className="w-4 h-4 text-green-500" />
                                    )}
                                 </div>
                                </div>
                                {participant.hasRaisedHand && (
                                    <div className="absolute top-2 right-2 bg-yellow-500 rounded-full p-1 animate-bounce">
                                        <Hand className="w-4 h-4 text-white" />
                                    </div>
                                )}
                                {participant.isScreenSharing && (
                                    <div className="absolute top-2 left-2 bg-green-500 rounded-full p-1">
                                        <Monitor className="w-4 h-4 text-white" />
                                    </div>
                                )}
                            </div>
                            );
                        })}
                    </div>
                </div>

                {/* Right Sidebar - Chat */}
                <div className="w-80 bg-gray-800 flex flex-col">
                    {/* Tabs */}
                    <div className="flex border-b border-gray-700">
                        <button 
                            onClick={() => setActiveTab('chat')}
                            className={`flex-1 py-3 transition-colors ${
                                activeTab === 'chat' ? 'text-white bg-gray-700' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Chat
                        </button>
                        <button 
                            onClick={() => setActiveTab('participants')}
                            className={`flex-1 py-3 transition-colors ${
                                activeTab === 'participants' ? 'text-white bg-gray-700' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            Participants ({participants.length})
                        </button>
                    </div>

                   {/* Content Area - Chat or Participants */}
{activeTab === 'chat' ? (
    <>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 ? (
                <div className="text-center text-gray-500 mt-8">
                    <p>No messages yet</p>
                    <p className="text-sm">Start the conversation!</p>
                </div>
            ) : (
                messages.map((msg) => (
                    <div key={msg.id} className="bg-gray-700 rounded p-2">
                        <div className="flex justify-between items-start mb-1">
                            <span className="text-blue-400 text-sm font-medium">{msg.senderName}</span>
                            <span className="text-gray-500 text-xs">
                                {new Date(msg.timestamp).toLocaleTimeString()}
                            </span>
                        </div>
                        <p className="text-white text-sm">{msg.message}</p>
                    </div>
                ))
            )}
        </div>

        {/* Typing Indicator */}
        {typingUsers.length > 0 && (
            <div className="px-4 py-2 text-gray-400 text-sm italic border-t border-gray-700">
                {typingUsers.length === 1 
                    ? `${typingUsers[0]} is typing...`
                    : typingUsers.length === 2
                    ? `${typingUsers[0]} and ${typingUsers[1]} are typing...`
                    : `${typingUsers.length} people are typing...`
                }
            </div>
        )}

        {/* Message Input */}
        <div className="p-4 border-t border-gray-700 flex gap-2">
            <input
                type="text"
                value={messageInput}
                onChange={(e) => {
                    setMessageInput(e.target.value);
                    handleTyping();
                }}
                onBlur={handleStopTyping}
                onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                        handleSendMessage();
                        handleStopTyping();
                    }
                }}
                placeholder="Type a message..."
                className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
                onClick={() => {
                    handleSendMessage();
                    handleStopTyping();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
            >
                Send
            </button>
        </div>
    </>
) : (
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="space-y-2">
                                {participants.length === 0 ? (
                                    <div className="text-center text-gray-500 mt-8">
                                        <p>No participants yet</p>
                                    </div>
                                ) : (
                                    participants.map((participant) => (
                                        <div 
                                            key={participant.id}
                                            onClick={() => setSelectedParticipant(participant.id)}
                                            className={`bg-gray-700 rounded-lg p-3 cursor-pointer transition-all hover:bg-gray-600 ${
                                                selectedParticipant === participant.id ? 'ring-2 ring-blue-500' : ''
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                                        participant.role === 'instructor' ? 'bg-purple-600' : 'bg-blue-600'
                                                    }`}>
                                                        <span className="text-white font-semibold">
                                                            {participant.name.charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium">{participant.name}</p>
                                                        <p className="text-gray-400 text-xs capitalize">{participant.role}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {participant.hasRaisedHand && (
                                                        <div className="bg-yellow-500 rounded-full p-1">
                                                            <Hand className="w-4 h-4 text-white" />
                                                        </div>
                                                    )}
                                                    {participant.isScreenSharing && (
    <div className="absolute top-2 left-2 bg-green-500 rounded-full p-2">
        <Monitor className="w-5 h-5 text-white" />
    </div>
)}
                                                    {participant.isAudioMuted ? (
                                                    <MicOff className="w-4 h-4 text-red-500" />
                                                ) : (
                                                    <Mic className="w-4 h-4 text-green-500" />
                                                )}
                                                {participant.isVideoOff ? (
                                                    <VideoOff className="w-4 h-4 text-red-500" />
                                                ) : (
                                                    <Video className="w-4 h-4 text-green-500" />
                                                )}
                                                {/* INSTRUCTOR ONLY: Remove participant button */}
{user?.userType === 'teacher' && participant.role === 'student' && (
    <button
        onClick={(e) => {
            e.stopPropagation(); // Prevent triggering participant selection
            handleRemoveParticipant(participant.id);
        }}
        className="ml-2 p-1 rounded bg-red-500 hover:bg-red-600"
        title="Remove Participant"
    >
        <X className="w-4 h-4 text-white" />
    </button>
)}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                  
                    
                </div>
            </div>

            {/* Bottom Control Panel */}    

            <div className="bg-gray-800 px-6 py-4 flex justify-center items-center gap-4">
                <button
                    onClick={() => handleToggleMic()}
                    className={`p-4 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-700'} hover:bg-gray-600`}
                >
                    {isMuted ? <MicOff className="w-6 h-6 text-white" /> : <Mic className="w-6 h-6 text-white" />}
                </button>
                
                <button
                    onClick={() => handleToggleCamera()}
                    className={`p-4 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-gray-700'} hover:bg-gray-600`}
                >
                    {isVideoOff ? <VideoOff className="w-6 h-6 text-white" /> : <Video className="w-6 h-6 text-white" />}
                </button>

                <button onClick={handleScreenShare}  
    className={`p-4 rounded-full ${isScreenSharing ? 'bg-green-500' : 'bg-gray-700'} hover:bg-gray-600`}
                >
                    <Monitor className="w-6 h-6 text-white" />
                </button>

                <button
                    onClick={() => {
    const newHandState = !hasRaisedHand;
    setHasRaisedHand(newHandState);
    if (socketRef.current) {
        socketRef.current.emit('raise-hand', {
            classroomId: classroomId,
            hasRaised: newHandState
        });
    }
}}
                    className={`p-4 rounded-full ${hasRaisedHand ? 'bg-yellow-500' : 'bg-gray-700'} hover:bg-gray-600`}
                >
                    <Hand className="w-6 h-6 text-white" />
                </button>

{/* INSTRUCTOR ONLY: Toggle Mute/Unmute All Students */}
{user?.userType === 'teacher' && (
    <button 
        onClick={handleToggleMuteAll}
        className={`p-4 rounded-full ${
            areAllStudentsMuted 
                ? 'bg-green-500 hover:bg-green-600' 
                : 'bg-orange-500 hover:bg-orange-600'
        }`}
        title={areAllStudentsMuted ? "Unmute All Students" : "Mute All Students"}
    >
        {areAllStudentsMuted ? (
            <Mic className="w-6 h-6 text-white" />
        ) : (
            <MicOff className="w-6 h-6 text-white" />
        )}
    </button>
)}

                {/* STEP-BY-STEP: Leave button with handler */}
                <button 
                    onClick={handleLeaveClassroom}
                    className="p-4 rounded-full bg-red-500 hover:bg-red-600"
                >
                    <PhoneOff className="w-6 h-6 text-white" />
                </button>
            </div>
        </div>
    );
};

export default ClassroomPage;