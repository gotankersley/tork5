//Constants
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
	

var game;

//Class Game
function Game(side, name, oppName) {
	this.side = side;
	this.names = ['',''];
	this.names[Number(side)] = name;
	this.names[Number(!side)] = oppName;
	this.name = name;	
	this.oppName = oppName;
	this.board = new Board();    
	this.canvas = document.getElementById('mainCanvas');
	this.ctx = this.canvas.getContext('2d');    
    this.ctx.font = '14pt sans-serif';
    this.messageColor = COLOR_P1;
	if (side == PLAYER1) this.message = name + ' - place pin';
	else this.message = 'Waiting for ' + oppName + ' to place pin...';
    
    this.cursorR = 0;
    this.cursorC = 0;
    this.arrow = INVALID;
	this.quad = INVALID;
	this.quadRotDegrees = 0;
	this.quadRotDir = 0;       
    this.winLines = null;
         
    this.status = $('#status');    
    
	$("#options-button").click(function() {
        var button = $('#options-button');
        if (button.hasClass('options-menu-down')) button.removeClass('options-menu-down');
        else button.addClass('options-menu-down');
        $("#options-menu").slideToggle();
    });
    
    $('.game-option').change(function() {
        var opt = $(this).val();
        if ($(this).attr('name') == 'speed') SETTING_ROT_SPEED = opt;		
        else if (opt == 0) SETTING_ROT_ANIM = !SETTING_ROT_ANIM;
        else if (opt == 1) SETTING_ROW_NUMBERS = !SETTING_ROW_NUMBERS;        		                
    }); 
	
    //Event callbacks
	$(this.canvas).click(this.onClick);
	$(this.canvas).mousemove(this.onMouse);	    
	$(document).keyup(this.onKeyPress);	 
    		
    this.mode = (this.board.turn == side)? MODE_PLACE : MODE_WAIT;    
	
    this.onFrame();
}


//Events
Game.prototype.onClick = function(e) {	
	var x, y;
	if(e.offsetX == undefined) { //Required for FF
		x = e.pageX - $('#mainCanvas').offset().left;
		y = e.pageY - $('#mainCanvas').offset().top;
	}
	else {
		x = e.offsetX; 
		y = e.offsetY; 
	}	
	
    if (game.mode == MODE_PLACE) {
        var r = toRC(y);
        var c = toRC(x);
        game.onPlacePin(r, c, true);        
    }
	else if (game.mode == MODE_ROTATE) {
        var r = toRC(y);
        var c = toRC(x);
		//Skip rotation if there is an empty quad
		//if (SETTING_SKIP_ROTATION && game.cursorR == r && game.cursorC == c &&
		//	x >= UNIT_SIZE && y >= UNIT_SIZE && x < (BOARD_SIZE + UNIT_SIZE) && y < (BOARD_SIZE + UNIT_SIZE)) {
		//	if (game.board.canSkipRotation()) {
		//		game.onTurnChanged(true);
		//		game.onMoveOver();
		//	}
		//	else game.message = 'Rotation required';
		//}
		//else {
			var rot = arrowToRot(game.quad, game.arrow);
			game.onRotateStart(game.quad, rot, true);
		//}
	}	
}

Game.prototype.onMouse = function(e) {
	var x,y;
	if(e.offsetX == undefined) { //Required for FF
		x = e.pageX - $('#mainCanvas').offset().left;
		y = e.pageY - $('#mainCanvas').offset().top; 
	}
	else {
		x = e.offsetX; 
		y = e.offsetY; 
	}	
    if (game.mode == MODE_PLACE) {
        game.cursorR = toRC(y);
        game.cursorC = toRC(x);
        game.status.text(game.cursorR + ', ' + game.cursorC);
    }
    else if (game.mode == MODE_ROTATE) {        
        game.quad = toQuad(x, y);
		game.arrow = toOctant(game.quad, x, y);	        
    }    
}

