//Class NN
function NN(board) {    
    this.board = board;
}

NN.prototype.getMove = function() {	
    var board = this.board;

    var randRot = Math.floor(Math.random() * 2);
	return {pos:pos, quad:randQuad, rot:randRot};
}
//End class NN