var PLAYER_HUMAN = 0;
var PLAYER_RANDOM = 1;

//Class Player
function Player(board, player1Type, player2Type) {
    this.board = board;
    this.player1 = this.create(player1Type);
    this.player2 = this.create(player2Type);
    
    this.player1Type = player1Type;
    this.player2Type = player2Type;    
}

Player.prototype.create = function(playerType) {
    switch (playerType) {
        case PLAYER_HUMAN: return null;
        case PLAYER_RANDOM: return new Random(this.board);
    }    
    return null;
}

Player.prototype.getType = function() {
    if (this.board.turn == PLAYER1) return this.player1Type;
    else return this.player2Type;
}

Player.prototype.get = function() {
    if (this.board.turn == PLAYER1) return this.player1;
    else return this.player2;
}

Player.prototype.play = function() {
   
}

//End class Player