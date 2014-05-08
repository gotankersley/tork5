#pragma once 
#include <vector>
#include <string>
#include <sstream>
#include "neuron.h"

const float MUTATION_RATE = 0.05;

//Simple MLP
struct NeuralNet {
	int numInputs;
	std::vector<Neuron> hiddenNeurons;
	Neuron outputNeuron;	

	NeuralNet() {
		numInputs = 0;
	}

	NeuralNet(int numberOfInputs, int numberOfHidden) {
		numInputs = numberOfInputs;
		for (int i = 0; i < numberOfHidden; i++) {
			hiddenNeurons.push_back(Neuron(numInputs));
		}		
		outputNeuron = Neuron(numberOfHidden);
	}


	NeuralNet(int numberOfInputs, int numberOfHidden, std::string nnString) {
		numInputs = numberOfInputs;
		std::istringstream iss(nnString);
		int i = 0;
		float weight;		
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

	NeuralNet combine(NeuralNet other) {
		NeuralNet newNet;
		newNet.numInputs = numInputs;		
		for (int i = 0; i < numInputs; i++) {			
			std::vector<float> weights;
			for (int k = 0; k < numInputs; k++) {
				float weight;
				if (randf(0, 1) <= MUTATION_RATE) weight = randf(-1, 1);  //Mutation					
				else if (rand() % 2 != 0) weight = hiddenNeurons[i].weights[k]; //Crossover from self
				else weight = other.hiddenNeurons[i].weights[k]; //Crossover from other
				weights.push_back(weight);
			}
			newNet.hiddenNeurons.push_back(Neuron(weights));
		}			
		
		std::vector<float> weights;
		for (int i = 0; i < hiddenNeurons.size(); i++) {									
			float weight;
			if (randf(0, 1) <= MUTATION_RATE) weight = randf(-1, 1);  //Mutation
			else if (rand() % 2 != 0) weight = outputNeuron.weights[i]; //Crossover from self
			else weight = other.outputNeuron.weights[i]; //Crossover from other
			weights.push_back(weight);			
			newNet.outputNeuron = Neuron(weights);
		}	

		return newNet;
	}

	float evaluate(std::vector<float> inputs) {
		std::vector<float> hiddenValues;
		for (int i = 0; i < hiddenNeurons.size(); i++) {
			hiddenValues.push_back(hiddenNeurons[i].activate(inputs));
		}
		return outputNeuron.activate(hiddenValues);
	}
	
	std::string toString() {
		//Serialize a NN with the format: [hid weight 0 0] [hid weight 0 1] [hid weight 1 0] [hid weight 1 1]...[output weight 0] [output weight 1]
		//e.g. NN(2,2,1) = 0.127171 0.617481 -0.0402539 0.791925 0.49321 0.717887
		std::string output = "";
		for (int i = 0; i < hiddenNeurons.size(); i++) {
			output += hiddenNeurons[i].toString();
		}
		output += outputNeuron.toString();
		return output;
	}
};