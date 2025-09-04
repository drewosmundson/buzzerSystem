import { Host } from './Host.js';
import { Player } from './Player.js';

document.addEventListener('DOMContentLoaded', () => {

  // Home Screen
  const createRoomButton = document.getElementById('createRoomButton');
  const joinRoomButton = document.getElementById('joinRoomButton')

  // Host Screen
  const startCountdown = document.getElementById('createRoomButton');
  const stopCountdown = document.getElementById('joinRoomButton');

  // Player Screen
  const buzz = document.getElementById('joinRoomButton');

  // state variables
  let socket = null;
  let currentScreen = 'mainMenu'; // Track current screen for navigation

  try {
    socket = io();
  } catch (error) {
    console.error('Error initializing socket:', error);
  }

  // Host
  createRoomButton?.addEventListener('click', () => {
    Host = new Host(socket);
    Host.startGame();
  });

  // Players
  joinRoomButton?.addEventListener('click', () => {
    Player = new Player(socket);
    Player.joinGame();
  });
});


