//Constants
var MAX_ITERATIONS = 10;
var UCT_TUNING = 0.9;
var VISITS_TO_ADD_NODE = 1;
var MIN_FAIR_PLAY = 0;

//Node 
var node = {visits:0, score:0, board:EMPTY, parent:null, children:[]};

//Class MCTS
function MCTS(board) {    
    this.board = board;	
}

MCTS.prototype.getMove = function() {	
    //Check for avail?
    //Check for available wins
    
    //Steps:
    //1. Selection
    //2. Expansion
    //3. Simulation
    //4. Back-propagation        
    //5. Pick final move
    var root = {visits:0, score:0, board:this.board.clone(), parent:null, children:[]};
    for (var i = 0; i < MAX_ITERATIONS; i++) {
        var node = this.select(root);
    
    return {ind: INVALID, quad:INVALID, dir: INVALID};
}

//Steps
MCTS.prototype.select = function(root) {
    var bestUCT = -INFINITY;
    var bestNode = null;
    
    //?Check to see if win has been propagated up in direct decendents of root (i.e. first level)
    
    //Traverse the tree until a leaf is reached by selecting the best UCT	
    var node = root;
    while (node.children.length > 0) {
        //Make sure unvisited nodes get a chance
    }
}


//End class MCTS