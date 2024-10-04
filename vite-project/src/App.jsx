import React, { useState, useRef, useEffect, useContext } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { io } from 'socket.io-client';
import { TooltipProvider } from "@radix-ui/react-tooltip";

import TerminalComponent from './components/TerminalComponent';
import FileLister from './components/FileLister';
import TextEditor from './components/TextEditor';
import LoginModule from './components/LoginModule';
import Repos from './components/Repos';
import Navbar from './components/Navbar';
import Home from './components/Home';

import { UserContext } from '../context/UserContextComponent';
import { Button } from "@/components/ui/button"; // This should work if the export is correct
import { Tooltip } from "@/components/ui/tooltip"; // Import Shadcn tooltip
import { Card } from "@/components/ui/card"; // Import Shadcn card
import './App.css'; // Your styles
import './index.css'; // Global styles
import AuthCallback from './components/AuthCallback';

function App() {
    const [selectedFilePath, setSelectedFilePath] = useState('');
    const socketRef = useRef(null);
    const [isSocketReady, setIsSocketReady] = useState(false);
    const { userId } = useContext(UserContext);
    const [sidebarWidth, setSidebarWidth] = useState(300);
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
            if (newWidth > 200 && newWidth < 600) {
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
        <TooltipProvider>
            <Router>
                <div className="bg-gray-900 min-h-screen p-4">
                    <Navbar />
                    <Routes>
                        <Route path="/auth/callback" element={<AuthCallback />} />
                        <Route path="/login" element={<LoginModule />} />
                        <Route path="/" element={
                            <>
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
                                            <Tooltip content="Run your code!" side="top">
                                                <Button variant="outline" className="bg-blue-600 hover:bg-blue-500 transition-all">Run</Button>
                                            </Tooltip>
                                            <Tooltip content="Save your changes!" side="top">
                                                <Button variant="outline" className="bg-blue-600 hover:bg-blue-500 transition-all">Save</Button>
                                            </Tooltip>
                                            <Tooltip content="Create a new file!" side="top">
                                                <Button variant="outline" className="bg-blue-600 hover:bg-blue-500 transition-all">New File</Button>
                                            </Tooltip>
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
                </div>
            </Router>
        </TooltipProvider>
    );
}

export default App;
