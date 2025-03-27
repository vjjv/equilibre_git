// document.addEventListener('DOMContentLoaded', function () {
window.addEventListener('load', function () {
  document.querySelector('a-scene').addEventListener('loaded', function () {

    // Select DOM elements
    const canvasPart = document.querySelector(".canvas-part");
    const previewPart = document.querySelector(".preview-part");
    const canvas = document.getElementsByClassName("a-canvas")[0];
    const ortho = document.getElementsByClassName("ortho")[0];
    canvas.style.display = 'block';
    canvas.style.position = 'absolute';
    canvas.style.zIndex = '0';
    document.querySelector('a-scene').style.position = 'absolute';
    // const canvas = document.querySelector('.canvas-part canvas');
    // const ctx = canvas.getContext("2d");
    const captureButton = document.getElementById("captureButton");
    const backButton = document.getElementById("backButton");
    const progressParentDiv = document.querySelector(".progress-parent");
    const videoProgressBar = document.getElementById("videoProgressBar");
    const progressRing = document.getElementById("progressRing");
    const controlPannel = document.querySelector(".controls");

    // Initialize variables


    // video recording related variables
    let mediaRecorder;
    let chunks = [];
    let recording = false;
    window.isRecording = false; //baba
    let videoIsDisplayed = false;
    let holdTimeout;
    let videoPlayInterval;
    // zoom and pan related variables
    let zoomFactor = 1;
    let zoomOriginX = 0;
    let zoomOriginY = 0;
    let isDragging = false;
    let lastTouchY = 0;
    // frame rate related variables
    let lastRenderTime = 0;
    const customFPS = 30;
    const frameDuration = 1000 / customFPS;
    // progress bar related variables
    let ProgressInterval;

    //canvas animation related variables
    // Heart properties
    const hearts = [];
    const heartColors = [
      "rgba(255, 0, 0, 0.2)",
      "rgba(255, 100, 100, 0.2)",
      "rgba(255, 0, 100, 0.2)",
    ];

    //the recorded video as a Blob or MediaStream
    let videoCanvas = document.getElementById("videoCanvas");
    let videoElement = document.createElement("video");
    videoCanvas.className = "video-canvas";
    videoCanvas.style.cssText = `
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  display: block;
`;

    let videoCTX = videoCanvas.getContext("2d");

    function playVideoOnCanvas(recordedVideoURL) {
      videoElement.src = recordedVideoURL;
      videoElement.loop = true;
      videoElement.muted = true;
      videoElement.autoplay = true; // Autoplay the video
      videoElement.playsInline = true; // Allow inline playback on mobile
      videoElement.setAttribute('muted', '');
      videoElement.setAttribute('playsinline', '');

      const spinLoading = document.querySelector(".spin-loading");
      spinLoading.style.display = "block";
      spinLoading.width = innerWidth + "px";
      spinLoading.height = innerHeight + "px";

      // Wait for metadata to load before setting canvas dimensions and playing the video
      videoElement.addEventListener("loadedmetadata", () => {
        spinLoading.style.display = "none";
        // Set canvas dimensions to match the video resolution
        videoCanvas.width = videoElement.videoWidth;
        videoCanvas.height = videoElement.videoHeight;

        // Play the video
        videoElement.play();

        // Draw the video frames on the canvas
        videoElement.addEventListener("play", function () {
          const updateCanvas = () => {
            updateTopProgressBar();
            if (!videoElement.paused && !videoElement.ended) {
              // Clear the canvas before drawing a new frame
              videoCTX.clearRect(0, 0, videoCanvas.width, videoCanvas.height);

              // Calculate aspect ratio
              const videoAspectRatio =
                videoElement.videoWidth / videoElement.videoHeight;
              const canvasAspectRatio = videoCanvas.width / videoCanvas.height;

              let drawWidth, drawHeight, offsetX, offsetY;

              // Maintain aspect ratio while centering the video
              if (canvasAspectRatio > videoAspectRatio) {
                // Fit video height to canvas
                drawHeight = videoCanvas.height;
                drawWidth = videoCanvas.height * videoAspectRatio;
                offsetX = (videoCanvas.width - drawWidth) / 2; // Center horizontally
                offsetY = 0;
              } else {
                // Fit video width to canvas
                drawWidth = videoCanvas.width;
                drawHeight = videoCanvas.width / videoAspectRatio;
                offsetX = 0;
                offsetY = (videoCanvas.height - drawHeight) / 2; // Center vertically
              }

              // Draw the video frame on the canvas
              videoCTX.drawImage(
                videoElement,
                offsetX,
                offsetY,
                drawWidth,
                drawHeight
              );

              // Continuously update the canvas with the next video frame
            }
          };
          videoPlayInterval = setInterval(updateCanvas, 1000 / customFPS);
        });
      });
    }

    // Call this to stop video rendering when needed (optional cleanup)
    function stopVideoPlayback() {
      videoElement.pause();
      videoCTX.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
      videoElement.src = ""; // Remove video source
    }

    // Pointer and gesture handling
    let isPointerDown = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let activePointers = new Map();
    let lastTouchDist = 0;

    // Utility: Detect if device is mobile
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);

    // Initialize MediaRecorder with canvas stream
    function initializeMediaRecorder(stream) {
      const mimeType = getSupportedMimeType();
      if (!mimeType) {
        alert("Your browser does not support any of the required video formats.");
        return null;
      }

      const options = { mimeType };

      try {
        const recorder = new MediaRecorder(stream, options);
        return recorder;
      } catch (e) {
        console.error("Failed to create MediaRecorder:", e);
        alert("Failed to initialize video recording.");
        return null;
      }
    }

    let recorder;
    // Start recording
    async function startRecording() {
      try {
        // Capture stream from canvas
        const videoStream = canvas.captureStream(customFPS);

        recorder = RecordRTC(videoStream, {
          type: "video",
          mimeType: "video/mp4", // Supports MP4 for Safari/Epiphany
        });
        recorder.startRecording();
        recording = true;
        window.isRecording = true; //baba
        // updateProgress(); // baba test
        // change the default behaviour of capture button to act as a zoom plate while recording
        if (recording) {
          resizeSvg(1.1);
          captureButton.style.width = "100%";
          captureButton.style.height = "100%";
          document.querySelector(".progress-ring__circle").style.stroke = "#ff0000";
          document.querySelector(".outer-circle").style.stroke =
            "rgba(255,255,255,0.4)";
          document.querySelector(".inner-circle").style.fill = "#ff0000";
          document.querySelector(".inner-circle").style.scale = "0.8";
        }
      } catch (err) {
        console.error("Error starting recording:", err);
        alert("Failed to start recording.");
      }
    }

    // Stop recording
    function stopRecording() {
      if (recorder && recording) {
        window.STATE = "OUTRO";
        document.getElementById('video-camera-feed').classList.add('hidden');//baba
        previewPart.style.display = "flex";
        document.getElementById("preview-img").style.display = "none";
        canvas.style.display = "none"; //baba
        ortho.style.display = "none"; //baba
        videoCanvas.style.display = "block";
        videoIsDisplayed = true;
        progressParentDiv.style.display = "flex";
        canvasPart.style.display = "none";
        canvasPart.style.opacity = 0;
        controlPannel.style.display = "flex";
        updateActionButtonLabel("video");
        captureButton.style.display = "none";

        // set to default behaviour of capture button
        captureButton.style.width = "90px";
        captureButton.style.height = "90px";
        document.querySelector(".inner-circle").style.fill = "#ffff";
        document.querySelector(".inner-circle").style.scale = "1";
        //set the default behaviour of zoom of canvas contents
        zoomFactor = 1;

        setTimeout(() => {
          previewPart.style.scale = 1;
        }, 50);
        recorder.stopRecording(() => {
          const blob = recorder.getBlob();
          const videoURL = URL.createObjectURL(blob);
          videoElement.src = ""; // Clear existing video

          playVideoOnCanvas(videoURL); // Assign new video
          // Small delay to ensure rendering
        });
        recording = false;
        window.isRecording = false;
      }
    }

    // dinfing the record time variables
    let recordTime = 0;
    const totalRecordTime = 15000; // 5 seconds for video recording

    // svg ring responsible for animation inside capture buttton
    const circle = document.querySelector(".progress-ring__circle");
    const radius = circle.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;

    //the circumference of the circle
    circle.style.strokeDasharray = `${circumference}`;
    circle.style.strokeDashoffset = `${circumference}`;

    //function for update the top progress bar
    function updateProgress() {
      circle.style.strokeDasharray = `${circumference + 20}`;

      recordTime += frameDuration;
      const percentage = Math.min(recordTime / totalRecordTime, 1);

      const offset = circumference - percentage * circumference;

      circle.style.strokeDashoffset = offset; // Update the stroke dash offset
      if (recordTime >= totalRecordTime) {
        stopRecording();
        resetProgress();
      }
      // while(recording) updateProgress(); //baba test
    }

    function resetProgress() {
      recordTime = 0;
      circle.style.strokeDashoffset = `${circumference}`;
      circle.style.stroke = "none";
      document.querySelector(".outer-circle").style.stroke = "rgba(255,255,255,1)";
    }

    // ctx.save();
    // draw the linear gradient
    // const linearGradient = ctx.createLinearGradient(0, 0, 0, canvas.height * 2);
    // linearGradient.addColorStop(0, "rgb(52, 208, 235)");
    // linearGradient.addColorStop(0.4, "rgb(222, 208, 200)");
    // linearGradient.addColorStop(1, "rgb(48, 23, 221)");

    // ctx.fillStyle = linearGradient;
    // ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Drawing and animation
    function draw(timestamp) {
      const timeSinceLastRender = timestamp - lastRenderTime;

      if (timeSinceLastRender >= frameDuration) {
        // Clear canvas

        // Apply zoom and pan
        // ctx.setTransform(zoomFactor, 0, 0, zoomFactor, zoomOriginX, zoomOriginY);

        // Draw text

        // Update progress bar if recording
        if (recording) {
          updateProgress();
        }
        lastRenderTime = timestamp;
      }



      // requestAnimationFrame(draw);
    }

    function resizeCanvas() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      zoomOriginX = canvas.width / 2;
      zoomOriginY = canvas.height / 2;
    }

    // Initialize canvas size and start animation
    window.addEventListener("resize", resizeCanvas);
    resizeCanvas(); //baba commented

    // requestAnimationFrame(draw); //bkp to comment

    // Heart management
    function addHeart() {
      if (hearts.length >= 5) return; // Limit the number of hearts

      const heart = {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 25 + 15,
        opacity: Math.random() * 0.5 + 0.5,
        speed: Math.random() * 2 + 0.5,
        gradient: createPurpleGradient(),
        glow: true,
        glowIntensity: 20, // Initial glow intensity (shadowBlur)
        glowDirection: 1, // 1 for increasing, -1 for decreasing
        glowSpeed: 0.8, // Speed of the glow change
      };

      hearts.push(heart);
    }

    // function createPurpleGradient() {
    //   const gradient = ctx.createRadialGradient(0, 0, 5, 0, 0, 20);
    //   gradient.addColorStop(0, "rgba(128, 0, 128, 0.9)"); // Inner bright purple
    //   gradient.addColorStop(1, "rgba(230, 230, 250, 0.8)"); // Outer lavender (slightly transparent)
    //   return gradient;
    // }

    // function animateHearts() {
    //   hearts.forEach((heart, index) => {
    //     ctx.save();
    //     ctx.globalAlpha = heart.opacity;

    //     // Interpolate the glow intensity
    //     if (heart.glow) {
    //       heart.glowIntensity += heart.glowDirection * heart.glowSpeed;

    //       // Reverse direction if it reaches the bounds (min: 5, max: 30)
    //       if (heart.glowIntensity >= 30) {
    //         heart.glowDirection = -1.5;
    //       } else if (heart.glowIntensity <= 5) {
    //         heart.glowDirection = 1;
    //       }

    //       // Apply the glow effect with interpolated intensity
    //       ctx.shadowBlur = heart.glowIntensity;
    //       ctx.shadowColor = "rgba(255, 0, 255, 0.8)";
    //       ctx.shadowOffsetX = 0;
    //       ctx.shadowOffsetY = 0;
    //     }
    //     // adjusted the x and y coordination based on the user prefered zoom scale
    //     const adjustedX = (heart.x - zoomOriginX) * zoomFactor + zoomOriginX;
    //     const adjustedY = (heart.y - zoomOriginY) * zoomFactor + zoomOriginY;

    //     ctx.translate(adjustedX, adjustedY);
    //     //based on glow intensity, change the fill color
    //     ctx.fillStyle =
    //       heart.glowIntensity > 10
    //         ? heart.gradient
    //         : heart.gradient.addColorStop(heart.glowIntensity / 30, "white") ||
    //           "rgba(255, 255, 255, 0.2)";

    //     // Draw the heart shape
    //     drawHeart(ctx, 0, 0, heart.size);

    //     ctx.restore();

    //     // Move the heart upwards
    //     heart.y -= heart.speed;

    //     // Remove hearts that are out of bounds
    //     if (heart.y + heart.size < 0) {
    //       hearts.splice(index, 1);
    //     }
    //   });
    // }

    // function drawHeart(ctx, x, y, size) {
    //   ctx.beginPath();
    //   ctx.moveTo(x, y + size / 4);
    //   ctx.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + size / 4);
    //   ctx.bezierCurveTo(x - size / 2, y + size / 2, x, y + size / 2, x, y + size);
    //   ctx.bezierCurveTo(
    //     x,
    //     y + size / 2,
    //     x + size / 2,
    //     y + size / 2,
    //     x + size / 2,
    //     y + size / 4
    //   );
    //   ctx.bezierCurveTo(x + size / 2, y, x, y, x, y + size / 4);
    //   ctx.closePath();
    //   ctx.fill();
    // }

    // Touch events for pinch-to-zoom
    canvas.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault(); // Prevent scroll
        if (isDragging && e.touches.length === 1) {
          const dx = e.touches[0].clientX - lastX;
          const dy = e.touches[0].clientY - lastY;
          zoomOriginX += dx;
          zoomOriginY += dy;
          lastX = e.touches[0].clientX;
          lastY = e.touches[0].clientY;
        }

        if (e.touches.length === 2) {
          const touch1 = e.touches[0];
          const touch2 = e.touches[1];
          const touchDist = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
          );

          if (lastTouchDist) {
            const zoomChange = touchDist > lastTouchDist ? 1.1 : 0.9;
            zoomFactor = Math.max(1, Math.min(zoomFactor * zoomChange, 4));
          }
          lastTouchDist = touchDist;
        }
      },
      { passive: false }
    );

    // Touch-based panning
    canvas.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault(); // Prevent scroll
        if (e.touches.length === 1) {
          isDragging = true;
          lastX = e.touches[0].clientX;
          lastY = e.touches[0].clientY;
        }
      },
      { passive: false }
    ); // Prevent scroll

    canvas.addEventListener(
      "touchend",
      (e) => {
        e.preventDefault();
        lastTouchDist = 0; // Reset distance on touch end
        isDragging = false;
      },
      { passive: false }
    );

    canvas.addEventListener(
      "touchcancel",
      (e) => {
        e.preventDefault();
        isDragging = false;
      },
      { passive: false }
    );

    // Zoom with mouse
    canvas.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        const zoomChange = e.deltaY > 0 ? 0.9 : 1.1;
        zoomFactor = Math.max(1, Math.min(zoomFactor * zoomChange, 5));
      },
      { passive: false }
    );

    canvas.addEventListener("mousemove", (e) => {
      e.preventDefault();
      if (isDragging) {
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        zoomOriginX += dx;
        zoomOriginY += dy;
        lastX = e.clientX;
        lastY = e.clientY;
      }
    });

    // for zooming while recording
    captureButton.addEventListener("pointermove", (e) => {
      e.preventDefault();
      if (recording) {
        let deltaY = 0;
        if (e.pointerType === "touch") {
          // For touch events, manually calculate vertical movement
          deltaY = -(e.clientY - (lastTouchY || e.clientY));
          lastTouchY = e.clientY; // Store the current Y position for the next movement
        } else if (e.pointerType === "mouse") {
          // For mouse events, use `movementY` directly
          deltaY = -e.movementY; // Invert movement to match zooming behavior
        }
        // Adjust zoomFactor based on the movement
        zoomFactor = Math.max(1, Math.min(5, zoomFactor + deltaY * 0.01)); // Clamp between 1 and 5
      }
    });

    // for zooming while dragging the canvas

    canvas.addEventListener("mouseleave", (e) => {
      e.preventDefault();
      isDragging = false;
    });

    canvas.addEventListener("mousedown", (e) => {
      e.preventDefault(); // Prevent scroll
      lastX = e.clientX;
      lastY = e.clientY;
      isDragging = true;
    });

    canvas.addEventListener("pointerup", (e) => {
      e.preventDefault();
      isDragging = false;
    });

    // Capture Button Handling
    captureButton.addEventListener("pointerdown", (e) => {
      e.preventDefault();

      holdTimeout = setTimeout(() => {
        // startRecording(); // baba remove recording function
      }, 500); // Hold for 500ms to start video recording
    });

    captureButton.addEventListener("pointerup", (e) => {
      e.preventDefault();
      clearTimeout(holdTimeout);
      if (recording) {
        ProgressInterval = setInterval(() => {
          updateTopProgressBar();
        });
        stopRecording();
        updateActionButtonLabel("video");
      }
      if (!recording && !videoIsDisplayed) {
        capturePhoto(); //baba disable photo
      }
    });

    captureButton.addEventListener("pointercancel", (e) => {
      e.preventDefault();
      clearTimeout(holdTimeout);
      if (recording) {
        stopRecording();
      }
    });

    // Helper Functions for Capture Button
    function updateActionButtonLabel(mediaType) {
      if (!isMobile) {
        actionButton.innerHTML =
          mediaType === "image" ? "SAVE PHOTO" : "SAVE VIDEO";
      } else {
        actionButton.innerHTML =
          mediaType === "image" ? "SHARE PHOTO" : "SHARE VIDEO";
      }
    }

    // Capture Photo
    async function capturePhoto() {
      const img = document.getElementById("preview-img");
      // const image = canvas.toDataURL("image/png");
      const canvasTempReturn = await startCanvasTempCapture();
      const image = await captureAll();
      showDomCapture(false);
      img.src = image;
      img.style.display = "block";

      // Show preview part (photo)
      previewPart.style.display = "flex";
      setTimeout(() => {
        previewPart.style.scale = 1;
      }, 10);
      progressParentDiv.style.display = "none";
      videoCanvas.style.display = "none";
      controlPannel.style.display = "flex";
      canvasPart.style.opacity = "0";
      canvasPart.style.display = "none";

      updateActionButtonLabel("image");
    }
    function showDomCapture(visible) {
      document.getElementById('ortho').style.display = visible ? 'flex' : 'none';
      document.getElementById('video-camera-feed').style.display = visible ? 'block' : 'none';
    }


    // Capture All : DOM + GL
    async function captureAll() {
      let screenshot = document.querySelector('a-scene').components.screenshot;
      screenshot.data.width = window.innerWidth;
      screenshot.data.height = window.innerHeight;
      let canvasGL = screenshot.getCanvas('perspective');
      // let canvasDom = await html2canvas(document.body, {
      let canvasDom = await html2canvas(document.getElementById('ortho'), {
        width: window.innerWidth,
        height: window.innerHeight,
        backgroundColor: null,
        scale: 1,
        allowTaint: true,
        useCORS: true,
        logging: true
      });

      // Wait for the merged image and return it
      return await mergeImages(canvasGL.toDataURL(), canvasDom.toDataURL());
    }

    let videoTemp = document.getElementById('video-camera-feed');

    function startCanvasTempCapture() { //baba
      return new Promise((resolve, reject) => {
        console.log('videoTemp loaded ' + videoTemp.videoWidth);
        // let canvasTemp = document.createElement('canvas');
        let canvasTemp = document.getElementById('canvasTemp');
        canvasTemp.classList.remove('hidden');
        canvasTemp.style.zIndex = 1;
        canvasTemp.style.width = "100%";
        canvasTemp.style.height = "100%";
        canvasTemp.style.opacity = 1;
        canvasTemp.style.display = 'block';
        canvasTemp.style.position = 'absolute';
        canvasTemp.style.top = '0';
        canvasTemp.width = videoTemp.videoWidth;
        canvasTemp.height = videoTemp.videoHeight;
        let ctxTemp = canvasTemp.getContext('2d');

        // Create an Image object for the mask
        let mask = new Image();
        mask.src = 'assets/mask.png';
        mask.onload = () => {
          try {
            // Draw the video frame
            ctxTemp.drawImage(videoTemp, 0, 0, canvasTemp.width, canvasTemp.height);

            // Apply the mask
            ctxTemp.globalCompositeOperation = 'destination-in';
            ctxTemp.drawImage(mask, 0, 0, canvasTemp.width, canvasTemp.height);

            // Reset composite operation
            ctxTemp.globalCompositeOperation = 'source-over';

            // Set the canvas as the background of the video
            videoTemp.style.backgroundImage = `url(${canvasTemp.toDataURL('image/png')})`;

            // Append the canvas to the DOM
            document.getElementById('ortho').appendChild(canvasTemp);

            resolve(canvasTemp); // Resolve the promise with the canvas
          } catch (error) {
            reject(error); // Reject the promise if there's an error
          }
        };

        mask.onerror = (error) => {
          reject(new Error('Failed to load mask image')); // Reject if mask fails to load
        };
      });
    }



    // Helper function to download the image
    function downloadImage(dataUrl, fileName) {
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = fileName;
      link.click();
    }
    function mergeImages(dataUrl1, dataUrl2) {
      return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');

        const drawing1 = new Image();
        const drawing2 = new Image();

        let imagesLoaded = 0;

        function checkImagesLoaded() {
          imagesLoaded++;
          if (imagesLoaded === 2) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            context.drawImage(drawing1, 0, 0);
            context.drawImage(drawing2, 0, 0);

            const mergedImage = canvas.toDataURL("image/png");
            window.photo = mergedImage;
            resolve(mergedImage);  // Resolve the promise with the merged image
          }
        }

        drawing1.onload = checkImagesLoaded;
        drawing2.onload = checkImagesLoaded;

        drawing1.src = dataUrl1;
        drawing2.src = dataUrl2;
      });
    }

    // Back Button Handling
    const eventData = { message: "back button tapped send to other script", timestamp: Date.now() };
    backButton.addEventListener("click", () => { //baba
      const customEvent = new CustomEvent('backTapped', {
        detail: eventData,
        bubbles: true, // Optional: allows event to bubble up the DOM
        composed: true // Optional: crosses shadow DOM boundaries
      });

      window.dispatchEvent(customEvent);
      showDomCapture(true);//baba
      previewPart.style.scale = 1.3;
      previewPart.style.display = "none";
      canvasPart.style.display = "block";
      canvas.style.display = "block"; //baba
      ortho.style.display = "flex"; //baba
      document.getElementById('video-camera-feed').classList.remove('hidden');//baba
      videoIsDisplayed = false;
      clearInterval(videoPlayInterval);
      setTimeout(() => {
        canvasPart.style.opacity = 1;
        resizeSvg();
      }, 10);
      clearInterval(ProgressInterval);
      resetProgress();
      progressParentDiv.style.display = "none";
      captureButton.style.display = "flex";
      controlPannel.style.display = "none";
      canvasPart.style.display = "block";
      chunks = [];
      videoElement.src = "";
      recorder = null;
      recording = false;
      window.isRecording = false; //baba
    });

    // Custom Action Button
    const actionButton = document.createElement("div");
    actionButton.classList.add("action-btn");
    document.body.appendChild(actionButton);
    controlPannel.appendChild(actionButton);

    // Action Button Click Handling
    actionButton.addEventListener("click", async () => {
      if (videoCanvas.style.display === "block") {
        // Video is displayed
        if (!isMobile) {
          // Desktop: Save video
          const videoURL = videoElement.src;
          const a = document.createElement("a");
          a.href = videoURL;
          a.download = "video.webm";
          a.click();
        } else {
          // Mobile: Share video
          try {
            const response = await fetch(videoElement.src);
            const blob = await response.blob();

            //v1 fiverr
            // const files = [new File([blob], "video.webm", { type: "video/webm" })];
            // await navigator.share({ files });

            //v2 baba
            const file = new File([blob], "video.mp4", { type: "video/mp4" });
            await navigator.share({
              // title: "Example File",
              files: [file]
            });
          } catch (err) {
            console.error("Error sharing video", err);
          }
        }
      } else {
        // Photo is displayed
        const img = document.querySelector(".preview-img");
        if (img) {
          if (!isMobile) {
            // Desktop: Save photo
            const a = document.createElement("a");
            a.href = img.src;
            a.download = "photo.png";
            a.click();
          } else {
            // Mobile: Share photo
            try {
              const response = await fetch(img.src);
              const blob = await response.blob();
              const files = [new File([blob], "photo.png", { type: "image/png" })];
              await navigator.share({ files });
            } catch (err) {
              console.error("Error sharing photo", err);
            }
          }
        }
      }
    });

    // Initialize Action Button Label
    updateActionButtonLabel("");

    // MediaRecorder Support Check for Safari
    if (isSafari && typeof MediaRecorder === "undefined") {
      alert("Video recording is not supported in Safari.");
    }

    // Video Progress Bar Update
    function updateTopProgressBar() {
      const currentTime = videoElement.currentTime;
      const duration = videoElement.duration;
      // Ensure duration is valid before updating the progress bar
      const progress = Math.min((currentTime / duration) * 100, 100);
      videoProgressBar.style.width = `${progress}%`;
    }

    // Prevent default touch actions on the entire document to enhance gesture handling
    document.addEventListener(
      "touchmove",
      (e) => {
        e.preventDefault();
      },
      { passive: false }
    );

    //prevent default selection of text
    captureButton.addEventListener(
      "touchstart",
      (e) => {
        e.preventDefault();
      },
      { passive: false }
    );

  });//a-scene loaded
}); //window loaded