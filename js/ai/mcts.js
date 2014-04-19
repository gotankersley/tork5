/* NOTES:
	- This is actually a varient of the MCTS-Solver, (which is stronger than plain MCTS)
	- Scoring is local, but when considering a board state, the turn has already been changed,
	  so, the local node is actually opposite of board.turn
	- A node's score will be in the range of [-1,+1], or = -infinity, +infinity
*/
var MCTS_MAX_ITERATIONS = 100000;
var MCTS_UCT_TUNING = 0.9; //Controls exploration (< 1) vs. exploitation (> 1)
var MCTS_SECURE_TUNING = 1;
var MCTS_VISITS_TO_ADD_NODE = 1;
var MCTS_MIN_FAIR_PLAY = 1;

var MCTS_WIN_SCORE = 1;
var MCTS_LOSE_SCORE = -1;
var MCTS_TIE_SCORE = 0;


//Class MCTS
function MCTS(board) {    
    this.board = board;		
}

MCTS.prototype.getMove = function() {		
	//Check for available wins before trying to build the search tree
	var winFound = this.board.findWin();
	if (winFound) {
		scoreEnabled = false;
		return this.board.getMoveFromMidWin(winFound);	
	}
	//TODO: check for ties?	
	//Run the monte-carlo tree search
	console.log('MCTS: Initial board');
	this.board.print();
	var bestKid = this.runMCTS(this.board.clone());	
	var move = this.board.deriveMove(bestKid.board);
	console.log('Visits: ' + bestKid.visits + ', Score: ' + bestKid.score);		
	this.board.printMove(move);
	bestKid.board.print();
	return move;
}

MCTS.prototype.runMCTS = function(board) {	     
    /* Steps:
	0. Pre-expansion
	---- Steps done each iteration -----
    1. Selection
    2. Expansion
    3. Simulation
    4. Back-propagation        
	-----------------------------------
    5. Pick final move
	*/
    var root = {visits:0, score:0, val:0, board:board, parent:null, kids:[]};
	
	//Pre-expand root's children
	if (!this.preExpand(root)) {
		root.board.makeRandomMove(); //If there are no moves available
        return root; 
	}
	
	//Run the iteration steps
	for (var i = 0; i < MCTS_MAX_ITERATIONS; i++) {	
	
		//Select
        var node = this.selectNode(root);
		
		//Expand - but make sure an adequate number of simulations have been run before expanding.		
		if (node.visits >= MCTS_VISITS_TO_ADD_NODE) {
			var terminalScore = this.expandNode(node); 	
			if (terminalScore !== false) {
				var winFound = this.backpropagate(node, terminalScore);
				if (winFound) return winFound;
			}
		}
        else {
            //Simulate
            var simScore = this.simulate(node);
		
            //Backpropagate			
            var winFound = this.backpropagate(node, simScore);
			if (winFound) return winFound; 
        }
	}	
	//Pick the final move
	return this.pickFinalMove(root);
}

//Steps
MCTS.prototype.preExpand = function(root) {
	var moves = this.board.getAllNonLossMoves();       
    if (moves.length == 0) {
        alert('No non-loss moves found - making random');
        return false;   
    }
	for (var m = 0; m < moves.length; m++) {
        root.kids.push({visits:0, score:0, val:0, board:moves[m], parent:root, kids:[]});
    }
	return true;
}

MCTS.prototype.selectNode = function(root) {
    //Traverse the tree until a leaf is reached by selecting the best UCT	
    var node = root;
    while (node.kids.length > 0) {
		var bestUCT = -INFINITY;
		var bestNode = null;		
		var length = node.kids.length;
		for (var i = 0; i < length; i++ ){ 
			var kid = node.kids[i];		
			//Make sure all nodes get a fair chance
			if (kid.visits < MCTS_MIN_FAIR_PLAY) return kid;
			
			//Upper Confidence Bound for Trees - Multi-armed bandit problem to maximize payoff
			var uct = (kid.score + MCTS_UCT_TUNING) * Math.sqrt(Math.log(kid.parent.visits) / kid.visits); //UCT must be negative?
			if (uct > bestUCT) {
				bestUCT = uct;
				bestNode = kid;
			}
		} 

		node = bestNode;
		if (bestNode == null) {
			console.log('All moves lead to loss'); 			
			return root.kids[0];
		}
    }	
	return bestNode;       
   
}

