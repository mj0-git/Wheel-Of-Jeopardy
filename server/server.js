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

var mysql = require('mysql2');

var con = mysql.createConnection({
  host: "localhost",
  user: "trivial_admin",
  password: "password",
  database: "jeopardy"
});

con.connect(function(err) {
    if (err) throw err;
});

server.listen(port, ()=> {
    console.log(`Server is up on port ${port}.`)
});

io.on('connection', (socket) => {
    console.log('A user just connected.');
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
    socket.on('chat message', (msg) => {
        console.log('message: ' + msg);
    });
    socket.on('chat message', (msg) => {
        io.emit('chat message', msg);
    });
    socket.on('questionIsClicked', (data) => {
        con.connect(function(err) {
            if (err) throw err;
            con.query("SELECT * FROM questions", function (err, result, fields) {
              if (err) throw err;
              console.log(result);
            });
          });
        io.emit('questionIsClicked', data);
    });

});

function messageClients() {
    io.emit("restart_game", "A player has left the game. Restarting game!");
}




