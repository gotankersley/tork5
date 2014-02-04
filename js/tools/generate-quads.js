var SUPER_WINS = [
    0xe07,0x31188,0xe070,0x381c0000,0xc46200000,0x381c00000, //Horizontal
    0x30400c1,0x4880122,0x70001c,0x608018200,0x910024400,0xe0003800, //Vertical
    0x5000800a,0x888000111,0x5001000a0, //Diag TL -> BR
    0x2090410,0x5128800,0x8a05000 //Diag TR -> BL
];


var BITS_PER_BYTE = 4;
var EOL = '\r';

var statBoard;

$(function() {
	statBoard = new Board();
	var mids = [[],[],[],[],[],[],[],[]];
    var spans = [[],[],[],[],[],[],[],[]];    
    for (var q = 0; q < BOARD_QUADS; q++) {
        for (var w in SUPER_WINS) {
            var win = SUPER_WINS[w];
            if (and(win, QUADS[q])) {
                var span = getSpan(win);
                var mid;
                //if (bitCount(win) == 5) mid = win;
                //else
				mid = xor(win, span);
                mids[q*2].push(statBoard.rotateQuad(mid, q, ROT_CLOCKWISE));
                mids[(q*2)+1].push(statBoard.rotateQuad(mid, q, ROT_ANTICLOCKWISE));
                
                spans[q*2].push(statBoard.rotateQuad(span, q, ROT_CLOCKWISE));
                spans[(q*2) + 1].push(statBoard.rotateQuad(span, q, ROT_ANTICLOCKWISE));
            }
        }
    }

	
	outputMasks(mids, 'QUAD_MID_WINS');
    outputMasks(spans, 'QUAD_SPAN_WINS');
});




function outputMasks(quadMasks, arrayName) {
	document.write('<pre>');
	document.write('var ' + arrayName + ' = [' + EOL);			
    for (var q = 0; q < BOARD_QUADS; q++) {
        var line = '';
        //Clockwise
        for (var m in quadMasks[q*2]) {
            var mask = quadMasks[q*2][m];
            var bitStr = toBin(mask);
            var hexStr = toHex(bitStr, bitStr.length);                
            line += hexStr + ',';			
        }            
        document.write('\t' + line + ' //Q' + q + ' - c' + EOL); 
        
        //Anticlockwise
        line = '';
        for (var m in quadMasks[(q*2)+1]) {
            var mask = quadMasks[(q*2)+1][m];
            var bitStr = toBin(mask);
            var hexStr = toHex(bitStr, bitStr.length);                
            line += hexStr + ',';			
        }            
        document.write('\t' + line + ' //Q' + q + ' - a' + EOL);
    }			

	document.write('];' + EOL);
	document.write(EOL);	
	document.write('</pre>');	
}

//Helper
function onBoard(row, col) {
	if (row >= 0 && row < ROW_SPACES && col >= 0 && col < COL_SPACES) return true;
	else return false;
}

function getSpan(mask) {
    var bits = bitScan(mask);
    var minR = ROW_SPACES - 1;
    var minC = COL_SPACES - 1;
    var maxR = 0;
    var maxC = 0;
    for (var i in bits) {
        var ind = bits[i];
        var r = ROW[ind];
        var c = COL[ind];
        
        if (r < minR || (r == minR && c < minC)) {
			minR = r;
			minC = c;
		}
		if (r > maxR || (r == maxR && c > maxC)) {
			maxR = r;
			maxC = c;
		}        
    }
    return or(IND_TO_MPOS[IND[minR][minC]], IND_TO_MPOS[IND[maxR][maxC]]);
    
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



