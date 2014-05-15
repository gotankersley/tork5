#include <iostream>
#include <ctime>
#include "board.h"
#include "neuralnet.h"

using namespace std;

void MCTS_getMove(Board board, int& pos, int& quad, int& rot);
void NN_getMove(Board board, int &pos, int&quad, int& rot) {	
	NeuralNet nn;
	if (bitCount(And(board.p1, board.p2)) % 2 == 0)	nn.load("nn-player1.txt");
	else nn.load("nn-player2.txt");
	vector<Board> moves = board.getAllMoves();
	float bestScore = -1000;
	float bestKid;
	for (int m = 0; m < moves.size(); m++) {
		float inputs[NN_INPUTS];
		moves[m].toNNInputs(inputs);
		float score = nn.calculate(inputs);
		if (score > bestScore) {
			bestScore = score;
			bestKid = m;
		}
	}
	board.deriveMove(moves[bestKid], pos, quad, rot);

}
void Heuristic_getMove(Board board, int &pos, int&quad, int& rot) {		
	vector<Board> moves = board.getAllMoves();
	float bestScore = -100000000;
	float bestKid;
	for (int m = 0; m < moves.size(); m++) {				
		int score = moves[m].score();
		if (score > bestScore) {
			bestScore = score;
			bestKid = m;
		}
	}
	board.deriveMove(moves[bestKid], pos, quad, rot);

}
void getMove(Board board, int& pos, int& quad, int& rot) {	
	pos = INVALID;
	quad = INVALID;
	rot = INVALID;

	//system("cls");	
	printf("\n\nHuman\n");
	board.print();
	if (board.turn == PLAYER1) cout << "X's turn" << endl;
	else cout << "O's turn" << endl;
	cout << "Pos: ";
	cin >> pos;
	while (!board.placePin(pos)) {
		cout << "Invalid Pos: (0 - 35)" << endl;
		cin >> pos;
	}
	board.print();
	do {
		cout << "Quad: ";
		cin >> quad;
	}
	while (quad < 0 || quad >= BOARD_QUADS);
	do {
		cout << "Rot: ";
		cin >> rot;
	}
	while (rot < 0 || rot >= 2);	
}

void play(Board board) {
	int pos;
	int quad;
	int rot;	        	
	//MCTS_getMove(board, pos, quad, rot);			
	NN_getMove(board, pos, quad, rot);			
	//Heuristic_getMove(board, pos, quad, rot);			
	printf("{\"pos\":%i, \"quad\":%i, \"rot\":%i}", pos, quad, rot);	
}

void GA_train();

void main(int argc, char* argv[])
{	
	srand((unsigned int) time(0));		
	GA_train();
	
	return;
	Board board;	
	if (argc > 1) {
		board.p1 = _atoi64(argv[1]);
		board.p2 = _atoi64(argv[2]);
		board.turn = atoi(argv[3]);		
		play(board);
		return;
	}
	int player1 = PLAYER_HUMAN;	
	int player2 = PLAYER_MCTS;
	
	
	//clock_t startTime = clock();	
	
	
	//Game loop
	int gameState = IN_PLAY;
	int player;
	for (int i = 0; gameState == IN_PLAY && i < BOARD_SPACES; i++) {		
		int pos, quad, rot;
		player = (board.turn == PLAYER1)? player1 : player2;

		if (player == PLAYER_HUMAN) getMove(board, pos, quad, rot);
		else if (player == PLAYER_MCTS) MCTS_getMove(board, pos, quad, rot);
		else getMove(board, pos, quad, rot);
		board.printMove(pos, quad, rot);
		printf("\n\n");

		if (pos == INVALID || quad == INVALID || rot == INVALID) {
			printf("INVALID MOVE! %s\n", board.toString().c_str());
			break;
		}
		else {
			board.placePin(pos);		
			board.rotate(quad, rot);		
			gameState = board.isWin();		
		}
	}

	if (gameState == WIN_TIE || gameState == WIN_DUAL) cout << "Tie game!" << endl;
	else if (gameState == WIN_PLAYER1) cout << "Player 1 wins!" << endl;
	else if (gameState == WIN_PLAYER2) cout << "Player 2 wins!" << endl;
			
	//double duration = (clock() - startTime) / (double) CLOCKS_PER_SEC;
	//printf("Time: %f sec", duration);	

	system("PAUSE");
}