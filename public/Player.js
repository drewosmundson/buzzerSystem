
export class Player {
  constructor(socket, joinData) {
    this.socket = socket;
    this.currentRoundNumber = 1;
    this.roomCode = joinData?.roomCode || null;
    this.playerNumber = joinData?.playerNumber || null;
    this.buzzerEnabled = false;
    this.countdownActive = false;
    
    // Switch to player screen
    document.getElementById("mainMenu").classList.add("hidden");
    document.getElementById("playerScreen").classList.remove("hidden");

    // Get DOM elements
    this.playerNumberDisplay = document.getElementById('playerNumberDisplay');
    this.playerCurrentRoundDisplay = document.getElementById('playerCurrentRoundDisplay');
    this.playerCountdown = document.getElementById('playerCountdown');
    this.buzzerButton = document.getElementById('buzzer');
    this.playerStatus = document.getElementById('playerStatus');
    this.playerBuzzerResults = document.getElementById('playerBuzzerResults');

    this.setUpDocumentListeners();
    this.setUpServerListeners();
    
    // Update initial display
    if (this.playerNumber) {
      this.playerNumberDisplay.textContent = this.playerNumber;
    }
    this.playerCurrentRoundDisplay.textContent = this.currentRoundNumber;

  }

  /////////////////////////////////
  // sending events to server
  /////////////////////////////////
  setUpDocumentListeners() {
    this.buzzerButton?.addEventListener('click', () => {this.sendBuzz()});
    window.addEventListener('beforeunload', () => {this.sendLeaveRoom();});
  }
  sendBuzz() {
    if (!this.buzzerEnabled) return;
    
    const data = {
      roomCode: this.roomCode,
      playerNumber: this.playerNumber,
      currentRound: this.currentRoundNumber,
      timestamp: Date.now()
    };
    
    this.socket.emit('playerBuzz', data);
    
    // Disable buzzer immediately after pressing
    this.buzzerEnabled = false;
    this.buzzerButton.disabled = true;
    this.playerStatus.textContent = 'Buzzed!';
    this.buzzerButton.textContent = 'BUZZED!';
  }

  sendLeaveRoom() {
    const data = {
      roomCode: this.roomCode,
      playerNumber: this.playerNumber
    };
    
    this.socket.emit('playerLeavesRoom', data);
  }

  ///////////////////////////////
  // received events from server
  ///////////////////////////////
  setUpServerListeners() {
    this.socket.on("hostStartedCountdown", (data) => this.receivedCountdownStarted(data));
    this.socket.on("hostStoppedCountdown", () => this.receivedCountdownStopped());

    this.socket.on("buzzerResults", (results) => this.receivedBuzzerResults(results));

    this.socket.on("disconnect", () => { this.disconect()});
    this.socket.on("reconnect", () => { this.reconnect()});
  }

  disconect() {
    this.playerStatus.textContent = 'Disconnected from server';
    this.buzzerEnabled = false;
    this.buzzerButton.disabled = true;
    this.playerStatus.textContent = 'Waiting...';
  }

  reconnect() {
    this.playerStatus.textContent = 'Reconnected to server';
    // emit a rejoin request here
  }

  
  receivedCountdownStarted(data) {
    this.countdownActive = true;
    this.currentRoundNumber = data.currentRound || this.currentRoundNumber;
    this.playerCurrentRoundDisplay.textContent = this.currentRoundNumber;
    
    const countdownTime = data.countdownTime || 0;
    
    if (countdownTime > 0) {
      this.startCountdownDisplay(countdownTime);
    } else {
      this.buzzerEnabled = true;
      this.buzzerButton.disabled = false;
      this.buzzerButton.textContent = 'BUZZ!';
      this.playerStatus.textContent = 'BUZZ when ready!';
    }
  }

  receivedCountdownStopped() {
    this.countdownActive = false;
    this.buzzerEnabled = false;
    this.buzzerButton.disabled = true;
    this.buzzerButton.textContent = 'BUZZ!';
    this.playerStatus.textContent = 'Round ended';
    this.playerCountdown.classList.add('hidden');
  }

  receivedBuzzerResults(results) {
    // Clear previous results
    this.playerBuzzerResults.innerHTML = '';
    
    // Display buzzer results
    results.forEach((result, index) => {
      const li = document.createElement('li');
      li.textContent = `${index + 1}. Player ${result.playerNumber} - ${result.time}ms`;
      if (result.playerNumber === this.playerNumber) {
        li.classList.add('your-result');
      }
      this.playerBuzzerResults.appendChild(li);
    });
  }


}