import DashboardHeader from "../components/features/dashboard/DashboardHeader";
import CourseProgressCard from "../components/features/dashboard/CourseProgressCard";
import { useAuthStore } from "../stores/useAuthStore";
import { useCourseStore } from "../stores/useCourseStore";
import StatsCard from "../components/ui/StatsCard";
import { BookOpen,TrendingUp,Target,Award } from "lucide-react";



const Dashboard = () => {
  const { user } = useAuthStore();
  const { enrolledCourses } = useCourseStore();

  const totalCourses = enrolledCourses.length;

  const averageProgress = enrolledCourses.length > 0
    ? Math.floor(enrolledCourses.reduce((sum, course) => sum + course.progress, 0) / enrolledCourses.length)
    : 0;  

    const courseInProgress = enrolledCourses.filter(course => course.progress < 100).length;

    const completedCourses = enrolledCourses.filter(course => course.progress === 100).length;

  return (
    <div className="p-8 space-y-6 bg-gray-100 min-h-screen">
        {/* DashboardHeader Component */}
        <DashboardHeader userName={user?.name || "Guest"} />

        {/* Stats Section */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
  <StatsCard 
    title="Total Courses"
    value={totalCourses}
    icon={<BookOpen className="w-6 h-6 text-white" />}
    color="bg-blue-500"
  />
  <StatsCard 
    title="Average Progress"
    value={`${averageProgress}%`}
    icon={<TrendingUp className="w-6 h-6 text-white" />}
    color="bg-green-500"
  />
  <StatsCard 
    title="In Progress"
    value={courseInProgress}
    icon={<Target className="w-6 h-6 text-white" />}
    color="bg-yellow-500"
  />
  <StatsCard 
    title="Completed"
    value={completedCourses}
    icon={<Award className="w-6 h-6 text-white" />}
    color="bg-purple-500"
  />
</div>
        
        {/* Enrolled Courses Section */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">My Enrolled Courses</h2>
          
          {enrolledCourses.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-gray-500 text-lg mb-4">You haven't enrolled in any courses yet.</p>
              <a href="/courses" className="text-blue-600 hover:underline font-medium">
                Browse Courses →
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {enrolledCourses.map(course => (
                <CourseProgressCard 
                  key={course.courseId}
                  courseName={course.courseName}
                  progress={course.progress}
                  totalLessons={20}
                  completedLessons={Math.floor(course.progress * 20 / 100)}
                  dueDate={new Date(course.enrolledDate).toLocaleDateString()}
                />
              ))}
            </div>
          )}
        </div>
       
    </div>
    );
};
export default Dashboard;
