import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, User } from "../stores/useAuthStore";

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'student' | 'teacher'>('student');
    const [error, setError] = useState({email: '', password: ''});
    const navigate = useNavigate();
    const { login } = useAuthStore();

    const validateForm = () => {
      const newError = {email: '', password: ''};
      if(!email) {
        newError.email = 'Email is required';
      }else if(!/\S+@\S+\.\S+/.test(email)) {
        newError.email = 'Email is invalid';
      }
      if(!password) {
        newError.password = 'Password is required';
      }else if(password.length < 6) {
        newError.password = 'Password must be at least 6 characters';
      }
      setError(newError);
      return !newError.email && !newError.password;
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Simple validation
        if (!validateForm()) {
            
            return;
        }

        const userdata: User = {
          id: Date.now().toString(),
          email: email,
          name: email.split('@')[0],
          userType: selectedRole
        };

      
        // Call the login function from the auth store
        login(userdata);
        // For now, just log the credentials
        console.log('Email:', email, 'Password:', password);
        
        // Navigate to dashboard
        navigate('/dashboard');
    }

    const handleDemoLogin = (role: 'student' | 'teacher') => {
      const demoUser: User = {
        id: `${role}-${Date.now()}`,
        email: `${role}.demo@vlm.app`,
        name: role === 'teacher' ? 'Demo Teacher' : 'Demo Student',
        userType: role,
      };

      login(demoUser);
      navigate('/dashboard');
    };

     return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h1>

        <div className="mb-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Select Role</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setSelectedRole('student')}
              className={`py-2 rounded-lg border transition-colors ${
                selectedRole === 'student'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              Student
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('teacher')}
              className={`py-2 rounded-lg border transition-colors ${
                selectedRole === 'teacher'
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
              }`}
            >
              Teacher
            </button>
          </div>
        </div>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className={`w-full mb-1 px-4 py-2 border rounded-lg ${
            error.email ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {error.email && (
          <p className="text-red-500 text-sm mb-3">{error.email}</p>
        )}
        
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className={`w-full mb-1 px-4 py-2 border rounded-lg ${
            error.password ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {error.password && (
          <p className="text-red-500 text-sm mb-3">{error.password}</p>
        )}
        <button type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
          Login
          </button>

        <p className="text-xs text-gray-500 mt-3 text-center">
          Demo mode: any email and password (min 6 chars) works.
        </p>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-700 mb-2 text-center">Quick Demo Access</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleDemoLogin('student')}
              className="py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
            >
              Demo Student
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin('teacher')}
              className="py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Demo Teacher
            </button>
          </div>
        </div>
      </form>
    </div>
  )

}

export default LoginPage;

        