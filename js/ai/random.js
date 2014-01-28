//Class random
function Random(board) {    
    this.board = board;
}

Random.prototype.getMove = function() {
	//return {ind: 0, quad:0, dir:ROT_CLOCKWISE};
	
    var board = this.board;
    var open = board.getOpen();    
    
    //Pick random space
    var ind = open[Math.floor(Math.random() * open.length)];
    //board.setPin(ind);
    
    //Pick random quad to rotate
    var quadInd = Math.floor(Math.random() * BOARD_QUADS);
    var rotDir = (Math.floor(Math.random() * 2) == 0)? ROT_CLOCKWISE : ROT_ANTICLOCKWISE;
	return {ind:ind, quad: quadInd, dir:rotDir};
    //board.rotateQuad(quadInd, rotDir);
    //return board;
}
//End class random