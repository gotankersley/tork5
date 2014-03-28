
//standard global variables
var container, scene, camera, renderer, controls, stats;
var keyboard = new KeyboardState();
var clock = new THREE.Clock();

//Global variables
var gears = [];
var centerGear;
var quads = [];
var mesh;

init();


function init()  {
	// SCENE
	scene = new THREE.Scene();
    
	// CAMERA
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	camera.position.set(0,150,400);
	camera.lookAt(scene.position);	
	// RENDERER
	if (Detector.webgl) renderer = new THREE.WebGLRenderer( {antialias:true} );
	else renderer = new THREE.CanvasRenderer(); 
    
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	container = document.getElementById( 'container' );
	container.appendChild( renderer.domElement );
    
	// EVENTS
	THREEx.WindowResize(renderer, camera);
	THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
    
	// CONTROLS
	controls = new THREE.OrbitControls( camera, renderer.domElement );
    
	// STATS
	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.bottom = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );
    
	// LIGHT
	var light = new THREE.PointLight(0xffffff);
	light.position.set(100,250,100);
	scene.add(light);
		
	//var light2 = new THREE.PointLight( 0xff0000, 10, 100 ); 
	//light2.position.set( 50, 50, 50 ); 
	//scene.add( light2 );	
		
    var ambientLight = new THREE.AmbientLight(0x111111);
	scene.add(ambientLight);	
	
    
	// FLOOR
	var floorTexture = new THREE.ImageUtils.loadTexture( 'textures/checkerboard.jpg' );
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
	floorTexture.repeat.set( 10, 10 );
	var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
	var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
	floor.position.y = -10;
	floor.rotation.x = Math.PI / 2;
	scene.add(floor);
    
	// SKYBOX
	var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
	var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
	var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
	scene.add(skyBox);
		
	// Models	
	var geometry = new THREE.SphereGeometry( 30, 32, 16 );
	var material = new THREE.MeshLambertMaterial( { color: 0x000088 } );
	mesh = new THREE.Mesh( geometry, material );
	mesh.position.set(0,40,0);
	scene.add(mesh);
    
    var jsonLoader = new THREE.JSONLoader();	
	jsonLoader.load('models/gear.js', addGears);   
	jsonLoader.load('models/quad.js', addQuads);   
	jsonLoader.load('models/spacer.js', addModelToScene);   
	
	animate();
}

function addModelToScene( geometry, materials ) {
	var material = new THREE.MeshFaceMaterial( materials );
	//var material = new THREE.MeshLambertMaterial( { color: 0x000088 } );
	var model = new THREE.Mesh( geometry, material );
    model.position.y = 10;
	model.scale.set(30,30,30);
	scene.add( model );
}

function addQuads( geometry, materials ) {	
	var material = new THREE.MeshFaceMaterial( materials );		
	var QUAD_SIZE = 100;
	for (var i = 0; i < BOARD_QUADS; i++) {
		var quad = new THREE.Mesh( geometry, material );
		quad.scale.set(30,30,30);		
		quad.position.set((i % 2) * QUAD_SIZE, 10, Math.floor(i / 2) * QUAD_SIZE);
				
		quads.push(quad);
		scene.add( quad );
	}

}


function addGears( geometry, materials ) {	
	//var material = new THREE.MeshFaceMaterial( materials );
	var material = new THREE.MeshLambertMaterial( { color: 0x880000 } );
	var GEAR_SIZE = 150;
	for (var i = 0; i < BOARD_QUADS; i++) {
		var gear = new THREE.Mesh( geometry, material );
		gear.scale.set(30,30,30);		
		gear.position.set((i % 2) * GEAR_SIZE, 10, Math.floor(i / 2) * GEAR_SIZE);
				
		gears.push(gear);
		scene.add( gear );
	}

	//Add center gear
	//var centerGear = new THREE.Mesh( geometry, material );
	//centerGear.position.set(0,0,0);
	//scene.add( centerGear );
}

function animate() {

    requestAnimationFrame( animate );
	renderer.render(scene,camera );
	update();
}

function update() {
	keyboard.update();
	if (keyboard.pressed('Z')) {	 		
		gears.translateX( -10 );	
	}
	
	controls.update();
	//stats.update();
}