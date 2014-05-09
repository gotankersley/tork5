#pragma once 
#include <vector>
#include "neuralnet.h"


struct Gene {
	NeuralNet nn;
	float fitness;	

	Gene() {		
	}

	Gene(bool init) {		
		nn = NeuralNet(2,2);
		getFitness();
	}

	void getFitness() {
		//Basic XOR fitness is n/4 for correct
		fitness = 0;
		fitness += score(0, 0, 0);
		fitness += score(0, 1, 1);
		fitness += score(1, 0, 1);
		fitness += score(1, 1, 0);		
	}
	
	int score(int input1, int input2, int expected) {
		std::vector<float> inputs;
		inputs.push_back(input1); 
		inputs.push_back(input2);
		float fVal = nn.evaluate(inputs);		
		int val = (fVal > 0)? 1 : 0;
		if (val == expected) return 1;
		else return 0;
	}

	Gene combine(Gene other) {
		Gene kid;		
		kid.fitness = 0;
		kid.nn = nn.combine(other.nn);		
		
		return kid;
	}
};