AFRAME.registerComponent('camera-feed', {
    init: function () {
        var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // if (isMobile) {
        var scene = this.el.sceneEl;
        var camera = scene.camera;

        var video = document.createElement('video');
        video.setAttribute('autoplay', '');
        video.setAttribute('muted', '');
        video.setAttribute('playsinline', '');
        video.setAttribute('id', 'video-camera-feed');

        video.style.position = 'fixed';
        video.style.top = '0';
        video.style.left = '0';
        video.style.width = '100%';
        video.style.height = '100%';
        video.style.objectFit = 'cover';
        video.style.zIndex = '3';
        video.style.opacity = '0.9';
        video.style.pointerEvents = 'none';

        // Apply mask using CSS
        video.style.webkitMaskImage = 'url(assets/mask.png)';
        video.style.maskImage = 'url(assets/mask.png)';
        video.style.webkitMaskSize = 'cover';
        video.style.maskSize = 'cover';
        video.style.webkitMaskRepeat = 'no-repeat';
        video.style.maskRepeat = 'no-repeat';
        video.style.webkitMaskPosition = 'center';
        video.style.maskPosition = 'center';
        video.classList.add('hidden');
        // video.style.display = 'none';


        document.body.appendChild(video);
        document.getElementById('ortho').appendChild(video);

        navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment'
            },
            audio: false
        })
            .then(function (stream) {
                video.srcObject = stream;
            })
            .catch(function (err) {
                console.error('Error accessing camera:', err);
            });
        // }
    },
    tick: function () {
        // console.log('camera-feed tick');

    }
});
