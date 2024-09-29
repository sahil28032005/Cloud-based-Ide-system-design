import React, { useState, useContext } from 'react';
import './Login.css'; // Ensure you create this CSS file or use inline styles
import { UserContext } from '../../context/UserContextComponent';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const { setUserId } = useContext(UserContext);
    const navigate = useNavigate(); // Initialize the useNavigate hook

    const handleLogin = async (event) => {
        event.preventDefault();
        console.log('Username:', username);
        console.log('Password:', password);
        // Add your login logic here, e.g., API call to your backend
        try {
            const response = await axios.post('http://localhost:5002/api/users/login', {
                email: username,
                password
            });

            if (response.status == 200) {
                setUserId(response.data.userId);
                console.log('Logged in successfully:', response.data);

                //redirect to repels displayer page
                navigate("/");
            }
            else {
                console.error('Login failed:', response.statusText);
            }
        }
        catch (err) {
            console.error('Error during login:', error.response ? error.response.data : error.message);
        }

    };

    const handleGoogleLogin = () => {
        // Logic for Google sign-in goes here
        console.log('Google sign-in clicked');
    };

    const handleGitHubLogin = () => {
        // Logic for GitHub sign-in goes here
        console.log('GitHub sign-in clicked');
    };

    return (
        <div className="login-container">
            <h1>Welcome Back!</h1>
            <form onSubmit={handleLogin}>
                <input
                    type="text"
                    placeholder="Username"
                    className="input-field"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    className="input-field"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit" className="login-button">Login</button>
            </form>

            <div className="oauth-container">
                <button className="oauth-button google-button" onClick={handleGoogleLogin}>Sign in with Google</button>
                <button className="oauth-button github-button" onClick={handleGitHubLogin}>Sign in with GitHub</button>
            </div>

            <div className="footer">
                <p>Don't have an account? <a href="#">Sign Up</a></p>
            </div>
        </div>
    );
};

export default Login;
