var projector = new THREE.Projector();
var selQuad;
var mouseOnBoard = false;
function onMouseMove(e) { 
	//Placing pin
    if (game.mode == MODE_PLACE) { 
        var point = getIntersectionPoint(e.clientX, e.clientY, boardTarget);
        if (point) { 
            game.cursorPos = pointToPos(point); 
			game.cursorQuad = posToQuad(game.cursorPos);
            cursorObj.position = posToPoint(game.cursorPos, 22);        
            mouseOnBoard = true;
        }  
        else mouseOnBoard = false;
    }
	
	//Rotating quad
	else if (game.mode == MODE_ROTATE || e.altKey) {		
		var point = getIntersectionPoint(e.clientX, e.clientY, arrowTarget);
        if (point) {
            var offsetPoint = new THREE.Vector3(2 * UNIT_SIZE, 0, 2 * UNIT_SIZE).add(point);  
            game.cursorQuad = pointToQuad(offsetPoint);
            game.cursorOct = pointToOctant(offsetPoint, game.cursorQuad);
			game.cursorRot = octantToRot(game.cursorQuad, game.cursorOct);
            for (var i = 0; i < ALL_ROTATIONS; i++) {
                arrows[i].material = materialArrow;
            }
            arrows[game.cursorOct].material = materialArrowHover;                        
			mouseOnBoard = true;
        }
		else {
			arrows[game.cursorOct].material = materialArrow;  
			mouseOnBoard = false;
		}
	}   
}

function onMouseDown(e) { 
	if (mouseOnBoard) {
		if (game.mode == MODE_PLACE) game.onPlaceStart(e.ctrlKey);							
		else if (game.mode == MODE_ROTATE || e.altKey) game.onRotateStart(e.altKey);		
	}
}

//Mouse picking
function getIntersectionPoint(clientX, clientY, target) {
    var mouseVector = new THREE.Vector3();
    mouseVector.x = 2 * (clientX / containerWidth) - 1;
    mouseVector.y = 1 - 2 * ( clientY / containerHeight );
    var raycaster = projector.pickingRay( mouseVector, camera );    
    var intersects = raycaster.intersectObject( target);    
    if (intersects.length) return intersects[0].point;           
    else return false;
}   