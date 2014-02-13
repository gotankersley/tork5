#define And(x1, x2) (x1 & x2)
#define Or(x1, x2) (x1 | x2)
#define Xor(x1, x2) (x1 ^ x2)
#define Not(x) (~x)
#define ShiftR(x, n) (x >> n)
#define ShiftL(x, n) (x << n)
#define bitCount(board) __popcnt64(board)
#define MPOS_TO_POS(mpos) (int(log((float)mpos) * 1.44269504088896340736))


//inline uint64 RotL(uint64 num, int pos) {
//	return (num << pos) | (num >> (8 - pos));
//}
//
//inline uint64 RotR(uint64 num, int pos) {
//	return (num >> pos) | (num << (8 - pos));
//}

#define RotL(x, n) ((x << n) | (x >> (8 - n)))
#define RotR(x, n) ((x >> n) | (x << (8 - n)))

inline list bitScan(uint64 board) {
	list bits;
	ulong pos;
	while (_BitScanForward64(&pos, board)) {
		bits.push_back(pos);
		board ^= POS_TO_MPOS[pos];
	}
	return bits;
}