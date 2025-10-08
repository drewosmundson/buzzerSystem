import { Host } from './Host.js';
import { Player } from './Player.js';

document.addEventListener('DOMContentLoaded', () => {

  // Home Screen
  const createRoomButton = document.getElementById('createRoomButton');
  const joinRoomButton = document.getElementById('joinRoomButton');
  const roomIdInput = document.getElementById('roomIdInput');

  // state variables
  let socket = null;
  let hostInstance;
  let playerInstance;

  try {
    socket = io();
  } catch (error) {
    console.error('Error initializing socket:', error);
  }

  // Host
  createRoomButton?.addEventListener('click', () => {
    hostInstance = new Host(socket);
  });

  // Players - Fixed the issues here
  joinRoomButton?.addEventListener('click', () => {
    if(roomIdInput.value.trim() === '') {
      alert('Please enter a room code');
      return;
    }
    
    const data = {
      roomCode: roomIdInput.value.trim(),
      socketId: socket.id
    };
    
    socket.emit('playerJoinRoomRequest', data);
  });

  socket.on("playerJoinRoomRequestAccepted", (data) => {
    playerInstance = new Player(socket, data);
  });

  socket.on("playerJoinRoomRequestRejected", () => {
    alert(`Could not join room: ${"This room code is incorrect"}`);
  });
});
