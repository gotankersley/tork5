#include <iostream>
#include <vector>
#include <string>
#include "gene.h"

using namespace std;

const float MUTATION_RATE = 0.05;
const int TOURNAMENT_SIZE = 3;
const int POOL_SIZE = 30;
const int GENERATIONS = 10;
const int UNFIT = -1;

int GA_select(vector<Gene>& pool) {
	float bestFitness = UNFIT;
	int bestIndex = -1;
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
	

	//Initialize (Pre-populate) pool
	vector<Gene> pool;
	for (int p = 0; p < POOL_SIZE; p++) {
		pool.push_back(Gene());
    }
	//elite?
	
	//Evolve
	for (int g = 0; g < GENERATIONS; g++) {
		vector<Gene> nextPool;

		//Get fitness for all genes in pool
		for (int p = 0; p < POOL_SIZE; p++) {
			pool[p].getFitness();
		}

		//Select parents (Tournament style)
		Gene parent1 = pool[GA_select(pool)];
		Gene parent2 = pool[GA_select(pool)];

		//Combine
	}
}