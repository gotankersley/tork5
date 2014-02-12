#pragma once 
#include <string>
#include "types.h"
#include "constants.h"
#include "macros.h"
#include "masks.h"


struct Board {
	uint64 p1;
	uint64 p2;
	bool turn;

	Board() {
		p1 = INITIAL;
		p2 = INITIAL;
		turn = PLAYER1;
	}

	int findWin() {
		//Check if there are enough pins on the board for a win   
		uint64 board = (turn == PLAYER1)? p1 : p2;
		int count = bitCount(board);
		if (count < 4) return false;     
	
		uint64 avail = Not(Or(p1, p2));
		if (!avail) return false; 
		
		for (int i = 0; i < 70; i++) { //LONG_MID_WINS {
			uint64 mid = LONG_MID_WINS[i];
			uint64 combinedMid = And(board, mid);
			if (combinedMid == mid) { //4 in a row, need one available, or 5+ in a row that just needs to be turned
				if (And(avail, LONG_SPAN_WINS[i]) || And(board, LONG_SPAN_WINS[i])) return i + 1;
			}
			else if (bitCount(combinedMid) == 3) { //3 out of 4 in mid, need 1 of the spans, and one availble 
				if (And(board, LONG_SPAN_WINS[i]) && And(avail, mid)) return i + 1;  
			}        
		}    
		for (int i = 0; i < 22; i++ ){ //SHORT_WINS
			uint64 win = SHORT_WINS[i];
			uint64 combined = And(board, win);
			if (combined == win) return i + 71;  //Win just with rotation
			else if (bitCount(combined) == 4 && And(avail, win)) return i + 71;
		}
		
		return false;
	}

	bool deriveMove(Board after, int& pos, int& quad, int& rot) {
		//Derive the move (i.e. pin position and quad rotation) that was made by looking at the difference 
		//between a board state before and after the move was made. 
	
		//Note: there can be multiple moves that result in the same after state (e.g. rotating quad centers), 
		//so this just picks the first one it finds
		pos = INVALID;
		quad = INVALID;
		rot = INVALID;

		uint64 beforeBoard;
		uint64 beforeOpp;
		uint64 afterBoard;
		uint64 afterOpp;
		if (turn == PLAYER1) {
			beforeBoard = p1;
			beforeOpp = p2;
			afterBoard = after.p1;
			afterOpp = after.p2;
		}
		else {
			beforeBoard = p2;
			beforeOpp = p1;
			afterBoard = after.p2;
			afterOpp = after.p1;    
		}
		int afterCount = bitCount(afterBoard);	
	
		//Try all 8 possible quad rotations to look for one that is only one bit different after rotation
		for (int i = 0; i < ALL_ROTATIONS; i++) {
			int q = i/2;
			int r = i % 2;
			uint64 rotatedBoard = rotateQuad(beforeBoard, q, r);
			uint64 rotatedOpp = rotateQuad(beforeOpp, q, r);
			uint64 combinedBoard = And(rotatedBoard, afterBoard);		
			if (afterCount - bitCount(combinedBoard) == 1 && (rotatedOpp == afterOpp)) {
				uint64 reverseRotated = rotateQuad(afterBoard, q, !r); //Rotate after board in reverse to get position
				pos = MPOS_TO_POS(Xor(beforeBoard, reverseRotated));
				quad = q;
				rot = r;
				return true;
			}
		}
	
		//See if there is a move with no rotation (win)
		uint64 combinedBoard = And(beforeBoard, afterBoard);    
		if (afterCount - bitCount(combinedBoard) == 1 && (beforeOpp == afterOpp)) {
			pos = MPOS_TO_POS(Xor(beforeBoard, afterBoard));
			return true;						
		}
		return false;
	}

	Board clone() {
		Board newBoard;
		newBoard.p1 = p1;
		newBoard.p2 = p2;
		newBoard.turn = turn;
		return newBoard;
	}

	void print() {  				
		for (int r = 0; r < ROW_SPACES; r++) {
			if (r == 3) printf("-------\n");
			for (int c = 0; c < COL_SPACES; c++) {            
				if (c == 3) printf("|");
				int pos = POS[r][c];     
				uint64 mpos = POS_TO_MPOS[pos];            
				char space = ':';
				if (And(p1, mpos)) space = 'X';
				else if (And(p2, mpos)) space = 'O';
                printf("%c", space);				
			}
			printf("\n");       
		}		
	}


	std::string toString() {		
		char buffer[100];
		sprintf(buffer, "0x%I64u, 0x%I64u, %i", p1, p2, turn);
		return buffer;
	}
};

