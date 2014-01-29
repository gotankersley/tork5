var HORIZONTAL = 0;
var VERTICAL = 1;
var DIAG_TL_BR = 2;
var DIAG_TR_BL = 3;

var BITS_PER_BYTE = 4;
var EOL = '\r';

var statBoard;
var masks = [];
var winMeta = {};
var ind;
$(function() {
	statBoard = new Board();
	for (var i = 0; i < BOARD_SPACES; i++) {
		masks.push({});
	}
	for (var r = 0; r < ROW_SPACES; r++) {
		for (var c = 0; c < COL_SPACES; c++) {			
			ind = IND[r][c];
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
	
	document.write('var WIN_META = { //Keyed by winMask(base10). Each array position contains quad, and dir' + EOL);
	for (var key in winMeta) {
        var w = winMeta[key];
		document.write("\t'" + key + "':[" + w.q + ',' + w.d + '],' + EOL);		
	}
	document.write('};' + EOL);
	document.write('</pre>');	
}

function getMask(r, c, offset, lineType) {
	var mask = 0;
	for (var i = 0; i < NUM_TO_WIN; i++) {
		var off = i - offset;
		if (lineType == HORIZONTAL) {
			if (onBoard(r, c + off)) mask = or(mask, IND_TO_MPOS[IND[r][c + off]]);
			else return false;
		}
		else if (lineType == VERTICAL) {
			if (onBoard(r + off, c)) mask = or(mask, IND_TO_MPOS[IND[r + off][c]]);
			else return false;
		}
		else if (lineType == DIAG_TL_BR) {
			if (onBoard(r + off, c + off)) mask = or(mask, IND_TO_MPOS[IND[r + off][c + off]]);
			else return false;
		}
		else if (lineType == DIAG_TR_BL) {
			if (onBoard(r + off, c - off)) mask = or(mask, IND_TO_MPOS[IND[r + off][c - off]]);
			else return false;
		}		
		else return false;
	}
	return mask;
}

function printMask(mask, metaData) {	
	var mpos = IND_TO_MPOS[ind];
	if (and(mask, mpos)){
		var bitStr = toBin(mask);
		var hexStr = toHex(bitStr, bitStr.length);
		masks[ind][hexStr] = true;	
		if (metaData != undefined) winMeta[mask] = metaData;
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

function padStr(str, length) {
    while (str.length < length) {
        str = '0' + str;
    }
    return str;
}

function toBin(n) {
	var bitStr = n.toString(2);
	var padLength = Math.ceil(bitStr.length/BITS_PER_BYTE) * BITS_PER_BYTE;
	return padStr(bitStr, padLength);
}
function toHex(bitStr, length) {
    //Convert to hex 4 bits at a time
    var hex = '';
    for (var i = 0; i < bitStr.length; i+= BITS_PER_BYTE) {
        var bits = parseInt(bitStr.substr(i, BITS_PER_BYTE), 2);
        hex += bits.toString(16);        
    }    
	var hexStr = '0x';	
	for (var i = 0; i < hex.length; i++) {
		if (hex.charAt(i) != 0) return '0x' + hex.substr(i);
	}
	
	return '0x' + hex;
}



