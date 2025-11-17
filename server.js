// server.js this is the entry point for this program
// it handles init processes requests and sends data to the user

// Naming scheme for event handling:
// events sent from the server will be in past tense
// events sent from a client will be in present tense
// if the event comes from a HOST the event begins with host
// if the event comes from a PLAYER the event begins with player

// server.js - Complete buzzer system server
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import path from 'path';
import { fileURLToPath } from 'url';

import HostServer from './serverEvents/HostServer';
import PlayerServer from './serverEventsPlayerHost';


// __dirname replacement in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create new instance of express
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Constants
const ROOMCODELENGTH = 4;
const PORT = process.env.PORT || 3000;

// data structure to keep track of hosts each room to one host rooms can have many players
// lobbies also contain a list of all the players that have ever been in that room to preserve on
// disconnect
const rooms = {};

// -----------------------
// SERVER HELPER FUNCTIONS
//------------------------
// notebly missing 6 and to avoid meme numbers that would 
// disrupt a classroom i.e. '6,7' and '69'
function generateRoomCode() {
  const roomCodeOptions = "12345789";
  let roomCode = "";
  let randomNumber = null;
  for(let i = 0; i < ROOMCODELENGTH; i++){
    randomNumber = Math.floor(Math.random() * roomCodeOptions.length);
    roomCode += roomCodeOptions[randomNumber];
  }

  // Make sure room code doesn't already exist creating a longer number then scrambling
  // this ensurs the server is unique and secure
  let iter = 0;
  while(rooms[roomCode]) { // true until a unique code is found
    randomNumber = Math.floor(Math.random() * roomCodeOptions.length);
    roomCode += roomCodeOptions[randomNumber];
    if(!rooms[roomCode]) { // if a new code is found that is not in rooms scramble it
      roomCode = roomCode.split('') // Convert string to an array of characters
      .sort(() => Math.random() - 0.5) // Randomly sort the characters
      .join(''); // Join the characters back into a string 
    }
    // infinite loop insurance
    iter += 1;
    if(iter > 10){
      return null;
    }
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
  
  // Create room state
  rooms[roomCode] = {
    roomCode: roomCode, // set when room created
    hostSocketID: socket.id, // set when room created
    players: {},  // updates as player joins room
    currentRoundBuzzes: [], // updates on player buzz. resets on start round
    roundHistory: [], // updates on stop round
    currentRound: 1, // updates on start round
    buzzerActive: false // updates on start and stop round
  };
  
  // Join socket to the room
  socket.join(roomCode);
  socket.emit('roomCreated', rooms[roomCode]);  //socket.emit('roomCreated', { roomCode }) would send as object data.roomCode
  console.log(`Room ${roomCode} created by host ${socket.id}`);
}


// from host to all other clients
function hostStartRound(socket, data) {
  if (!rooms[data.roomCode]) return;
  
  const room = rooms[data.roomCode];
  room.buzzerActive = true;
  room.currentRoundBuzzes = [];
  room.currentRound = data.currentRound;
  
  // Notify all players that round started
  socket.to(data.roomCode).emit('hostStartedRound', {
    currentRound: room.currentRound});
  
  console.log(`Host started round ${room.currentRound} in room ${data.roomCode}`);
}

function hostStopRound(io, data) {
  if (!rooms[data.roomCode]) return;
  
  const room = rooms[data.roomCode];
  room.buzzerActive = false;
  
  // Save round to history
  if (room.currentRoundBuzzes.length > 0) {
    room.roundHistory.push({
      round: room.currentRound,
      buzzes: [...room.currentRoundBuzzes]
    });
  }
  // Notify all players and host that round stopped and recive the round history updated
  io.to(data.roomCode).emit('hostStoppedRound', room.roundHistory);
  
  console.log(`Host stopped round ${room.currentRound} in room ${data.roomCode}`);
}

function hostLeaveRoom(socket, data) {
  if (!rooms[data.roomCode]) return;
  
  // Notify all players that host left
  socket.to(data.roomCode).emit('hostDisconnected');
  
  // Clean up room
  delete rooms[data.roomCode];
  console.log(`Host left and room ${data.roomCode} was deleted`);
}

function hostResetGame(socket, data) {
  if (!rooms[data.roomCode]) return;
  
  const room = rooms[data.roomCode];
  room.currentRound = 1;
  room.roundHistory = [];
  room.currentRoundBuzzes = [];
  room.buzzerActive = false;
  
  // Notify all players about reset
  socket.to(data.roomCode).emit('gameReset');
  
  console.log(`Game reset in room ${data.roomCode}`);
}
// -----------------------
// PLAYER ACTIONS
//------------------------
function playerJoinRoomRequest(socket, data) {
  if(data.roomCode in rooms) {
    const room = rooms[data.roomCode];

    // Check if player is rejoining
    let playerNumber = null;
    for (let playerId in room.players) {
      if (room.players[playerId].socketId === socket.id) {
        playerNumber = room.players[playerId].playerNumber;
        break;
      }
    }
    // Assign new player number if not rejoining
    if (!playerNumber) {
      playerNumber = Object.keys(room.players).length + 1;
    }

    room.players[socket.id] = {
      socketId: socket.id,
      playerNumber: playerNumber,
      joinTime: Date.now(),
      score: room.players[socket.id]?.score || 0
    };
    
    socket.join(data.roomCode);
    
    // Confirm join to the player
    socket.emit('playerJoinRoomRequestAccepted', {
      roomCode: data.roomCode,
      playerNumber: playerNumber,
      currentRound: room.currentRound
    });
    
    // Notify host of new player
    io.to(room.hostSocketID).emit('playerJoined', room.players);
    console.log(`Player ${playerNumber} joined room ${data.roomCode}`);
  } else {
    socket.emit('playerJoinRoomRequestRejected', 'Room not found');
    console.log(`Player failed to join room ${data.roomCode} - room not found`);
  }
}


function playerBuzz(socket, data) {
  if (!rooms[data.roomCode]) return;
  
  const room = rooms[data.roomCode];
  
  // Only process buzz if round is active
  if (!room.buzzerActive) {
    console.log(`Player ${data.playerNumber} buzzed but round is not active`);
    return;
  }
  
  // Check if player already buzzed this round
  const alreadyBuzzed = room.currentRoundBuzzes.some(
    buzz => buzz.playerNumber === data.playerNumber
  );
  
  if (alreadyBuzzed) {
    console.log(`Player ${data.playerNumber} already buzzed this round`);
    return;
  }

  
  // Calculate buzz time relative to first buzz or round start
  let buzzTime = 0;
  if (room.currentRoundBuzzes.length > 0) {
    buzzTime = data.timestamp - room.currentRoundBuzzes[0].timestamp;
  }
  
  // Record the buzz
  const buzzData = {
    playerNumber: data.playerNumber,
    timestamp: data.timestamp,
    time: buzzTime,
    position: room.currentRoundBuzzes.length + 1
  };
  
  room.currentRoundBuzzes.push(buzzData);
  
  // Sort buzzes by timestamp
  room.currentRoundBuzzes.sort((a, b) => a.timestamp - b.timestamp);
  
  // Recalculate times relative to first buzz
  if (room.currentRoundBuzzes.length > 0) {
    const firstBuzzTime = room.currentRoundBuzzes[0].timestamp;
    room.currentRoundBuzzes.forEach((buzz, index) => {
      buzz.time = buzz.timestamp - firstBuzzTime;
      buzz.position = index + 1;
    });
  }
  
  // Send updated results to all clients in the room
  io.to(data.roomCode).emit('buzzerResults', room.currentRoundBuzzes);
  
  console.log(`Player ${data.playerNumber} buzzed at position ${buzzData.position}`);
}


function playerLeaveRoom(socket, data) {
  if (!rooms[data.roomCode]) return;
  
  const room = rooms[data.roomCode];
  
  // Mark player as disconnected but keep their data
  if (room.players[socket.id]) {
    room.players[socket.id].connected = false;
    room.players[socket.id].disconnectTime = Date.now();
  }
  
  // Notify host of updated player list
  io.to(room.hostSocketID).emit('playerLeft', room.players);
  
  console.log(`Player ${data.playerNumber} left room ${data.roomCode}`);
}


// Handle disconnections
function handleDisconnect(socket) {
  console.log(`Socket ${socket.id} disconnected`);
  
  // Check if disconnected socket was a host
  for (let roomCode in rooms) {
    const room = rooms[roomCode];
    
    if (room.hostSocketID === socket.id) {
      // Host disconnected - notify players and clean up
      io.to(roomCode).emit('hostDisconnected');
      delete rooms[roomCode];
      console.log(`Host disconnected, room ${roomCode} deleted`);
      break;
    }
    
    // Check if disconnected socket was a player
    if (room.players[socket.id]) {
      room.players[socket.id].connected = false;
      room.players[socket.id].disconnectTime = Date.now();
      
      // Notify host
      io.to(room.hostSocketID).emit('playerDisconnected', room.players);
      console.log(`Player ${room.players[socket.id].playerNumber} disconnected from room ${roomCode}`);
      break;
    }
  }
}

function playerRejoinRoom(socket, data) {
  if (!rooms[data.roomCode]) return;
  
  const room = rooms[data.roomCode];
  
  // Find player by player number
  let foundPlayer = null;
  for (let playerId in room.players) {
    if (room.players[playerId].playerNumber === data.playerNumber) {
      foundPlayer = room.players[playerId];
      break;
    }
  }
  
  if (foundPlayer) {
    // Update socket ID and mark as connected
    delete room.players[foundPlayer.socketId];
    room.players[socket.id] = {
      ...foundPlayer,
      socketId: socket.id,
      connected: true,
      rejoinTime: Date.now()
    };
    
    socket.join(data.roomCode);
    
    // Send current game state to rejoining player
    socket.emit('rejoinAccepted', {
      roomCode: data.roomCode,
      playerNumber: foundPlayer.playerNumber,
      currentRound: room.currentRound,
      buzzerActive: room.buzzerActive,
      currentRoundBuzzes: room.currentRoundBuzzes,
      roundHistory: room.roundHistory
    });
    
    // Notify host
    io.to(room.hostSocketID).emit('playerRejoined', room.players);
    
    console.log(`Player ${data.playerNumber} rejoined room ${data.roomCode}`);
  } else {
    socket.emit('rejoinRejected', 'Player not found in room');
  }
}
// Socket.io connection handler
const hostServer = new HostServer();
const playerServer = new PlayerServer();

io.on('connection', (socket) => {
  console.log('Socket ' + socket.id + ' connected');
  
  // Host events
  socket.on('hostCreateRoom', () => hostCreateRoom(socket));

  socket.on('hostStartRound', (data) => hostStartRound(socket, data));
  socket.on('hostStopRound', (data) => hostStopRound(io, data));
  socket.on('hostLeftRoom', (data) => hostLeaveRoom(socket, data));
  socket.on('hostResetsGame', (data) => hostResetGame(socket, data));
  
  // Player events
  socket.on('playerJoinRoomRequest', (data) => playerJoinRoomRequest(socket, data));
  socket.on('playerBuzz', (data) => playerBuzz(socket, data));
  socket.on('playerLeavesRoom', (data) => playerLeaveRoom(socket, data));
  socket.on('playerRejoinRoomRequest', (data) => playerRejoinRoom(socket, data));
  
  // Handle disconnection
  socket.on('disconnect', () => handleDisconnect(socket));
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});