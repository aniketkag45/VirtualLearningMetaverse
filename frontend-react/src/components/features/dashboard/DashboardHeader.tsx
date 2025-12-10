import StatBadge from '../../ui/StatBadge'
import { Users, BookOpen, TrendingUp, School } from 'lucide-react'

interface DashboardHeaderProps {
  userName: string
}

function DashboardHeader({ userName }: DashboardHeaderProps) {
  // Get current hour to determine greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good Morning'
    if (hour < 18) return 'Good Afternoon'
    return 'Good Evening'
  }

  return (
    <div>
        <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{getGreeting()}, {userName}! 👋</h1>
            <p className="text-gray-600 mt-2">Here's what's happening with your learning today.</p>
        </div>

        {/* Stat Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <StatBadge 
                value="500+"
                label="Courses"
                icon={<BookOpen className="w-8 h-8 text-blue-500" />}
                color="blue"
            />
            <StatBadge 
                value="10,000+"
                label="Students"
                icon={<Users className="w-8 h-8 text-green-500" />}
                color="green"
            />
            <StatBadge 
                value="85%"
                label="Success Rate"
                icon={<TrendingUp className="w-8 h-8 text-orange-500" />}
                color="orange"
            />
            <StatBadge 
                value="200+"
                label="Partner Schools"
                icon={<School className="w-8 h-8 text-purple-500" />}
                color="purple"
            />
        </div>
    </div>
  )
}

export default DashboardHeader
