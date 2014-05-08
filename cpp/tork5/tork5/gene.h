#pragma once 

#include "neuralnet.h"


struct Gene {
	NeuralNet nn;
	float fitness;	

	Gene() {
		fitness = 0;
		nn = NeuralNet(2,2);
	}

	void getFitness() {
		//Basic XOR fitness is n/4 for correct
		fitness += score(0, 0, 0);
		fitness += score(0, 1, 1);
		fitness += score(1, 0, 1);
		fitness += score(1, 1, 0);		
	}
	
	int score(int input1, int input2, int expected) {
		std::vector<float> inputs;
		inputs.push_back(input1); inputs.push_back(input2);
		float fVal = nn.evaluate(inputs);		
		int val = (val > 0)? 1 : 0;
		if (val == expected) return 1;
		else return 0;
	}
};