MCTS.prototype.expandNode = function(node) {	
	var board = node.board;	
    //Check for terminal state - they need backpropagated instead of expanding	    
    var winFound = board.findWin();	
	if (winFound) return -INFINITY; //Negative because it's from the parent's point of view	

    //TODO: Handle dual wins?
    
    //Else get all possible unique moves that don't lead to a loss
    var moves = board.getAllNonLossMoves();
    if (moves.length == 0) {
		if (board.getAllMoves().length) return INFINITY; //All moves lead to loss - So parent's win
		else return MCTS_TIE_SCORE; //Tie - no moves available
		
    }
	
	//Add all children to the node    
	for (var m = 0; m < moves.length; m++) {
		node.kids.push({visits:0, score:0, val: 0, board:moves[m], parent:node, kids:[]});
	}
	return false;
}

MCTS.prototype.simulate = function(node) {
    //Scoring from point of view of node
    var board = node.board.clone();	
    var moveCount = bitCount(or(board.p1, board.p2));
	var curPlayer = !board.turn;
	var movesLeft = BOARD_SPACES - moveCount;
    for (var i = 0; i < movesLeft; i++) {
        //Check for wins
        var winFound = board.findWin();
        if (winFound) {			
            if (board.turn == curPlayer) return MCTS_WIN_SCORE; //Board turn hasn't changed yet
            else return MCTS_LOSE_SCORE;			
			//TODO: test for dual win
		}
        else { //Block opponent win
            board.turn = !board.turn;
            winFound = board.findWin();
            if (winFound) {
                var move = board.getMoveFromMidWin(winFound);
                board.turn = !board.turn;
                board.setPin(move.pos);
                board.rotate(move.quad, move.rot);
            }
            else { //Safe to make a random move
                board.turn = !board.turn;
                board.makeRandomMove();
            }
        }
        
        //Make random moves
        //board.makeRandomMove();           
    }    
    return MCTS_TIE_SCORE;
}

MCTS.prototype.backpropagate = function(node, score) {	
	//Update leaf
    node.visits++;
    node.val += score;
	if (Math.abs(score) == INFINITY) node.score = score; //Don't average score if terminal position			
	else node.score = (node.score + score) / node.visits; //Average    

    //Backpropagate from the leaf's parent up to the root, inverting the score each level due to minmax
    while (node.parent != null) {
        score *= -1;        
        node = node.parent;
        node.visits++;		
        node.val += score;
        //Loss - if a child can win then that is a loss for the parent
        if (score == -INFINITY) node.score = -INFINITY;
        
        //Win - but all children must be checked to prove parent win
        else if (score == INFINITY) {
            var loss = true;
            for (var i = 0; i < node.kids.length; i++) {
                if (node.kids[i].score != -INFINITY) {
                    loss = false;
                    break;
                }
            }
            if (loss) node.score = INFINITY; //Proven win
            else node.score = MCTS_LOSE_SCORE; //Can't prove parent win, so not terminal
        }
        
        //Non-terminal position, so just average score        			
		else node.score = (node.score + score) / node.visits;
    }	
	//Check to see if win has been propagated up in direct decendents of root (i.e. first level)	
	if (score == INFINITY) {
		var kids = node.kids; //node is now equal to root
		for (var k = 0; k < kids.length; k++) { 
			if (kids[k].score == INFINITY) {
				alert ('Win propagated');
				return kids[k];			
			}
		}		
	}
	return false;
}

MCTS.prototype.pickFinalMove = function(root) {
	//Should we use secure child?	
    var bestScore = -INFINITY;
	var bestNode = null;
	
	initScoreMap();
	
	for (var i = 0; i < root.kids.length; i++) {
		var kid = root.kids[i];
        var score = kid.score + (MCTS_SECURE_TUNING / Math.sqrt(kid.visits));		
        if (score > bestScore) {
			bestScore = score;
			bestNode = kid;
		}
		//Populate score map
		var move = root.board.deriveMove(kid.board);
        var r = ROW[move.pos];
        var c = COL[move.pos];       
		scoreMap[r][c].push({visits:kid.visits, score:String(kid.val) + '(' + kid.score.toFixed(4) + ')'});
	}	
	
	if (bestNode == null) return root.kids[Math.floor(Math.rand() * root.kids.length)]; //All moves lead to loss
	else {
		var move = root.board.deriveMove(bestNode.board);
		enableScoreMap(move, root.visits);
		return bestNode;
	}
}


//End class MCTS