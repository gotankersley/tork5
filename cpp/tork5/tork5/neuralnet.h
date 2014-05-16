#pragma once 
#include <vector>
#include <string>
#include <sstream>
#include <fstream>


//Constants
const int NN_INPUTS = 2;//36;
const int NN_HIDDEN = 2;//20;
const float BIAS = 0.0f;
const float MUTATION_RATE = 0.05;
const float LEARNING_RATE = 0.1f;

inline float randf (float min, float max) {
	return ((float(rand()) / float(RAND_MAX)) * (max - min)) + min;
}

inline float sigmoidDerivative(float y) {
	return 1 - (y * y); //Derivative of tanh
}

//Simple MLP 
struct NeuralNet {
	float hidden[NN_HIDDEN][NN_INPUTS];
	float output[NN_HIDDEN];	

	NeuralNet() {		
	}

	//Create new random neural net
	NeuralNet(bool initRandom) {
		for (int h = 0; h < NN_HIDDEN; h++) {
			for (int i = 0; i < NN_INPUTS; i++) {			
				hidden[h][i] = randf(-1, 1);
			}		
			output[h] = randf(-1, 1);
		}		
	}

	//Load from serialized neural net string
	NeuralNet(std::string serializedNN) {		
		std::istringstream iss(serializedNN);

		float weight;		
		for (int h = 0; h < NN_HIDDEN; h++) {
			for (int i = 0; i < NN_INPUTS; i++) {
				iss >> weight;
				hidden[h][i] = weight;
			}
			iss >> weight;
			output[h] = weight;
		}				
	}

	void load(std::string path) {
		std::ifstream fin;
		fin.open (path);			
		for (int h = 0; h < NN_HIDDEN; h++) {
			for (int i = 0; i < NN_INPUTS; i++) {
				fin >> hidden[h][i];				 
			}
			fin >> output[h];			 
		}
		fin.close();		
	}	

	void save(std::string path) {
		std::ofstream fout;
		fout.open (path);				
		for (int h = 0; h < NN_HIDDEN; h++) {
			for (int i = 0; i < NN_INPUTS; i++) {
				fout << hidden[h][i] << ' ';				 
			}
			fout << output[h] << ' ';			 
		}
		fout.close();		
	}	

	//Run inputs through the neural net and calculate the ouput value
	float calculate(float inputs[]) {
		
		float outputValue = BIAS;
		for (int h = 0; h < NN_HIDDEN; h++) {
			float hiddenValue = BIAS;
			for (int i = 0; i < NN_INPUTS; i++) {
				hiddenValue += (inputs[i] * hidden[h][i]);
			}

			//Activate hidden neuron - which acts as input to output neuron
			float hiddenActivation = tanh(hiddenValue);
			outputValue += (hiddenActivation * output[h]);
		}

		//Active output neuron
		return tanh(outputValue);
	}

	void backprop(float inputs[], float target) {
		//NOTE: The steps here are optmized for a NN with a single output only
		//Feedforward to get error - Done here instead of using calculate() so we can store hidden activations
		float hiddenActivations[NN_HIDDEN];

		float outputValue = BIAS;
		for (int h = 0; h < NN_HIDDEN; h++) {
			float hiddenValue = BIAS;
			for (int i = 0; i < NN_INPUTS; i++) {
				hiddenValue += (inputs[i] * hidden[h][i]);
			}

			//Activate hidden neuron - which acts as input to output neuron
			hiddenActivations[h] = tanh(hiddenValue);
			outputValue += (hiddenActivations[h] * output[h]);
		}

		//Active output neuron
		float outputActivation = tanh(outputValue);

		//Calculate output error
		float outputDelta = (target - outputActivation) * sigmoidDerivative(outputActivation);

		for (int h = 0; h < NN_HIDDEN; h++) {
			//Calculate hidden errors (This has to be done before adjusting output weights)
			float hiddenDelta = (outputDelta * output[h]) * sigmoidDerivative(hiddenActivations[h]);
			
			//Adjust output weights
			output[h] += (LEARNING_RATE * outputDelta * hiddenActivations[h]);
			//Bias?

			//Adjust hidden weights
			for (int i = 0; i < NN_INPUTS; i++) {
				hidden[h][i] += (LEARNING_RATE * hiddenDelta * inputs[i]);
				//Bias ?
			}
		}

		//return calculate(inputs);
	}

	NeuralNet clone() {
		NeuralNet newNN;
		for (int h = 0; h < NN_HIDDEN; h++) {
			for (int i = 0; i < NN_INPUTS; i++) { 		
				newNN.hidden[h][i] = hidden[h][i];				
			}
			newNN.output[h] = output[h];
		}
		return newNN;
	}
	
	//Serialize neural net
	std::string toString() {
		//Format: [hid weight 0 0] [hid weight 0 1] [output weight 0] [hid weight 1 0] [hid weight 1 1] [output weight 1]		
		std::ostringstream oss;		
		for (int h = 0; h < NN_HIDDEN; h++) {
			for (int i = 0; i < NN_INPUTS; i++) {
				oss << hidden[h][i] << ' ';
			}
			oss << output[h] << ' ';
		}
		return std::string(oss.str());
	}

	//Genetic functions
	NeuralNet combine(NeuralNet other) {
		//NOTE: Crossover chance has already been checked because it involves promoting both parents
		NeuralNet kid;
		float weight;
		for (int h = 0; h < NN_HIDDEN; h++) {
			for (int i = 0; i < NN_INPUTS; i++) { 				
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
		return kid;
	}
	
};