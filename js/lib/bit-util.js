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
