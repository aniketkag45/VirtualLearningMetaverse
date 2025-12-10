// User Types
export interface User {
  id: string
  email: string
  name: string
  role: 'STUDENT' | 'TEACHER' | 'ADMIN'
  enrollmentNumber?: string
  avatar?: string
  createdAt: string
  updatedAt: string
}

export interface AuthResponse {
  user: User
  accessToken: string
  refreshToken: string
}

export interface LoginRequest {
  email: string
  password: string
  userType: 'STUDENT' | 'TEACHER' | 'ADMIN'
}

export interface RegisterRequest {
  firstName: string
  lastName: string
  email: string
  password: string
  confirmPassword: string
  userType: 'STUDENT' | 'TEACHER' | 'ADMIN'
  enrollmentNumber?: string
  phone?: string
}

// Course Types
export interface Course {
  id: string
  title: string
  description: string
  instructor: User
  category: string
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  duration: number // in minutes
  price: number
  rating: number
  studentsCount: number
  thumbnail?: string
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface Enrollment {
  id: string
  student: User
  course: Course
  progress: number // 0-100
  completedLessons: number
  totalLessons: number
  enrolledAt: string
  completedAt?: string
  status: 'ACTIVE' | 'COMPLETED' | 'PAUSED'
}

// Lesson Types
export interface Lesson {
  id: string
  courseId: string
  title: string
  description: string
  content: string
  videoUrl?: string
  duration: number
  order: number
  type: 'VIDEO' | 'TEXT' | 'INTERACTIVE' | 'VR_CLASSROOM'
  resources: LessonResource[]
  createdAt: string
}

export interface LessonResource {
  id: string
  name: string
  type: 'PDF' | 'VIDEO' | 'LINK' | 'IMAGE'
  url: string
  size?: number
}

// Virtual Classroom Types
export interface VirtualClassroom {
  id: string
  courseId: string
  title: string
  description: string
  instructor: User
  scheduledAt: string
  duration: number
  maxParticipants: number
  currentParticipants: number
  status: 'SCHEDULED' | 'LIVE' | 'ENDED' | 'CANCELLED'
  meetingUrl?: string
  recordings: ClassroomRecording[]
}

export interface ClassroomRecording {
  id: string
  classroomId: string
  title: string
  url: string
  duration: number
  recordedAt: string
}

export interface ClassroomParticipant {
  id: string
  user: User
  joinedAt: string
  leftAt?: string
  status: 'JOINED' | 'LEFT' | 'MUTED' | 'CAMERA_OFF'
}

// Progress & Analytics Types
export interface StudentProgress {
  userId: string
  totalCourses: number
  completedCourses: number
  inProgressCourses: number
  totalLearningHours: number
  averageScore: number
  completedAssignments: number
  totalAssignments: number
  attendanceRate: number
  certificates: Certificate[]
}

export interface Certificate {
  id: string
  courseId: string
  courseName: string
  studentId: string
  issuedAt: string
  certificateUrl: string
  score: number
}

// AI & Recommendation Types
export interface AIRecommendation {
  id: string
  userId: string
  type: 'COURSE' | 'LESSON' | 'SKILL' | 'CAREER_PATH'
  title: string
  description: string
  confidence: number // 0-1
  reasoning: string
  recommendedItem: Course | Lesson
  createdAt: string
}

export interface ChatMessage {
  id: string
  sender: User
  content: string
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'SYSTEM'
  timestamp: string
  classroomId?: string
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  errors?: string[]
}

export interface PaginatedResponse<T> {
  success: boolean
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Search & Filter Types
export interface CourseFilters {
  category?: string
  level?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED'
  priceRange?: {
    min: number
    max: number
  }
  rating?: number
  duration?: {
    min: number
    max: number
  }
  tags?: string[]
}

export interface SearchParams {
  query?: string
  filters?: CourseFilters
  sortBy?: 'TITLE' | 'PRICE' | 'RATING' | 'CREATED_AT' | 'POPULARITY'
  sortOrder?: 'ASC' | 'DESC'
  page?: number
  limit?: number
}

// WebSocket Types
export interface WebSocketMessage {
  type: 'JOIN_CLASSROOM' | 'LEAVE_CLASSROOM' | 'CHAT_MESSAGE' | 'HAND_RAISE' | 'SCREEN_SHARE' | 'TOGGLE_MIC' | 'TOGGLE_CAMERA'
  payload: any
  timestamp: string
  userId: string
  classroomId?: string
}

// Form Types
export interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
}

// Notification Types
export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
  read: boolean
  createdAt: string
  actionUrl?: string
}

// File Upload Types
export interface FileUpload {
  file: File
  progress: number
  status: 'PENDING' | 'UPLOADING' | 'SUCCESS' | 'ERROR'
  url?: string
  error?: string
}