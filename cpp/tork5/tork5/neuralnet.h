#pragma once 
#include <vector>
#include <string>
#include <sstream>
#include <fstream>


//Constants
const int NN_INPUTS = 36;
const int NN_HIDDEN = 20;
const float MUTATION_RATE = 0.05;
const float LEARNING_RATE = 0.1f;

//Assumptions
// - There will be only 1 output node
// - There is a bias on the input, and hidden layers with a value of 1

inline float randf (float min, float max) {
	return ((float(rand()) / float(RAND_MAX)) * (max - min)) + min;
}

inline float sigmoidDerivative(float y) {
	return 1 - (y * y); //Derivative of tanh
}

//Simple MLP 
struct NeuralNet {
	float hidden[NN_HIDDEN][NN_INPUTS + 1]; //+1 for biases
	float output[NN_HIDDEN + 1];	

	NeuralNet() {		
	}

	//Create new random neural net
	NeuralNet(bool initRandom) {
		for (int h = 0; h < NN_HIDDEN; h++) {
			for (int i = 0; i < NN_INPUTS + 1; i++) {			
				hidden[h][i] = randf(-1, 1);
			}		
			output[h] = randf(-1, 1);
		}		
		output[NN_HIDDEN] = randf(-1, 1); //Bias weight
	}

	//Load from serialized neural net string
	NeuralNet(std::string serializedNN) {		
		std::istringstream iss(serializedNN);
			
		for (int h = 0; h < NN_HIDDEN; h++) {
			for (int i = 0; i < NN_INPUTS + 1; i++) {
				iss >> hidden[h][i];				 
			}
			iss >> output[h];			 
		}		
		iss >> output[NN_HIDDEN];
	}

	void load(std::string path) {
		std::ifstream fin;
		fin.open (path);			
		for (int h = 0; h < NN_HIDDEN; h++) {
			for (int i = 0; i < NN_INPUTS + 1; i++) {
				fin >> hidden[h][i];				 
			}
			fin >> output[h];			 
		}
		fin >> output[NN_HIDDEN];
		fin.close();		
	}	

	void save(std::string path) {
		std::ofstream fout;
		fout.open (path);				
		for (int h = 0; h < NN_HIDDEN; h++) {
			for (int i = 0; i < NN_INPUTS + 1; i++) {
				fout << hidden[h][i] << ' ';				 
			}
			fout << output[h] << ' ';			 
		}
		fout << output[NN_HIDDEN];
		fout.close();		
	}	

	//Run inputs through the neural net and calculate the ouput value
	float calculate(float inputs[]) {
		
		float outputValue = 0;
		for (int h = 0; h < NN_HIDDEN; h++) {
			float hiddenValue = 0;
			for (int i = 0; i < NN_INPUTS; i++) {
				hiddenValue += (inputs[i] * hidden[h][i]);
			}
			hiddenValue += hidden[h][NN_INPUTS]; //Bias

			//Activate hidden neuron - which acts as input to output neuron
			float hiddenActivation = tanh(hiddenValue);
			outputValue += (hiddenActivation * output[h]);
		}
		outputValue += output[NN_HIDDEN]; //Bias;

		//Active output neuron
		return tanh(outputValue);
	}

	void backprop(float inputs[], float target) {
		//NOTE: The steps here are optmized for a NN with a single output only
		//Feedforward to get error - done here instead of using calculate() so we can store hidden activations
		float hiddenActivations[NN_HIDDEN];

		float outputValue = 0;
		for (int h = 0; h < NN_HIDDEN; h++) {
			float hiddenValue = 0;
			for (int i = 0; i < NN_INPUTS; i++) {
				hiddenValue += (inputs[i] * hidden[h][i]);
			}
			hiddenValue += hidden[h][NN_INPUTS]; //Bias

			//Activate hidden neuron - which acts as input to output neuron
			hiddenActivations[h] = tanh(hiddenValue);
			outputValue += (hiddenActivations[h] * output[h]);
		}
		outputValue += output[NN_HIDDEN]; //Bias

		//Active output neuron
		float outputActivation = tanh(outputValue);

		//Calculate output error
		float outputDelta = (target - outputActivation) * sigmoidDerivative(outputActivation);

		for (int h = 0; h < NN_HIDDEN; h++) {
			//Calculate hidden errors (This has to be done before adjusting output weights)
			float hiddenDelta = (outputDelta * output[h]) * sigmoidDerivative(hiddenActivations[h]);
			
			//Adjust output weights
			output[h] += (LEARNING_RATE * outputDelta * hiddenActivations[h]);
			output[NN_HIDDEN] += (LEARNING_RATE * outputDelta); //Bias

			//Adjust hidden weights
			for (int i = 0; i < NN_INPUTS; i++) {
				hidden[h][i] += (LEARNING_RATE * hiddenDelta * inputs[i]);				
			}
			hidden[h][NN_INPUTS] += (LEARNING_RATE * hiddenDelta); //Bias
		}

		//return calculate(inputs);
	}

	NeuralNet clone() {
		NeuralNet newNN;
		for (int h = 0; h < NN_HIDDEN; h++) {
			for (int i = 0; i < NN_INPUTS + 1; i++) { 		
				newNN.hidden[h][i] = hidden[h][i];				
			}
			newNN.output[h] = output[h];
		}
		newNN.output[NN_HIDDEN] = output[NN_HIDDEN]; //Bias
		return newNN;
	}
	
	//Serialize neural net
	std::string toString() {
		//Format: [hid 0 0] [hid 0 1] [bias] [out 0] [hid 1 0] [hid 1 1] [bias] [out 1] [bias]		
		std::ostringstream oss;		
		for (int h = 0; h < NN_HIDDEN; h++) {
			for (int i = 0; i < NN_INPUTS + 1; i++) {
				oss << hidden[h][i] << ' ';
			}
			oss << output[h] << ' ';
		}
		oss << output[NN_HIDDEN]; //Bias
		return std::string(oss.str());
	}

	//Genetic functions
	NeuralNet combine(NeuralNet other) {
		//NOTE: Crossover chance has already been checked because it involves promoting both parents
		NeuralNet kid;
		float weight;
		for (int h = 0; h < NN_HIDDEN; h++) {
			for (int i = 0; i < NN_INPUTS + 1; i++) { 				
				//Hidden weights
				if (randf(0, 1) <= MUTATION_RATE) weight = randf(-1, 1);  //Mutation					
				else if (rand() % 2 != 0) weight = hidden[h][i]; //Crossover from self
				else weight = other.hidden[h][i]; //Crossover from other
				kid.hidden[h][i] = weight;
			}

			//Output weights
			if (randf(0, 1) <= MUTATION_RATE) weight = randf(-1, 1);  //Mutation					
			else if (rand() % 2 != 0) weight = output[h]; //Crossover from self
			else weight = other.output[h]; //Crossover from other
			kid.output[h] = weight;
		}
		//Output bias
		if (randf(0, 1) <= MUTATION_RATE) weight = randf(-1, 1);  //Mutation					
		else if (rand() % 2 != 0) weight = output[NN_HIDDEN]; //Crossover from self
		else weight = other.output[NN_HIDDEN]; //Crossover from other
		kid.output[NN_HIDDEN] = weight;
		return kid;
	}
	
};