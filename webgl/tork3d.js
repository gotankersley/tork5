var UNIT_SIZE = 30;
var HALF_UNIT = UNIT_SIZE / 2;
var QUAD_SIZE = UNIT_SIZE * 3;
var BOARD_SIZE = UNIT_SIZE * 6;

//standard global variables
var container, scene, camera, renderer, controls, stats;
var containerWidth, containerHeight;
var keyboard = new KeyboardState();
var clock = new THREE.Clock();
var projector = new THREE.Projector();
var mouseVector = new THREE.Vector3();
var selected = new Pos(0, 0);
var overBoard = false;

//Global variables
var gears = [];
var centerGear;
var quads = [];
var origin;
var pin;
var pins = [];
init();

//Class Pos
function Pos(r, c) {
    this.r = r;
    this.c = c;
}
//end class Pos


function init()  {
	// SCENE
	scene = new THREE.Scene();
    
	// CAMERA
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	camera.position.set(80,150,400);
	camera.lookAt(scene.position);	
	// RENDERER
	if (Detector.webgl) renderer = new THREE.WebGLRenderer( {antialias:true} );
	else renderer = new THREE.CanvasRenderer(); 
    
	renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
	container = document.getElementById( 'container' );
	container.appendChild( renderer.domElement );
    containerWidth = container.clientWidth;
    containerHeight = container.clientHeight;
    
	// EVENTS
	THREEx.WindowResize(renderer, camera);
	THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
    window.addEventListener( 'mousemove', onMouseMove, false );
    window.addEventListener( 'mousedown', onMouseDown, false );
    
	// CONTROLS
	controls = new THREE.OrbitControls( camera, renderer.domElement );
    controls.center = new THREE.Vector3(QUAD_SIZE, 10, QUAD_SIZE);
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
	//floor.position.y = 0;
	floor.rotation.x = Math.PI / 2;
	scene.add(floor);
    
	// SKYBOX
	var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
	var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
	var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
	scene.add(skyBox);
		
	// Models	
	var geometry = new THREE.SphereGeometry( 10, 12, 12 );
	var material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
	origin = new THREE.Mesh( geometry, material );
	origin.position.set(0,20,0);
	scene.add(origin);
    
    var jsonLoader = new THREE.JSONLoader();	
	jsonLoader.load('models/gear2.js', addGears);   
	jsonLoader.load('models/quad2.js', addQuads);   
	jsonLoader.load('models/spacer2.js', addSpacer);   
	jsonLoader.load('models/pin2.js', addPin);   
	
	animate();
}

function addSpacer( geometry, materials ) {
	var material = new THREE.MeshFaceMaterial( materials );	
	var model = new THREE.Mesh( geometry, material );
	var SPACER_SIZE = 3;
	model.position.set((UNIT_SIZE * 2) + HALF_UNIT - SPACER_SIZE, 0, (UNIT_SIZE * 2) + HALF_UNIT - SPACER_SIZE);
	scene.add( model );
}

function addPin( geometry, materials ) {
	var material = new THREE.MeshFaceMaterial( materials );	
	pin = new THREE.Mesh( geometry, material );	
	scene.add( pin );
}

function addQuads( geometry, materials ) {	
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


function addGears( geometry, materials ) {	
	//var material = new THREE.MeshFaceMaterial( materials );
	var material = new THREE.MeshLambertMaterial( { color: 0x880000 } );	
	var offsetsX = [-1, 1, -1, 1];
	var offsetsZ = [-1, -1, 1, 1];
	for (var i = 0; i < BOARD_QUADS; i++) {
		var r = Math.floor(i / 2);
		var c = i % 2;
		var gear = new THREE.Mesh( geometry, material );			
		gear.position.x = (c * QUAD_SIZE) + UNIT_SIZE + (offsetsX[i] * UNIT_SIZE);
		gear.position.z = (r * QUAD_SIZE) + UNIT_SIZE + (offsetsZ[i] * UNIT_SIZE);
		
		gears.push(gear);
		scene.add( gear );
	}

	//Add center gear
	//var centerGear = new THREE.Mesh( geometry, material );
	//centerGear.position.set(0,0,0);
	//scene.add( centerGear );
}

function animate() {
	//if (gears.length) gears[0].rotateY(0.01);
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

function onMouseMove(e) {
    mouseVector.x = 2 * (e.clientX / containerWidth) - 1;
    mouseVector.y = 1 - 2 * ( e.clientY / containerHeight );
    var raycaster = projector.pickingRay( mouseVector.clone(), camera );
    var intersects = raycaster.intersectObjects( quads);
    //Find intersections
    if (intersects.length) {
        overBoard = true;
        var index = 0;
        //Loop through intersections if there is more than one to find the closest
        if (intersects.length > 1) {
            var minDist = 100000;            
            for (var i = 0; i < intersects.length; i++) {
                if (intersects[i].distance < minDist) {
                    minDist = intersects[i].distance;
                    index = i;
                }
            }
        }   
        selected = pointToPos(intersects[index].point);
        pin.position = posToPoint(selected);        
    }
    else overBoard = false;
}

function onMouseDown(e) {    
    if (overBoard) {
        var p = pin.clone();
        pins.push(p);
        quads[0].add(p);        
    }
}

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
