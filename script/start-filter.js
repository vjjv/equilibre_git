window.STATE = "INTRO";

let captureButton = document.getElementById('captureButton');



// captureButton.addEventListener("pointerdown", (e) => {
// e.preventDefault();

// setTimeout(() => {
// if(window.isRecording) startFilter();
// }, 1500); // Hold for 500ms to start video recording
// });
window.filterStarted = false;

document.getElementById('popup-btn').addEventListener('click', async () => {
  // Check if the DeviceMotionEvent.requestPermission API exists
  if (typeof DeviceMotionEvent.requestPermission === 'function') {
    try {
      // Request permission
      const permissionState = await DeviceMotionEvent.requestPermission();
      if (permissionState === 'granted') {
        console.log('Device motion access granted!');
        // Add event listener for device motion
        // window.addEventListener('devicemotion', (event) => {
        //   console.log('Acceleration:', event.acceleration);
        //   console.log('Rotation rate:', event.rotationRate);
        // });
        document.getElementById('popup-bg').style.display = 'none';
        document.addEventListener('touchstart', startFilter, true);
        document.addEventListener('click', startFilter, true);
      } else {
        console.warn('Device motion access denied.');
      }
    } catch (error) {
      console.error('Error requesting device motion permission:', error);
      document.getElementById('popup-bg').style.display = 'none';
      document.addEventListener('touchstart', startFilter, true);
      document.addEventListener('click', startFilter, true);
    }
  } else {
    console.log('DeviceMotionEvent.requestPermission is not supported on this device.');
    document.getElementById('popup-bg').style.display = 'none';
    document.addEventListener('touchstart', startFilter, true);
    document.addEventListener('click', startFilter, true);
    navigator.mediaDevices.getUserMedia({
      video: {
          facingMode: 'environment'
      },
      audio: false
  })
      .then(function (stream) {
          window.stream = stream;
      })
      .catch(function (err) {
          console.error('Error accessing camera:', err);
      });
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


    // captueereFullPage();

    //   const node = document.getElementsByClassName('ortho')[0];
    //   domtoimage.toPng(node)
    //     .then((dataUrl) => {
    //       const img = new Image();
    //       img.src = dataUrl;
    //       downloadImage(dataUrl, 'coucou.png');
    //       document.body.appendChild(img);
    //     })
    //     .catch((error) => {
    //       console.error('Something went wrong!', error);
    //     });


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



// function loadScript() {
//   const script = document.createElement('script');
//   script.src = "script/resizeSvg.js";
//   document.body.appendChild(script);
// }

async function captureFullPage() {
  try {
    // Scroll to the top of the page to ensure all content is rendered correctly
    window.scrollTo(0, 0);

    // Capture the entire page
    const canvas = await html2canvas(document.getElementsByClassName('ortho')[0]);

    // Convert the canvas to an image (data URL)
    const image = canvas.toDataURL("image/png");

    // Download the image
    downloadImage(image, "full-page-screenshot.png");
  } catch (error) {
    console.error("Error capturing full page:", error);
  }
}

// Helper function to download the image
function downloadImage(dataUrl, fileName) {
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = fileName;
  link.click();
}
