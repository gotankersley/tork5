#pragma once 
#include <vector>
#include "board.h"

struct Node
{
	int visits;
	float score;	
	Board board;
	Node* parent;
	std::vector<Node*> kids;

	Node(Node* parentNode, Board boardState)
	{
		visits = 0;
		score = 0;		
		board = boardState;
		parent = parentNode;
		//kids.reserve(MAX_MOVES);		
	}

	void Cleanup() //Recursive
	{				
		if (kids.size() == 0)
		{
			delete this;
			return;
		}
		for(unsigned int i = 0; i < kids.size(); i++)
		{
			kids[i]->Cleanup();
		}
	}
};