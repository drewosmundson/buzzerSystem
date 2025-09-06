// the host does not have a rejoin method because if the host leaves the room it should disconnect the other participants.


// document elemenets that only react or received from the server do not have the HOST tag

export class Host {
  constructor(socket) {
    this.socket = socket;

    document.getElementById("mainMenu").classList.add("hidden");
    document.getElementById("hostScreen").classList.remove("hidden");

    this.roomcode = document.getElementById("roomCode");
    this.playerList = document.getElementById("playerList");
    this.timerLength = document.getElementById('countdownTime');

    this.hostStartCountdownButton = document.getElementById('hostStartCountdownButton');
    this.hostEndRoundButton = document.getElementById('hostEndRoundButton');

    this.setUpDocumentEventListeners();
    this.setUpServerListeners();

    this.socket.emit('hostCreateRoom');

  }


  startRound() {
    console.log("startCountdownButton");
    this.hostStartCountdownButton.disabled = true;
    this.hostEndRoundButton.disabled = false;
  }
  endRound() {
    console.log("endRoundButton");
    this.hostEndRoundButton.disabled = true;
    this.hostStartCountdownButton.disabled = false;
  }
  resetGame() {

  }
  leaveRoom() {

  }
  setUpDocumentEventListeners() {
    this.hostStartCountdownButton?.addEventListener('click', () => {this.startRound()});

    this.hostEndRoundButton?.addEventListener('click', () => {this.endRound()});
  }

  // received from the server
  roomCreated(roomCode) {
    this.roomCode.textContent = roomCode;
  }

  playerJoined() {
    // for length of player list 
    // const newItem = document.createElement("li");
    // newItem.innerHTML = "<b>New</b> List Item"; // For HTML content
    // display players
  }
  setUpServerListeners() {
    this.socket.on("roomCreated", (roomCode) => {
      this.roomCreated(roomCode);
    });

    this.socket.on("playerJoined", (newPlayerList) => {
      console.log("Player joined:", newPlayerList);
      this.playerJoined(newPlayerList);
    });
  }
}