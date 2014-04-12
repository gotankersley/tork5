var MC_SIMULATIONS = 500;
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
		return board.getMoveFromMidWin(winFound);                
	}	
    
    //Loop through each of the children to run the simulations
    var moves = board.getAllNonLossMoves();    
    //var simScores = [];
    var bestScore = -INFINITY;
    var bestKid = INVALID;
    for (var i = 0; i < moves.length; i++) {
        //Run the simulations for each kid
        var scores = 0;
        for (var k = 0; k < MC_SIMULATIONS; k++) {
            scores += this.simulate(moves[i].clone());
        }
        //console.log(i, ': ', scores);
        if (scores >= bestScore) {
            bestScore = scores;
            bestKid = i;
        }
    }	
    console.log('Best: ' + bestScore);
    var move;
    if (bestKid == INVALID) {
        alert('All moves lead to loss');
        board.makeRandomMove();        
        move = this.board.deriveMove(board); 	
    }
    else move = this.board.deriveMove(moves[bestKid]); 	
	return move;
}

MC.prototype.simulate = function(board) {
    //Scoring from point of view ai (global)   
    var moveCount = bitCount(or(board.p1, board.p2));
    var curPlayer = board.turn;
    for (var i = 0; i < (BOARD_SPACES - moveCount); i++) {
        //Check for wins
        var winFound = board.findWin();
        if (winFound) {
            //TODO: test for dual win
            if (board.turn != curPlayer) return MC_WIN_SCORE;
            else return MC_LOSE_SCORE;
        }
        
        //Make random moves
        board.makeRandomMove();           
    }    
    return MC_TIE_SCORE;
}
//End class MC