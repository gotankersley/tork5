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

//Class Scene
function Scene() {
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
    
    var jsonLoader = new THREE.JSONLoader();	
	jsonLoader.load('models/gear.js', addGears);   
	jsonLoader.load('models/quad.js', addQuads);   
	jsonLoader.load('models/spacer.js', addSpacer);   
	jsonLoader.load('models/pin.js', addPin);   
	AddTargets();
	
	onFrame();
}

//Load functions
function loadOrigin() {
	var geometry = new THREE.SphereGeometry( 10, 12, 12 );
	var material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
	origin = new THREE.Mesh( geometry, material );
	origin.position.set(0,20,0);
	sceneRoot.add(origin);
}

function loadSky() {
	var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
	var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
	var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
	sceneRoot.add(skyBox);
}

function loadFloor() {	
	var floorTexture = new THREE.ImageUtils.loadTexture( 'textures/checkerboard.jpg' );
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
	floorTexture.repeat.set( 10, 10 );
	var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
	var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
	
	floor.rotation.x = Math.PI / 2;
	sceneRoot.add(floor);
}

function loadSpacer( geometry, materials ) {
	var material = new THREE.MeshFaceMaterial( materials );	
	var model = new THREE.Mesh( geometry, material );
	var SPACER_SIZE = 3;
	model.position.set((UNIT_SIZE * 2) + HALF_UNIT - SPACER_SIZE, 0, (UNIT_SIZE * 2) + HALF_UNIT - SPACER_SIZE);
	sceneRoot.add( model );
}

function loadPin( geometry, materials ) {
	var material = new THREE.MeshFaceMaterial( materials );	
	pin = new THREE.Mesh( geometry, material );	
	//sceneRoot.add( pin );
}

function loadQuads( geometry, materials ) {	
	var material = new THREE.MeshFaceMaterial( materials );		
	for (var i = 0; i < BOARD_QUADS; i++) {
		var r = Math.floor(i / 2);
		var c = i % 2;
		var quad = new THREE.Mesh( geometry, material );		
		quad.position.x = (c * QUAD_SIZE) + UNIT_SIZE;
		quad.position.z = (r * QUAD_SIZE) + UNIT_SIZE;
				
		quads.push(quad);
		scene.add( quad );
	}
}

function loadTargets() {
	//Add board mouse target - invisible	
	var boardGeo = new THREE.PlaneGeometry(BOARD_SIZE, BOARD_SIZE);
	var boardMat = new THREE.MeshLambertMaterial( { color: 0x888800 } );	
	boardTarget = new THREE.Mesh(boardGeo, boardMat);
	boardTarget.rotation.x = -Math.PI / 2;
	boardTarget.position.set(HALF_BOARD - HALF_UNIT,21.5, HALF_BOARD - HALF_UNIT);
	boardTarget.visible = false;
	sceneRoot.add(boardTarget);	
	
	//Space selector
	var spaceGeo = new THREE.PlaneGeometry(UNIT_SIZE, UNIT_SIZE);
	var spaceMat = new THREE.MeshLambertMaterial( { color: 0x008800, transparent: true, opacity: 0.5  } );	
	spaceTarget = new THREE.Mesh(spaceGeo, spaceMat);
	spaceTarget.rotation.x = -Math.PI / 2;
	spaceTarget.position.set(posToPoint(new Pos(0, 0), 22));	
	sceneRoot.add(spaceTarget);	
	
}

function loadGears( geometry, materials ) {	
	//var material = new THREE.MeshFaceMaterial( materials );
	var material = new THREE.MeshLambertMaterial( { color: 0x880000 } );	

	for (var i = 0; i < BOARD_QUADS; i++) {
		var r = Math.floor(i / 2);
		var c = i % 2;
		var gear = new THREE.Mesh( geometry, material );			
		gear.position.x = (c * QUAD_SIZE) + UNIT_SIZE + (quadDirX[i] * UNIT_SIZE);
		gear.position.z = (r * QUAD_SIZE) + UNIT_SIZE + (quadDirZ[i] * UNIT_SIZE);
		
		gears.push(gear);
		scene.add( gear );
	}

	//Add center gear
	centerGear = new THREE.Mesh( geometry, material );
	centerGear.position.set(HALF_BOARD - HALF_UNIT,-4,HALF_BOARD - HALF_UNIT);
    centerGear.scale.set(0.8,1,0.8);
    centerGear.position.y += HALF_UNIT;
    centerGear.rotateX(180 * (Math.PI/180));
	sceneRoot.add( centerGear );
}



//end class Scene