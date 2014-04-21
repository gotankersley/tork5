var TV_UNIT_SIZE = 20;
var TV_HALF_UNIT = TV_UNIT_SIZE/2;
var TV_QUAD_SIZE = TV_UNIT_SIZE * 3;
var TV_BOARD_SIZE = TV_UNIT_SIZE * 6;
var TV_CANVAS_SIZE = 1000;

var TV_MAX_KIDS_PER_LEVEL = 20;
//Class TreeViewer
function TreeViewer() {
	canvas = document.getElementById('treeViewerCanvas');
	this.ctx = canvas.getContext('2d'); 
	
	this.offsetX = 0;
	this.offsetY = 0;
	$(canvas).mousedown(this.onMouseDown);
	$(canvas).mouseup(this.onMouseUp);
	$(canvas).mousemove(this.onMouseMove);	
	this.dragging = false;
	this.dragX = 0;
	this.dragY = 0;
	this.root = null;
}

TreeViewer.prototype.onMouseDown = function(e) {	
	var x, y;
	if(e.offsetX == undefined) { //Required for FF
		x = e.pageX - $('#treeViewerCanvas').offset().left;
		y = e.pageY - $('#treeViewerCanvas').offset().top; 
	}
	else {
		x = e.offsetX; 
		y = e.offsetY; 
	}
	treeViewer.dragging = true;
	treeViewer.dragX = x - treeViewer.offsetX;
	treeViewer.dragY = y - treeViewer.offsetY;
}

TreeViewer.prototype.onMouseUp = function(e) {
	treeViewer.dragging = false;			
}

TreeViewer.prototype.onMouseMove = function(e) {
	if (treeViewer.dragging) {
		var x, y;
		if(e.offsetX == undefined) { //Required for FF
			x = e.pageX - $('#treeViewerCanvas').offset().left;
			y = e.pageY - $('#treeViewerCanvas').offset().top; 
		}
		else {
			x = e.offsetX; 
			y = e.offsetY; 
		}	
		treeViewer.offsetX = x - treeViewer.dragX;
		treeViewer.offsetY = y - treeViewer.dragY;
		treeViewer.draw();
	}
	
}

TreeViewer.prototype.draw = function(root) {
	if (typeof(root) != 'undefined') this.root = root;
	var ctx = this.ctx;
	//Draw root
	ctx.clearRect(0,0, TV_CANVAS_SIZE, TV_CANVAS_SIZE);	
	ctx.save();
	ctx.translate(this.offsetX, this.offsetY);
	var y = TV_BOARD_SIZE + 15;
	var x = TV_QUAD_SIZE;
	for (var i = 0; i < this.root.kids.length; i++) {
		drawLine(ctx, x, y, x + (i * TV_BOARD_SIZE), y + TV_QUAD_SIZE);
	}
	this.drawNode(ctx, this.root);
	ctx.restore();
	var queue = [{n:this.root,d:0}];
	while (queue.length) {
		var item = queue.pop();		
		var node = item.n;
		if (node.kids) {
			this.drawKids(ctx, node.kids, item.d);
			for (var k = 0; k < 2; k++) {
				queue.unshift({n:node.kids[k], d:(item.d + 1)});
			}
		}
	}			
}

TreeViewer.prototype.drawKids = function(ctx, kids, depth) {
	for (var k = 0; k < kids.length; k++) {
		ctx.save(); 	
		ctx.translate(k * (TV_BOARD_SIZE + TV_UNIT_SIZE) + this.offsetX, (depth + 1) * (TV_BOARD_SIZE + UNIT_SIZE) + this.offsetY);
		if (k < TV_MAX_KIDS_PER_LEVEL) this.drawNode(ctx, kids[k]);
		else { //Cutoff
			ctx.beginPath();
			ctx.fillText('[' + (kids.length - k) + ' more kids]', 10, TV_BOARD_SIZE / 2);
			ctx.rect(0, 0, TV_BOARD_SIZE, TV_BOARD_SIZE);
			ctx.stroke();
			ctx.restore();		
			break;
		}
		ctx.restore();		
	}
}

TreeViewer.prototype.drawNode = function(ctx, node) {	  
	var board = node.board;
	//Player Turn  	
	if (board.turn == PLAYER1) {
		ctx.fillStyle = COLOR_P1;				
		ctx.fillText('Player 1', 5, -10);				   
	}
	else {
		ctx.fillStyle = COLOR_P2;
		ctx.fillText('Player 2', 5, -10);	
	}
	
	//Stats		
	ctx.fillText('Visits: ' + node.visits + ', Score: ' + node.score.toFixed(6), 5, TV_BOARD_SIZE + 10);				   
	
    		    
	
    //Quads	
	ctx.strokeStyle = COLOR_GRID;
	var y;		
	for (var r = 0; r < ROW_SPACES; r++) {
		//Grid lines
		y = r * TV_UNIT_SIZE;
		drawLine(ctx, 0, y, TV_BOARD_SIZE, y); //Horizontal
		drawLine(ctx, y, 0, y, TV_BOARD_SIZE); //Vertical
		
		for (var c = 0; c < COL_SPACES; c++) {
			var x = c * TV_UNIT_SIZE;
			var p = board.get(r,c);
			if (p == PLAYER1) drawCircle(ctx, x,y, TV_HALF_UNIT, 2, COLOR_P1); 			
			else if (p == PLAYER2)	drawCircle(ctx, x,y, TV_HALF_UNIT, 2, COLOR_P2); 			
		}
	}
	y = r * TV_UNIT_SIZE;
	drawLine(ctx, 0, y, TV_BOARD_SIZE, y); //Horizontal
	drawLine(ctx, y, 0, y, TV_BOARD_SIZE); //Vertical
	
	//Quad Spacer
	ctx.strokeStyle = COLOR_QUAD;
	drawLine(ctx, TV_QUAD_SIZE, 0, TV_QUAD_SIZE, TV_BOARD_SIZE); //Vertical
	drawLine(ctx, 0, TV_QUAD_SIZE, TV_BOARD_SIZE, TV_QUAD_SIZE); //Horizontal			

    
    //Win line(s)
	var winFound = board.findWin();
    if (winFound) {   
		var winRCs = this.board.getWinLines(); 
		this.winLines = [[],[]];
		for (var side in winRCs) {
			for (var i in winRCs[side]) {
				var line = winRCs[side][i];
				var x1 = (TV_UNIT_SIZE * line[1]) + TV_HALF_UNIT;
				var y1 = (TV_UNIT_SIZE * line[0]) + TV_HALF_UNIT;
				var x2 = (TV_UNIT_SIZE * line[3]) + TV_HALF_UNIT;
				var y2 = (TV_UNIT_SIZE * line[2]) + TV_HALF_UNIT;
				this.winLines[side].push([x1, y1, x2, y2]);
			}
		}            	
		
		for (var line in this.winLines[PLAYER1]) {
			this.drawWinLine(ctx, this.winLines[PLAYER1][line], COLOR_P1_WIN);
		}
		for (var line in this.winLines[PLAYER2]) {
			this.drawWinLine(ctx, this.winLines[PLAYER2][line], COLOR_P2_WIN);
		}
    }
}

TreeViewer.prototype.drawWinLine = function(ctx, line, color) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    drawLine(ctx, line[0], line[1], line[2], line[3]);
}

//end class TreeViewer