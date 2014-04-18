var MC2_ITERATIONS = 100;
var MC2_SIM_DIST = false;


//Class MC2
function MC2(board) {    
    this.board = board;	    
}

MC2.prototype.getMove = function() {	
    var board = this.board.clone();    
    
	//See if win available
	var winFound = board.findWin();
	if (winFound) {        
		scoreEnabled = false;
		return board.getMoveFromMidWin(winFound);                
	}	
    
    initScoreMap();	
    
    //Loop through each of the children to run the simulations    
    var moves = board.getAllNonLossMoves();           
	
	var scores = [];
	for (var m = 0; m < moves.length; m++) {
		scores.push(0);
	}
		
	var lastAvg;
	for (var i = 0; i < MC2_ITERATIONS; i++) {
		var avg = 0;
		for (var m = 0; m < moves.length; m++) {
			//Run a simulation for board state			
			scores[m] += this.simulate(moves[m].clone());
			avg += scores[m];		
			if (i > (MC2_ITERATIONS/2) && scores[m] < lastAvg) {
			
			}
		}
		lastAvg = avg / moves.length;
	}
	
	//Pick best score
	var bestScore = -INFINITY;
    var bestMove = INVALID;     
	for (var m = 0; m < moves.length; m++) {
	
		if (scores[m] >= bestScore) {
			bestScore = scores[m];
			bestMove = m;
		}
		//Populate score map
		var move = board.deriveMove(moves[m]);
		var r = ROW[move.pos];
		var c = COL[move.pos];       
		scoreMap[r][c].push({visits:MC2_ITERATIONS, score: scores[m].toFixed(2)});
	}
			
			
    var move;
    if (bestMove == INVALID) {        
        board.makeRandomMove();        
        move = this.board.deriveMove(board); 	
    }
    else move = this.board.deriveMove(moves[bestMove]); 	
    enableScoreMap(move, moves.length * MC2_ITERATIONS);
	return move;
}

MC2.prototype.simulate = function(board) {
    //Scoring from point of view ai (global)   
    var moveCount = bitCount(or(board.p1, board.p2));
    var curPlayer = board.turn;
	var movesLeft = (BOARD_SPACES - moveCount);
    for (var i = 0; i < movesLeft; i++) {
        //Check for wins
        var winFound = board.findWin();
        if (winFound) {
            //TODO: test for dual win
			if (MC2_SIM_DIST) {
				var winScalar;
				if (board.turn != curPlayer) winScalar = MC_WIN_SCORE;
				else winScalar = MC_LOSE_SCORE;				
				return ((movesLeft - i)/movesLeft) * winScalar;
			}
			else {
				if (board.turn != curPlayer) return MC_WIN_SCORE;
				else return MC_LOSE_SCORE;	
			}
        }
        
        //Make random moves
        board.makeRandomMove();           
    }    
    return MC_TIE_SCORE;
}
//End class MC2