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
- pos: position of bitboard array [0 - 36]
- mpos: a bitboard mask position. i.e mpos = (1 << pos). [0 - 2^36]
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
var EMPTY = -1;
var INVALID = -1;

//Enums
var PLAYER1 = 0;
var PLAYER2 = 1;

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
var POS = [
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
}

Board.prototype.isOpen = function(pos) {    
    var avail = not(or(this.p1,this.p2)); 
    return and(avail, POS_TO_MPOS[pos]);
}


Board.prototype.set = function(row, col) {   
    var pos = POS[row][col];	    
    return this.setPin(pos);
}
Board.prototype.setPin = function(pos) {        	
    if (this.isOpen(pos)) {                
        if (this.turn == PLAYER1) this.p1 = xor(this.p1, POS_TO_MPOS[pos]);        
        else this.p2 = xor(this.p2, POS_TO_MPOS[pos]); //Player 2				
		return true;
    }
	else return false;
}

Board.prototype.get = function(row, col) {
    var pos = POS[row][col];
    return this.getPin(pos);
}
Board.prototype.getPin = function(pos) {	
	var mpos = POS_TO_MPOS[pos];
	if (and(this.p1, mpos)) return PLAYER1;	
	else if (and(this.p2, mpos)) return PLAYER2;
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

Board.prototype.rotate = function(quad, rot) {
	this.p1 = this.rotateQuad(this.p1, quad, rot);
	this.p2 = this.rotateQuad(this.p2, quad, rot);	
	this.turn = !this.turn;    
}
Board.prototype.rotateQuad = function(board, quad, rot) {      
	//Rot can be simplified - in situ
	//Extract quad from board  
	var quadUnshifted = (and(board, QUADS[quad]));
    var quadBoard = shiftR(quadUnshifted, quad * QUAD_SPACES); 
    
    //Bitwise rotate, 3 places will rotate 90 degrees - note bitwise rot is opposite direction of visual
    var rotQuad = (rot == ROT_CLOCKWISE)? rotL(quadBoard, QUAD_COUNT) : rotR(quadBoard, QUAD_COUNT);    
	
    //Add the rotated quad back to the board
	var quadShifted = shiftL(rotQuad, quad * QUAD_SPACES);
	board = and(board, not(QUADS[quad])); //Empty quad    
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
		var pos = winBits[i];    
		r = ROW[pos];
		c = COL[pos];
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

Board.prototype.makeRandomMove = function() { 
    var avail = not(or(this.p1, this.p2));
    var availBits = bitScan(avail);
    var randPos = availBits[Math.floor(Math.random() * availBits.length)];
    if (this.turn == PLAYER1) this.p1 = xor(this.p1, POS_TO_MPOS[randPos]);
    else this.p2 = xor(this.p2, POS_TO_MPOS[randPos]);
    
    var randQuad = Math.floor(Math.random() * BOARD_QUADS);
    var randRot = Math.floor(Math.random() * 2);
    this.rotate(randQuad, randRot);	
}

Board.prototype.getAllMoves = function() {
    var avail = not(or(this.p1, this.p2));
    var availBits = bitScan(avail);
	var moves = [];
	var moveSet = {};
	for (var a = 0; a < availBits.length; a++) {
		for (var i = 0; i < ALL_ROTATIONS; i++) {
			var q = Math.floor(i/2);
            var r = i%2;
            var newBoard = this.clone();
            if (newBoard.turn == PLAYER1) newBoard.p1 = xor(newBoard.p1, POS_TO_MPOS[availBits[a]]); //Place pin
			else newBoard.p2 = xor(newBoard.p2, POS_TO_MPOS[availBits[a]]); //Place pin
            newBoard.rotate(q, r); //Rotate
			var boardIdStr = String(newBoard.p1) + '_' + String(newBoard.p2);
            if (typeof(moveSet[boardIdStr]) == 'undefined') {
				moveSet[boardIdStr] = true;
				moves.push(newBoard);
			}
		}
	}
	return moves;
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
            var r = i%2;
            var newBoard = this.clone();
            if (newBoard.turn == PLAYER1) newBoard.p1 = xor(newBoard.p1, POS_TO_MPOS[availBits[a]]); 
			else newBoard.p2 = xor(newBoard.p2, POS_TO_MPOS[availBits[a]]); 
            newBoard.rotate(q, r);
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
            var r = Math.floor(i / 10) % 2;
            wins[(r * BOARD_QUADS) + q] = true;
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
		
	for (var i = 0; i < 70; i++) {
		var mid = LONG_MID_WINS[i];
        var combinedMid = and(board, mid);
        if (combinedMid == mid) { //4 in a row, need one available, or 5+ in a row that just needs to be turned
            if (and(avail, LONG_SPAN_WINS[i]) || and(board, LONG_SPAN_WINS[i])) return Number(i) + 1;
        }
        else if (bitCount(combinedMid) == 3) { //3 out of 4 in mid, need 1 of the spans, and one availble 
            if (and(board, LONG_SPAN_WINS[i]) && and(avail, mid)) return Number(i) + 1;  
        }        
    }    
    for (var i = 0; i < 28; i++) {
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
    var pos = INVALID;
    var quad = INVALID;
    var rot = INVALID;
    //Short diag win without rotation        
    if (i > 95) pos = MPOS_TO_POS[xor(SHORT_WINS[i - 71], board)];
    
    //Short diagonal win with rotation
    else if (i > 70) { 
        i -= 71;
        quad = Math.floor(i/6);
        rot = Math.floor(i/3)%2;
        var win = SHORT_WINS[i];        
        if (and(board, win) == win) {
            var availBits = bitScan(avail); 
            pos = availBits[0]; //Any available
        }
        else pos = MPOS_TO_POS[xor(win, board)];               
    }
    //Long wins
    else {
        i--;    
        if (i < 56) { //With rotation
            quad = Math.floor(i/14);            
            rot = Math.floor(i/7)%2;
        }    
        var mid = LONG_MID_WINS[i];  
        var span = LONG_SPAN_WINS[i];
        if (and(board, mid) == mid) {
            var spanAvail = and(span, avail);
            var availBits = (spanAvail)? bitScan(spanAvail) : bitScan(avail);            
            pos = availBits[0];
        }
        else {
            var availBits = bitScan(and(avail, mid));            
            pos = availBits[0];
        }
                        
    }
    return {pos:pos, quad:quad, rot:rot};
}


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
            var r = Math.floor(i / 10) % 2;
            wins[side]['x_' + q + r] = {pos:INVALID, quad:q, rot:r};
        }
        if (and(opp, mid) == mid && and(opp, QUAD_SPAN_WINS[i])) {            
            var q = Math.floor(i / 20);
            var r = Math.floor(i / 10) % 2;
            wins[oppSide]['x_' + q + r] = {pos:INVALID, quad:q, rot:r};
        }
	}    
	
	//Optimization to check contiguous wins for pins, when there are fewer pins than available spaces
	if (bitCount(board) < 12) {	
		//Check all of each player's pins to see if they have a line with 4 pins with an open space for a 5th pin to go		
		for (var pos = 0; pos < BOARD_SPACES; pos++) {        		
			var mpos = POS_TO_MPOS[pos];			
			if (and(board, mpos)) testWinLineFromSpace(side, board, pos, avail, wins); //Wins passed by reference
			if (and(opp, mpos)) testWinLineFromSpace(oppSide, opp, pos, avail, wins); //Wins passed by reference				
		}
	}	//Else just check the available spaces when there are more pins than available
	else {
		for (var pos = 0; pos < BOARD_SPACES; pos++) {        		
			var mpos = POS_TO_MPOS[pos];
			if (and(avail, mpos)) {			
				testWinLineFromSpace(side, board, pos, false, wins); //Wins passed by reference
				testWinLineFromSpace(oppSide, opp, pos, false, wins); //Wins passed by reference	
			}
		}
	}
    return wins;
}


