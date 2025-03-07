window.STATE = "INTRO";

let captureButton = document.getElementById('captureButton');
document.addEventListener('touchstart', startFilter, false);
document.addEventListener('click', startFilter, false);


// captureButton.addEventListener("pointerdown", (e) => {
  // e.preventDefault();

  // setTimeout(() => {
    // if(window.isRecording) startFilter();
  // }, 1500); // Hold for 500ms to start video recording
// });


document.getElementsByClassName('skys')[Math.floor(Math.random()*3)].setAttribute('visible', true)

function startFilter() {
  if (window.STATE == "INTRO") {
    console.log('StartFiter');
    window.STATE = "GAME";
    console.log(window.STATE);

    show('INTRO', false)
    show('GAME', true)

    document.getElementById('slack').setAttribute('visible', true)

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