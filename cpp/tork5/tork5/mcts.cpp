#include <vector>
#include <ctime>
#include "Node.h"
using namespace std;

//Constants
const int MAX_ITERATIONS = 10000;
const float UCT_TUNING = 0.9f;
const int VISITS_TO_ADD_NODE = 1;
const int MIN_FAIR_PLAY = 0;
const int INFINITY = 1000000;

const int WIN_SCORE = 1;
const int LOSE_SCORE = -1;
const int TIE_SCORE = 0;


Node* MCTS_pickFinalMove(Node* root) {
	//Max visits
	int bestVisits = -INFINITY;
	Node* bestNode = NULL;
		
	for (int i = 0; i < root->kids.size(); i++) {
		Node* kid = root->kids[i];
		if (kid->visits > bestVisits) {
			bestVisits = kid->visits;
			bestNode = kid;
		}
	}
	
	if (bestNode == NULL) {
		printf("All moves lead to loss: %s\n", root->board.toString().c_str());		
		return root->kids[rand() % root->kids.size()]; //All moves lead to loss
	}
	else return bestNode;
}

void MCTS_backpropagate(Node* node, float score) {
	//Update leaf
    node->visits++;
	if (abs(score) == INFINITY) node->score = score; //Don't average score if terminal position			
	else node->score = ((node->score * (node->visits - 1)) + score) / node->visits; //Average    

    //Backpropagate from the leaf's parent up to the root, inverting the score each level due to minmax
    while (node->parent != NULL) {		
        score *= -1;
        node = node->parent;
        node->visits++;
        
        //Win
        if (score == INFINITY) node->score = INFINITY;
        
        //Loss - but all children must be checked to prove parent loss
        else if (score == -INFINITY) {
            bool loss = true;
            for (int i = 0; i < node->kids.size(); i++) {
                if (node->kids[i]->score != -INFINITY) {
                    loss = false;
                    break;
                }
            }
            if (loss) node->score = -INFINITY;
            else node->score = LOSE_SCORE; //Can't prove parent loss, so not terminal
        }
        
        //Non-terminal position, so just average score        			
		else node->score = ((node->score * (node->visits - 1)) + score) / node->visits;
    }
}

float MCTS_simulate(Node* node) {
	//Scoring from point of view of node
	Board board = node->board.clone();
	int moveCount = bitCount(Or(board.p1, board.p2));

	for (int i = 0; i < (BOARD_SPACES - moveCount); i++) {
        //Check for wins
        int winFound = board.findWin();
        if (winFound) {
            //TODO: test for dual win
            return WIN_SCORE;
        }
        
        //Make random moves
        board.makeRandomMove();   
        //board.print();
    }    
    return TIE_SCORE;
}

void MCTS_expandNode(Node* node) {
	Board board = node->board;	

    //Check for win - don't expand if we can win	    
    int winFound = board.findWin();
	if (winFound) {
		MCTS_backpropagate(node, -INFINITY); //Negative because it's from the parent's point of view	
	}

	else {

		//TODO: Handle dual wins?
    
		//Else add all possible unique moves that don't lead to a loss
		vector<Board>moves = board.getAllNonLossMoves();
    
		//Tie
		if (moves.size() == 0) {
			return MCTS_backpropagate(node, TIE_SCORE);
		}

		//Add kids
		else {
			for (int i = 0; i < moves.size(); i++) {
				node->kids.push_back(new Node(node, moves[i]));
			}
		}
	}
}

Node* MCTS_selectNode(Node* root) {
	//Traverse the tree until a leaf is reached by selecting the best UCT	
    Node* node = root;	
    while (node->kids.size() > 0) {	
		
		float bestUCT = -INFINITY;
		Node* bestNode = NULL;
		float uct;
		int parentVisits = (node->parent == NULL || node->parent->visits == 0)? 1 : node->parent->visits;
		for (int i = 0; i < node->kids.size(); i++) {
			Node* kid = node->kids[i];		
			//Make sure unvisited nodes get a chance
			if (kid->visits <= MIN_FAIR_PLAY) {
				bestNode = kid;
				break;
			
			}						
			uct =  kid->score + sqrt(abs(UCT_TUNING * log((float)parentVisits / kid->visits))); //UCT must be negative?
			if (uct > bestUCT) {
				bestUCT = uct;
				bestNode = kid;
			}
		} 

		node = bestNode;
		if (bestNode == NULL) {
			printf("No best kid found - broken select! UCT: %f, Board: %s", uct, root->board.toString().c_str());
		}
    }	
	return node;
}

Board MCTS_engine(Board board) {
	//Steps:
	//0. Pre-expansion
    //1. Selection
    //2. Expansion
    //3. Simulation
    //4. Back-propagation        
    //5. Pick final move
	clock_t startTime = clock();	
	Node root(NULL, board);	
	//Pre-expand root's children	
	vector<Board>moves = board.getAllNonLossMoves();    		
	for (int i = 0; i < moves.size(); i++) {
		root.kids.push_back(new Node(&root, moves[i]));
	}
	
	for (int i = 0; i < MAX_ITERATIONS; i++) {
		//TODO: top-level win propagation

		//Select
		Node* node = MCTS_selectNode(&root);

		//Expand
		if (node->visits >= VISITS_TO_ADD_NODE) MCTS_expandNode(node); //Expand backpropagates for terminal nodes
		else {
			//Simulate
			float score = MCTS_simulate(node);

			//Backpropagate
			MCTS_backpropagate(node, score);
		}
	}

	//Final move
	Node* finalNode = MCTS_pickFinalMove(&root);
	Board moveBoard = finalNode->board;
	int visits = finalNode->visits;
	float score = finalNode->score;
	root.Cleanup();

	//Log stats			
	double duration = (clock() - startTime) / (double) CLOCKS_PER_SEC;
	printf("Computer: Visits: %i, Score: %f, Time: %f\n", visits, score, duration);
	
	return moveBoard;
}

void MCTS_getMove(Board board, int& pos, int& quad, int& rot) {	
	int winFound = board.findWin();
	if (winFound) board.getMoveFromMidWin(winFound, pos, quad, rot); 
	else {		
		Board moveBoard = MCTS_engine(board);		
		moveBoard.print();				
		board.deriveMove(moveBoard, pos, quad, rot);						
	}	
}