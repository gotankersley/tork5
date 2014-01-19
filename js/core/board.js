/* Board layout:

Bit positions:
0 | 1 | 2   ||  9 |10 |11           Quads:
7 | 8 | 3   ||  16|17 |12           Q0 | Q1
6 | 5 | 4   ||  15|14 |13           --------
_________________________           Q2 | Q3
-------------------------
18|19 |20   ||  27|28 |29
25|26 |21   ||  34|35 |30
24|23 |22   ||  33|32 |31
Note that the bits are arranged like this to rotate the quads with bitwise rotations
*/

/* Terminology:
Board: The entire 6x6 playing board with 36 spaces
Quad: One of the 3x3 sub-boards
Units: [start range - end range]
- x,y: screen coordinates measured in pixels.  [0 ~ 1024px]
- row,col: used with 2D board array, useful for display  [0 - 6]
- ind: index of bitboard array [0 - 36]
- mpos: a bitboard mask position. i.e mpos = (1 << ind). [0 - 2^36]
Pin: The player's piece
Space: One of 36 spaces a player can place a pin 
*/

//Constants
var BOARD_SPACES = 36;
var BOARD_QUADS = 4;
var NUM_TO_WIN = 5;
var ROW_SPACES = 6;
var COL_SPACES = 6;
var QUAD_SPACES = 9;
var QUAD_COUNT = 2;
var QUAD_ROW_SPACES = 3;
var QUAD_COL_SPACES = 3;

//Enums
var PLAYER1 = 0;
var PLAYER2 = 1;
var EMPTY = -1;

var ROT_ANTICLOCKWISE = -1;
var ROT_CLOCKWISE = 1;

var IN_PLAY = 0;
var WIN_PLAYER1 = 1;
var WIN_PLAYER2 = 2;
var WIN_TIE = 3;


//Index maps
var ROW = [0,0,0,1,2,2,2,1,1,0,0,0,1,2,2,2,1,1,3,3,3,4,5,5,5,4,4,3,3,3,4,5,5,5,4,4];
var COL = [0,1,2,2,2,1,0,0,1,3,4,5,5,5,4,3,3,4,0,1,2,2,2,1,0,0,1,3,4,5,5,5,4,3,3,4];
var IND = [
    [0,1,2,9,10,11],        //Row 0
    [7,8,3,16,17,12],       //Row 1
    [6,5,4,15,14,13],       //Row 2
    [18,19,20,27,28,29],    //Row 3
    [25,26,21,34,35,30],    //Row 4
    [24,23,22,33,32,31],    //Row 5
];

//Masks
var FULL = 0xfffffffff;
var INITIAL = 0x0;
var QUADS = [0xff,0x1fe00,0x3fc0000,0x7f8000000]; //Doesn't include centers

var WINS = [
	0x607, 0xe06, 0x30188, 0x31108, 0xc070, 0xe030, 0x181c0000, 0x38180000, 0xc06200000, 0xc44200000, 0x301c00000, 0x380c00000, //Horizontal
    0x20400c1, 0x30400c0, 0x4080122, 0x4880120, 0x30001c, 0x700018, 0x408018200, 0x608018000, 0x810024400, 0x910024000, 0x60003800, 0xe0003000, //Vertical    
    0x5000800a, 0x808000111, 0x888000110, 0x5001000a0, //Diagonal top-left to bottom-right
    0x2090410, 0x4128800, 0x5128000, 0x8a05000 //Diagonal top-right to bottom-left
];


//Class Board
function Board() {
    this.p1 = INITIAL; //Player1 bitboard
    this.p2 = INITIAL; //Player2 bitboard
    this.turn = PLAYER1;
    this.moveCount = 0;
    this.winLine = [0,0,0,0];
}

