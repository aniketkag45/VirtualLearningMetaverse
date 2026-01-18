import React from 'react';
import {Users , Clock, ArrowRight} from 'lucide-react';

interface Props{
    roomName: string;
    onJoin: () => void;
    onDecline: () => void;
    duration: number; // in minutes
}

export const BreakoutRoomJoinModal: React.FC<Props> = ({roomName, onJoin, onDecline, duration}) => {
    return (
         // Full-screen overlay
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      {/* Modal card */}
      <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            You've Been Assigned!
          </h2>
          <p className="text-gray-300">
            The instructor has assigned you to a breakout room
          </p>
        </div>

         {/* Room info */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Room:</span>
            <span className="text-white font-bold">{roomName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-400">Duration:</span>
            <span className="text-white font-bold flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {duration} minutes
            </span>
          </div>
        </div>

         {/* Join button */}
        <button 
          onClick={onJoin}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors mb-3"
        >
          Join Breakout Room
          <ArrowRight className="w-5 h-5" />
        </button>

         {/* Decline button (if allowed) */}
        {onDecline && (
          <button 
            onClick={onDecline}
            className="w-full bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Stay in Main Room
          </button>
        )}

          <p className="text-gray-400 text-xs text-center mt-4">
          You'll be automatically returned when time is up
        </p>
      </div>
    </div>
  );
};

