import { BookOpen, Clock } from 'lucide-react'

interface CourseProgressCardProps {
    courseName: string
    progress: number // 0-100
    totalLessons: number
    completedLessons: number
    dueDate?: string
}

function CourseProgressCard({ 
    courseName, 
    progress, 
    totalLessons, 
    completedLessons, 
    dueDate 
}: CourseProgressCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow duration-300">
      {/* Course Name and Progress Percentage */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-500" />
          {courseName}
        </h3>
        <span className="text-2xl font-bold text-blue-600">{progress}%</span>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Lesson Count and Due Date */}
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-600">
          {completedLessons}/{totalLessons} lessons completed
        </span>
        {dueDate && (
          <span className="text-gray-500 flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Due: {dueDate}
          </span>
        )}
      </div>
    </div>
  )
}

export default CourseProgressCard