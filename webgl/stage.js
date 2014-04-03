//standard three.js global variables
var container, scene, camera, renderer, controls;
var containerWidth, containerHeight;

//Global variables
var gears = [];
var centerGear;
var quads = [];
var origin;
var pin;
var pins = [];
var boardTarget;
var cursorObj;
var arrows = [];
var arrowTarget;

//Materials
var materialCursor;

//Class Stage
function Stage(containerId) {	
  
	scene = new THREE.Scene();
    
	//Camera
	var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
	var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 0.1, FAR = 20000;
	camera = new THREE.PerspectiveCamera( VIEW_ANGLE, ASPECT, NEAR, FAR);
	scene.add(camera);
	camera.position.set(80,150,400);
	camera.lookAt(scene.position);
	
	renderer = new THREE.WebGLRenderer( {antialias:true} );
    
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
    
	//Materials
	materialCursor = new THREE.MeshLambertMaterial( { color: 0x008800, transparent: true, opacity: 0.5  } );	
	
	//Light
	var light = new THREE.PointLight(0xffffff);
	light.position.set(100,250,100);
	scene.add(light);
		
	//var light2 = new THREE.PointLight( 0xff0000, 10, 100 ); 
	//light2.position.set( 50, 50, 50 ); 
	//scene.add( light2 );	
		
    var ambientLight = new THREE.AmbientLight(0x111111);
	scene.add(ambientLight);	
    this.loadOrigin();
    this.loadFloor();
    this.loadSky();
	this.loadTargets();	
    var jsonLoader = new THREE.JSONLoader();	
	jsonLoader.load('models/gear.js', this.loadGears);   
	jsonLoader.load('models/quad.js', this.loadQuads);   
	jsonLoader.load('models/spacer.js', this.loadSpacer);   
	jsonLoader.load('models/pin.js', this.loadPin);   
	jsonLoader.load('models/arrow.js', this.loadArrows);   
}

//Load functions
Stage.prototype.loadArrows = function(geometry) {
	var material = new THREE.MeshLambertMaterial( { color: 0xaaaaaa } );
	var arrowParent = new THREE.Object3D();
	arrowParent.position.set(-HALF_UNIT,0,-HALF_UNIT);
	var qs = [0,1,3,2]; //Rotate around board clockwise
	var arrowDirX = [-1,1,-1,1,1,-1,1,-1];
	var arrowDirZ = [1,-1,-1,1,-1,1,1,-1];	
	for (var i = 0; i < ALL_ROTATIONS; i++) {		
		var q = qs[Math.floor(i/2)];		
		var qr = Math.floor(q / QUAD_COUNT);
		var qc = q % QUAD_COUNT;
		var rot = (i % 2 != 0)? ROT_CLOCKWISE : ROT_ANTICLOCKWISE;
		var arrowMesh = new THREE.Mesh(geometry, material);		
		arrowMesh.position.set(
			(BOARD_SIZE * qc) + (arrowDirX[i] * (UNIT_SIZE/4) * 3), //X
			UNIT_SIZE,  //Y    
			(BOARD_SIZE * qr) + (arrowDirZ[i] * (UNIT_SIZE/4) * 3) //Z
		);								
		if (rot == ROT_ANTICLOCKWISE) {
			arrowMesh.rotateY((i + 1) * -Math.PI/4);
			arrowMesh.rotateX(Math.PI);			
		}
		else arrowMesh.rotateY(i * -Math.PI/4);

		arrowParent.add(arrowMesh);
		arrows.push(arrowMesh);
	}
	scene.add(arrowParent);
	
}

Stage.prototype.loadGears = function( geometry, materials ) {	
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
    centerGear.position.y += HALF_UNIT + 1.5;
    centerGear.rotateX(180 * (Math.PI/180));
	scene.add( centerGear );
}

Stage.prototype.loadOrigin = function() {
	var geometry = new THREE.SphereGeometry( 10, 12, 12 );
	var material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
	origin = new THREE.Mesh( geometry, material );
	origin.position.set(0,20,0);
	scene.add(origin);
}

