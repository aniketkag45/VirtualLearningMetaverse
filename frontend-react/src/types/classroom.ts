export interface Participant{
    id: string;
    name: string;
    role: 'student' | 'instructor';
    isAudioMuted: boolean;
    isVideoOff: boolean;
    hasRaisedHand: boolean;
    isScreenSharing: boolean;
}

export interface ChatMessage{
    id: string;
    senderId: string;
    senderName: string;
    message: string;
    timestamp: Date;
}

export interface ClassroomSettings{
    id: string;
    courseId: string;
    courseName: string;
    instructorName: string;
    isActive: boolean;
    startTime: Date | null;
    participant: Participant[];
}