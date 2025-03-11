window.STATE = "INTRO";

let captureButton = document.getElementById('captureButton');


window.filterStarted = false;

document.getElementById('popup-btn').addEventListener('click', async () => {
  // Check if the DeviceMotionEvent.requestPermission API exists
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    try {
      // Request permission
      const permissionState = await DeviceMotionEvent.requestPermission();
      if (permissionState === 'granted') { //MOBILE
        console.log('Device motion access granted!');

        // navigator.mediaDevices.getUserMedia({
        //   video: {
        //     facingMode: 'environment'
        //   },
        //   audio: false
        // })
        //   .then(function (stream) {
        //     window.stream = stream;
        //   })
        //   .catch(function (err) {
        //     console.error('Error accessing camera:', err);
        //   });


        document.getElementById('popup-bg').style.display = 'none';
        document.addEventListener('touchstart', startFilter, true);
        document.addEventListener('click', startFilter, true);
        const scene = document.querySelector('a-scene');
        const cameraFeedEntity = document.createElement('a-entity');
        cameraFeedEntity.setAttribute('camera-feed', '');
        scene.appendChild(cameraFeedEntity);

      } else {
        console.warn('Device motion access denied.');
      }
    } catch (error) {
      console.error('Error requesting device motion permission:', error);
    }
  } else { //Desktop
    console.log('DeviceMotionEvent.requestPermission is not supported on this device.');
    document.getElementById('popup-bg').style.display = 'none';
    document.addEventListener('touchstart', startFilter, true);
    document.addEventListener('click', startFilter, true);
    const scene = document.querySelector('a-scene');
    const cameraFeedEntity = document.createElement('a-entity');
    cameraFeedEntity.setAttribute('camera-feed', '');
    scene.appendChild(cameraFeedEntity);
  }
});


document.getElementsByClassName('skys')[Math.floor(Math.random() * 3)].setAttribute('visible', true)

function startFilter() {
  console.log('STARTFILTER()');

  if (window.STATE == "INTRO") {

    window.filterStarted = true;
    console.log('StartFiter');
    window.STATE = "GAME";
    console.log(window.STATE);

    show('INTRO', false)
    show('GAME', true)



    document.getElementById('slack').setAttribute('visible', true)

    if (document.getElementById('container-record')) document.getElementById('container-record').style.opacity = 1;


  }
}



function show(el, visible) {
  let elem = document.getElementById(el);
  if (visible) {
    elem.classList.remove('hidden');
  } else {
    elem.classList.add('hidden');
  }
}

