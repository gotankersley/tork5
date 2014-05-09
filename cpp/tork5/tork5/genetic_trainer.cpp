#include <iostream>
#include <vector>
#include <string>
#include "gene.h"

using namespace std;

const int TOURNAMENT_SIZE = 3;
const int POOL_SIZE = 30;
const int GENERATIONS = 50;
const float CROSSOVER_RATE = 0.7;
const int UNFIT = -1;
const int INVALID = -1;

int GA_select(Gene pool[]) {
	float bestFitness = UNFIT;
	int bestIndex = INVALID;
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
	float bestFitness = UNFIT;	
	//Initialize (Pre-populate) pool	
	Gene pools[2][POOL_SIZE];
	int curPool = 0;	
	for (int p = 0; p < POOL_SIZE; p++) {
		pools[curPool][p] = Gene(true);
		if (pools[curPool][p].fitness > bestFitness) bestFitness = pools[curPool][p].fitness;
    }
	
	printf("-1\t|\t%f\n", bestFitness);	
	//elite?
	
	//Evolve
	bool solutionFound = false;
	Gene solution;
	for (int g = 0; g < GENERATIONS; g++) {		

		//Get fitness for all genes in pool
		bestFitness = UNFIT;
		for (int p = 0; p < POOL_SIZE; p++) {			
			pools[curPool][p].getFitness();
			if (pools[curPool][p].fitness >= 4) {							
				solution = pools[curPool][p];
				solutionFound = true;
				break;			
			}
			else if (pools[curPool][p].fitness > bestFitness) bestFitness = pools[curPool][p].fitness;
		}
		
		if (solutionFound) break;

		//Fill up the next pool by combining parents
		int nextPool = !curPool;
		for (int p = 0; p < POOL_SIZE; p++) {
			//Select parents (Tournament style)
			Gene parent1 = pools[curPool][GA_select(pools[curPool])];
			Gene parent2 = pools[curPool][GA_select(pools[curPool])];		

			//Combine
			float opProp = randf(0, 1);
			if (opProp <= CROSSOVER_RATE) pools[nextPool][p] = parent1.combine(parent2);
			else {
				pools[nextPool][p] = parent1;
				p++;
				pools[nextPool][p] = parent2;
			}

		}

		//Report
		printf("%i\t|\t%f\n", g, bestFitness);
		
		curPool = !curPool; //Swap current pool with next pool
	}	

	if (solutionFound) printf("Solution found!: %s\n", solution.nn.toString().c_str());
	else printf("No solution found...\n");
}