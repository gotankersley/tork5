//Class Sim
function Sim(board) {    
    this.board = board;	
}

Sim.prototype.getMove = function() {	
    var board = this.board.clone();    
    
	//See if win available
	var winFound = board.findWin3();
	if (winFound) {
		return winFound;
	}
	
	board.makeRandomMove();   
	//board.print();
	var move = this.board.deriveMove(board); 
	//board.printMove(move);
	console.log('----');
	return move;
}
//End class Sim