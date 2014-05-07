#pragma once 
#include <vector>
#include <string>
#include <sstream>

const float BIAS = 1.0f;

struct Neuron {
	std::vector<float> weights;

	Neuron(int numInputs) {
		for (int i = 0; i < numInputs; i++) {
			weights.push_back((rand() % 2) -1); //Range of [-1,1]
		}
	}

	Neuron(std::vector<float> initialWeights) {
		for (int i = 0; i < initialWeights.size(); i++) {
			weights.push_back(initialWeights[i]); //Range of [-1,1]
		}
	}

	float activate(std::vector<float> inputs) {
		float val = BIAS;
		for (int i = 0; i < inputs.size(); i++) {
			val += (inputs[i] * weights[i]);
		}
		//return 1 / (Math.Pow(Math.E, -x) + 1); //Sigmoid
		return tanh(val); //Squash function

	}

	std::string toString() {	
		std::ostringstream ss;					
		for (int i = 0; i < weights.size(); i++) {
			ss << weights[i] << ' ';
		}
		return std::string(ss.str());
	}
};