import { useEffect, useMemo, useState } from 'react';
import {
  GridLayout,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useLocalParticipant,
  useTracks,
} from '@livekit/components-react';
import '@livekit/components-styles';
import { Track } from 'livekit-client';

interface LiveKitClassroomProps {
  roomName: string;
  participantId: string;
  participantName: string;
  role: 'student' | 'instructor';
  isMetaverseMode: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
  isScreenSharing: boolean;
}

interface TokenResponse {
  success: boolean;
  message?: string;
  data?: {
    token: string;
    url: string;
    roomName: string;
  };
}

const TOKEN_URL =
  ((import.meta as any).env?.VITE_LIVEKIT_TOKEN_URL as string) ||
  'http://localhost:3001/api/livekit/token';

const LIVEKIT_URL = ((import.meta as any).env?.VITE_LIVEKIT_URL as string) || '';

const LiveKitMediaSync = ({
  isMetaverseMode,
  isMuted,
  isVideoOff,
  isScreenSharing,
}: Pick<LiveKitClassroomProps, 'isMetaverseMode' | 'isMuted' | 'isVideoOff' | 'isScreenSharing'>) => {
  const { localParticipant } = useLocalParticipant();

  useEffect(() => {
    localParticipant.setMicrophoneEnabled(!isMuted).catch(() => {});
  }, [isMuted, localParticipant]);

  useEffect(() => {
    // In 3D mode use audio + avatars, not camera video. This is the key SFU performance mode.
    localParticipant.setCameraEnabled(!isVideoOff && !isMetaverseMode).catch(() => {});
  }, [isMetaverseMode, isVideoOff, localParticipant]);

  useEffect(() => {
    // Screen share is driven by the app's own control button (no duplicate LiveKit bar).
    localParticipant.setScreenShareEnabled(isScreenSharing && !isMetaverseMode).catch(() => {});
  }, [isScreenSharing, isMetaverseMode, localParticipant]);

  return null;
};

const LiveKitStage = () => {
  const tracks = useTracks(
    [
      { source: Track.Source.Camera, withPlaceholder: true },
      { source: Track.Source.ScreenShare, withPlaceholder: false },
    ],
    { onlySubscribed: false }
  );

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-950">
      <div className="flex-1 min-h-0 p-3">
        <GridLayout tracks={tracks} className="h-full">
          <ParticipantTile />
        </GridLayout>
      </div>
      <RoomAudioRenderer />
    </div>
  );
};

const LiveKitClassroom = ({
  roomName,
  participantId,
  participantName,
  role,
  isMetaverseMode,
  isMuted,
  isVideoOff,
  isScreenSharing,
}: LiveKitClassroomProps) => {
  const [token, setToken] = useState<string | null>(null);
  const [serverUrl, setServerUrl] = useState<string>(LIVEKIT_URL);
  const [error, setError] = useState<string>('');

  const requestBody = useMemo(
    () => ({ roomName, participantName, participantId, role }),
    [participantId, participantName, role, roomName]
  );

  useEffect(() => {
    let cancelled = false;

    const loadToken = async () => {
      setError('');
      setToken(null);
      try {
        const response = await fetch(TOKEN_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody),
        });
        const payload = (await response.json()) as TokenResponse;

        if (!response.ok || !payload.success || !payload.data?.token) {
          throw new Error(payload.message || 'Could not get LiveKit token');
        }

        if (!cancelled) {
          setToken(payload.data.token);
          setServerUrl(LIVEKIT_URL || payload.data.url);
        }
      } catch (err) {
        console.error('LiveKit token load failed:', err);
        if (!cancelled) {
          setError('LiveKit is not configured/running. Set LIVEKIT credentials on classroom-server or use legacy media fallback.');
        }
      }
    };

    loadToken();
    return () => {
      cancelled = true;
    };
  }, [requestBody]);

  if (error) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-red-500/30 bg-red-950/30 p-8 text-center text-white">
        <div>
          <h3 className="mb-2 text-xl font-bold">LiveKit media unavailable</h3>
          <p className="max-w-md text-sm text-red-100">{error}</p>
        </div>
      </div>
    );
  }

  if (!token || !serverUrl) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl border border-slate-700 bg-slate-950 text-white">
        Connecting to LiveKit media room...
      </div>
    );
  }

  return (
    <LiveKitRoom
      token={token}
      serverUrl={serverUrl}
      connect={true}
      audio={!isMuted}
      video={!isVideoOff && !isMetaverseMode}
      data-lk-theme="default"
      className="h-full"
    >
      <LiveKitMediaSync
        isMetaverseMode={isMetaverseMode}
        isMuted={isMuted}
        isVideoOff={isVideoOff}
        isScreenSharing={isScreenSharing}
      />
      <div className={isMetaverseMode ? 'hidden' : 'h-full'}>
        <LiveKitStage />
      </div>
      {isMetaverseMode && <RoomAudioRenderer />}
    </LiveKitRoom>
  );
};

export default LiveKitClassroom;