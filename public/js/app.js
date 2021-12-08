let socket = io();
let nameForm = document.getElementById('nameForm');
let nameInput = document.getElementById('nameSubmit');
let msgInput = document.getElementById('usermsg');
let playerList = document.getElementById('players');
let playerListDiv = document.getElementById('playerListDiv');
let playerListHeading = document.getElementById('playerListHeading');
let login = document.getElementById('login');
let before_game = document.getElementById('before_game');
let gameLength = document.getElementById('gameLength');
let lengthText = document.getElementById('lengthText');
let temp_correct = null; 
let messages = document.getElementById('messages');
let msgform = document.getElementById('message');
let input = document.getElementById('input');

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

socket.on('setGameLength', () => {
	//TODO display text field to get num questions
	//event listener on text field should emit game length
	//to setServerGameLength, for example:
	gameLength.style.display = 'flex';
	document.getElementById('lengthText').addEventListener('input', () => {
		if (lengthText.value <= 30) {
			document.getElementById('lengthButton').style.display = 'initial';
			document.getElementById('remainQuest').innerHTML = lengthText.value;
			socket.emit("setServerGameLength", lengthText.value);
			document.getElementById('valueError').style.display = 'none';
			document.getElementById('lengthButton').addEventListener('click', () => {
				gameLength.style.display = 'none';
			});
		} else {
			document.getElementById('lengthButton').style.display = 'none';
			document.getElementById('valueError').innerHTML = "Maximum questions length is 30.";
			document.getElementById('valueError').style.display = "block";
		}
	});
});

// update message to show that players have joined a game session
socket.on('joinGame', (info) => {
	before_game.style.display = 'none';
	start_game.style.display = 'table';
	scoreboard.style.display = 'grid';
	buzzbutton.style.display = 'none';
	audio.src = "";
	//for(i=0; i < 3; i++){
	//	console.log(info[i].name);
	//}
	document.getElementById('player-one').innerHTML = info[0].name;
	document.getElementById('player-two').innerHTML = info[1].name;
	document.getElementById('player-three').innerHTML = info[2].name;
	document.getElementById('before_game');
	
	//playerListHeading.innerText = "Your opponents are: "+ info.names;
	//playerListDiv.style.display = 'none';
});

