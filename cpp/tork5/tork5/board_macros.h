//#define And(x1, x2) (x1 & x2)
//#define Or(x1, x2) (x1 | x2)
//#define Xor(x1, x2) (x1 ^ x2)
//#define Not(x) ((~x) ^ 0xfffffff000000000)
//#define ShiftR(x, n) (x >> n)
//#define ShiftL(x, n) (x << n)
//#define RotL(x, n) ((x << n) | (x >> (8 - n)))
//#define RotR(x, n) ((x >> n) | (x << (8 - n)))
#define bitCount(board) __popcnt64(board)
//#define MPOS_TO_POS(mpos) (int(log((float)mpos) * 1.44269504088896340736))
inline uint64 POS_TO_MPOS(int pos) {
	return 1I64 << pos;
}
inline int MPOS_TO_POS(uint64 mpos) {
	return floor((log((float)mpos) * 1.44269504088896340736) + 0.5);
}
inline uint64 And(uint64 x1, uint64 x2) {
	return x1 & x2;
}
inline uint64 Or(uint64 x1, uint64 x2) {
	return x1 | x2;
}
inline uint64 Xor(uint64 x1, uint64 x2) {
	return x1 ^ x2;
}
inline uint64 Not(uint64 x) {
	return (~x) & 0xFFFFFFFFF;	                
}
inline uint64 ShiftR(uint64 x, uint64 n) {
	return x >> n;
}

inline uint64 ShiftL(uint64 x, uint64 n) {
	return x << n;
}

inline uint64 RotL(uint64 num, uint64 pos) {
	return ((num << pos) % 0x100) | (num >> (8 - pos));
}

inline uint64 RotR(uint64 num, uint64 pos) {
	return (num >> pos) | ((num << (8 - pos)) % 0x100);
}


inline list bitScan(uint64 board) {
	list bits;
	ulong pos;
	while (_BitScanForward64(&pos, board)) {
		bits.push_back(pos);
		board ^= POS_TO_MPOS(pos);
	}
	return bits;
}