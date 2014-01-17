//Constants
var INVALID = -1;
var UNIT_SIZE = 100;
var QUAD_SIZE = UNIT_SIZE * 3;
var BOARD_SIZE = UNIT_SIZE * 6;
var CANVAS_SIZE = 800;
var CANVAS_OFFSET = (CANVAS_SIZE - BOARD_SIZE) / 2;

var HALF_UNIT = UNIT_SIZE/2;
var HALF_QUAD = QUAD_SIZE/2;
var HALF_CANVAS = CANVAS_SIZE/2;

var ARROW_WIDTH = 50;
var ARROW_HEIGHT = 20;

var TURN_SPEED = 2;

//Modes
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

//Animation shim
var requestAnimationFrame =  
	window.requestAnimationFrame ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame ||
	window.msRequestAnimationFrame ||
	window.oRequestAnimationFrame ||
	function(callback) {
		return setTimeout(callback, 1);
	};
		
//Class Game
function Game() {
	this.canvas = document.getElementById('mainCanvas');
	this.ctx = this.canvas.getContext('2d');
	this.board = new Board();
    this.cursorR = 0;
    this.cursorC = 0;
    this.arrowInd = INVALID;
	this.quadInd = INVALID;
	this.quadRot = 0;
	this.quadRotDir = 1;
    this.mode = MODE_DROP;    
    
    //Event callbacks
	$(this.canvas).click(this.onClick);
	$(this.canvas).mousemove(this.onMouse);	    
    
    this.draw();
}


//Mouse events
Game.prototype.onClick = function(e) {
    if (game.mode == MODE_DROP) {
        var r = toRC(e.offsetY);
        var c = toRC(e.offsetX);
        if (game.board.set(r,c)) {
			var gameState = game.board.isWin();
			if (gameState == IN_PLAY) game.mode = MODE_TURN;       
			else {
				if (gameState == WIN_PLAYER1) alert('Player 1 wins!');
				else if (gameState == WIN_PLAYER2) alert('Player 2 wins!');
				else alert('Tie game!');
			}
		}
    }
	else if (game.mode == MODE_TURN) {
		game.arrowInd = toOctant(e.offsetX, e.offsetY);
		game.quadInd = toQuad(e.offsetX, e.offsetY);
		//Get rot dir
		if (game.quadInd % 3 == 0) { //Quads 0, and 3
			if (game.arrowInd >= BOARD_QUADS) game.quadRotDir = ROT_LEFT;
			else game.quadRotDir = ROT_RIGHT;
		}
		else { //Quads 1, and 2
			if (game.arrowInd >= BOARD_QUADS) game.quadRotDir = ROT_RIGHT;
			else game.quadRotDir = ROT_LEFT;
		}
		game.mode = MODE_ANIM;
	}
}

Game.prototype.onMouse = function(e) {
    if (game.mode == MODE_DROP) {
        game.cursorR = toRC(e.offsetY);
        game.cursorC = toRC(e.offsetX);
    }
    else if (game.mode == MODE_TURN) {        
        game.arrowInd = toOctant(e.offsetX, e.offsetY);         
    }    
}

