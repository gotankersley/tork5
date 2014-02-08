//Class Sim
function Sim(board) {    
    this.board = board;	
}

Sim.prototype.getMove = function() {	
    var board = this.board.clone();    
    
	//See if win available
	var winFound = board.findWin();
	if (winFound) {        
		var move = board.getMoveFromMidWin(winFound);        
        return move;
	}	
	board.makeRandomMove();   	
	var move = this.board.deriveMove(board); 	
	return move;
}
//End class Sim