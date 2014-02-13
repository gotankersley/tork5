const int BOARD_SPACES = 36;
const int BOARD_QUADS = 4;
const int NUM_TO_WIN = 5;
const int ROW_SPACES = 6;
const int COL_SPACES = 6;
const int QUAD_SPACES = 9;
const int QUAD_COUNT = 2;
const int QUAD_ROW_SPACES = 3;
const int QUAD_COL_SPACES = 3;
const int ALL_ROTATIONS = 8;
const int INVALID = -1;


//Enums
enum {PLAYER1, PLAYER2};
enum {PLAYER_HUMAN, PLAYER_MCTS};
enum {ROT_CLOCKWISE, ROT_ANTICLOCKWISE};
enum {IN_PLAY, WIN_PLAYER1, WIN_PLAYER2, WIN_TIE, WIN_DUAL};

//Index maps
const int ROW[] = {0,0,0,1,2,2,2,1,1,0,0,0,1,2,2,2,1,1,3,3,3,4,5,5,5,4,4,3,3,3,4,5,5,5,4,4};
const int COL[] = {0,1,2,2,2,1,0,0,1,3,4,5,5,5,4,3,3,4,0,1,2,2,2,1,0,0,1,3,4,5,5,5,4,3,3,4};
const int POS[ROW_SPACES][COL_SPACES] = {
	{0,1,2,9,10,11},        //Row 0
	{7,8,3,16,17,12},       //Row 1
	{6,5,4,15,14,13},       //Row 2
	{18,19,20,27,28,29},    //Row 3
	{25,26,21,34,35,30},    //Row 4
	{24,23,22,33,32,31}    //Row 5
};
const uint64 POS_TO_MPOS[] = {0x1,0x2,0x4,0x8,0x10,0x20,0x40,0x80,0x100,0x200,0x400,0x800,0x1000,0x2000,0x4000,0x8000,0x10000,0x20000,0x40000,0x80000,0x100000,0x200000,0x400000,0x800000,0x1000000,0x2000000,0x4000000,0x8000000,0x10000000,0x20000000,0x40000000,0x80000000,0x100000000,0x200000000,0x400000000,0x800000000};
