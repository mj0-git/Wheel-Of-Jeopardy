class Game{
    constructor(gameId){
        this.gid = gameId;
        this.players = [];
        this.length = 0;
        this.remaining = 0;
        this.current_idx = null;
    	this.question_point_choice = null;
		this.isDone = false;
	}
	setIsDone(val){
		this.isDone = val;
	}
	
	getIsDone(){
		return this.isDone;
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


    getCurrentPlayer(){
        return this.players[this.current_idx];
    }

    setCurrentPlayer(index) {
        this.current_idx = index;
    }

    getGameId(){
        return this.gid;
    }
	setQuestionPointChoice(choice){
		
		this.question_point_choice = 0
		
	}
	getQuestionPointChoice(){
		return this.question_point_choice;
	}
}

module.exports = Game;
