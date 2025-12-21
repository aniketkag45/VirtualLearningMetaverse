// frontend-react/src/utils/peerManager_NATIVE.ts
// Native WebRTC implementation - NO SimplePeer dependencies

interface PeerManagerCallbacks {
  onSignal: (peerId: string, signal: any) => void;
  onStream: (peerId: string, stream: MediaStream) => void;
  onError: (peerId: string, error: Error) => void;
  onClose: (peerId: string) => void;
}

interface PeerConnection {
  pc: RTCPeerConnection;
  stream: MediaStream | null;
}

class PeerManager {
  private peers: Map<string, PeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private callbacks: PeerManagerCallbacks | null = null;

  // STUN servers for NAT traversal
  private iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' }
    ]
  };

  async initializeLocalStream(enableVideo: boolean = true, enableAudio: boolean = true): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: enableVideo ? { width: { ideal: 640 }, height: { ideal: 480 } } : false,
        audio: enableAudio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        } : false
      });

      // console.log('📹 Local stream initialized:', this.localStream.id);
      return this.localStream;
    } catch (error) {
      // console.error('❌ Failed to get local stream:', error);
      throw error;
    }
  }

  setCallbacks(callbacks: PeerManagerCallbacks) {
    this.callbacks = callbacks;
  }

  async createPeer(peerId: string, initiator: boolean) {
   // console.log(initiator ? '📤 Creating initiator peer for' : '📥 Creating receiver peer for', peerId);

    // Create RTCPeerConnection
    const pc = new RTCPeerConnection(this.iceServers);

    // Add local stream tracks if available
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream!);
      });
     // console.log(`✅ Added ${this.localStream.getTracks().length} tracks to peer ${peerId}`);
    } else {
     // console.warn(`⚠️ No local stream available when creating peer ${peerId}, tracks will be added later`);
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && this.callbacks) {
       // console.log('📡 Sending ICE candidate to', peerId);
        this.callbacks.onSignal(peerId, {
          type: 'candidate',
          candidate: event.candidate
        });
      }
    };

    // Handle remote stream
    const receivedTracks = new Set<string>();
    pc.ontrack = (event) => {
     // console.log(`📥 Track received from ${peerId}:`, event.track.kind);
      const stream = event.streams[0];
      if (!stream) return;

      // Track which tracks we've received
      receivedTracks.add(event.track.kind);

      // Unmute all tracks (critical for audio playback)
      stream.getTracks().forEach(track => {
        track.enabled = true;
     //   console.log(`🔊 ${track.kind} track enabled for ${peerId}`);
      });

      // Wait for at least the audio track before calling onStream
      // (We need audio for spatial audio to work)
      if (receivedTracks.has('audio') && this.callbacks) {
     //   console.log('🎵 Received stream from', peerId, '- Tracks:', stream.getTracks().length);
        this.callbacks.onStream(peerId, stream);
        // Note: We call onStream every time a new track arrives to ensure latest stream state
      }
    };


    // Handle connection state
    pc.onconnectionstatechange = () => {
     // console.log(`🔌 Peer ${peerId} connection state:`, pc.connectionState);
      if (pc.connectionState === 'connected') {
      //  console.log(`✅ Peer ${peerId} CONNECTED successfully!`);
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
      //  console.log(`❌ Peer ${peerId} connection ${pc.connectionState}`);
        if (this.callbacks) {
          this.callbacks.onClose(peerId);
        }
      }
    };

    // Handle ICE connection state (more detailed than connection state)
    pc.oniceconnectionstatechange = () => {
      //console.log(`🧊 Peer ${peerId} ICE connection state:`, pc.iceConnectionState);
      if (pc.iceConnectionState === 'connected' || pc.iceConnectionState === 'completed') {
      //  console.log(`✅ Peer ${peerId} ICE connection established!`);
      }
    };

    // Handle ICE gathering state
    pc.onicegatheringstatechange = () => {
      //console.log(`🧊 ICE gathering state for ${peerId}:`, pc.iceGatheringState);
    };

    // Handle errors
    pc.onicecandidateerror = (event) => {
     // console.warn(`⚠️ ICE candidate error for ${peerId}:`, event);
    };

    // Store peer connection
    this.peers.set(peerId, { pc, stream: null });

    // If initiator, create offer
    if (initiator) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const sender = pc.getSenders().find(s => s.track?.kind === 'video');
