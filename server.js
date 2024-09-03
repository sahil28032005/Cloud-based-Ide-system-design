const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const pty = require('node-pty');
const shell = process.platform === 'win32' ? 'powershell.exe' : 'bash';
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const app = express();
const chokidar = require('chokidar');
app.use(cors());
const server = http.createServer(app);
// console.log(server); logs testing
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


//route that acceots file writer requests to specified path
app.post('/write-file', (req, res) => {
    try {
        const { filePath, content } = req.body;
        const fullPath = path.join(__dirname, filePath);
        console.log("made final write path as", fullPath);
        //write arrived content using fs writer module
        fs.writeFile(fullPath, content, (error) => {
            if (error) {
                return res.status(500).json({ error: 'failed to write file' });
            }
            return res.status(200).json({ message: 'File written successfully' });
        });

        //otherwise got success for writing data to file


    }
    catch (err) {
        return res.status(401).send({
            success: false,
            message: 'problem for writing file from api',
            message: err.message
        });
    }
});

//route for read data frim selected file
app.get('/read-file', function (req, res) {
    try {
        const {filePath} = req.query;
        const fullPath = path.join(__dirname, filePath);

        fs.readFile(fullPath, 'utf8', (err, data) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.status(200).json({ content: data });
        });
    }
    catch (err) {
        return res.status(401).send({
            success: false,
            messgae: 'error while reading file data',
            err: err.message
        });
    }

});

function emitFileStructure() {
    const files = getAllFiles(usersDir, usersDir);
    io.emit('file-structure-update', files);
}

server.listen(PORT, () => {
    console.log(`server listening on port ${PORT}`);
    const socket = ioClient(`http://localhost:${PORT}`);//testing web socket connection for learning purpose
    socket.on('connect', () => {
        console.log('Client connected to server');
    });

    socket.on('chat message', (msg) => {
        console.log('Message received from server:', msg);
    });

    // Emit the file structure to new clients
    emitFileStructure();

    //herre we can watch file changes event as user changes or creates new file they are irectly rendered in frontend
    const watcher = chokidar.watch(usersDir, {
        persistent: true,
        ignoreInitial: true,
    });

    //watcher function
    watcher.on('all', (event, path) => {
        console.log(`${event} event occurred on ${path}`);
        emitFileStructure();
    });
});