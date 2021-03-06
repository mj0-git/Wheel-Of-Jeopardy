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
var p1;
var p2;
var p3;

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
		const string1 = playerData[socket.id].getName() + ': ' + msg;
		io.emit('chat message', string1);

	});
 
	//received player name from the form input
	socket.on('gotName', (data) => {
		console.log("Player " + socket.id + " entered the name " + data);
		playerData[socket.id].setName(data);
		addPlayerToWaitingRoom(socket);
	});

	//get current player and tell client who to enable point slection for
	socket.on('enablePointsForCurrentPlayer', () => {
		let gameId = playerData[socket.id].getGameId();
		let currentPlayer = gameData[gameId].getCurrentPlayer();
		console.log("Server: enable point choice for player with sid" + currentPlayer);
		io.to(gameId).emit('enablePoints', currentPlayer);
	});

	//will allow a user to rejoin waiting room by calling performDisconnect with rejoin = true
	socket.on('leaveTheGame', (data) => {
		if (socket.id == data.player && data.choice){
			performDisconnect(socket, rejoin=true);
		}
		

	});
	
	socket.on('disconnect', () => {
        console.log(playerData[socket.id].getName() + " has disconnected.");
    	var gameId = playerData[socket.id].getGameId();
		if (gameId != null){
			//player left a finished game. Do not kick out remaining players until they select yes or no
			if (gameData[gameId].getIsDone()){
				//disconnect/clean up player data
				performDisconnect(socket, rejoin=false);
			} else { //during the game, kick everyone out of the game if someone leaves. Put remaining players in waiting
				//send other opponents in the game session back to waiting room
				gameData[gameId].getPlayers().forEach((player) => { 
					if (player != socket.id){
						playerData[player].getSocket().leave(gameId);
						performDisconnect(playerData[player].getSocket(), rejoin=true);
					}
				});
			}
		} else {
			//imples player was in waiting room
			//disconnect/clean up player data
			performDisconnect(socket, rejoin=false);
		}

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
		let gameId = playerData[socket.id].getGameId();
		//this happens if no more questions remain
		if (parseInt(counter) == 0){
			//tells server to diable spin/wheel/clicking
			io.to(gameId).emit('endGame');
			//sets flag that game is over
			gameData[gameId].setIsDone(true);
			//determine winner(s)
			console.log('No questions remaining. Computing the winner');
			let winners = computeWinner(gameId);
			//tell frontend to show winner modal
			io.to(gameId).emit('showWinner', winners);
		}
		//tell front end to start next turn and who current player is
		let currentPlayer = gameData[gameId].getCurrentPlayer();
		console.log("Server: enable wheel for player with sid" + currentPlayer);
		io.to(gameId).emit('startNextTurn', currentPlayer);
	});


	//if there are questions remaining, tell client to display num remaining
	//if no questions remaining, calculate winner
	socket.on('decrementQCounter', function(counter){
		console.log('Server: emit message to decrement questions');	
	    var gameId = playerData[socket.id].getGameId();
		io.to(gameId).emit('decrementQuestions', counter);
    });

	//increment/decrement score
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
			//tell front end the new scores for all players
		   gameData[gameId].getPlayers().forEach((player) => { 
				info.push(playerData[player].getScore());
		   });
		   console.log('Server: emit message to update the displayed score');
		   io.to(gameId).emit('displayScore',{"score":info});
	   }
	});

	socket.on('displaybuzzers', () => {
		enableBuzzers();
	});

	socket.on('hidebuzzers', (index) => {
		var gameId = playerData[socket.id].getGameId();
		
		//make the current player update the game data
		// this prevents multiple updates
		let newCurrentPlayerSID = gameData[gameId].getPlayers()[index];
		if (socket.id == newCurrentPlayerSID){
			console.log('Server: current player is now player #' + index);
			gameData[gameId].setCurrentPlayer(index);
		}

		io.to(gameId).emit('disableallbuzzers', index);
		
	});

});

function computeWinner(gameId){
   var scores = []
	//get the scores for each player
   gameData[gameId].getPlayers().forEach((player) => { 
		scores.push(playerData[player].getScore());
   });
	//determine max score
   let maxScore = Math.max(...scores);
   var winners = [maxScore]
	//see if multiple players have a max score (tie)
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
	//if this was the last player in the game, delete game data
	if (gameId != null && gameData[gameId].getPlayers().length == 1) {
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
		console.log("Player " + socket.id + " data deleted");
		io.to(socket.id).emit("restart_game", "Enter your name");
	} else {
		//implies a player was removed from a game
		//place them in the waiting room
		playerData[socket.id].setGameId(null);
		addPlayerToWaitingRoom(socket);
		io.to(socket.id).emit("waiting_room", "You are now in the waiting room");
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
	p1 = gameData[gameId].getPlayers()[0];
	p2 = gameData[gameId].getPlayers()[1];
	p3 = gameData[gameId].getPlayers()[2];

}

function enableBuzzers() {
	io.to(p1).emit('buzz1enable');
	io.to(p2).emit('buzz2enable');
	io.to(p3).emit('buzz3enable');
}