if (sender) {
  const params = sender.getParameters();
  params.encodings[0].maxBitrate = 500000; // 500 kbps
  await sender.setParameters(params);
}

        // Limit audio bitrate for better performance with multiple participants
        const audioSender = pc.getSenders().find(s => s.track?.kind === 'audio');
        if (audioSender) {
          const audioParams = audioSender.getParameters();
          if (!audioParams.encodings[0]) audioParams.encodings[0] = {};
          audioParams.encodings[0].maxBitrate = 32000; // 32 kbps voice quality
          await audioSender.setParameters(audioParams);
        }
        
        if (this.callbacks) {
          //console.log('📡 Sending offer to', peerId);
          this.callbacks.onSignal(peerId, {
            type: 'offer',
            sdp: offer.sdp
          });
        }
      } catch (error) {
       // console.error(`❌ Error creating offer for ${peerId}:`, error);
        if (this.callbacks) {
          this.callbacks.onError(peerId, error as Error);
        }
      }
    }
  }

 async handleSignal(peerId: string, signal: any) {
  //console.log(`📨 Handling signal from ${peerId}, type:`, signal?.type);
  let peerData = this.peers.get(peerId);

  if (!peerData && signal?.type === 'offer') {
  //  console.log(`📥 Creating receiver peer for incoming offer from ${peerId}`);
    await this.createPeer(peerId, false);
    peerData = this.peers.get(peerId);
  }

  if (!peerData) {
  //  console.error(`❌ No peer data for ${peerId}, signal type:`, signal?.type);
    return;
  }
  
  if (!signal) {
  //  console.error(`❌ No signal data for ${peerId}`);
    return;
  }

  const { pc } = peerData;

  try {
    // ICE candidate
    if (signal.type === 'candidate') {
      if (!signal.candidate) return; // ✅ IMPORTANT
     // console.log(`🧊 Adding ICE candidate for ${peerId}`);
      await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
      return;
    }

    // Offer
    if (signal.type === 'offer') {
     // console.log(`📞 Processing offer from ${peerId}`);
      await pc.setRemoteDescription({ type: 'offer', sdp: signal.sdp });
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      //console.log(`📤 Sending answer to ${peerId}`);
      this.callbacks?.onSignal(peerId, { type: 'answer', sdp: answer.sdp });
      return;
    }

    // Answer
    if (signal.type === 'answer') {
    //  console.log(`📞 Processing answer from ${peerId}`);
      await pc.setRemoteDescription({ type: 'answer', sdp: signal.sdp });
    //  console.log(`✅ Answer processed from ${peerId}`);
    }

  } catch (err) {
   // console.error(`❌ Error handling signal from ${peerId}`, err);
    this.callbacks?.onError(peerId, err as Error);
  }
}

  destroyPeer(peerId: string) {
    const peerData = this.peers.get(peerId);
    if (peerData) {
      peerData.pc.close();
      this.peers.delete(peerId);
    //  console.log('🗑️ Destroyed peer', peerId);
    }
  }

  setAudioEnabled(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = enabled;
      });
    //  console.log(enabled ? '🎤 Audio enabled' : '🔇 Audio disabled');
    }
  }

  setVideoEnabled(enabled: boolean) {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = enabled;
      });
    //  console.log(enabled ? '📹 Video enabled' : '📹 Video disabled');
    }
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  cleanup() {
    // Close all peer connections
    this.peers.forEach((_peerData, peerId) => {
      this.destroyPeer(peerId);
    });

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

   // console.log('🧹 PeerManager cleaned up');
  }
}

// Export singleton
export const peerManager = new PeerManager();
