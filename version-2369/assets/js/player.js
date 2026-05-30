var MoviePlayer = (function () {
  function boot(streamUrl) {
    var video = document.querySelector("[data-player-video]");
    var layer = document.querySelector("[data-player-layer]");
    var start = document.querySelector("[data-player-start]");
    var hls = null;
    var attached = false;

    if (!video || !streamUrl) {
      return;
    }

    function attach() {
      if (attached) {
        return Promise.resolve();
      }

      attached = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        return new Promise(function (resolve) {
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            resolve();
          });
        });
      }

      video.src = streamUrl;
      return Promise.resolve();
    }

    function play() {
      attach().then(function () {
        if (layer) {
          layer.classList.add("is-hidden");
        }
        var result = video.play();
        if (result && typeof result.catch === "function") {
          result.catch(function () {
            if (layer) {
              layer.classList.remove("is-hidden");
            }
          });
        }
      });
    }

    if (start) {
      start.addEventListener("click", function (event) {
        event.preventDefault();
        event.stopPropagation();
        play();
      });
    }

    if (layer) {
      layer.addEventListener("click", function () {
        play();
      });
    }

    video.addEventListener("click", function () {
      if (video.paused) {
        play();
      }
    });

    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  return {
    boot: boot
  };
})();
