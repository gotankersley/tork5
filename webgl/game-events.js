function placePin() {
    
    //Get selected quad
    var qr = Math.floor(cursorPos.r / QUAD_ROW_SPACES);
    var qc = Math.floor(cursorPos.c / QUAD_COL_SPACES);
    selQuad = (qr * QUAD_COUNT) + qc;        
    var quad = quads[selQuad];
    var p = pin.clone();
    pins.push(p);
    
    p.position = posToQuadPoint(cursorPos, 0, selQuad);		
    quad.add(p);    
}