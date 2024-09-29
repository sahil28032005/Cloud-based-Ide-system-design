import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { io } from 'socket.io-client';
import 'xterm/css/xterm.css';

const TerminalComponent = ({ socket }) => {
    console.log("socket instance", socket);
    const terminalRef = useRef(null);
    // const socketRef = useRef(null);
    const xtermRef = useRef(null);
    const fitAddonRef = useRef(null);
    const visible = useRef(false);
    const commandBuffer = useRef('');

    //related useEffetcts
    useEffect(() => {
        if (socket) {
            //inatialize initializers
            if (visible.current) return;
            visible.current = true;
            const xterm = new Terminal();
            const fitAddon = new FitAddon();
            xterm.loadAddon(fitAddon);

            //actual terminal displayer or opener
            xterm.open(terminalRef.current);
            fitAddon.fit();

            //try to make backend socket connection
            // const socket = io('http://localhost:5000');
            socket?.on('connect', () => {
                console.log('Connected to server');
            });
            socket?.on('terminal:data', (data) => {
                xterm.write(data);

            });
            xterm.onData((data) => {
                console.log(data);
                if (data === '\r') { // Detect Enter key
                    socket?.emit('chat_message', commandBuffer.current);
                    commandBuffer.current = ''; // Clear the buffer after sending
                } else {
                    xterm.write(data);
                    commandBuffer.current += data; // Add typed character to buffer
                }
            });
            xtermRef.current = xterm;
            fitAddonRef.current = fitAddon;
        }

    }, [socket]);
    return (
        <div style={{height:"100%"}} ref={terminalRef} />
    )
}

export default TerminalComponent