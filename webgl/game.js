//Modes
var MODE_PLACE = 0;
var MODE_ROTATE = 1;
var MODE_ANIM = 2;
var MODE_WAIT = 3;
var MODE_WIN = 4;


//Class Game
function Game(stage) {
	this.board = new Board();    
	this.mode = MODE_PLACE;
    this.modeLock = false; //Used to lock mode for multiple pin places, or rotations
	this.player = new Player(this, this.board, PLAYER_HUMAN, PLAYER_HUMAN);
    this.gameState;
    this.message = 'Player1 - place marble';
    this.winLines = null;
	this.stage = stage; //Graphical display
	
	//Cursor variables
    this.cursorPos = new Pos(0,0);
    this.cursorOct = INVALID;
	this.cursorQuad = INVALID;	
	this.cursorRot = INVALID;        
}

Game.prototype.onPlaceStart = function(keepPlacing) {
	this.modeLock = keepPlacing;
    //Board set returns false if space is not open	
    if (this.board.set(this.cursorPos.r, this.cursorPos.c)) {
		this.stage.placePin(this.cursorPos, this.cursorQuad, this.board.turn, this.onPlaceEnd);		
    }
	else this.message = 'Unable to play there';
}

Game.prototype.onPlaceEnd = function() {	
	this.gameState = this.board.isWin();
	if (this.gameState == IN_PLAY) {
		this.message = 'Player' + (this.board.turn + 1) + ' - turn quad';
		if (!this.modeLock) this.changeMode(MODE_ROTATE);		
	}
	else this.onGameOver();    
}

Game.prototype.onRotateStart = function(keepRotating) {     
    //Don't actually rotate the bitboard until rotateEnd
    this.modeLock = keepRotating;  
	this.mode = MODE_ANIM;
    this.stage.rotateQuad(this.cursorQuad, this.cursorRot, this.onRotateEnd); 	
    //if (SETTING_ROT_ANIM) this.mode = MODE_ANIM;
    //else this.onRotateEnd();
}


Game.prototype.onRotateEnd = function() {       	
    this.board.rotate(this.cursorQuad, this.cursorRot); //this changes board's turn  	
	if (!this.modeLock) this.onMoveOver();
}

Game.prototype.onMoveOver = function() {	
	this.gameState = this.board.isWin();
    if (this.gameState == IN_PLAY) {

		//Change turn
		this.message = 'Player' + (this.board.turn + 1) + ' - place marble';	
		
		//if (SETTING_FIND_WINS) this.showFindWins();	        
		//Reset cursor
		this.resetCursor();
		this.changeMode(MODE_PLACE);	
                       		
		//this.mode = (this.player.getType() == PLAYER_HUMAN)?  MODE_PLACE : MODE_WAIT;
		//this.player.play();					
    }
    else this.onGameOver();
}

Game.prototype.onGameOver = function() {    
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
    
    //Tie game (and dual win)
    if (this.gameState == WIN_TIE || gameState == WIN_DUAL) this.message = 'TIE GAME!';		       
    else {        
        //Player 1
        if (this.gameState == WIN_PLAYER1) this.message = 'Player1 WINS!';                     
        //Player 2            
        else this.message = 'Player2 WINS!';                              
        if (winRCs[PLAYER1].length > 1 || winRCs[PLAYER2].length > 1) this.message += ' Multi-win!';
    }
           
    this.mode = MODE_WIN;
}

Game.prototype.onInvalidMove = function(move) {
	alert('invalid move');
	this.board.printMove(move);
}

Game.prototype.changeMode = function(mode) {
	this.mode = mode;
	this.stage.onModeChanged(mode);		
}

//Helper
Game.prototype.resetCursor = function() {
	this.cursorOct = INVALID;
	this.cursorQuad = INVALID;
	this.cursorRot = INVALID;
	this.cursorPos = new Pos(0, 0);
}
//End class Game