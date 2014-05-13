#include <omp.h>
#include <iostream>
#include <vector>
#include <string>
#include <fstream>
#include "neuralnet.h"

using namespace std;

const int TOURNAMENT_SIZE = 4;
const int POOL_SIZE = 100;
const int GENERATIONS = 100;
const int REPORT_FREQ = 1;
const int SAVE_FREQ = 25;
const float CROSSOVER_RATE = 0.7;
const int NUM_FITNESS_GAMES = 50;
const int NUM_ELITE = 5;
const int UNFIT = -1;
const int GA_INFINTY = 1000000;

NeuralNet* GA_select(NeuralNet* pool[]) {
	//Use tournament style selectino
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


void GA_train() {	

	printf("Gen\t|\tBest Fitness\t|\tAvg\t|\tWorst\n");	

	//Initialize (Pre-populate) pool	
	NeuralNet* pools[2][POOL_SIZE];
	int curPool = 0;		
	for (int p = 0; p < POOL_SIZE; p++) {
		pools[curPool][p] = new NeuralNet(true);			
    }
			
	//Evolve	
	for (int g = 0; g < GENERATIONS; g++) {		
		
		//float fitnesses[NUM_OPPONENTS][POOL_SIZE];		
		//#pragma omp parallel num_threads(NUM_OPPONENTS)
		//{
		//int id = omp_get_thread_num();

		//Evaluate - Get fitness for all genes in pool				
		NeuralNet* elite[NUM_ELITE];
		for (int e = 0; e < NUM_ELITE; e++) {
			elite[e]->fitness = -GA_INFINTY;
		}
		float worstFitness = GA_INFINTY;				
		float avgFitness = 0;
		for (int p = 0; p < POOL_SIZE; p++) {	
			//Play random games as fitness function
			for (int n = 0; n < NUM_FITNESS_GAMES; n++) {
				pools[curPool][p]->playMatch();
			}

			//Identify metrics
			float fitness = pools[curPool][p]->fitness;
			if (fitness < worstFitness) worstFitness = fitness; //Worst
			avgFitness += fitness; //Average

			//Elite
			if (fitness > elite[0]->fitness) { 
				for (int e = NUM_ELITE - 1; e >= 0; e--) {
					NeuralNet* newElite = pools[curPool][p];
					if (elite[e]->fitness > newElite->fitness) { //Bump lesser values out
						NeuralNet* tmp = elite[e];
						elite[e] = newElite;
						newElite = tmp;
					}
				}
			}				
		} //end evaulate		
		avgFitness /= POOL_SIZE;

		//Report
		if (g % REPORT_FREQ == 0) printf("%i\t|\t%f\t|\t%f\n", g, elite[NUM_ELITE-1]->fitness, avgFitness, worstFitness);
							

		//Save
		/*if (g % SAVE_FREQ == 0) {
			ofstream fout;
			fout.open ("nn.txt");
			fout << bestGene->nn.toString() << endl;
			fout.close();
		}*/

		//Promote Elite
		int nextPool = !curPool;
		for (int e = 0; e < NUM_ELITE; e++) {
			pools[nextPool][e] = elite[e];
		}
		

		//Fill up the next pool by combining parents		
		for (int p = NUM_ELITE; p < POOL_SIZE; p++) {

			//Select parents (Tournament style)
			NeuralNet* parent1 = GA_select(pools[curPool]);
			NeuralNet* parent2 = GA_select(pools[curPool]);		

			//Combine
			float crossoverProbablity = randf(0, 1);			
			
			if (crossoverProbablity <= CROSSOVER_RATE) { //Combine includes crossover and mutation				
				pools[nextPool][p] = parent1->combine(parent2); 
			}
			else { //Promote parents
				pools[nextPool][p] = parent1->clone();
				p++;
				if (p < POOL_SIZE) pools[nextPool][p] = parent2->clone();
			}

		}		
		

		//Swap current pool with next pool
		for (int p = 0; p < POOL_SIZE; p++) { //Cleanup all pointers from current pool
			delete pools[curPool][p];
		}
		curPool = !curPool;
	}	

	//Get best gene in pool
	//bestFitness = -GA_INFINTY;
	//NeuralNet* bestGene;
	//for (int p = 0; p < POOL_SIZE; p++) {		
	//	if (pools[curPool][p]->fitness > bestFitness) {
	//		bestFitness = pools[curPool][p]->fitness;
	//		bestGene = pools[curPool][p];
	//	}
	//}	
	//printf("\nBest gene: %s\n", bestGene->toString().c_str());
	//for (int p = 0; p < POOL_SIZE; p++) {		
	//	delete pools[curPool][p];
	//}
}