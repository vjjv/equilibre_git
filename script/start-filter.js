window.STATE = "INTRO";

document.addEventListener('touchstart', startFilter, false);
document.addEventListener('click', startFilter, false);


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