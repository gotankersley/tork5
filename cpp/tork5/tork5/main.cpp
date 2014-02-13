#include <iostream>
#include <ctime>
#include "board.h"
using namespace std;

void MCTS_getMove(Board board, int& pos, int& quad, int& rot);
void getMove(Board board, int& pos, int& quad, int& rot) {	
	pos = INVALID;
	quad = INVALID;
	rot = INVALID;

	system("cls");	
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
	printf("\n");
}

void main()
{
	int player1 = PLAYER_HUMAN;	
	int player2 = PLAYER_MCTS;
	
	//srand((unsigned int) time(0));
	//clock_t startTime = clock();	

	Board board;
	board.print();
	
	//Game loop
	int gameState = IN_PLAY;
	int player;
	for (int i = 0; gameState == IN_PLAY && i < BOARD_SPACES; i++) {
		int pos, quad, rot;
		player = (board.turn == PLAYER1)? player1 : player2;

		if (player == PLAYER_HUMAN) getMove(board, pos, quad, rot);
		else if (player == PLAYER_MCTS) MCTS_getMove(board, pos, quad, rot);
		else getMove(board, pos, quad, rot);

		board.placePin(pos);		
		board.rotate(quad, rot);		
		gameState = board.isWin();		
	}

	if (gameState == WIN_TIE || gameState == WIN_DUAL) cout << "Tie game!" << endl;
	else if (gameState == WIN_PLAYER1) cout << "Player 1 wins!" << endl;
	else if (gameState == WIN_PLAYER2) cout << "Player 2 wins!" << endl;
	
	//cout << board.toString() << endl;

	//double duration = (clock() - startTime) / (double) CLOCKS_PER_SEC;
	//printf("Time: %f sec", duration);	

	system("PAUSE");
}