//Class AlphaBeta
function AlphaBeta(board) {    
    this.board = board;	
}

AlphaBeta.prototype.getMove = function() {	
    var board = this.board.clone();    
    
	alert('here');
	board.makeRandomMove();   	
	var move = this.board.deriveMove(board); 	
	return move;
}
//End class AlphaBeta