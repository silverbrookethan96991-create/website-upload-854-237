(function () {
  function normalize(value) {
    return (value || "").toString().trim().toLowerCase();
  }

  function setupMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!button || !panel) {
      return;
    }
    button.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll(".hero-slide"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function setSlide(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        setSlide(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        setSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function setupLocalFilters() {
    var inputs = Array.prototype.slice.call(document.querySelectorAll("[data-local-filter]"));
    inputs.forEach(function (input) {
      var container = input.closest("main") || document;
      var list = container.querySelector("[data-filter-list]");
      if (!list) {
        return;
      }
      var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));
      function apply() {
        var query = normalize(input.value);
        cards.forEach(function (card) {
          var text = normalize(card.getAttribute("data-search"));
          card.classList.toggle("is-filtered-out", query && text.indexOf(query) === -1);
        });
      }
      input.addEventListener("input", apply);
      apply();
    });
  }

  function setupSearchPage() {
    var results = document.querySelector("[data-search-results]");
    if (!results) {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    var input = document.querySelector("[data-search-input]");
    var localInput = document.querySelector("[data-local-filter]");
    var cards = Array.prototype.slice.call(results.querySelectorAll(".movie-card"));

    function apply(value) {
      var textValue = normalize(value);
      cards.forEach(function (card) {
        var text = normalize(card.getAttribute("data-search"));
        card.classList.toggle("is-filtered-out", textValue && text.indexOf(textValue) === -1);
      });
    }

    if (input) {
      input.value = query;
      input.addEventListener("input", function () {
        apply(input.value);
        if (localInput) {
          localInput.value = input.value;
        }
      });
    }
    if (localInput) {
      localInput.value = query;
      localInput.addEventListener("input", function () {
        apply(localInput.value);
        if (input) {
          input.value = localInput.value;
        }
      });
    }
    Array.prototype.slice.call(document.querySelectorAll("[data-search-chip]")).forEach(function (button) {
      button.addEventListener("click", function () {
        var value = button.getAttribute("data-search-chip") || "";
        if (input) {
          input.value = value;
        }
        if (localInput) {
          localInput.value = value;
        }
        apply(value);
      });
    });
    apply(query);
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupLocalFilters();
    setupSearchPage();
  });
})();
