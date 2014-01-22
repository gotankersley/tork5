//Options
var OPTION_FIND_WINS = true;
var OPTION_ROW_NUMBERS = true;
var OPTION_ROW_NOTATION = false;
var OPTION_ROT_ANIM = false;
var OPTION_ROT_SPEED = 3;

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


//Modes
var MODE_PLACE = 0;
var MODE_ROTATE = 1;
var MODE_ANIM = 2;
var MODE_WIN = 3;

//Colors
var COLOR_P1 = '#C00';
var COLOR_P2 = '#06c';
var COLOR_CURSOR = '#cfc';
var COLOR_QUAD = '#000';
var COLOR_GRID = '#c0c0c0';
var COLOR_ARROW = '#e0e0e0';
var COLOR_P1_WIN = '#a00';
var COLOR_P2_WIN = '#0cc';
var COLOR_TIE = '#000';
var COLOR_ROW_NUMBERS = '#c0c0c0';

//Keys
var KEY_SPACE = 32;
var KEY_ENTER = 13;

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
    this.ctx.font = '14pt sans-serif';	
    this.messageColor = COLOR_P1;
    this.message = 'Player1 - place marble';
    
	this.board = new Board();    
    this.cursorR = 0;
    this.cursorC = 0;
    this.arrowInd = INVALID;
	this.quadInd = INVALID;
	this.quadRot = 0;
	this.quadRotDir = 1;
    this.mode = MODE_PLACE;
    this.winLine = [0,0,0,0];
    this.winColor = COLOR_P1;        
	
	//this.player1 = 0;
	//this.player2 = new Random();
    
    //Event callbacks
	$(this.canvas).click(this.onClick);
	$(this.canvas).mousemove(this.onMouse);	    
	$(document).keyup(this.onKeyPress);	 
    
	$('#rand-tool').click(this.onRandomize);
    this.draw();
}


//Mouse events
Game.prototype.onClick = function(e) {
    if (game.mode == MODE_PLACE) {
        var r = toRC(e.offsetY);
        var c = toRC(e.offsetX);
        game.onPlacePin(r, c);        
    }
	else if (game.mode == MODE_ROTATE) {
		game.onRotateStart();
	}
	else if (game.mode == MODE_ANIM) {
		game.quadRot = (89 * game.quadRotDir);
	}
    game.draw();
}

Game.prototype.onMouse = function(e) {
    if (game.mode == MODE_PLACE) {
        game.cursorR = toRC(e.offsetY);
        game.cursorC = toRC(e.offsetX);
    }
    else if (game.mode == MODE_ROTATE) {        
        game.quadInd = toQuad(e.offsetX, e.offsetY);
		game.arrowInd = toOctant(game.quadInd, e.offsetX, e.offsetY);	        
    }    
}

Game.prototype.onKeyPress = function(e) {
	if (e.keyCode == KEY_SPACE) game.mode = MODE_PLACE;//location.reload();
	else if (e.keyCode == KEY_ENTER) {		
		game.board.turn = !game.board.turn;
		game.mode = MODE_PLACE
	}
    game.draw();
}

Game.prototype.onRandomize = function(e) {    
	game.board.randomize();
	e.preventDefault;
	return false;
}

//Game events
Game.prototype.onPlacePin = function(r, c) {    
    var board = this.board;
    //Set returns false if space is not open
    if (board.set(r,c)) {
        var gameState = board.isWin();
        if (gameState == IN_PLAY) {
            this.message = 'Player' + (this.board.turn + 1) + ' - turn quad';
            this.mode = MODE_ROTATE;
        }
        else this.onGameOver(gameState);    
    }
}

Game.prototype.onRotateStart = function() {       
    //Don't actually rotate the bitboard until rotateEnd so we can draw the animation
    //Get rot dir
    if (this.quadInd % 3 == 0) { //Quads 0, and 3
        if (this.arrowInd >= BOARD_QUADS) this.quadRotDir = ROT_ANTICLOCKWISE;
        else this.quadRotDir = ROT_CLOCKWISE;
    }
    else { //Quads 1, and 2
        if (this.arrowInd >= BOARD_QUADS) this.quadRotDir = ROT_CLOCKWISE;
        else this.quadRotDir = ROT_ANTICLOCKWISE;
    }    
    if (OPTION_ROT_ANIM) this.mode = MODE_ANIM;
    else this.onRotateEnd();
}

Game.prototype.onRotating = function() {
    if (Math.abs(this.quadRot) >= 90) this.onRotateEnd();
    else this.quadRot += (this.quadRotDir * OPTION_ROT_SPEED); 
}

Game.prototype.onRotateEnd = function() {
    var board = this.board;
    board.rotate(this.quadInd, this.quadRotDir); //this changes the turn
    var gameState = board.isWin();
    if (gameState == IN_PLAY) {
        this.quadRot = 0;
        this.quadInd = INVALID;
        this.arrowInd = INVALID;	
        this.cursorR = 0;
        this.cursorC = 0;	
        this.messageColor = (this.board.turn == PLAYER1)? COLOR_P1 : COLOR_P2;	
        this.message = 'Player' + (this.board.turn + 1) + ' - place marble';
        if (OPTION_FIND_WINS) this.showFindWins();
        this.mode = MODE_PLACE;			
    }
    else this.onGameOver(gameState);
}

