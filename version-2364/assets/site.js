(function () {
  function $(selector, root) {
    return (root || document).querySelector(selector);
  }

  function $all(selector, root) {
    return Array.prototype.slice.call(
      (root || document).querySelectorAll(selector),
    );
  }

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .trim();
  }

  function initNavigation() {
    var toggle = $("[data-nav-toggle]");
    var mobile = $("[data-mobile-nav]");
    if (!toggle || !mobile) {
      return;
    }
    toggle.addEventListener("click", function () {
      var opened = mobile.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", opened ? "true" : "false");
      toggle.textContent = opened ? "×" : "☰";
    });
  }

  function initHero() {
    var slides = $all("[data-hero-slide]");
    if (slides.length <= 1) {
      return;
    }
    var dots = $all("[data-hero-dot]");
    var current = slides.findIndex(function (slide) {
      return slide.classList.contains("is-active");
    });
    if (current < 0) {
      current = 0;
    }

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, idx) {
        slide.classList.toggle("is-active", idx === current);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("is-active", idx === current);
      });
    }

    var previous = $("[data-hero-prev]");
    var next = $("[data-hero-next]");
    if (previous) {
      previous.addEventListener("click", function () {
        show(current - 1);
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
      });
    }
    dots.forEach(function (dot, idx) {
      dot.addEventListener("click", function () {
        show(idx);
      });
    });
    window.setInterval(function () {
      show(current + 1);
    }, 6500);
  }

  function initFilters() {
    var root = $("[data-filter-root]");
    if (!root) {
      return;
    }
    var cards = $all("[data-card]", root);
    var searchInput = $("[data-filter-search]", root);
    var regionSelect = $("[data-filter-region]", root);
    var typeSelect = $("[data-filter-type]", root);
    var status = $("[data-filter-status]", root);
    var chips = $all("[data-filter-chip]", root);
    var activeChip = "";

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");
    if (query && searchInput) {
      searchInput.value = query;
    }

    function cardMatches(card) {
      var haystack = normalize(
        [
          card.getAttribute("data-title"),
          card.getAttribute("data-region"),
          card.getAttribute("data-type"),
          card.getAttribute("data-year"),
          card.getAttribute("data-genre"),
          card.getAttribute("data-tags"),
        ].join(" "),
      );
      var text = normalize(searchInput ? searchInput.value : "");
      var region = normalize(regionSelect ? regionSelect.value : "");
      var type = normalize(typeSelect ? typeSelect.value : "");
      var chip = normalize(activeChip);
      return (
        (!text || haystack.indexOf(text) >= 0) &&
        (!region ||
          normalize(card.getAttribute("data-region")).indexOf(region) >= 0) &&
        (!type ||
          normalize(card.getAttribute("data-type")).indexOf(type) >= 0) &&
        (!chip || haystack.indexOf(chip) >= 0)
      );
    }

    function apply() {
      var visible = 0;
      cards.forEach(function (card) {
        var matched = cardMatches(card);
        card.style.display = matched ? "" : "none";
        if (matched) {
          visible += 1;
        }
      });
      if (status) {
        status.textContent =
          visible > 0 ? "已筛选出匹配影片" : "未找到匹配影片";
      }
    }

    [searchInput, regionSelect, typeSelect].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        var value = chip.getAttribute("data-filter-chip") || "";
        activeChip = activeChip === value ? "" : value;
        chips.forEach(function (item) {
          item.classList.toggle(
            "is-active",
            item.getAttribute("data-filter-chip") === activeChip &&
              activeChip !== "",
          );
        });
        apply();
      });
    });

    var form = $("[data-filter-form]", root);
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        apply();
      });
    }

    apply();
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNavigation();
    initHero();
    initFilters();
  });
})();
