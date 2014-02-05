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
var ALL_ROTATIONS = 8;

//Enums
var PLAYER1 = 0;
var PLAYER2 = 1;
var EMPTY = -1;

var ROT_CLOCKWISE = 0;
var ROT_ANTICLOCKWISE = 1;

var IN_PLAY = 0;
var WIN_PLAYER1 = 1;
var WIN_PLAYER2 = 2;
var WIN_TIE = 3;
var WIN_DUAL = 4;


//Index maps
var ROW = [0,0,0,1,2,2,2,1,1,0,0,0,1,2,2,2,1,1,3,3,3,4,5,5,5,4,4,3,3,3,4,5,5,5,4,4];
var COL = [0,1,2,2,2,1,0,0,1,3,4,5,5,5,4,3,3,4,0,1,2,2,2,1,0,0,1,3,4,5,5,5,4,3,3,4];
var IND = [
    [0,1,2,9,10,11],        //Row 0
    [7,8,3,16,17,12],       //Row 1
    [6,5,4,15,14,13],       //Row 2
    [18,19,20,27,28,29],    //Row 3
    [25,26,21,34,35,30],    //Row 4
    [24,23,22,33,32,31]    //Row 5
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
    //this.winLine = [0,0,0,0];
}

Board.prototype.isOpen = function(ind) {    
    var avail = not(or(this.p1,this.p2)); 
    return and(avail, IND_TO_MPOS[ind]);
}


Board.prototype.set = function(row, col) {   
    var ind = IND[row][col];	    
    return this.setPin(ind);
}
Board.prototype.setPin = function(ind) {        	
    if (this.isOpen(ind)) {                
        if (this.turn == PLAYER1) this.p1 = xor(this.p1, IND_TO_MPOS[ind]);        
        else this.p2 = xor(this.p2, IND_TO_MPOS[ind]); //Player 2				
		return true;
    }
	else return false;
}

Board.prototype.get = function(row, col) {
    var ind = IND[row][col];
    return this.getPin(ind);
}
Board.prototype.getPin = function(ind) {	
	var mpos = IND_TO_MPOS[ind];
	if (and(this.p1,mpos)) return PLAYER1;	
	else if (and(this.p2,mpos)) return PLAYER2;
	else return EMPTY;
}

Board.prototype.getOpen = function() {
    var open = [];
    var avail = not(or(this.p1,this.p2));
	var availBits = bitScan(avail);
	for (var i in availBits) {		
		open.push(availBits[i]);        
    }
    return open;
}

Board.prototype.rotate = function(quadInd, dir) {
	this.p1 = this.rotateQuad(this.p1, quadInd, dir);
	this.p2 = this.rotateQuad(this.p2, quadInd, dir);	
	this.turn = !this.turn;    
}
Board.prototype.rotateQuad = function(board, quadId, dir) {      
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
	var moveCount = bitCount(or(this.p1, this.p2));
    if (moveCount >= BOARD_SPACES) return WIN_TIE;
    else if (moveCount < NUM_TO_WIN) return IN_PLAY;
	
    var p1Win = false;
    var p2Win = false;
    for (var i in MID_WINS) {
        var mid = MID_WINS[i];
        if (and(this.p1, mid) == mid && and(this.p1, SPAN_WINS[i])) p1Win = true;
        else if (and(this.p2, mid) == mid && and(this.p2, SPAN_WINS[i])) p2Win = true;
    }
    if (p1Win && p2Win) return WIN_DUAL;
    else if (p1Win) return WIN_PLAYER1;
    else if (p2Win) return WIN_PLAYER2;
    else return IN_PLAY;    
}

Board.prototype.getWinLines = function(win) {
    var lines = [[],[]];
    for (var i in MID_WINS) {
        var mid = MID_WINS[i];        
        if (and(this.p1, mid) == mid && and(this.p1, SPAN_WINS[i])) {
            var boardSpan = and(this.p1, SPAN_WINS[i]);            
            lines[PLAYER1].push(this.getWinLine(or(mid, boardSpan)));
        }
        else if (and(this.p2, mid) == mid && and(this.p2, SPAN_WINS[i])) {
            var boardSpan = and(this.p2, SPAN_WINS[i]);            
            lines[PLAYER2].push(this.getWinLine(or(mid, boardSpan)));
        }
    }
    return lines;
}

