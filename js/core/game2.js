//Modes
var MODE_PLACE = 0;
var MODE_ROTATE = 1;
var MODE_ANIM = 2;
var MODE_WAIT = 3;
var MODE_WIN = 4;


//Class Game
function Game() {
	this.board = new Board();    
	this.mode = MODE_PLACE;
	this.player = new Player(this, this.board, PLAYER_HUMAN, PLAYER_HUMAN);
    this.gameState;
    this.message = 'Player1 - place marble';
    this.winLines = null;
	
    //this.cursorR = 0;
    //this.cursorC = 0;
    this.arrow = INVALID;
	this.quad = INVALID;
	this.quadRotDegrees = 0;
	this.quadRotDir = 0;    
    this.rotateMode = false;
             
}


//Game events
Game.prototype.onPlacePin = function(r, c, placeMode) {    
    var board = this.board;
    //Set returns false if space is not open	
    if (board.set(r,c)) {
		this.gameState = board.isWin();
        if (this.gameState == IN_PLAY) {
            this.message = 'Player' + (this.board.turn + 1) + ' - turn quad';
            if (!placeMode) this.mode = MODE_ROTATE;
        }
        else this.onGameOver();    
    }
	else this.message = 'Unable to play there';
}

Game.prototype.onRotateStart = function(quad, rot, rotateMode) {       
    //Don't actually rotate the bitboard until rotateEnd so we can draw the animation
	this.quad = quad;
	this.quadRotDegrees = 0;
	this.quadRotDir = (rot == ROT_CLOCKWISE)? 1 : -1;
	this.rotateMode = rotateMode;	
    if (SETTING_ROT_ANIM) this.mode = MODE_ANIM;
    else this.onRotateEnd();
}

Game.prototype.onRotating = function() {
    if (Math.abs(this.quadRotDegrees) >= 90) this.onRotateEnd();
    else this.quadRotDegrees += (this.quadRotDir * SETTING_ROT_SPEED); 
}

Game.prototype.onRotateEnd = function() {   
    var rot = (this.quadRotDir == 1)? ROT_CLOCKWISE : ROT_ANTICLOCKWISE;
    this.board.rotate(this.quad, rot); //this changes the turn  	
	this.onTurnChanged(false);
	this.onMoveOver();
}

Game.prototype.onTurnChanged = function(changeTurn) {
	//Force the turn change
	if (changeTurn) this.board.turn = !this.board.turn;
	
	this.messageColor = (this.board.turn == PLAYER1)? COLOR_P1 : COLOR_P2;	
	this.message = 'Player' + (this.board.turn + 1) + ' - place marble';	
}

Game.prototype.onMoveOver = function() {			
	var gameState = this.board.isWin();
    if (gameState == IN_PLAY) {
		if (SETTING_FIND_WINS) this.showFindWins();	
        this.quadRotDegrees = 0;
        this.quad = INVALID;
        this.arrow = INVALID;	
        this.cursorR = 0;
        this.cursorC = 0;	                        
		if (!this.rotateMode) {
			this.mode = (this.player.getType() == PLAYER_HUMAN)?  MODE_PLACE : MODE_WAIT;
			this.player.play();			
		}
    }
    else this.onGameOver(gameState);
}

Game.prototype.onGameOver = function(gameState) {    
    //Convert win lines from row/col to x/y    
    var winRCs = this.board.getWinLines(); 
    this.winLines = [[],[]];
    for (var side in winRCs) {
        for (var i in winRCs[side]) {
            var line = winRCs[side][i];
            var x1 = toXY(line[1]) + HALF_UNIT;
            var y1 = toXY(line[0]) + HALF_UNIT;
            var x2 = toXY(line[3]) + HALF_UNIT;
            var y2 = toXY(line[2]) + HALF_UNIT;
            this.winLines[side].push([x1, y1, x2, y2]);
        }
    }    
    
    if (this.gameState == WIN_TIE || gameState == WIN_DUAL) {        
        this.message = 'TIE GAME!';		
    }
    else {        
        if (this.gameState == WIN_PLAYER1) { //Player 1            
            this.message = 'Player1 WINS!';            
        }
        else { //Player 2
            this.winColor = COLOR_P2_WIN;
            this.messageColor = COLOR_P2;
            this.message = 'Player2 WINS!';            
        }                       
        if (winRCs[PLAYER1].length > 1 || winRCs[PLAYER2].length > 1) this.message += ' Multi-win!';
    }
           
    this.mode = MODE_WIN;
}

Game.prototype.onInvalidMove = function(move) {
	alert('invalid move');
	this.board.printMove(move);
}

//End class Game


function arrowToRot(quad, arrow) {
   //Get rot dir
	if (quad % 3 == 0) { //Quads 0, and 3
		if (arrow >= BOARD_QUADS) return ROT_ANTICLOCKWISE;
		else return ROT_CLOCKWISE;
	}
	else { //Quads 1, and 2
		if (arrow >= BOARD_QUADS) return ROT_CLOCKWISE;
		else return ROT_ANTICLOCKWISE;
	}  
}

function rotToArrow(quad, rot) {
	if (quad % 3 == 0) { //Quads 0, and 3
		if (rot == ROT_ANTICLOCKWISE) return BOARD_QUADS + quad;
		else return quad;
	}
	else { //Quads 1, and 2
		if (rot == ROT_CLOCKWISE) return BOARD_QUADS + quad;
		else return quad;
	}  
}