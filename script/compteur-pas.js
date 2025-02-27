
function updateDom(el, val) {
    let v = Number(val).toFixed(2);
    console.log('v : ' + v);
    document.getElementById(el).textContent = v;
}
function updateVal(el, val) {
    let v = (val * 10000).toFixed(3);
    document.getElementById(el).textContent = v;
}
function intervalStep(val) {
    console.log(val);
    let v = (val * 10000).toFixed(3);
    agrY0 = agrY1;
    agrY1 = v;
    // updateDom('agrY0', agrY0);
    // updateDom('agrY1', agrY1);
    let diff = Math.abs(agrY0 - agrY1);
    // updateDom('diff', diff);
    if (diff > 60) if (canIncStep) incStep();
    // if (diff < 60) if (!canIncStep) canIncStep = true;
    updateDom('step', step)
    document.getElementById('steps').textContent = step;
}

function incStep() {
    console.log('incStep isDown:'+window.isDown )
    console.log('incStep window.STATE:'+window.STATE )
    if (window.isDown && window.STATE == 'GAME') {
        setTimeout(e => {
            canIncStep = true;
        }, 1000)
        canIncStep = false;
        step++;
    }
}

// updateVal('acc_x', -0.0002345);
let canIncStep = true;
window.step = 0;
let lastUpdateTime = 0;
let agrY0 = 0;
let agrY1 = 0;
window.addEventListener("devicemotion", function (e) {
    const currentTime = Date.now();
    if (currentTime - lastUpdateTime >= 50) {
        // updateVal('acc_x', e.acceleration.x / 100);
        // updateVal('acc_y', e.acceleration.y / 100);
        // updateVal('acc_z', e.acceleration.z / 100);
        // updateVal('agr_x', e.accelerationIncludingGravity.x / 100);
        // updateVal('agr_y', e.accelerationIncludingGravity.y / 100);
        // updateVal('agr_z', e.accelerationIncludingGravity.z);
        updateVal('rot_x', e.rotationRate.alpha / 360);
        updateVal('rot_y', e.rotationRate.beta / 360);
        updateVal('rot_x', e.rotationRate.gamma / 360);
        intervalStep(e.accelerationIncludingGravity.y / 100);
        lastUpdateTime = currentTime;
    }
});

