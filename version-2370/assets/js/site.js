document.addEventListener('DOMContentLoaded', function () {
    var menuButton = document.querySelector('[data-menu-button]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-search-go]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var q = input ? input.value.trim() : '';
            var target = './search.html';
            if (q) {
                target += '?q=' + encodeURIComponent(q);
            }
            window.location.href = target;
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
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

    function scheduleHero() {
        if (timer) {
            window.clearInterval(timer);
        }
        if (slides.length > 1) {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    if (slides.length) {
        showSlide(0);
        scheduleHero();
        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(current - 1);
                scheduleHero();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                showSlide(current + 1);
                scheduleHero();
            });
        }
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                scheduleHero();
            });
        });
    }

    document.querySelectorAll('[data-scroll-row]').forEach(function (row) {
        var wrap = row.closest('[data-scroll-wrap]');
        if (!wrap) {
            return;
        }
        var prevButton = wrap.querySelector('[data-scroll-prev]');
        var nextButton = wrap.querySelector('[data-scroll-next]');
        var distance = 360;
        if (prevButton) {
            prevButton.addEventListener('click', function () {
                row.scrollBy({ left: -distance, behavior: 'smooth' });
            });
        }
        if (nextButton) {
            nextButton.addEventListener('click', function () {
                row.scrollBy({ left: distance, behavior: 'smooth' });
            });
        }
    });

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-filter-input]');
        var region = scope.querySelector('[data-filter-region]');
        var type = scope.querySelector('[data-filter-type]');
        var year = scope.querySelector('[data-filter-year]');
        var container = scope.nextElementSibling;
        while (container && !container.hasAttribute('data-filter-results')) {
            container = container.nextElementSibling;
        }
        if (!container) {
            return;
        }
        var cards = Array.prototype.slice.call(container.querySelectorAll('[data-search-card]'));
        var empty = container.querySelector('[data-no-results]');
        var params = new URLSearchParams(window.location.search);
        var initial = params.get('q');
        if (initial && input) {
            input.value = initial;
        }

        function norm(value) {
            return (value || '').toString().toLowerCase().trim();
        }

        function matchYear(cardYear, selected) {
            if (!selected) {
                return true;
            }
            if (selected === '2020') {
                var number = parseInt(cardYear, 10);
                return Number.isFinite(number) && number <= 2020;
            }
            return cardYear.indexOf(selected) !== -1;
        }

        function apply() {
            var q = norm(input && input.value);
            var r = norm(region && region.value);
            var t = norm(type && type.value);
            var y = norm(year && year.value);
            var visible = 0;
            cards.forEach(function (card) {
                var text = norm(card.getAttribute('data-title'));
                var cardRegion = norm(card.getAttribute('data-region'));
                var cardType = norm(card.getAttribute('data-type'));
                var cardYear = norm(card.getAttribute('data-year'));
                var ok = true;
                if (q && text.indexOf(q) === -1) {
                    ok = false;
                }
                if (r && cardRegion.indexOf(r) === -1) {
                    ok = false;
                }
                if (t && cardType.indexOf(t) === -1) {
                    ok = false;
                }
                if (!matchYear(cardYear, y)) {
                    ok = false;
                }
                card.style.display = ok ? '' : 'none';
                if (ok) {
                    visible += 1;
                }
            });
            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        [input, region, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', apply);
                control.addEventListener('change', apply);
            }
        });
        apply();
    });
});
