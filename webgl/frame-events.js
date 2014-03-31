function onFrame() {	
    requestAnimationFrame( onFrame );
    
    //update
	renderer.render(scene, camera );

	keyboard.update();
	if (keyboard.pressed('Z')) {	 		
		gears.translateX( -10 );	
	}
	
	controls.update();	
}

