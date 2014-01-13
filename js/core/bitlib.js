/* Javascript provides 53 bits of precision, however, only 32 bits can used for bitwise operations.
Therefore, this library provides functions to emulate bitwise operations on ints larger than 32 bits */
function xor(n1, n2) {
    return ((n1/0xffffffff) ^ (n2/0xffffffff)) * 0x100000000 + (n1^n2);    
}

function and(n1, n2) {
    return ((n1/0xffffffff) & (n2/0xffffffff)) * 0x100000000 + (n1&n2);
}

function or(n1, n2) {
    return ((n1/0xffffffff) | (n2/0xffffffff)) * 0x100000000 + (n1|n2);
}

function not(n) {
    return (((~(n/0xffffffff)) >>> 0) * 0x100000000) + (~n >>> 0);
}

function shiftL(n, x) {
	return Math.floor(n*Math.pow(2,x));
}

function shiftR(n,x) {
	return Math.floor(n/Math.pow(2,x));
}

function rotL(n,x) { //int32 only
	return (n >>> 3)|(n << (32-x));
}

function rotR(n,x) { //int32 only
	return (n << x)|(n >>> (32-x));
}

function mpos(ind) {
	return Math.pow(2,ind);
}

function bitCount(x) {
    x = x - ((x >>> 1) & 0x55555555);
    x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
    return (((x + (x >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24;
}