Board.prototype.isOpen = function(ind) {    
    var avail = not(or(this.p1,this.p2)); 
    return and(avail, mpos(ind));
}
/*
Board.prototype.move = function(ind, quadId, dir) {    
    this.addPin(ind);    
    
    //Check for win    
    var board = (this.turn == PLAYER1)? this.p1 : this.p2;
    if (!this.isWin(board)) {
        board = this.rotateBoard(board, quadId, dir);
        if (this.isWin(board)) return true;
    }
    
    //Change turn
    this.moveCount++;
    this.turn != this.turn;    
}
*/
    
Board.prototype.set = function(row,col) {        
	var ind = IND[row][col];	
    if (this.isOpen(ind)) {                
        if (this.turn == PLAYER1) this.p1 = xor(this.p1,mpos(ind));        
        else this.p2 = xor(this.p2, mpos(ind)); //Player 2		
		return true;
    }
	else return false;
}

Board.prototype.get = function(row, col) {
	var ind = IND[row][col];
	var mp = mpos(ind);
	if (and(this.p1,mp)) return PLAYER1;	
	else if (and(this.p2,mp)) return PLAYER2;
	else return EMPTY;
}

Board.prototype.rotate = function(quadInd, dir) {
	this.p1 = this.rotateBoard(this.p1, quadInd, dir);
	this.p2 = this.rotateBoard(this.p2, quadInd, dir);
	this.moveCount++;
	this.turn = !this.turn;    
}
Board.prototype.rotateBoard = function(board, quadId, dir) {      
	//Rot can be simplified - in situ
	//Extract quad from board  
	var quadUnshifted = (and(board, QUADS[quadId]));
    var quad = shiftR(quadUnshifted, quadId * QUAD_SPACES); 
    
    //Bitwise rotate, 3 places will rotate 90 degrees - note bitwise rot is opposite direction of visual
    var rotQuad = (dir == ROT_CLOCKWISE)? rotL(quad,QUAD_COUNT) : rotR(quad,QUAD_COUNT);    
	
    //Add the rotated quad back to the board
	var quadShifted = shiftL(rotQuad, quadId * QUAD_SPACES);
	board = and(board, not(QUADS[quadId])); //Empty quad    
	var rotBoard = xor(board, quadShifted);
    return rotBoard;    
}

Board.prototype.isWin = function() {    
    if (this.moveCount >= BOARD_SPACES) return WIN_TIE;
    //else if (this.moveCount <= (2 * NUM_TO_WIN) - 1) return IN_PLAY;
	
    for(var w = 0; w < WINS.length; w++) {
		var win = WINS[w];				
        if (and(this.p1, win) == win) {
            this.winLine = this.getWinLine(win);
            return WIN_PLAYER1;
        }
		else if (and(this.p2, win) == win) {
            this.winLine = this.getWinLine(win);
            return WIN_PLAYER2;        
        }
    }
    return IN_PLAY;
}

Board.prototype.getWinLine = function(win) {       
    var minR = ROW_SPACES - 1;
    var minC = COL_SPACES - 1;
    var maxR = 0;
    var maxC = 0;
    var r, c;
    //Get min, and max points to figure out line dimensions
    for (var ind = 0; ind < BOARD_SPACES; ind++) {        
        var mp = mpos(ind);
        if (and(win,mp)) {
            r = ROW[ind];
            c = COL[ind];
            if (r < minR || (r == minR && c < minC)) {
                minR = r;
                minC = c;
            }
            if (r > maxR || (r == maxR && c > maxC)) {
                maxR = r;
                maxC = c;
            }
        }        
    }
    return [minR, minC, maxR, maxC];
}

Board.prototype.show = function() {    
    for (var r = 0; r < ROW_SPACES; r++) {
        for (var c = 0; c < COL_SPACES; c++) {            
            var ind = IND[r][c];            
            var space = ' ';
            if (and(this.p1, mpos(ind))) space = 'X';
            else if (and(this.p2, mpos(ind))) space = 'O';
            console.log(space);
        }
        console.log('\n');
    }
}

//End class Board