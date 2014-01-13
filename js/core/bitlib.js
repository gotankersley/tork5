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
    return (~(n/0xffffffff)) + (~n);
}

function rotL(n,x) {

}

function rotR(n,x) {

}

function bitCount(x) {
    x = x - ((x >>> 1) & 0x55555555);
    x = (x & 0x33333333) + ((x >>> 2) & 0x33333333);
    return (((x + (x >>> 4)) & 0x0F0F0F0F) * 0x01010101) >>> 24;
}
