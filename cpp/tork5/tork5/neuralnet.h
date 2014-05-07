#pragma once 
#include <vector>
#include <string>
#include <sstream>
#include "neuron.h"

//Simple MLP
struct NeuralNet {
	int numInputs;
	std::vector<Neuron> hiddenNeurons;
	Neuron outputNeuron;

	NeuralNet(int numberOfInputs, int numberOfHidden) {
		numInputs = numberOfInputs;
		for (int i = 0; i < numberOfHidden; i++) {
			hiddenNeurons.push_back(Neuron(numInputs));
		}

	}

	NeuralNet(int numberOfInputs, int numberOfHidden, std::string nnString) {
		numInputs = numberOfInputs;
		std::istringstream iss(nnString);
		int i = 0;
		float weight;
		std::vector<float> weights;
		for (int i = 0; i < numInputs; i++) {
			std::vector<float> weights;
			for (int h = 0; h < numberOfHidden; h++) {
				iss >> weight;
				weights.push_back(weight);
			}
			hiddenNeurons.push_back(Neuron(weights));
		}	
		std::vector<float> weights;
		for (int h = 0; h < numberOfHidden; h++) {
			iss >> weight;
			weights.push_back(weight);
		}
		outputNeuron = Neuron(weights);
	}

	void evaluate(std::vector<float> inputs) {
		std::vector<float> hiddenValues;
		for (int i = 0; i < hiddenNeurons.size(); i++) {
			hiddenValues.push_back(hiddenNeurons[i].activate(inputs));
		}
		float outputValue = outputNeuron.activate(hiddenValues);
	}
	
	std::string toString() {
		//Serialize a NN with the format: [hid weight 0 0] [hid weight 0 1] [hid weight 1 0] [hid weight 1 1]...[output weight 0] [output weight 1]
		std::string output = "";
		for (int i = 0; i < hiddenNeurons.size(); i++) {
			output += hiddenNeurons[i].toString();
		}
		output += outputNeuron.toString();
		return output;
	}
};