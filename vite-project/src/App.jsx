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
    socketRef.current = io('http://localhost:5000', {
      query: { userId: 'e76a7bb1-9b33-45b8-bdcf-4256c59fcf9b' }  // Pass userId as an object
    });
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
      {/* <div>selected file:: {selectedFilePath}</div> */}
      <div style={{ display: 'flex',height:'100vh'}}>
        <div style={{height:'100%',width:'15%',background:'gray'}}>
          <FileLister onSelect={handleSelection} socket={socketRef.current} />
        </div>
        <div style={{width:'100%' }}>
          <TextEditor filePath={selectedFilePath} />
          <TerminalComponent socket={socketRef.current} />
        </div>

      </div>


    </>
  )
}

export default App
