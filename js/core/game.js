//Constants
var UNIT_SIZE = 100;
var QUAD_SIZE = UNIT_SIZE * 3;
var BOARD_SIZE = UNIT_SIZE * 6;
var HALF_UNIT = UNIT_SIZE/2;

//Class Game
function Game() {
	this.canvas = document.getElementById('mainCanvas');
	this.ctx = this.canvas.getContext('2d');
	this.board = new Board();
	$(this.canvas).click(this.onClick);
	this.drawBoard();
}

Game.prototype.onClick = function(e) {
	var r = Math.floor(e.offsetY / UNIT_SIZE);
	var c = Math.floor(e.offsetX / UNIT_SIZE);	
	game.board.addPin(r,c);
	game.drawBoard();	
}

Game.prototype.drawLine = function(x1, y1, x2, y2) {
	this.ctx.beginPath();
	this.ctx.moveTo(x1,y1);
	this.ctx.lineTo(x2,y2);
	this.ctx.stroke();
}

Game.prototype.drawCircle = function(x, y, r) {
	this.ctx.beginPath();
	this.ctx.arc(x,y, r, 0, 2 * Math.PI, true);
	this.ctx.closePath();
	this.ctx.fill();		
}

Game.prototype.drawBoard = function() {
	this.ctx.clearRect(0,0, BOARD_SIZE, BOARD_SIZE);
	this.ctx.strokeStyle = '#c0c0c0';
	var y;
	
	for (var r = 0; r < ROW_COUNT; r++) {
		//Grid lines
		y = r * UNIT_SIZE;
		this.drawLine(0, y, BOARD_SIZE, y); //Horizontal
		this.drawLine(y, 0, y, BOARD_SIZE); //Vertical
		
		for (var c = 0; c < COL_COUNT; c++) {
			var x = c * UNIT_SIZE;
			var p = this.board.get(r,c);
			if (p == PLAYER_1) this.drawCircle(x - HALF_UNIT,y +HALF_UNIT, HALF_UNIT);			
		}
	}
	
	//Quad grid lines
	this.ctx.strokeStyle = '#000';
	this.drawLine(QUAD_SIZE, 0, QUAD_SIZE, BOARD_SIZE); //Vertical
	this.drawLine(0, QUAD_SIZE, BOARD_SIZE, QUAD_SIZE); //Horizontal
}

Game.prototype.drawQuad = function() {
	
}

//End class Game
var game;
$(function() {
	game = new Game();	
});