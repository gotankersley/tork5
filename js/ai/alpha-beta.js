var ALPHA_BETA_MAX_DEPTH = 2;


//Class AlphaBeta
function AlphaBeta(board) {    
    this.board = board;	
}

AlphaBeta.prototype.getMove = function() {	
	//Check for available wins before trying to build the search tree
	var winFound = this.board.findWin();
	if (winFound) {		
		scoreEnabled = false;
		return this.board.getMoveFromMidWin(winFound);
	}
    this.board.print();
	
	
	initScoreMap();
	
	//Else run search
	var root = this.board.clone();            
	var bestScore = -INFINITY;
	var bestNode = null;
	var moves = root.getAllMoves();
	for (var i = 0; i < moves.length; i++) {
		var node = moves[i];				
		var score = node.score();
		//var score = negamaxSearch(node, 1);
		if (score > bestScore) {
			bestScore = score;
			bestNode = node;
		}
		
		//Populate score map
		var move = root.deriveMove(node);
        var r = ROW[move.pos];
        var c = COL[move.pos];       
		scoreMap[r][c].push({visits:0, score: score});
	}
	scoreEnabled = true;
	console.log('Score: ' + bestScore);	
	bestNode.print();	
	if (bestScore <= -INFINITY) {
		alert('All moves lead to loss - making random move');
		this.board.makeRandomMove();   
	}
	var move = this.board.deriveMove(bestNode); 		
	enableScoreMap(move, moves.length);
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