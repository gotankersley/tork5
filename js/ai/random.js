//Class Random
function Random(board) {    
    this.board = board;
}

Random.prototype.getMove = function() {
    var board = this.board;
    var open = board.getOpen();    
    
    //Pick random space
    var pos = open[Math.floor(Math.random() * open.length)];    
    
    //Pick random quad to rotate
    var randQuad = Math.floor(Math.random() * BOARD_QUADS);
    var randRot = Math.floor(Math.random() * 2);
	return {pos:pos, quad:randQuad, rot:randRot};
}
//End class Random