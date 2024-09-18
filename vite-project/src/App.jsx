import React, { useState, useRef, useEffect, useContext } from 'react';
import TerminalComponent from './components/TerminalComponent';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import FileLister from './components/FileLister';
import TextEditor from './components/TextEditor';
import { io } from 'socket.io-client';
import LoginModule from './components/LoginModule';
import { UserContext } from '../context/UserContextComponent'

function App() {
  const [selectedFilePath, setSelectedFilePath] = useState('');
  const socketRef = useRef(null);
  const [isSocketReady, setIsSocketReady] = useState(false);
  const { userId, setUserId } = useContext(UserContext);
  useEffect(() => {
    if (userId) {
      socketRef.current = io('http://localhost:5000', {
        query: { userId: userId }  // Pass userId as an object
      });
      socketRef.current.on('connect', () => {
        setIsSocketReady(true);
      });

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }

  }, [userId]);

  const handleSelection = (path) => {
    setSelectedFilePath(path);
  };

  // if (!isSocketReady) {
  //   return <div>Loading...</div>;
  // }

  return (
    <Router>
      <Routes>
        {/* Navbar */}
        <Route path="/login" element={<LoginModule />} />
        <Route path="/" element={<><div style={{
          height: '50px',
          backgroundColor: 'lightblue',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px'
        }}>
          <div>My Navbar</div>
          <div>Menu</div>
        </div>

          {/* Main Content */}
          <div style={{ display: 'flex', height: 'calc(100vh - 50px)' }}>
            <div style={{ height: '100%', width: '15%', background: 'gray' }}>
              <FileLister onSelect={handleSelection} socket={socketRef.current} />
            </div>
            <div style={{ width: '100%' }}>
              <TextEditor filePath={selectedFilePath} />
              <TerminalComponent socket={socketRef.current} />
            </div>
          </div></>} />
      </Routes>


    </Router>
  );
}

export default App;
