











export class Player {
  constructor(socket) {
    this.socket = socket;
    this.setUpDocumentListeners();
    this.setUpServerListeners();
    this.socket.emit('playerJoinRoomRequest');
  }



}