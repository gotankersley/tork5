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

//Modes
var MODE_PLACE = 0;
var MODE_ROTATE = 1;
var MODE_ANIM = 2;
var MODE_WAIT = 3;
var MODE_WIN = 4;

//Colors
var COLOR_P1 = '#c0c0c0'; //'#06c';
var COLOR_P2 = '#000';//#C00';
var COLOR_CURSOR = '#cfc';
var COLOR_QUAD = '#000';
var COLOR_GRID = '#c0c0c0';
var COLOR_ARROW = '#e0e0e0';
var COLOR_P1_WIN = '#a00';
var COLOR_P2_WIN = '#a00';//'#0cc';
var COLOR_TIE = '#000';
var COLOR_ROW_NUMBERS = '#c0c0c0';

//Keys
var KEY_DELETE = 46;
var KEY_ENTER = 13;
var KEY_F = 70;
var KEY_R = 82;
var KEY_S = 83;
var KEY_SPACE = 32;

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
//var treeViewer;
//Class Game
function Game() {
	this.canvas = document.getElementById('mainCanvas');
	this.ctx = this.canvas.getContext('2d');    
    this.ctx.font = '14pt sans-serif';
    this.messageColor = COLOR_P1;
    this.message = 'Player1 - place pin';
    
	this.board = new Board(); 
    this.cursorR = 0;
    this.cursorC = 0;
    this.arrow = INVALID;
	this.quad = INVALID;
	this.quadRotDegrees = 0;
	this.quadRotDir = 0;    
    this.rotateMode = false;
    this.winLines = null;	
    this.wins = null;     
    this.status = $('#status');    
    
    //Event callbacks
	$(this.canvas).click(this.onClick);
	$(this.canvas).mousemove(this.onMouse);	    
	$(document).keyup(this.onKeyPress);	 
    	
	this.player = new Player(this, this.board, PLAYER_HUMAN, PLAYER_HUMAN);
    this.mode = MODE_PLACE;
    this.player.play();
	//treeViewer = new TreeViewer();	
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
	if (SETTING_SHOW_SCORE_MAP && scoreEnabled) {
		if (game.player.getType() != PLAYER_HUMAN) game.player.onPlayed();
		scoreEnabled = false;
		return;
	}
    if (game.mode == MODE_PLACE || e.ctrlKey) {
        var r = toRC(y);
        var c = toRC(x);
        game.onPlacePin(r, c, e.ctrlKey);        
    }
	else if (game.mode == MODE_ROTATE || e.altKey) {
        var r = toRC(y);
        var c = toRC(x);
		//Skip rotation if there is an empty quad
		if (SETTING_SKIP_ROTATION && game.cursorR == r && game.cursorC == c &&
			x >= UNIT_SIZE && y >= UNIT_SIZE && x < (BOARD_SIZE + UNIT_SIZE) && y < (BOARD_SIZE + UNIT_SIZE)) {
			if (game.board.canSkipRotation()) {
				game.onTurnChanged(true);
				game.onMoveOver();
			}
			else game.message = 'Rotation required';
		}
		else {
			var rot = arrowToRot(game.quad, game.arrow);
			game.onRotateStart(game.quad, rot, e.altKey);
		}
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
	if (e.keyCode == KEY_DELETE) {
        if (game.mode == MODE_PLACE) {
            var pos = POS[game.cursorR][game.cursorC];
            if (!game.board.isOpen(pos)) {
                var mpos = not(POS_TO_MPOS[pos]);
                game.board.p1 = and(game.board.p1, mpos);
                game.board.p2 = and(game.board.p2, mpos);                
            }
        }
	}
	else if (e.keyCode == KEY_R) game.mode = MODE_ROTATE;
	else if (e.keyCode == KEY_SPACE) game.mode = MODE_PLACE;
	else if (e.keyCode == KEY_ENTER) game.onTurnChanged(true);
    else if (e.keyCode == KEY_F) {
        //SETTING_FIND_WINS = !SETTING_FIND_WINS;
		game.wins = game.board.findAllWins();		
        //$('#find-wins').toggle();   
    }
    else if (e.keyCode == KEY_S) {        
		var score = game.board.score(true);
        game.message = 'Score: ' + score.cur + '/' + score.opp + ' = ' + score.total;
       // game.player.play();
    }
        
}

Game.prototype.onFrame = function() {
    if (this.mode == MODE_ANIM) this.onRotating();		
    this.draw();
    requestAnimationFrame(this.onFrame.bind(this));	
}

//Game events
Game.prototype.onPlacePin = function(r, c, placeMode) {    
    var board = this.board;
    //Set returns false if space is not open	
    if (board.set(r,c)) {
        var gameState = board.isWin();
        if (gameState == IN_PLAY) {
            this.message = 'Player' + (this.board.turn + 1) + ' - turn quad';
            if (!placeMode) this.mode = MODE_ROTATE;
        }
        else this.onGameOver(gameState);    
    }
}

Game.prototype.onRotateStart = function(quad, rot, rotateMode) {       
    //Don't actually rotate the bitboard until rotateEnd so we can draw the animation
	this.quad = quad;
	this.quadRotDegrees = 0;
	this.quadRotDir = (rot == ROT_CLOCKWISE)? 1 : -1;
	this.rotateMode = rotateMode;	
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
	if (this.rotateMode) this.mode = MODE_ROTATE;
	else {
		this.onTurnChanged(false);
		this.onMoveOver();
	}
}

Game.prototype.onTurnChanged = function(changeTurn) {
	//Force the turn change
	if (changeTurn) this.board.turn = !this.board.turn;
	
	this.messageColor = (this.board.turn == PLAYER1)? COLOR_P1 : COLOR_P2;	
	this.message = 'Player' + (this.board.turn + 1) + ' - place pin';	
}

Game.prototype.onMoveOver = function() {			
	var gameState = this.board.isWin();
    if (gameState == IN_PLAY) {
		if (SETTING_FIND_WINS) this.wins = this.board.findAllWins();
        this.quadRotDegrees = 0;
        this.quad = INVALID;
        this.arrow = INVALID;	
        this.cursorR = 0;
        this.cursorC = 0;	                        		
		this.mode = (this.player.getType() == PLAYER_HUMAN)?  MODE_PLACE : MODE_WAIT;
		this.player.play();					
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
        if (winRCs[PLAYER1].length > 1 || winRCs[PLAYER2].length > 1) this.message += ' Multi-win!';
    }
           
    game.mode = MODE_WIN;
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
	else if (SETTING_ROW_NOTATION) this.drawRowNotation(ctx);
	
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
		for (var i = 0; i < ALL_ROTATIONS; i++) {
			this.drawArrow(ctx, i, this.arrow,  COLOR_ARROW, COLOR_CURSOR);
		}
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
	
	//Show win threats and opportunities
	if (SETTING_FIND_WINS && this.mode == MODE_PLACE && this.wins) this.drawWinThreats(ctx);
	
	//Scoremap
	//if (SETTING_SHOW_SCORE_MAP && scoreEnabled) this.drawScoreMap(ctx);
    ctx.restore();
}
function drawArrow(ctx, x, y, w, h, degrees, arrow, color) {	    
    ctx.fillStyle = color;	        	
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

Game.prototype.drawArrow = function(ctx, arrow, arrowSelected, color, colorSelected) {	  	
	if (arrow == arrowSelected) color = colorSelected;
	switch (arrow) {
		case 0: drawArrow(ctx, 0, -ARROW_HEIGHT, ARROW_WIDTH, ARROW_HEIGHT, 157.5, 0, color); break; //Q0 - C
		case 1: drawArrow(ctx, BOARD_SIZE, -ARROW_HEIGHT, ARROW_WIDTH, ARROW_HEIGHT, 22.5, 1, color); break; //Q1 -> A	    
		case 2: drawArrow(ctx, 0, BOARD_SIZE + ARROW_HEIGHT, ARROW_WIDTH, ARROW_HEIGHT, 202.5, 2, color); break;//Q2 -> A        
		case 3: drawArrow(ctx, BOARD_SIZE, BOARD_SIZE + ARROW_HEIGHT, ARROW_WIDTH, ARROW_HEIGHT, 337.5, 3, color); break; //Q3 -> C    	   
		case 4: drawArrow(ctx, -ARROW_HEIGHT, 0, ARROW_WIDTH, ARROW_HEIGHT, 292.5, 4, color); break; //Q0 - A
		case 5: drawArrow(ctx, BOARD_SIZE + ARROW_HEIGHT, 0, ARROW_WIDTH, ARROW_HEIGHT, 247.5, 5, color); break;//Q1 -> C
		case 6: drawArrow(ctx, -ARROW_HEIGHT, BOARD_SIZE, ARROW_WIDTH, ARROW_HEIGHT, 67.5, 6, color); break; //Q2 -> C
		case 7: drawArrow(ctx, BOARD_SIZE + ARROW_HEIGHT, BOARD_SIZE, ARROW_WIDTH, ARROW_HEIGHT, 112.5, 7, color); break;//Q3 -> A    					 
	}
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

Game.prototype.drawWinLine = function(ctx, line, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    drawLine(ctx, line[0], line[1], line[2], line[3]);
}

Game.prototype.drawScoreMap = function(ctx) {
	ctx.fillStyle = '#ff0000';
    ctx.font = '10pt times';
	for (var r = 0; r < ROW_SPACES; r++) {
		for (var c = 0; c < COL_SPACES; c++) {
            for (var i = 0; i < scoreMap[r][c].length; i++) { 
                var stats = scoreMap[r][c][i];
                ctx.fillText(stats.visits, (c * UNIT_SIZE) + 5, (r * UNIT_SIZE) + ((i + 1)* 15)); 
                ctx.fillText(stats.score, (c * UNIT_SIZE) + HALF_UNIT, (r * UNIT_SIZE) + ((i + 1)* 15)); 
            }
		}		
	}
        
	//Highlight best move
	ctx.lineWidth = 3;
	ctx.strokeStyle = '#ff0000';
	ctx.beginPath();
	ctx.rect(scoreBestC * UNIT_SIZE, scoreBestR * UNIT_SIZE, UNIT_SIZE, UNIT_SIZE);	
	ctx.stroke();
	
	this.drawArrow(ctx, scoreBestArrow, INVALID, '#ff0000');	
}


Game.prototype.drawWinThreats = function(ctx) {
	//Three ways to win
	//1. Can with by placing a pin with no rotation
	//2. Can win just by rotation
	//3. Can win by placing a pin and rotating    	

	for (var side = 0; side < this.wins.length; side++) {
		var sideWins = this.wins[side];		
		var color = (side == game.board.turn)? '#ccccff' : '#ffcccc';
		for (var winId in sideWins) {
			var winInfo = sideWins[winId];
			if (winInfo.pos == INVALID) { //Draw arrow only			
				this.drawArrow(ctx, rotToArrow(winInfo.quad, winInfo.rot), INVALID, color); 
			}
			else {				
				//Draw rect
				var pos = winInfo.pos;
				var r = ROW[pos];
				var c = COL[pos];
				var x = toXY(c);
				var y = toXY(r);
				var centerX = x + HALF_UNIT;
				var centerY = y + HALF_UNIT;
				//ctx.fillStyle = (this.cursorR == r && this.cursorC == c)? '#FF0000' : '#FFcccc';
				ctx.fillStyle = color;
				ctx.fillRect(x + 12, y + 12, (3*UNIT_SIZE)/4, (3*UNIT_SIZE)/4);
				
				if (winInfo.quad != INVALID) { //Rotation required to win								
					
					//Draw mini spacer						
					ctx.strokeStyle = COLOR_GRID;
					var spacer = 15;
					drawLine(ctx, centerX, y + spacer, centerX, y + UNIT_SIZE - spacer);				
					drawLine(ctx, x + spacer, centerY, x + UNIT_SIZE - spacer, centerY);						
					
					//Draw turn indicator
					var arrow = rotToArrow(winInfo.quad, winInfo.rot);								
					switch (arrow) {
						case 0: drawCurvedArrow(ctx, centerX, centerY, 30, Math.PI + 0.1, (1.5 * Math.PI) - 0.1, false, -1, -1); break; 
						case 1: drawCurvedArrow(ctx, centerX, centerY, 30, (1.5 * Math.PI) + 0.1, -0.1, false, 1, -1); break; 
						case 2: drawCurvedArrow(ctx, centerX, centerY, 30, (0.5 * Math.PI) + 0.1, Math.PI - 0.1, false, -1, 1); break; 
						case 3: drawCurvedArrow(ctx, centerX, centerY, 30, 0.1, (0.5 * Math.PI) - 0.1, false, 1, 1); break; 
						case 4: drawCurvedArrow(ctx, centerX, centerY, 30, Math.PI + 0.1, (1.5 * Math.PI) - 0.1, true, -1, -1); break; 
						case 5: drawCurvedArrow(ctx, centerX, centerY, 30, (1.5 * Math.PI) + 0.1, -0.1, true, 1, -1); break; 
						case 6: drawCurvedArrow(ctx, centerX, centerY, 30, (0.5 * Math.PI) + 0.1, Math.PI - 0.1, true, -1, 1); break; 
						case 7: drawCurvedArrow(ctx, centerX, centerY, 30, 0.1, (0.5 * Math.PI) - 0.1, true, 1, 1); break; 
					}
				}
			}
		}
	}
}

function drawCurvedArrow(ctx, x, y, r, arcStart, arcEnd, rot, dirX, dirY) {
	ctx.beginPath();    
	ctx.arc(x, y, r, arcStart, arcEnd);
	ctx.stroke();	
	
	if (rot) {
		drawLine(ctx, x + ((r - 2) * dirX), y + (5 * dirY), x + ((r - 15) * dirX), y + (10 * dirY));
		drawLine(ctx, x + (r * dirX), y + (5 * dirY), x + ((r + 5) * dirX), y + (15 * dirY));
	}
	else {					
		drawLine(ctx, x + (5 * dirX), y + (r * dirY), x + (15 * dirX), y + ((r + 5) * dirY));
		drawLine(ctx, x + (5 * dirX), y + (r * dirY), x + (10 * dirX), y + ((r - 15) * dirY));				
	}
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