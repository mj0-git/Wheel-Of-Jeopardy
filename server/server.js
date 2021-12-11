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
		io.to(gameId).emit('renderWheel', { "wheel":wheel, "numQuestions": data});

	});
	socket.on('rcv message', (msg) => {
		io.emit('chat message', msg);

	});
 
	//received player name from the form input
	socket.on('gotName', (data) => {
		console.log("Player " + socket.id + " entered the name " + data);
		playerData[socket.id].setName(data);
		addPlayerToWaitingRoom(socket);
	});

	socket.on('leaveTheGame', (choice) => {
		console.log(socket.id + ' play again?: ' + choice);
		
		performDisconnect(socket, rejoin=choice);

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
		//disconnect/clean up player data
		performDisconnect(socket, rejoin=false);
	});

	//an answer choice was clicked. Tell clients to check answer
	//index contains the socket.id of who clicked and the choice
	socket.on('click', function(index){
		var gameId = playerData[socket.id].getGameId();
        io.to(gameId).emit('checkAnswer', index);
    });

	//a question point value was chosen. Tell clients to display question
	socket.on('click-point', function(index){
		var gameId = playerData[socket.id].getGameId();
		console.log('Server: emit message to display the question');
		io.to(gameId).emit('displayQuestion', index);
	});

	//next turn, check if questions remain
	socket.on('nextTurn', function(counter){
			
		if (parseInt(counter) == 0){
			console.log('No questions remaining. Computing the winner');
			let gameId = playerData[socket.id].getGameId();
			let winners = computeWinner(gameId);
			io.to(gameId).emit('showWinner', winners);
		}
	
		console.log('Server: current player should be updated');
		//update current player?
	});

	//if there are questions remaining, tell client to display num remaining
	//if no questions remaining, calculate winner
	socket.on('decrementQCounter', function(counter){
		console.log('Server: emit message to decrement questions');	
	    var gameId = playerData[socket.id].getGameId();
		io.to(gameId).emit('decrementQuestions', counter);
    });

	socket.on('adjustScore', (data) => {
	   var gameId = playerData[socket.id].getGameId();
	   // only allow let the player who answered adjust scores
	   // this avoids the score being computed three times
	   console.log('Server: adjusting score for ' + data.player);
	   if (socket.id == data.player) {
			if (data.correct == true){   
	   			console.log("Player " + socket.id + " was correct and gains " + data.points);
				playerData[data.player].increaseScore(data.points);
			} else {
	   			console.log("Player " + socket.id + " was incorrect and gains " + data.points);
				playerData[data.player].decreaseScore(data.points);
			}
		   info = []
		   gameData[gameId].getPlayers().forEach((player) => { 
				info.push(playerData[player].getScore());
		   });
		   console.log('Server: emit message to update the displayed score');
		   io.to(gameId).emit('displayScore',{"score":info});
	   }
	});


});

function computeWinner(gameId){
   var scores = []
   gameData[gameId].getPlayers().forEach((player) => { 
		scores.push(playerData[player].getScore());
   });

   let maxScore = Math.max(...scores);
   var winners = []
   for (let i = 0; i < scores.length; i++) {
	 if (scores[i] == maxScore){
         winners.push(playerData[gameData[gameId].getPlayers()[i]].getName());
	 } 	
   }
   return winners 
}

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
    let gameId = playerData[socket.id].getGameId();
	if (gameData[gameId].getPlayers().length == 1){

		//remove game session
		delete gameData[gameId];
	}

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
		io.to(socket.id).emit("restart_game", "You are now in the waiting room");
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

