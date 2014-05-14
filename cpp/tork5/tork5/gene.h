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
	
	void setFitness() { //Match vs. random player
		Board board;

		for (int i = 0; i < 18; i++) {

			//First player
			std::vector<Board> moves = (i < 3)? board.getAllNonSymMoves() : board.getAllMoves();
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