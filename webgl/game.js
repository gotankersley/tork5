//Modes
var MODE_PLACE = 0;
var MODE_ROTATE = 1;
var MODE_ANIM = 2;
var MODE_WAIT = 3;
var MODE_WIN = 4;


//Partial class Game - Note that there are methods defined in other files (e.g. game-events.js)
function Game() {
	this.board = new Board();    
	this.mode = MODE_PLACE;
	this.player = new Player(this, this.board, PLAYER_HUMAN, PLAYER_HUMAN);
    this.gameState;
    this.message = 'Player1 - place marble';
    this.winLines = null;
	this.scene = new Scene();
	
    this.cursor = new Pos(0,0);
    this.arrow = INVALID;
	this.quad = INVALID;
	this.quadRotDegrees = 0;
	this.quadRotDir = 0;        
             
}
//End class Game