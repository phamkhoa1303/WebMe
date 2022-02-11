window.onload = init;
const int=null;
function init() {
  let root = new THREERoot({
    createCameraControls:false,
		antialias: true,
    fov:60
  });
  
  // we ll just setup the scene here
  root.renderer.setClearColor(0xffffff, 0);//Colors.DenHuyenBi
  root.renderer.setPixelRatio(window.devicePixelRatio || 1);
  root.camera.position.set(0, 0, 400);


// now for animation let

  let textAnimation = createTextAnimation();
  textAnimation.position.y = -10;
  root.scene.add(textAnimation);

 // now for timeline aspects

  let tl = new TimelineMax({
    repeat:-1, //-1 loop
    repeatDelay:0.25,
    yoyo:true
  });
  tl.fromTo(textAnimation, 4, //4
    {animationProgress:0.0},
    {animationProgress:1.0, ease:Power1.easeInOut},
    0
  );

  createTweenScrubber(tl);
}

// now choose the random text to be display

function createTextAnimation() {
  let geometry = generateTextGeometry('WELCOME TO KHOA\'S WEBSITE', {
    size:14,
    height:0,
    font:'droid sans',
    weight:'bold',
    style:'normal',
    anchor:{x:0.5, y:0.5, z:0.0}
  });

  THREE.BAS.Utils.separateFaces(geometry);

  return new TextAnimation(geometry);
}

//now we calculate animation detail and its math

function generateTextGeometry(text, params) {
  let geometry = new THREE.TextGeometry(text, params);

  geometry.computeBoundingBox();

  geometry.userData = {};
  geometry.userData.size = {
    width: geometry.boundingBox.max.x - geometry.boundingBox.min.x,
    height: geometry.boundingBox.max.y - geometry.boundingBox.min.y,
    depth: geometry.boundingBox.max.z - geometry.boundingBox.min.z
  };

  let anchorX = geometry.userData.size.width * -params.anchor.x;
  let anchorY = geometry.userData.size.height * -params.anchor.y;
  let anchorZ = geometry.userData.size.depth * -params.anchor.z;
  let matrix = new THREE.Matrix4().makeTranslation(anchorX, anchorY, anchorZ);

  geometry.applyMatrix(matrix);

  return geometry;
}


   //    work for classes    keep checking on intervals for bracket mistake and all while in coding of JavaScript


function TextAnimation(textGeometry) {
  let bufferGeometry = new THREE.BAS.ModelBufferGeometry(textGeometry);

  let aAnimation = bufferGeometry.createAttribute('aAnimation', 2);
  let aCentroid = bufferGeometry.createAttribute('aCentroid', 3);
  let aControl0 = bufferGeometry.createAttribute('aControl0', 3);
  let aControl1 = bufferGeometry.createAttribute('aControl1', 3);
  let aEndPosition = bufferGeometry.createAttribute('aEndPosition', 3);

  let faceCount = bufferGeometry.faceCount;
  let i, i2, i3, i4, v;

  let size = textGeometry.userData.size;

  let maxDelayX = 2.0;
  let maxDelayY = 0.25;
  let minDuration = 2;
  let maxDuration = 8;
  let stretch = 0.25;

  this.animationDuration = maxDelayX + maxDelayY + maxDuration - 3;
  this._animationProgress = 0;

  for (i = 0, i2 = 0, i3 = 0, i4 = 0; i < faceCount; i++, i2 += 6, i3 += 9, i4 += 12) {
    let face = textGeometry.faces[i];
    let centroid = THREE.BAS.Utils.computeCentroid(textGeometry, face);

    // animation
    let delayX = Math.max(0, (centroid.x / size.width) * maxDelayX);
    let delayY = Math.max(0, (1.0 - (centroid.y / size.height)) * maxDelayY);
    let duration = THREE.Math.randFloat(minDuration, maxDuration);

    for (v = 0; v < 6; v += 2) {
      aAnimation.array[i2 + v    ] = delayX + delayY + Math.random() * stretch;
      aAnimation.array[i2 + v + 1] = duration;
    }

    // centroid
    for (v = 0; v < 9; v += 3) {
      aCentroid.array[i3 + v    ] = centroid.x;
      aCentroid.array[i3 + v + 1] = centroid.y;
      aCentroid.array[i3 + v + 2] = centroid.z;
    }

    // ctrl
    let c0x = centroid.x + THREE.Math.randFloat(40, 120);
    let c0y = centroid.y + size.height * THREE.Math.randFloat(0.0, 12.0);
    let c0z = THREE.Math.randFloatSpread(120);

    let c1x = centroid.x + THREE.Math.randFloat(80, 120) * -1;
    let c1y = centroid.y + size.height * THREE.Math.randFloat(0.0, 12.0);
    let c1z = THREE.Math.randFloatSpread(120);

    for (v = 0; v < 9; v += 3) {
      aControl0.array[i3 + v    ] = c0x;
      aControl0.array[i3 + v + 1] = c0y;
      aControl0.array[i3 + v + 2] = c0z;

      aControl1.array[i3 + v    ] = c1x;
      aControl1.array[i3 + v + 1] = c1y;
      aControl1.array[i3 + v + 2] = c1z;
    }

    // end position
    let x, y, z;

    x = centroid.x + THREE.Math.randFloatSpread(120);
    y = centroid.y + size.height * THREE.Math.randFloat(0.0, 12.0);
    z = THREE.Math.randFloat(-20, 20);

    for (v = 0; v < 9; v += 3) {
      aEndPosition.array[i3 + v    ] = x;
      aEndPosition.array[i3 + v + 1] = y;
      aEndPosition.array[i3 + v + 2] = z;
    }
  }

  let material = new THREE.BAS.BasicAnimationMaterial({
      shading: THREE.FlatShading,
      side: THREE.DoubleSide,
      transparent: true,
      uniforms: {
        uTime: {type: 'f', value: 0}
      },
      shaderFunctions: [
        THREE.BAS.ShaderChunk['cubic_bezier'],
        THREE.BAS.ShaderChunk['ease_out_cubic']
      ],
      shaderParameters: [
        'uniform float uTime;',
        'attribute vec2 aAnimation;',
        'attribute vec3 aCentroid;',
        'attribute vec3 aControl0;',
        'attribute vec3 aControl1;',
        'attribute vec3 aEndPosition;'
      ],
      shaderVertexInit: [
        'float tDelay = aAnimation.x;',
        'float tDuration = aAnimation.y;',
        'float tTime = clamp(uTime - tDelay, 0.0, tDuration);',
        'float tProgress =  ease(tTime, 0.0, 1.0, tDuration);'
         //'float tProgress = tTime / tDuration;'
      ],
      shaderTransformPosition: [
        'vec3 tPosition = transformed - aCentroid;',
        'tPosition *= 1.0 - tProgress;',
        'tPosition += aCentroid;',
        'tPosition += cubicBezier(tPosition, aControl0, aControl1, aEndPosition, tProgress);',
        'transformed = tPosition;'

        // 'vec3 tPosition = transformed;',
        // 'tPosition *= 1.0 - tProgress;',
        // 'tPosition += cubicBezier(transformed, aControl0, aControl1, aEndPosition, tProgress);',
        // 'tPosition += mix(transformed, aEndPosition, tProgress);',
        // 'transformed = tPosition;'
      ]
    },
    {
      diffuse: Colors.ForestGreen //0000
    }
  );

  THREE.Mesh.call(this, bufferGeometry, material);

  this.frustumCulled = false;
}
TextAnimation.prototype = Object.create(THREE.Mesh.prototype);
TextAnimation.prototype.constructor = TextAnimation;

