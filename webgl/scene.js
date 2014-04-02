//Class Scene
function Scene() {
	
   
	//Floor
	var floorTexture = new THREE.ImageUtils.loadTexture( 'textures/checkerboard.jpg' );
	floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping; 
	floorTexture.repeat.set( 10, 10 );
	var floorMaterial = new THREE.MeshBasicMaterial( { map: floorTexture, side: THREE.DoubleSide } );
	var floorGeometry = new THREE.PlaneGeometry(1000, 1000, 10, 10);
	var floor = new THREE.Mesh(floorGeometry, floorMaterial);
	
	floor.rotation.x = Math.PI / 2;
	sceneRoot.add(floor);
    
	//Skybox
	var skyBoxGeometry = new THREE.CubeGeometry( 10000, 10000, 10000 );
	var skyBoxMaterial = new THREE.MeshBasicMaterial( { color: 0x9999ff, side: THREE.BackSide } );
	var skyBox = new THREE.Mesh( skyBoxGeometry, skyBoxMaterial );
	sceneRoot.add(skyBox);
		
	//Models	
	var geometry = new THREE.SphereGeometry( 10, 12, 12 );
	var material = new THREE.MeshLambertMaterial( { color: 0x00ff00 } );
	origin = new THREE.Mesh( geometry, material );
	origin.position.set(0,20,0);
	sceneRoot.add(origin);
    
    var jsonLoader = new THREE.JSONLoader();	
	jsonLoader.load('models/gear2.js', addGears);   
	jsonLoader.load('models/quad2.js', addQuads);   
	jsonLoader.load('models/spacer2.js', addSpacer);   
	jsonLoader.load('models/pin2.js', addPin);   
	AddTargets();
	
	onFrame();
}

//Load functions
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