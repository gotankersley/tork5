//standard three.js global variables
var container, scene, camera, renderer, controls;
var containerWidth, containerHeight;

//Objects
var gears = [];
var centerGear;
var quads = [];
var origin;
var pin1;
var pin2;
var pins = [];
var boardTarget;
var cursorObj;
var arrows = [];
var arrowTarget;
var arrowParent;

//Materials
var materialCursor;
var materialArrow;
var materialArrowHover;
var materialPin1;
var materialPin2;
var materialWinLine;
var materialQuad;

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
	//THREEx.FullScreen.bindKey({ charCode : 'm'.charCodeAt(0) });
    
	//Materials
	materialCursor = new THREE.MeshLambertMaterial( { color: 0x008800, transparent: true, opacity: 0.5  } );	
    materialArrow = new THREE.MeshLambertMaterial( { color: 0xaaaaaa, transparent: true, opacity: 0.8  } );
    materialArrowHover = new THREE.MeshLambertMaterial( { color: 0x008800 });
	materialPin2 = new THREE.MeshLambertMaterial( { color: 0x9999ff } );
	materialWinLine = new THREE.MeshLambertMaterial( { color: 0xff0000, transparent: true, opacity: 0.8  } );	
	
	//Light
	var light = new THREE.PointLight(0xffffff);
	light.position.set(100,-250,100);
	light.position
	scene.add(light);	

	var light2 = new THREE.PointLight(0xffffff);
	light2.position.set(100,250,100);	
	scene.add(light2);	
	
    var ambientLight = new THREE.AmbientLight(0x111111);
	scene.add(ambientLight);	
	
	//Load models
    //this.loadOrigin();
    //this.loadFloor();
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
    arrows = [0,0,0,0,0,0,0,0];
    var iToOctant = [4,0,1,5,7,3,2,6];
	arrowParent = new THREE.Object3D();    
	arrowParent.position.set(-HALF_UNIT,0,-HALF_UNIT);
	var qs = [0,1,3,2]; //Rotate around board clockwise
	var arrowDirX = [-1,1,-1,1,1,-1,1,-1];
	var arrowDirZ = [1,-1,-1,1,-1,1,1,-1];	
	for (var i = 0; i < ALL_ROTATIONS; i++) {		
		var q = qs[Math.floor(i/2)];		
		var qr = Math.floor(q / QUAD_COUNT);
		var qc = q % QUAD_COUNT;
		var rot = (i % 2 != 0)? ROT_CLOCKWISE : ROT_ANTICLOCKWISE;
		var arrowMesh = new THREE.Mesh(geometry, materialArrow);		
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
		arrowMesh.visible = false;
		arrowParent.add(arrowMesh);
		arrows[iToOctant[i]] = arrowMesh;
	}
	scene.add(arrowParent);
	
}

Stage.prototype.loadGears = function( geometry, materials ) {		
	var material = new THREE.MeshLambertMaterial( { color: 0xbb3333 } );	

	for (var i = 0; i < BOARD_QUADS; i++) {
		var r = Math.floor(i / 2);
		var c = i % 2;
		var gear = new THREE.Mesh( geometry, material );			
		gear.position.x = (c * QUAD_SIZE) + UNIT_SIZE + (quadDirX[i] * UNIT_SIZE);
		gear.position.z = (r * QUAD_SIZE) + UNIT_SIZE + (quadDirZ[i] * UNIT_SIZE);
		
		gears.push(gear);
		scene.add( gear );
	}

	gears[0].material = materialPin2;
	gears[3].material = materialPin2; 
	
	//Add center gear
	centerGear = new THREE.Mesh( geometry, material );
	centerGear.position.set(HALF_BOARD - HALF_UNIT,-4,HALF_BOARD - HALF_UNIT);
    centerGear.scale.set(0.8,1,0.8);
    centerGear.position.y += HALF_UNIT + 1.5;
    centerGear.rotateX(180 * (Math.PI/180));
	centerGear.material = materialPin2;
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
	material.materials[0].emissive = new THREE.Color(0.5, 0.5, 0.5);
	var model = new THREE.Mesh( geometry, material );
	var SPACER_SIZE = 3;
	model.position.set((UNIT_SIZE * 2) + HALF_UNIT - SPACER_SIZE, 0, (UNIT_SIZE * 2) + HALF_UNIT - SPACER_SIZE);
	scene.add( model );
}

Stage.prototype.loadPin = function( geometry, materials ) {
	var material = new THREE.MeshFaceMaterial( materials );	
	materialPin1 = material.materials[0];
	pin1 = new THREE.Mesh( geometry, material );	
	
	//pin2Geo = new THREE.SphereGeometry( 10, 12, 12 );	
	//pin2Geo = new THREE.CubeGeometry( (UNIT_SIZE*2)/3, (UNIT_SIZE*3)/2, (UNIT_SIZE*2)/3);	
	//pin2 = new THREE.Mesh( pin2Geo, materialPin2 );	
	//pin2.position.y = UNIT_SIZE;
}

