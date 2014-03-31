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

function posToPoint(pos) {
    return new THREE.Vector3(pos.c * UNIT_SIZE, 0, pos.r * UNIT_SIZE);
}

function snapPoint(point) {
    return posToPoint(pointToPos(point));    
}