class Game{
    constructor(gameId){
        this.gid = gameId;
        this.players = [];
        this.length = 0;
        this.remaining = 0;
        this.current_idx = null;
    }
    getPlayers(){
        return this.players;
    }

    addPlayer(player){
        this.players.push(player);
    }

    setGameLength(length){
        this.length = length;
        this.remaining = length;
    }

    startGame(){
        this.current_idx = 0;
    }

    //update current player and num questions
    nextTurn(){
        if (current_idx == (this.players.length - 1)){
            current_idx = 0;
        } else {
            current_idx += 1;
        }
        remaining -= 1;
    }

    getCurrentPlayer(){
        return players[this.current_idx];
    }
    getGameId(){
        return this.gid;
    }
}

module.exports = Game;
