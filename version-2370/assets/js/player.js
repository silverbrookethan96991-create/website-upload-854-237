document.addEventListener('DOMContentLoaded', function () {
    var configNode = document.getElementById('playback-config');
    var video = document.querySelector('[data-video-player]');
    var overlay = document.querySelector('[data-play-trigger]');
    if (!configNode || !video) {
        return;
    }

    var src = '';
    try {
        src = JSON.parse(configNode.textContent || '{}').src || '';
    } catch (error) {
        src = '';
    }

    var hls = null;
    var loaded = false;

    function attach() {
        if (!src || loaded) {
            return;
        }
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = src;
            loaded = true;
            return;
        }
        if (window.Hls && window.Hls.isSupported()) {
            hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
            hls.loadSource(src);
            hls.attachMedia(video);
            loaded = true;
            return;
        }
        video.src = src;
        loaded = true;
    }

    function start() {
        attach();
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
            playPromise.catch(function () {});
        }
    }

    if (overlay) {
        overlay.addEventListener('click', start);
    }
    video.addEventListener('click', function () {
        if (video.paused) {
            start();
        }
    });
    video.addEventListener('play', function () {
        if (overlay) {
            overlay.classList.add('is-hidden');
        }
    });
    window.addEventListener('beforeunload', function () {
        if (hls) {
            hls.destroy();
        }
    });
});
