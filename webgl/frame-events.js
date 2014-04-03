/*
function onFrame() {	
    requestAnimationFrame( onFrame );
    
    //update
	renderer.render(scene, camera );

	
	controls.update();	
	TWEEN.update();
}
function animRotateQuad() {
	
	var quad = quads[selQuad];
	var x = quad.position.x;
	var z = quad.position.z;
	
	//Move out
	var tween = new TWEEN.Tween({d:0}).to({d:UNIT_SIZE}, ROTATE_SPEED);
	tween.onUpdate(function() {		
		quad.position.x = x + (this.d * quadDirX[selQuad]);
		quad.position.z = z + (this.d * quadDirZ[selQuad]);				
	});
	
	//Rotate - quad and gears
	var tween2 = new TWEEN.Tween({r:0}).to({r:90}, ROTATE_SPEED);
	var initRad = quad.rotation.y;
	tween2.onUpdate(function() {
        var rad = -this.r*(Math.PI/180);
		quad.rotation.y = initRad + rad;
        gears[0].rotation.y = rad;
        gears[1].rotation.y = rad;
        gears[2].rotation.y = rad;
        gears[3].rotation.y = rad;
        centerGear.rotation.y = rad; //Not negative because upside down
	});
	
	//Move back in
	var tween3 = new TWEEN.Tween({d:UNIT_SIZE}).to({d:0}, ROTATE_SPEED);
	tween3.onUpdate(function() {		
		quad.position.x = x + this.d * quadDirX[selQuad];
		quad.position.z = z + this.d * quadDirZ[selQuad];				
	});
	//tween3.onComplete(function() {		
	//});
	tween.chain(tween2);
	tween2.chain(tween3);
	tween.start();
	
}
*/