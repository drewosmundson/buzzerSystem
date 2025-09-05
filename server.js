// server.js this is the entry point for this program
// it handles init processes requests and sends data to the user

import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirname replacement in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// create new instance of express
const app = express();
// inits server with this express instance as an arg
const server = http.createServer(app);
// server instance on computer
const io = new Server(server);
// Serve static files create communication between server and public folder
app.use(express.static(path.join(__dirname, 'public')));


const ROOMCODELENGTH = 4;
const PORT = process.env.PORT || 3000;


// data structure to keep track of hosts each room to one host rooms can have many players
// lobbies also contain a list of all the players that have ever been in that room to preserve on
// disconnect
const rooms = {}; 

// notebly missing 6789 and several others to avoid meme "funny" numbers that would 
// disrupt a classroom i.e. '6,7' and '69'
function generateRoomCode() {
  const roomCodeOptions = "12345ABCDEFWXYZ"
  let roomCode = "";
  for(let i = 0; i < ROOMCODELENGTH; i++){
    let randomNumber = Math.floor(Math.random() * roomCodeOptions.length);
    roomCode += roomCodeOptions[randomNumber];
  }
  return roomCode;
}

// SOCKET IO FUNCTIONS
// socket.emit('event', data) reply only to the same client.
// socket.to(roomId).emit('event', data) send to everyone in the room except the sender.
// io.to(roomId).emit('event', data) send to all clients in a room, including the sender.
// io.emit('event', data) broadcast to everyone connected.

function createRoom(socket) {
  const roomCode = generateRoomCode();
  // room state
  rooms[roomCode] = {
    hostSocketID: socket.id,
    players: {},
    roundHistory: {},
    currentRound: 1,
    countdownTime: 0,
    cooutdownStarted: false,
    buzzerActive: false,
  }
  // join socket to the room that all the participants will be apart of
  socket.join(roomCode);
  socket.emit('roomCreated', { roomCode })
}

function joinRoom(rooms) {
 
}

// host screen
function hostStartCountdown(rooms) {
  
}

function hostStopCountdown(rooms) {
 
}

function hostLeaveRoom(rooms) {
  
}

// Player screen
function playerBuzz(rooms) {
  
}

function playerLeaveRoom(rooms) {
}

function playerRejoinRoom(rooms) {
  
}


// server protocol
io.on('connection', (socket) => {
  console.log('socket ' + socket.id + ' is connected');

  // from hosts
  socket.on('hostCreateRoomRequest', () => createRoom(socket));
  socket.on('hostStartsCountdown', (data) => startCountdown());
  socket.on('hostStopsCountdown', (data) => stopCountdown());
  socket.on('hostLeaveRoomRequest', (data) => hostLeaveRoom());

  // from players
  socket.on('playerJoinRoomRequest', (data) => joinRoom());
  socket.on('playerBuzz', (data) => playerBuzz());
  socket.on('playerleaveRoomRequest', (data) => playerLeaveRoom());
  socket.on('playerRejoinRoomRequest', (data) => rejoinRoom());

});


server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});