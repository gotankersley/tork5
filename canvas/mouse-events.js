Game.prototype.onClick = function(e) {	
	if(e.offsetX == undefined) { //Required for FF
		x = e.pageX - $('#mainCanvas').offset().left;
		y = e.pageY - $('#mainCanvas').offset().top;
	}
	else {
		x = e.offsetX; 
		y = e.offsetY; 
	}
			
    if (game.mode == MODE_PLACE || e.ctrlKey) {
        var r = toRC(y);
        var c = toRC(x);
        game.onPlacePin(r, c, e.ctrlKey);        
    }
	else if (game.mode == MODE_ROTATE || e.altKey) {		
		var rot = arrowToRot(game.quad, game.arrow);
		game.onRotateStart(game.quad, rot, e.altKey);
	}
	else if (game.mode == MODE_ANIM) {
		game.quadRotDegrees = (89 * game.quadRotDir);
	}	
    game.draw();
}

Game.prototype.onMouse = function(e) {
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
