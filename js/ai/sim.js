//Class Sim
function Sim(board) {    
    this.board = board;	
}

Sim.prototype.getMove = function() {	
    var board = this.board.clone();    
    
	//See if win available
	var winFound = board.findWin();
	if (winFound) {
        //alert('win found');
		var move = board.getMoveFromMidWin(winFound);
        board.printMove(move);
        return move;
	}
	console.log('Making random move...');
	board.makeRandomMove();   
	board.print();
	var move = this.board.deriveMove(board); 
	board.printMove(move);
	console.log('----');
	return move;
}
//End class Sim