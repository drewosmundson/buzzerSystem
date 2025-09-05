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
  let currentScreen = 'mainMenu'; // Track current screen for navigation
  let Host;
  let Player;

  try {
    socket = io();
  } catch (error) {
    console.error('Error initializing socket:', error);
  }

  // Host
  createRoomButton?.addEventListener('click', () => {
    console.log("testMEssage")
    window.location.href = "./host.html"
    Host = new Host(socket);
    Host.startGame();
  });

  // Players
  joinRoomButton?.addEventListener('click', () => {
    Player = new Player(socket);
    Player.joinGame();
  });
});


