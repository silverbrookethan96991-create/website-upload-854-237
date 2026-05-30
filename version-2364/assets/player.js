(function () {
  function initMoviePlayer(videoId, source, buttonId, overlayId) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var overlay = document.getElementById(overlayId);
    if (!video || !button || !overlay || !source) {
      return;
    }

    var loaded = false;
    var errorBox = video
      .closest(".player-card")
      .querySelector("[data-player-error]");

    function showError() {
      if (errorBox) {
        errorBox.textContent = "视频加载失败，请刷新页面后重试";
        errorBox.classList.add("is-visible");
      }
    }

    function loadSource() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (_, data) {
          if (data && data.fatal) {
            showError();
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
      } else {
        showError();
      }
    }

    function playVideo() {
      loadSource();
      overlay.classList.add("is-hidden");
      video.setAttribute("controls", "controls");
      var promise = video.play();
      if (promise && typeof promise.catch === "function") {
        promise.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    button.addEventListener("click", playVideo);
    overlay.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
    video.addEventListener("error", showError);
  }

  window.initMoviePlayer = initMoviePlayer;
})();