socket.on('renderWheel', (info) => {
	theWheelData = info.wheel;
	numQuestions = info.numQuestions;
	document.getElementById('remainQuest').innerHTML = numQuestions;
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

socket.on('checkAnswer', (data) => {
	checkAnswer(data);
	console.log(data);
});

socket.on('restart_game', (data) =>{
    //alert(data)
	start_game.style.display = 'none';
    before_game.style.display = 'none';
	gameLength.style.display = 'none';
	scoreboard.style.display = 'none';
	login.style.display = 'table';
	nameForm.style.display = 'block';
    restartGame();
});

function checkAnswer(data) {
	var answer = document.getElementById('answer').innerHTML
	var attempt = document.getElementById(data).innerHTML
	if(answer == attempt){
		document.getElementById('is_correct').innerHTML = "CORRECT";
	}
	else{
		document.getElementById('is_correct').innerHTML = "INCORRECT";
	}
	//console.log(answer)
	console.log(answer == attempt); 
	console.log(attempt); 
	console.log("correct");
}

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

msgform.addEventListener('submit', function (e) {
	e.preventDefault();
	if (msgInput.value) {
		socket.emit('rcv message', msgInput.value);
		msgInput.value = '';
	}
});



socket.on('chat message', function (msg) {
	var item = document.createElement('li');
	item.textContent = msg;
	messages.appendChild(item);
	//window.scrollTo(0, document.body.scrollHeight);
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
		document.getElementById('is_correct').innerHTML = "";
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
	document.getElementById('buzzbutton').style.display = 'initial';
	timeraudio.src = "/audio/Countdown.mp3";
	startTimer();

	document.getElementById('buzzbutton').addEventListener('click', () => {
		buzzbutton.style.display = 'none';
		buzzinaudio.src = "/audio/buzzin.wav";
		onTimesUp();
		document.getElementById('question').innerHTML = indicatedSegment['questions'][0].title;
		document.getElementById('choice-one').innerHTML = indicatedSegment['questions'][0].choices[0];
		document.getElementById('choice-two').innerHTML = indicatedSegment['questions'][0].choices[1];
		document.getElementById('choice-three').innerHTML = indicatedSegment['questions'][0].choices[2];
		document.getElementById('choice-four').innerHTML = indicatedSegment['questions'][0].choices[3];
		document.getElementById('answer').innerHTML = indicatedSegment['questions'][0].answer;
	});

	console.log(indicatedSegment['questions']);
	
	resetWheel();
	//startTimer();
	//timeraudio.src = "/audio/Countdown.mp3";
}

// -------------------------------------------------------
// Function for timer.
// -------------------------------------------------------
const FULL_DASH_ARRAY = 283;
const WARNING_THRESHOLD = 3;
const ALERT_THRESHOLD = 2;

const COLOR_CODES = {
	info: {
		color: "green"
	},
	warning: {
		color: "orange",
		threshold: WARNING_THRESHOLD
	},
	alert: {
		color: "red",
		threshold: ALERT_THRESHOLD
	}
};

const TIME_LIMIT = 5;
let timePassed = 0;
let timeLeft = TIME_LIMIT;
let timerInterval = null;
let remainingPathColor = COLOR_CODES.info.color;

reset();

function reset() {
	document.getElementById("app").innerHTML = `
<div class="base-timer">
  <svg class="base-timer__svg" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
    <g class="base-timer__circle">
      <circle class="base-timer__path-elapsed" cx="50" cy="50" r="45"></circle>
      <path
        id="base-timer-path-remaining"
        stroke-dasharray="283"
        class="base-timer__path-remaining ${remainingPathColor}"
        d="
          M 50, 50
          m -45, 0
          a 45,45 0 1,0 90,0
          a 45,45 0 1,0 -90,0
        "
      ></path>
    </g>
  </svg>
  <span id="base-timer-label" class="base-timer__label">${formatTime(
		timeLeft
	)}</span>
</div>
`;
}

function onTimesUp() {
	buzzbutton.style.display = 'none';
	timeraudio.src = "";
	clearInterval(timerInterval);
	timeLeft = TIME_LIMIT;
	reset();
}

function startTimer() {
	timeLeft = TIME_LIMIT;
	timePassed = 0;
	timerInterval = setInterval(() => {
		timePassed = timePassed += 1;
		timeLeft = TIME_LIMIT - timePassed;
		document.getElementById("base-timer-label").innerHTML = formatTime(
			timeLeft
		);
		setCircleDasharray();
		setRemainingPathColor(timeLeft);

		if (timeLeft === 0) {
			onTimesUp();
			timeraudio.src = "/audio/timesup.mp3";
		}
	}, 1000);
}

function formatTime(time) {
	const minutes = Math.floor(time / 60);
	let seconds = time % 60;

	if (seconds < 10) {
		seconds = `0${seconds}`;
	}

	return `${minutes}:${seconds}`;
}

function setRemainingPathColor(timeLeft) {
	const { alert, warning, info } = COLOR_CODES;
	if (timeLeft <= alert.threshold) {
		document
			.getElementById("base-timer-path-remaining")
			.classList.remove(warning.color);
		document
			.getElementById("base-timer-path-remaining")
			.classList.add(alert.color);
	} else if (timeLeft <= warning.threshold) {
		document
			.getElementById("base-timer-path-remaining")
			.classList.remove(info.color);
		document
			.getElementById("base-timer-path-remaining")
			.classList.add(warning.color);
	}
}

function calculateTimeFraction() {
	const rawTimeFraction = timeLeft / TIME_LIMIT;
	return rawTimeFraction - (1 / TIME_LIMIT) * (1 - rawTimeFraction);
}

function setCircleDasharray() {
	const circleDasharray = `${(
		calculateTimeFraction() * FULL_DASH_ARRAY
	).toFixed(0)} 283`;
	document
		.getElementById("base-timer-path-remaining")
		.setAttribute("stroke-dasharray", circleDasharray);
}
