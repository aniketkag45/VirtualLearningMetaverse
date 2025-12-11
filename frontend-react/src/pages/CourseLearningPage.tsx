import { useState } from "react";
import { useParams } from "react-router-dom";
import { coursesData} from "../data/coursesData";
import { Lesson } from "../types";
import { useCourseStore } from "../stores/useCourseStore";
import toast from "react-hot-toast";

const CourseLearningPage = () => {
    const { courseId } = useParams<{ courseId: string }>();
    const course = coursesData.find(c => c.id === courseId);
    const firstLesson = course?.modules[0]?.lessons[0] || null;
    const [currentLesson, setCurrentLesson] = useState<Lesson | null>(firstLesson);
    const { markLessonComplete, isLessonCompleted } = useCourseStore();
    const { getCourseProgress } = useCourseStore();
    const progress = courseId ? getCourseProgress(courseId) : 0;

        const handleMarkComplete = () => {
        if (currentLesson && courseId) {
            markLessonComplete(courseId, currentLesson.id);
            toast.success(`Marked "${currentLesson.title}" as complete!`);
        }
    };

    if (!course) {
        return <div className="p-6">Course not found.</div>;
    }

    return (
         <div className="flex h-screen">
            {/* Left Sidebar - Module List */}
            <div className="w-1/3 bg-gray-100 p-4">
               {course.modules.map((module) => (
  <div key={module.id} className="mb-6">
    <h3 className="font-bold text-lg mb-2">{module.title}</h3>
    <div className="space-y-2">
      {module.lessons.map((lesson) => (
        <div
          key={lesson.id}
          onClick={() => setCurrentLesson(lesson)}
          className={`p-3 rounded cursor-pointer ${
            currentLesson?.id === lesson.id 
              ? 'bg-blue-500 text-white' 
              : 'bg-white hover:bg-gray-200'
          }`}
        >
         <p className="font-medium">
  {isLessonCompleted(courseId || '', lesson.id) && '✓ '}
  {lesson.title}
</p>
          <p className="text-sm">{lesson.duration} minutes</p>
        </div>
      ))}
    </div>
  </div>
))}
            </div>
            
            {/* Right Side - Video Player */}
            <div className="w-2/3 p-6">
               {currentLesson ? (
                
  <div>

    {/* Progress Bar */}
<div className="mb-6">
  <div className="flex justify-between items-center mb-2">
    <span className="text-sm font-medium text-gray-700">Course Progress</span>
    <span className="text-sm font-medium text-gray-700">{progress}%</span>
  </div>
  <div className="w-full bg-gray-200 rounded-full h-3">
    <div 
      className="bg-green-500 h-3 rounded-full transition-all duration-300"
      style={{ width: `${progress}%` }}
    ></div>
  </div>
</div>

    <h1 className="text-3xl font-bold mb-4">{currentLesson.title}</h1>

    
    
    {/* YouTube Video Player */}
    <div className="mb-6">
      <iframe
        width="100%"
        height="500"
        src={currentLesson.videoUrl}
        title={currentLesson.title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    </div>
    
    {/* Lesson Info */}
    <div className="mb-4">
      <p className="text-gray-600 mb-2">
        <span className="font-semibold">Duration:</span> {currentLesson.duration} minutes
      </p>
      <p className="text-gray-700">{currentLesson.description}</p>
    </div>
    
    {/* Mark Complete Button - We'll add functionality later */}
   <button 
  onClick={handleMarkComplete}
  disabled={isLessonCompleted(courseId || '', currentLesson.id)}
  className={`px-6 py-3 rounded-lg ${
    isLessonCompleted(courseId || '', currentLesson.id)
      ? 'bg-gray-400 text-white cursor-not-allowed'
      : 'bg-green-500 text-white hover:bg-green-600'
  }`}
>
  {isLessonCompleted(courseId || '', currentLesson.id) 
    ? '✓ Completed' 
    : 'Mark as Complete'}
</button>
  </div>
) : (
  <div className="flex items-center justify-center h-full">
    <p className="text-gray-500 text-xl">Select a lesson to start learning</p>
  </div>
)}
            </div>
        </div>
    );
};


export default CourseLearningPage;