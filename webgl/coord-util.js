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

function snapPoint(point) {
    return posToPoint(pointToPos(point));    
}