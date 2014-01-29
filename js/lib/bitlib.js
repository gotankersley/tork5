/* Javascript provides 53 bits of precision, however, only 32 bits can used for bitwise operations.
Therefore, this library provides functions to emulate bitwise operations on ints larger than 32 bits */
var HI_MASK = 0x100000000;
// var BIT_COUNTS = [
	// 0,1,1,2,1,2,2,3,1,2,2,3,2,3,3,4,1,2,2,3,2,3,3,4,2,3,3,4,3,4,4,5,
	// 1,2,2,3,2,3,3,4,2,3,3,4,3,4,4,5,2,3,3,4,3,4,4,5,3,4,4,5,4,5,5,6,
	// 1,2,2,3,2,3,3,4,2,3,3,4,3,4,4,5,2,3,3,4,3,4,4,5,3,4,4,5,4,5,5,6,
	// 2,3,3,4,3,4,4,5,3,4,4,5,4,5,5,6,3,4,4,5,4,5,5,6,4,5,5,6,5,6,6,7,
	// 1,2,2,3,2,3,3,4,2,3,3,4,3,4,4,5,2,3,3,4,3,4,4,5,3,4,4,5,4,5,5,6,
	// 2,3,3,4,3,4,4,5,3,4,4,5,4,5,5,6,3,4,4,5,4,5,5,6,4,5,5,6,5,6,6,7,
	// 2,3,3,4,3,4,4,5,3,4,4,5,4,5,5,6,3,4,4,5,4,5,5,6,4,5,5,6,5,6,6,7,
	// 3,4,4,5,4,5,5,6,4,5,5,6,5,6,6,7,4,5,5,6,5,6,6,7,5,6,6,7,6,7,7,8
// ];
var BIT_COUNTS = [0,1,1,2,1,2,2,3,1,2,2,3,2,3,3,4];

function xor(n1, n2) {
    return ((n1/HI_MASK) ^ (n2/HI_MASK)) * HI_MASK + ((n1^n2)>>>0);    
}

function and(n1, n2) {
    return (Math.floor((n1/HI_MASK)) & Math.floor(n2/HI_MASK)) * HI_MASK + ((n1&n2)>>>0);	
}

function or(n1, n2) {
    return (Math.floor(n1/HI_MASK) | Math.floor(n2/HI_MASK)) * HI_MASK + ((n1|n2)>>>0);
}

function not(n) {    
    return ((((~Math.floor(n/HI_MASK)) >>> 0) ^ 0xfffffff0) * HI_MASK) + (~n >>> 0);
}

function shiftL(n, x) {
	return Math.floor(n*Math.pow(2,x));
}

function shiftR(n,x) {
	return Math.floor(n/Math.pow(2,x));
}

function rotL(n,x) { //int32 only    
	return (n >>> (32 - x))|(n << x) % 0xff;	
}

function rotR(n,x) { //int32 only
    return (n >>> x) | ((n << (32 - x) >>> 0) % 0xff);	
}

function indToMpos(ind) {
	return Math.pow(2,ind);
}

function mposToInd(mask) {
    return (mask == 0)? 0 : Math.floor(Math.log(mask)/Math.LN2);
}

function bitCount(x) {
	var hi = BIT_COUNTS[Math.floor(x/HI_MASK)];	
	x = x - ((x >>> 1) & 0x55555555);
	x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
	return hi + ((((x + (x >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24);
}

//function bitScan(x){
//    while ( x ) {
//        var ls1b = x & -x; // isolate LS1B
//        console.log(ls1b);
//        x &= x-1; // reset LS1B
//    }
//    console.log(c);
//}