import Card from "../components/ui/Card";
import StatBadge from "../components/ui/StatBadge";
import DashboardHeader from "../components/features/dashboard/DashboardHeader";
import CourseProgressCard from "../components/features/dashboard/CourseProgressCard";
import { GraduationCap,AlertCircle,CheckCircle,Clock,Info, Users, BookOpen, TrendingUp, School } from "lucide-react";

const TestCard = () => {

    const handleClick = () => {
        alert('Card clicked!');
    }
    
    return (
         <div className="p-8 space-y-6 bg-gray-100 min-h-screen">

            {/* DashboardHeader Component Testing */}
<h2 className="text-2xl font-bold mb-6 text-gray-800">DashboardHeader Component</h2>
<DashboardHeader userName="Aniket" />

{/* Divider */}
<div className="border-t-4 border-gray-300 my-8"></div>


{/* CourseProgressCard Testing */}
<h2 className="text-2xl font-bold mb-6 text-gray-800">CourseProgressCard Component</h2>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  <CourseProgressCard 
    courseName="React Fundamentals"
    progress={75}
    totalLessons={40}
    completedLessons={30}
    dueDate="Dec 15, 2025"
  />
  <CourseProgressCard 
    courseName="TypeScript Basics"
    progress={45}
    totalLessons={25}
    completedLessons={11}
  />
</div>

<div className="border-t-4 border-gray-300 my-8"></div>

      <h1 className="text-3xl font-bold mb-8 text-gray-800">Card Component Testing</h1>
      
      <p className="text-green-600 font-bold mb-6">✅ Cards are working! Testing all variants below:</p>
      
      {/* Card 1 - Default variant */}
      <Card 
        title="Mathematics Course"
        description="Complete course with 45 lessons and interactive quizzes"
        icon={<GraduationCap className="w-6 h-6 text-blue-500" />}
        variant="default"
      />
      
      {/* Card 2 - Urgent variant */}
      <Card
        title="Assignment Due Soon!"
        description="Physics lab report due in 2 hours"
        icon={<AlertCircle className="w-6 h-6 text-red-600" />}
        variant="urgent"
      />
      
      {/* Card 3 - Success variant */}
      <Card
        title="Quiz Completed!"
        description="You scored 95% on Mathematics Quiz"
        icon={<CheckCircle className="w-6 h-6 text-green-600" />}
        variant="success"
      />
      
      {/* Card 4 - Warning variant with onClick */}
      <Card
        title="Upcoming Class"
        description="Chemistry class starts in 30 minutes - Click me!"
        icon={<Clock className="w-6 h-6 text-yellow-600" />}
        variant="warning"
        onClick={handleClick}
      />
      
      {/* Card 5 - Info variant with children */}
      <Card
        title="Course Progress"
        icon={<Info className="w-6 h-6 text-blue-600" />}
        variant="info"
      >
        <p className="font-semibold mb-2">This card uses children instead of description!</p>
        <div className="space-y-1">
          <p>✓ Mathematics: 78% complete</p>
          <p>✓ Physics: 65% complete</p>
          <p>✓ Chemistry: 82% complete</p>
        </div>
      </Card>

      {/* Divider */}
      <div className="border-t-4 border-gray-300 my-8"></div>

      {/* StatBadge Component Testing */}
      <h2 className="text-2xl font-bold mb-6 text-gray-800">StatBadge Component Testing</h2>
      <p className="text-green-600 font-bold mb-6">✅ Testing StatBadge with different colors!</p>

      {/* StatBadges in a grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Blue StatBadge */}
        <StatBadge 
          value="500+"
          label="Courses"
          icon={<BookOpen className="w-8 h-8 text-blue-500" />}
          color="blue"
        />

        {/* Green StatBadge */}
        <StatBadge 
          value="10,000+"
          label="Students"
          icon={<Users className="w-8 h-8 text-green-500" />}
          color="green"
        />

        {/* Orange StatBadge */}
        <StatBadge 
          value="85%"
          label="Success Rate"
          icon={<TrendingUp className="w-8 h-8 text-orange-500" />}
          color="orange"
        />

        {/* Purple StatBadge */}
        <StatBadge 
          value="200+"
          label="Partner Schools"
          icon={<School className="w-8 h-8 text-purple-500" />}
          color="purple"
        />

      </div>

      {/* StatBadge without icon */}
      <div className="mt-6">
        <p className="text-gray-600 mb-3">StatBadge without icon:</p>
        <div className="max-w-xs">
          <StatBadge 
            value="99.9%"
            label="Uptime"
            color="green"
          />
        </div>
      </div>

    </div>
  )
}

export default TestCard