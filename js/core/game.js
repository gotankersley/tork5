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
var COLOR_QUAD = '#000';
var COLOR_GRID = '#c0c0c0';
var COLOR_ARROW = '#e0e0e0';

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

Game.prototype.drawArrow = function(x, y, w, h) {	
	this.ctx.fillRect(x + h, y, w, h); 
	this.ctx.beginPath();
	this.ctx.moveTo(x + h, y - h);
	this.ctx.lineTo(x + h, y + (2*h));
	this.ctx.lineTo(x, y +(h/2));	
	this.ctx.closePath();
	this.ctx.fill();
}

Game.prototype.drawBoard = function() {
	this.ctx.setTransform(1, 0, 0, 1, 0, 0);
	this.ctx.clearRect(0,0, CANVAS_SIZE, CANVAS_SIZE);		
	
	//Draw turn			
	this.ctx.fillStyle = (this.board.turn == PLAYER_1)? COLOR_P1 : COLOR_P2;
	this.ctx.font = '14pt sans-serif';	
	this.ctx.fillText('Player' + (this.board.turn + 1) + '\'s turn', 10, 20);	
		
	this.ctx.setTransform(1, 0, 0, 1, CANVAS_OFFSET, CANVAS_OFFSET);
		
    //Draw cursor
    var cursorX = toXY(this.cursorC);
    var cursorY = toXY(this.cursorR);
    this.ctx.fillStyle = COLOR_CURSOR;
    this.ctx.fillRect(cursorX, cursorY, UNIT_SIZE, UNIT_SIZE);
    
	//Draw arrows	
	this.ctx.fillStyle = COLOR_ARROW;
	this.drawArrow(0, -30, 150, 10);
		
	var y;
	this.ctx.strokeStyle = COLOR_GRID;
	for (var r = 0; r < ROW_COUNT; r++) {
		//Draw grid lines
		y = toXY(r);
		this.drawLine(0, y, BOARD_SIZE, y); //Horizontal
		this.drawLine(y, 0, y, BOARD_SIZE); //Vertical
		
		for (var c = 0; c < COL_COUNT; c++) {                        
            //Draw pins
			var x = toXY(c);
			var p = this.board.get(r,c);			
			if (p == PLAYER_1) this.drawCircle(x + HALF_UNIT,y + HALF_UNIT, HALF_UNIT - 5, COLOR_P1);						
			else if (p == PLAYER_2) this.drawCircle(x + HALF_UNIT,y + HALF_UNIT, HALF_UNIT - 5, COLOR_P2);						
		}		
	}
	y = toXY(ROW_COUNT);
	this.drawLine(0, y, BOARD_SIZE, y); //Horizontal
	this.drawLine(y, 0, y, BOARD_SIZE); //Vertical
	
	//Quad grid lines
	this.ctx.strokeStyle = COLOR_QUAD;
	this.drawLine(QUAD_SIZE, 0, QUAD_SIZE, BOARD_SIZE); //Vertical
	this.drawLine(0, QUAD_SIZE, BOARD_SIZE, QUAD_SIZE); //Horizontal
}


function toXY(rc) {
	return rc * UNIT_SIZE;
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