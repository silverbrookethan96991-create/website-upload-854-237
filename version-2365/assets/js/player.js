function initMoviePlayer(source) {
  var video = document.querySelector('.js-player');
  var trigger = document.querySelector('.js-play-trigger');
  var hls = null;
  var ready = false;

  if (!video || !trigger || !source) {
    return;
  }

  function attachSource() {
    if (ready) {
      return;
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return;
    }

    if (window.Hls && window.Hls.isSupported()) {
      hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      return;
    }

    video.src = source;
  }

  function startPlayback() {
    attachSource();
    trigger.classList.add('is-hidden');
    video.controls = true;

    var playPromise = video.play();

    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(function () {});
    }
  }

  trigger.addEventListener('click', startPlayback);

  video.addEventListener('click', function () {
    if (video.paused) {
      startPlayback();
    }
  });

  window.addEventListener('pagehide', function () {
    if (hls && typeof hls.destroy === 'function') {
      hls.destroy();
    }
  });
}
