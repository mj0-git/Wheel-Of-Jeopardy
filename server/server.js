const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const uuid = require('uuid');
const publicPath = path.join(__dirname, '/../public');
const port = process.env.PORT || 3000;
const Player = require('./player.js');
const Game = require('./game.js');
let app = express();
let server = http.createServer(app);
let io = socketIO(server);
let Category = require('../models/category.js');

app.use(express.static(publicPath));



let mysql = require('mysql2');
let connectionDetails = {
	host: "localhost",
	user: "trivial_admin",
	password: "password",
	database: "jeopardy"
};


server.listen(port, () => {
	console.log(`Server is up on port ${port}.`)
});

//dictionary to store player data and game data
var playerData = {};
var waitingRoom =  [];
var gameData = {};
var wheel = [];

loadWheel();

io.on('connection', (socket) => {
	console.log('A user just connected with ID ' + socket.id);
    socket.join(socket.id);
	player = new Player(socket.id, socket);
	playerData[socket.id] = player;
	//sessionData["players"][socket.id] = {"socket": socket, "name": "New Player", "gameId": null, "score": 0};

	
	//Need to configure for game session? Set to all current and new right now 
	socket.on('spinIsClicked', (data) => {
		io.emit('spinIsClicked', data);
    });
  
	socket.on('setServerGameLength', (data) => {
		//save game length in Game instance variable
		var gameId = playerData[socket.id].getGameId();
		gameData[gameId].setGameLength(data.length);

		gameData[gameId].startGame();
		//tell all players in game session to show the wheel
		io.to(gameId).emit('renderWheel', { "wheel":wheel});

	});
	socket.on('rcv message', (msg) => {
		io.emit('chat message', msg);

	});
 
	socket.on('gotName', (data) => {
		console.log("Player " + socket.id + " entered the name " + data);
		playerData[socket.id].setName(data);
		addPlayerToWaitingRoom(socket);
	});
	
	socket.on('disconnect', () => {
        console.log(playerData[socket.id].getName() + " has disconnected.");
    	var gameId = playerData[socket.id].getGameId();
		//send other opponents in the game session back to waiting room
		if (gameId != null){
			gameData[gameId].getPlayers().forEach((player) => { 
				if (player != socket.id){
					playerData[player].getSocket().leave(gameId);
					performDisconnect(playerData[player].getSocket(), rejoin=true);
				}
			});
		}
		//remove game session
		delete gameData[gameId];
		//disconnect/clean up player data
		performDisconnect(socket, rejoin=false);
	});

	socket.on('click', function(index){
        io.emit('checkAnswer', index);
    });


});

function generatePlayerData(socket){
	var gameId = playerData[socket.id].getGameId();
	let gamePlayers = gameData[gameId].getPlayers().map(tempId => {return playerData[tempId].getData()});
	return gamePlayers;
}

function addPlayerToWaitingRoom(socket){
	waitingRoom.push(socket.id);
	playerData[socket.id].setWaiting(true);
	console.log("Added " + socket.id +  " to waiting room"); 
	socket.join('waitingroom');
	// make a game instance if there are more than three players
	//TODO race condition here if many players join at once?
	if (waitingRoom.length >= 3) {
		createGameInstance(socket);
	}
	// make list of player names who are in waiting room
	//let waitingPlayers = sessionData["waitingPlayers"].map(tempId => {return sessionData["players"][tempId]["name"]});
	let waitingPlayers = waitingRoom.map(tempId => {return playerData[tempId].getName()});
	console.log("waiting players are: " + waitingPlayers);
	io.in("waitingroom").emit('updateWaitingList', waitingPlayers);
	console.log("Sent message with updated waiting room list");
}

function performDisconnect(socket, rejoin=false){
 
	if (!rejoin){
	    // remove player from waiting room if they are waiting	
		var pos = waitingRoom.indexOf(socket.id)
		if (pos >= 0){
			waitingRoom.splice(pos, 1);
		} 
		//remove player session
		delete playerData[socket.id];
		console.log("Player " + socket.id + " deleted");
	} else {
		//implies a player was removed from a game
		//place them in the waiting room
		playerData[socket.id].setGameId(null);
		io.to(socket.id).emit("restart_game", "A player has left the game! You are now in the waiting room");
		addPlayerToWaitingRoom(socket);
	}
	
}


function loadWheel(){
	let con = mysql.createConnection(connectionDetails);
	con.query('SELECT * FROM questions ORDER BY category', function (error, results, fields) {
		if (error) throw error;
		var category = new Category(results[0].category, 5);
		for (i in results) {
			if (results[i].category != category.name) {
				wheel.push(category);
				category = new Category(results[i].category, 5);
			}
			var title = results[i].title;
			var choices = [results[i].answer_a, results[i].answer_b, results[i].answer_c, results[i].answer_d];
			var answer = results[i].correct_answer
			var points = results[i].points
			category.addQuestion(title, choices, answer, points);
		}
		wheel.push(category);
		//console.log(wheel);
	});
	con.end();
}

//select first three players and make a Game session for them
function createGameInstance(socket){
	let gameId = uuid.v4();
	gameData[gameId] = new Game(gameId);
	console.log("New Game Instance: " + gameId);
	for (var i = 0; i < 3; i++) {
		var player = waitingRoom.shift();
		playerData[player].setGameId(gameId);
		playerData[player].setWaiting(false);
		gameData[gameId].addPlayer(player);
		playerData[player].getSocket().leave("waitingroom");
		playerData[player].getSocket().join(gameId);
		console.log(playerData[player].getSocket().rooms);
	
	}
	// make list of player names who are part of the game session
	io.to(gameId).emit('joinGame', generatePlayerData(socket));
	let hostID = gameData[gameId].getPlayers()[0];
	playerData[hostID].setHost();
	io.to(hostID).emit('setGameLength');
}

