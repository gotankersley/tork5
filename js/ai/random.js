//Class random
function Random() {

}

Random.prototype.getMove = function(board) {
    var open = board.getOpen();    
    
    //Pick random space
    var ind = open[Math.floor(Math.random() * open.length)];
    board.setPin(ind);
    
    //Pick random quad to rotate
    var quadInd = Math.floor(Math.random() * BOARD_QUADS);
    var rotDir = Math.floor(Math.random() * 2) - 1;
    board.rotateQuad(quadInd, rotDir);
    return board;
}
//End class random