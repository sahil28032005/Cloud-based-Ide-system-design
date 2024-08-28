import { useState, useRef, useEffect } from 'react'
// import './App.css'
import TerminalComponent from './components/TerminalComponent'
import FileLister from './components/FileLister'
import { io } from 'socket.io-client'
function App() {
  const socketRef = useRef(null);
  const [isSocketReady, setIsSocketReady] = useState(false);
  useEffect(() => {
    socketRef.current = io('http://localhost:5000');
    socketRef.current.on('connect', () => {
      setIsSocketReady(true);
    });
    return () => {
      // socketRef.current.disconnect();//cleanup code
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  if (!isSocketReady) {
    // Optionally, render a loading state while the socket is connecting
    return <div>Loading...</div>;
  }
  return (
    <>
      <FileLister />
      <TerminalComponent socket={socketRef.current} />
    </>
  )
}

export default App
