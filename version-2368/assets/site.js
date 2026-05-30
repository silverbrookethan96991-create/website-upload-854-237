(function () {
  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var toggle = document.querySelector("[data-menu-toggle]");
    var nav = document.querySelector("[data-main-nav]");

    if (toggle && nav) {
      toggle.addEventListener("click", function () {
        nav.classList.toggle("is-open");
      });
    }

    var carousel = document.querySelector("[data-hero-carousel]");

    if (carousel) {
      var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
      var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
      var index = 0;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }

        index = (nextIndex + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });

        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("active", dotIndex === index);
        });
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          show(Number(dot.getAttribute("data-hero-dot")) || 0);
        });
      });

      window.setInterval(function () {
        show(index + 1);
      }, 5500);
    }

    document.querySelectorAll("[data-filter-scope]").forEach(function (scope) {
      var input = scope.querySelector("[data-filter-input]");
      var cards = Array.prototype.slice.call(scope.querySelectorAll(".movie-card"));

      if (!input || !cards.length) {
        return;
      }

      input.addEventListener("input", function () {
        var term = input.value.trim().toLowerCase();

        cards.forEach(function (card) {
          var haystack = (card.getAttribute("data-search") || "").toLowerCase();
          card.classList.toggle("is-hidden", term && haystack.indexOf(term) === -1);
        });
      });
    });

    document.querySelectorAll("[data-site-search]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
      });
    });

    document.querySelectorAll(".video-player-block").forEach(function (block) {
      var video = block.querySelector("video");
      var button = block.querySelector(".play-overlay");
      var source = block.getAttribute("data-source");
      var initialized = false;
      var hlsInstance = null;

      if (!video || !source || !button) {
        return;
      }

      function attachSource() {
        if (initialized) {
          return;
        }

        initialized = true;

        if (video.canPlayType("application/vnd.apple.mpegurl") || video.canPlayType("application/x-mpegURL")) {
          video.src = source;
          return;
        }

        if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({
            enableWorker: true,
            lowLatencyMode: false
          });
          hlsInstance.loadSource(source);
          hlsInstance.attachMedia(video);
          return;
        }

        video.src = source;
      }

      function play() {
        attachSource();
        button.classList.add("is-hidden");
        var attempt = video.play();

        if (attempt && typeof attempt.catch === "function") {
          attempt.catch(function () {
            button.classList.remove("is-hidden");
          });
        }
      }

      button.addEventListener("click", play);

      video.addEventListener("play", function () {
        button.classList.add("is-hidden");
      });

      video.addEventListener("pause", function () {
        if (!video.ended) {
          button.classList.remove("is-hidden");
        }
      });

      video.addEventListener("click", function () {
        if (video.paused) {
          play();
        }
      });

      window.addEventListener("pagehide", function () {
        if (hlsInstance) {
          hlsInstance.destroy();
          hlsInstance = null;
        }
      });
    });
  });
})();