Game.prototype.onGameOver = function(gameState) {    
    if (gameState == WIN_TIE) {
        this.messageColor = COLOR_TIE;
        this.message = 'TIE GAME!';
    }
    else {
        if (gameState == WIN_PLAYER1) { //Player 1
            this.winColor = COLOR_P1_WIN;
            this.messageColor = COLOR_P1;
            this.message = 'Player1 WINS!';
        }
        else { //Player 2
            this.winColor = COLOR_P2_WIN;
            this.messageColor = COLOR_P2;
            this.message = 'Player2 WINS!';
        }              
        var winRCs = this.board.winLine;
        this.winLine = [toXY(winRCs[1]) + HALF_UNIT, toXY(winRCs[0]) + HALF_UNIT, toXY(winRCs[3]) + HALF_UNIT, toXY(winRCs[2]) + HALF_UNIT];        
    }
    game.mode = MODE_WIN;
}


//Draw functions
Game.prototype.draw = function() {
    var ctx = this.ctx;
    ctx.lineWidth = 1;
    ctx.clearRect(0,0, CANVAS_SIZE, CANVAS_SIZE);		
	
	//Message - (Player Turn)
	ctx.fillStyle = this.messageColor;
	ctx.fillText(this.message, 10, 20);	
			
    ctx.save();
    ctx.translate(CANVAS_OFFSET, CANVAS_OFFSET);
		    
	//Row numbers
	if (OPTION_ROW_NUMBERS) this.drawRowNumbers(ctx);
	else if (OPTION_ROW_NOTATION) this.drawRowNotation(ctx);
	
	//Cursor
    if (this.mode == MODE_PLACE) {
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
	if (this.mode == MODE_ROTATE || this.mode == MODE_ANIM) {
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
        this.onRotating();		
	}    
    
    //Win line
    else if (this.mode == MODE_WIN) this.drawWinLine(ctx);
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
    ctx.fillStyle = (this.mode != MODE_PLACE && this.arrowInd == arrowInd)? COLOR_CURSOR : COLOR_ARROW;	        
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

Game.prototype.drawRowNumbers = function(ctx) {
	ctx.fillStyle = COLOR_ROW_NUMBERS;
	for (var i = 0; i < ROW_SPACES; i++) {
		ctx.fillText(i, -15, toXY(i) + HALF_UNIT); //Rows
		ctx.fillText(i, toXY(i) + HALF_UNIT, -5); //Columns
	}
}
Game.prototype.drawRowNotation = function(ctx) {
	ctx.fillStyle = COLOR_ROW_NUMBERS;
	for (var i = 0; i < ROW_SPACES; i++) {
		ctx.fillText((COL_SPACES - i), -15, toXY(i) + HALF_UNIT); //Rows
		ctx.fillText(String.fromCharCode(65 + i), toXY(i) + HALF_UNIT, BOARD_SIZE + 20); //Columns		
	}
	ctx.fillText('X', HALF_QUAD, -5); //Quad col 0
	ctx.fillText('Y', 3 * HALF_QUAD, -5); //Quad col 1
	ctx.fillText('1', BOARD_SIZE + 15, HALF_QUAD); //Quad row 0
	ctx.fillText('2', BOARD_SIZE + 15, 3 * HALF_QUAD); //Quad row 1
}

Game.prototype.drawWinLine = function(ctx) {
    ctx.strokeStyle = this.winColor;
    ctx.lineWidth = 5;
    this.drawLine(ctx, this.winLine[0], this.winLine[1], this.winLine[2], this.winLine[3]);
}

Game.prototype.showFindWins = function() {
    var wins = this.board.findWins();
    
    var str = '';
    for (var i in wins) {
		var w = wins[i];
		var dir = '';
		if (w[2] == ROT_CLOCKWISE) dir = 'Clockwise';
		else if (w[2] == ROT_ANTICLOCKWISE) dir = 'Anti-clockwise';
		
		if (w[0] < 0) str += '&gt;any&lt; - Q' + w[1] + ' ' + dir; //Can win just by rotation
		else if (w[1] < 0) str += ROW[w[0]] + ',' + COL[w[0]]; //Can with by placing a pin with no rotation
		else str += ROW[w[0]] + ',' + COL[w[0]] + ' - Q' + w[1] + ' ' + dir; //Can win by placing a pin and rotating        
    }
    $('#find-wins-text').html(str);
}
//End class Game

//Conversion functions
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

function toOctant(quadInd, x, y) {
    //Divide quadrant into triangles - think Union Jack flag    
    var ax = (quadInd % QUAD_COUNT == 0)? 0 : CANVAS_SIZE;
    var ay = (quadInd < QUAD_COUNT)? 0 : CANVAS_SIZE;
    
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