function testWinLineFromSpace(side, board, pos, avail, winsRef) { //Wins passed by reference
	for (var a in AVAIL_WINS[pos]) {
		var win = AVAIL_WINS[pos][a];	
		var boardLine = and(board, win);		
		var count = bitCount(boardLine);
		if (count >= 4) { //4 in a line, but need to make sure 5th space is avail to win							 			
			var fifthMpos = xor(boardLine, win);					
			if (!avail || and(avail, fifthMpos)) {
				var fifthPos = MPOS_TO_POS[fifthMpos];					
				meta = WIN_META[String(win)];
				if (meta == undefined) {
					winsRef[side][fifthPos + '_xx'] = {pos:fifthPos, quad:INVALID, rot:INVALID}; //Win without rotation				
				}
				else {
					var rotAbbrev = (meta[1] == ROT_CLOCKWISE)? 'c' : 'a';
					winsRef[side][fifthPos + '_' + meta[0] + rotAbbrev] = {pos:fifthPos, quad:meta[0], rot:meta[1]}; //Win with specific pin placement and rotation				
				}
			}
		}
	}
}

Board.prototype.score = function() {
    var board;
    var opp;    
	var curScore;
	var oppScore;
	//Turn inverted because move has already been made before evaluating board state
    if (this.turn == PLAYER2) {
        board = this.p1;
        opp = this.p2;
    }
    else {
        board = this.p2;
        opp = this.p1;
    }
	
	//Board less than half full, so check pins
	var count = bitCount(or(board, opp));
	if (count <= 12) { 		        
		curScore = scoreWinLines(board, opp, bitScan(board));        
		oppScore = scoreWinLines(opp, board, bitScan(opp));
	}
	//Board more than half full, so check empty spaces
    else {
		var avail = not(or(this.p1,this.p2));
		curScore = scoreWinLines(board, opp, bitScan(avail));
		oppScore = scoreWinLines(opp, board, bitScan(avail));
	}	
	//console.log("Score: " + curScore + '/' + oppScore + ' = ' + (curScore - oppScore));
    return curScore - oppScore;
}

