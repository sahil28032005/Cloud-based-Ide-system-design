const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const pty = require('node-pty');
const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';

const app = express();
const server = http.createServer(app);
// console.log(server);
const io = socketIo(server);

const ioClient = require('socket.io-client');

//make custom port to run node/web server
const PORT = process.env.PORT || 5000;
app.use(express.json());

//pty terminal process setup
const ptyProcess = pty.spawn(shell, [], {
    name: 'tty',
    cols: 80,
    rows: 30,
    cwd: process.env.HOME,
    env: process.env

});

//pty process listener prebuilt
ptyProcess.on('data', function (data) {
    console.log(data);
});

//writer command for testing
// ptyProcess.write('mkdir abc.txt\r');

//listerning module for socker connectors socket.io connectiions
io.on('connection', (socket) => {
    console.log("some user connected", socket.id);

    //listern custom events gere
    socket.on('chat message', (msg) => {
        console.log('Message received:', msg);
        io.emit('chat message', msg);
 // This line is correct if 'msg' is the command you want to send
    });

    //spcket disconnection
    socket.on('disconnect', () => {
        console.log("user disconnected");
    });

});
app.post('/message', (req, res) => {
    const msg = req.body.message;
    io.emit('chat message', msg);
    ptyProcess.write(`${msg}\r`);
    res.status(200).send({ status: 'Message sent' });
});

server.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
    const socket = ioClient(`http://localhost:${PORT}`);//testing web socket connection for learning purpose
    socket.on('connect', () => {
        console.log('Client connected to server');
    });

    socket.on('chat message', (msg) => {
        console.log('Message received from server:', msg);
    });
});