Object.defineProperty(TextAnimation.prototype, 'animationProgress', {
  get: function() {
    return this._animationProgress;
  },
  set: function(v) {
    this._animationProgress = v;
    this.material.uniforms['uTime'].value = this.animationDuration * v;
  }
});

function THREERoot(params) {
  params = utils.extend({
    antialias:false,
    fov:60,
    zNear:1,
    zFar:10000,

    createCameraControls:true
  }, params);

  this.renderer = new THREE.WebGLRenderer({
    antialias:params.antialias,
    alpha: true
  });
  document.getElementById('three-container').appendChild(this.renderer.domElement);

  this.camera = new THREE.PerspectiveCamera(
    params.fov,
    window.innerWidth / window.innerHeight,
    params.zNear,
    params.zfar
  );

  this.scene = new THREE.Scene();

  if (params.createCameraControls) {
    this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
  }

  this.resize = this.resize.bind(this);
  this.tick = this.tick.bind(this);

  this.resize();
  this.tick();

  window.addEventListener('resize', this.resize, false);
}
THREERoot.prototype = {
  tick: function() {
    this.update();
    this.render();
    requestAnimationFrame(this.tick);
  },
  update: function() {
    this.controls && this.controls.update();
  },
  render: function() {
    this.renderer.render(this.scene, this.camera);
  },
  resize: function() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
};

////////////////////
// UTILS
////////////////////

let utils = {
  extend:function(dst, src) {
    for (let key in src) {
      dst[key] = src[key];
    }

    return dst;
  },
  randSign: function() {
    return Math.random() > 0.5 ? 1 : -1;
  }
};

function createTweenScrubber(tween, seekSpeed) {
  seekSpeed = seekSpeed || 0.001;

  function stop() {
    TweenMax.to(tween, 2, {timeScale:0});
  }

  function resume() {
    TweenMax.to(tween, 2, {timeScale:1});
  }

  function seek(dx) {
    let progress = tween.progress();
    let p = THREE.Math.clamp((progress + (dx * seekSpeed)), 0, 1);

    tween.progress(p);
  }

  let _cx = 0;

  // desktop
  let mouseDown = false;
  document.body.style.cursor = 'pointer';

  window.addEventListener('mousedown', function(e) {
    mouseDown = true;
    document.body.style.cursor = 'ew-resize';
    _cx = e.clientX;
    stop();
  });
  window.addEventListener('mouseup', function(e) {
    mouseDown = false;
    document.body.style.cursor = 'pointer';
    resume();
  });
  window.addEventListener('mousemove', function(e) {
    if (mouseDown === true) {
      let cx = e.clientX;
      let dx = cx - _cx;
      _cx = cx;

      seek(dx);
    }
  });
  // mobile
  window.addEventListener('touchstart', function(e) {
    _cx = e.touches[0].clientX;
    stop();
    e.preventDefault();
  });
  window.addEventListener('touchend', function(e) {
    resume();
    e.preventDefault();
  });
  window.addEventListener('touchmove', function(e) {
    let cx = e.touches[0].clientX;
    let dx = cx - _cx;
    _cx = cx;

    seek(dx);
    e.preventDefault();
  });
}