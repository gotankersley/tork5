/* Javascript provides 53 bits of precision, however, only 32 bits can used for bitwise operations.
Therefore, this library provides functions to emulate bitwise operations on ints larger than 32 bits */
var HI_MASK = 0x100000000;
var BIT_COUNTS = [0,1,1,2,1,2,2,3,1,2,2,3,2,3,3,4];
var IND_TO_MPOS = [0x1,0x2,0x4,0x8,0x10,0x20,0x40,0x80,0x100,0x200,0x400,0x800,0x1000,0x2000,0x4000,0x8000,0x10000,0x20000,0x40000,0x80000,0x100000,0x200000,0x400000,0x800000,0x1000000,0x2000000,0x4000000,0x8000000,0x10000000,0x20000000,0x40000000,0x80000000,0x100000000,0x200000000,0x400000000,0x800000000];
var MPOS_TO_IND = {1:0,2:1,4:2,8:3,16:4,32:5,64:6,128:7,256:8,512:9,1024:10,2048:11,4096:12,8192:13,16384:14,32768:15,65536:16,131072:17,262144:18,524288:19,1048576:20,2097152:21,4194304:22,8388608:23,16777216:24,33554432:25,67108864:26,134217728:27,268435456:28,536870912:29,1073741824:30,2147483648:31,4294967296:32,8589934592:33,17179869184:34,34359738368:35};
var HI_MPOS_TO_IND = [[],[32],[33],[32,33],[34],[32,34],[33,34],[32,33,34],[35],[32,35],[33,35],[32,33,35],[34,35],[32,34,35],[33,34,35],[32,33,34,35]];

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

function bitCount(x) {
	var hi = BIT_COUNTS[Math.floor(x/HI_MASK)];	
	x = x - ((x >>> 1) & 0x55555555);
	x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
	return hi + ((((x + (x >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24);
}

function bitScan(x){	
	bits = [];
	var hi = Math.floor(x/HI_MASK);		
    while (x) {
        var minBit = x & -x; // isolate least significant bit
        bits.push(MPOS_TO_IND[minBit>>>0]);
		x &= x-1;
	}	
	return bits.concat(HI_MPOS_TO_IND[hi]);		
}