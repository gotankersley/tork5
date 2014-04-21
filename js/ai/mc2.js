var MC2_ITERATIONS = 10000;
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
	var bestScore = -INFINITY;
	var bestKid = INVALID;
	var moves = board.getAllMoves();
	for (var m = 0; m < moves.length; m++) {		
		var simScore = this.simulate(moves[m]);
		if (simScore > bestScore) {
			bestScore = simScore;
			bestKid = m;
		}
		
		//Populate score map
		var move = board.deriveMove(moves[m]);
        var r = ROW[move.pos];
        var c = COL[move.pos];       
		scoreMap[r][c].push({visits:1, score:simScore});
	}	
    
    if (bestKid == INVALID) {
        board.makeRandomMove();        
        move = this.board.deriveMove(board); 	
    }
    else move = this.board.deriveMove(moves[bestKid]); 	
    enableScoreMap(move, moves.length);
	return move;
}

MC2.prototype.simulate = function(board) {
    //Scoring from point of view ai (global)   
    var moveCount = bitCount(or(board.p1, board.p2));
    var curPlayer = board.turn;
	var movesLeft = (BOARD_SPACES - moveCount);
    for (var i = 0; i < movesLeft; i++) {
        var bestScore = -INFINITY;
        var bestKid = INVALID;
        var moves = board.getAllMoves();
        for (var m = 0; m < moves.length; m++) {		
            var score = board.score();
            if (score >= INFINITY) {    //Win
				if (board.turn != curPlayer) return score;
				else return -score;
            }            
            else if (score > bestScore) {
                bestScore = score;
                bestKid = m;
            }
        }  
        if (bestKid == INVALID) -INFINITY;
        else board = moves[bestKid];
    }    
    return MC_TIE_SCORE;
}
//End class MC2