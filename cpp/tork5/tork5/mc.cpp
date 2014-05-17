#include <vector>
#include "board.h"
#include "neuralnet.h"

const int MC_SIMULATIONS = 700;
const int MC_INFINITY = 1000000;
const int MC_WIN = 1;
const int MC_LOSE = -1;
const int MC_TIE = 0;

int MC_simulate(Board board) {
	//Scoring from point of view ai (global)   
    int moveCount = bitCount(Or(board.p1, board.p2));
    bool curPlayer = board.turn;	
    for (int i = 0; i < (BOARD_SPACES - moveCount); i++) {
        //Check for wins
        int winFound = board.findWin();
        if (winFound) {
			if (board.turn != curPlayer) return MC_WIN;
			else return MC_LOSE;
		}
		else { //Block opponent win			
            board.turn = !board.turn;
            winFound = board.findWin();
			if (winFound) {
				int pos;
				int quad;
				int rot;
				board.getMoveFromMidWin(winFound, pos, quad, rot);                 
                board.turn = !board.turn;
				if (board.turn == PLAYER1) board.p1 = Xor(board.p1, POS_TO_MPOS(pos));        
				else board.p2 = Xor(board.p2, POS_TO_MPOS(pos)); //Player 2	                
				if (quad != INVALID) board.rotate(quad, rot);
            }
            else {
                board.turn = !board.turn;
                board.makeRandomMove();
            }
		}
	}
	return MC_TIE;
}


void MC_getScore(Board board, NeuralNet& nn) {
	//int moveCount = bitCount(Or(board.p1, board.p2));
	//std::vector<Board> moves = (moveCount >= 2)? board.getAllMoves() : board.getAllNonSymMoves();
	std::vector<Board> moves = board.getAllMoves();
		
	//#pragma omp parallel for	
	for (int m = 0; m < moves.size(); m++) {
		//int score = 0;
		//
		//for (int s = 0; s < MC_SIMULATIONS; s++) {
		//	score += MC_simulate(moves[m]);
		//}

		//float normScore = (((float)score / (float)MC_SIMULATIONS) * 2) - 1; //Move to range of [-1, 1]
		float inputs[NN_INPUTS];
		moves[m].toNNInputs(inputs);
		nn.backprop(inputs, moves[m].score());
	}
	//board.deriveMove(moves[bestMove], pos, quad, rot);	
}

float MC_testScore(Board board, NeuralNet& nn) {
	//int moveCount = bitCount(Or(board.p1, board.p2));
	//std::vector<Board> moves = (moveCount >= 2)? board.getAllMoves() : board.getAllNonSymMoves();
	std::vector<Board> moves = board.getAllMoves();
		
	//#pragma omp parallel for
	float mse = 0;
	for (int m = 0; m < moves.size(); m++) {
		//int score = 0;
		//
		//for (int s = 0; s < MC_SIMULATIONS; s++) {
		//	score += MC_simulate(moves[m]);
		//}

		//float normScore = (((float)score / (float)MC_SIMULATIONS) * 2) - 1; //Move to range of [-1, 1]
		float inputs[NN_INPUTS];
		moves[m].toNNInputs(inputs);
		float val = nn.calculate(inputs);
		float score = moves[m].score();
		float diff = score - val;
		mse += 0.5 * (diff * diff);
	}
	return mse;
	//board.deriveMove(moves[bestMove], pos, quad, rot);	
}
/*
void MC_getMove(Board board, int& pos, int& quad, int& rot) {	
	int winFound = board.findWin();
	if (winFound) {
		board.getMoveFromMidWin(winFound, pos, quad, rot); 
		return;
	}

	int moveCount = bitCount(Or(board.p1, board.p2));
	std::vector<Board> moves = (moveCount > 2)? board.getAllMoves() : board.getAllNonSymMoves();
	int bestScore = -MC_INFINITY;
	int bestMove;
	//#pragma omp parallel for
	for (int m = 0; m < moves.size(); m++) {
		int score = 0;
		
		for (int s = 0; s < MC_SIMULATIONS; s++) {
			score += MC_simulate(moves[m]);
		}

		if (score > bestScore) {
			bestScore = score;
			bestMove = m;
		}
	}
	board.deriveMove(moves[bestMove], pos, quad, rot);	
}*/