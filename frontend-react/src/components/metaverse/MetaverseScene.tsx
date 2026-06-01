import { useEffect, useMemo, useRef } from 'react';
import 'aframe';
import type { Socket } from 'socket.io-client';
import { spatialAudioManager } from '../../utils/spatialAudio';
import type { WhiteboardStroke } from '../../types/whiteboard';

interface Avatar {
  id: string;
  name: string;
  position?: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  role?: 'student' | 'instructor';
  isAudioMuted?: boolean;
  hasRaisedHand?: boolean;
  isSpeaking?: boolean;
  isSelf?: boolean;
}

interface MetaverseSceneProps {
  avatars: Avatar[];
  currentUserId: string;
  currentUserName: string;
  currentUserRole: 'student' | 'instructor';
  classroomId: string;
  socket: Socket | null;
  onPositionUpdate: (position: any, rotation: any) => void;
}

const BOARD_CANVAS_WIDTH = 1024;
const BOARD_CANVAS_HEIGHT = 512;

const fallbackSeats = [
  { x: -4.5, z: 3.8 },
  { x: 0, z: 3.8 },
  { x: 4.5, z: 3.8 },
  { x: -4.5, z: 0.8 },
  { x: 0, z: 0.8 },
  { x: 4.5, z: 0.8 },
];

const getFallbackPosition = (avatar: Avatar, index: number) => {
  if (avatar.position) return avatar.position;
  if (avatar.role === 'instructor') return { x: -4.2, y: 1.6, z: -6.4 };
  const seat = fallbackSeats[index % fallbackSeats.length];
  return { x: seat.x, y: 1.6, z: seat.z };
};

const getInitialCameraPose = (role: 'student' | 'instructor') => {
  if (role === 'instructor') {
    // Teacher starts on stage looking toward students.
    return {
      position: { x: 0.6, y: 1.75, z: -6.25 },
      rotation: { x: 0, y: 180, z: 0 },
    };
  }

  // Student starts at a desk looking toward teacher and board.
  return {
    position: { x: 0.2, y: 1.65, z: 5.7 },
    rotation: { x: 0, y: 0, z: 0 },
  };
};

const getSelfAvatarPosition = (role: 'student' | 'instructor') => {
  if (role === 'instructor') return { x: -3.9, y: 1.6, z: -6.55 };
  return { x: -0.65, y: 1.6, z: 4.45 };
};

const drawWhiteboardStroke = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, stroke: WhiteboardStroke) => {
  if (!stroke.points || stroke.points.length < 2) return;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = Math.max(2, stroke.width * 2.2);
  ctx.strokeStyle = stroke.color;
  ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';

  ctx.beginPath();
  const [firstPoint, ...rest] = stroke.points;
  ctx.moveTo(firstPoint.x * canvas.width, firstPoint.y * canvas.height);
  rest.forEach((point) => ctx.lineTo(point.x * canvas.width, point.y * canvas.height));
  ctx.stroke();
  ctx.restore();
};

const resetWhiteboardCanvas = (canvas: HTMLCanvasElement) => {
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#edf2ff';
  ctx.lineWidth = 1;
  for (let x = 0; x < canvas.width; x += 48) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 48) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
};

const setAttrs = (el: Element, attrs: Record<string, string>) => {
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
};

const createEl = (tag: string, attrs: Record<string, string> = {}) => {
  const el = document.createElement(tag);
  setAttrs(el, attrs);
  return el;
};

