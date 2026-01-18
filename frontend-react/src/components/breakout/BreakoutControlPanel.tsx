import React from "react";
import { Users, Play, X } from "lucide-react";

interface Props{
    participants: any[];
    onCreateRooms: (numRooms: number, duration: number, autoAssign: boolean) => void;
    onCloseRooms: () => void;
   isActive: boolean;
   currentSession: any | null;
}

export const BreakoutControlPanel: React.FC<Props> = ({
    participants,
    onCreateRooms,
    onCloseRooms,
    isActive,
    currentSession
}) => { {
    const [numRooms, setNumRooms] = React.useState<number>(3);
    const [duration, setDuration] = React.useState<number>(10);
    const [autoAssign, setAutoAssign] = React.useState<boolean>(true);

    const students = participants.filter(p => p.role === 'student');
    const StudentCount = students.length;

    const studentPerRoom = Math.ceil(StudentCount / numRooms);

    const handleCreate = () => {

        if(numRooms < 2){
            alert("Please create at least 2 rooms.");
            return;
        }
        if(StudentCount < numRooms){
            alert("not enough students to create that many rooms.");
            return;
        }
        onCreateRooms(numRooms, duration, autoAssign);
    }
    return (
    <div className="bg-gray-800 rounded-lg p-6 shadow-lg">
      <h3 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
        <Users className="w-6 h-6" />
        Breakout Rooms
      </h3>
      
      {!isActive ? (
        // ========================================
        // STATE 1: CREATION FORM
        // ========================================
        <div className="space-y-4">
          {/* Number of Rooms */}
          <div>
            <label className="text-gray-300 text-sm font-medium block mb-2">
              Number of Rooms
            </label>
            <input 
              type="number"
              value={numRooms}
              onChange={(e) => setNumRooms(Number(e.target.value))}
              min={2}
              max={10}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
            <p className="text-gray-400 text-xs mt-1">
              {StudentCount} students → ~{studentPerRoom} per room
            </p>
            </div>
          
          {/* Duration */}
          <div>
            <label className="text-gray-300 text-sm font-medium block mb-2">
              Duration (minutes)
            </label>
            <input 
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              min={5}
              max={60}
              step={5}
              className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none"
            />
          </div>
          
          {/* Auto-assign toggle */}
          <div className="flex items-center gap-3">
            <input 
              type="checkbox"
              id="autoAssign"
              checked={autoAssign}
              onChange={(e) => setAutoAssign(e.target.checked)}
              className="w-5 h-5"
            />
            <label htmlFor="autoAssign" className="text-gray-300">
              Automatically assign students to rooms
            </label>
          </div>

           {/* Create button */}
          <button 
            onClick={handleCreate}
            disabled={StudentCount < 2}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Play className="w-5 h-5" />
            Create Breakout Rooms
          </button>
          
          {StudentCount < 2 && (
            <p className="text-red-400 text-sm text-center">
              Need at least 2 students to create breakout rooms
            </p>
          )}
        </div>
      ) : (
        // ========================================
        // STATE 2: ACTIVE SESSION INFO
        // ========================================
        <div className="space-y-4">
          <div className="bg-green-600/20 border border-green-600 rounded-lg p-4">
            <p className="text-green-400 font-medium">
              ✅ Breakout rooms are active
            </p>
            <p className="text-gray-300 text-sm mt-1">
              {currentSession?.rooms.length} rooms • {duration} minutes
            </p>
            </div>

             {/* Room list */}
          <div className="space-y-2">
            {currentSession?.rooms.map((room: any) => (
              <div key={room.id} className="bg-gray-700 rounded p-3">
                <p className="text-white font-medium">{room.name}</p>
                <p className="text-gray-400 text-sm">
                  {room.participants?.length || 0} participants
                </p>
              </div>
            ))}
          </div>
          
          {/* Close button */}
          <button 
            onClick={onCloseRooms}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <X className="w-5 h-5" />
            Close All Breakout Rooms
          </button>
        </div>
      )}
    </div>
  );
}};