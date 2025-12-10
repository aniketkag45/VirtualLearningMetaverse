import {useState} from "react";
import { Link } from "react-router-dom";
import {Menu,X,Home,BookOpen,User,Video,LogOut} from 'lucide-react';
import { useAuthStore } from "../../stores/useAuthStore";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();

    return (
        <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
                {/* Left side - Logo and Desktop Nav Links */}
                <div className="flex">
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="text-2xl font-bold text-blue-600">VLM</Link>
                    </div>
                    {/* Desktop Navigation - Hidden on mobile */}
                    <div className="hidden md:ml-6 md:flex md:space-x-8">
                        <Link to="/dashboard" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-gray-900">
                            <Home className="w-5 h-5 mr-1"/> Dashboard
                        </Link>
                        <Link to="/courses" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-gray-900">
                            <BookOpen className="w-5 h-5 mr-1"/> Courses
                        </Link>
                        <Link to="/classroom" className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-700 hover:border-blue-500 hover:text-gray-900">
                            <Video className="w-5 h-5 mr-1"/> Classroom
                        </Link>
                    </div>
                </div>

                {/* Right side - User Menu and Mobile Menu Button */}
                <div className="flex items-center gap-4">
                    {/* User Menu Button - Always visible */}
                    <div className="relative">
                        <button 
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
                        >
                            <User className="w-6 h-6" />
                            <span className="hidden md:block text-sm font-medium">{user?.name || "Guest"}</span>
                        </button>

                        {/* User Dropdown Menu - Shows when isUserMenuOpen is true */}
                        {isUserMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                                <Link 
                                    to="/profile" 
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => setIsUserMenuOpen(false)}
                                >
                                    <User className="w-4 h-4 inline mr-2" />
                                    Profile
                                </Link>
                                <button 
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                    onClick={() => {
                                        setIsUserMenuOpen(false)
                                        // Add logout logic here later
                                        logout();
                                        navigate('/login');
                                    }}
                                >
                                    <LogOut className="w-4 h-4 inline mr-2" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button - Only shows on mobile */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100"
                    >
                        {isMobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Panel - Shows when isMobileMenuOpen is true */}
            {isMobileMenuOpen && (
                <div className="md:hidden">
                    <div className="pt-2 pb-3 space-y-1">
                        <Link 
                            to="/dashboard" 
                            className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <Home className="w-5 h-5 mr-3" /> Dashboard
                        </Link>
                        <Link 
                            to="/courses" 
                            className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <BookOpen className="w-5 h-5 mr-3" /> Courses
                        </Link>
                        <Link 
                            to="/classroom" 
                            className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-600"
                            onClick={() => setIsMobileMenuOpen(false)}
                        >
                            <Video className="w-5 h-5 mr-3" /> Classroom
                        </Link>
                    </div>
                </div>
            )}
        </div>
        </nav>
    );

};
export default Navbar;