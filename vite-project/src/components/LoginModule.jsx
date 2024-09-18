import React, { useState, useContext } from 'react'
import {UserContext} from '../../context/UserContextComponent'
import { useNavigate } from 'react-router-dom';

const LoginModule = () => {
    const [username, setUsername] = useState('');
    const [password, setPassowrd] = useState('');
    const [error, setError] = useState(null);

    const navigate = useNavigate(); 

    const {userId, setUserId } = useContext(UserContext); //getting function from context

    //login hndler
    const handleLogin = async () => {
        try {
            const response = await fetch('http://localhost:5000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();

            if (data) {
                await setUserId(data.userId); // Set userId in context
                navigate('/');
            } else {
                setError('Invalid credentials');
            }
        } catch (err) {
            setError('Login failed');
        }
    };
    return (
        <div>
           { console.log("arrived userId",userId)};
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassowrd(e.target.value)}
            />
            <button onClick={handleLogin}>Login</button>
            {error && <p>{error}</p>}
        </div>
    );
}

export default LoginModule