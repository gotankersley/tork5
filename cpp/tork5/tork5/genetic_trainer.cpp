#include <iostream>
#include <vector>
#include <string>
#include "gene.h"

using namespace std;

const int TOURNAMENT_SIZE = 11;
const int POOL_SIZE = 1000;
const int GENERATIONS = 5;
const int REPORT_FREQ = 1;
const int SAVE_FREQ = 1000;
const float CROSSOVER_RATE = 0.7;
const int NUM_OPPONENTS = 5;


Gene* GA_select(Gene* pool[]) {
	float bestFitness = UNFIT;
	int bestIndex;
	for (int t = 0; t < TOURNAMENT_SIZE; t++) {
		int r = rand() % POOL_SIZE;
		if (pool[r]->fitness > bestFitness) {
			bestFitness = pool[r]->fitness;
			bestIndex = r;
		}
	}
	return pool[bestIndex];
}

void GA_train() {	

	printf("Gen\t|\tBest Fitness\n");	

	//Create testing targets (opponent NN's)
	NeuralNet opponents[NUM_OPPONENTS];
	for (int i = 0; i < NUM_OPPONENTS; i++) {
		opponents[i] = NeuralNet(true);
	}

	//Initialize (Pre-populate) pool	
	Gene* pools[2][POOL_SIZE];
	int curPool = 0;	
	int nextPool = !curPool;
	for (int p = 0; p < POOL_SIZE; p++) {
		pools[curPool][p] = new Gene(true);	
		//pools[nextPool][p] = NULL;
    }
		
	//elite?
	
	//Evolve
	float bestFitness;	
	for (int g = 0; g < GENERATIONS; g++) {		

		//Evaluate - Get fitness for all genes in pool
		bestFitness = UNFIT;
		for (int p = 0; p < POOL_SIZE; p++) {			
			for (int i = 0; i < NUM_OPPONENTS; i++) {
				pools[curPool][p]->playMatch(opponents[i]);
			}
			if (p % 10 == 0) printf("%i - eval\n", p);
			if (pools[curPool][p]->fitness > bestFitness) bestFitness = pools[curPool][p]->fitness;
		}
				

		//Fill up the next pool by combining parents
		nextPool = !curPool;
		for (int p = 0; p < POOL_SIZE; p++) {

			//Select parents (Tournament style)
			Gene* parent1 = GA_select(pools[curPool]);
			Gene* parent2 = GA_select(pools[curPool]);		

			//Combine
			float oppProb = randf(0, 1);			
			
			if (oppProb <= CROSSOVER_RATE) { //Combine includes crossover and mutation				
				pools[nextPool][p] = parent1->combine(parent2); 
			}
			else { //Promote parents
				pools[nextPool][p] = parent1->clone();
				p++;
				if (p < POOL_SIZE) pools[nextPool][p] = parent2->clone();
			}

		}

		//Report
		if (g % REPORT_FREQ == 0) printf("%i\t|\t%f\n", g, bestFitness);
		//else if (g % SAVE_FREQ == 0)

		//Swap current pool with next pool
		for (int p = 0; p < POOL_SIZE; p++) { //Cleanup all pointers from current pool
			delete pools[curPool][p];
		}
		curPool = !curPool; 		
	}	

	//Get best gene in pool
	bestFitness = UNFIT;
	Gene* bestGene;
	for (int p = 0; p < POOL_SIZE; p++) {		
		if (pools[curPool][p]->fitness > bestFitness) {
			bestFitness = pools[curPool][p]->fitness;
			bestGene = pools[curPool][p];
		}
	}	
	printf("\nBest gene: %s\n", bestGene->nn.toString().c_str());
	for (int p = 0; p < POOL_SIZE; p++) {		
		delete pools[curPool][p];
	}
}