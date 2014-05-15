#pragma once 
#include <vector>
#include "neuralnet.h"
#include "board.h"


struct Gene {
	NeuralNet nn;
	float fitness;	

	Gene() {
	}

	Gene(bool init) {		
		fitness = 0;
		nn = NeuralNet(init);		
	}
	/*
	void setFitness() { //Match vs. random player
		Board board;

		for (int i = 0; i < 18; i++) {

			//First player
			std::vector<Board> moves = (i < 2)? board.getAllNonSymMoves() : board.getAllMoves();
			float bestScore = -1000000;
			int bestMove;
			for (int m = 0; m < moves.size(); m++) {
				float inputs[NN_INPUTS];
				moves[m].toNNInputs(inputs);
				float score = nn.calculate(inputs);
				if (score > bestScore) {
					bestScore = score;
					bestMove = m;
				}
			}
			board = moves[bestMove];
			if (board.isWin()) {							
				fitness += 1.0f;				
				return;
			}
						
			//Second player
			int winFound = board.findWin();						
			if (winFound) {
				fitness += -1.0f;
				return;				
			}
			board.makeRandomMove();
		}						
	}*/

	/*
	void setFitness() { //Match vs. random player
		Board board;

		for (int i = 0; i < 18; i++) {

			//First player
			int winFound = board.findWin();						
			if (winFound) {
				fitness += -1.0f;
				return;				
			}
			board.makeRandomMove();

			//Second player
			std::vector<Board> moves = (i < 2)? board.getAllNonSymMoves() : board.getAllMoves();
			float bestScore = -1000000;
			int bestMove;
			for (int m = 0; m < moves.size(); m++) {
				float inputs[NN_INPUTS];
				moves[m].toNNInputs(inputs);
				float score = nn.calculate(inputs);
				if (score > bestScore) {
					bestScore = score;
					bestMove = m;
				}
			}
			board = moves[bestMove];
			if (board.isWin()) {							
				fitness += 1.0f;				
				return;
			}						
		}						
	}
	*/
	/*void setFitness() { //Match vs. heuristic
		Board board;

		for (int i = 0; i < 18; i++) {

			//First player
			std::vector<Board> moves = (i < 2)? board.getAllNonSymMoves() : board.getAllMoves();
			float bestScore = -1000000;
			int bestMove;
			for (int m = 0; m < moves.size(); m++) {
				float inputs[NN_INPUTS];
				moves[m].toNNInputs(inputs);
				float score = nn.calculate(inputs);
				if (score > bestScore) {
					bestScore = score;
					bestMove = m;
				}
			}
			board = moves[bestMove];
			if (board.isWin()) {							
				fitness += (18 - i);				
				return;
			}
						
			//Second player
			int winFound = board.findWin();						
			if (winFound) {
				fitness += i - 18;
				return;				
			}
			if (i < 3) board.makeRandomMove();
			else { //Handicap
				moves = (i < 3)? board.getAllNonSymMoves() : board.getAllMoves();
				bestScore = -10000000;
				int bestMove;
				for (int m = 0; m < moves.size(); m++) {								
					int score = moves[m].score();
					if (score > bestScore) {
						bestScore = score;
						bestMove = m;
					}
				}
				board = moves[bestMove];
			}
		}						
	}*/
	
	void setFitness(int gameId) { //Match vs. heuristic
		Board board;
		std::vector<Board> moves;
		float bestScore;
		for (int i = 0; i < 18; i++) {

			//First player
			int winFound = board.findWin();						
			if (winFound) {
				fitness += i - 18;
				return;				
			}
			if (i < 1) {
				if (gameId == 0) board.p1 = 0x10;
				else if (gameId == 1) board.p1 = 0x8000;
				else if (gameId == 2) board.p1 = 0x100000;
				else if (gameId == 3) board.p1 = 0x8000000;
				else if(gameId == 4) board.p1 = 0x4;
				else board.makeRandomMove();
			}
			else { //Handicap
				std::vector<Board> moves = (i < 3)? board.getAllNonSymMoves() : board.getAllMoves();
				bestScore = -10000000;
				int bestMove;
				for (int m = 0; m < moves.size(); m++) {								
					int score = moves[m].score();
					if (score > bestScore) {
						bestScore = score;
						bestMove = m;
					}
				}
				board = moves[bestMove];
			}
			
						
			//Second player
			//moves = (i < 2)? board.getAllNonSymMoves() : board.getAllMoves();
			moves = board.getAllMoves();
			bestScore = -1000000;
			int bestMove;
			for (int m = 0; m < moves.size(); m++) {
				float inputs[NN_INPUTS];
				moves[m].toNNInputs(inputs);
				float score = nn.calculate(inputs);
				if (score > bestScore) {
					bestScore = score;
					bestMove = m;
				}
			}
			board = moves[bestMove];
			if (board.isWin()) {							
				fitness += 18 - i;
				return;
			}
		}						
	}
	Gene* combine(Gene* other) {
		Gene* kid = new Gene();		
		kid->fitness = 0;
		kid->nn = nn.combine(other->nn);		
		
		return kid;
	}

	Gene* clone() {
		Gene* newGene = new Gene();
		newGene->fitness = fitness;
		newGene->nn = nn.clone();
		return newGene;
	}
};