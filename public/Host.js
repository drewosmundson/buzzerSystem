export class Host {
  constructor(socket) {
    this.socket = socket;
    this.currentRoundNumber = 0;
    this.currentCountdownTime = 0;
    this.roomCode = null;

    document.getElementById("mainMenu").classList.add("hidden");
    document.getElementById("hostScreen").classList.remove("hidden");

    // elements edited on HTML not sent to the server
    this.roomCodeDisplay = document.getElementById("roomCode");
    this.currentRoundDisplay = document.getElementById('currentRoundDisplay');
    this.playerList = document.getElementById("playerList");
    this.timerLength = document.getElementById('countdownTime');
    this.countdownDisplay

    // elements whose updates are sent to the server
    this.hostStartCountdownButton = document.getElementById('hostStartCountdownButton');
    this.hostEndRoundButton = document.getElementById('hostEndRoundButton');

    this.setUpDocumentEventListeners();
    this.setUpServerListeners();

    // ping to the server that the host created a room
    this.socket.emit('hostCreateRoom');

  }


  startCountdown() {
    this.currentCountdownTime = parseInt(this.timerLength.value, 10) || 0;
    const timeRemaining = this.currentCountdownTime;
  
    
  }


  sendStartRound() {
    const countdownTime = parseInt(this.timerLength.value, 10) || 0;

    this.currentRoundNumber += 1;
    this.currentRoundDisplay.textContent = this.currentRoundNumber;

    const data = { 
      countdownTime,
      currentRound: this.currentRoundNumber,
      roomCode: this.roomCode
    }

    this.socket.emit('hostStartsCountdown', data );

    this.hostStartCountdownButton.disabled = true;
    this.hostEndRoundButton.disabled = false;

    this.startCountdown();
  }

  sendEndRound() {
    this.hostEndRoundButton.disabled = true;
    this.hostStartCountdownButton.disabled = false;
  }

  sendResetGame() {
    this.currentRoundNumber = 0;
    this.currentRoundDisplay.textContent = this.currentRoundNumber;

    const data = {
      roomCode: this.roomCode,
      currentRound: this.currentRoundNumber,
    }
    this.socket.emit('hostResetsGame', data);
  }

  setUpDocumentEventListeners() {
    this.hostStartCountdownButton?.addEventListener('click', () => {this.sendStartRound()});
    this.hostEndRoundButton?.addEventListener('click', () => {this.sendEndRound()});
  }

  // received from the server
  receivedRoomCreated(data) {
    this.roomCode = data.roomCode;
    this.roomCode.textContent = this.roomCode;
  }

  receivedPlayerJoined(newPlayerList) {
    // display players later
  }

  setUpServerListeners() {
    this.socket.on("roomCreated", (data) => this.receivedRoomCreated(data));
    this.socket.on("playerJoined", (newPlayerList) => this.receivedPlayerJoined(newPlayerList));
  }
}
