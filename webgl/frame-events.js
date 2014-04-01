

function onFrame() {	
    requestAnimationFrame( onFrame );
    
    //update
	renderer.render(scene, camera );

	keyboard.update();
	if (keyboard.pressed('Z')) {	 		
		gears.translateX( -10 );	
	}
	
	controls.update();	
	TWEEN.update();
}

function animRotateQuad() {
	
	var quad = quads[selQuad];
	var x = quad.position.x;
	var z = quad.position.z;
	
	//Move out
	var tween = new TWEEN.Tween({d:0}).to({d:UNIT_SIZE}, 2000);
	tween.onUpdate(function() {		
		quad.position.x = x + (this.d * quadDirX[selQuad]);
		quad.position.z = z + (this.d * quadDirZ[selQuad]);				
	});
	
	//Rotate - quad and gears
	var tween2 = new TWEEN.Tween({r:0}).to({r:90}, 2000);
	tween2.onUpdate(function() {
        var rad = -this.r*(Math.PI/180);
		quad.rotation.y = rad;
        gears[0].rotation.y = rad;
        gears[1].rotation.y = rad;
        gears[2].rotation.y = rad;
        gears[3].rotation.y = rad;
        centerGear.rotation.y = rad; //Not negative because upside down
	});
	
	//Move back in
	var tween3 = new TWEEN.Tween({d:UNIT_SIZE}).to({d:0}, 2000);
	tween3.onUpdate(function() {		
		quad.position.x = x + this.d * quadDirX[selQuad];
		quad.position.z = z + this.d * quadDirZ[selQuad];				
	});
	//tween.onComplete(function() {
		
	//});
	tween.chain(tween2);
	tween2.chain(tween3);
	tween.start();
	
}

