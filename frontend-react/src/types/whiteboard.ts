export type WhiteboardTool = 'pen' | 'eraser';

export interface WhiteboardPoint {
  x: number;
  y: number;
}

export interface WhiteboardStroke {
  id: string;
  classroomId: string;
  userId: string;
  userName: string;
  tool: WhiteboardTool;
  color: string;
  width: number;
  points: WhiteboardPoint[];
  createdAt: number;
}
