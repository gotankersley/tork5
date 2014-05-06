#pragma once 
#include <vector>

const float BIAS = 1.0f;

struct Neuron {
	std::vector<float> weights;

	Neuron(int weightCount) {
		weights.push_back(rand() % 
	}

	float activate(std::vector<float> inputs) {
		float val = BIAS;
		for (int i = 0; i < inputs.size(); i++) {
			val += (inputs[i] * weights[i]);
		}
		//return 1 / (Math.Pow(Math.E, -x) + 1); //Sigmoid
		return tanh(val); //Squash function

	}
};