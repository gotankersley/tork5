var projector = new THREE.Projector();
var mouseVector = new THREE.Vector3();
var selPos = new Pos(0, 0);
var selQuad;
var mouseOnBoard = false;

function onMouseMove(e) {
    mouseVector.x = 2 * (e.clientX / containerWidth) - 1;
    mouseVector.y = 1 - 2 * ( e.clientY / containerHeight );
    var raycaster = projector.pickingRay( mouseVector.clone(), camera );
    var intersects = raycaster.intersectObjects( quads);
    //Find intersections
    if (intersects.length) {
        mouseOnBoard = true;
        var index = 0;
        //Loop through intersections if there is more than one to find the closest
        if (intersects.length > 1) {
            var minDist = 100000;            
            for (var i = 0; i < intersects.length; i++) {
                if (intersects[i].distance < minDist) {
                    minDist = intersects[i].distance;
                    index = i;
                }
            }
        }   
        selPos = pointToPos(intersects[index].point);
        pin.position = posToPoint(selPos);        
    }
    else mouseOnBoard = false;
}

function onMouseDown(e) {    
    if (mouseOnBoard) {  
        //Get selected quad
        var qr = Math.floor(selPos.r / QUAD_ROW_SPACES);
        var qc = Math.floor(selPos.c / QUAD_COL_SPACES);
        selQuad = (qr * QUAD_COUNT) + qc;
        quads[selQuad].rotateY(100);
        var p = pin.clone();
        pins.push(p);
        quads[0].add(p);        
    }
}