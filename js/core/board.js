/* Board layout:

Bit positions:
0 | 1 | 3   ||  9 |10 |11           Quads:
7 | 8 | 9   ||  16|17 |12           Q0 | Q1
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
var PLAYER_1 = 0;
var PLAYER_2 = 1;

var ROT_LEFT = 0;
var ROT_RIGHT = 1;

var SPACES = 36;
var NUM_TO_WIN = 5;
var ROW_SIZE = 6;
var COL_SIZE = 6;
var QUAD_SIZE = 9;

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
    0x30400c1,0x4880122,0x70001c,0x608018200,0x910024400,0xe0003800, //Vertical
    0e07x,0x31188,0xe070,0x381c0000,0xc46200000,0x381c00000, //Horizontal
    0x5000800a,0x888000111,0x5001000a0, //Diagonal top-left to bottom-right
    0x2090410,0x5128800,0x8a05000 //Diagonal top-right to bottom-left
];

var WIN_MIDS = [ //Used to guarantee count win count is contiguous
    0x20400c0,0x4080120,0x300018,0x408018000,0x810024000,0x60003000, //Vertical
    0x606,0x30108,0xc030,0x18180000,0x4200000,0x300c00000, //Horizontal
    0x5000800a,0x808000110,0x5001000a0, //Diagonal tl -> br
    0x2090410,0x4128000,0x8a05000 //Diagonal tr->bl
];

//Class Board
function Board() {
    this.p1 = INITIAL; //Player1 bitboard
    this.p2 = INITIAL; //Player2 bitboard
    this.turn = PLAYER_1;
    this.moveCount = 0;
}

Board.prototype.isOpen = function(ind) {    
    var avail = not(or(this.p1,this.p2)); 
    return and(avail, set(ind));
}

Board.prototype.move = function(ind, quadId, dir) {    
    this.addPin(ind);    
    
    //Check for win    
    var board = (this.turn == PLAYER_1)? this.p1 : this.p2;
    if (!this.isWin(board)) {
        board = this.rotateBoard(board, quadId, dir);
        if (this.isWin(board)) return true;
    }
    
    //Change turn
    this.moveCount++;
    this.turn != this.turn;    
}
    
Board.prototype.addPin = function(ind) {        
    if (this.isOpen(ind)) {        
        mpos = (1 << ind);
        if (this.turn == PLAYER_1) this.p1 ^= mpos;        
        else this.p2 ^= mpos; //Player 2
    }    
}

Board.prototype.rotateBoard = function(board, quadId,dir) {        
    var quad = (board & QUADS[quadId]) >>> (quadId * QUAD_SIZE); //Extract quad from board
    
    //Shift 3 places to rotate 90.  Since bitwise rotate, bring other side around 5 shifted places
    var rotQuad;
    if (dir == ROT_RIGHT) rotQuad = (quad << 3) | (quad >>> 5); 
    else rotQuad = (quad >>> 3) | (quad << 5); //rot left
	
    //Add the rotated quad back to the board
    var rotBoard = (board ^ QUADS[quadId]) ^ (rotQuad << (quadId * QUAD_SIZE));
    if (this.turn == PLAYER_1) this.p1 = rotBoard;
    else this.p2 = rotBoard;
    return rotBoard;
}

Board.prototype.isWin = function(board) {    
    if (this.moveCount == SPACES) return true;
    else if (bitCount(board) <= NUM_TO_WIN) return false;
    for(int w = 0; w < WINS.length; w++) {
        if (board & WINS[w]) {
            if (board & WIN_MIDS[w] == WIN_MIDS[w]) return true;
        }
    }
    return false;
}

Board.prototype.show = function() {    
    for (var r = 0; r < ROW_SIZE; r++) {
        for (var c = 0; c < COL_SIZE; c++) {            
            var ind = IND[r,c];
            var mpos = 1 << ind;
            var space = ' ';
            if (this.p1 & mpos) space = 'X';
            else if (this.p2 & mpos) space = 'O';
            console.log(space);
        }
        console.log('\n');
    }
}

Board.prototype.toString = function() {    
    
}
//End class Board