Stage.prototype.loadFloor = function() {	
	var floorTexture = new THREE.ImageUtils.loadTexture( 'textures/checkerboard.jpg' );
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
	floorTexture.repeat.set( 10, 10 );
	var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
	var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
	
	floor.rotation.x = Math.PI / 2;
	scene.add(floor);
}

Stage.prototype.loadSpacer = function( geometry, materials ) {
	var material = new THREE.MeshFaceMaterial( materials );	
	var model = new THREE.Mesh( geometry, material );
	var SPACER_SIZE = 3;
	model.position.set((UNIT_SIZE * 2) + HALF_UNIT - SPACER_SIZE, 0, (UNIT_SIZE * 2) + HALF_UNIT - SPACER_SIZE);
	scene.add( model );
}

Stage.prototype.loadPin = function( geometry, materials ) {
	var material = new THREE.MeshFaceMaterial( materials );	
	pin = new THREE.Mesh( geometry, material );	
	//scene.add( pin );
}

Stage.prototype.loadQuads = function( geometry, materials ) {	
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

Stage.prototype.loadSky = function() {
	var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
	var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
	var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
	scene.add(skyBox);
}

Stage.prototype.loadTargets = function() {
	//Add board mouse target - invisible	
	var boardGeo = new THREE.PlaneGeometry(BOARD_SIZE, BOARD_SIZE);
	var boardMat = new THREE.MeshLambertMaterial( { color: 0x888800 } );	
	boardTarget = new THREE.Mesh(boardGeo, boardMat);
	boardTarget.rotation.x = -Math.PI / 2;
	boardTarget.position.set(HALF_BOARD - HALF_UNIT,21.5, HALF_BOARD - HALF_UNIT);
	boardTarget.visible = false;
	scene.add(boardTarget);	
	
	//Arrow targets for rotation
	var arrowGeo = new THREE.PlaneGeometry(BOARD_SIZE + (UNIT_SIZE * 3), BOARD_SIZE + (UNIT_SIZE * 3));
	var arrowMat = new THREE.MeshLambertMaterial( { color: 0x888800 } );	
	arrowTarget = new THREE.Mesh(arrowGeo, arrowMat);
	arrowTarget.rotation.x = -Math.PI / 2;
	arrowTarget.position.set(HALF_BOARD - HALF_UNIT,UNIT_SIZE, HALF_BOARD - HALF_UNIT);
	arrowTarget.visible = false;
	scene.add(arrowTarget);		
	
	//Space selector
	var spaceGeo = new THREE.PlaneGeometry(UNIT_SIZE, UNIT_SIZE);
	var spaceMat = materialCursor;
	cursorObj = new THREE.Mesh(spaceGeo, spaceMat);
	cursorObj.rotation.x = -Math.PI / 2;
	cursorObj.position.set(posToPoint(new Pos(0, 0), 22));	
	scene.add(cursorObj);	
	
}




//Animation
Stage.prototype.onModeChanged = function(mode) {
	if (mode == MODE_PLACE) cursorObj.visible = true;
	else if (mode == MODE_ROTATE) cursorObj.visible = false;
}

Stage.prototype.placePin = function(pos, completeFn) {
    //Get selected quad
    var qr = Math.floor(pos.r / QUAD_ROW_SPACES);
    var qc = Math.floor(pos.c / QUAD_COL_SPACES);
    selQuad = (qr * QUAD_COUNT) + qc;        
	
	    
    var p = pin.clone();
    pins.push(p);    
    p.position = posToQuadPoint(pos, 0, selQuad);		
    quads[selQuad].add(p);   	
	completeFn.call(game);
}

Stage.prototype.rotateQuad = function() {
	cursorObj.visible = false;
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

//Render
Stage.prototype.render = function() {
    controls.update();		    
	renderer.render(scene, camera );
}
//end class Stage