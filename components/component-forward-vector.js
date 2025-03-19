AFRAME.registerComponent('forward-vector', {
  schema: {
    cameraSelector: { type: 'selector', default: '[camera]' }
  },

  init: function () {
    // //temp
    // document.getElementById('cta').addEventListener('click', () => {
    //   this.show('OUTRO', false);
    //   this.show('INTRO', false);
    //   this.show('GAME', false);
    //   this.show('SHARE', true);
    //   document.getElementById('container-record').style.opacity = 1;
    // })

    
    window.isDown = false;
    this.forwardVector = new THREE.Vector3();
    this.upVector = new THREE.Vector3();
    this.rightVector = new THREE.Vector3();
    this.worldUp = new THREE.Vector3(0, 1, 0);
    
    this.cameraForwardVector = new THREE.Vector3();
    this.cameraUpVector = new THREE.Vector3();
    this.cameraRightVector = new THREE.Vector3();
    
    this.dirVecEl = document.getElementById('dirVec');
    this.dirVecCamEl = document.getElementById('dirVecCam');
    this.upVecEl = document.getElementById('upVec');
    this.upVecCamEl = document.getElementById('upVecCam');
    
    this.fleche_orange_l = document.getElementById('fleche_orange_l');
    this.fleche_orange_r = document.getElementById('fleche_orange_r');
    
    this.camera = this.data.cameraSelector.object3D;
    
    //TO DO REMOVE
    this.gameover();
  },

  tick: function () {
    // Update vectors for this entity
    this.el.object3D.getWorldDirection(this.forwardVector);
    this.forwardVector.normalize();

    // Calculate right and up vectors for the entity
    this.rightVector.crossVectors(this.forwardVector, this.worldUp).normalize();
    this.upVector.crossVectors(this.rightVector, this.forwardVector).normalize();

    // Update vectors for camera
    this.camera.getWorldDirection(this.cameraForwardVector);
    this.cameraForwardVector.normalize();

    // Calculate the camera's local up vector using its quaternion
    const cameraQuaternion = new THREE.Quaternion();
    this.camera.getWorldQuaternion(cameraQuaternion);

    // Rotate the world up vector by the camera's quaternion to get the local up vector
    this.cameraUpVector.copy(this.worldUp).applyQuaternion(cameraQuaternion).normalize();

    // Calculate the right vector for the camera
    this.cameraRightVector.crossVectors(this.cameraForwardVector, this.cameraUpVector).normalize();

    // Recalculate the up vector to ensure it's perpendicular to both forward and right
    this.cameraUpVector.crossVectors(this.cameraRightVector, this.cameraForwardVector).normalize();

    // Update display elements
    // this.updateDisplayElement(this.dirVecEl, 'Forw slack', this.forwardVector);
    this.updateDisplayElement(this.dirVecCamEl, 'Forw cam', this.cameraForwardVector);
    // this.updateDisplayElement(this.upVecEl, 'Up slack', this.upVector);
    this.updateDisplayElement(this.upVecCamEl, 'Up cam', this.cameraUpVector);

    // Calculate and display the angle between up vectors (XZ plane)
    const cameraUpXZ = new THREE.Vector2(this.cameraUpVector.x, this.cameraUpVector.z);
    const entityUpXZ = new THREE.Vector2(this.upVector.x, this.upVector.z);

    const angle = Math.atan2(cameraUpXZ.cross(entityUpXZ), cameraUpXZ.dot(entityUpXZ));
    const angleDegrees = (angle * 180 / Math.PI + 360) % 360;


    const angleEl = document.getElementById('angleXZ');
    if (angleEl) {
      angleEl.textContent = `Angle between up vectors (XZ): ${angle.toFixed(2)}°`;
      // angleEl.textContent = `Angle between up vectors (XZ): ${angleDegrees.toFixed(2)}°`;
    }

    // Log vectors (for debugging, remove in production)
    // console.log('Entity Forward Vector:', this.forwardVector);
    // console.log('Entity Up Vector:', this.upVector);
    // console.log('Camera Forward Vector:', this.cameraForwardVector);
    // console.log('Camera Up Vector:', this.cameraUpVector);


    if (window.STATE == 'GAME') {
      this.lookUpDown();
      this.gradientArrow(angle);
    }
    if (window.STATE == 'SHARE') {
      this.lookUpDown();
    }
  },


  updateDisplayElement: function (element, label, vector) {
    if (element) {
      element.textContent = `${label}: 
        X: ${vector.x.toFixed(2)}, 
        Y: ${vector.y.toFixed(2)}, 
        Z: ${vector.z.toFixed(2)}`;
    }
  },

  getForwardVector: function () {
    return this.forwardVector.clone();
  },

  getUpVector: function () {
    return this.upVector.clone();
  },

  getCameraForwardVector: function () {
    return this.cameraForwardVector.clone();
  },

  getCameraUpVector: function () {
    return this.cameraUpVector.clone();
  },

  lookUpDown: function (treshold) {
    window.isDown = this.cameraUpVector.y < 0.70;
    this.show(window.step < 5 ? 'screen_lookat' : 'screen_recenter', !window.isDown);
    this.show('fleche_green', window.isDown);
    this.show('fleche_orange_l', window.isDown);
    this.show('fleche_orange_r', window.isDown);
    this.show('steps', window.isDown);
    this.show('only-down', window.isDown);
    this.show('video-camera-feed', window.isDown);
    // this.showAFrame('camerafeed', window.isDown)

  },
  show: function (el, visible) {
    let elem = document.getElementById(el);
    if (visible) {
      elem.classList.remove('hidden');
    } else {
      elem.classList.add('hidden');
    }
  },
  showAFrame: function (el, visible) {
    console.log('showAframe ' + el + visible)
    let elem = document.getElementById(el);
    elem.setAttribute('visible', visible);
  },

  gradientArrow: function (angle) {
    if (angle >= 0) this.fleche_orange_l.style.opacity = angle * 10;
    else this.fleche_orange_r.style.opacity = -angle * 10;

    //You missed
    if (window.isDown) this.show('screen_missed', (angle * 10 > 1.5 || angle * 10 <= -1.5))
    //After 5 steps, missed, gameover
    if (window.step > 5 && (angle * 10 > 1.5 || angle * 10 <= -1.5)) this.gameover();
  },

  gameover: function () {
    document.getElementById('steps-outro').textContent = '' + step + ' STEPS';
    window.STATE = "OUTRO";
    this.show('video-camera-feed', false)
    this.show('INTRO', false)
    this.show('GAME', false)
    this.show('OUTRO', true)
    this,show('screen_iwalked', false);
    this,show('screen_gameover', true);
    this,show('cta', true);
    this.show('learn', true);
    // this.show('canvas-part', false) //TODO find another solution as the svg cannot be hidden, only opacity but then zone not clickable, why ?
    // this.show('container-record', false)
    document.getElementById('container-record').style.opacity = 0;
    
    document.getElementById('cta').addEventListener('click', () => {
      console.log('cta clicked')
      window.STATE = "SHARE";
      // this.show('OUTRO', false);
      this.show('INTRO', false);
      this.show('GAME', false);
      this.show('SHARE', true);
      this,show('screen_gameover', false);
      this,show('screen_iwalked', true);
      this,show('cta', false);
      this.show('learn', false);
      // this.show('canvas-part', true)
      // this.show('container-record', true)
      document.getElementById('container-record').style.opacity = 1;
      document.getElementById('container-record').style.zIndex = 6;
      // this.show('video-camera-feed', false)
      // document.getElementById('video-camera-feed').classList.remove('hidden');//baba
    })

    window.addEventListener('backTapped', (e) => {
        console.log('backTapped:', e.detail);
        this.gameover();
      // Output: { message: "Hello from Script 1", timestamp: 1648228834567 }
    });
  }


});


//TODO 

// if > 5 pas, game over