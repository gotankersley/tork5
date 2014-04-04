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
    //Tie game (and dual win)
    if (this.gameState == WIN_TIE || this.gameState == WIN_DUAL) this.message = 'TIE GAME!';		       
    else {        
        //Player 1
        if (this.gameState == WIN_PLAYER1) this.message = 'Player1 WINS!';                     
        //Player 2            
        else this.message = 'Player2 WINS!';                              
        //if (winRCs[PLAYER1].length > 1 || winRCs[PLAYER2].length > 1) this.message += ' Multi-win!';
    }
           		   
    this.mode = MODE_WIN;
	this.stage.showWinLines(this.board.getWinLines());
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