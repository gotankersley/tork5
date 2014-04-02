var projector = new THREE.Projector();
var mouseVector = new THREE.Vector3();
var cursorPos = new Pos(0, 0);
var selQuad;
var mouseOnBoard = false;

function onMouseMove(e) {
    mouseVector.x = 2 * (e.clientX / containerWidth) - 1;
    mouseVector.y = 1 - 2 * ( e.clientY / containerHeight );
    var raycaster = projector.pickingRay( mouseVector.clone(), camera );    
    var intersects = raycaster.intersectObject( boardTarget);
    //Find intersections
    if (intersects.length) {
        mouseOnBoard = true;     					
        game.cursor = pointToPos(intersects[0].point);
        spaceTarget.position = posToPoint(game.cursor, 22);        
    }
    else mouseOnBoard = false;
}

function onMouseDown(e) { 
	if (game.mode == MODE_PLACE) { 
		if (mouseOnBoard) placePin();//{			
			//game.onPlacePin(r, c, e.ctrlKey);	//Can move / invalid / show place anim            
		//}
    }
	//else if (game.mode == MODE_ROTATE || e.altKey) {		
//	}
	//else if (game.mode == MODE_ANIM) {  
/*	
    if (mouseOnBoard) {  
        //Get selected quad
        var qr = Math.floor(cursorPos.r / QUAD_ROW_SPACES);
        var qc = Math.floor(cursorPos.c / QUAD_COL_SPACES);
        selQuad = (qr * QUAD_COUNT) + qc;        
		var quad = quads[selQuad];
        var p = pin.clone();
        pins.push(p);
        
        p.position = posToQuadPoint(cursorPos, 0, selQuad);		
        quad.add(p);    					
		animRotateQuad();
    }*/
}
