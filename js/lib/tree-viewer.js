var TV_UNIT_SIZE = 20;
var TV_HALF_UNIT = TV_UNIT_SIZE/2;
var TV_QUAD_SIZE = TV_UNIT_SIZE * 3;
var TV_BOARD_SIZE = TV_UNIT_SIZE * 6;
var TV_NODE_SIZE_H = TV_BOARD_SIZE + 10;
var TV_NODE_SIZE_V = TV_BOARD_SIZE + 40;
var TV_CANVAS_SIZE = 1000;

var TV_MAX_KIDS = 2;
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
	this.leafStart = 0;
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
    else if (this.root == null) return;
	this.ctx.clearRect(0,0, TV_CANVAS_SIZE, TV_CANVAS_SIZE);	
	this.leafStart = 0;
	this.drawTree(this.ctx, this.root, 0); //Recursive
}

TreeViewer.prototype.drawTree = function(ctx, node, depth) {	  //Recursive
	//Leaf
	if (!node.kids.length) {
		ctx.save();
		var x = this.offsetX + (this.leafStart * TV_NODE_SIZE_H);
		ctx.translate(x, this.offsetY + (depth * TV_NODE_SIZE_V));
		this.leafStart++;
		this.drawNode(ctx, node, depth);
		ctx.restore();
		return x;
	}
	
	var start = this.leafStart;	
	var kidXs = [];
	//Recursive on child for depth first rendering
	for (var i = 0; i < node.kids.length; i++) {
		if (i >= TV_MAX_KIDS) { 	
			kidXs.push(this.drawMore(ctx, node.kids.length - i, depth + 1));			
			break;
		}
		kidXs.push(this.drawTree(ctx, node.kids[i], depth + 1));	
	}	
	
	//Draw lines from parent to kids
	var x = this.offsetX + (TV_NODE_SIZE_H * ((start + (this.leafStart - 1)) / 2));
	var y = this.offsetY + (TV_NODE_SIZE_V * depth);
	for (var i = 0; i < kidXs.length; i++) {
		drawLine(ctx, x + TV_QUAD_SIZE, y + TV_BOARD_SIZE, kidXs[i] + TV_QUAD_SIZE, y + TV_NODE_SIZE_V);
	}
	
	//Draw parent node
	ctx.save();
	ctx.translate(x, y);	
	this.drawNode(ctx, node, depth);	
	ctx.restore();	
	return x;
}

TreeViewer.prototype.drawMore = function(ctx, count, depth) {	  
	ctx.save();
	var x = this.offsetX + (this.leafStart * TV_NODE_SIZE_H);
	this.leafStart++;
	ctx.translate(x, this.offsetY + (depth * TV_NODE_SIZE_V));
	ctx.beginPath();
	ctx.fillText('[' + count + ' more kids]', 20, TV_BOARD_SIZE / 2);
	ctx.rect(0, 0, TV_BOARD_SIZE, TV_BOARD_SIZE);
	ctx.stroke();			
	ctx.restore();	
	return x;	
}

TreeViewer.prototype.drawNode = function(ctx, node, depth) {	  
	var board = node.board;
	//Player Turn  	
	if (board.turn != PLAYER1) {
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