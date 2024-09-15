import { useState, useRef, useEffect } from 'react';
import TerminalComponent from './components/TerminalComponent';
import FileLister from './components/FileLister';
import TextEditor from './components/TextEditor';
import { io } from 'socket.io-client';

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
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const handleSelection = (path) => {
    setSelectedFilePath(path);
  };

  if (!isSocketReady) {
    return <div>Loading...</div>;
  }

  return (
    <>
      {/* Navbar */}
      <div style={{
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
      </div>
    </>
  );
}

export default App;