//Draw functions
Game.prototype.draw = function() {
    var ctx = this.ctx;
    ctx.clearRect(0,0, CANVAS_SIZE, CANVAS_SIZE);		
	
	//Player Turn			
	ctx.fillStyle = (this.board.turn == PLAYER1)? COLOR_P1 : COLOR_P2;
	ctx.font = '14pt sans-serif';	
	ctx.fillText('Player' + (this.board.turn + 1) + '\'s turn', 10, 20);	
			
    ctx.save();
    ctx.translate(CANVAS_OFFSET, CANVAS_OFFSET);
		    		      
	//Cursor
    if (this.mode == MODE_DROP) {
        var cursorX = toXY(this.cursorC);
        var cursorY = toXY(this.cursorR);
        ctx.fillStyle = COLOR_CURSOR;
        ctx.fillRect(cursorX, cursorY, UNIT_SIZE, UNIT_SIZE);
	}
	
    //Quads
    this.drawQuad(ctx, 0, 0, false);
    this.drawQuad(ctx, 1, 0, false);
    this.drawQuad(ctx, 2, 0, false);
    this.drawQuad(ctx, 3, 0, false);			
    
	//Quad division lines
	ctx.strokeStyle = COLOR_QUAD;
    ctx.fillStyle = COLOR_QUAD;
	this.drawLine(ctx, QUAD_SIZE, 0, QUAD_SIZE, BOARD_SIZE); //Vertical
	this.drawLine(ctx, 0, QUAD_SIZE, BOARD_SIZE, QUAD_SIZE); //Horizontal	
    	
	//Rotation arrows
	if (this.mode == MODE_TURN || this.mode == MODE_ANIM) {
		this.drawArrow(ctx, -ARROW_HEIGHT, 0, ARROW_WIDTH, ARROW_HEIGHT, 292.5, 4); //Q0 - A
		this.drawArrow(ctx, 0, -ARROW_HEIGHT, ARROW_WIDTH, ARROW_HEIGHT, 157.5, 0); //Q0 - C
				
		this.drawArrow(ctx, BOARD_SIZE, -ARROW_HEIGHT, ARROW_WIDTH, ARROW_HEIGHT, 22.5, 1); //Q1 -> A	    
		this.drawArrow(ctx, BOARD_SIZE + ARROW_HEIGHT, 0, ARROW_WIDTH, ARROW_HEIGHT, 247.5, 5); //Q1 -> C
		
		this.drawArrow(ctx, 0, BOARD_SIZE + ARROW_HEIGHT, ARROW_WIDTH, ARROW_HEIGHT, 202.5, 2); //Q2 -> A        
		this.drawArrow(ctx, -ARROW_HEIGHT, BOARD_SIZE, ARROW_WIDTH, ARROW_HEIGHT, 67.5, 6); //Q2 -> C
		
		this.drawArrow(ctx, BOARD_SIZE + ARROW_HEIGHT, BOARD_SIZE, ARROW_WIDTH, ARROW_HEIGHT, 112.5, 7); //Q3 -> A    
		this.drawArrow(ctx, BOARD_SIZE, BOARD_SIZE + ARROW_HEIGHT, ARROW_WIDTH, ARROW_HEIGHT, 337.5, 3); //Q3 -> C    	   
    }
	
	//Quad rotation animation
	if (this.mode == MODE_ANIM) {
		this.drawQuad(ctx, this.quadInd, this.quadRot, true);
		if (Math.abs(this.quadRot) >= 90) {
			this.board.rotate(this.quadInd, this.quadRotDir);
			var gameState = this.board.isWin();
			if (gameState == IN_PLAY) {
				this.quadRot = 0;
				this.quadInd = INVALID;
				this.arrowInd = INVALID;	
				this.cursorR = 0;
				this.cursorC = 0;			
				this.mode = MODE_DROP;			
			}
			else {
				if (gameState == WIN_PLAYER1) alert('Player 1 wins!');
				else if (gameState == WIN_PLAYER2) alert('Player 2 wins!');
				else alert('Tie game!');
			}
		}
		else this.quadRot += (this.quadRotDir * TURN_SPEED);
	}
    ctx.restore();
	
	requestAnimationFrame(this.draw.bind(this));
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

Game.prototype.drawArrow = function(ctx, x, y, w, h, degrees, arrowInd) {	    
    ctx.fillStyle = (this.mode != MODE_DROP && this.arrowInd == arrowInd)? COLOR_CURSOR : COLOR_ARROW;	
	ctx.save();		
	var halfW = (w + h)/2;
	var halfH = h/2;
	
	ctx.translate(x, y);
	ctx.rotate(degrees*Math.PI/180);	    
	ctx.translate(-(w + h), 0);	
		   
	ctx.fillRect(h, -halfH, w, h); 
	ctx.beginPath();
	ctx.moveTo(0, 0);	
	ctx.lineTo(h, h);
	ctx.lineTo(h, -h);
	ctx.closePath();
	ctx.fill();
	ctx.restore();
}

Game.prototype.drawQuad = function(ctx, quadInd, degrees, anim) { 
	if (this.mode == MODE_ANIM && quadInd == this.quadInd && !anim) return;
	var board = this.board;
	var quadR = Math.floor(quadInd / QUAD_COUNT);
	var quadC = quadInd % QUAD_COUNT;
	var qR = quadR * QUAD_ROW_SPACES;
    var qC = quadC * QUAD_COL_SPACES;		
	
    ctx.save();       
    ctx.translate((quadC * QUAD_SIZE) + HALF_QUAD, (quadR * QUAD_SIZE) + HALF_QUAD);
    ctx.rotate(degrees*Math.PI/180);    
    ctx.translate(-HALF_QUAD, -HALF_QUAD);        
    
	if (anim) ctx.clearRect(0,0, QUAD_SIZE, QUAD_SIZE);	    	
		   
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
			if (p == PLAYER1) this.drawCircle(ctx, x, y, HALF_UNIT, 5, COLOR_P1);						
			else if (p == PLAYER2) this.drawCircle(ctx, x,y, HALF_UNIT, 5, COLOR_P2);		        
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

function toRC(xy) {
	var rc = Math.floor((xy - CANVAS_OFFSET) / UNIT_SIZE);
	if (rc >= ROW_SPACES) return ROW_SPACES - 1;
	else if (rc < 0) return 0;
	else return rc;
}

function toQuad(x, y) {
	var quadR = Math.floor(y / HALF_CANVAS);
    var quadC = Math.floor(x / HALF_CANVAS);
    return (quadR * QUAD_COUNT) + quadC;
}

function toOctant(x, y) {
    //Divide quadrant into triangles - think Union Jack flag
    //Start by getting quadrant
    var quadR = Math.floor(y / HALF_CANVAS);
    var quadC = Math.floor(x / HALF_CANVAS);
    var quadInd = (quadR * QUAD_COUNT) + quadC;
    
    var ax = (quadC == 0)? 0 : CANVAS_SIZE;
    var ay = (quadR == 0)? 0 : CANVAS_SIZE;
    
    var bx = HALF_CANVAS;
    var by = HALF_CANVAS;    
    
    //Calculate if mouse point is above octant line
    var crossProd = ((bx - ax)*(y - ay)) - ((by - ay)*(x - ax));
    if (quadInd % 3 == 0) { //Slopes down in quads 0, and 3
        if (crossProd > 0) return quadInd + BOARD_QUADS;
        else return quadInd;
    }
    else { //Slopes up in quads 1, and 2
        if (crossProd < 0) return quadInd + BOARD_QUADS;
        else return quadInd;
    } 
}

var game;
$(function() {
	game = new Game();	
});
