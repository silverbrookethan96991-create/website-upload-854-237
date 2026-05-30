(function () {
  function initStream(video, streamUrl) {
    if (video.__streamReady) {
      return;
    }
    video.__streamReady = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      video.__hls = hls;
      return;
    }
    video.src = streamUrl;
  }

  function setup(config) {
    var video = document.getElementById(config.videoId);
    var button = document.getElementById(config.buttonId);
    var streamUrl = config.streamUrl;
    if (!video || !button || !streamUrl) {
      return;
    }

    function play() {
      initStream(video, streamUrl);
      button.classList.add("is-hidden");
      video.setAttribute("controls", "controls");
      var result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", play);
    video.addEventListener("click", function () {
      if (!video.__streamReady) {
        play();
      }
    });
  }

  window.MoviePlayer = {
    setup: setup
  };
})();