const createHumanAvatarEntity = (avatar: Avatar, index: number) => {
  const entity = createEl('a-entity');
  entity.setAttribute('data-avatar-id', avatar.id);

  const color = avatar.isSelf
    ? '#22c55e'
    : avatar.role === 'instructor'
      ? '#a855f7'
      : ['#2563eb', '#059669', '#ea580c', '#db2777'][index % 4];

  entity.appendChild(createEl('a-cylinder', { position: '0 1.05 0', radius: '0.24', height: '0.9', color }));
  entity.appendChild(createEl('a-sphere', { position: '0 1.72 0', radius: '0.22', color: '#f6d3ad' }));
  entity.appendChild(createEl('a-sphere', { position: '0 1.88 -0.02', radius: '0.22', scale: '1 0.42 1', color: '#111827' }));

  entity.appendChild(createEl('a-cylinder', { position: '-0.32 1.1 0', rotation: '0 0 15', radius: '0.045', height: '0.68', color: '#f6d3ad' }));
  entity.appendChild(createEl('a-cylinder', { position: '0.32 1.1 0', rotation: '0 0 -15', radius: '0.045', height: '0.68', color: '#f6d3ad' }));
  entity.appendChild(createEl('a-cylinder', { position: '-0.11 0.4 0', radius: '0.06', height: '0.72', color: '#111827' }));
  entity.appendChild(createEl('a-cylinder', { position: '0.11 0.4 0', radius: '0.06', height: '0.72', color: '#111827' }));

  const statusRing = createEl('a-torus', {
    position: '0 1.05 0',
    radius: '0.5',
    'radius-tubular': '0.012',
    color: '#22c55e',
    visible: 'false',
    animation: 'property: rotation; to: 0 360 0; loop: true; dur: 1800',
  });
  statusRing.setAttribute('data-role', 'speaking-ring');
  entity.appendChild(statusRing);

  const hand = createEl('a-cylinder', {
    position: '0.42 1.68 0',
    rotation: '0 0 -28',
    radius: '0.04',
    height: '0.82',
    color: '#f6d3ad',
    visible: 'false',
  });
  hand.setAttribute('data-role', 'raised-hand');
  entity.appendChild(hand);

  entity.appendChild(createEl('a-plane', { position: '0 2.25 0', width: '1.65', height: '0.34', color: '#020617', opacity: '0.78' }));
  const label = createEl('a-text', { value: avatar.name || 'Participant', position: '0 2.26 0.02', align: 'center', color: '#ffffff', scale: '0.68 0.68 0.68' });
  label.setAttribute('data-role', 'name-label');
  entity.appendChild(label);

  return entity;
};

const updateAvatarEntity = (entity: Element, avatar: Avatar, index: number) => {
  const pos = getFallbackPosition(avatar, index);
  entity.setAttribute('position', `${pos.x} 0 ${pos.z}`);

  const rotationY = avatar.isSelf
    ? avatar.role === 'instructor'
      ? 180
      : 0
    : avatar.rotation?.y || (avatar.role === 'instructor' ? 180 : 0);
  entity.setAttribute('rotation', `0 ${rotationY} 0`);

  const label = entity.querySelector('[data-role="name-label"]');
  const status = avatar.hasRaisedHand ? ' ✋' : avatar.isAudioMuted ? ' 🔇' : avatar.isSpeaking ? ' ●' : '';
  label?.setAttribute('value', `${avatar.isSelf ? 'You' : avatar.name || 'Participant'}${status}`);

  const hand = entity.querySelector('[data-role="raised-hand"]');
  hand?.setAttribute('visible', avatar.hasRaisedHand ? 'true' : 'false');

  const ring = entity.querySelector('[data-role="speaking-ring"]');
  ring?.setAttribute('visible', avatar.isSpeaking ? 'true' : 'false');
};

