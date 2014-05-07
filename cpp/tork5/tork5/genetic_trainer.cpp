#include <iostream>
#include <vector>
#include <string>
#include "gene.h"

using namespace std;

const float MUTATION_RATE = 0.05;
const int TOURNAMENT_SIZE = 3;
const int POOL_SIZE = 30;
const int GENERATIONS = 10;

void GA_train() {
	

	//Initialize (Pre-populate) pool
	vector<Gene> pool;
	for (int p = 0; p < POOL_SIZE; p++) {
		pool.push_back(Gene());
    }
	//elite?
	
	//Evolve
	for (int g = 0; g < GENERATIONS; g++) {  
		//Get fitness for all genes in pool
		for (int p = 0; p < POOL_SIZE; p++) {
			pool[p].getFitness();
		}

		//Select parents
		//Reproduce
	}
}