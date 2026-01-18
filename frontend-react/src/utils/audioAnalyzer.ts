class AudioAnalyzer {
    private audioContext: AudioContext | null = null;
    private analyzer: AnalyserNode | null = null;
    private dataArray: Uint8Array | null = null;
    private animationFrame: number | null = null;
    private onSpeakingChange: ((isSpeaking: boolean) => void) | null = null;

    // Hysteresis thresholds - different for starting vs stopping
    private startSpeakingThreshold = 0.01; // Threshold to START showing border
    private stopSpeakingThreshold = 0.008; // Threshold to STOP showing border (lower)
    private isSpeaking = false;
    
    // Debouncing - require consistent state before changing
    private silenceFrames = 0;
    private speakingFrames = 0;
    private requiredFrames = 3; // Need 3 consecutive frames to change state (faster response)

    startAnalyzing(stream:MediaStream, callback:(isSpeaking: boolean) => void): void {
        this.onSpeakingChange = callback;

        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

        this.analyzer = this.audioContext.createAnalyser();
        this.analyzer.fftSize = 2048;
        this.analyzer.smoothingTimeConstant = 0.3;

        const bufferLength = this.analyzer.frequencyBinCount;
        this.dataArray = new Uint8Array(bufferLength);

        const source = this.audioContext.createMediaStreamSource(stream);
        source.connect(this.analyzer);
        this.checkAudioLevel(); 
    }

    private checkAudioLevel(): void {

        this.animationFrame = requestAnimationFrame(() => this.checkAudioLevel());
        
        if (!this.analyzer || !this.dataArray) return;

        // Get time domain data (actual audio waveform)
        this.analyzer.getByteTimeDomainData(this.dataArray);

        // Calculate RMS (Root Mean Square) - proper audio volume measurement
        let sumSquares = 0;
        for (let i = 0; i < this.dataArray!.length; i++) {
            // Convert from 0-255 to -1 to 1 range
            const normalized = (this.dataArray![i] - 128) / 128;
            sumSquares += normalized * normalized;
        }
        const rms = Math.sqrt(sumSquares / this.dataArray!.length);
        
        // Use different thresholds based on current state (hysteresis)
        const threshold = this.isSpeaking ? this.stopSpeakingThreshold : this.startSpeakingThreshold;
        const isCurrentlyLoud = rms > threshold;
        
        // Count consecutive frames of speaking/silence
        if (isCurrentlyLoud) {
            this.speakingFrames++;
            this.silenceFrames = 0;
        } else {
            this.silenceFrames++;
            this.speakingFrames = 0;
        }
        
        // Change state only after consistent detection
        if (!this.isSpeaking && this.speakingFrames >= this.requiredFrames) {
            // Start speaking - need X consecutive speaking frames
            this.isSpeaking = true;
            if (this.onSpeakingChange) {
                this.onSpeakingChange(true);
            }
        } else if (this.isSpeaking && this.silenceFrames >= this.requiredFrames) {
            // Stop speaking - need X consecutive silence frames
            this.isSpeaking = false;
            if (this.onSpeakingChange) {
                this.onSpeakingChange(false);
            }
        }
    }

    stop(): void {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.analyzer = null;
        this.dataArray = null;
        this.onSpeakingChange = null;
        this.isSpeaking = false;
        this.silenceFrames = 0;
        this.speakingFrames = 0;
    }
}

export default AudioAnalyzer;
