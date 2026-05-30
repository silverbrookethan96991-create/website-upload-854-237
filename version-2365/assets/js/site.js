(function () {
  var menuButton = document.querySelector('[data-menu-toggle]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', mobileNav.classList.contains('is-open'));
    });
  }

  var sliders = document.querySelectorAll('[data-hero-slider]');

  sliders.forEach(function (slider) {
    var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;

      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });

      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      if (timer) {
        clearInterval(timer);
      }

      timer = setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        showSlide(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    showSlide(0);
    start();
  });

  var browsers = document.querySelectorAll('.movie-browser');

  browsers.forEach(function (browser) {
    var input = browser.querySelector('[data-search-input]');
    var buttons = Array.prototype.slice.call(browser.querySelectorAll('[data-filter-value]'));
    var items = Array.prototype.slice.call(browser.querySelectorAll('.movie-card, .ranking-row'));
    var filterKey = '';
    var filterValue = '';

    function applyFilter() {
      var keyword = input ? input.value.trim().toLowerCase() : '';

      items.forEach(function (item) {
        var haystack = (item.getAttribute('data-title') || '').toLowerCase();
        var matchesKeyword = !keyword || haystack.indexOf(keyword) !== -1;
        var matchesFilter = true;

        if (filterKey && filterValue) {
          matchesFilter = (item.getAttribute('data-' + filterKey) || '') === filterValue;
        }

        item.classList.toggle('is-hidden', !(matchesKeyword && matchesFilter));
      });
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        buttons.forEach(function (other) {
          other.classList.remove('is-active');
        });

        button.classList.add('is-active');
        filterKey = button.getAttribute('data-filter-key') || '';
        filterValue = button.getAttribute('data-filter-value') || '';
        applyFilter();
      });
    });
  });
})();
