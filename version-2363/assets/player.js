import { H as Hls } from './hls-vendor.js';

const setStatus = function (root, message) {
    const status = root.querySelector('.player-status');
    if (status) {
        status.textContent = message || '';
    }
};

const setupPlayer = function (root) {
    const video = root.querySelector('video');
    const button = root.querySelector('.player-overlay');

    if (!video) {
        return;
    }

    const source = video.dataset.src || video.getAttribute('src');

    if (!source) {
        setStatus(root, '视频源暂不可用');
        return;
    }

    const markPlaying = function () {
        root.classList.toggle('is-playing', !video.paused && !video.ended);
    };

    const playVideo = function () {
        const promise = video.play();
        if (promise && typeof promise.catch === 'function') {
            promise.catch(function () {
                setStatus(root, '点击播放器可继续播放');
            });
        }
    };

    if (Hls && Hls.isSupported()) {
        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: true,
        });

        hls.loadSource(source);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            setStatus(root, '');
        });

        hls.on(Hls.Events.ERROR, function (event, data) {
            if (!data || !data.fatal) {
                return;
            }

            if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                setStatus(root, '网络加载中，正在重试');
                hls.startLoad();
                return;
            }

            if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                setStatus(root, '媒体恢复中');
                hls.recoverMediaError();
                return;
            }

            setStatus(root, '当前浏览器无法播放该视频');
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
    } else {
        video.src = source;
        setStatus(root, '当前浏览器可能需要 HLS 支持');
    }

    if (button) {
        button.addEventListener('click', playVideo);
    }

    video.addEventListener('click', function () {
        if (video.paused) {
            playVideo();
        } else {
            video.pause();
        }
    });

    video.addEventListener('play', markPlaying);
    video.addEventListener('pause', markPlaying);
    video.addEventListener('ended', markPlaying);
};

document.querySelectorAll('[data-hls-player]').forEach(setupPlayer);
