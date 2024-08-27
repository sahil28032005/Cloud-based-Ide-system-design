const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const pty = require('node-pty');
const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
app.use(cors());
const server = http.createServer(app);
// console.log(server);
const io = socketIo(server, {
    cors: {
        origin: "http://localhost:5173", // or '*' to allow all origins
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});


app.use(express.json());

const ioClient = require('socket.io-client');

//make custom port to run node/web server
const PORT = process.env.PORT || 5000;



//pty terminal process setup
const usersDir = process.env.INIT_CWD
    ? path.join(process.env.INIT_CWD, 'user')
    : path.join(__dirname, 'user');
const ptyProcess = pty.spawn(shell, [], {
    name: 'tty',
    cols: 80,
    rows: 30,
    cwd: usersDir,
    env: process.env

});

//pty process listener prebuilt
ptyProcess.on('data', function (data) {
    console.log(data);
    io.emit('terminal:data', data);
});

//writer command for testing
// ptyProcess.write('mkdir abc.txt\r');

//listerning module for socker connectors socket.io connectiions
io.on('connection', (socket) => {
    console.log("some user connected", socket.id);

    //listern custom events gere
    socket.on('chat_message', (msg) => {
        console.log('Message received:', msg);
        ptyProcess.write(`${msg}\r`);
        // io.emit('chat_message', msg);
        // This line is correct if 'sg' is the command you want to send
    });



    //spcket disconnection
    socket.on('disconnect', () => {
        console.log("user disconnected");
    });

});
// app.post('/message', (req, res) => {
//     const msg = req.body.message;
//     io.emit('chat message', msg);
//     ptyProcess.write(`${msg}\r`);
//     res.status(200).send({ status: 'Message sent' });
// });

//try to make initial get request which gets files in users own space
function getAllFiles(dirPath, baseDir) {
    const files = fs.readdirSync(dirPath);
    const tree = {};

    files.forEach((file) => {
        const filePath = path.join(dirPath, file);
        const relativePath = path.relative(baseDir, filePath); // Calculate the relative path

        if (fs.statSync(filePath).isDirectory()) {
            // Recursively get files from the directory and add to the tree
            tree[file] = getAllFiles(filePath, baseDir);
        } else {
            // Add file to the tree
            tree[file] = {};
        }
    });

    return tree;
}
app.get('/files', (req, res) => {
    console.log(usersDir);

    if (!fs.existsSync(usersDir)) {
        return res.status(404).send('user directory not found');
    }

    //get all data related to file tree structure
    const fileTree = getAllFiles(usersDir, usersDir);

    res.json(fileTree);
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