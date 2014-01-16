//Constants
var UNIT_SIZE = 100;
var QUAD_SIZE = UNIT_SIZE * 3;
var BOARD_SIZE = UNIT_SIZE * 6;
var CANVAS_SIZE = 800;
var CANVAS_OFFSET = (CANVAS_SIZE - BOARD_SIZE) / 2;
var HALF_UNIT = UNIT_SIZE/2;
var HALF_QUAD = QUAD_SIZE/2;
var HALF_CANVAS = CANVAS_SIZE/2;
var ARROW_WIDTH = 150;
var ARROW_HEIGHT = 10;

var MODE_DROP = 0;
var MODE_TURN = 1;
var MODE_ANIM = 2;

//Colors
var COLOR_P1 = '#C00';
var COLOR_P2 = '#06c';
var COLOR_CURSOR = '#cfc';
var COLOR_QUAD = '#000';
var COLOR_GRID = '#c0c0c0';
var COLOR_ARROW = '#e0e0e0';

//var requestAnimationFrame =  
//	window.requestAnimationFrame ||
//	window.webkitRequestAnimationFrame ||
//	window.mozRequestAnimationFrame ||
//	window.msRequestAnimationFrame ||
//	window.oRequestAnimationFrame ||
//	function(callback) {
//		return setTimeout(callback, 1);
//	};
		
//Class Game
function Game() {
	this.canvas = document.getElementById('mainCanvas');
	this.ctx = this.canvas.getContext('2d');
	this.board = new Board();
    this.cursorR = 0;
    this.cursorC = 0;
    this.arrow = -1;
    //this.mode = MODE_DROP;
    this.mode = MODE_TURN;
    
    //Event callbacks
	$(this.canvas).click(this.onClick);
	$(this.canvas).mousemove(this.onMouse);	    
    
    this.draw();
}

//Mouse events
Game.prototype.onClick = function(e) {
    if (this.mode == MODE_DROP) {
        var r = toRC(e.offsetY);
        var c = toRC(e.offsetX);
        game.board.set(r,c);    
        game.draw();	
    }
}

Game.prototype.onMouse = function(e) {
    if (game.mode == MODE_DROP) {
        game.cursorR = toRC(e.offsetY);x
        game.cursorC = toRC(e.offsetX);
    }
    else if (game.mode == MODE_TURN) {        
        game.arrow = game.getArrow(e.offsetX, e.offsetY); 
        console.log(game.arrow);
    }
    game.draw();		
}

Game.prototype.getArrow = function(x, y) {
    //Calculate quadrant
    var quadR = toQuadRC(x);
    var quadC = toQuadRC(y);
    var quadInd = (quadR * QUAD_COUNT) + quadC;
    
    var ax = quadC * HALF_CANVAS;
    var ay = quadR * HALF_CANVAS;
    
    var bx = ax + HALF_CANVAS;
    var by = ay + HALF_CANVAS;
    
    game.ax = ax;
    game.ay = ay;
    game.bx = bx;
    game.by = by;
    
    //Calculate if mouse point is above quad diagonal line (i.e. if greater than 0)
    if (((bx - ax)*(y - ay)) - ((by - ay)*(x - ax)) > 0) return quadInd + BOARD_QUADS;
    else return quadInd;
}

//Draw functions
Game.prototype.draw = function() {
    var ctx = this.ctx;
    ctx.clearRect(0,0, CANVAS_SIZE, CANVAS_SIZE);		
ctx.strokeStyle = '#f00';
this.drawLine(ctx, this.ax, this.ay, this.bx, this.by);
//this.drawLine(ctx, HALF_CANVAS, HALF_CANVAS, 0, HALF_CANVAS);
//if (this.arrow == 0) this.drawCircle(ctx, 20, 20, 100, 5, COLOR_P1);		
	
	//Player Turn			
	ctx.fillStyle = (this.board.turn == PLAYER_1)? COLOR_P1 : COLOR_P2;
	ctx.font = '14pt sans-serif';	
	ctx.fillText('Player' + (this.board.turn + 1) + '\'s turn', 10, 20);	
			
    ctx.save();
    ctx.translate(CANVAS_OFFSET, CANVAS_OFFSET);
		    		      
		   
    //Quads
    this.drawQuad(ctx, 0, 0, 0, false);
    this.drawQuad(ctx, 0, 1, 0, false);
    this.drawQuad(ctx, 1, 0, 0, false);
    this.drawQuad(ctx, 1, 1, 0, false);	
	
	//Cursor
    if (this.mode == MODE_DROP) {
        var cursorX = toXY(this.cursorC);
        var cursorY = toXY(this.cursorR);
        ctx.fillStyle = COLOR_CURSOR;
        ctx.fillRect(cursorX, cursorY, UNIT_SIZE, UNIT_SIZE);
	}
    
	//Quad division lines
	ctx.strokeStyle = COLOR_QUAD;
    ctx.fillStyle = COLOR_QUAD;
	this.drawLine(ctx, QUAD_SIZE, 0, QUAD_SIZE, BOARD_SIZE); //Vertical
	this.drawLine(ctx, 0, QUAD_SIZE, BOARD_SIZE, QUAD_SIZE); //Horizontal	
    
	
	//Rotation arrows - drawn clockwise	
	this.drawArrow(ctx, 0, -ARROW_HEIGHT, ARROW_WIDTH, ARROW_HEIGHT, 0); //Q0 -> L
	this.drawArrow(ctx, BOARD_SIZE, -ARROW_HEIGHT, ARROW_WIDTH, ARROW_HEIGHT, 180); //Q1 -> R	
	this.drawArrow(ctx, BOARD_SIZE + ARROW_HEIGHT, 0, ARROW_WIDTH, ARROW_HEIGHT, 90); //Q1 -> L	
	this.drawArrow(ctx, BOARD_SIZE + ARROW_HEIGHT, BOARD_SIZE, ARROW_WIDTH, ARROW_HEIGHT, 270); //Q3 -> R
    this.drawArrow(ctx, BOARD_SIZE, BOARD_SIZE + ARROW_HEIGHT, ARROW_WIDTH, ARROW_HEIGHT, 180); //Q3 -> L
    this.drawArrow(ctx, 0, BOARD_SIZE + ARROW_HEIGHT, ARROW_WIDTH, ARROW_HEIGHT, 0); //Q2 -> R
    this.drawArrow(ctx, -ARROW_HEIGHT, BOARD_SIZE, ARROW_WIDTH, ARROW_HEIGHT, 270); //Q2 -> L
    this.drawArrow(ctx, -ARROW_HEIGHT, 0, ARROW_WIDTH, ARROW_HEIGHT, 90); //Q1 -> L	
	//requestAnimationFrame(d1)
    ctx.restore();
}

