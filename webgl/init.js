var stage;
var game;
init();


function init()  { 	
    stage = new Stage('container');
    game = new Game(stage);
		
    window.addEventListener('mousemove', onMouseMove, false );
    window.addEventListener('mousedown', onMouseDown, false );        
	window.addEventListener('keydown', onKeyDown, false );   	
    onFrame();
}

function onFrame() {	
    requestAnimationFrame(onFrame);     
    TWEEN.update();
    stage.render();    	
}