Board.prototype.getWinLine = function(win) {       
    var minR = ROW_SPACES - 1;
    var minC = COL_SPACES - 1;
    var maxR = 0;
    var maxC = 0;
    var r, c;
    //Get min, and max points to figure out line dimensions
	var winBits = bitScan(win);
	for (var i in winBits) {
		var ind = winBits[i];    
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
    return [minR, minC, maxR, maxC];
}

// Board.prototype.randomize = function() {   
	// var pinsToAdd = Math.random() * (BOARD_SPACES - 2);
	// for (var i = 0; i < pinsToAdd; i++) {		
		// this.setPin(Math.random(i) * BOARD_SPACES);
		// this.rotate(Math.random() * BOARD_QUADS, (Math.random() * 2) - 1);
	// }
// }

Board.prototype.makeRandomMove = function() { 
    var avail = not(or(this.p1, this.p2));
    var availBits = bitScan(avail);
    var randInd = availBits[Math.floor(Math.random() * availBits.length)];
    if (this.turn == PLAYER1) this.p1 = xor(this.p1, IND_TO_MPOS[randInd]);
    else this.p2 = xor(this.p2, IND_TO_MPOS[randInd]);
    
    var randQuad = Math.floor(Math.random() * BOARD_QUADS);
    var randDir = Math.floor(Math.random() * 2);
    this.rotate(randQuad, randDir);
	//this.printMove({ind:randInd, quad:randQuad, dir:randDir});
}

Board.prototype.getAllNonLossMoves = function() { 
    var board;
    var opp;
    var moves = {};
    if (this.turn == PLAYER1) {
        board = this.p1;
        opp = this.p2;
    }
    else {
        board = this.p2;
        opp = this.p1;
    }
    
    var oppWins = this.findOppRotateWins(opp);
    var avail = not(or(board,opp));
    var availBits = bitScan(avail);
    for (var a in availBits) {
        for (var i = 0; i < ALL_ROTATIONS; i++) {
            if (oppWins[i]) continue;
            var q = Math.floor(i/2);
            var d = i%2;
            var newBoard = this.clone();
            if (newBoard.turn == PLAYER1) newBoard.p1 = xor(newBoard.p1, IND_TO_MPOS[availBits[a]]); 
			else newBoard.p2 = xor(newBoard.p2, IND_TO_MPOS[availBits[a]]); 
            newBoard.rotate(q, d);
            moves[String(newBoard.p1) + '_' + String(newBoard.p2)] = newBoard;
        }
    }
    return moves;
}

Board.prototype.findOppRotateWins = function(opp) {
	//Rotate quads to see if rotation yield a win, if so any avail move can be chosen 
    var wins = [0,0,0,0,0,0,0,0];
	for (var i in QUAD_MID_WINS) {
		var mid = QUAD_MID_WINS[i];
        if (and(opp, mid) == mid) {            
            var q = Math.floor(i / 20);
            var d = !(Math.floor(i / 10) % 2);
            wins[(d * BOARD_QUADS) + q] = true;
        }
    }
	return wins;
}

Board.prototype.findWin = function() {
	//Check if there are enough pins on the board for a win   
	var board = (this.turn == PLAYER1)? this.p1 : this.p2;
	var count = bitCount(board);
	if (count < 4) return false;     
	
	var avail = not(or(this.p1, this.p2));
	if (!avail) return false; 
		
	for (var i in LONG_MID_WINS) {
		var mid = LONG_MID_WINS[i];
        var combinedMid = and(board, mid);
        if (combinedMid == mid) { //4 in a row, need one available, or 5+ in a row that just needs to be turned
            if (and(avail, LONG_SPAN_WINS[i]) || and(board, LONG_SPAN_WINS[i])) return Number(i) + 1;
        }
        else if (bitCount(combinedMid) == 3) { //3 out of 4 in mid, need 1 of the spans, and one availble 
            if (and(board, LONG_SPAN_WINS[i]) && and(avail, mid)) return Number(i) + 1;  
        }        
    }    
    for (var i in SHORT_WINS) {
        var win = SHORT_WINS[i];
        var combined = and(board, win);
        if (combined == win) return Number(i) + 71;  //Win just with rotation
        else if (bitCount(combined) == 4 && and(avail, win)) return Number(i) + 71;
    }
		
	return false;
}

Board.prototype.getMoveFromMidWin = function(i) {
    var board = (this.turn == PLAYER1)? this.p1 : this.p2;
    var avail = not(or(this.p1, this.p2));
    var ind = INVALID;
    var quad = INVALID;
    var dir = INVALID;
    //Short diag win without rotation        
    if (i > 95) ind = MPOS_TO_IND[xor(SHORT_WINS[i - 71], board)];
    
    //Short diagonal win with rotation
    else if (i > 70) { 
        i -= 71;
        quad = Math.floor(i/6);
        dir = !(Math.floor(i/3)%2);
        var win = SHORT_WINS[i];        
        if (and(board, win) == win) {
            var availBits = bitScan(avail);
            ind = availBits[0]; //Any available
        }
        else ind = MPOS_TO_IND[xor(win, board)];               
    }
    //Long wins
    else {
        i--;    
        if (i < 56) { //With rotation
            quad = Math.floor(i/14);            
            dir = !(Math.floor(i/7)%2);
        }    
        var mid = LONG_MID_WINS[i];  
        var span = LONG_SPAN_WINS[i];
        if (and(board, mid) == mid) {   
            var availBits = (and(board,span) == span)? bitScan(and(avail, span)) : bitScan(avail);            
            ind = availBits[0];
        }
        else {
            var availBits = bitScan(and(avail, mid));            
            ind = availBits[0];
        }
                        
    }
    return {ind:ind, quad:quad, dir:dir};
}

/*
Board.prototype.findWin3 = function() {
	//Check if there are enough pins on the board for a win   
	var board = (this.turn == PLAYER1)? this.p1 : this.p2;
	var count = bitCount(board);
	if (count < 4) return false;     
	
	var avail = not(or(this.p1, this.p2));
	if (!avail) return false; 
		
	for (var i in ALL_MID_WINS) {
		var mid = ALL_MID_WINS[i];
        var combinedMid = and(board, mid);
        if (combinedMid == mid) {
            if (and(avail, ALL_SPAN_WINS[i])) {					
				var aBits = bitScan(and(avail, ALL_SPAN_WINS[i]));
				var ind;
				if (aBits.length > 0) ind = aBits[0];
				else {
					aBits = bitScan(avail);
					ind = aBits[0];
				}
				var q = INVALID;
				var d = INVALID;
				if (i < 80) {
					q = Math.floor(i/20);
					d = Math.floor(i/10)%2;
				}
				return {ind:ind, quad:q, dir:d};				
			}
        }
        else if (bitCount(combinedMid) == 3) { 
			var span = ALL_SPAN_WINS[i];
            if (and(board, span) && and(avail, mid)) {				
				var aBits = bitScan(and(avail, mid));
				var ind;
				if (aBits.length > 0) ind = aBits[0];
				else {
					aBits = bitScan(avail);
					ind = aBits[0];
				}
				var q = INVALID;
				var d = INVALID;
				if (i < 80) {
					q = Math.floor(i/20);
					d = Math.floor(i/10)%2;
				}
				return {ind:ind, quad:q, dir:d};							
			}
        }
    }    
		
	return false;
}
*/

Board.prototype.findAllWins = function() {
    //Check if there are enough pins on the board for a win   	    	
	var moveCount = bitCount(or(this.p1,this.p2));
	if (moveCount < 4) return []; 
    else if (moveCount >= BOARD_SPACES) return []; 
	
    var wins = [{},{}];	
    var board;
    var opp;
    
    //Get current player's bitboard, and opponent's bitboard
    if (this.turn == PLAYER1) {
        board = this.p1;
        opp = this.p2;        
    }
    else {
        board = this.p2;
        opp = this.p1;
    }
	var avail = not(or(board, opp)); //All the available empty spaces
    
	//Rotate quads to see if rotation yield a win, if so any avail move can be chosen 	
	var side = Number(this.turn);
	var oppSide = Number(!side);
	for (var i in QUAD_MID_WINS) {
		var mid = QUAD_MID_WINS[i];
		if (and(board, mid) == mid && and(board, QUAD_SPAN_WINS[i])) {            
            var q = Math.floor(i / 20);
            var d = !(Math.floor(i / 10) % 2);
            wins[side]['x_' + q + d] = {ind:INVALID, quad:q, dir:d};
        }
        if (and(opp, mid) == mid && and(opp, QUAD_SPAN_WINS[i])) {            
            var q = Math.floor(i / 20);
            var d = !(Math.floor(i / 10) % 2);
            wins[oppSide]['x_' + q + d] = {ind:INVALID, quad:q, dir:d};
        }
	}    
	
	//Optimization to check contiguous wins for pins, when there are fewer pins than available spaces
	if (bitCount(board) < 12) {	
		//Check all of each player's pins to see if they have a line with 4 pins with an open space for a 5th pin to go		
		for (var ind = 0; ind < BOARD_SPACES; ind++) {        		
			var mpos = IND_TO_MPOS[ind];			
			if (and(board, mpos)) testWinLineFromSpace(side, board, ind, avail, wins); //Wins passed by reference
			if (and(opp, mpos)) testWinLineFromSpace(oppSide, opp, ind, avail, wins); //Wins passed by reference				
		}
	}	//Else just check the available spaces when there are more pins than available
	else {
		for (var ind = 0; ind < BOARD_SPACES; ind++) {        		
			var mpos = IND_TO_MPOS[ind];
			if (and(avail, mpos)) {			
				testWinLineFromSpace(side, board, ind, false, wins); //Wins passed by reference
				testWinLineFromSpace(oppSide, opp, ind, false, wins); //Wins passed by reference	
			}
		}
	}
    return wins;
}


function testWinLineFromSpace(side, board, ind, avail, winsRef) { //Wins passed by reference
	for (var a in AVAIL_WINS[ind]) {
		var win = AVAIL_WINS[ind][a];	
		var boardLine = and(board, win);		
		var count = bitCount(boardLine);
		if (count >= 4) { //4 in a line, but need to make sure 5th space is avail to win							 			
			var fifthMpos = xor(boardLine, win);					
			if (!avail || and(avail, fifthMpos)) {
				var fifthInd = MPOS_TO_IND[fifthMpos];					
				meta = WIN_META[String(win)];
				if (meta == undefined) {
					winsRef[side][fifthInd + '_xx'] = {ind:fifthInd, quad:INVALID, dir:INVALID}; //Win without rotation				
				}
				else {
					var dirAbbrev = (meta[1] == ROT_CLOCKWISE)? 'c' : 'a';
					winsRef[side][fifthInd + '_' + meta[0] + dirAbbrev] = {ind:fifthInd, quad:meta[0], dir:meta[1]}; //Win with specific pin placement and rotation				
				}
			}
		}
	}
}


Board.prototype.deriveMove = function(after) {
	//Derive the move (i.e. pin position and quad rotation) that was made by looking at the difference 
	//between a board state before and after the move was made. 
	
	//Note: there can be multiple moves that result in the same after state (e.g. rotating quad centers), 
	//so this just picks the first one it finds
	var beforeBoard;
    var beforeOpp;
    var afterBoard;
    var afterOpp;
    if (this.turn == PLAYER1) {
        beforeBoard = this.p1;
        beforeOpp = this.p2;
        afterBoard = after.p1;
        afterOpp = after.p2;
    }
    else {
        beforeBoard = this.p2;
        beforeOpp = this.p1;
        afterBoard = after.p2;
        afterOpp = after.p1;    
    }
	var afterCount = bitCount(afterBoard);	
	
	//Try all 8 possible quad rotations to look for one that is only one bit different after rotation
	for (var i = 0; i < ALL_ROTATIONS; i++) {
		var q = Math.floor(i/2);
		var d = i % 2;
		var rotatedBoard = this.rotateQuad(beforeBoard, q, d);
        var rotatedOpp = this.rotateQuad(beforeOpp, q, d);
		var combinedBoard = and(rotatedBoard, afterBoard);		
		if (afterCount - bitCount(combinedBoard) == 1 && (rotatedOpp == afterOpp)) {
			var reverseRotated = this.rotateQuad(afterBoard, q, !d); //Rotate after board in reverse to get position
			var ind = MPOS_TO_IND[xor(beforeBoard, reverseRotated)];
			return {ind:ind, quad:q, dir:d};
		}
	}
	
	//See if there is a move with no rotation (win)
	var combinedBoard = and(beforeBoard, afterBoard);    
	if (afterCount - bitCount(combinedBoard) == 1 && (beforeOpp == afterOpp)) {
		var ind = MPOS_TO_IND[xor(beforeBoard, afterBoard)];
		return {ind:ind, quad:INVALID, dir:INVALID};
	}
	return {ind:INVALID, quad:INVALID, dir:INVALID};
}

Board.prototype.clone = function() {
    var newBoard = new Board();
    newBoard.p1 = this.p1;
    newBoard.p2 = this.p2;
	newBoard.turn = this.turn;
    return newBoard;
}

Board.prototype.print = function() {    
    var str = '';
    for (var r = 0; r < ROW_SPACES; r++) {
        if (r == 3) str += '-------\n';
        for (var c = 0; c < COL_SPACES; c++) {            
            if (c == 3) str += '|';
            var ind = IND[r][c];     
            var mpos = IND_TO_MPOS[ind];            
            var space = ':';
            if (and(this.p1, mpos)) space = 'X';
            else if (and(this.p2, mpos)) space = 'O';
                        
            str += space;
        }
        str += '\n';        
    }
    console.log(str);
}

Board.prototype.printMove = function(move) {    	
	var quadRot = '';
	if (move.quad != INVALID) {
		var d = (move.dir == ROT_CLOCKWISE)? 'c' : 'a';
		quadRot = ' - Q' + move.quad + d;
	}
	
	console.log('Move: ' + ROW[move.ind] + ',' + COL[move.ind] + quadRot);
}

Board.prototype.toString = function() {
	return '0x' + this.p1.toString(16) + ',0x' + this.p2.toString(16);
}
//End class Board