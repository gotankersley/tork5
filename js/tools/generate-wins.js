var HORIZONTAL = 0;
var VERTICAL = 1;
var DIAGONAL = 2;
var BITS_PER_BYTE = 4;

$(function() {
	for (var r = 0; r < ROW_SPACES; r++) {
		for (var c = 0; c < COL_SPACES; c++) {
			printLine(r, c, HORIZONTAL);						
			printLine(r, c, VERTICAL);
			printLine(r, c, DIAGONAL);
			
			//break;
		}
		//break;
	}
});


function getMask(r, c, offset, lineType) {
	var mask = 0;
	for (var i = 0; i < NUM_TO_WIN; i++) {
		var off = i - offset;
		if (lineType == HORIZONTAL) {
			if (onBoard(r, c + off)) mask = or(mask, mpos(IND[r][c + off]));
			else return false;
		}
		else if (lineType == VERTICAL) {
			if (onBoard(r + off, c)) mask = or(mask, mpos(IND[r + off][c]));
			else return false;
		}
		else if (lineType == DIAGONAL) {
			if (onBoard(r + off, c + off)) mask = or(mask, mpos(IND[r + off][c + off]));
			else return false;
		}
		else return false;
	}
	return mask;
}

function printMask(mask) {
	if (mask) {
		var bitStr = toBin(mask);
		var hexStr = toHex(bitStr, bitStr.length);
		document.write(hexStr + ',<br>');
	}
}
function printLine(r, c, lineType) {		
	for (var i = 0; i < NUM_TO_WIN; i++) {
		var mask = getMask(r, c, i, lineType);
		printMask(mask);
	}

	return true;
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



