#include <iostream>
#include <vector>
#include <string>
#include "gene.h"

using namespace std;

const int TOURNAMENT_SIZE = 11;
const int POOL_SIZE = 10;
const int GENERATIONS = 5;
const int REPORT_FREQ = 1;
const int SAVE_FREQ = 1000;
const float CROSSOVER_RATE = 0.7;
const int NUM_OPPONENTS = 5;


int GA_select(Gene pool[]) {
	float bestFitness = UNFIT;
	int bestIndex;
	for (int t = 0; t < TOURNAMENT_SIZE; t++) {
		int r = rand() % POOL_SIZE;
		if (pool[r].fitness > bestFitness) {
			bestFitness = pool[r].fitness;
			bestIndex = r;
		}
	}
	return bestIndex;
}

void GA_train() {	

	printf("Gen\t|\tBest Fitness\n");	

	//Create testing targets (opponent NN's)
	NeuralNet opponents[NUM_OPPONENTS];
	for (int i = 0; i < NUM_OPPONENTS; i++) {
		opponents[i] = NeuralNet(true);
	}

	//Initialize (Pre-populate) pool	
	Gene pools[2][POOL_SIZE];
	int curPool = 0;	
	for (int p = 0; p < POOL_SIZE; p++) {
		pools[curPool][p] = Gene(true);	
    }
		
	//elite?
	
	//Evolve
	float bestFitness;	
	for (int g = 0; g < GENERATIONS; g++) {		

		//Evaluate - Get fitness for all genes in pool
		bestFitness = UNFIT;
		for (int p = 0; p < POOL_SIZE; p++) {			
			for (int i = 0; i < NUM_OPPONENTS; i++) {
				pools[curPool][p].playMatch(opponents[i]);
			}
			if (pools[curPool][p].fitness > bestFitness) bestFitness = pools[curPool][p].fitness;
		}
				

		//Fill up the next pool by combining parents
		int nextPool = !curPool;
		for (int p = 0; p < POOL_SIZE; p++) {
			//Select parents (Tournament style)
			Gene parent1 = pools[curPool][GA_select(pools[curPool])];
			Gene parent2 = pools[curPool][GA_select(pools[curPool])];		

			//Combine
			float opProp = randf(0, 1);
			if (opProp <= CROSSOVER_RATE) pools[nextPool][p] = parent1.combine(parent2); //Mutation included
			else {
				pools[nextPool][p] = parent1;
				p++;
				if (p < POOL_SIZE) pools[nextPool][p] = parent2;
			}

		}

		//Report
		if (g % REPORT_FREQ == 0) printf("%i\t|\t%f\n", g, bestFitness);
		//else if (g % SAVE_FREQ == 0) 
		curPool = !curPool; //Swap current pool with next pool
	}	

	//Get best gene in pool
	bestFitness = UNFIT;
	int best;
	for (int p = 0; p < POOL_SIZE; p++) {		
		if (pools[curPool][p].fitness > bestFitness) {
			bestFitness = pools[curPool][p].fitness;
			best = p;
		}
	}
	Gene bestGene = pools[curPool][best];
	printf("\nBest gene: %s\n", bestGene.nn.toString().c_str());
	
}