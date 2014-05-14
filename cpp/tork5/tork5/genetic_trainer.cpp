#include <omp.h>
#include <iostream>
#include <vector>
#include <string>
#include <fstream>
#include "gene.h"

using namespace std;

const int TOURNAMENT_SIZE = 4;
const int POOL_SIZE = 100;
const int GENERATIONS = 1000;
const int REPORT_FREQ = 1;
//const int SAVE_FREQ = 25;
const float CROSSOVER_RATE = 0.7;
const int NUM_FITNESS_GAMES = 50;
const int NUM_ELITE = 5;
const int UNFIT = -1;
const int GA_INFINTY = 1000000;


void GA_initPool(Gene* pool[]) {
	for (int p = 0; p < POOL_SIZE; p++) {
		pool[p] = new Gene(true);
    }
}

Gene* GA_select(Gene* pool[]) {
	//Use tournament style selection
	float bestFitness = -GA_INFINTY;
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

bool GA_evaluate(int g, Gene* pool[], Gene* elite[]) {
	float eliteFitnesses[NUM_ELITE];
	for (int e = 0; e < NUM_ELITE; e++) {
		eliteFitnesses[e] = -GA_INFINTY;
	}
	float worstFitness = GA_INFINTY;				
	float avgFitness = 0;		
	
	#pragma omp parallel for
	for (int p = 0; p < POOL_SIZE; p++) {	
		//Play random games as fitness function
		pool[p]->fitness = 0;
		for (int n = 0; n < NUM_FITNESS_GAMES; n++) {			
			pool[p]->setFitness();
		}
		

		//Identify metrics
		float fitness = pool[p]->fitness;
		if (fitness < worstFitness) worstFitness = fitness; //Worst
		avgFitness += fitness; //Average
		
		//Elite
		if (fitness > eliteFitnesses[0]) { //elite fitness 0 has the worst of the elite
			Gene* newElite = pool[p];
			for (int e = NUM_ELITE - 1; e >= 0; e--) { //Go backwards from best of elite to place new elite				
				if (newElite->fitness > eliteFitnesses[e]) { 
					for (int w = 0; w < e; w++) { //Bump lesser values down
						elite[w] = elite[w + 1];
						eliteFitnesses[w] = eliteFitnesses[w + 1];
					}					
					elite[e] = newElite;					
					eliteFitnesses[e] = fitness;
					break;
				}
			}
		}				
	}

	avgFitness /= POOL_SIZE;
	float bestFitness = elite[NUM_ELITE-1]->fitness;

	//Report
	if (g % REPORT_FREQ == 0) printf("%i\t|\t%f\t|\t%f\t|\t%f\n", g, bestFitness, avgFitness, worstFitness);
	if (bestFitness >= NUM_FITNESS_GAMES) return true;
	return false;
}

void GA_populate(Gene* pool[], Gene* nextPool[], Gene* elite[]) {
	//Pre-promote elite		
	for (int e = 0; e < NUM_ELITE; e++) {
		nextPool[e] = elite[e]->clone();
	}		
		
	for (int p = NUM_ELITE; p < POOL_SIZE; p++) {

		//Select parents (Tournament style)
		Gene* parent1 = GA_select(pool);
		Gene* parent2 = GA_select(pool);		

		//Combine
		float crossoverProbablity = randf(0, 1);			
			
		if (crossoverProbablity <= CROSSOVER_RATE) { //Combine includes crossover and mutation				
			nextPool[p] = parent1->combine(parent2); 
		}
		else { //Promote parents
			nextPool[p] = parent1->clone();
			p++;
			if (p < POOL_SIZE) nextPool[p] = parent2->clone();
		}
	}			
}


Gene* GA_getBest(Gene* pool[]) {
	float bestFitness = -GA_INFINTY;
	int bestGene = -1;
	for (int p = 0; p < POOL_SIZE; p++) {
		if (pool[p]->fitness > bestFitness) {
			bestFitness = pool[p]->fitness;
			bestGene = p;
		}
	}
	return pool[bestGene];
}

void GA_cleanup(Gene* pool[]) {
	for (int p = 0; p < POOL_SIZE; p++) { //Cleanup all pointers from current pool
		delete pool[p];
	}
}

//void GA_save(Gene* pool[]) {
//	ofstream fout;
//	fout.open ("nn.txt");
//	//fout << bestGene->nn.toString() << endl;
//	fout.close();
//}


void GA_train() {	

	printf("Gen\t|\tBest Fitness\t|\tAvg\t\t|\tWorst\n");	

	//Initialize (Pre-populate) pool	
	Gene* pools[2][POOL_SIZE]; //2 for current pool, and next pool
	int curPool = 0;		
	GA_initPool(pools[curPool]);

			
	//Evolve	
	for (int g = 0; g < GENERATIONS; g++) {						

		//Evaluate - Get fitness for all genes in pool
		Gene* elite[NUM_ELITE];
		if (GA_evaluate(g, pools[curPool], elite)) break; //Evaluate return true if goal reached											

		//Save
		//else if (g % SAVE_FREQ == 0) GA_save(pools[curPool]);					

		//Fill up the next pool by combining parents
		int nextPool = !curPool;
		GA_populate(pools[curPool], pools[nextPool], elite);					

		//Swap current pool with next pool
		GA_cleanup(pools[curPool]);
		curPool = !curPool; 		
	}	

	//Get best gene in pool
	Gene* best = GA_getBest(pools[curPool]);
	printf("\nBest gene: %f\n", best->fitness);
	best->nn.save("nntest.txt");

	//Cleanup
	GA_cleanup(pools[curPool]);	
}