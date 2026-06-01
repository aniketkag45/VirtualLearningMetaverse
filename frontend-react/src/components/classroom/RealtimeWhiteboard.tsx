import { useCallback, useEffect, useRef, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { Eraser, Lock, Paintbrush, RotateCcw, Trash2, Unlock } from 'lucide-react';
import toast from 'react-hot-toast';
import type { WhiteboardPoint, WhiteboardStroke, WhiteboardTool } from '../../types/whiteboard';

interface RealtimeWhiteboardProps {
  socket: Socket | null;
  classroomId: string;
  currentUserId: string;
  currentUserName: string;
  canClear: boolean;
}

const COLORS = ['#111827', '#2563eb', '#dc2626', '#16a34a', '#9333ea', '#ea580c'];

const createStrokeId = () => `stroke-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

const getCanvasPoint = (canvas: HTMLCanvasElement, event: PointerEvent | React.PointerEvent): WhiteboardPoint => {
  const rect = canvas.getBoundingClientRect();
  return {
    x: (event.clientX - rect.left) / rect.width,
    y: (event.clientY - rect.top) / rect.height,
  };
};

const drawStroke = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement, stroke: WhiteboardStroke) => {
  if (stroke.points.length < 2) return;

  ctx.save();
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.lineWidth = stroke.width;
  ctx.strokeStyle = stroke.color;
  ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';

  ctx.beginPath();
  const [firstPoint, ...rest] = stroke.points;
  ctx.moveTo(firstPoint.x * canvas.width, firstPoint.y * canvas.height);

  rest.forEach((point) => {
    ctx.lineTo(point.x * canvas.width, point.y * canvas.height);
  });

  ctx.stroke();
  ctx.restore();
};

const RealtimeWhiteboard = ({
  socket,
  classroomId,
  currentUserId,
  currentUserName,
  canClear,
}: RealtimeWhiteboardProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<WhiteboardStroke[]>([]);
  const currentStrokeRef = useRef<WhiteboardStroke | null>(null);
  const isDrawingRef = useRef(false);

  const [tool, setTool] = useState<WhiteboardTool>('pen');
  const [color, setColor] = useState('#2563eb');
  const [width, setWidth] = useState(4);
  const [strokeCount, setStrokeCount] = useState(0);
  const [studentsCanWrite, setStudentsCanWrite] = useState(false);

  const canDraw = canClear || studentsCanWrite;

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const redrawAll = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    clearCanvas();
    strokesRef.current.forEach((stroke) => drawStroke(ctx, canvas, stroke));
    setStrokeCount(strokesRef.current.length);
  }, [clearCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const nextWidth = Math.max(parent.clientWidth, 320);
      const nextHeight = Math.max(parent.clientHeight, 360);
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.floor(nextWidth * dpr);
      canvas.height = Math.floor(nextHeight * dpr);
      canvas.style.width = `${nextWidth}px`;
      canvas.style.height = `${nextHeight}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // The drawing function uses canvas.width/height, so reset transform for predictable rendering.
      if (ctx) ctx.setTransform(1, 0, 0, 1, 0, 0);
      redrawAll();
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [redrawAll]);

  useEffect(() => {
    if (!socket) return;

    const handleState = ({ strokes }: { strokes: WhiteboardStroke[] }) => {
      strokesRef.current = strokes || [];
      redrawAll();
    };

    const handleRemoteStroke = (stroke: WhiteboardStroke) => {
      if (!stroke || stroke.userId === currentUserId) return;
      strokesRef.current = [...strokesRef.current, stroke];

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d');
      if (canvas && ctx) drawStroke(ctx, canvas, stroke);
      setStrokeCount(strokesRef.current.length);
    };

    const handleCleared = () => {
      strokesRef.current = [];
      clearCanvas();
      setStrokeCount(0);
      toast('Whiteboard cleared', { icon: '🧼' });
    };

    const handleError = ({ message }: { message: string }) => {
      toast.error(message || 'Whiteboard action failed.');
    };

    const handlePermissionState = ({ studentsCanWrite }: { studentsCanWrite: boolean }) => {
      setStudentsCanWrite(Boolean(studentsCanWrite));
    };

    socket.on('whiteboard-state', handleState);
    socket.on('whiteboard-stroke', handleRemoteStroke);
    socket.on('whiteboard-cleared', handleCleared);
    socket.on('whiteboard-error', handleError);
    socket.on('whiteboard-permission-state', handlePermissionState);
    socket.emit('whiteboard-request-state', { classroomId });

    return () => {
      socket.off('whiteboard-state', handleState);
      socket.off('whiteboard-stroke', handleRemoteStroke);
      socket.off('whiteboard-cleared', handleCleared);
      socket.off('whiteboard-error', handleError);
      socket.off('whiteboard-permission-state', handlePermissionState);
    };
  }, [classroomId, clearCanvas, currentUserId, redrawAll, socket]);

  const handlePointerDown = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || !socket) return;
    if (!canDraw) {
      toast.error('The teacher has locked student writing on the board.');
      return;
    }

    canvas.setPointerCapture(event.pointerId);
    isDrawingRef.current = true;

    const point = getCanvasPoint(canvas, event);
    currentStrokeRef.current = {
      id: createStrokeId(),
      classroomId,
      userId: currentUserId,
      userName: currentUserName,
      tool,
      color,
      width: tool === 'eraser' ? width * 3 : width,
      points: [point],
      createdAt: Date.now(),
    };
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const currentStroke = currentStrokeRef.current;

    if (!canvas || !ctx || !currentStroke || !isDrawingRef.current) return;

    const point = getCanvasPoint(canvas, event);
    currentStroke.points.push(point);
    redrawAll();
    drawStroke(ctx, canvas, currentStroke);
  };

  const finishStroke = () => {
    if (!isDrawingRef.current || !currentStrokeRef.current || !socket) return;

    const stroke = currentStrokeRef.current;
    isDrawingRef.current = false;
    currentStrokeRef.current = null;

    if (stroke.points.length < 2) return;

    strokesRef.current = [...strokesRef.current, stroke];
    setStrokeCount(strokesRef.current.length);
    socket.emit('whiteboard-stroke', { classroomId, stroke });
  };

  const handleClear = () => {
    if (!socket || !canClear) {
      toast.error('Only the teacher can clear the whiteboard.');
      return;
    }

    socket.emit('whiteboard-clear', { classroomId });
  };

  const handleToggleStudentWriting = () => {
    if (!socket || !canClear) return;
    socket.emit('whiteboard-set-permission', {
      classroomId,
      studentsCanWrite: !studentsCanWrite,
    });
  };

  const handleLocalReset = () => {
    redrawAll();
    toast.success('Whiteboard view refreshed');
  };

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl bg-slate-900 border border-slate-700">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700 bg-slate-800 px-4 py-3">
        <div>
          <h3 className="text-sm font-semibold text-white">Live Whiteboard</h3>
          <p className="text-xs text-slate-400">
            {strokeCount} synced strokes • {canClear ? 'Teacher controls board' : studentsCanWrite ? 'Student writing enabled' : 'View-only for students'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setTool('pen')}
            className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition ${
              tool === 'pen' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
            }`}
          >
            <Paintbrush className="h-4 w-4" /> Pen
          </button>
          <button
            type="button"
            onClick={() => setTool('eraser')}
            className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition ${
              tool === 'eraser' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
            }`}
          >
            <Eraser className="h-4 w-4" /> Eraser
          </button>

          <div className="flex items-center gap-1 rounded-lg bg-slate-700 px-2 py-1">
            {COLORS.map((nextColor) => (
              <button
                key={nextColor}
                type="button"
                aria-label={`Select ${nextColor}`}
                onClick={() => setColor(nextColor)}
                className={`h-6 w-6 rounded-full border-2 ${color === nextColor ? 'border-white' : 'border-transparent'}`}
                style={{ backgroundColor: nextColor }}
              />
            ))}
          </div>

          <label className="flex items-center gap-2 rounded-lg bg-slate-700 px-2 py-1 text-xs text-slate-200">
            Size
            <input
              type="range"
              min="2"
              max="12"
              value={width}
              onChange={(event) => setWidth(Number(event.target.value))}
              className="w-20 accent-blue-500"
            />
          </label>

          {canClear && (
            <button
              type="button"
              onClick={handleToggleStudentWriting}
              className={`inline-flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition ${
                studentsCanWrite ? 'bg-emerald-600 text-white hover:bg-emerald-700' : 'bg-amber-600 text-white hover:bg-amber-700'
              }`}
              title={studentsCanWrite ? 'Disable student writing' : 'Allow students to write'}
            >
              {studentsCanWrite ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
              {studentsCanWrite ? 'Students Write' : 'Students Locked'}
            </button>
          )}

          <button
            type="button"
            onClick={handleLocalReset}
            className="rounded-lg bg-slate-700 p-2 text-slate-200 hover:bg-slate-600"
            title="Refresh board view"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            type="button"
            onClick={handleClear}
            className={`rounded-lg p-2 ${canClear ? 'bg-red-600 text-white hover:bg-red-700' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}
            title={canClear ? 'Clear board for everyone' : 'Only teacher can clear'}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative min-h-[380px] flex-1 bg-white">
        {!canDraw && (
          <div className="absolute left-4 top-4 z-10 rounded-lg bg-slate-900/80 px-3 py-2 text-xs font-medium text-white shadow-lg backdrop-blur">
            Board is locked by teacher. You can watch live updates in 2D and 3D.
          </div>
        )}
        <canvas
          ref={canvasRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishStroke}
          onPointerCancel={finishStroke}
          onPointerLeave={finishStroke}
          className={`block h-full w-full touch-none ${canDraw ? 'cursor-crosshair' : 'cursor-not-allowed'}`}
        />
      </div>
    </div>
  );
};

export default RealtimeWhiteboard;