const MetaverseScene = ({
  avatars,
  currentUserId,
  currentUserName,
  currentUserRole,
  classroomId,
  socket,
  onPositionUpdate,
}: MetaverseSceneProps) => {
  const sceneRef = useRef<any>(null);
  const cameraRigRef = useRef<any>(null);
  const avatarRootRef = useRef<any>(null);
  const whiteboardCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const whiteboardPlaneRef = useRef<any>(null);
  const whiteboardTextureRef = useRef<any>(null);
  const lastSentRef = useRef({ x: 999, z: 999, ry: 999, t: 0 });
  const avatarEntitiesRef = useRef<Map<string, Element>>(new Map());

  const textureId = useMemo(() => `live-whiteboard-texture-${classroomId.replace(/[^a-zA-Z0-9_-]/g, '-')}`, [classroomId]);

  const visibleAvatars = useMemo(() => {
    const selfAvatar: Avatar = {
      id: currentUserId || 'self-avatar',
      name: currentUserName || 'You',
      role: currentUserRole,
      isSelf: true,
      position: getSelfAvatarPosition(currentUserRole),
      rotation: { x: 0, y: currentUserRole === 'instructor' ? 180 : 0, z: 0 },
    };

    const others = avatars.filter((avatar) => avatar.id !== currentUserId);
    return [selfAvatar, ...others];
  }, [avatars, currentUserId, currentUserName, currentUserRole]);

  const markWhiteboardTextureDirty = () => {
    const canvas = whiteboardCanvasRef.current;
    const plane = whiteboardPlaneRef.current;
    const mesh = plane?.getObject3D?.('mesh');
    const material = mesh?.material || plane?.components?.material?.material;

    if (!canvas || !material || !(window as any).AFRAME?.THREE) return;

    if (!whiteboardTextureRef.current) {
      whiteboardTextureRef.current = new (window as any).AFRAME.THREE.CanvasTexture(canvas);
      whiteboardTextureRef.current.needsUpdate = true;
      material.map = whiteboardTextureRef.current;
      material.needsUpdate = true;
    } else {
      whiteboardTextureRef.current.needsUpdate = true;
    }
  };

  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    const optimizeRenderer = () => {
      const renderer = scene.renderer;
      if (renderer) {
        renderer.setPixelRatio(1);
      }
    };

    scene.setAttribute('renderer', 'antialias: false; precision: mediump; colorManagement: true; powerPreference: low-power');
    scene.addEventListener('loaded', optimizeRenderer, { once: true });
    setTimeout(optimizeRenderer, 500);

    const pose = getInitialCameraPose(currentUserRole);
    cameraRigRef.current?.setAttribute('position', `${pose.position.x} ${pose.position.y} ${pose.position.z}`);
    cameraRigRef.current?.setAttribute('rotation', `${pose.rotation.x} ${pose.rotation.y} ${pose.rotation.z}`);

    return () => scene.removeEventListener('loaded', optimizeRenderer);
  }, [currentUserRole]);

  useEffect(() => {
    const root = avatarRootRef.current;
    if (!root) return;

    const currentIds = new Set(visibleAvatars.map((avatar) => avatar.id));

    avatarEntitiesRef.current.forEach((entity, id) => {
      if (!currentIds.has(id)) {
        entity.remove();
        avatarEntitiesRef.current.delete(id);
      }
    });

    visibleAvatars.forEach((avatar, index) => {
      let entity = avatarEntitiesRef.current.get(avatar.id);
      if (!entity) {
        entity = createHumanAvatarEntity(avatar, index);
        avatarEntitiesRef.current.set(avatar.id, entity);
        root.appendChild(entity);
      }
      updateAvatarEntity(entity, avatar, index);
    });
  }, [visibleAvatars]);

  useEffect(() => {
    const interval = setInterval(() => {
      const cameraRig = cameraRigRef.current;
      if (!cameraRig) return;

      const position = cameraRig.object3D.position;
      const rotation = cameraRig.object3D.rotation;
      const now = Date.now();

      const last = lastSentRef.current;
      const moved = Math.abs(position.x - last.x) > 0.22 || Math.abs(position.z - last.z) > 0.22;
      const rotated = Math.abs(rotation.y - last.ry) > 0.22;

      if (moved || rotated || now - last.t > 2200) {
        lastSentRef.current = { x: position.x, z: position.z, ry: rotation.y, t: now };
        onPositionUpdate(position, rotation);
      }

      spatialAudioManager.updateListenerPosition(position);
      const forward = { x: -Math.sin(rotation.y), y: 0, z: -Math.cos(rotation.y) };
      const up = { x: 0, y: 1, z: 0 };
      spatialAudioManager.updateListenerOrientation(forward, up);
    }, 450);

    return () => clearInterval(interval);
  }, [onPositionUpdate]);

  useEffect(() => {
    const canvas = whiteboardCanvasRef.current;
    if (!canvas) return;

    canvas.width = BOARD_CANVAS_WIDTH;
    canvas.height = BOARD_CANVAS_HEIGHT;
    resetWhiteboardCanvas(canvas);
    setTimeout(markWhiteboardTextureDirty, 500);
  }, [textureId]);

  useEffect(() => {
    if (!socket) return;

    const handleState = ({ strokes }: { strokes: WhiteboardStroke[] }) => {
      const canvas = whiteboardCanvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      resetWhiteboardCanvas(canvas);
      (strokes || []).forEach((stroke) => drawWhiteboardStroke(ctx, canvas, stroke));
      markWhiteboardTextureDirty();
    };

    const handleStroke = (stroke: WhiteboardStroke) => {
      const canvas = whiteboardCanvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (!canvas || !ctx) return;

      drawWhiteboardStroke(ctx, canvas, stroke);
      markWhiteboardTextureDirty();
    };

    const handleCleared = () => {
      const canvas = whiteboardCanvasRef.current;
      if (!canvas) return;
      resetWhiteboardCanvas(canvas);
      markWhiteboardTextureDirty();
    };

    socket.on('whiteboard-state', handleState);
    socket.on('whiteboard-stroke', handleStroke);
    socket.on('whiteboard-cleared', handleCleared);
    socket.emit('whiteboard-request-state', { classroomId });

    return () => {
      socket.off('whiteboard-state', handleState);
      socket.off('whiteboard-stroke', handleStroke);
      socket.off('whiteboard-cleared', handleCleared);
    };
  }, [classroomId, socket]);

  return (
    <div className="relative h-full min-h-[620px] overflow-hidden rounded-2xl border border-purple-500/30 bg-slate-950 shadow-2xl shadow-purple-950/30">
      <div className="absolute left-4 top-4 z-10 rounded-full border border-white/10 bg-black/50 px-4 py-2 text-xs font-semibold text-white backdrop-blur">
        3D Live Classroom • Optimized Role View • Move: WASD
      </div>
      <div className="absolute bottom-4 left-4 z-10 rounded-lg border border-white/10 bg-black/45 px-4 py-2 text-xs text-slate-200 backdrop-blur">
        Avatars visible: {visibleAvatars.length} including you
      </div>

      <canvas ref={whiteboardCanvasRef} id={textureId} style={{ display: 'none' }} />

      <a-scene ref={sceneRef} embedded style={{ width: '100%', height: '100%' }}>
        <a-sky color="#0f172a"></a-sky>
        <a-plane position="0 0 0" rotation="-90 0 0" width="28" height="22" color="#1f2937"></a-plane>
        <a-plane position="0 0.01 0" rotation="-90 0 0" width="21" height="15" color="#334155" opacity="0.65"></a-plane>

        <a-box position="0 2.5 -9.5" width="22" height="5" depth="0.25" color="#111827"></a-box>
        <a-box position="-11 2.5 0" width="0.25" height="5" depth="19" color="#111827"></a-box>
        <a-box position="11 2.5 0" width="0.25" height="5" depth="19" color="#111827"></a-box>

        <a-box position="0 0.16 -6.9" width="9" height="0.32" depth="2.5" color="#312e81"></a-box>
        <a-box position="-4.4 1 -7.35" width="1.35" height="1.5" depth="0.85" color="#7c2d12"></a-box>
        <a-text value="TEACHER" position="-4.4 1.85 -6.85" align="center" color="#ffffff" scale="1 1 1"></a-text>

        <a-box position="0 2.75 -9.32" width="8.2" height="3.15" depth="0.16" color="#1e293b"></a-box>
        <a-plane
          ref={whiteboardPlaneRef}
          position="0 2.75 -9.18"
          width="7.72"
          height="2.72"
          color="#ffffff"
          material="shader: flat; side: double"
        ></a-plane>
        <a-text value="LIVE CLASS BOARD" position="0 4.48 -9.1" align="center" color="#bfdbfe" scale="1.2 1.2 1.2"></a-text>

        {[-4.5, 0, 4.5].map((x) =>
          [0.8, 3.8].map((z) => (
            <a-entity key={`desk-set-${x}-${z}`}>
              <a-box position={`${x} 0.68 ${z}`} width="2" height="0.2" depth="1" color="#92400e"></a-box>
              <a-box position={`${x} 0.42 ${z + 0.85}`} width="1.1" height="0.2" depth="0.75" color="#475569"></a-box>
              <a-box position={`${x} 0.9 ${z + 1.12}`} width="1.1" height="0.75" depth="0.14" color="#334155"></a-box>
            </a-entity>
          ))
        )}

        <a-entity ref={avatarRootRef}></a-entity>

        <a-entity ref={cameraRigRef} id="player-rig" look-controls wasd-controls="acceleration: 16">
          <a-camera></a-camera>
        </a-entity>

        <a-light type="ambient" color="#a5b4fc" intensity="0.55"></a-light>
        <a-light type="directional" color="#ffffff" intensity="0.7" position="-2 5 3"></a-light>
      </a-scene>
    </div>
  );
};

export default MetaverseScene;
