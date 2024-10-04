import { useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

const AuthCallback = () => {
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        const fetchAuthData = async () => {
            try {
                const params = new URLSearchParams(location.search);
                const token = params.get('token');
                const userId = params.get('userId');
                const username = params.get('username');
                const email = params.get('email');
                const avatar = params.get('avatar');

                localStorage.setItem('token', token);
                localStorage.setItem('userId', userId);

                console.log("token: " , token);
                console.log("userId: " , userId);
                navigate(`/repos/${userId}`);
                // You might need to redirect to your backend callback here
                // const response = await axios.get('http://localhost:5002/auth/google/callback', { withCredentials: true });
                
                // // Assuming the response contains the token and user data
                // console.log('Auth response:', response.data);

                // // Handle the user data and token (e.g., save to state, localStorage, etc.)
                // const { token, user } = response.data;

                // // Save the token (you can also save user data as needed)
                // localStorage.setItem('token', token);
                // // Optionally save user data
                // // localStorage.setItem('user', JSON.stringify(user));

                // // Redirect to another route after successful login
                // navigate('/dashboard'); // Redirect to your desired route
            } catch (error) {
                console.error('Error fetching auth data', error);
                // Handle errors (e.g., show error message, redirect to login, etc.)
                navigate('/problem');
            }
        };

        fetchAuthData();
    }, [navigate]);

    return <div>Loading...</div>; // Optional loading indicator
};

export default AuthCallback;
