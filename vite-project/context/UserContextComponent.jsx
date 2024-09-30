import React, { createContext, useState,useEffect } from 'react'

export const UserContext = createContext();
const UserContextComponent = ({ children }) => {
    const [userId, setUserId] = useState(null);
    const [token, setToken] = useState(null);

    // On initial load, check if userId and token are stored in localStorage
    useEffect(() => {
        const storedUserId = localStorage.getItem('userId');
        const storedToken = localStorage.getItem('token');

        if (storedUserId && storedToken) {
            setUserId(storedUserId);
            setToken(storedToken);
        }
    }, []);

    // Whenever userId or token changes, save them to localStorage
    useEffect(() => {
        if (userId) {
            localStorage.setItem('userId', userId);
            localStorage.setItem('token', token);
        }
    }, [userId, token]);

    const logout = () => {
        localStorage.removeItem('userId');
        localStorage.removeItem('token');
        setUserId(null);
        setToken(null);
      };

    return (
        <UserContext.Provider value={{ userId, setUserId, token, setToken,logout }}>
            {children}
        </UserContext.Provider>
    )
}

export default UserContextComponent