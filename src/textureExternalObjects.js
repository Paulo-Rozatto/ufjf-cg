function main()
{
  var scene = new THREE.Scene();    // Create main scene
  var clock = new THREE.Clock();
  var stats = initStats();          // To show FPS information
  var light = initDefaultLighting(scene, new THREE.Vector3(1, 2, 0.8)); // Use default light
  var lightSphere = createSphere(0.1, 10, 10);
    lightSphere.position.copy(light.position);
  scene.add(lightSphere);

  var renderer = initRenderer();    // View function in util/utils
    renderer.setClearColor("rgb(30, 30, 42)");
  var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.lookAt(0, 0, 0);
    camera.position.set(2.18, 1.62, 3.31);
    camera.up.set( 0, 1, 0 );

  // Control the appearence of first object loaded
  var firstRender = false;

  // To use the keyboard
  var keyboard = new KeyboardState();

  // Enable mouse rotation, pan, zoom etc.
  var trackballControls = new THREE.TrackballControls( camera, renderer.domElement );

  // Listen window size changes
  window.addEventListener( 'resize', function(){onWindowResize(camera, renderer)}, false );

  var groundPlane = createGroundPlane(4.0, 2.5); // width and height
    groundPlane.rotateX(degreesToRadians(-90));
  scene.add(groundPlane);

  // Show axes (parameter is size of each axis)
  var axesHelper = new THREE.AxesHelper( 3 );
    axesHelper.visible = false;
  scene.add( axesHelper );

  // Show text information onscreen
  showInformation();

  var infoBox = new SecondaryBox("");

  //---------------------------------------------------------
  // Load external objects
  var objectArray = new Array();
  var activeObject = 0; // View first object

  loadOBJFile('../assets/objects/', 'L200', 2.5, 90);
  loadOBJFile('../assets/objects/', 'plane', 3.0, 0);
  loadOBJFile('../assets/objects/', 'tank', 2.0, 90);

  loadGLTFFile('../assets/objects/orca/','scene.gltf', 4.0, 180);
  loadGLTFFile('../assets/objects/wooden_goose/','scene.gltf', 2.0, 90);
  loadGLTFFile('../assets/objects/chair/','scene.gltf', 1.0, 180);

  render();

  function loadOBJFile(modelPath, modelName, desiredScale, angle)
  {
    currentModel = modelName;
    var manager = new THREE.LoadingManager( );

    var mtlLoader = new THREE.MTLLoader( manager );
    mtlLoader.setPath( modelPath );
    mtlLoader.load( modelName + '.mtl', function ( materials ) {
         materials.preload();

         var objLoader = new THREE.OBJLoader( manager );
         objLoader.setMaterials(materials);
         objLoader.setPath(modelPath);
         objLoader.load( modelName + ".obj", function ( obj ) {
           obj.visible = false;
           // Set 'castShadow' property for each children of the group
           obj.traverse( function (child)
           {
             child.castShadow = true;
           });

           obj.traverse( function( node )
           {
             if( node.material ) node.material.side = THREE.DoubleSide;
           });

           var obj = normalizeAndRescale(obj, desiredScale);
           var obj = fixPosition(obj);
           obj.rotateY(degreesToRadians(angle));

           scene.add ( obj );
           objectArray.push( obj );
         }, onProgress, onError );
    });
  }

  function loadGLTFFile(modelPath, modelName, desiredScale, angle)
  {
    var loader = new THREE.GLTFLoader( );
    loader.load( modelPath + modelName, function ( gltf ) {
      var obj = gltf.scene;
      obj.visible = false;
      obj.traverse( function ( child ) {
      	if ( child ) {
           child.castShadow = true;
      	}
      });
      obj.traverse( function( node )
      {
        if( node.material ) node.material.side = THREE.DoubleSide;
      });

      var obj = normalizeAndRescale(obj, desiredScale);
      var obj = fixPosition(obj);
      obj.rotateY(degreesToRadians(angle));

      scene.add ( obj );
      objectArray.push( obj );

			}, onProgress, onError);
  }




  function onError() { };

  function onProgress ( xhr, model ) {
     if ( xhr.lengthComputable ) {
       var percentComplete = xhr.loaded / xhr.total * 100;
       infoBox.changeMessage("Loading... " + Math.round( percentComplete, 2 ) + '% processed' );
     }
  }

  // Normalize scale and multiple by the newScale
  function normalizeAndRescale(obj, newScale)
  {
    var scale = getMaxSize(obj); // Available in 'utils.js'
    obj.scale.set(newScale * (1.0/scale),
                  newScale * (1.0/scale),
                  newScale * (1.0/scale));
    return obj;
  }

  function fixPosition(obj)
  {
   // Fix position of the object over the ground plane
    var box = new THREE.Box3().setFromObject( obj );
    if(box.min.y > 0)
      obj.translateY(-box.min.y);
    else
      obj.translateY(-1*box.min.y);
    return obj;
  }

  function renderFirstObjectLoaded()
  {
    activeObject = 0;
    objectArray[0].visible = true;
    if(!firstRender) firstRender = true;
  }

  function keyboardUpdate()
  {
    keyboard.update();
  	if ( keyboard.down("A") )
    {
      axesHelper.visible = !axesHelper.visible;
    }
    if ( keyboard.down("enter"))
    {
      if(activeObject != 0) objectArray[activeObject].visible = false;
      renderFirstObjectLoaded();
      infoBox.changeMessage("Object " + activeObject);
    }
    if ( keyboard.down("right") )
    {
      if(!firstRender)
      {
        renderFirstObjectLoaded();
        return;
      }
      activeObject++;
      if(activeObject < objectArray.length)
      {
        objectArray[activeObject-1].visible = false;
        objectArray[activeObject].visible = true;
      }
      else {
        activeObject = 0;
        objectArray[objectArray.length-1].visible = false;
        objectArray[0].visible = true;
      }
      infoBox.changeMessage("Object " + activeObject);
    }
    if ( keyboard.down("left") )
    {
      if(!firstRender)
      {
        renderFirstObjectLoaded();
        return;
      }
      activeObject--;
      if(activeObject < 0)
      {
        activeObject = objectArray.length-1;
        objectArray[0].visible = false;
        objectArray[activeObject].visible = true;
      }
      else {
        objectArray[activeObject+1].visible = false;
        objectArray[activeObject].visible = true;
      }
      infoBox.changeMessage("Object " + activeObject);
    }
  }

  function showInformation()
  {
    // Use this to show information onscreen
    controls = new InfoBox();
      controls.add("Texture - External Objects");
      controls.show();
      controls.addParagraph();
      controls.add("Pressione 'ENTER' para mostrar o primeiro objeto carregado.");
      controls.add("Pressione 'A' para visualizar/ocultar os eixos.");
      controls.add("Pressione as setas para direita e esquerda para alterar o objeto.");
      controls.show();
  }

  function createSphere(radius, widthSegments, heightSegments)
  {
    var geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments, 0, Math.PI * 2, 0, Math.PI);
    var material = new THREE.MeshBasicMaterial({color:"rgb(255,255,50)"});
    var object = new THREE.Mesh(geometry, material);
      object.castShadow = true;
    return object;
  }

  function render()
  {
    stats.update();
    trackballControls.update();
    keyboardUpdate();
    requestAnimationFrame(render);
    renderer.render(scene, camera)
  }
}