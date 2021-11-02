let socket = io();
let nameForm = document.getElementById('nameForm');
let nameInput = document.getElementById('nameSubmit');
let playerList = document.getElementById('players');
let playerListDiv = document.getElementById('playerListDiv');
let playerListHeading = document.getElementById('playerListHeading');
let login = document.getElementById('login');
let before_game = document.getElementById('before_game');

nameForm.addEventListener('submit', sendGotNameMessage);

//emit message when name is entered in form
function sendGotNameMessage(e) {
	e.preventDefault();
	socket.emit('gotName', nameInput.value);
	nameForm.style.display = 'none';
	nameInput.value = "";
    login.style.display = 'none';
    before_game.style.display = 'table'
}

// update list on client with player names who are waiting
function updatePlayerList(names) {
	
	playerList.innerHTML = "";
	names.forEach(function (name) {
    	let li = document.createElement('li');
	    li.innerText += name;
		playerList.append(li);
	});
	playerListDiv.style.display = 'block';
	
}

socket.on('connect', () => {
	playerListDiv.style.display = 'none';
	nameForm.style.display = 'block';
	playerListHeading.innerText = "Connected Players";
});


// update message to show that players have joined a game session
socket.on('joinGame', (info) => {
	playerListHeading.innerText = "Your opponents are: "+ info.names;
	playerListDiv.style.display = 'none';
});

socket.on('updateWaitingList', (playerNames) => {
	 updatePlayerList(playerNames);
});

socket.on('restart_game', (data) =>{
    alert(data)
    restartGame();
});


function restartGame() {
    playerListHeading.innerText = "Connected Players";
    playerListDiv.style.display = 'block';
    document.getElementById('players').innerHTML = "";
}
