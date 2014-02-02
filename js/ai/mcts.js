//Constants
var MAX_ITERATIONS = 10;
var UCT_TUNING = 0.9;
var VISITS_TO_ADD_NODE = 1;
var MIN_FAIR_PLAY = 0;
var INFINITY = 1000000;

var WIN_SCORE = 1;
var LOSE_SCORE = -1;
var TIE_SCORE = 0;


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
        var score;
		if (node.visits >= VISITS_TO_ADD_NODE) {
			score = -this.expandNode(node); //Negative because it's from the parent's point of view
		}
		//Simulate
		else score = this.simulate(node);
		
		//Backpropagate
        this.backpropagate(node, score);
		
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
	var board = node.board;	
    //Check for win - don't expand if we can win	
    var winFound = board.findWin();
	if (winFound) return INFINITY;
    //Handle dual win Ties?
    
    //Else add all possible unique moves that don't lead to a loss
    var moves = board.getAllNonLossMoves();
    
    //Tie
    if (moves.length == 0) return TIE_SCORE;
    
    for (var m in moves) {
        node.kids.push({visits:0, score:0, board:moves[m], parent:node, kids:[]});
    }
    
    //Simulate from first child
    return this.simulate(node.kid[0]);
}

MCTS.prototype.simulate = function(node) {
    //Scoring from point of view of node
    var board = node.board.clone();
    var moveCount = bitCount(or(board.p1, board.p2));
    
    for (var i = 0; i < (BOARD_SPACES - moveCount); i++) {
        //Check for wins
        var winFound = board.findwin();
        if (winFound) {
            if (node.board.turn == board.turn) return WIN_SCORE;
            else return LOSE_SCORE;
        }
        
        //Make random moves
        board.makeRandomMove();        
    }    
    return TIE_SCORE;
}

MCTS.prototype.backpropagate = function(node, score) {
	//Update leaf
    node.visits++;
	if (Math.abs(score) == INFINITY) node.score = score; //Don't average score if terminal position			
	else node.score = ((node.score * (node.visits - 1)) + score) / node.visits; //Average    

    //Backpropagate from the leaf's parent up to the root, inverting the score each level due to minmax
    while (node.parent != null) {
        score *= -1;
        node = node.parent;
        node.visits++;
        
        //Win
        if (score == INFINITY) node.score = INFINITY;
        
        //Loss - but all children must be checked to prove parent loss
        else if (score == -INFINITY) {
            var loss = true;
            for (i in node.kids) {
                if (node.kids[i].score != -INFINITY) {
                    loss = false;
                    break;
                }
            }
            if (loss) node.score = -INFINITY;
            else node.score = LOSE_SCORE; //Can't prove parent loss, so not terminal
        }
        
        //Non-terminal position, so just average score        			
		else node.score = ((node.score * (node.visits - 1)) + score) / node.visits;
    }

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