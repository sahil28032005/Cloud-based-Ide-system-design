import React, { useState, useRef, useEffect, useContext } from 'react';
import TerminalComponent from './components/TerminalComponent';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import FileLister from './components/FileLister';
import TextEditor from './components/TextEditor';
import { io } from 'socket.io-client';
import LoginModule from './components/LoginModule';
import { UserContext } from '../context/UserContextComponent';
import './App.css'; // Your styles
import Repos from './components/Repos';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card"; // Shadcn Card component
import Navbar from './components/Navbar'; // Adjust this if needed
import './index.css';
import Home from './components/Home';

function App() {
    const [selectedFilePath, setSelectedFilePath] = useState('');
    const socketRef = useRef(null);
    const [isSocketReady, setIsSocketReady] = useState(false);
    const { userId } = useContext(UserContext);
    const [sidebarWidth, setSidebarWidth] = useState(300); // Increased default sidebar width
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
            const newWidth = e.clientX;
            if (newWidth > 200 && newWidth < 600) { // Adjusted min/max sidebar width
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
                <Route path="/login" element={<LoginModule />} />
                <Route path="/" element={
                    <>
                        <Navbar />

                        <div className="flex bg-gray-800 min-h-screen">
                            {/* Sidebar for file lister */}
                            <div
                                className="bg-gray-900 shadow-lg"
                                style={{ width: `${sidebarWidth}px` }}
                            >
                                <FileLister onSelect={handleSelection} socket={socketRef.current} />
                            </div>

                            <div
                                ref={resizerRef}
                                className="resizer cursor-ew-resize w-1 bg-gray-700"
                                onMouseDown={startResizing}
                            ></div>

                            {/* Main Content Area */}
                            <div className="flex-1 p-4 flex flex-col">
                                {/* Toolbar for Text Editor */}
                                <div className="flex justify-between mb-4">
                                    <Button variant="outline" className="mr-2">Run</Button>
                                    <Button variant="outline" className="mr-2">Save</Button>
                                    <Button variant="outline">New File</Button>
                                </div>

                                <div className="flex flex-grow">
                                    {/* Text Editor */}
                                    <Card className="bg-gray-800 flex-grow p-4 rounded-lg shadow-md">
                                        <h2 className="text-2xl font-bold text-white mb-4">Code Editor</h2>
                                        <TextEditor filePath={selectedFilePath} />
                                    </Card>

                                    {/* Terminal */}
                                    <div className="w-1 bg-gray-700 mx-2"></div> {/* Divider */}

                                    <Card className="bg-gray-800 flex-shrink-0 w-1/3 p-4 rounded-lg shadow-md">
                                        <h2 className="text-2xl font-bold text-white mb-4">Terminal</h2>
                                        <TerminalComponent socket={socketRef.current} />
                                    </Card>
                                </div>
                            </div>
                        </div>
                    </>
                } />
                <Route path="/repos/:userId" element={<Repos />} />
                <Route path="/home" element={<Home />} />
            </Routes>
        </Router>
    );
}

export default App;
