interface Position{
    x: number;
    y: number;
    z: number;
}

interface AudioSource{
    pannerNode: PannerNode;
    gainNode: GainNode;
    sourceNode: MediaStreamAudioSourceNode;
}

class SpatialAudioManager{
    private audioContext: AudioContext | null = null;
    private audioSources: Map<string, AudioSource> = new Map();
    private listenerPosition: Position = {x:0, y:0, z:0};

    // spatial audio parameters
    private readonly MAX_DISTANCE = 20;  // Maximum hearing distance
    private readonly REF_DISTANCE = 1;   // Reference distance for volume reduction
    private readonly ROLLOFF_FACTOR = 1; // How quickly volume reduces with distance

    /* Initialize the AudioContext (must be called after user interaction due to browser autoplay policy)
       * CONCEPT: AudioContext is expensive, create only once per application
    */
   initialize(): void {
    if(this.audioContext) return; // already initialized

    try{
        // Create AudioContext
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();  

        //configure listener
        const listener = this.audioContext.listener;

        if(listener.positionX){
            listener.positionX.setValueAtTime(this.listenerPosition.x, this.audioContext.currentTime);
            listener.positionY.setValueAtTime(this.listenerPosition.y, this.audioContext.currentTime);
            listener.positionZ.setValueAtTime(this.listenerPosition.z, this.audioContext.currentTime);
        }
        else{
            listener.setPosition(this.listenerPosition.x, this.listenerPosition.y, this.listenerPosition.z);
        }
        console.log(" spatialAudioManager initialized");
    }catch(error){
        console.error("Error initializing AudioContext:", error);

    }
    }
 /**
   * Add peer audio stream with spatial positioning
   * CONCEPT: Create audio processing chain for each peer
   * 
   * @param peerId - Unique identifier for the peer
   * @param stream - MediaStream from WebRTC peer connection
   * @param position - Initial 3D position of the peer's avatar
   */
  addPeerAudio(peerId: string, stream: MediaStream, position: Position): void {
    if(!this.audioContext){
        console.warn("AudioContext not initialized. Call initialize() first.");
        return;
    }

    if(this.audioSources.has(peerId)){
        console.warn(`Audio source for peer ${peerId} already exists.`);
        return;
    }

    try{
        // Debug: Check stream and AudioContext state
        console.log(`🎧 Adding peer audio for ${peerId}:`);
        console.log(`  - Stream ID: ${stream.id}`);
        console.log(`  - Audio tracks: ${stream.getAudioTracks().length}`);
        console.log(`  - Video tracks: ${stream.getVideoTracks().length}`);
        console.log(`  - AudioContext state: ${this.audioContext.state}`);
        
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length > 0) {
            const track = audioTracks[0];
            console.log(`  - Audio track enabled: ${track.enabled}, muted: ${track.muted}, readyState: ${track.readyState}`);
            
            // CRITICAL: Ensure audio track is enabled and not muted
            track.enabled = true;
            console.log(`  🔊 Audio track force-enabled`);
            
            // WORKAROUND: If track is muted (read-only property), create audio element for playback
            if (track.muted) {
                console.log(`  ⚠️ Track is muted - creating audio element for direct playback test`);
                const audioElement = document.createElement('audio');
                audioElement.srcObject = stream;
                audioElement.autoplay = true;
                audioElement.volume = 1.0; // Full volume for testing
                audioElement.setAttribute('id', `audio-${peerId}`);
                document.body.appendChild(audioElement); // Add to DOM
                audioElement.play()
                    .then(() => console.log(`  ✅ Audio element playing for ${peerId}`))
                    .catch(err => console.error('  ❌ Audio element play failed:', err));
            }
        } else {
            console.warn(`  ⚠️ No audio tracks in stream for ${peerId}`);
            return; // Don't add peer audio if no audio tracks
        }

        //step 1: convert MediaStream to WebAudio API source node
        const sourceNode = this.audioContext.createMediaStreamSource(stream);
        console.log(`  ✅ Created MediaStreamSource node`);

        //step 2: create gain node for volume control
        const gainNode = this.audioContext.createGain();
        gainNode.gain.value = 1.0; // initialize volume

        //step 3: create panner node for spatial audio
        const pannerNode = this.audioContext.createPanner();
        
        // configure panner node for realistic spatialization
        pannerNode.panningModel = 'HRTF'; // Head-Related Transfer Function (most realistic)
        pannerNode.distanceModel = 'inverse'; // how volume reduces with distance
        pannerNode.refDistance = this.REF_DISTANCE; // reference distance for volume reduction
        pannerNode.maxDistance = this.MAX_DISTANCE; // beyond this distance, volume won't reduce further
        pannerNode.rolloffFactor = this.ROLLOFF_FACTOR; // how quickly volume reduces with distance
        pannerNode.coneInnerAngle = 360; // no directional effect
        pannerNode.coneOuterAngle = 0;
        pannerNode.coneOuterGain = 0;

        // set initial position
        if(pannerNode.positionX){
            pannerNode.positionX.setValueAtTime(position.x, this.audioContext.currentTime);
            pannerNode.positionY.setValueAtTime(position.y, this.audioContext.currentTime);
            pannerNode.positionZ.setValueAtTime(position.z, this.audioContext.currentTime);
        }
        else{
            pannerNode.setPosition(position.x, position.y, position.z);
        }

        //step 4: connect the nodes: MediaStream  -> Source ->  gain -> panner -> speakers

        sourceNode.connect(gainNode);
        gainNode.connect(pannerNode);
        pannerNode.connect(this.audioContext.destination);

        //store the nodes for future reference
        this.audioSources.set(peerId, {pannerNode, gainNode, sourceNode});
        console.log(`✅ Spatial audio chain connected for peer ${peerId}:`);
        console.log(`  - Position: x=${position.x}, y=${position.y}, z=${position.z}`);
        console.log(`  - Gain: ${gainNode.gain.value}`);
        console.log(`  - Connected to speakers: ${pannerNode.numberOfOutputs > 0}`);
    }catch(error){
        console.error(`Error adding audio for peer ${peerId}:`, error);
    }
    }

     /**
   * Update avatar position → updates audio source position
   * CONCEPT: Called every time avatar moves (synced with avatar-move events)
   */
    updatePeerPosition(peerId: string, position: Position): void {
        const audioSource = this.audioSources.get(peerId);
        if (!audioSource || !this.audioContext) {
          
            return;
        }

        const { pannerNode } = audioSource;
        const currentTime = this.audioContext.currentTime;

        if (pannerNode.positionX){
            pannerNode.positionX.linearRampToValueAtTime(position.x, currentTime + 0.05);
            pannerNode.positionY.linearRampToValueAtTime(position.y, currentTime + 0.05);
            pannerNode.positionZ.linearRampToValueAtTime(position.z, currentTime + 0.05);

        }
        else{
            pannerNode.setPosition(position.x, position.y, position.z);
        }
    }

    /**
   * Update listener position (your camera position)
   * CONCEPT: Called when YOU move in the 3D world
   */
    updateListenerPosition(position: Position): void {
        if (!this.audioContext) {
            console.warn("AudioContext not initialized.");
            return;
        }
        this.listenerPosition = position;
        const listener = this.audioContext.listener;
        const currentTime = this.audioContext.currentTime;
        if (listener.positionX){
            listener.positionX.linearRampToValueAtTime(position.x, currentTime + 0.05);
            listener.positionY.linearRampToValueAtTime(position.y, currentTime + 0.05);
            listener.positionZ.linearRampToValueAtTime(position.z, currentTime + 0.05);
        }
        else{
            listener.setPosition(position.x, position.y, position.z);
        }
    }

      /**
   * Update listener orientation (where you're looking)
   * CONCEPT: Affects directional audio perception
   */
    updateListenerOrientation(forward: Position, up: Position): void {
        if (!this.audioContext) {
            console.warn("AudioContext not initialized.");
            return;
        }
        const listener = this.audioContext.listener;
        const currentTime = this.audioContext.currentTime;  
        if (listener.forwardX){
            listener.forwardX.linearRampToValueAtTime(forward.x, currentTime + 0.05);
            listener.forwardY.linearRampToValueAtTime(forward.y, currentTime + 0.05);
            listener.forwardZ.linearRampToValueAtTime(forward.z, currentTime + 0.05);

            listener.upX.linearRampToValueAtTime(up.x, currentTime + 0.05);
            listener.upY.linearRampToValueAtTime(up.y, currentTime + 0.05);
            listener.upZ.linearRampToValueAtTime(up.z, currentTime + 0.05);
        }
        else{
            listener.setOrientation(forward.x, forward.y, forward.z, up.x, up.y, up.z);
        }
    }

      /**
   * Remove peer audio when they disconnect
   * CONCEPT: Cleanup to prevent memory leaks
   */

    removePeerAudio(peerId: string): void {
        const audioSource = this.audioSources.get(peerId);
        if (!audioSource) {
            console.warn(`No audio source found for peer ${peerId}`);
            return;
        }

        //disconnect nodes
        audioSource.sourceNode.disconnect();
        audioSource.gainNode.disconnect();
        audioSource.pannerNode.disconnect();

        //remove from map
        this.audioSources.delete(peerId);
        console.log(`Removed spatial audio for peer ${peerId}`);
    }

    
  /**
   * Mute/unmute specific peer
   */
    setPeerMute(peerId: string, muted: boolean): void {
        const audioSource = this.audioSources.get(peerId);
        if (!audioSource || !this.audioContext) {
            console.warn(`No audio source found for peer ${peerId}`);
            return;
        }

        const { gainNode } = audioSource;
        const currentTime = this.audioContext.currentTime;
        gainNode.gain.linearRampToValueAtTime(muted ? 0 : 1.0, currentTime + 0.05);
    }

    /**
   * Cleanup all audio sources
   */
    cleanup(): void {
        this.audioSources.forEach((_, peerId) => {
            this.removePeerAudio(peerId);
        });

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        console.log("SpatialAudioManager cleaned up.");
    }
}

export const spatialAudioManager = new SpatialAudioManager();



