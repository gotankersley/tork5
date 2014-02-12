#define And(x1, x2) (x1 & x2)
#define Or(x1, x2) (x1 | x2)
#define Xor(x1, x2) (x1 ^ x2)
#define Not(x) (~x)
#define ShiftR(x, n) (x >> n)
#define ShiftL(x, n) (x << n)
#define RotL(x, n) ((n << x) | (n >> (64 - x)))
#define RotR(x, n) ((n >> x) | (n << (64 - x)))
#define bitCount(board) __popcnt64(board)
#define MPOS_TO_POS(mpos) (int(log((float)mpos) * 1.44269504088896340736))

inline list bitScan(uint64 board) {
	list bits;
	ulong pos;
	while (_BitScanForward64(&pos, board)) {
		bits.push_back(pos);
		board ^= POS_TO_MPOS[pos];
	}
	return bits;
}