Game.prototype.onKeyPress = function(e) {	
	//if (e.keyCode == KEY_DELETE) {
    //    if (game.mode == MODE_PLACE) {
    //        var pos = POS[game.cursorR][game.cursorC];
    //        if (!game.board.isOpen(pos)) {
    //            var mpos = not(POS_TO_MPOS[pos]);
    //            game.board.p1 = and(game.board.p1, mpos);
    //            game.board.p2 = and(game.board.p2, mpos);                
    //        }
    //    }
	//}
	//else if (e.keyCode == KEY_R) game.mode = MODE_ROTATE;
	//else if (e.keyCode == KEY_SPACE) game.mode = MODE_PLACE;
	//else if (e.keyCode == KEY_ENTER) game.onTurnChanged(true);    
    //else if (e.keyCode == KEY_S) {        
	//	var score = game.board.score(true);
    //    game.message = 'Score: ' + score.cur + '/' + score.opp + ' = ' + score.total;       
    //}
        
}

Game.prototype.onFrame = function() {
    if (this.mode == MODE_ANIM) this.onRotating();		
    this.draw();
    requestAnimationFrame(this.onFrame.bind(this));	
}

//Game events
Game.prototype.onPlacePin = function(r, c, send) {    
    var board = this.board;
    //Set returns false if space is not open	
    if (board.set(r,c)) {
		if (send) {				
			socket.emit('place-pin', {pos:POS[r][c], board:board.toString()});            			
			this.mode = MODE_ROTATE;
		}
        var gameState = board.isWin();
        if (gameState == IN_PLAY) {
			this.messageColor = (board.turn == PLAYER1)? COLOR_P1 : COLOR_P2;
			if (board.turn == this.side) this.message = this.name + ' - turn quad';
			else this.message = 'Waiting for ' + this.oppName + ' to turn quad...';  		
        }
        else this.onGameOver(gameState);    
    }
}

Game.prototype.onRotateStart = function(quad, rot, sendMove) {       
    //Don't actually rotate the bitboard until rotateEnd so we can draw the animation
	this.quad = quad;
	this.quadRotDegrees = 0;
	this.quadRotDir = (rot == ROT_CLOCKWISE)? 1 : -1;	
    if (sendMove) {
        var tmpBoard = this.board.clone();
        tmpBoard.rotate(quad, rot);    
        socket.emit('rotate-quad', {quad:quad, rot:rot, board:tmpBoard.toString()});
    }
    if (SETTING_ROT_ANIM) this.mode = MODE_ANIM;
    else this.onRotateEnd();
}

Game.prototype.onRotating = function() {
    if (Math.abs(this.quadRotDegrees) >= 90) this.onRotateEnd();
    else this.quadRotDegrees += (this.quadRotDir * SETTING_ROT_SPEED); 
}

Game.prototype.onRotateEnd = function() {   
    var rot = (this.quadRotDir == 1)? ROT_CLOCKWISE : ROT_ANTICLOCKWISE;
    this.board.rotate(this.quad, rot); //this changes the turn  	

    this.onTurnChanged(false);
    this.onMoveOver();	
}

Game.prototype.onTurnChanged = function(changeTurn) {
	//Force the turn change
	if (changeTurn) this.board.turn = !this.board.turn;
	
	this.messageColor = (this.board.turn == PLAYER1)? COLOR_P1 : COLOR_P2;	
	if (this.board.turn == this.side) this.message = this.name + ' - place pin';	
	else this.message = 'Waiting for ' + this.oppName + ' to place pin...';
}

Game.prototype.onMoveOver = function() {			
	var gameState = this.board.isWin();
    if (gameState == IN_PLAY) {		
        this.quadRotDegrees = 0;
        this.quad = INVALID;
        this.arrow = INVALID;	
        this.cursorR = 0;
        this.cursorC = 0;
		if (this.board.turn == this.side) this.mode = MODE_PLACE;
		else this.mode = MODE_WAIT;				
    }
    else this.onGameOver(gameState);
}

