
// sever.js this is the entry point for this program
// it handles init processes requests and sends data to the user 

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

// create new instance of express
const app = express();
// inits server with this express instance as an arg
const server = http.createServer(app);
// server instance on computer
const io = new Server(server);
// Serve static files create communication between server and public folder
app.use(express.static(path.join(__dirname, 'public')));

// data struct to keep track of hosts each room to one host rooms can have many players
// rooms also contain a list of all the players that have ever been in that room to perserve on
// disconnect
const rooms = {}; 

// server protocol
io.on('connection', (socket) => {

    // from hosts
    socket.on('hostCreateRoomRequest', createRoom(socket, rooms));

    socket.on('hostStartsCountdown', startCountdown(socket, rooms));

    socket.on('hostStopsCountdown', stopCountdown(socket, rooms));

    socket.on('hostLeaveRoomRequest', hostLeaveRoom(socket, rooms));

    function createRoom(rooms) {

    }

    function startCountdown(rooms) {

    }

    function stopCountdown(socket, rooms) {

    }

    function hostLeaveRoom(socket, rooms) {

    }

    socket.on('playerJoinRoomRequest', joinRoom(rooms));

    socket.on('playerBuzz')

    socket.on('playerleaveRoomRequest', leaveRoom(rooms));

    socket.on('playerRejoinRoomRequest')

    function createRoom(rooms) {

    }

    function startCountdown(socket, rooms) {

    }

    function stopCountdown(socket, rooms) {

    }

    function hostLeaveRoom(socket, rooms) {

    }
})

// start server
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

