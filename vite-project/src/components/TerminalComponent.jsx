import React, { useEffect, useRef } from 'react';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { io } from 'socket.io-client';
import 'xterm/css/xterm.css';

const TerminalComponent = () => {
    const terminalRef = useRef(null);
    const socketRef = useRef(null);
    const xtermRef = useRef(null);
    const fitAddon = useRef(null);

    //related useEffetcts
    useEffect(() => {
        //inatialize initializers
        const xterm = new Terminal();
        const fitAddon = new FitAddon();
        xterm.loadAddon(fitAddon);

        //actual terminal displayer or opener
        xterm.open(terminalRef.current);

        xtermRef.current = xterm;
        fitAddonRef.current = fitAddon;
    }, []);
    return (
        <div ref={terminalRef} style={{ width: '100%', height: '100%' }} />
    )
}

export default TerminalComponent