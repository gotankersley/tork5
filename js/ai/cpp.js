//Class CPP 
function CPP(board) {    
    this.board = board;	
}

CPP.prototype.getMove = function() {	    
    var move = {pos: INVALID, quad:INVALID, rot:INVALID};
	var board = this.board;
	var url = 'tools/cpp-player.py?p1=' + board.p1 + '&p2=' + board.p2 + '&turn=' + Number(board.turn);
	$.ajax({
		url:url ,			 
		success: function(data) {			
			move = data;
		},
		async: false
    });   
	return move;
}
//End class CPP