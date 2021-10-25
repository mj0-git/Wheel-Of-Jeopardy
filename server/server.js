const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');

const publicPath = path.join(__dirname, '/../public');
const port = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);

app.use(express.static(publicPath));

server.listen(port, ()=> {
    console.log(`Server is up on port ${port}.`)
});

io.on('connection', (socket) => {
	console.log('A user just connected.');
    console.log(socket.id);
    socket.on('disconnect', () => {
        console.log('A user has disconnected.');
        messageClients();
    })
    socket.on('startGame', () => {
        io.emit('startGame');
    })
    socket.on('crazyIsClicked', (data) => {
        io.emit('crazyIsClicked', data);
    });
    
});

function messageClients() {
    io.emit("restart_game", "A player has left the game. Restarting game!");
}




