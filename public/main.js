import { Host } from './Host.js';
import { Player } from './Player.js';

document.addEventListener('DOMContentLoaded', () => {

  // Home Screen
  const createRoomButton = document.getElementById('createRoomButton');
  const joinRoomButton = document.getElementById('joinRoomButton')

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

  // Players
  joinRoomButton?.addEventListener('click', () => {
    playerInstance = new Player(socket);
  });
});


