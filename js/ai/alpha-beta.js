var ALPHA_BETA_MAX_DEPTH = 2;


//Class AlphaBeta
function AlphaBeta(board) {    
    this.board = board;	
}

AlphaBeta.prototype.getMove = function() {	
	//Check for available wins before trying to build the search tree
	var winFound = this.board.findWin();
	if (winFound) {
		//alert('win found');
		return this.board.getMoveFromMidWin(winFound);
	}
	
	//Else run search
	var root = this.board.clone();            
	var bestScore = -INFINITY;
	var bestNode = null;
	var moves = root.getAllMoves();
	for (var i = 0; i < moves.length; i++) {
		var node = moves[i];		
		//var score = node.score();
		var score = -negamaxSearch(node, 1);
		if (score > bestScore) {
			bestScore = score;
			bestNode = node;
		}
	}
	console.log("Score: " + bestScore);	
	bestNode.print();	
	var move = this.board.deriveMove(bestNode); 	
	return move;
}

function negamaxSearch(node, depth) { //recursive

	if (depth == ALPHA_BETA_MAX_DEPTH) return node.score();
	
	var bestScore = -INFINITY;
	var curSide = (depth % 2 == 0) ? PLAYER2 : PLAYER1;
	var moves = node.getAllMoves();
	for (var i = 0; i < moves.length; i++) {
		var child = moves[i];
		bestScore = -Math.max(bestScore, negamaxSearch(child, depth + 1));		
	}
	return bestScore;
}     
//End class AlphaBeta