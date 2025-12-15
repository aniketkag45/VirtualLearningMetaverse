import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore, User } from "../stores/useAuthStore";

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
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
          userType: email.includes('teacher') || email.includes('instructor') ? 'teacher' : 'student'
        };

      
        // Call the login function from the auth store
        login(userdata);
        // For now, just log the credentials
        console.log('Email:', email, 'Password:', password);
        
        // Navigate to dashboard
        navigate('/dashboard');
    }

     return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Login</h1>
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
      </form>
    </div>
  )

}

export default LoginPage;

        