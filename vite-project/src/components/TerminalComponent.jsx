import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { io } from 'socket.io-client';
import 'xterm/css/xterm.css';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useLocation } from 'react-router-dom';

const TerminalComponent = ({ socket }) => {
    console.log("socket instance", socket);
    const terminalRef = useRef(null);
    // const socketRef = useRef(null);
    const xtermRef = useRef(null);
    const fitAddonRef = useRef(null);
    const visible = useRef(false);
    const commandBuffer = useRef('');
    const ref = useRef(0);
    const location = useLocation();
    const params = new URLSearchParams(location.search);
    const replId = params.get('replId');

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

    useEffect(() => {
        console.log("terminal mounted currently");
        return async () => {
            //this return method will know about component unmount
            console.log("component gonna unmount are you sure?");
            console.log("incrementing ref");
            ref.current = ref.current + 1;

            //logic for cleanup like stopping user container by persisting their codes
            console.log("making post request");
            const response = await axios.post(`http://localhost:5002/api/repls/stop-by-repel`, { replId: replId });
            console.log("post request done");
            if (response.data.success) {
                //means container stipped correctly
                console.log("destroyed...");
                confirm("your workspace will be saved automatically.....");
            }
        };
    }, []);
    return (
        <>
            {console.log("current ref value", ref.current)}
            {console.log("current replIdr", replId)}
            <div style={{ height: "100%" }} ref={terminalRef} />
        </>

    )
}

export default TerminalComponent