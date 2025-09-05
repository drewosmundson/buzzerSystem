
export class Host {
  constructor(socket) {






    this.socket = socket;



  }


  start() {
    console.log("here")
    socket.emit('indexCreateRoomRequest');

  }



}