import { BreakoutRoom, RoomAssignment } from '../types/breakoutRooms';
import { Participant } from '../types/classroom';


export const autoAssignStudents = (
  students: Participant[],
  rooms: BreakoutRoom[]
): RoomAssignment[] => {
  const assignments: RoomAssignment[] = [];
  
  // 💡 Learning: This is the "round-robin" algorithm
  // Student 0 → Room 0
  // Student 1 → Room 1
  // Student 2 → Room 2
  // Student 3 → Room 0 (back to start)
  // etc.
  
  students.forEach((student, index) => {
    const roomIndex = index % rooms.length; // Modulo gives us 0, 1, 2, 0, 1, 2, ...
    const room = rooms[roomIndex];
    
    assignments.push({
      userId: student.id,
      userName: student.name,
      assignedRoomId: room.id
    });
  });
  
  return assignments;
};

export const getParticipantsInRoom = (
    roomId: string | null,
    assignments: RoomAssignment[],
    allParticipants: Participant[]
): Participant[] => {
   if(roomId === null) return allParticipants;


const roomUserIds = assignments
    .filter(assignment => assignment.assignedRoomId === roomId)
    .map(assignment => assignment.userId);

return allParticipants.filter(participant => roomUserIds.includes(participant.id));
}

export const formatTimeRemaining = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
     return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export const generateRooms = (numRooms: number , instructorId: string): BreakoutRoom[] => {

    const rooms: BreakoutRoom[] = [];
    const timestamp = Date.now();

    for(let i=1; i<=numRooms; i++){
        rooms.push({
            id: `room-${timestamp}-${i}`,
            name: `Room ${i}`,
            participants: [],   
            createdAt: timestamp,
            createdBy: instructorId,
        });
    }

    return rooms;
}

export const canCreateBreakoutRooms = (userRole: string): boolean => {
  return userRole === 'instructor' || userRole === 'teacher';
};

export const getRoomById = (roomId: string, rooms: BreakoutRoom[]): BreakoutRoom | null => {
    if(!roomId) return null;
    return rooms.find(room => room.id === roomId) || null;
}