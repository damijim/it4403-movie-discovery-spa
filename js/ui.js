//Written by Chris H and James S
window.UI = (function () {
  function setStatus(message, type = "") {
    const $status = $("#statusBar");
    $status.removeClass("status--error status--ok");

    if (type === "error") $status.addClass("status--error");
    if (type === "ok") $status.addClass("status--ok");

    $status.text(message || "");
  }

  function escapeHtml(value) {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getPosterUrl(path) {
    return path
      ? `${Store.config.imageBase}${path}`
      : Store.config.placeholderPoster;
  }

  function movieCard(movie) {
    const title = movie.title || "Untitled";
    const year = movie.release_date ? movie.release_date.slice(0, 4) : "—";
    const rating = typeof movie.vote_average === "number"
      ? movie.vote_average.toFixed(1)
      : "—";

    return `
      <article class="card movie-tile" data-movie-id="${movie.id}">
        <img
          class="poster"
          src="${getPosterUrl(movie.poster_path)}"
          alt="${escapeHtml(title)} poster"
        />
        <div class="card__body">
          <h3 class="card__title">${escapeHtml(title)}</h3>
          <p class="card__meta">${escapeHtml(year)} • ⭐ ${escapeHtml(rating)}</p> 
          <div class="card__actions">
            <button class="btn btn--small js-details-btn" type="button" data-movie-id="${movie.id}">
              Details
            </button>
            <button class="btn btn--small js-favorite-btn" type="button" data-movie-id="${movie.id}">
              + Favorite
            </button>
            <button class="btn btn--small js-watchlist-btn" type="button" data-movie-id="${movie.id}">
              + Watchlist
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function emptyState(message) {
    return `
      <div class="panel">
        <p class="muted">${escapeHtml(message)}</p>
      </div>
    `;
  }

  function renderHomeGrid(data, modeLabel) {
    const $home = $("#viewHome");
    const $title = $home.find(".view__title");
    const $subtitle = $home.find(".view__subtitle");
    const $grid = $home.find(".grid");

    $title.text(modeLabel);

    if (Store.state.homeMode === "search") {
      $subtitle.text(`Showing search results for "${Store.state.homeQuery}"`);
    } else {
      $subtitle.text("Live data loaded from TMDB.");
    }

    const results = data?.results || [];
    if (!results.length) {
      $grid.html(emptyState("No movies found."));
      return;
    }

    $grid.html(results.map(movieCard).join(""));
  }

  function renderDiscoverGrid(data) {
    const $discover = $("#viewDiscover");
    const $grid = $discover.find(".grid");
    const $pagerText = $discover.find(".pager__text");

    const results = data?.results || [];
    if (!results.length) {
      $grid.html(emptyState("No discover results found."));
    } else {
      $grid.html(results.map(movieCard).join(""));
    }

    $pagerText.text(`Page ${data.page || 1}`);
  }

  function updateDiscoverControls() {
    $("#genreSelect").val(Store.state.discoverGenre);
    $("#sortSelect").val(Store.state.discoverSort);
  }

  function fillGenreOptions(genres) {
    const $select = $("#genreSelect");
    const currentValue = $select.val();

    $select.html(`<option value="">Any</option>`);

    genres.forEach((genre) => {
      $select.append(
        `<option value="${genre.id}">${escapeHtml(genre.name)}</option>`
      );
    });

    if (Store.state.discoverGenre) {
      $select.val(Store.state.discoverGenre);
    } else if (currentValue) {
      $select.val(currentValue);
    }
  }

  function setActiveView(viewName) {
    $(".view").removeClass("is-active");

    if (viewName === "discover") {
      $("#viewDiscover").addClass("is-active");
    } else if (viewName === "lists") {
      $("#viewLists").addClass("is-active");
    } else {
      $("#viewHome").addClass("is-active");
    }

    $(".nav__link").removeClass("is-active");
    $(`.nav__link[href="#${viewName}"]`).addClass("is-active");
  }

  return {
    setStatus,
    renderHomeGrid,
    renderDiscoverGrid,
    updateDiscoverControls,
    fillGenreOptions,
    setActiveView
  };
})();
