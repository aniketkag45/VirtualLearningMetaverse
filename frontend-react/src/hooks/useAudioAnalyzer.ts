import { useRef, useEffect } from "react";
import AudioAnalyzer from "../utils/audioAnalyzer";

export const useAudioAnalyzer = (
    stream: MediaStream | null,
    userId: string | null,
    onSpeakingChange: (userId: string, isSpeaking: boolean) => void
) => {
    const audioAnalyzerRef = useRef<AudioAnalyzer | null>(null);

    useEffect(() => {
        if(!stream || !userId) return;

        const audioAnalyzer = new AudioAnalyzer();
        audioAnalyzerRef.current = audioAnalyzer;

        audioAnalyzer.startAnalyzing(stream, (isSpeaking: boolean) => {
            onSpeakingChange(userId, isSpeaking);
        });

        return () => {
            audioAnalyzer.stop();
            audioAnalyzerRef.current = null;
        };
    }, [stream, userId, onSpeakingChange]);
};