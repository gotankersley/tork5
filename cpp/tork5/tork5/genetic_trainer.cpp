#include <omp.h>
#include <iostream>
#include <vector>
#include <string>
#include <fstream>
#include "gene.h"

using namespace std;

const int TOURNAMENT_SIZE = 4;
const int POOL_SIZE = 100;
const int GENERATIONS = 100000;
const int REPORT_FREQ = 1;
const int SAVE_FREQ = 25;
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

int GA_switchPlayers(int curPool) {
	switch(curPool) {
		case 0: return 2;
		case 1: return 2;
		case 2: return 0;
		case 3: return 0;
	}
}
int GA_nextPool(int curPool) {
	switch(curPool) {
		case 0: return 1;
		case 1: return 0;
		case 2: return 3;
		case 3: return 2;
	}
	return -1;
}
void GA_train() {	

	printf("Gen\t|\tBest Fitness\n");	

	//Create testing targets (opponent NN's)
	NeuralNet opponents[NUM_OPPONENTS];
	for (int i = 0; i < NUM_OPPONENTS; i++) {
		opponents[i] = NeuralNet(true);
	}

	//Initialize (Pre-populate) pool	
	Gene* pools[4][POOL_SIZE];
	int curPool = 2;	//Player 2	
	int p1Pool = 0;
	for (int p = 0; p < POOL_SIZE; p++) {
		pools[curPool][p] = new Gene(true);			
		pools[p1Pool][p] = new Gene(true);	
    }
			
	//Evolve
	float bestFitness;	
	for (int g = 0; g < GENERATIONS; g++) {		

		//Evaluate - Get fitness for all genes in pool
		float fitnesses[NUM_OPPONENTS][POOL_SIZE];
		bool p2Match = (curPool >= 2)? true : false;
		#pragma omp parallel num_threads(NUM_OPPONENTS)
		{
			int id = omp_get_thread_num();
			for (int p = 0; p < POOL_SIZE; p++) {	
				if (p2Match) fitnesses[id][p] = pools[curPool][p]->playMatch2(opponents[id]);
				else fitnesses[id][p] = pools[curPool][p]->playMatch1(opponents[id]);
				
			}
		}
		bestFitness = UNFIT;
		Gene* bestGene;		
		int topCount = 0;
		for (int p = 0; p < POOL_SIZE; p++) {	
			pools[curPool][p]->fitness = 0;
			for (int i = 0; i < NUM_OPPONENTS; i++) {
				//if (curPool >= 2) pools[curPool][p]->playMatch2(opponents[i]); //Score player2
				//else pools[curPool][p]->playMatch1(opponents[i]); //Score player1
				pools[curPool][p]->fitness += fitnesses[i][p];
			}
			float fitness = pools[curPool][p]->fitness;			
			if (fitness > bestFitness) {
				bestFitness = fitness;
				bestGene = pools[curPool][p];
			}
			if (fitness >= 5) topCount++;
			
		}						

		if (g % SAVE_FREQ == 0) {
			ofstream fout;
			fout.open ("nn.txt");
			fout << bestGene->nn.toString() << endl;
			fout << opponents[0].toString() << endl;
			fout << opponents[1].toString() << endl;
			fout << opponents[2].toString() << endl;
			fout << opponents[3].toString() << endl;
			fout << opponents[4].toString() << endl;
			fout.close();
		}
		//Switch players
		if (topCount >= 10) {
			int player = (curPool > 1)? 1 : 2;
			printf ("Switching to Player %i\n", player);

			float best[5] = {UNFIT, UNFIT, UNFIT, UNFIT, UNFIT};
			int elite[5];
		
			for (int p = 0; p < POOL_SIZE; p++) {	
				if (pools[curPool][p]->fitness > best[0]) {
					best[0] = pools[curPool][p]->fitness;	
					elite[0] = p;
				}
				else if (pools[curPool][p]->fitness > best[1]) {
					best[1] = pools[curPool][p]->fitness;	
					elite[1] = p;
				}
				else if (pools[curPool][p]->fitness > best[2]) {
					best[2] = pools[curPool][p]->fitness;	
					elite[2] = p;
				}
				else if (pools[curPool][p]->fitness > best[3]) {
					best[3] = pools[curPool][p]->fitness;	
					elite[3] = p;
				}
				else if (pools[curPool][p]->fitness > best[4]) {
					best[4] = pools[curPool][p]->fitness;	
					elite[4] = p;
				}
			}
			//Elite opponents to train other player
			opponents[0] = pools[curPool][elite[0]]->nn;
			opponents[1] = pools[curPool][elite[1]]->nn;
			opponents[2] = pools[curPool][elite[2]]->nn;
			opponents[3] = pools[curPool][elite[3]]->nn;
			opponents[4] = pools[curPool][elite[4]]->nn;

			//Shift old pool if necessary - so when switching back the correct pool will be choosen		
			if (curPool % 2 != 0) {
				int oldPool = curPool - 1;
				for (int p = 0; p < POOL_SIZE; p++) {
					pools[oldPool][p] = pools[curPool][p];
					pools[curPool][p] = NULL;
				}
			}
			curPool = GA_switchPlayers(curPool);
			continue;
		}

		//Fill up the next pool by combining parents
		int nextPool = GA_nextPool(curPool);
		for (int p = 0; p < POOL_SIZE; p++) {

			//Select parents (Tournament style)
			Gene* parent1 = GA_select(pools[curPool]);
			Gene* parent2 = GA_select(pools[curPool]);		

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
		

		//Report
		if (g % REPORT_FREQ == 0) printf("%i\t|\t%f\n", g, bestFitness);
		

		//Swap current pool with next pool
		for (int p = 0; p < POOL_SIZE; p++) { //Cleanup all pointers from current pool
			delete pools[curPool][p];
		}
		curPool = GA_nextPool(curPool);		
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