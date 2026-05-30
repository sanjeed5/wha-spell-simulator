const CAPTURE_FPS = 15;
const POST_SEAL_MS = 2800;

function pickMimeType() {
  for (const mime of ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"]) {
    if (MediaRecorder.isTypeSupported(mime)) {
      return mime;
    }
  }
  return "";
}

export function createSealReplay({ glyphCanvas, effectCanvas }) {
  let compositeCanvas = null;
  let compositeCtx = null;
  let mediaRecorder = null;
  let stream = null;
  let chunks = [];
  let recording = false;
  let finishTimer = null;
  let clipBlob = null;
  let clipReadyCallbacks = [];
  let videoTrack = null;

  function ensureComposite() {
    const width = glyphCanvas.width;
    const height = glyphCanvas.height;
    if (!compositeCanvas) {
      compositeCanvas = document.createElement("canvas");
      compositeCtx = compositeCanvas.getContext("2d");
    }
    if (compositeCanvas.width !== width || compositeCanvas.height !== height) {
      compositeCanvas.width = width;
      compositeCanvas.height = height;
    }
  }

  function compositeFrame() {
    ensureComposite();
    compositeCtx.clearRect(0, 0, compositeCanvas.width, compositeCanvas.height);
    compositeCtx.drawImage(glyphCanvas, 0, 0);
    compositeCtx.drawImage(effectCanvas, 0, 0);
  }

  function notifyClipReady() {
    const callbacks = clipReadyCallbacks;
    clipReadyCallbacks = [];
    for (const callback of callbacks) {
      callback(clipBlob);
    }
  }

  function stopTracks() {
    stream?.getTracks().forEach((track) => track.stop());
    stream = null;
    videoTrack = null;
  }

  function startRecording() {
    if (recording || clipBlob || typeof MediaRecorder === "undefined") {
      return;
    }

    ensureComposite();
    compositeFrame();

    try {
      stream = compositeCanvas.captureStream(0);
      videoTrack = stream.getVideoTracks()[0] ?? null;
      const mimeType = pickMimeType();
      mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2_500_000 })
        : new MediaRecorder(stream);
      chunks = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data?.size) {
          chunks.push(event.data);
        }
      };
      mediaRecorder.onstop = () => {
        recording = false;
        stopTracks();
        if (chunks.length) {
          clipBlob = new Blob(chunks, { type: mediaRecorder.mimeType || "video/webm" });
        }
        notifyClipReady();
      };
      mediaRecorder.start(500);
      recording = true;
    } catch (error) {
      console.warn("Seal replay unavailable", error);
      stopTracks();
    }
  }

  function stopRecording() {
    if (!mediaRecorder || mediaRecorder.state === "inactive") {
      return;
    }
    if (mediaRecorder.state === "recording") {
      mediaRecorder.requestData();
    }
    mediaRecorder.stop();
  }

  function reset() {
    if (finishTimer) {
      clearTimeout(finishTimer);
      finishTimer = null;
    }
    stopRecording();
    stopTracks();
    chunks = [];
    clipBlob = null;
    recording = false;
    clipReadyCallbacks = [];
  }

  function onFirstStroke() {
    if (!recording && !clipBlob) {
      startRecording();
    }
  }

  function onSeal() {
    if (finishTimer) {
      clearTimeout(finishTimer);
    }
    finishTimer = setTimeout(() => {
      finishTimer = null;
      stopRecording();
    }, POST_SEAL_MS);
  }

  function captureFrame() {
    if (!recording) {
      return;
    }
    compositeFrame();
    videoTrack?.requestFrame?.();
  }

  function getClip() {
    return clipBlob;
  }

  function waitForClip(timeoutMs = 6000) {
    if (clipBlob) {
      return Promise.resolve(clipBlob);
    }
    return new Promise((resolve) => {
      const timeout = setTimeout(() => resolve(null), timeoutMs);
      clipReadyCallbacks.push((blob) => {
        clearTimeout(timeout);
        resolve(blob);
      });
    });
  }

  return {
    reset,
    onFirstStroke,
    onSeal,
    captureFrame,
    getClip,
    waitForClip,
    isSupported: () => typeof MediaRecorder !== "undefined" && Boolean(pickMimeType())
  };
}
