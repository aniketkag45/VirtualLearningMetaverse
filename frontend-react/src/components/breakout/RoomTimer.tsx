import React from "react";
import { Clock } from "lucide-react";

interface Props{
    timeRemaining: number; // in seconds
    isActive: boolean;
}

export const RoomTimer: React.FC<Props> = ({timeRemaining, isActive}) => {
    if(!isActive){
        return null;
    }

    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;

    const display = `${minutes.toString().padStart(2,'0')}:${seconds.toString().padStart(2,'0')}`;

    const getColorClass = () => {
        if(timeRemaining <= 60){
            return "text-red-400"; // Less than 1 minute - urgent!
        }else if(timeRemaining <= 300){
            return "text-yellow-400"; // Less than 5 minutes - warning
        }   else{
            return "text-green-400"; // More than 5 minutes - safe
        }
    };

        return (
    <div className={`flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg ${getColorClass()}`}>
      <Clock className="w-5 h-5" />
      <span className="font-mono text-lg font-bold">{display}</span>
      <span className="text-sm">remaining</span>
    </div>
  );
};