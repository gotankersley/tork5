//Class random
function RandomSmart(board) {    
    this.board = board;	
}

RandomSmart.prototype.getMove = function() {	
    var board = this.board;
    var open = board.getOpen();    
    
	//See if win available
	var winFound = board.findWin();
	if (winFound != null) return winFound;
	
	//Else pick random move
    //Pick random space
    var ind = open[Math.floor(Math.random() * open.length)];
        
    //Pick random quad to rotate
    var quadInd = Math.floor(Math.random() * BOARD_QUADS);
    var rotDir = (Math.floor(Math.random() * 2) == 0)? ROT_CLOCKWISE : ROT_ANTICLOCKWISE;
	return {ind:ind, quad: quadInd, dir:rotDir};    
}
//End class random