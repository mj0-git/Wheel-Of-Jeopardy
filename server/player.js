class Player {

    constructor(sid, s) {
        this.socket = s
        this.sid = sid;
        this.name = null;
        this.game_id = null;
        this.is_waiting = true;
        this.is_host = false;
        this.score = 0;
    }
    setHost(){
        this.is_host=true;
    }

    getSocket(){
        return this.socket;

    }

    increaseScore(points){
        this.score += points;
    }

    decreaseScore(points){
        this.score -= points;
    }

    setName(name){
        this.name = name;
        console.log("MY NAME IS" + name);
    }

    setWaiting(value){
        this.is_waiting = value;
    }

    setGameId(gid){
        this.game_id = gid;
    }

    getName(){
        if (this.name == null){
            return "anonymous"
        } else {
            return this.name
        }
    }
    getGameId(){
        return this.game_id;
    }

    getSid(){
        return this.sid;
    }

    getScore(){
        return this.score;
    }

    getIsWaiting(){
        return this.is_waiting;
    }

    getData(){
        return {"name": this.name, "score":this.score}
    }
}

module.exports = Player;