Game.prototype.onGameOver = function(gameState) {    
    //Convert win lines from row/col to x/y    
    var winRCs = this.board.getWinLines(); 
    this.winLines = [[],[]];
    for (var side in winRCs) {
        for (var i in winRCs[side]) {
            var line = winRCs[side][i];
            var x1 = toXY(line[1]) + HALF_UNIT;
            var y1 = toXY(line[0]) + HALF_UNIT;
            var x2 = toXY(line[3]) + HALF_UNIT;
            var y2 = toXY(line[2]) + HALF_UNIT;
            this.winLines[side].push([x1, y1, x2, y2]);
        }
    }    
    
    if (gameState == WIN_TIE || gameState == WIN_DUAL) {
        this.messageColor = COLOR_TIE;
        this.message = 'TIE GAME!';		
    }
    else {     
		var winningSide;
        if (gameState == WIN_PLAYER1) winningSide = PLAYER1;
		else winningSide = PLAYER2;
		
		this.winColor = COLOR_P1_WIN;
		this.messageColor = (winningSide == PLAYER1)? COLOR_P1 : COLOR_P2;	
		this.message = this.names[winningSide] + ' WINS!';            
		
        if (winRCs[PLAYER1].length > 1 || winRCs[PLAYER2].length > 1) this.message += ' Multi-win!';
    }
           
    this.mode = MODE_WIN;
}

Game.prototype.onInvalidMove = function(move) {
	alert('invalid move');
	this.board.printMove(move);
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
	if (SETTING_ROW_NUMBERS) this.drawRowNumbers(ctx);	
	
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
	drawLine(ctx, QUAD_SIZE, 0, QUAD_SIZE, BOARD_SIZE); //Vertical
	drawLine(ctx, 0, QUAD_SIZE, BOARD_SIZE, QUAD_SIZE); //Horizontal	
    
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
	if (this.mode == MODE_ANIM) this.drawQuad(ctx, this.quad, this.quadRotDegrees, true);  
    
    //Win line(s)
    else if (this.mode == MODE_WIN) {       
        for (var line in this.winLines[PLAYER1]) {
            this.drawWinLine(ctx, this.winLines[PLAYER1][line], COLOR_P1_WIN);
        }
        for (var line in this.winLines[PLAYER2]) {
            this.drawWinLine(ctx, this.winLines[PLAYER2][line], COLOR_P2_WIN);
        }
    }
		
    ctx.restore();
}

function drawLine(ctx, x1, y1, x2, y2) {
	ctx.beginPath();
	ctx.moveTo(x1,y1);
	ctx.lineTo(x2,y2);    
    ctx.closePath();	
	ctx.stroke();   
}

function drawCircle(ctx, x, y, r, margin, color) {
	ctx.beginPath();    
	ctx.arc(x + r,y + r, r - margin, 0, 2 * Math.PI, true);
	ctx.closePath();
    ctx.fillStyle = color;
	ctx.fill();		
}

