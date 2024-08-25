const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
// console.log(server);
const io = socketIo(server);

const ioClient = require('socket.io-client');

//make custom port to run node/web server
const PORT = process.env.PORT || 5000;
app.use(express.json());

//listerning module for socker connectors socket.io connectiions
io.on('connection', (socket) => {
    console.log("some user connected", socket.id);

    //listern custom events gere
    socket.on('chat message', (msg) => {
        console.log('Message received:', msg);
        io.emit('chat message', msg);
    });

    //spcket disconnection
    socket.on('disconnect', () => {
        console.log("user disconnected");
    });

});
app.post('/message', (req, res) => {
    const msg = req.body.message;
    io.emit('chat message', msg);
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