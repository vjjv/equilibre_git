window.STATE = "INTRO";

let captureButton = document.getElementById('captureButton');
document.addEventListener('touchstart', startFilter, false);
document.addEventListener('click', startFilter, false);
document.addEventListener('touchstart', loadScript, { once: true });


// captureButton.addEventListener("pointerdown", (e) => {
// e.preventDefault();

// setTimeout(() => {
// if(window.isRecording) startFilter();
// }, 1500); // Hold for 500ms to start video recording
// });


document.getElementsByClassName('skys')[Math.floor(Math.random() * 3)].setAttribute('visible', true)

function startFilter() {
  if (window.STATE == "INTRO") {

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



function loadScript() {
  const script = document.createElement('script');
  script.src = "script/resizeSvg.js";
  document.body.appendChild(script);
}

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
