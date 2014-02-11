var BITS_PER_BYTE = 4;
var EOL = '\r';

$(function() {
	var counts = {};
	getCount(LONG_MID_WINS, 4, counts);
	getCount(SHORT_WINS, 5, counts);	
	outputCounts('MID_COUNTS', counts);
});

function getCount(array, padSize, countsRef) {
	for (var m in array) {	
		var mask = array[m];
		var maskBits = bitScan(mask);	
		var limit = Math.pow(2, padSize);
		for (var i = 0; i <= limit; i++) {		
			var bitStr = padStr(i.toString(2), padSize);
			var num = 0;			
			for (var s in bitStr) {			
				if (bitStr.charAt(s) == '1') num = or(num, POS_TO_MPOS[maskBits[s]]);
			}
			countsRef[num] = bitCount(num);
		}			
	}
}



function outputCounts(arrayName, counts) {
	document.write('<pre>');
	document.write('var ' + arrayName + ' = {' + EOL);	
	var i = 0;
	document.write('\t');
	
	for (var key in counts) {
		var bitStr = toBin(Number(key));
		var hexStr = toHex(bitStr, bitStr.length);                		
		document.write(hexStr + ':' + counts[key] + ',');
		if (++i % 25 == 0) document.write(EOL + '\t');
	}    

	document.write('};' + EOL);
	document.write(EOL);	
	document.write('</pre>');	
}



