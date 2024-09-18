import React, { useState, useRef, useEffect, useContext } from 'react';
import TerminalComponent from './components/TerminalComponent';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import FileLister from './components/FileLister';
import TextEditor from './components/TextEditor';
import { io } from 'socket.io-client';
import LoginModule from './components/LoginModule';
import { UserContext } from '../context/UserContextComponent';
import './App.css'; // Assuming you add styles here

function App() {
  const [selectedFilePath, setSelectedFilePath] = useState('');
  const socketRef = useRef(null);
  const [isSocketReady, setIsSocketReady] = useState(false);
  const { userId, setUserId } = useContext(UserContext);
  const [sidebarWidth, setSidebarWidth] = useState(250); // Default sidebar width
  const resizerRef = useRef(null);
  const isResizing = useRef(false);

  useEffect(() => {
    if (userId) {
      socketRef.current = io('http://localhost:5000', {
        query: { userId: userId }
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

  const startResizing = (e) => {
    isResizing.current = true;
    document.addEventListener('mousemove', resizeSidebar);
    document.addEventListener('mouseup', stopResizing);
  };

  const resizeSidebar = (e) => {
    if (isResizing.current) {
      const newWidth = e.clientX; // Calculate the new width based on mouse position
      if (newWidth > 100 && newWidth < 600) { // Set min/max sidebar width
        setSidebarWidth(newWidth);
      }
    }
  };

  const stopResizing = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', resizeSidebar);
    document.removeEventListener('mouseup', stopResizing);
  };

  return (
    <Router>
      <Routes>
        {/* Navbar */}
        <Route path="/login" element={<LoginModule />} />
        <Route path="/" element={
          <>
            <div className="navbar">
              <div>My Navbar</div>
              <div>Menu</div>
            </div>

            {/* Main Content */}
            <div className="main-content">
              <div
                className="file-lister"
                style={{ width: `${sidebarWidth}px` }}
              >
                <FileLister onSelect={handleSelection} socket={socketRef.current} />
              </div>

              <div
                ref={resizerRef}
                className="resizer"
                onMouseDown={startResizing}
              ></div>

              <div className="content-area">
                <TextEditor filePath={selectedFilePath} />
                <TerminalComponent socket={socketRef.current} />
              </div>
            </div>
          </>
        } />
      </Routes>
    </Router>
  );
}

export default App;
