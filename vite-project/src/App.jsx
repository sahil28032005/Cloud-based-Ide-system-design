import { useState, useRef, useEffect } from 'react'
// import './App.css'
import TerminalComponent from './components/TerminalComponent'
import FileLister from './components/FileLister';
import TextEditor from './components/TextEditor';
import { io } from 'socket.io-client'
function App() {
  const [selectedFilePath, setSelectedFilePath] = useState('');
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

  //selection path setter
  const handleSelection = (path) => {
    //idea is path come here after small prop drill frim fileLister component or other relative
    setSelectedFilePath(path);
  }

  if (!isSocketReady) {
    // Optionally, render a loading state while the socket is connecting
    return <div>Loading...</div>;
  }
  return (
    <>
      <FileLister onSelect={handleSelection} socket={socketRef.current} />
      <TextEditor filePath={'user/'+selectedFilePath}/>
      <TerminalComponent socket={socketRef.current} />
      <div>selected file:: {'user/'+selectedFilePath}</div>
    </>
  )
}

export default App
