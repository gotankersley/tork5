var MC_SIMULATIONS = 500;
var MC_SIM_DIST = true;
var MC_FLAT = true;
var MC_TIMEOUT = 1000;

var MC_WIN_SCORE = 1;
var MC_LOSE_SCORE = -1;
var MC_TIE_SCORE = 0;

//Class MC
function MC(board) {    
    this.board = board;	    
}

MC.prototype.getMove = function() {	
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
    
      
    var bestScore = -INFINITY;
    var bestKid = INVALID;     
	var startTime = game.player.startTime;
	//while (true) {if (performance.now() - startTime > MC_TIMEOUT) break;
    for (var i = 0; i < moves.length; i++) {
        //Run the simulations for each kid
        var scores = 0;
        for (var k = 0; k < MC_SIMULATIONS; k++) {
            scores += this.simulate(moves[i].clone());
        }
        
        if (scores >= bestScore) {
            bestScore = scores;
            bestKid = i;
        }
        
        //Populate score map
		var move = board.deriveMove(moves[i]);
        var r = ROW[move.pos];
        var c = COL[move.pos];       
		scoreMap[r][c].push({visits:MC_SIMULATIONS, score: scores});
    }	
    console.log('Best: ' + bestScore);
    var move;
    if (bestKid == INVALID) {
        alert('All moves lead to loss');
        board.makeRandomMove();        
        move = this.board.deriveMove(board); 	
    }
    else move = this.board.deriveMove(moves[bestKid]); 	
    enableScoreMap(move, moves.length * MC_SIMULATIONS);
	return move;
}

MC.prototype.simulate = function(board) {
    //Scoring from point of view ai (global)   
    var moveCount = bitCount(or(board.p1, board.p2));
    var curPlayer = board.turn;
	var movesLeft = (BOARD_SPACES - moveCount);
    for (var i = 0; i < movesLeft; i++) {
        //Check for wins
        var winFound = board.findWin();
        if (winFound) {
            //TODO: test for dual win
			if (MC_SIM_DIST) {
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
//End class MC