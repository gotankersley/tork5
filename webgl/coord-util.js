var quadDirX = [-1, 1, -1, 1];
var quadDirZ = [-1, -1, 1, 1];
var quadRot90 = [6,3,0,7,4,1,8,5,2];
var quadRot180 = [8,7,6,5,4,3,2,1,0];
var quadRot270 = [2,5,8,1,5,7,0,3,6];


//Class Pos
function Pos(r, c) {
    this.r = r;
    this.c = c;
}
//end class Pos

function pointToPos(point) {
    var r = Math.floor((point.z + HALF_UNIT) / UNIT_SIZE);
    if (r < 0) r = 0;
    else if (r >= ROW_SPACES) r = ROW_SPACES - 1;
    
    var c = Math.floor((point.x + HALF_UNIT) / UNIT_SIZE);
    if (c < 0) c = 0;
    else if (c >= COL_SPACES) c = COL_SPACES - 1;
    return new Pos(r, c);    
}

function posToPoint(pos, y) {
	if (typeof(y) == 'undefined') y = 0;
    return new THREE.Vector3(pos.c * UNIT_SIZE, y, pos.r * UNIT_SIZE);
}

function posToQuadPoint(pos, y, q) {	
	
	var quadRot = (quads[q].rotation.y	/ Math.PI) * 180;	
	if (quadRot < 0) quadRot = Math.abs(quadRot) % 360;
    var quadPos = new Pos(pos.r % QUAD_ROW_SPACES, pos.c % QUAD_COL_SPACES);
	var posI = (quadPos.r * QUAD_ROW_SPACES) + quadPos.c;
	
	if (quadRot == 90) posI = quadRot90[posI];
	else if (quadRot == 180) posI = quadRot180[posI];
	else if (quadRot == 270) posI = quadRot270[posI];
	quadPos = new Pos(Math.floor(posI / QUAD_ROW_SPACES), posI % QUAD_ROW_SPACES);	
    var point = posToPoint(quadPos, y);
    point.x -= UNIT_SIZE;
    point.z -= UNIT_SIZE;	
    return point;
}

function pointToQuad(point) {    
    var quadR = Math.floor(point.z / HALF_ARROW_TARGET);
    var quadC = Math.floor(point.x / HALF_ARROW_TARGET);
    return (quadR * QUAD_COUNT) + quadC;
}

function snapPoint(point) {
    return posToPoint(pointToPos(point));    
}

function octantToQuad(octant) {
	return octant % BOARD_QUADS;
}

function octantToRot(quad, octant) {
   //Get rot dir
	if (quad % 3 == 0) { //Quads 0, and 3
		if (octant >= BOARD_QUADS) return ROT_ANTICLOCKWISE;
		else return ROT_CLOCKWISE;
	}
	else { //Quads 1, and 2
		if (octant >= BOARD_QUADS) return ROT_CLOCKWISE;
		else return ROT_ANTICLOCKWISE;
	}  
}

function pointToOctant(point, quad) {
    //Divide quadrant into triangles - think Union Jack flag    
    var ax = (quad % QUAD_COUNT == 0)? 0 : ARROW_TARGET_SIZE;
    var ay = (quad < QUAD_COUNT)? 0 : ARROW_TARGET_SIZE;
    
    var bx = HALF_ARROW_TARGET;
    var by = HALF_ARROW_TARGET;    
    
    //Calculate if mouse point is above octant line
    var crossProd = ((bx - ax)*(point.z - ay)) - ((by - ay)*(point.x - ax));
    if (quad % 3 == 0) { //Slopes down in quads 0, and 3
        if (crossProd > 0) return quad + BOARD_QUADS;
        else return quad;
    }
    else { //Slopes up in quads 1, and 2
        if (crossProd < 0) return quad + BOARD_QUADS;
        else return quad;
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