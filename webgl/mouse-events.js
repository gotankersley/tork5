var projector = new THREE.Projector();
var selQuad;
var mouseOnBoard = false;
function onMouseMove(e) {   
    if (game.mode == MODE_PLACE) { 
        var point = getIntersectionPoint(e.clientX, e.clientY, boardTarget);
        if (point) { 
            game.cursor = pointToPos(point);            
            cursorObj.position = posToPoint(game.cursor, 22);        
            mouseOnBoard = true;
        }  
        else mouseOnBoard = false;
    }
	else if (game.mode == MODE_ROTATE || e.altKey) {		
		var point = getIntersectionPoint(e.clientX, e.clientY, arrowTarget);
        if (point) {
            var offsetPoint = new THREE.Vector3(2 * UNIT_SIZE, 0, 2 * UNIT_SIZE).add(point);  
            var q = pointToQuad(offsetPoint);
            var octant = pointToOctant(offsetPoint, q);
            for (var i = 0; i < ALL_ROTATIONS; i++) {
                arrows[i].material = materialArrow;
            }
            arrows[octant].material = materialCursor;
            game.quad = q;
            game.arrow = octant;
        }
	}   
}

function onMouseDown(e) { 
	if (game.mode == MODE_PLACE) { 
		if (mouseOnBoard) game.onPlacePin(game.cursor, e.ctrlKey);					
    }
	else if (game.mode == MODE_ROTATE || e.altKey) {		
		var rot = octantToRot(game.quad, game.arrow);
		game.onRotateStart(game.quad, rot, e.altKey);
	}	
}

function getIntersectionPoint(clientX, clientY, target) {
    var mouseVector = new THREE.Vector3();
    mouseVector.x = 2 * (clientX / containerWidth) - 1;
    mouseVector.y = 1 - 2 * ( clientY / containerHeight );
    var raycaster = projector.pickingRay( mouseVector, camera );    
    var intersects = raycaster.intersectObject( target);    
    if (intersects.length) return intersects[0].point;           
    else return false;
}   