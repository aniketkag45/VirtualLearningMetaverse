export interface BreakoutRoom {
    id: string;
    name: string;
    participants: string[]; // Array of participant IDs
    createdAt: number;    
    createdBy: string; // ID of the user who created the room
}

export interface RoomAssignment {
    userId: string; 
    userName: string;
    assignedRoomId: string | null; // null if not assigned to any room
}

export interface BreakoutSession {
    isActive: boolean;
    rooms: BreakoutRoom[];
    assignments: RoomAssignment[];
    duration: number; // in minutes
    startTime: number | null; // timestamp when session started
    autoreturn: boolean; // whether users are auto-returned to main room after session ends
} 

export interface RoomMessage{
    id: string;
    roomId: string;
    senderId: string;
    senderName: string;
    message: string;
    timestamp: number;
}
