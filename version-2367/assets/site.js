(function () {
  const toggle = document.querySelector(".menu-toggle");
  const panel = document.querySelector(".mobile-panel");

  if (toggle && panel) {
    toggle.addEventListener("click", function () {
      const open = panel.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.textContent = open ? "×" : "☰";
    });
  }

  const slides = Array.from(document.querySelectorAll(".hero-slide"));
  const dots = Array.from(document.querySelectorAll(".hero-dot"));
  let current = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle("is-active", i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle("is-active", i === current);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener("click", function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  const filterForm = document.querySelector(".catalog-filter-form");
  if (filterForm) {
    const keyword = filterForm.querySelector(".catalog-keyword");
    const year = filterForm.querySelector(".catalog-year");
    const region = filterForm.querySelector(".catalog-region");
    const cards = Array.from(document.querySelectorAll(".movie-card"));
    const empty = document.querySelector(".empty-state");

    function applyFilter() {
      const q = keyword ? keyword.value.trim().toLowerCase() : "";
      const y = year ? year.value : "";
      const r = region ? region.value : "";
      let visible = 0;

      cards.forEach(function (card) {
        const text = [
          card.dataset.title || "",
          card.dataset.genre || "",
          card.dataset.tags || "",
          card.dataset.region || "",
          card.dataset.year || ""
        ].join(" ").toLowerCase();
        const matchText = !q || text.indexOf(q) !== -1;
        const matchYear = !y || card.dataset.year === y;
        const matchRegion = !r || card.dataset.region === r;
        const ok = matchText && matchYear && matchRegion;
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    filterForm.addEventListener("input", applyFilter);
    filterForm.addEventListener("change", applyFilter);
    filterForm.addEventListener("reset", function () {
      setTimeout(applyFilter, 0);
    });
  }

  const searchResults = document.getElementById("searchResults");
  if (searchResults && Array.isArray(window.MOVIE_SEARCH_INDEX)) {
    const params = new URLSearchParams(window.location.search);
    const input = document.getElementById("searchInput");
    const empty = document.getElementById("searchEmpty");
    const initial = params.get("q") || "";

    if (input) {
      input.value = initial;
    }

    function renderSearch(value) {
      const q = value.trim().toLowerCase();
      const source = window.MOVIE_SEARCH_INDEX;
      const matched = q
        ? source.filter(function (movie) {
            return movie.text.indexOf(q) !== -1;
          }).slice(0, 120)
        : source.slice(0, 48);

      searchResults.innerHTML = matched.map(function (movie) {
        return [
          '<article class="movie-card compact">',
          '<a class="movie-cover" href="./' + movie.file + '">',
          '<img src="' + movie.cover + '" alt="' + movie.title + '" loading="lazy">',
          '<span class="play-badge">▶</span>',
          '<span class="score-badge">' + movie.score + '</span>',
          '</a>',
          '<div class="movie-card-body">',
          '<h3><a href="./' + movie.file + '">' + movie.title + '</a></h3>',
          '<p class="movie-desc">' + movie.description + '</p>',
          '<div class="movie-meta"><span>' + movie.year + '</span><span>' + movie.region + '</span><span>' + movie.genre + '</span></div>',
          '</div>',
          '</article>'
        ].join('');
      }).join('');

      if (empty) {
        empty.hidden = matched.length !== 0;
      }
    }

    renderSearch(initial);

    if (input) {
      input.addEventListener("input", function () {
        renderSearch(input.value);
      });
    }
  }
}());
