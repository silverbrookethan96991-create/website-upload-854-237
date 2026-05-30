(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function initMobileNav() {
    var toggle = document.querySelector('.mobile-toggle');
    var nav = document.querySelector('.mobile-nav');
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener('click', function () {
      var opened = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', opened ? 'true' : 'false');
    });
  }

  function initHero() {
    var hero = document.querySelector('.hero');
    if (!hero) {
      return;
    }
    var slides = selectAll('.hero-slide', hero);
    var dots = selectAll('.hero-dot', hero);
    if (slides.length <= 1) {
      return;
    }
    var index = 0;
    var timer;
    function show(next) {
      slides[index].classList.remove('active');
      dots[index].classList.remove('active');
      index = next;
      slides[index].classList.add('active');
      dots[index].classList.add('active');
    }
    function play() {
      timer = window.setInterval(function () {
        show((index + 1) % slides.length);
      }, 5200);
    }
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        window.clearInterval(timer);
        show(dotIndex);
        play();
      });
    });
    hero.addEventListener('mouseenter', function () {
      window.clearInterval(timer);
    });
    hero.addEventListener('mouseleave', play);
    play();
  }

  function initFiltering() {
    selectAll('[data-filter-scope]').forEach(function (scope) {
      var input = scope.querySelector('[data-search-input]');
      var region = scope.querySelector('[data-region-filter]');
      var year = scope.querySelector('[data-year-filter]');
      var cards = selectAll('[data-title]', scope);
      var empty = scope.querySelector('.empty-state');
      function apply() {
        var q = input ? input.value.trim().toLowerCase() : '';
        var regionValue = region ? region.value : '';
        var yearValue = year ? year.value : '';
        var visible = 0;
        cards.forEach(function (card) {
          var haystack = [
            card.getAttribute('data-title') || '',
            card.getAttribute('data-region') || '',
            card.getAttribute('data-year') || '',
            card.getAttribute('data-tags') || ''
          ].join(' ').toLowerCase();
          var matched = (!q || haystack.indexOf(q) !== -1) && (!regionValue || card.getAttribute('data-region') === regionValue) && (!yearValue || card.getAttribute('data-year') === yearValue);
          card.style.display = matched ? '' : 'none';
          if (matched) {
            visible += 1;
          }
        });
        if (empty) {
          empty.classList.toggle('show', visible === 0);
        }
      }
      [input, region, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
      apply();
    });
  }


  function initHomeSearchBridge() {
    var panelInput = document.querySelector('.search-panel [data-search-input]');
    var toolbarInput = document.querySelector('.toolbar [data-search-input]');
    if (!panelInput || !toolbarInput) {
      return;
    }
    panelInput.addEventListener('input', function () {
      toolbarInput.value = panelInput.value;
      toolbarInput.dispatchEvent(new Event('input', { bubbles: true }));
    });
  }

  window.createMoviePlayer = function (source, videoId, overlayId, statusId) {
    var video = document.getElementById(videoId);
    var overlay = document.getElementById(overlayId);
    var status = document.getElementById(statusId);
    if (!video || !overlay) {
      return;
    }
    var hls = null;
    var loaded = false;
    function setStatus(text) {
      if (status) {
        status.textContent = text || '';
      }
    }
    function load() {
      if (loaded) {
        return;
      }
      loaded = true;
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (!data || !data.fatal) {
            return;
          }
          if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
            hls.startLoad();
            return;
          }
          if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
            hls.recoverMediaError();
            return;
          }
          setStatus('播放暂时不可用，请稍后再试');
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      } else {
        setStatus('播放暂时不可用，请稍后再试');
      }
    }
    function start() {
      load();
      overlay.classList.add('is-hidden');
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          overlay.classList.remove('is-hidden');
        });
      }
    }
    overlay.addEventListener('click', start);
    video.addEventListener('click', function () {
      if (video.paused) {
        start();
      } else {
        video.pause();
      }
    });
    video.addEventListener('play', function () {
      overlay.classList.add('is-hidden');
      setStatus('');
    });
    video.addEventListener('pause', function () {
      if (!video.ended) {
        overlay.classList.remove('is-hidden');
      }
    });
    window.addEventListener('beforeunload', function () {
      if (hls) {
        hls.destroy();
      }
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    initMobileNav();
    initHero();
    initFiltering();
    initHomeSearchBridge();
  });
})();