function scoreWinLines(board, opp, positions) {	
	var winLines = {};
	var score = 0;
	
	//Loop through positions
	for (var i = 0; i < positions.length; i++) {
		var pos = positions[i];
		//Get all win lines from board space
		var winsFromPos = AVAIL_WINS[pos];
		for (var k = 0; k < winsFromPos.length; k++) {
			winLines[winsFromPos[k]] = true; //Set to avoid checking multiple times 
		}
	}
	
	//Loop through possible win lines
	var winKeys = Object.keys(winLines);		
	for (var i = 0; i < winKeys.length; i++) {
		if (!and(opp, winKeys[i])) {
			var bc = bitCount(and(board, winKeys[i]));
			var exp = (bc >= 4)? Math.pow(bc, 5) : Math.pow(bc, 3);			
			score += exp;         
		}        
        
		
	}
	return score;
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
		var r = i % 2;
		var rotatedBoard = this.rotateQuad(beforeBoard, q, r);
        var rotatedOpp = this.rotateQuad(beforeOpp, q, r);
		var combinedBoard = and(rotatedBoard, afterBoard);		
		if (afterCount - bitCount(combinedBoard) == 1 && (rotatedOpp == afterOpp)) {
			var reverseRotated = this.rotateQuad(afterBoard, q, !r); //Rotate after board in reverse to get position
			var pos = MPOS_TO_POS[xor(beforeBoard, reverseRotated)];
			return {pos:pos, quad:q, rot:r};
		}
	}
	
	//See if there is a move with no rotation (win)
	var combinedBoard = and(beforeBoard, afterBoard);    
	if (afterCount - bitCount(combinedBoard) == 1 && (beforeOpp == afterOpp)) {
		var pos = MPOS_TO_POS[xor(beforeBoard, afterBoard)];
		return {pos:pos, quad:INVALID, rot:INVALID};
	}
	return {pos:INVALID, quad:INVALID, rot:INVALID};
}

Board.prototype.canSkipRotation = function() {
	var board = or(this.p1, this.p2);
	if (!and(board, QUADS[0]) || !and(board, QUADS[1]) || !and(board, QUADS[2]) || !and(board, QUADS[3])) return true;
	else return false;
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
            var pos = POS[r][c];     
            var mpos = POS_TO_MPOS[pos];            
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
		var r = (move.rot == ROT_CLOCKWISE)? 'c' : 'a';
		quadRot = ' - Q' + move.quad + r;
	}
	
	console.log('Move: ' + ROW[move.pos] + ',' + COL[move.pos] + quadRot);
}

Board.prototype.toString = function() {
	return '0x' + this.p1.toString(16) + ',0x' + this.p2.toString(16);
}
//End class Board