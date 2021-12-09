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
	console.log("render wheel");
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

socket.on('displayQuestion', (data) => {
	disablePoints();
	setTimeout(function(){
		displayQuestion(parseInt(data));
	}, 3000); 
});

socket.on('checkAnswer', (data) => {
	disableChoices();
	checkAnswer(data);
});

socket.on('decrementQuestions', (data) => {
	document.getElementById('remainQuest').innerHTML = data;
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

	var answer = document.getElementById('answer').innerHTML;
	var correct_index = -1;
	// Find index of correct choice
	for (x=1; x<=4;x++){
		if(document.getElementById('choice-'+x).innerHTML == answer){
			correct_index = x;
			break;
		}
	}
	// Check if buzzed
	if (data != null){
		var attempt = document.getElementById(data).innerHTML;
		if(answer == attempt){
			document.getElementById(data).style.backgroundColor = "green";
			document.getElementById('is_correct').innerHTML = "CORRECT!!";
			timeraudio.src = "/audio/rightanswer.mp3";
		}
		else{
			document.getElementById(data).style.backgroundColor = "red";
			document.getElementById('choice-'+correct_index).style.backgroundColor = "green";
			document.getElementById('is_correct').innerHTML = "INCORRECT!!";
			timeraudio.src = "/audio/wronganswer.mp3";
		}
	}
	// Show answer if no buzz
	else{
		document.getElementById('choice-'+correct_index).style.backgroundColor = "green";
		document.getElementById('is_correct').innerHTML = "NO BUZZ DETECTED!!";
	}

	//Enable spin
	resetWheel();
}


function restartGame() {
    playerListHeading.innerText = "Connected Players";
    playerListDiv.style.display = 'block';
    document.getElementById('players').innerHTML = "";
}


spin_button.addEventListener('click', () => {
	socket.emit('spinIsClicked', {
		stopAt: Math.floor((Math.random() * 359))

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
		'callbackFinished' : displayPoints
	}
});


// -------------------------------------------------------
// Click handler for spin button.
// -------------------------------------------------------
function startSpin(stopAt)
{
	timeraudio.src = "/audio/spinning wheel.mp3";
	// Ensure that spinning can't be clicked again while already running.
	if (wheelSpinning == false) {
		theWheel.animation.spins = 3;
		points_display.style.display = 'none';
		question_display.style.display = 'none';
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
	document.getElementById('spin_button').src = "images/spin_on.png";
	document.getElementById('spin_button').className = "clickable";
	wheelSpinning = false;          // Reset to false to power buttons and spin can be clicked again.
}

function displayPoints(indicatedSegment)
{	
	var count = 0;

	// Populate Points
	for (let value of indicatedSegment['questions']){
		console.log(value.points);
		document.getElementById('point-'+count).innerHTML = value.points;
		document.getElementById('point-'+count).style.display = 'table-cell';
		count++;
	}
	
	// Hide Points for deleted questions
	var remaining_q = indicatedSegment['questions'].length;
	var numDeleted = 5 - remaining_q;
	console.log(indicatedSegment['questions']);
	if (numDeleted > 0){
		for(x=4;x >= remaining_q; x--){
			document.getElementById('point-'+x).innerHTML = "";
			document.getElementById('point-'+x).style.display = 'none';
		}
	}

	enablePoints();
	points_display.style.display = 'table';
}

function disableChoices(){

	for(x=1;x<=4;x++){
		document.getElementById('choice-'+x).onclick = null;
		document.getElementById('choice-'+x).style.opacity = "0.3";
		document.getElementById('choice-'+x).style.backgroundColor = "#FFFFE0";
	}
}

function enableChoices(){

	for(x=1;x<=4;x++){
		document.getElementById('choice-'+x).style.opacity = "1";
		document.getElementById('choice-'+x).style.backgroundColor = "#FFFFE0";
	}
	document.getElementById('choice-1').onclick = function(){ socket.emit('click', 'choice-1')};
	document.getElementById('choice-2').onclick = function(){ socket.emit('click', 'choice-2')};
	document.getElementById('choice-3').onclick = function(){ socket.emit('click', 'choice-3')};
	document.getElementById('choice-4').onclick = function(){ socket.emit('click', 'choice-4')};
}

function disablePoints(){

	for(x=0;x<=4;x++){
		document.getElementById('point-'+x).onclick = null;
		document.getElementById('point-'+x).style.opacity = "0.3";
	}
}

function enablePoints(){

	for(x=0;x<=4;x++){
		document.getElementById('point-'+x).style.opacity = "1";
	}
	document.getElementById('point-0').onclick = function(){ socket.emit('click-point', '0')};
	document.getElementById('point-1').onclick = function(){ socket.emit('click-point', '1')};
	document.getElementById('point-2').onclick = function(){ socket.emit('click-point', '2')};
	document.getElementById('point-3').onclick = function(){ socket.emit('click-point', '3')};
	document.getElementById('point-4').onclick = function(){ socket.emit('click-point', '4')};
}


function displayQuestion(index)
{	
	document.getElementById('buzzbutton').style.display = 'initial';
	timeraudio.src = "/audio/Countdown.mp3";
	startTimer();

	points_display.style.display = 'none';
	question_display.style.display = 'table';
	var indicatedSegment = theWheel.getIndicatedSegment();

	document.getElementById('question').innerHTML = indicatedSegment['questions'][index].title;
	document.getElementById('choice-1').innerHTML = indicatedSegment['questions'][index].choices[0];
	document.getElementById('choice-2').innerHTML = indicatedSegment['questions'][index].choices[1];
	document.getElementById('choice-3').innerHTML = indicatedSegment['questions'][index].choices[2];
	document.getElementById('choice-4').innerHTML = indicatedSegment['questions'][index].choices[3];
	document.getElementById('answer').innerHTML = indicatedSegment['questions'][index].answer;
	document.getElementById('points').innerHTML = indicatedSegment['questions'][index].points;
	disableChoices();

	// Delete question/category
	removeQuestion(indicatedSegment, index);

	document.getElementById('buzzbutton').addEventListener('click', () => {
		buzzbutton.style.display = 'none';
		buzzinaudio.src = "/audio/buzzin.wav";
		enableChoices();
		onTimesUp();
		timeraudio.src = "/audio/thinkingmusic.mp3";
	});

	/*
		Once questions get to zero - end the game (implement code below)

		if (lenthText.value == 0)
		{
			end game
		}
	*/
}

function removeQuestion(indicatedSegment, index){
	eg_index = theWheel['segments'].indexOf(indicatedSegment);
	var questions = theWheel['segments'][eg_index]['questions'];
	questions.splice(index,1);
	if (questions.length == 0){
		theWheel.deleteSegment(eg_index);
		theWheel.draw();
	}
	else{
		theWheel['segments'][eg_index]['questions'] = questions;
	}
	
	var counter = document.getElementById('remainQuest').innerHTML;
	counter = counter - 1;
	socket.emit("decrementQCounter", counter); //Decrement Question Counter
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
	//Show Answer if no buzz
	//checkAnswer(null);
	timeraudio.src = "";
	clearInterval(timerInterval);
	timeLeft = TIME_LIMIT;
	reset();
	
}

function startTimer() {
	timeLeft = TIME_LIMIT;
	timePassed = 0;
	document.getElementById("base-timer-path-remaining").classList.remove(COLOR_CODES.alert.color);
	document.getElementById("base-timer-path-remaining").classList.add(COLOR_CODES.info.color);
	timerInterval = setInterval(() => {
		timeLeft = TIME_LIMIT - timePassed;
		document.getElementById("base-timer-label").innerHTML = formatTime(
			timeLeft
		);
		timePassed++;
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
