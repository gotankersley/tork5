//standard global variables
var container, sceneRoot, camera, renderer, controls;
var containerWidth, containerHeight;
var clock = new THREE.Clock();

//Global variables
var gears = [];
var centerGear;
var quads = [];
var origin;
var pin;
var pins = [];
var boardTarget;
var spaceTarget;
init();

var quadDirX = [-1, 1, -1, 1];
var quadDirZ = [-1, -1, 1, 1];
var quadRot90 = [6,3,0,7,4,1,8,5,2];
var quadRot180 = [8,7,6,5,4,3,2,1,0];
var quadRot270 = [2,5,8,1,5,7,0,3,6];

var game;
function init()  {    
    game = new Game();
		
    window.addEventListener('mousemove', onMouseMove, false );
    window.addEventListener('mousedown', onMouseDown, false );        
	window.addEventListener('keydown', onKeyDown, false );   
	
	//sceneRoot
	sceneRoot = new THREE.Scene();
    
	//Camera
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	sceneRoot.add(camera);
	camera.position.set(80,150,400);
	camera.lookAt(sceneRoot.position);
	
	//Renderer
	if (Detector.webgl) renderer = new THREE.WebGLRenderer( {antialias:true} );
	else renderer = new THREE.CanvasRenderer(); 
    
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	container = document.getElementById( 'container' );
	container.appendChild( renderer.domElement );
    containerWidth = container.clientWidth;
    containerHeight = container.clientHeight;
    
	//Controls
	controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.center = new THREE.Vector3(QUAD_SIZE, 10, QUAD_SIZE);

	//Events
	THREEx.WindowResize(renderer, camera);
	THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
    
	//Light
	var light = new THREE.PointLight(0xffffff);
	light.position.set(100,250,100);
	scene.add(light);
		
	//var light2 = new THREE.PointLight( 0xff0000, 10, 100 ); 
	//light2.position.set( 50, 50, 50 ); 
	//scene.add( light2 );	
		
    var ambientLight = new THREE.AmbientLight(0x111111);
	sceneRoot.add(ambientLight);	
}



