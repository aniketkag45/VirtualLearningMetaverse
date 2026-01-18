import {useState, useEffect, useRef} from 'react';

export const useBreakoutTimer = (
    duration: number, // duration in minutes
    startTime: number | null, // timestamp when the timer started
    onTimerUp: () => void
): number => {
    const [timeRemaining, setTimeRemaining] = useState<number>(duration * 60); // in seconds
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if(!startTime){
            setTimeRemaining(duration * 60);
            return;
        }
        const updateTimer = () => {
            const now = Date.now();
            const elapsed = Math.floor((now - startTime) / 1000); // in seconds
             
            const totalSeconds = duration * 60;
            const remaining = totalSeconds - elapsed;

            if(remaining<0){
                setTimeRemaining(0);
                onTimerUp();
                if(intervalRef.current){
                    clearInterval(intervalRef.current);
                }
            }else{
                setTimeRemaining(remaining);
            }
        };
        updateTimer();
        intervalRef.current = setInterval(updateTimer, 1000);
    
        return () => {
            if(intervalRef.current){
                clearInterval(intervalRef.current);
            }
        };
    }, [startTime, duration, onTimerUp]);

    return timeRemaining;
};