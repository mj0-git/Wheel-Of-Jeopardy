let socket = io();
let crazyButton = document.getElementById('crazyButton');

startButton.addEventListener('click', () => {
    socket.emit('startGame');
});

crazyButton.addEventListener('click', () => {
    socket.emit('crazyIsClicked', {
        offsetLeft: Math.random() * ((window.innerWidth - crazyButton.clientWidth) - 100),
        offsetTop: Math.random() * ((window.innerHeight - crazyButton.clientHeight) - 50)
    });
})

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
