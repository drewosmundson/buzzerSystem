export class Player {
  constructor(socket, joinData) {
    this.socket = socket;
    this.currentRoundNumber = joinData?.currentRound || 1;
    this.roomCode = joinData?.roomCode || null;
    this.playerNumber = joinData?.playerNumber || null;
    this.buzzerEnabled = false;
    
    // Switch to player screen
    document.getElementById("mainMenu").classList.add("hidden");
    document.getElementById("playerScreen").classList.remove("hidden");

    // Get DOM elements
    this.playerNumberDisplay = document.getElementById('playerNumberDisplay');
    this.playerCurrentRoundDisplay = document.getElementById('playerCurrentRoundDisplay');
    this.buzzerButton = document.getElementById('buzzer');
    this.playerStatus = document.getElementById('playerStatus');
    this.playerBuzzerResults = document.getElementById('PlayerBuzzerResults');
    this.yourResult = document.getElementById('yourResult');
    this.winnerDisplayPlayer = document.getElementById('winnerDisplayPlayer');
    this.playerRound = document.getElementById('playerRound');

    this.setUpDocumentListeners();
    this.setUpServerListeners();
    
    // Update initial display
    if (this.playerNumber) {
      this.playerNumberDisplay.textContent = this.playerNumber;
    }
    this.playerCurrentRoundDisplay.textContent = this.currentRoundNumber;
  }

  //------------------------------
  // sending events to server
  //----------------------------
  setUpDocumentListeners() {
    this.buzzerButton?.addEventListener('click', () => {this.sendBuzz()});
    
    // Handle page unload
    window.addEventListener('beforeunload', () => {
      this.sendLeaveRoom();
    });
    
    // Handle page visibility change (mobile background)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.handleGoingBackground();
      } else {
        this.handleComingForeground();
      }
    });
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
    this.buzzerButton.textContent = 'BUZZED!';
    this.buzzerButton.classList.add('buzzed');
    this.playerStatus.textContent = 'Buzzed! Waiting for results...';
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
    // Round control events
    this.socket.on("hostStartedRound", (data) => this.receivedRoundStarted(data));
    this.socket.on("hostStoppedRound", () => this.receivedRoundStopped());

    // Results events
    this.socket.on("buzzerResults", (results) => this.receivedBuzzerResults(results));

    // Game state events
    this.socket.on("gameReset", () => this.receivedGameReset());
    this.socket.on("rejoinAccepted", (data) => this.receivedRejoinAccepted(data));
    this.socket.on("rejoinRejected", (reason) => this.receivedRejoinRejected(reason));
    

    // Connection events
    this.socket.on("disconnect", () => this.handleDisconnect());
    this.socket.on("reconnect", () => this.handleReconnect());
    this.socket.on("hostDisconnected", () => this.handleHostDisconnected());
  }

  disconnect() {
    this.playerStatus.textContent = 'Disconnected from server';
    this.buzzerEnabled = false;
    this.buzzerButton.disabled = true;
    this.playerStatus.textContent = 'Waiting...';
  }

  reconnect() {
    this.playerStatus.textContent = 'Reconnected to server';
    // emit a rejoin request here
  }

  
  receivedRoundStarted(data) {
    this.roundActive = true;
    this.currentRoundNumber = data.currentRound || this.currentRoundNumber;
    this.playerCurrentRoundDisplay.textContent = this.currentRoundNumber;
    
    const roundTime = data.roundTime || 0;
    
    if (roundTime > 0 && this.playerRound) {
      // Clear any existing timer
      if (this.roundTimer) {
        clearInterval(this.roundTimer);
      }
      
      // Show round countdown
      this.playerRound.classList.remove('hidden');
      this.playerStatus.textContent = 'Get ready...';
      this.buzzerButton.textContent = 'WAIT...';
      this.buzzerButton.disabled = true;
      this.buzzerEnabled = false;
      
      let timeLeft = roundTime;
      const roundNumberElement = this.playerRound.querySelector('.round');
      if (roundNumberElement) {
        roundNumberElement.textContent = timeLeft;
      }
      
      this.roundTimer = setInterval(() => {
        timeLeft--;
        
        if (timeLeft > 0 && roundNumberElement) {
          roundNumberElement.textContent = timeLeft;
        } else if (timeLeft === 0 && roundNumberElement) {
          roundNumberElement.textContent = 'GO!';
          setTimeout(() => {
            this.playerRound.classList.add('hidden');
            this.buzzerEnabled = true;
            this.buzzerButton.disabled = false;
            this.buzzerButton.textContent = 'BUZZ!';
            this.buzzerButton.classList.remove('buzzed');
            this.playerStatus.textContent = 'BUZZ when ready!';
          }, 500);
          clearInterval(this.roundTimer);
        }
      }, 1000);
    } else {
      // No countdown - enable buzzer immediately
      this.buzzerEnabled = true;
      this.buzzerButton.disabled = false;
      this.buzzerButton.textContent = 'BUZZ!';
      this.buzzerButton.classList.remove('buzzed');
      this.playerStatus.textContent = 'BUZZ when ready!';
    }
  }

  receivedRoundStopped() {
    this.roundActive = false;
    this.buzzerEnabled = false;
    this.buzzerButton.disabled = true;
    
    // Clear round timer if running
    if (this.roundTimer) {
      clearInterval(this.roundTimer);
      this.roundTimer = null;
    }
    
    // Only reset button text if not already buzzed
    if (!this.buzzerButton.classList.contains('buzzed')) {
      this.buzzerButton.textContent = 'BUZZ!';
    }
    
    this.playerStatus.textContent = 'Round ended';
    if (this.playerRound) {
      this.playerRound.classList.add('hidden');
    }
  }


  receivedBuzzerResults(results) {
    // Clear previous results
    this.playerBuzzerResults.innerHTML = '';
    this.yourResult.classList.add('hidden');
    
    if (!results || results.length === 0) {
      const li = document.createElement('li');
      li.textContent = 'No buzzes yet';
      this.playerBuzzerResults.appendChild(li);
      return;
    }
    
    // Display buzzer results
    results.forEach((result, index) => {
      const li = document.createElement('li');
      const position = index + 1;
      const timeDisplay = result.time === 0 ? 'First!' : `+${result.time}ms`;
      
      li.textContent = `${position}. Player ${result.playerNumber} - ${timeDisplay}`;
      
      if (result.playerNumber === this.playerNumber) {
        li.classList.add('your-result');
        
        // Show special message for your result
        this.yourResult.classList.remove('hidden');
        if (position === 1) {
          this.yourResult.textContent = 'First place!';
          this.yourResult.style.color = '#FFD700';
        } else if (position === 2) {
          this.yourResult.textContent = 'Second place';
          this.yourResult.style.color = '#C0C0C0';
        } else if (position === 3) {
          this.yourResult.textContent = 'Third place';
          this.yourResult.style.color = '#CD7F32';
        } else {
          this.yourResult.textContent = `You placed #${position}`;
          this.yourResult.style.color = '#4CAF50';
        }
      }
      
      this.playerBuzzerResults.appendChild(li);
    });
  }

  
  receivedGameReset() {
    this.currentRoundNumber = 1;
    this.playerCurrentRoundDisplay.textContent = this.currentRoundNumber;
    this.buzzerEnabled = false;
    this.buzzerButton.disabled = true;
    this.buzzerButton.textContent = 'BUZZ!';
    this.buzzerButton.classList.remove('buzzed');
    this.playerStatus.textContent = 'Game reset - waiting for host...';
    this.playerBuzzerResults.innerHTML = '';
    this.yourResult.classList.add('hidden');
  }

  receivedRejoinAccepted(data) {
    this.currentRoundNumber = data.currentRound;
    this.playerCurrentRoundDisplay.textContent = this.currentRoundNumber;
    this.playerStatus.textContent = 'Reconnected successfully!';
    
    // Update buzzer state based on whether round is active
    if (data.buzzerActive) {
        this.buzzerEnabled = true;
        this.buzzerButton.disabled = false;
        this.buzzerButton.textContent = 'BUZZ!';
        this.buzzerButton.classList.remove('buzzed');
        this.playerStatus.textContent = 'BUZZ when ready!';
    } else {
      this.buzzerButton.disabled = true;
      this.playerStatus.textContent = 'Waiting for host to start...';
    }
    
    // Show current round results if any
    if (data.currentRoundBuzzes && data.currentRoundBuzzes.length > 0) {
      this.receivedBuzzerResults(data.currentRoundBuzzes);
    }
  }



  receivedRejoinRejected(reason) {
    this.playerStatus.textContent = `Failed to rejoin: ${reason}`;
    this.playerStatus.style.color = '#f44336';
  }


  handleDisconnect() {
    this.playerStatus.textContent = 'Disconnected from server';
    this.playerStatus.style.color = '#f44336';
    this.buzzerEnabled = false;
    this.buzzerButton.disabled = true;
    
    // Clear any running timers
    if (this.roundTimer) {
      clearInterval(this.roundTimer);
      this.roundTimer = null;
    }
  }

  handleReconnect() {
    this.playerStatus.textContent = 'Reconnected! Syncing...';
    this.playerStatus.style.color = '#4CAF50';
    
    // Attempt to rejoin the room
    const data = {
      roomCode: this.roomCode,
      playerNumber: this.playerNumber
    };
    
    this.socket.emit('playerRejoinRoomRequest', data);
  }

  handleHostDisconnected() {
    this.playerStatus.textContent = 'Host disconnected - room closed';
    this.playerStatus.style.color = '#f44336';
    this.buzzerEnabled = false;
    this.buzzerButton.disabled = true;
    
    // Show return to menu button after delay
    setTimeout(() => {
      if (confirm('The host has disconnected. Return to main menu?')) {
        location.reload();
      }
    }, 2000);
  }

  handleGoingBackground() {
    // Handle when app goes to background (mobile)
    console.log('App went to background');
  }

  handleComingForeground() {
    // Handle when app comes back to foreground
    console.log('App came to foreground');
    if (this.socket.disconnected) {
      this.socket.connect();
    }
  }
}