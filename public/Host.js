// the host does not have a rejoin method because if the host leaves the room it should disconnect the other participants.
export class Host {
  constructor(socket) {
    this.socket = socket;
    this.timerLength = document.getElementById('countdownTime');
    this.hostStartCountdownButton = document.getElementById('hostStartCountdownButton');
    this.hostEndRoundButton = document.getElementById('hostEndRoundButton');
    this.setUpDocumentEventListeners();
    this.setUpServerListeners();
    this.socket.emit('hostCreateRoomRequest');
  }

setUpDocumentEventListeners() {
  this.startCountdownButton?.addEventListener('click', () => {this.startRound()});

  this.endRoundButton?.addEventListener('click', () => {this.endRound()});
}

  startRound() {
    console.log("startCountdownButton");
  }
  endRound() {
    console.log("endRoundButton");
  }
  resetGame() {

  }
  leaveRoom() {

  }
// received from the server

  setUpServerListeners() {
    this.socket.on("roomCreated", (roomCode) => {
      console.log("Room created with code:", roomCode);
    });

    this.socket.on("playerJoined", (player) => {
      console.log("Player joined:", player);
    });
  }
  roomCreated() {}


  playerJoined() {}




}