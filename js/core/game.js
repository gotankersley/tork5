//Constants
var UNIT_SIZE = 100;
var QUAD_SIZE = UNIT_SIZE * 3;
var BOARD_SIZE = UNIT_SIZE * 6;
var HALF_UNIT = UNIT_SIZE/2;
var CANVAS_SIZE = 800;
var CANVAS_OFFSET = (CANVAS_SIZE - BOARD_SIZE) / 2;

var COLOR_P1 = '#C00';
var COLOR_P2 = '#06c';
var COLOR_CURSOR = '#cfc';

//Class Game
function Game() {
	this.canvas = document.getElementById('mainCanvas');
	this.ctx = this.canvas.getContext('2d');
	this.board = new Board();
	$(this.canvas).click(this.onClick);
	$(this.canvas).mousemove(this.onMouse);
	this.drawBoard();
    this.cursorR = 0;
    this.cursorC = 0;
}

Game.prototype.onClick = function(e) {
	var r = toRC(e.offsetY);
	var c = toRC(e.offsetX);
	game.board.set(r,c);    
	game.drawBoard();	
}

Game.prototype.onMouse = function(e) {
    game.cursorR = toRC(e.offsetY);
	game.cursorC = toRC(e.offsetX);
	game.drawBoard();	
}

Game.prototype.drawLine = function(x1, y1, x2, y2) {
	this.ctx.beginPath();
	this.ctx.moveTo(x1,y1);
	this.ctx.lineTo(x2,y2);
	this.ctx.stroke();
}

Game.prototype.drawCircle = function(x, y, r, color) {
	this.ctx.beginPath();
	this.ctx.arc(x,y, r, 0, 2 * Math.PI, true);
	this.ctx.closePath();
    this.ctx.fillStyle = color;
	this.ctx.fill();		
}

Game.prototype.drawBoard = function() {
	this.ctx.clearRect(0,0, CANVAS_SIZE, CANVAS_SIZE);
	this.ctx.strokeStyle = '#c0c0c0';	
	this.ctx.setTransform(1, 0, 0, 1, 100, 100);
	
    //Draw cursor
    var cursorX = this.cursorC * UNIT_SIZE;
    var cursorY = this.cursorR * UNIT_SIZE;
    this.ctx.fillStyle = COLOR_CURSOR;
    this.ctx.fillRect(cursorX, cursorY, UNIT_SIZE, UNIT_SIZE);
            
	var y;
	for (var r = 0; r < ROW_COUNT; r++) {
		//Grid lines
		y = toXY(r);
		this.drawLine(0, y, BOARD_SIZE, y); //Horizontal
		this.drawLine(y, 0, y, BOARD_SIZE); //Vertical
		
		for (var c = 0; c < COL_COUNT; c++) {                        
            //Draw pins
			var x = toXY(c);
			var p = this.board.get(r,c);			
			if (p == PLAYER_1) this.drawCircle(x - HALF_UNIT,y - HALF_UNIT, HALF_UNIT - 5, COLOR_P1);						
			else if (p == PLAYER_2) this.drawCircle(x - HALF_UNIT,y - HALF_UNIT, HALF_UNIT - 5, COLOR_P2);						
		}		
	}
	
	//Quad grid lines
	this.ctx.strokeStyle = '#000';
	this.drawLine(QUAD_SIZE, 0, QUAD_SIZE, BOARD_SIZE); //Vertical
	this.drawLine(0, QUAD_SIZE, BOARD_SIZE, QUAD_SIZE); //Horizontal
}


function toXY(rc) {
	return (rc * UNIT_SIZE) + CANVAS_OFFSET;
}

function toRC(xy) {
	var rc = Math.floor((xy - CANVAS_OFFSET) / UNIT_SIZE);
	if (rc >= ROW_COUNT) return ROW_COUNT - 1;
	else if (rc < 0) return 0;
	else return rc;
}

//End class Game
var game;
$(function() {
	game = new Game();	
});