var game;
init();

var quadDirX = [-1, 1, -1, 1];
var quadDirZ = [-1, -1, 1, 1];
var quadRot90 = [6,3,0,7,4,1,8,5,2];
var quadRot180 = [8,7,6,5,4,3,2,1,0];
var quadRot270 = [2,5,8,1,5,7,0,3,6];

function init()  { 	
    game = new Game(new Scene());
		
    window.addEventListener('mousemove', onMouseMove, false );
    window.addEventListener('mousedown', onMouseDown, false );        
	window.addEventListener('keydown', onKeyDown, false );   
	
	
}



