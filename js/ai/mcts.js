//Constants
var MAX_ITERATIONS = 10;
var UCT_TUNING = 0.9;
var VISITS_TO_ADD_NODE = 1;
var MIN_FAIR_PLAY = 0;
var INFINITY = 1000000;

//Node 
var node = {visits:0, score:0, board:EMPTY, parent:null, kids:[]};

//Class MCTS
function MCTS(board) {    
    this.board = board;	
}

MCTS.prototype.getMove = function() {		
	//Check for available wins before trying to build the search tree
	var winFound = this.board.findWin();
	if (winFound) return winFound;
	else { //Run the monte-carlo search
		this.board.print();
		var node = this.runMCTS(this.board.clone());	
		var move = this.board.deriveMove(node.board);
		console.log('Visits: ' + node.visits + ', Score: ' + node.score);
		this.board.printMove(move);
		return move;
	}
}

MCTS.prototype.runMCTS = function(board) {	     
    //Steps:
    //1. Selection
    //2. Expansion
    //3. Simulation
    //4. Back-propagation        
    //5. Pick final move
    var root = {visits:0, score:0, board:board, parent:null, kids:[]};
    for (var i = 0; i < MAX_ITERATIONS; i++) {	
		
		//Check to see if win has been propagated up in direct decendents of root (i.e. first level)		
		var kids = root.kids;
		for (var i in kids) {
			if (kids[i].score == INFINITY) {
				console.log("Win found!");
				return kids[i];
			}
		}
		
		//Select
        var node = this.selectNode(root);
		
		//Expand - but make sure an adequate number of simulations have been run before expanding	
		if (node.visits >= VISITS_TO_ADD_NODE) {
			
		}
		//Simulate
		//else 
		
		//Backpropagate
		
	}
	
    return this.pickFinalMove(root);    
}

//Steps
MCTS.prototype.selectNode = function(root) {
           
    //Traverse the tree until a leaf is reached by selecting the best UCT	
    var node = root;
    while (node.kids.length > 0) {
		var bestUCT = -INFINITY;
		var bestNode = null;
		var parentVisits = (node.parent == null)? 0 : node.parent.visits;
		for (i in node.kids) {		
			var kid = node.kids[i];		
			//Make sure unvisited nodes get a chance
			if (kid.visits <= MIN_FAIR_PLAY) {
				bestNode = kid;
				break;
			}			
			
			var uct =  -kid.score + Math.sqrt(UCT_TUNING * Math.log(parentVisits / kid.visits)); //UCT must be negative!!	
			if (uct > bestUCT) {
				bestUCT = uct;
				bestNode = kid;
			}
		} 

		node = bestNode;
		if (bestNode == null) console.log("No best kid found - broken select! " + root.board.toString());
    }
	
	return bestNode;
}

MCTS.prototype.expandNode = function(node) {
	//Check for win - don't expand if we can win
	//Check for lose rotations - and avoid those
	var board = node.board;	
	board.findRotateWin(
}

MCTS.prototype.simulate = function() {

}

MCTS.prototype.backpropagate = function() {

}

MCTS.prototype.pickFinalMove = function(root) {
	//Max visits
	var bestVisits = -INFINITY;
	var bestNode = null;
		
	for (var i in root.kids) {
		var kid = root.kids[i];
		if (kid.visits > bestVisits) {
			bestVisits = kid.visits;
			bestNode = kid;
		}
	}
	
	if (bestNode == null) return root.kids[Math.floor(Math.rand() * root.kids.length)]; //All moves lead to loss
	else return bestNode;
}


//End class MCTS