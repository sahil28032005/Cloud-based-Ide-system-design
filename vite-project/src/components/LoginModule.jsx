import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button"; // Ensure these are your Shadcn UI components
import { Input } from "@/components/ui/input"; // Ensure these are your Shadcn UI components
import './Login.css';
import { UserContext } from '../../context/UserContextComponent';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { userId, setUserId, setToken } = useContext(UserContext);
  const [email, setEmail] = useState(''); // Added state for email
  const [isSignUp, setIsSignUp] = useState(false); // State to toggle between login and signup
  const navigate = useNavigate(); // Initialize the useNavigate hook

  const handleGoogleSignIn = async() => {
    // Add Google sign-in logic here
    window.location.href = 'http://localhost:5002/auth/google';
    // const response = await axios.get('http://localhost:5002/auth/google');// Include cookies if you are using sessions
    
  };

  const handleGithubSignIn = () => {
    // Add GitHub sign-in logic here
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    // Add login logic here with username and password
    console.log('Username:', username);
    console.log('Password:', password);
    // Add your login logic here, e.g., API call to your backend
    try {
      const response = await axios.post('http://localhost:5002/api/users/login', {
        email: username,
        password
      });

      if (response.status == 200) {
        await setUserId(response.data.userId);
        await setToken(response.data.token);

        console.log('Logged in successfully:', response.data);

        //redirect to repels displayer page
        navigate(`/repos/${userId}`);
      }
      else {
        console.error('Login failed:', response.statusText);
      }
    }
    catch (err) {
      console.error('Error during login:', error.response ? error.response.data : error.message);
    }
  };

  const handleSignUp = (e) => {
    e.preventDefault();
    // Add sign-up logic here with username, email, and password
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Left Section for Information */}
      <motion.div
        className="flex-1 flex flex-col items-start justify-center p-8 lg:px-16"
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl lg:text-5xl font-bold mb-6 typing-animation">
          Welcome to My Cloud IDE
        </h1>
        <p className="text-base lg:text-lg mb-4">
          Experience a powerful development environment right from your browser.
          Collaborate with your team in real-time and deploy your projects instantly.
        </p>

        <h2 className="text-2xl lg:text-3xl font-semibold mb-4">Key Features</h2>
        <ul className="list-disc list-inside text-gray-300 space-y-2">
          {[
            "✨ Real-time collaboration with your team",
            "🚀 Instant deployment of your projects",
            "📁 Integrated file management system",
            "🛠️ Extensive library support for multiple languages",
            "🔒 Secure cloud storage for all your projects",
          ].map((feature, index) => (
            <motion.li
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
            >
              {feature}
            </motion.li>
          ))}
        </ul>
      </motion.div>

      {/* Right Section for Authentication */}
      <motion.div
        className="flex-1 flex items-center justify-center p-8 lg:px-16"
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="bg-gray-850 rounded-lg shadow-lg p-6 sm:p-8 md:p-10 lg:p-10 max-w-xs lg:max-w-sm w-full transition-transform duration-300 hover:scale-105">
          <h1 className="text-3xl lg:text-4xl font-bold mb-8 text-center typing-animation">
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </h1>

          <form onSubmit={isSignUp ? handleSignUp : handleLogin} className="space-y-4">
            {/* Email Input (for Sign Up) */}
            {isSignUp && (
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-gray-800 text-white border border-transparent focus:border-b-2 focus:border-b-purple-500 transition-all"
                required
              />
            )}

            {/* Username Input */}
            <Input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="bg-gray-800 text-white border border-transparent focus:border-b-2 focus:border-b-purple-500 transition-all"
              required
            />

            {/* Password Input */}
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-gray-800 text-white border border-transparent focus:border-b-2 focus:border-b-purple-500 transition-all"
              required
            />

            {/* Login/Sign Up Button */}
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 transition-all py-2 rounded-md">
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </Button>
          </form>

          {/* Toggle to Switch Between Login and Sign Up */}
          <div className="mt-4 text-center">
            <span className="text-gray-300">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </span>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-400 hover:underline ml-1"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </div>

          {/* Google Sign In Button */}
          <motion.button
            onClick={handleGoogleSignIn}
            className="mt-4 w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 transition-all py-2 rounded-md shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 48 48" fill="none">
              <path d="M24 9c0-.3 0-.5 0-.8-.3 0-.6 0-.9.1C21.7 8.4 20 8 18.3 8c-4.2 0-7.6 3.4-7.6 7.5S14 23 18.3 23c1.8 0 3.5-.7 4.7-1.8l2.4 2.4c-2.4 2.2-5.5 3.4-8.7 3.4-6.7 0-12-5.4-12-12S12.3 5 19 5c2.3 0 4.5.6 6.4 1.6l-3.4 3.4c-.6-.2-1.2-.3-1.8-.3-2.7 0-4.9 2.2-4.9 4.9 0 2.6 2.2 4.8 4.9 4.8.4 0 .8 0 1.2-.1l2.5 2.5c-.7.4-1.5.6-2.3.6-3.9 0-7.1-3.2-7.1-7.1 0-3.9 3.2-7.1 7.1-7.1 1.1 0 2.2.2 3.3.5C23.3 9.3 24 9 24 9z" fill="#ffffff" />
            </svg>
            Sign in with Google
          </motion.button>

          {/* GitHub Sign In Button */}
          <motion.button
            onClick={handleGithubSignIn}
            className="mt-4 w-full flex items-center justify-center bg-gray-700 hover:bg-gray-600 transition-all py-2 rounded-md shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none">
              <path fillRule="evenodd" clipRule="evenodd" d="M12 0C5.371 0 0 5.371 0 12c0 5.291 3.438 9.801 8.207 11.387.6.111.82-.261.82-.577 0-.285-.011-1.04-.017-2.045-3.338.725-4.042-1.607-4.042-1.607-.546-1.386-1.333-1.756-1.333-1.756-1.092-.746.083-.731.083-.731 1.208.085 1.839 1.237 1.839 1.237 1.071 1.83 2.809 1.298 3.492.993.108-.775.419-1.298.763-1.597-2.665-.303-5.466-1.332-5.466-5.925 0-1.311.467-2.386 1.236-3.223-.124-.303-.535-1.533.117-3.194 0 0 1.007-.322 3.301 1.229.957-.266 1.984-.398 3.003-.403 1.019.005 2.046.137 3.003.403 2.295-1.551 3.301-1.229 3.301-1.229.653 1.661.242 2.891.118 3.194.77.837 1.236 1.912 1.236 3.223 0 4.609-2.806 5.618-5.471 5.913.431.372.817 1.099.817 2.218 0 1.604-.014 2.897-.014 3.29 0 .319.218.692.825.577C20.563 21.801 24 17.291 24 12c0-6.629-5.371-12-12-12z" fill="#ffffff" />
            </svg>
            Sign in with GitHub
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;
