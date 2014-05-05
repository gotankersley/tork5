var board = new Board();
var player = new Random(board);


for (var i = 0; i < BOARD_SPACES; i++) {
    //Check for wins
    var winFound = board.findWin();
    if (winFound) {			
        if (board.turn == curPlayer) return MCTS_WIN_SCORE; //Board turn hasn't changed yet
        else return MCTS_LOSE_SCORE;			
        //TODO: test for dual win
    }
    else { //Block opponent win
        board.turn = !board.turn;
        winFound = board.findWin();
        if (winFound) {
            var move = board.getMoveFromMidWin(winFound);
            board.turn = !board.turn;
            board.setPin(move.pos);
            board.rotate(move.quad, move.rot);
        }
        else { //Safe to make a random move
            board.turn = !board.turn;
            board.makeRandomMove(); 
        }
    }
}