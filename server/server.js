const path = require('path');
const http = require('http');
const express = require('express');
const socketIO = require('socket.io');
const uuid = require('uuid');
const publicPath = path.join(__dirname, '/../public');
const port = process.env.PORT || 3000;
let app = express();
let server = http.createServer(app);
let io = socketIO(server);
let Category = require('../models/category.js');

app.use(express.static(publicPath));



let mysql      = require('mysql2');
let connectionDetails = {
    host: "localhost",
    user: "root",
    password: "object00",
    database: "jeopardy"
};


server.listen(port, ()=> {
    console.log(`Server is up on port ${port}.`)
});

//dictionary to store player data and game data
var sessionData = {
	"players": [],
	"waitingPlayers": [],
};
var wheel = [];

loadWheel();

function loadWheel(){
	let con = mysql.createConnection(connectionDetails);
	con.query('SELECT * FROM questions ORDER BY category', function (error, results, fields) {
		if (error) throw error;
		var category = new Category(results[0].category, 5);
		for (i in results){
			if (results[i].category != category.name){
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

//select first three players and make a game session for them
function createGameInstance(){
	console.log("new instance");
	let gameId = uuid.v4();
	sessionData[gameId] = []
	console.log("New Game Instance");
	for (var i = 0; i < 3; i++) {
		var player = sessionData["waitingPlayers"].shift();
		sessionData["players"][player]["gameId"] = gameId;
		sessionData[gameId].push(player);
		//add player to game session room, remove from wait room
	}
	// make list of player names who are part of the game session
	let gamePlayers = sessionData[gameId].map(tempId => {return sessionData["players"][tempId]["name"]});
	sessionData[gameId].forEach(function (id) {
		io.to(id).emit('joinGame', {"gameId":gameId, "names": gamePlayers});
	})
}

io.on('connection', (socket) => {
	console.log('A user just connected with ID ' + socket.id);
    sessionData["players"][socket.id] = {"socket": socket, "name": "New Player", "gameId": null, "score": 0};

	
	socket.on('joinGame', (info) => {
		socket.leave('waitingroom');
		socket.join(info.gameId);		
	});	
    
	socket.on('gotName', (data) => {
		sessionData["players"][socket.id]["name"] = data;
		sessionData["waitingPlayers"].push(socket.id);
		socket.join('waitingroom');
		// make a game instance if there are more than three players
		if (sessionData["waitingPlayers"].length >= 3) {
			createGameInstance();
			//loadQuestions(createGameInstance);
		}
		
		// make list of player names who are in waiting room
		let waitingPlayers = sessionData["waitingPlayers"].map(tempId => {return sessionData["players"][tempId]["name"]});
		io.in("waitingroom").emit('updateWaitingList', waitingPlayers);
	});
	
	socket.on('disconnect', () => {
        console.log(sessionData["players"][socket.id]["name"] + " has disconnected.");
        messageClients();
		if (sessionData["players"][socket.id]["gameId"] != null){
			console.log("player left the game");
			var gameId = sessionData["players"][socket.id]["gameId"];
			var pos = sessionData[gameId].indexOf(socket.id);
			sessionData[gameId].splice(pos, 1);
		} else {
			var pos = sessionData["waitingPlayers"].indexOf(socket.id)
			if (pos >= 0){
				sessionData["waitingPlayers"].splice(pos, 1);
			} 
		}
		
		delete sessionData["players"][socket.id];
		
	})
    socket.on('restart_game', () => {
	
	if (sessionData["players"][socket.id]["gameId"] != null){
		var gameId = sessionData["players"][socket.id]["gameId"];
		var pos = sessionData[gameId].indexOf(socket.id);
		sessionData[gameId].splice(pos, 1);
		socket.leave(gameId);
		io.to(socket.id).emit("gotName", sessionData["players"][socket.id]["name"]);
	}
    });

});

function messageClients() {
    io.emit("restart_game", "A player has left the game. Restarting game!");
}

