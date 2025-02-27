AFRAME.registerComponent('forward-vector-cam', {
  schema: {
    // You can add properties here if needed
  },

  init: function() {
    this.forwardVector = new THREE.Vector3();
    this.upVector = new THREE.Vector3();
    this.rightVector = new THREE.Vector3();
    this.worldUp = new THREE.Vector3(0, 1, 0);
    this.dirVecEl = document.getElementById('dirVecCam');
    this.upVecEl = document.getElementById('upVecCam');
  },

  tick: function() {
    // Update the forward vector every frame
    this.el.object3D.getWorldDirection(this.forwardVector);
    
    // Normalize the forward vector
    this.forwardVector.normalize();

    // Calculate the right vector
    this.rightVector.crossVectors(this.forwardVector, this.worldUp).normalize();

    // Calculate the up vector
    this.upVector.crossVectors(this.rightVector, this.forwardVector).normalize();

    // Log the vectors (for debugging, remove in production)
    console.log('Forward Vector:', this.forwardVector);
    console.log('Up Vector:', this.upVector);

    this.dirVecEl.textContent = `Forw Can: 
      X: ${this.forwardVector.x.toFixed(2)}, 
      Y: ${this.forwardVector.y.toFixed(2)}, 
      Z: ${this.forwardVector.z.toFixed(2)}`;

    this.upVecEl.textContent = `Up Cam: 
      X: ${this.upVector.x.toFixed(2)}, 
      Y: ${this.upVector.y.toFixed(2)}, 
      Z: ${this.upVector.z.toFixed(2)}`;
  },

  // Method to get the current forward vector
  getForwardVector: function() {
    return this.forwardVector.clone();
  },

  // Method to get the current up vector
  getUpVector: function() {
    return this.upVector.clone();
  }
});
