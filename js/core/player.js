//Class Player
function Player(currentGame, board, player1Type, player2Type) {
	this.game = currentGame;        
	this.board = board;
	
    this.player1 = player1Type;
    this.player2 = player2Type;  
	this.startTime = 0;
	this.move = null;
}

Player.prototype.set = function(playerNum, playerType) {
    if (playerNum == PLAYER1) this.player1 = playerType;
    else this.player2 = playerType;
}


Player.prototype.getType = function() {
    if (this.game.board.turn == PLAYER1) return this.player1;
    else return this.player2;
}

Player.prototype.create = function(playerType) {
    switch (playerType) {
        case PLAYER_HUMAN: return null;
        case PLAYER_RANDOM: return new Random(this.board);
		case PLAYER_SIM: return new Sim(this.board);
        case PLAYER_MCTS: return new MCTS(this.board);
		case PLAYER_CPP: return new CPP(this.board);
		case PLAYER_ALPHA_BETA: return new AlphaBeta(this.board);
		case PLAYER_MC: return new MC(this.board);
    }    
    return null;
}


Player.prototype.play = function() {
    var playerType = this.getType();	
	if (playerType != PLAYER_HUMAN && this.game.mode != MODE_WIN) {
		this.startTime = performance.now();		
		var board = this.board;
		if (SETTING_PLAYER_WORKER) { //Web-worker
			var worker = new Worker('js/core/player-worker.js');
			worker.onmessage = function(e) {
				game.player.onPlayed(e.data);
			}
			var data = {p1:board.p1, p2:board.p2, turn:board.turn, type:playerType};			
			worker.postMessage(data); 
		}
		else { //Regular synchronous		
			var player = this.create(playerType);
			this.move = player.getMove(board);
			if (!SETTING_SHOW_SCORE_MAP) this.onPlayed();
			else if (!scoreEnabled) this.onPlayed();
		}
	}
	
}


Player.prototype.onPlayed = function() {	
	var move = this.move;
	var elapsedTime = performance.now() - this.startTime;
	var placeDelay = Math.max(0, SETTING_AI_PLACE_DELAY - elapsedTime);
	console.log('Time: ' + (elapsedTime/1000) + ' seconds')
	//Make sure move is valid		
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
		}, placeDelay);
	}
	else this.game.onInvalidMove(move);	
}
//End class Player

//Score map
var scoreEnabled = false;
var scoreMap;
var scoreBestR;
var scoreBestC;
var scoreBestArrow;
function initScoreMap() {
    //Init score map
    scoreMap = [];
	for (var r = 0; r < ROW_SPACES; r++) {
		scoreMap.push([]);
		for (var c = 0; c < COL_SPACES; c++) {
			scoreMap[r].push([]);
		}
	}	
}

function enableScoreMap(move, total) {
	scoreBestR = ROW[move.pos];
	scoreBestC = COL[move.pos];
	scoreBestArrow = rotToArrow(move.quad, move.rot);
	game.message = 'Total: ' + total;
	scoreEnabled = true;
}