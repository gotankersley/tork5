var PLAYER_HUMAN = 0;
var PLAYER_RANDOM = 1;
var PLAYER_SIM = 2;
var PLAYER_MCTS = 3;
var PLAYERS = ['Human', 'Random', 'Sim', 'MCTS'];

//Class Player
function Player(currentGame, board, player1Type, player2Type) {
	this.game = currentGame;
    this.board = board;
    this.player1 = this.create(player1Type);
    this.player2 = this.create(player2Type);	
    
    this.player1Type = player1Type;
    this.player2Type = player2Type;    
}

Player.prototype.set = function(playerNum, playerType) {
    if (playerNum == PLAYER1) this.player1 = this.create(playerType);
    else this.player2 = this.create(playerType);
}

Player.prototype.create = function(playerType) {
    switch (playerType) {
        case PLAYER_HUMAN: return null;
        case PLAYER_RANDOM: return new Random(this.board);
		case PLAYER_SIM: return new Sim(this.board);
        case PLAYER_MCTS: return new MCTS(this.board);
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
    var player = this.get();
	if (player != null && game.mode != MODE_WIN) {		
		var move = player.getMove();

		//Make sure move validity		
		if (this.board.isOpen(move.pos)) {	
			this.game.cursorR = ROW[move.pos];
			this.game.cursorC = COL[move.pos];
			setTimeout(function() { //Delay before placing pin
				this.game.onPlacePin(ROW[move.pos], COL[move.pos], false);					
				setTimeout(function () { //Delay before showing rotation arrow indicator
					if (game.mode != MODE_WIN) {
						this.game.arrow = rotToArrow(move.quad, move.rot);
						setTimeout(function() { //Delay before rotating quad
							this.game.onRotateStart(move.quad, move.rot, false);
						}, SETTING_AI_ROTATE_DELAY/2);
					}
				}, SETTING_AI_ROTATE_DELAY/2);
			}, SETTING_AI_PLACE_DELAY);
		}
		else {
			console.log(move.pos);
			if (this.board.isOpen(move.pos)) {
				alert('not open: ' + move.pos);
			}
			this.game.onInvalidMove(move);
		}
		
	}
}

//End class Player