importScripts('../lib/bitlib.js');
importScripts('../data/quad-wins.js');
importScripts('../data/mid-wins.js');
importScripts('board.js');
importScripts('../constants/player.js');


//Import players
importScripts('../ai/random.js');
importScripts('../ai/sim.js');
importScripts('../ai/mcts.js');

self.onmessage = function(e) {	
	var data = e.data;
	var board = new Board();
	board.p1 = data.p1;
	board.p2 = data.p2;
	board.turn = data.turn;
		
	var player = createPlayer(data.type, board);
	var move = player.getMove();	
		
	self.postMessage(move);		

};

function createPlayer(playerType, board) {

    switch (playerType) {
        case PLAYER_HUMAN: return null;
        case PLAYER_RANDOM: return new Random(board);
		case PLAYER_SIM: return new Sim(board);
        case PLAYER_MCTS: return new MCTS(board);
    }    
    return null;
}