AFRAME.registerComponent('align-world', {
  init: function () {
    this.isPlaced = false;
    this.camera = document.querySelector('a-camera') || document.querySelector('[camera]');
    this.world = document.getElementById('world');

    if (!this.camera) {
      console.error('Camera not found. Make sure you have a camera in your scene.');
      return;
    }

    if (!this.world) {
      console.error('Entity with id "world" not found.');
      return;
    }

    this.onTap = this.onTap.bind(this);
    this.cameraQuaternion = new THREE.Quaternion();
    this.worldQuaternion = new THREE.Quaternion();
    this.targetQuaternion = new THREE.Quaternion();

    window.addEventListener('click', this.onTap);
    window.addEventListener('touchstart', this.onTap);
  },

  onTap: function (event) {
    console.log('align world ONTAPPPP' + window.filterStarted);
    
    if (window.filterStarted && !this.isPlaced) {

      this.isPlaced = true;
      event.preventDefault();

      // Get the camera's world quaternion
      this.camera.object3D.getWorldQuaternion(this.cameraQuaternion);

      // Extract only the Y-axis rotation
      this.targetQuaternion.setFromEuler(new THREE.Euler(0, this.getYRotation(this.cameraQuaternion), 0));

      // Apply the Y-rotation to the world entity
      this.world.object3D.quaternion.copy(this.targetQuaternion);

      console.log('Aligned world Y rotation to:', THREE.MathUtils.radToDeg(this.getYRotation(this.targetQuaternion)).toFixed(2) + '°');
    }
  },

  getYRotation: function (quaternion) {
    // Extract the Y-axis rotation from a quaternion
    return Math.atan2(2 * (quaternion.y * quaternion.w - quaternion.x * quaternion.z),
      1 - 2 * (quaternion.y * quaternion.y + quaternion.x * quaternion.x));
  },

  remove: function () {
    window.removeEventListener('click', this.onTap);
    window.removeEventListener('touchstart', this.onTap);
  }
});
