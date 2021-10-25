let socket = io();
let crazyButton = document.getElementById('crazyButton');
let startButton = document.getElementById('startButton');
let form = document.getElementById('nameForm');
let input = document.getElementById('nameSubmit');
let playerList = document.getElementById('players');
let playerListDiv = document.getElementById('playerListDiv');
let playerListHeading = document.getElementById('playerListHeading');

startButton.addEventListener('click', () => {
    socket.emit('startGame');
});

crazyButton.addEventListener('click', () => {
    socket.emit('crazyIsClicked', {
        offsetLeft: Math.random() * ((window.innerWidth - crazyButton.clientWidth) - 100),
        offsetTop: Math.random() * ((window.innerHeight - crazyButton.clientHeight) - 50)
    });
})


form.addEventListener('submit', sendGotNameMessage);

//emit message when name is entered in form
function sendGotNameMessage(e) {
	e.preventDefault();
	socket.emit('gotName', input.value);
	form.style.display = 'none';
	input.value = "";
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
	form.style.display = 'block';
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

socket.on('startGame', () => {
    hideStartButton();
});

socket.on('crazyIsClicked', (data) => {
    goCrazy(data.offsetLeft, data.offsetTop);
});

function hideStartButton() {
    startButton.style.display = "none";
    crazyButton.style.display = "block";
}

function goCrazy(offLeft, offTop) {
    let top, left;

    left = offLeft;
    top = offTop;

    crazyButton.style.top = top + 'px';
    crazyButton.style.left = left + 'px';
    crazyButton.style.animation = "none";
}
