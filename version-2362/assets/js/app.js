(function () {
  function closest(root, selector) {
    return root ? root.closest(selector) : null;
  }

  function setupMenu() {
    var button = document.querySelector('[data-menu-button]');
    var nav = document.querySelector('[data-mobile-nav]');
    if (!button || !nav) {
      return;
    }
    button.addEventListener('click', function () {
      nav.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    if (slides.length < 2) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });
    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    start();
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function safeUrl(value) {
    return String(value || '').replace(/"/g, '%22').replace(/</g, '').replace(/>/g, '');
  }

  function setupSearch() {
    var index = window.SEARCH_INDEX || [];
    var inputs = Array.prototype.slice.call(document.querySelectorAll('.global-search-input'));
    inputs.forEach(function (input) {
      var wrap = input.parentElement;
      var panel = wrap ? wrap.querySelector('.search-panel') : null;
      if (!panel) {
        return;
      }

      function closePanel() {
        panel.classList.remove('is-open');
        panel.innerHTML = '';
      }

      function render(items) {
        if (!items.length) {
          closePanel();
          return;
        }
        panel.innerHTML = items.slice(0, 8).map(function (item) {
          return '<a class="search-result" href="' + safeUrl(item.url) + '">' +
            '<img src="' + safeUrl(item.cover) + '" alt="' + escapeHtml(item.title) + '">' +
            '<span><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.region) + ' · ' + escapeHtml(item.year) + ' · ' + escapeHtml(item.type) + '</span></span>' +
            '</a>';
        }).join('');
        panel.classList.add('is-open');
      }

      input.addEventListener('input', function () {
        var q = normalize(input.value);
        if (q.length < 1) {
          closePanel();
          return;
        }
        var results = index.filter(function (item) {
          return normalize(item.title + ' ' + item.region + ' ' + item.type + ' ' + item.year + ' ' + item.tags + ' ' + item.line).indexOf(q) !== -1;
        });
        render(results);
      });

      input.addEventListener('keydown', function (event) {
        if (event.key === 'Enter') {
          var first = panel.querySelector('a');
          if (first) {
            window.location.href = first.getAttribute('href');
          }
        }
        if (event.key === 'Escape') {
          closePanel();
        }
      });

      document.addEventListener('click', function (event) {
        if (!wrap.contains(event.target)) {
          closePanel();
        }
      });
    });
  }

  function setupFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));
    scopes.forEach(function (scope) {
      var list = scope.parentElement ? scope.parentElement.querySelector('[data-card-list]') : null;
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.children);
      var keyword = scope.querySelector('[data-filter-keyword]');
      var type = scope.querySelector('[data-filter-type]');
      var year = scope.querySelector('[data-filter-year]');

      function apply() {
        var q = normalize(keyword ? keyword.value : '');
        var t = normalize(type ? type.value : '');
        var y = normalize(year ? year.value : '');
        cards.forEach(function (card) {
          var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-type') + ' ' + card.getAttribute('data-year') + ' ' + card.getAttribute('data-tags'));
          var okKeyword = !q || haystack.indexOf(q) !== -1;
          var okType = !t || normalize(card.getAttribute('data-type')).indexOf(t) !== -1;
          var okYear = !y || normalize(card.getAttribute('data-year')) === y;
          card.classList.toggle('is-filtered-out', !(okKeyword && okType && okYear));
        });
      }

      [keyword, type, year].forEach(function (control) {
        if (control) {
          control.addEventListener('input', apply);
          control.addEventListener('change', apply);
        }
      });
    });
  }

  function setupPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));
    players.forEach(function (player) {
      var video = player.querySelector('video');
      var trigger = player.querySelector('[data-play-trigger]');
      var state = player.querySelector('[data-player-state]');
      if (!video || !trigger) {
        return;
      }
      var stream = video.getAttribute('data-stream');
      var hls = null;
      var loaded = false;

      function setState(text) {
        if (state) {
          state.textContent = text || '';
        }
      }

      function loadStream() {
        if (loaded) {
          return Promise.resolve();
        }
        loaded = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
          return Promise.resolve();
        }
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
          return new Promise(function (resolve) {
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
              resolve();
            });
            window.setTimeout(resolve, 1600);
          });
        }
        video.src = stream;
        return Promise.resolve();
      }

      function play() {
        setState('正在加载');
        loadStream().then(function () {
          return video.play();
        }).then(function () {
          trigger.classList.add('is-hidden');
          setState('');
        }).catch(function () {
          trigger.classList.remove('is-hidden');
          setState('播放失败，请稍后再试');
        });
      }

      trigger.addEventListener('click', play);
      video.addEventListener('play', function () {
        trigger.classList.add('is-hidden');
        setState('');
      });
      video.addEventListener('pause', function () {
        if (video.currentTime === 0 || video.ended) {
          trigger.classList.remove('is-hidden');
        }
      });
      var sidePlay = document.querySelector('[data-side-play]');
      if (sidePlay) {
        sidePlay.addEventListener('click', function (event) {
          event.preventDefault();
          window.scrollTo({ top: player.offsetTop - 80, behavior: 'smooth' });
          play();
        });
      }
      window.addEventListener('beforeunload', function () {
        if (hls) {
          hls.destroy();
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMenu();
    setupHero();
    setupSearch();
    setupFilters();
    setupPlayers();
  });
})();