Game.prototype.drawArrow = function(ctx, x, y, w, h, degrees, arrow) {	    
    ctx.fillStyle = (this.mode != MODE_PLACE && this.arrow == arrow)? COLOR_CURSOR : COLOR_ARROW;	        		
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

Game.prototype.drawQuad = function(ctx, quad, degrees, anim) { 
	if (this.mode == MODE_ANIM && quad == this.quad && !anim) return;
	var board = this.board;
	var quadR = Math.floor(quad / QUAD_COUNT);
	var quadC = quad % QUAD_COUNT;
	var qR = quadR * QUAD_ROW_SPACES;
    var qC = quadC * QUAD_COL_SPACES;		
	
    ctx.save();       
    ctx.translate((quadC * QUAD_SIZE) + HALF_QUAD, (quadR * QUAD_SIZE) + HALF_QUAD);
    ctx.rotate(degrees*Math.PI/180);    
    ctx.translate(-HALF_QUAD, -HALF_QUAD);        
    	
	if (anim) { //FF doesn't rotate clearRect - this works in chrome:  if (anim) ctx.clearRect(0,0, QUAD_SIZE, QUAD_SIZE);	    	
		ctx.fillStyle = "#fff";
		ctx.fillRect(0,0, QUAD_SIZE, QUAD_SIZE);	    	
	}
		   
	var x,y;
    for (var r = 0; r < QUAD_ROW_SPACES; r++) {
        y = toXY(r);
        ctx.strokeStyle = COLOR_GRID;
		drawLine(ctx, 0, y, QUAD_SIZE, y); //Horizontal
		drawLine(ctx, y, 0, y, QUAD_SIZE); //Vertical
        
        for (var c = 0; c < QUAD_COL_SPACES; c++) {
            //Draw pins
			x = toXY(c);
			var p = board.get(qR + r,qC + c);			
			if (p == PLAYER1) drawCircle(ctx, x, y, HALF_UNIT, 5, COLOR_P1);						
			else if (p == PLAYER2) drawCircle(ctx, x,y, HALF_UNIT, 5, COLOR_P2);		        
        }
    }
    y = toXY(QUAD_ROW_SPACES);
	drawLine(ctx, 0, y, QUAD_SIZE, y); //Horizontal
	drawLine(ctx, y, 0, y, QUAD_SIZE); //Vertical
    
    ctx.restore();
}

Game.prototype.drawRowNumbers = function(ctx) {

	ctx.fillStyle = COLOR_ROW_NUMBERS;
	for (var i = 0; i < ROW_SPACES; i++) {
		ctx.fillText(i, -15, toXY(i) + HALF_UNIT); //Rows
		ctx.fillText(i, toXY(i) + HALF_UNIT, -5); //Columns
	}
}


Game.prototype.drawWinLine = function(ctx, line, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    drawLine(ctx, line[0], line[1], line[2], line[3]);
}



//Helper functions
Game.prototype.showFindWins = function() {
	//Three ways to win
	//1. Can win just by rotation
	//2. Can with by placing a pin with no rotation
	//3. Can win by placing a pin and rotating        
    var wins = this.board.findAllWins();
    $('#find-wins-text').html('');
    
	for (var side in wins) {
		var sideWins = wins[side];	
		var winStr = '';
		for (var winId in sideWins) {
			var winInfo = sideWins[winId];
						
			var space = (winInfo.pos == INVALID)? '&lt;any&gt;' : (ROW[winInfo.pos] + ',' + COL[winInfo.pos]); 		
			
			var quad = (winInfo.quad == INVALID)? '' : (' - Q' + winInfo.quad);
			
			var rot;
			if (winInfo.rot == INVALID) rot = '';
			else if (winInfo.rot == ROT_CLOCKWISE) rot = ' Clockwise';
			else if (winInfo.rot == ROT_ANTICLOCKWISE) rot = ' Anti-clockwise';		
			
			winStr += '<div>' + space + quad + rot + '</div>';
		}	
		var color = (side == PLAYER1)? COLOR_P1 : COLOR_P2;			
		$('#find-wins-text').append('<div style="color: ' + color + '">' + winStr + '</div>');
	}
	
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

function toOctant(quad, x, y) {
    //Divide quadrant into triangles - think Union Jack flag    
    var ax = (quad % QUAD_COUNT == 0)? 0 : CANVAS_SIZE;
    var ay = (quad < QUAD_COUNT)? 0 : CANVAS_SIZE;
    
    var bx = HALF_CANVAS;
    var by = HALF_CANVAS;    
    
    //Calculate if mouse point is above octant line
    var crossProd = ((bx - ax)*(y - ay)) - ((by - ay)*(x - ax));
    if (quad % 3 == 0) { //Slopes down in quads 0, and 3
        if (crossProd > 0) return quad + BOARD_QUADS;
        else return quad;
    }
    else { //Slopes up in quads 1, and 2
        if (crossProd < 0) return quad + BOARD_QUADS;
        else return quad;
    } 
}

function arrowToRot(quad, arrow) {
   //Get rot dir
	if (quad % 3 == 0) { //Quads 0, and 3
		if (arrow >= BOARD_QUADS) return ROT_ANTICLOCKWISE;
		else return ROT_CLOCKWISE;
	}
	else { //Quads 1, and 2
		if (arrow >= BOARD_QUADS) return ROT_CLOCKWISE;
		else return ROT_ANTICLOCKWISE;
	}  
}

function rotToArrow(quad, rot) {
	if (quad % 3 == 0) { //Quads 0, and 3
		if (rot == ROT_ANTICLOCKWISE) return BOARD_QUADS + quad;
		else return quad;
	}
	else { //Quads 1, and 2
		if (rot == ROT_CLOCKWISE) return BOARD_QUADS + quad;
		else return quad;
	}  
}