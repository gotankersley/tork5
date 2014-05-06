var TRAINING_STATES = 10000;

var trainingInputs = [];
var trainingOutputs = [];
var states = {};
//Populate initial board state
trainingInputs.push([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
trainingOutputs.push(0);

//W.R.T. to first player
function observeMatch() {
	var board = new Board();
	for (var i = 0; i < BOARD_SPACES; i++) {			
		board.makeRandomMove();
		var stateStr = board.toString();
		//if (typeof(states[stateStr]) != 'undefined') continue; //Make training sets unique
		//else states[stateStr] = true;
		var winFound = board.isWin();
		if (winFound) {
			var winScore;
			if (winFound == WIN_PLAYER1) winScore = 1;
			else if (winFound == WIN_PLAYER2) winScore = -1;
			else winScore = 0;
			trainingInputs.push(board.toNNInputs());
			trainingOutputs.push(winScore);
			break;
		}
		else {
			trainingInputs.push(board.toNNInputs());
			trainingOutputs.push(board.score());	
		}					
		if (trainingInputs.length >= TRAINING_STATES) break;
	}
}


//Output
function generateData(showButton) {
	//Generate training states
	do {
		observeMatch();
	}
	while (trainingInputs.length < TRAINING_STATES);
	if (showButton) {
		document.write('<button onclick="generateData(false);">Train</button>');
		document.write('<pre>');	
	}
	for (var i = 0; i < trainingInputs.length; i++) {
		for (var k = 0; k < BOARD_SPACES; k++) {	
			document.write(trainingInputs[i][k] + ' ');	
		}
		document.write('\n' + trainingOutputs[i] + '\n');
	}	
	trainingInputs = [];
	trainingOutputs = [];
}
//document.write(TRAINING_STATES + ' ' + BOARD_SPACES + ' 1\n'); //Header
document.write('<button onclick="generateData(true);">Train</button>');