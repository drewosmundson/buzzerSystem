import { Host } from './Host.js';
import { Player } from './Player.js';

document.addEventListener('DOMContentLoaded', () => {

  // Home Screen
  const createRoomButton = document.getElementById('createRoomButton');
  const joinRoomButton = document.getElementById('joinRoomButton')

  // Host Screen
  const startCountdown = document.getElementById('startCountdown');
  const stopCountdown = document.getElementById('stopCountdown');

  // Player Screen
  const playerBuzz = document.getElementById('playerBuzz');


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
    hostInstance.startGame();
  });

  // Players
  joinRoomButton?.addEventListener('click', () => {
    playerInstance = new Player(socket);
    playerInstance.joinGame();
  });
});


