import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import { useAuthStore } from './stores/useAuthStore'
import { useCourseStore } from './stores/useCourseStore'
import  ProtectedRoute  from './components/auth/ProtectedRoute'


// Pages
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import Navbar from './components/layout/Navbar'
import CoursesPage from './pages/CoursesPage'
import CourseDetailsPage from './pages/CourseDetailsPage'
import ClassroomPage from './pages/ClassroomPage'

function App() {
  const initializeAuth = useAuthStore((state) => state.initializeAuth)
  const initializeCourses = useCourseStore((state) => state.initializeCourses)

  useEffect(() => {
    // Initialize authentication and courses on app load
    initializeAuth()
    initializeCourses()
  }, []);
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <main>
          <Routes>
            {/* Public Routes - Anyone can access */}
<Route path="/" element={<LandingPage />} />
<Route path="/login" element={<LoginPage />} />

{/* Protected Routes - Only logged in users */}
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
<Route path="/courses" element={
  <ProtectedRoute>
    <CoursesPage />
  </ProtectedRoute>
} />
<Route path="/courses/:courseId" element={
  <ProtectedRoute>
    <CourseDetailsPage />
  </ProtectedRoute>
} />
<Route path="/classroom" element={
  <ProtectedRoute>
    <ClassroomPage />
  </ProtectedRoute>
} />

                      
          </Routes>
        </main>
        
        {/* Global Toast Notifications */}
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    </Router>
  )
}

export default App