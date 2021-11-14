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
	before_game.style.display = 'none';
    start_game.style.display = 'table';
	//playerListHeading.innerText = "Your opponents are: "+ info.names;
	//playerListDiv.style.display = 'none';
});

socket.on('renderWheel', (info) => {
	theWheelData = info.wheel;
	for(i=1; i <=5; i++){
		theWheel['segments'][i]['text'] = theWheelData[i].name;
		theWheel['segments'][i]['questions'] = theWheelData[i].questions;
	}
	theWheel.draw(); 
	resetWheel();
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

spin_button.addEventListener('click', () => {
    socket.emit('spinIsClicked', {
		stopAt : Math.floor((Math.random() * 359))

	});
})

socket.on('spinIsClicked', (data) => {
	stopAt = data.stopAt;
    startSpin(stopAt);
});



// Vars used by the code in this page to do power controls.
let wheelPower    = 1;
let wheelSpinning = false;
let theWheel = new Winwheel({
	'numSegments'  : 5,     // Specify number of segments.
	'outerRadius'  : 212,   // Set outer radius so wheel fits inside the background.
	'textFontSize' : 20,    // Set font size as desired.
	'segments'     :        // Define segments including colour and text.
	[
	   {'fillStyle' : '#eae56f', 'text' : '', 'questions':''},
	   {'fillStyle' : '#89f26e', 'text' : '', 'questions':''},
	   {'fillStyle' : '#7de6ef', 'text' : '', 'questions':''},
	   {'fillStyle' : '#e7706f', 'text' : '', 'questions':''},
	   {'fillStyle' : '#c133ff', 'text' : '', 'questions':''},

	],
	'animation' :           // Specify the animation to use.
	{
		'type'     : 'spinToStop',
		'duration' : 5,     // Duration in seconds.
		'spins'    : 8,     // Number of complete spins.
		'callbackFinished' : getQuestions
	}
});


// -------------------------------------------------------
// Click handler for spin button.
// -------------------------------------------------------
function startSpin(stopAt)
{
	// Ensure that spinning can't be clicked again while already running.
	if (wheelSpinning == false) {
		theWheel.animation.spins = 3;
		// Disable the spin button so can't click again while wheel is spinning.
		document.getElementById('spin_button').src       = "images/spin_off.png";
		document.getElementById('spin_button').className = "";

		theWheel.animation.stopAngle = stopAt;

		// Begin the spin animation by calling startAnimation on the wheel object.
		theWheel.startAnimation();
		wheelSpinning = true;
	}
}

// -------------------------------------------------------
// Function for reset button.
// -------------------------------------------------------
function resetWheel()
{
	theWheel.stopAnimation(false);  // Stop the animation, false as param so does not call callback function.
	theWheel.rotationAngle = 0;     // Re-set the wheel angle to 0 degrees.
	//theWheel.draw();                // Call draw to render changes to the wheel.
	document.getElementById('spin_button').src = "images/spin_on.png";
	document.getElementById('spin_button').className = "clickable";
	wheelSpinning = false;          // Reset to false to power buttons and spin can be clicked again.
}


function getQuestions(indicatedSegment)
{	
	document.getElementById('question').innerHTML = indicatedSegment['questions'][0].title;
	document.getElementById('choice-one').innerHTML = indicatedSegment['questions'][0].choices[0];
	document.getElementById('choice-two').innerHTML = indicatedSegment['questions'][0].choices[1];
	document.getElementById('choice-three').innerHTML = indicatedSegment['questions'][0].choices[2];
	document.getElementById('choice-four').innerHTML = indicatedSegment['questions'][0].choices[3];

	console.log(indicatedSegment['questions']);
	
	resetWheel();
}