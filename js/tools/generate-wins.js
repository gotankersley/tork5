var HORIZONTAL = 0;
var VERTICAL = 1;
var DIAG_TL_BR = 2;
var DIAG_TR_BL = 3;

var BITS_PER_BYTE = 4;
var EOL = '\r';

var statBoard;
var masks = [];
var winMeta = {};
var pos;
$(function() {
	statBoard = new Board();
	for (var i = 0; i < BOARD_SPACES; i++) {
		masks.push({});
	}
	for (var r = 0; r < ROW_SPACES; r++) {
		for (var c = 0; c < COL_SPACES; c++) {			
			pos = POS[r][c];
			printLine(r, c, HORIZONTAL);						
			printLine(r, c, VERTICAL);
			printLine(r, c, DIAG_TL_BR);
			printLine(r, c, DIAG_TR_BL);					
		
		}			
		
	}
	
	outputMasks();
});

function outputMasks() {
	document.write('<pre>');
	document.write('var AVAIL_WINS = [' + EOL);
	for (var i = 0; i < BOARD_SPACES; i++) {
		document.write('\t[');
		var line = '';
		for (var k in masks[i]) {
			line += k + ',';			
		}
		line = line.substr(0, line.length - 1);
		document.write(line + '],' + '// ' + i + EOL);		
	}
	document.write('];' + EOL);
	
	document.write('var WIN_META = { //Keyed by winMask. Each array position contains quad, and rot' + EOL);
	for (var key in winMeta) {
        var w = winMeta[key];
		document.write("\t" + w.k + ":[" + w.q + ',' + w.d + '],' + EOL);		
	}
	document.write('};' + EOL);
	document.write('</pre>');	
}

function getMask(r, c, offset, lineType) {
	var mask = 0;
	for (var i = 0; i < NUM_TO_WIN; i++) {
		var off = i - offset;
		if (lineType == HORIZONTAL) {
			if (onBoard(r, c + off)) mask = or(mask, POS_TO_MPOS[POS[r][c + off]]);
			else return false;
		}
		else if (lineType == VERTICAL) {
			if (onBoard(r + off, c)) mask = or(mask, POS_TO_MPOS[POS[r + off][c]]);
			else return false;
		}
		else if (lineType == DIAG_TL_BR) {
			if (onBoard(r + off, c + off)) mask = or(mask, POS_TO_MPOS[POS[r + off][c + off]]);
			else return false;
		}
		else if (lineType == DIAG_TR_BL) {
			if (onBoard(r + off, c - off)) mask = or(mask, POS_TO_MPOS[POS[r + off][c - off]]);
			else return false;
		}		
		else return false;
	}
	return mask;
}

function printMask(mask, metaData) {	
	var mpos = POS_TO_MPOS[pos];
	if (and(mask, mpos)){
		var bitStr = toBin(mask);
		var hexStr = toHex(bitStr, bitStr.length);
		masks[pos][hexStr] = true;	
		if (metaData != undefined) {
            metaData['k'] = hexStr;
            winMeta[mask] = metaData;
        }
	}
}

function printRotated(mask, q1, q2) {	
	printMask(statBoard.rotateQuad(mask, q1, ROT_CLOCKWISE), {'q': q1, 'd':ROT_ANTICLOCKWISE});
	printMask(statBoard.rotateQuad(mask, q1, ROT_ANTICLOCKWISE), {'q': q1, 'd':ROT_CLOCKWISE});
	printMask(statBoard.rotateQuad(mask, q2, ROT_CLOCKWISE), {'q': q2, 'd':ROT_ANTICLOCKWISE});
	printMask(statBoard.rotateQuad(mask, q2, ROT_ANTICLOCKWISE), {'q': q2, 'd':ROT_CLOCKWISE});
}

function printLine(r, c, lineType) {	
	for (var i = 0; i < NUM_TO_WIN; i++) {
		var mask = getMask(r, c, i, lineType);		
		if (mask) {
			printMask(mask);
			//Rotate quads - horizontal 
			if (lineType == HORIZONTAL) {
				var q = (r < 3)? 0 : 2;		
				printRotated(mask, q, q + 1);				
			}
			
			//Rotate vertical
			else if (lineType == VERTICAL) {
				var q = (c < 3)? 0 : 1;			
				printRotated(mask, q, q + 2);								
			}
			
			//Rotate - top left -> bottom right
			else if (lineType == DIAG_TL_BR) printRotated(mask, 0, 3);
			
			//Rotate - top right -> bottom left
			else if (lineType == DIAG_TR_BL) printRotated(mask, 1, 2);
		}
		
	}	
}

function onBoard(row, col) {
	if (row >= 0 && row < ROW_SPACES && col >= 0 && col < COL_SPACES) return true;
	else return false;
}