Stage.prototype.loadQuads = function( geometry, materials ) {	
	materialQuad = new THREE.MeshFaceMaterial( materials );	
	materialQuad.materials[0].emissive = new THREE.Color(0.8, 0.8, 0.8);
	for (var i = 0; i < BOARD_QUADS; i++) {
		var r = Math.floor(i / 2);
		var c = i % 2;
		var quad = new THREE.Mesh( geometry, materialQuad );		
		quad.position.x = (c * QUAD_SIZE) + UNIT_SIZE;
		quad.position.z = (r * QUAD_SIZE) + UNIT_SIZE;
				
		quads.push(quad);
		scene.add( quad );
	}
}

Stage.prototype.loadSky = function() {
	var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
	//var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
	var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0xffffff, side: THREE.BackSide } );
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
	var arrowGeo = new THREE.PlaneGeometry(ARROW_TARGET_SIZE, ARROW_TARGET_SIZE);
	var arrowMat = new THREE.MeshLambertMaterial( { color: 0x888800 } );	
	arrowTarget = new THREE.Mesh(arrowGeo, arrowMat);
	arrowTarget.rotation.x = -Math.PI / 2;
	arrowTarget.position.set(HALF_BOARD - HALF_UNIT, UNIT_SIZE, HALF_BOARD - HALF_UNIT);
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
	var showArrows;	
	if (mode == MODE_PLACE) {
        cursorObj.visible = true;
		showArrows = false;
    }
	else if (mode == MODE_ROTATE) {
        cursorObj.visible = false;
        showArrows = true;
    }
	
	//Toggle arrow visibility
	for (var i = 0; i < ALL_ROTATIONS; i++ ) {
		arrows[i].visible = showArrows;
	}
}

Stage.prototype.placePin = function(pos, q, turn, completeFn) {    		   
    var quadPos = new Pos(pos.r % 3, pos.c % 3);
    //var pin = (turn != PLAYER1)? pin1.clone() : pin2.clone();
	var pin = pin1.clone();
	if (turn == PLAYER2) pin.material = materialPin2;
    pin.rotation.y = -quads[q].rotation.y; //Negate parent rotation so we can translate aligned with world axis
    var point = posToPoint(quadPos);
    pin.translateX(-UNIT_SIZE + point.x);
    pin.translateZ(-UNIT_SIZE + point.z);
    quads[q].add(pin);   	    
    pins.push(pin);    
	completeFn.call(game);
}

Stage.prototype.rotateQuad = function(q, r, completeFn) {	
	//SETTING_ROT_ANIM
	var quad = quads[q];
	var x = quad.position.x;
	var z = quad.position.z;
	
	//Move out
	var tween = new TWEEN.Tween({d:0}).to({d:UNIT_SIZE}, ROTATION_DURATION);
	tween.onUpdate(function() {		
		quad.position.x = x + (this.d * quadDirX[q]);
		quad.position.z = z + (this.d * quadDirZ[q]);				
	});
	
	//Rotate - quad and gears
	var rotDir = (r == ROT_CLOCKWISE)? 1 : -1;
	var tween2 = new TWEEN.Tween({r:0}).to({r:90 * rotDir}, ROTATION_DURATION);
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
	var tween3 = new TWEEN.Tween({d:UNIT_SIZE}).to({d:0}, ROTATION_DURATION);
	tween3.onUpdate(function() {		
		quad.position.x = x + this.d * quadDirX[q];
		quad.position.z = z + this.d * quadDirZ[q];				
	});
	tween3.onComplete(function() {		
		completeFn.call(game);
	});	
	tween.chain(tween2);
	tween2.chain(tween3);
	tween.start();
	
}
Stage.prototype.showWinLines = function(winRCs) {
	//Convert win lines from row/col to points  
	var offset = 1;
    for (var side in winRCs) {
        for (var i in winRCs[side]) {
			var line = winRCs[side][i];		   			
			var p1 = posToPoint(new Pos(line[0], line[1]), UNIT_SIZE * 2);
			var p2 = posToPoint(new Pos(line[2], line[3]), UNIT_SIZE * 2);					            
            var lineObj = createLine(p1, p2);
			scene.add(lineObj);
		}
    } 
}

function createLine(p1, p2) {        
    //Points p1, and p2 should be pre-sorted    
    var lenX = Math.abs(p1.x - p2.x);
    var lenZ = Math.abs(p1.z - p2.z);
    var length = Math.sqrt((lenX * lenX) + (lenZ * lenZ)) + UNIT_SIZE; 
    var angle;
      
    if (p1.z == p2.z) angle = 0;   //Horizontal    
    else if (p1.x == p2.x) angle = Math.PI/2; //Vertical           
    else if (p2.x > p1.x) angle = -Math.PI/4; //Diagonal TR->BL   
    else angle = Math.PI/4; //Diagonal TL->BR    
    
    var lineGeo = new THREE.CylinderGeometry(LINE_SIZE, LINE_SIZE, length, 8, 8);    
    var line = new THREE.Mesh(lineGeo, materialWinLine);     
    //plane.rotation.x = -Math.PI / 2;
    line.rotation.z = -Math.PI / 2;
    line.rotation.y = angle;
    line.position.set((p1.x + p2.x) / 2, UNIT_SIZE + HALF_UNIT, (p1.z + p2.z) / 2);
    return line;
}



//Render
Stage.prototype.render = function() {
    controls.update();		    
	renderer.render(scene, camera );
}
//end class Stage