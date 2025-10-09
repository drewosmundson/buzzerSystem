export class Host {
  constructor(socket) {
    this.socket = socket;
    this.currentRoundNumber = 0;
    this.roomCode = null;
    this.roomParticipants = null;

    document.getElementById("mainMenu").classList.add("hidden");
    document.getElementById("hostScreen").classList.remove("hidden");

    // elements edited on HTML not sent to the server
    this.roomCodeDisplay = document.getElementById('roomCode');
    this.currentRoundDisplay = document.getElementById('currentRoundDisplay');
    this.playerList = document.getElementById('playerList');

    // elements whose updates are sent to the server
    this.hostStartRoundButton = document.getElementById('hostStartRoundButton');
    this.hostStopRoundButton = document.getElementById('hostStopRoundButton');
    this.resetGameButton = document.getElementById('resetGameButton');

    this.setUpDocumentListeners();
    this.setUpServerListeners();

    // ping to the server that the host created a room
    this.socket.emit('hostCreateRoom');
  }

  /////////////////////////////////
  // sending events from server
  /////////////////////////////////
  setUpDocumentListeners() {
    this.hostStartRoundButton?.addEventListener('click', () => {this.sendStartRound()});
    this.hostStopRoundButton?.addEventListener('click', () => {this.sendStopRound()});
    this.resetGameButton?.addEventListener('click', () => this.sendResetGame());
  }

  sendStartRound() {
    if(this.roomParticipants == null){
      // something
    }
    this.currentRoundNumber += 1;
    this.currentRoundDisplay.textContent = this.currentRoundNumber;

    const data = { 
      currentRound: this.currentRoundNumber,
      roomCode: this.roomCode
    }

    this.socket.emit('hostStartRound', data );

    this.hostStartRoundButton.disabled = true;
    this.hostStopRoundButton.disabled = false;
  }

  sendStopRound() {
    const data = { 
      currentRound: this.currentRoundNumber,
      roomCode: this.roomCode
    }

    this.socket.emit('hostStopRound', data );

    this.hostStopRoundButton.disabled = true;
    this.hostStartRoundButton.disabled = false;
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



  ///////////////////////////////
  // received events from server
  /////////////////////////////////

  setUpServerListeners() {
    this.socket.on("roomCreated", (data) => this.receivedRoomCreated(data));
    this.socket.on("playerJoined", (newPlayerList) => this.receivedPlayerJoined(newPlayerList));
    this.socket.on("hostStoppedRound", roundResults => this.receivedStoppedRound(roundResults));
  }

  receivedRoomCreated(data) {
    this.roomCode = data.roomCode;
    this.roomCodeDisplay.textContent = this.roomCode;
  }

  receivedPlayerJoined(newPlayerList) {
    // display players later
  }

  receivedStoppedRound(roundResults) {
    // Display round results
    console.log('Round stopped. Results:', roundResults);
    // implement UI update to display round history
  }
}