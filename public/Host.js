// the host does not have a rejoin method because if the host leaves the room it should disconnect the other participants.
export class Host {
  constructor(socket) {
    this.socket = socket;
    this.timerLength = document.getElementById('countdownTime');
    this.setUpDocumentListeners();
    this.setUpServerListeners(socket);
  }

  // messages to the server
  setUpDocumentListeners(){}

  startGame() {
    this.socket.emit('hostCreateRoomRequest');

  }

  startRound() {

  }
  endRound() {

  }
  resetGame() {

  }
  leaveRoom() {

  }
// received from the server

  setUpServerListeners(socket) {
    socket.on("roomCreated", (roomCode) => {
      console.log("Room created with code:", roomCode);
    });

    socket.on("playerJoined", (player) => {
      console.log("Player joined:", player);
    });
  }

}