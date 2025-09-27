// server.js this is the entry point for this program
// it handles init processes requests and sends data to the user

// Naming scheme for event handling:
// events sent from the server will be in past tense
// events sent from a client will be in present tense
// if the event comes from a HOST the event begins with host
// if the event comes from a PLAYER the event begins with player

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

// -----------------------
// SERVER HELPER FUNCTIONS
//------------------------
// notebly missing 6 and to avoid meme "funny" numbers that would 
// disrupt a classroom i.e. '6,7' and '69'
function generateRoomCode() {
  const roomCodeOptions = "12345789"
  let roomCode = "";
  for(let i = 0; i < ROOMCODELENGTH; i++){
    let randomNumber = Math.floor(Math.random() * roomCodeOptions.length);
    roomCode += roomCodeOptions[randomNumber];
  }
  return roomCode;
}
// -----------------------
// HOST ACTIONS
//------------------------
// SOCKET IO FUNCTIONS
// socket.emit('event', data) reply only to the same client.
// socket.to(roomId).emit('event', data) send to everyone in the room except the sender.
// io.to(roomId).emit('event', data) send to all clients in a room, including the sender.
// io.emit('event', data) broadcast to everyone connected.

function hostCreateRoom(socket) {
  const roomCode = generateRoomCode();
  // room state
  rooms[roomCode] = {
    roomCode: roomCode,
    hostSocketID: socket.id,
    roomCode: roomCode,
    players: {},
    roundHistory: {},
    currentRound: 1,
    buzzerActive: false,
  }
  // join socket to the room that all the participants will be apart of
  socket.join(roomCode);
  socket.emit('roomCreated', rooms[roomCode]);
  //socket.emit('roomCreated', { roomCode }) // would send as object data.roomCode
}

// from host to all other clients
function hostStartRound(socket, data) {
  socket.to(data.roomCode).emit('hostStartedRound')
}

function hostStopRound(socket, data) {
  socket.to(data.roomCode).emit('hostStoppedRound')
}

function hostLeaveRoom(rooms) {
  
}

// -----------------------
// PLAYER ACTIONS
//------------------------

function playerJoinRoomRequest(socket, data) {
  if(data.roomCode in rooms) {
    const room = rooms[data.roomCode];
    const playerNumber = Object.keys(room.players).length + 1;
    
    room.players[socket.id] = {
      socketId: socket.id,
      playerNumber: playerNumber,
      joinTime: Date.now()
    };
    
    socket.join(data.roomCode);
    
    // Confirm join to the player
    socket.emit('playerJoinRoomRequestAccepted', {
      roomCode: data.roomCode,
      playerNumber: playerNumber,
      currentRound: room.currentRound
    });
    
    // Notify host of new player
    socket.to(data.roomCode).emit('playerJoined', room.players);
  } else {
    socket.emit('playerJoinRoomRequestRejected', 'Room not found');
  }
}


// Player screen
function playerBuzz(rooms) {
  
}

function playerLeftRoom(rooms) {
}

function playerRejoinRoom(rooms) {
  
}

// server protocol
io.on('connection', (socket) => {
  console.log('socket ' + socket.id + ' is connected');

  // from hosts
  socket.on('hostCreateRoom', () => hostCreateRoom(socket));
  socket.on('hostStartRound', (data) => hostStartRound(socket, data));
  socket.on('hostStopRound', (data) => hostStopCountdown());
  socket.on('hostLeftRoom', (data) => hostLeaveRoom());

  // from players
  socket.on('playerJoinRoomRequest', (data) => playerJoinRoomRequest(socket, data));
  socket.on('playerBuzz', (data) => playerBuzz());
  socket.on('playerLeftRoom', (data) => playerLeaveRoom());
  socket.on('playerRejoinRoomRequest', (data) => rejoinRoom());
});


server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});










