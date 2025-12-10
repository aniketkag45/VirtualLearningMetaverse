import { Link } from 'react-router-dom'
import { 
  GraduationCap, 
  Box, 
  Brain, 
  Wifi,
  Gamepad2,
  Languages,
  Award,
  ArrowRight 
} from 'lucide-react'
import { motion } from 'framer-motion'

const LandingPage = () => {
  const features = [
    {
      icon: <Box className="w-12 h-12 text-blue-500" />,
      title: "3D Virtual Classrooms",
      description: "Immersive learning environment with interactive 3D elements, virtual whiteboards, and real-time collaboration."
    },
    {
      icon: <Brain className="w-12 h-12 text-blue-500" />,
      title: "AI-Powered Learning",
      description: "Personalized learning paths, intelligent tutoring systems, and adaptive assessments for each student."
    },
    {
      icon: <Wifi className="w-12 h-12 text-blue-500" />,
      title: "Low-Bandwidth Optimized",
      description: "Designed for rural areas with limited internet connectivity. Works smoothly even on 2G/3G networks."
    },
    {
      icon: <Gamepad2 className="w-12 h-12 text-blue-500" />,
      title: "Gamified Experience",
      description: "Engaging game-based learning with rewards, badges, and leaderboards to boost student motivation."
    },
    {
      icon: <Languages className="w-12 h-12 text-blue-500" />,
      title: "Multi-Language Support",
      description: "Content available in regional languages to ensure accessibility for all rural students."
    },
    {
      icon: <Award className="w-12 h-12 text-blue-500" />,
      title: "Skill Certification",
      description: "Industry-recognized certificates upon course completion to enhance employability."
    }
  ]

  const stats = [
    { value: "500+", label: "Virtual Courses" },
    { value: "10,000+", label: "Students Enrolled" },
    { value: "85%", label: "Completion Rate" },
    { value: "200+", label: "Partner Schools" }
  ]

  const problems = [
    "Limited access to quality education in rural areas",
    "Shortage of qualified teachers and resources", 
    "Lack of hands-on skill development opportunities",
    "High dropout rates due to engagement issues",
    "Digital divide between urban and rural education"
  ]

  const solutions = [
    "Accessible 3D virtual classrooms from anywhere",
    "AI-powered personalized learning experiences",
    "Interactive virtual labs for practical training", 
    "Engaging gamified learning environment",
    "Low-bandwidth optimized for rural connectivity"
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 to-purple-700 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        
        <div className="relative container mx-auto px-6 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl lg:text-6xl font-bold mb-6">
                Transform Rural Education with Metaverse
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Bridging the digital divide through immersive 3D virtual classrooms, 
                interactive learning experiences, and AI-powered skill development for rural students.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Link 
                  to="/classroom"
                  className="btn-primary inline-flex items-center justify-center px-8 py-4 text-lg font-medium"
                >
                  <Box className="w-5 h-5 mr-2" />
                  Enter Virtual Classroom
                </Link>
                <Link 
                  to="/courses"
                  className="bg-transparent border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-medium inline-flex items-center justify-center transition-all duration-200"
                >
                  <GraduationCap className="w-5 h-5 mr-2" />
                  Browse Courses
                </Link>
              </div>

              <div className="text-sm text-blue-200">
                <p className="mb-1">Developed by:</p>
                <p className="font-semibold">
                  Aniket Kag 
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center"
            >
              <div className="float-animation">
                <GraduationCap className="w-64 h-64 mx-auto text-blue-200 opacity-80" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Key Features</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="card card-hover p-8 text-center"
              >
                <div className="mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="bg-white rounded-lg p-8 shadow-md"
              >
                <h3 className="text-4xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </h3>
                <p className="text-gray-600">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem vs Solution Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Problems */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-8 text-gray-900">
                The Problem We're Solving
              </h2>
              <div className="space-y-4">
                {problems.map((problem, index) => (
                  <div key={index} className="flex items-start p-4 bg-red-50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-red-500 flex-shrink-0 flex items-center justify-center mr-4 mt-0.5">
                      <span className="text-white text-sm">✕</span>
                    </div>
                    <p className="text-gray-700">{problem}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Solutions */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold mb-8 text-gray-900">
                Our Solution
              </h2>
              <div className="space-y-4">
                {solutions.map((solution, index) => (
                  <div key={index} className="flex items-start p-4 bg-green-50 rounded-lg">
                    <div className="w-6 h-6 rounded-full bg-green-500 flex-shrink-0 flex items-center justify-center mr-4 mt-0.5">
                      <span className="text-white text-sm">✓</span>
                    </div>
                    <p className="text-gray-700">{solution}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-700 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold mb-4">
              Ready to Experience the Future of Learning?
            </h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of students already transforming their education
            </p>
            <Link 
              to="/login"
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-lg font-medium inline-flex items-center text-lg transition-all duration-200 transform hover:scale-105"
            >
              Get Started Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

export default LandingPage