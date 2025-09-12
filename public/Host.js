export class Host {
  constructor(socket) {
    this.socket = socket;
    this.currentRoundNumber = 1;

    document.getElementById("mainMenu").classList.add("hidden");
    document.getElementById("hostScreen").classList.remove("hidden");

    // elements edited on HTML not sent to the server
    this.roomCode = document.getElementById("roomCode");
    this.playerList = document.getElementById("playerList");
    this.timerLength = document.getElementById('countdownTime');
    this.currentRoundDisplay = document.getElementById('currentRoundDisplay');

    // elements whose updates are sent to the server
    this.hostStartCountdownButton = document.getElementById('hostStartCountdownButton');
    this.hostEndRoundButton = document.getElementById('hostEndRoundButton');

    this.setUpDocumentEventListeners();
    this.setUpServerListeners();

    // ping to the server that the host created a room
    this.socket.emit('hostCreateRoom');
  }

  sendStartRound() {
    console.log("startCountdownButton");
    const countdownTime = parseInt(this.timerLength.value, 10) || 0;
    this.socket.emit('hostStartsCountdown', { countdownTime });
    this.hostStartCountdownButton.disabled = true;
    this.hostEndRoundButton.disabled = false;
  }

  sendEndRound() {
    console.log("endRoundButton");
    this.currentRoundNumber += 1;
    this.currentRoundDisplay.textContent = this.currentRoundNumber;
    this.hostEndRoundButton.disabled = true;
    this.hostStartCountdownButton.disabled = false;
  }

  setUpDocumentEventListeners() {
    this.hostStartCountdownButton?.addEventListener('click', () => {this.sendStartRound()});
    this.hostEndRoundButton?.addEventListener('click', () => {this.sendEndRound()});
  }

  // received from the server
  receivedRoomCreated(data) {
    this.roomCode.textContent = data.roomCode;
  }

  receivedPlayerJoined(newPlayerList) {
    // display players later
  }

  setUpServerListeners() {
    this.socket.on("roomCreated", (data) => this.receivedRoomCreated(data));
    this.socket.on("playerJoined", (newPlayerList) => this.receivedPlayerJoined(newPlayerList));
  }
}
