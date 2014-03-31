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

Game.prototype.drawWinLine = function(ctx, line, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 5;
    this.drawLine(ctx, line[0], line[1], line[2], line[3]);
}