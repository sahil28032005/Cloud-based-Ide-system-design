import React, { createContext, useState } from 'react'

export const UserContext = createContext();
const UserContextComponent = ({ children }) => {
    const [userId, setUserId] = useState(null);
    return (
        <UserContext.Provider value={{ userId, setUserId }}>
            {children}
        </UserContext.Provider>
    )
}

export default UserContextComponent