function d1() {
	game.draw();
}

Game.prototype.drawLine = function(ctx, x1, y1, x2, y2) {
	ctx.beginPath();
	ctx.moveTo(x1,y1);
	ctx.lineTo(x2,y2);    
    ctx.closePath();	
	ctx.stroke();   
}

Game.prototype.drawCircle = function(ctx, x, y, r, margin, color) {
	ctx.beginPath();    
	ctx.arc(x + r,y + r, r - margin, 0, 2 * Math.PI, true);
	ctx.closePath();
    ctx.fillStyle = color;
	ctx.fill();		
}

Game.prototype.drawArrow = function(ctx, x, y, w, h, degrees) {	
    ctx.fillStyle = COLOR_ARROW;	
	ctx.save();		
    ctx.translate(x, y);
	ctx.rotate(degrees*Math.PI/180);	    
	ctx.fillRect(h, -h/2, w, h); 
	ctx.beginPath();
	ctx.moveTo(0, 0);	
	ctx.lineTo(h, h);
	ctx.lineTo(h, -h);
	ctx.closePath();
	ctx.fill();
	ctx.restore();
}

Game.prototype.drawQuad = function(ctx, quadR, quadC, degrees, clear) {        
    ctx.save();       
    ctx.translate((quadC * QUAD_SIZE) + HALF_QUAD, (quadR * QUAD_SIZE) + HALF_QUAD);
    ctx.rotate(degrees*Math.PI/180);    
    ctx.translate(-HALF_QUAD, -HALF_QUAD);        
    
	if (clear) ctx.clearRect(0,0, QUAD_SIZE, QUAD_SIZE);	    
	
	var board = this.board;
	var qR = quadR * QUAD_ROW_SPACES;
    var qC = quadC * QUAD_COL_SPACES;		   
	var x,y;
    for (var r = 0; r < QUAD_ROW_SPACES; r++) {
        y = toXY(r);
        ctx.strokeStyle = COLOR_GRID;
		this.drawLine(ctx, 0, y, QUAD_SIZE, y); //Horizontal
		this.drawLine(ctx, y, 0, y, QUAD_SIZE); //Vertical
        
        for (var c = 0; c < QUAD_COL_SPACES; c++) {
            //Draw pins
			x = toXY(c);
			var p = board.get(qR + r,qC + c);			
			if (p == PLAYER_1) this.drawCircle(ctx, x, y, HALF_UNIT, 5, COLOR_P1);						
			else if (p == PLAYER_2) this.drawCircle(ctx, x,y, HALF_UNIT, 5, COLOR_P2);		        
        }
    }
    y = toXY(QUAD_ROW_SPACES);
	this.drawLine(ctx, 0, y, QUAD_SIZE, y); //Horizontal
	this.drawLine(ctx, y, 0, y, QUAD_SIZE); //Vertical
    
    ctx.restore();
}
//End class Game


function toXY(rc) {
	return rc * UNIT_SIZE;
}

function toQuadRC(xy) {
	return Math.floor(xy / HALF_CANVAS);	
}

function toRC(xy) {
	var rc = Math.floor((xy - CANVAS_OFFSET) / UNIT_SIZE);
	if (rc >= ROW_SPACES) return ROW_SPACES - 1;
	else if (rc < 0) return 0;
	else return rc;
}

var game;
$(function() {
	game = new Game();	
});
