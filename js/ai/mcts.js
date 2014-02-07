//Constants
var MAX_ITERATIONS = 10000;
var UCT_TUNING = 0.9;
var VISITS_TO_ADD_NODE = 1;
var MIN_FAIR_PLAY = 0;
var INFINITY = 1000000;

var WIN_SCORE = 1;
var LOSE_SCORE = -1;
var TIE_SCORE = 0;

var NODE_VISITS = 0;
var NODE_SCORE = 1;
var NODE_PARENT = 2;
var NODE_KIDS = 3;
var NODE_BOARD = 4;


//Class MCTS
function MCTS(board) {    
    this.board = board;	
}

MCTS.prototype.getMove = function() {		
	//Check for available wins before trying to build the search tree
	var winFound = this.board.findWin();
	if (winFound) {
		alert('win found');
		return this.board.getMoveFromMidWin(winFound);
	}
	else { //Run the monte-carlo search
        console.log('MCTS: Initial board');
		this.board.print();
		var node = this.runMCTS(this.board.clone());	
		var move = this.board.deriveMove(node[NODE_BOARD]);
		console.log('Visits: ' + node[NODE_VISITS] + ', Score: ' + node[NODE_SCORE]);		
		this.board.printMove(move);
		node[NODE_BOARD].print();
		return move;
	}
}

MCTS.prototype.runMCTS = function(board) {	     
    //Steps:
	//0. Pre-expansion
    //1. Selection
    //2. Expansion
    //3. Simulation
    //4. Back-propagation        
    //5. Pick final move
    //var root = {visits:0, score:0, board:board, parent:null, kids:[]};
	var root = [1,0,null,[],board];
	
	//Pre-expand root's children
	var moves = board.getAllNonLossMoves();       
    if (moves.length == 0) {
        console.log('No non-loss moves found - making random');
        root[NODE_BOARD].makeRandomMove();
        return root;    
    }
    for (var m in moves) {        
        root[NODE_KIDS].push([0,0,node,[],moves[m]]);
    }
	
    for (var i = 0; i < MAX_ITERATIONS; i++) {	
		
        //TODO: top level win-propagation
		//Check to see if win has been propagated up in direct decendents of root (i.e. first level)		
		/*var kids = root.kids;
		for (var k in kids) {
			if (kids[k].score == INFINITY) {
				console.log('Win found!');
				return kids[k];
			}
		}*/
		
		//Select
        var node = this.selectNode(root);
		
		//Expand - but make sure an adequate number of simulations have been run before expanding	        
		if (node[NODE_VISITS].visits >= VISITS_TO_ADD_NODE) this.expandNode(node); //Expand backpropagates for terminal nodes
        else {
            //Simulate
            var score = this.simulate(node);
		
            //Backpropagate
            this.backpropagate(node, score);
        }
		
	}
	
    return this.pickFinalMove(root);    
}

//Steps
MCTS.prototype.selectNode = function(root) {
           
    //Traverse the tree until a leaf is reached by selecting the best UCT	
    var node = root;
    while (node[NODE_KIDS].length > 0) {
		var bestUCT = -INFINITY;
		var bestNode = null;
		var parentVisits = (node[NODE_PARENT] == null || node[NODE_PARENT][NODE_VISITS] == 0)? 1 : node[NODE_PARENT][NODE_VISITS];
		for (i in node[NODE_KIDS]) {		
			var kid = node[NODE_KIDS][i];		
			//Make sure unvisited nodes get a chance
			if (kid[NODE_VISITS] <= MIN_FAIR_PLAY) {
				bestNode = kid;
				break;
			
			}			
			//http://stackoverflow.com/questions/8271210/upper-confidence-bounds-in-monte-carlo-tree-search-when-plays-or-visited-are-0
			var uct =  kid.score + Math.sqrt(Math.abs(UCT_TUNING * Math.log(parentVisits / kid.visits))); //UCT must be negative?
			if (uct > bestUCT) {
				bestUCT = uct;
				bestNode = kid;
			}
		} 

		node = bestNode;
		if (bestNode == null) { 
			console.log(uct);
			console.log('No best kid found - broken select! ' + root[NODE_BOARD].toString());
		}
    }	
	return bestNode;
}

MCTS.prototype.expandNode = function(node) {	
	var board = node[NODE_BOARD];	
    //Check for win - don't expand if we can win	
    
    var winFound = board.findWin();
	if (winFound) this.backpropagate(node, -INFINITY); //Negative because it's from the parent's point of view	

    //TODO: Handle dual wins?
    
    //Else add all possible unique moves that don't lead to a loss
    var moves = board.getAllNonLossMoves();
    
    //Tie
    if (moves.length == 0) return TIE_SCORE;
    
    for (var m in moves) {
        node[NODE_KIDS].push([0,0, node,[], moves[m]]);
    }
           
}

MCTS.prototype.simulate = function(node) {
    //Scoring from point of view of node
    var board = node[NODE_BOARD].clone();
    var moveCount = bitCount(or(board.p1, board.p2));
    
    for (var i = 0; i < (BOARD_SPACES - moveCount); i++) {
        //Check for wins
        var winFound = board.findWin();
        if (winFound) {
            //TODO: test for dual win
            return WIN_SCORE;
        }
        
        //Make random moves
        board.makeRandomMove();   
        //board.print();
    }    
    return TIE_SCORE;
}

MCTS.prototype.backpropagate = function(node, score) {
	//Update leaf
    node[NODE_VISITS]++;
	if (Math.abs(score) == INFINITY) node[NODE_SCORE] = score; //Don't average score if terminal position			
	else node[NODE_SCORE] = ((node[NODE_SCORE] * (node[NODE_VISITS] - 1)) + score) / node[NODE_VISITS]; //Average    

    //Backpropagate from the leaf's parent up to the root, inverting the score each level due to minmax
    while (node[NODE_PARENT] != null) {
        score *= -1;
        node = node[NODE_PARENT];
        node[NODE_VISITS]++;
        
        //Win
        if (score == INFINITY) node[NODE_SCORE] = INFINITY;
        
        //Loss - but all children must be checked to prove parent loss
        else if (score == -INFINITY) {
            var loss = true;
            for (i in node[NODE_KIDS]) {
                if (node[NODE_KIDS][i][NODE_SCORE] != -INFINITY) {
                    loss = false;
                    break;
                }
            }
            if (loss) node[NODE_SCORE] = -INFINITY;
            else node[NODE_SCORE] = LOSE_SCORE; //Can't prove parent loss, so not terminal
        }
        
        //Non-terminal position, so just average score        			
		else node[NODE_SCORE] = ((node[NODE_SCORE] * (node[NODE_VISITS] - 1)) + score) / node[NODE_VISITS];
    }
		

}

MCTS.prototype.pickFinalMove = function(root) {
	//Max visits
	var bestVisits = -INFINITY;
	var bestNode = null;
		
	for (var i in root[NODE_KIDS]) {
		var kid = root[NODE_KIDS][i];
		if (kid[NODE_VISITS] > bestVisits) {
			bestVisits = kid[NODE_VISITS];
			bestNode = kid;
		}
	}
	
	if (bestNode == null) return root[NODE_KIDS][Math.floor(Math.rand() * root[NODE_KIDS].length)]; //All moves lead to loss
	else return bestNode;
}


//End class MCTS