#pragma once 
#include <vector>
#include "neuralnet.h"
#include "board.h"

const float GENE_WIN = 1.0f;
const float GENE_TIE = 0.5f;
const float GENE_LOSE = 0.0f;
const float GENE_INFINITY = 10000;


struct Gene {
	NeuralNet nn;
	float fitness;	

	Gene() {		
	}

	Gene(bool init) {		
		fitness = 0;
		nn = NeuralNet(init);		
	}
	
	float playMatch() {
		Board board;

		for (int i = 0; i < 18; i++) {

			//First player
			std::vector<Board> moves = board.getAllMoves();
			float bestScore = -GENE_INFINITY;
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
			int winFound = board.findWin();
			if (winFound) {
				//fitness += GENE_WIN;
				//return;
				return GENE_WIN;
			}
			

			//Second player
			bestScore = -GENE_INFINITY;
			moves = board.getAllMoves();
			for (int m = 0; m < moves.size(); m++) {
				float inputs[NN_INPUTS];
				moves[m].toNNInputs(inputs);
				float score = opponent.calculate(inputs);
				if (score > bestScore) {
					bestScore = score;
					bestMove = m;
				}
			}
			board = moves[bestMove];
			winFound = board.findWin();
			if (winFound) {
				//fitness += GENE_LOSE;
				//return;
				return GENE_LOSE;
			}

		}		
		//fitness += GENE_TIE;
		return GENE_TIE;
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