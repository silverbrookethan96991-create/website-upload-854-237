(function () {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function () {
            navLinks.classList.toggle('is-open');
        });
    }

    const carousel = document.querySelector('.hero-carousel');

    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll('.hero-slide'));
        const dots = Array.from(carousel.querySelectorAll('.hero-dot'));
        let current = 0;
        let timer = null;

        const activate = function (index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        const start = function () {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                activate(current + 1);
            }, 5600);
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                activate(Number(dot.dataset.slide || 0));
                start();
            });
        });

        start();
    }

    const normalize = function (value) {
        return String(value || '').toLowerCase().trim();
    };

    const bindSearch = function (input) {
        const targetId = input.dataset.target;
        const grid = targetId ? document.getElementById(targetId) : input.closest('main');
        if (!grid) {
            return;
        }

        const cards = Array.from(grid.querySelectorAll('.movie-card'));
        const filterScope = grid.closest('.content-section') || document;
        const filterButtons = Array.from(filterScope.querySelectorAll('.filter-chip'));
        let activeFilter = 'all';

        const apply = function () {
            const query = normalize(input.value);
            cards.forEach(function (card) {
                const text = normalize(card.dataset.search);
                const region = normalize(card.dataset.region);
                const byText = !query || text.includes(query);
                const byFilter = activeFilter === 'all' || region === activeFilter;
                card.hidden = !(byText && byFilter);
            });
        };

        input.addEventListener('input', apply);

        filterButtons.forEach(function (button) {
            button.addEventListener('click', function () {
                activeFilter = normalize(button.dataset.filter || 'all');
                filterButtons.forEach(function (item) {
                    item.classList.toggle('is-active', item === button);
                });
                apply();
            });
        });
    };

    document.querySelectorAll('input[type="search"][data-target]').forEach(bindSearch);

    const backTop = document.querySelector('.back-top');

    if (backTop) {
        const updateBackTop = function () {
            backTop.classList.toggle('is-visible', window.scrollY > 360);
        };

        window.addEventListener('scroll', updateBackTop, { passive: true });
        updateBackTop();

        backTop.addEventListener('click', function () {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
})();
