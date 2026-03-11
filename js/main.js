//Written by Chris H and James S
$(function () {
  bindEvents();
  initApp();
});

function bindEvents() {
  $(".nav__link").on("click", function () {
    const targetHash = $(this).attr("href") || "#home";
    const viewName = targetHash.replace("#", "") || "home";
    Store.state.currentView = viewName;
    UI.setActiveView(viewName);
  });

  $(window).on("hashchange", function () {
    const viewName = Router.getViewFromHash();
    Store.state.currentView = viewName;
    UI.setActiveView(viewName);

    if (viewName === "home") {
      loadHome();
    } else if (viewName === "discover") {
      loadDiscover();
    }
  });

  $("#searchForm").on("submit", async function (e) {
    e.preventDefault();

    const query = $("#searchInput").val().trim();
    if (!query) {
      UI.setStatus("Please enter a movie title to search.", "error");
      return;
    }

    Store.state.homeMode = "search";
    Store.state.homeQuery = query;
    Store.state.homePage = 1;

    Router.go("home");
    await loadHome();
  });

    // LOGIN BUTTON
  $("#authBtn").on("click", async function () {

    // If already logged in → log out
    if (Store.state.sessionId) {
      logout();
      return;
    }

    try {
      UI.setStatus("Starting TMDB login...");

      const tokenResp = await TMDB.createRequestToken();
      const requestToken = tokenResp.request_token;

      sessionStorage.setItem("tmdb_request_token", requestToken);

      const redirectTo =
        window.location.origin + window.location.pathname + "?tmdb_auth=1";  //Changed #auth to "?tmdb_auth=1"; query string

      const approveUrl =
        `https://www.themoviedb.org/authenticate/${requestToken}?redirect_to=${encodeURIComponent(redirectTo)}`;

      window.location.href = approveUrl;

    } catch (error) {
      console.error(error);
      UI.setStatus("Could not start login.", "error");
    }

  });
  
  // Discover Filters
  $("#sortSelect, #genreSelect").on("change", function () {
    Store.state.discoverGenre = $("#genreSelect").val();
    Store.state.discoverSort = $("#sortSelect").val();
  });

  // Apply button inside Discover filters
  $("#viewDiscover .filters .btn--primary").on("click", async function () {
    Store.state.discoverGenre = $("#genreSelect").val();
    Store.state.discoverSort = $("#sortSelect").val();
    Store.state.discoverPage = 1;

    await loadDiscover();
    UI.setStatus("Discover filters applied.", "ok");
  });

  // Discover pager buttons
  $("#viewDiscover .pager .btn").first().on("click", async function () {
    if (Store.state.discoverPage <= 1) {
      UI.setStatus("You are already on page 1.", "error");
      return;
    }

    Store.state.discoverPage -= 1;
    await loadDiscover();
  });

  $("#viewDiscover .pager .btn").last().on("click", async function () {
    Store.state.discoverPage += 1;
    await loadDiscover();
  });

  // Placeholder Details button behavior for now
  $(document).on("click", ".js-details-btn", function () {
    const movieId = $(this).data("movie-id");
    UI.setStatus(`Details clicked for movie ID ${movieId}. Details view can be added next.`, "ok");
  });
}

async function initApp() {
  updateAuthButton(); //Added button auth
  UI.setActiveView(Router.getViewFromHash());

  try {
    await finishLoginIfReturningFromTMDB();  //Call auth setup
    await loadGenres();

    const currentView = Router.getViewFromHash();
    if (currentView === "discover") {
      await loadDiscover();
    } else {
      await loadHome();
    }
  } catch (error) {
    console.error(error);
    UI.setStatus("App failed to initialize. Check your TMDB API key.", "error");
  }
}

async function loadGenres() {
  if (Store.state.genresLoaded) return;

  try {
    const data = await TMDB.getGenres();
    Store.state.genres = data.genres || [];
    Store.state.genresLoaded = true;
    UI.fillGenreOptions(Store.state.genres);
    UI.updateDiscoverControls();
  } catch (error) {
    console.error(error);
    UI.setStatus("Could not load genres.", "error");
  }
}

async function loadHome() {
  try {
    UI.setStatus("Loading movies...");

    let data;
    if (Store.state.homeMode === "search" && Store.state.homeQuery) {
      data = await TMDB.searchMovies(Store.state.homeQuery, Store.state.homePage);
      UI.renderHomeGrid(data, "Search Results");
      UI.setStatus(`Loaded search results for "${Store.state.homeQuery}".`, "ok");
    } else {
      data = await TMDB.getPopularMovies(Store.state.homePage);
      UI.renderHomeGrid(data, "Popular Right Now");
      UI.setStatus("Loaded popular movies.", "ok");
    }
  } catch (error) {
    console.error(error);
    UI.setStatus("Could not load Home movies.", "error");
  }
}

async function loadDiscover() {
  try {
    UI.setStatus("Loading discover results...");
    UI.updateDiscoverControls();

    const data = await TMDB.discoverMovies({
      genre: Store.state.discoverGenre,
      sort: Store.state.discoverSort,
      page: Store.state.discoverPage
    });

    UI.renderDiscoverGrid(data);
    UI.setStatus("Loaded discover results.", "ok");
  } catch (error) {
    console.error(error);
    UI.setStatus("Could not load Discover results.", "error");
  }
}

function updateAuthButton() {
  if (Store.state.sessionId) {
    $("#authBtn").text("Log out");
  } else {
    $("#authBtn").text("Log in");
  }
}

function logout() {
  Store.state.sessionId = "";
  Store.state.accountId = "";

  localStorage.removeItem("tmdb_session_id");
  localStorage.removeItem("tmdb_account_id");
  sessionStorage.removeItem("tmdb_request_token");

  updateAuthButton();
  UI.setStatus("Logged out.", "ok");
  Router.go("home");
}

async function finishLoginIfReturningFromTMDB() {
  const params = new URLSearchParams(window.location.search);
  const isReturningFromTMDB = params.get("tmdb_auth") === "1";
  const approved = params.get("approved");
  const returnedToken = params.get("request_token");

  if (!isReturningFromTMDB) return;

  if (approved !== "true") {
    UI.setStatus("TMDB login was not approved.", "error");
    window.history.replaceState({}, document.title, window.location.pathname + "#home");
    return;
  }

  const token = returnedToken || sessionStorage.getItem("tmdb_request_token");
  if (!token) {
    UI.setStatus("Missing request token. Please click Log in again.", "error");
    window.history.replaceState({}, document.title, window.location.pathname + "#home");
    return;
  }

  try {
    UI.setStatus("Finishing TMDB login...");

    const sessionResp = await TMDB.createSession(token);
    const sessionId = sessionResp.session_id;

    Store.state.sessionId = sessionId;
    localStorage.setItem("tmdb_session_id", sessionId);

    const account = await TMDB.getAccount(sessionId);
    Store.state.accountId = String(account.id);
    localStorage.setItem("tmdb_account_id", String(account.id));

    sessionStorage.removeItem("tmdb_request_token");

    updateAuthButton();
    UI.setStatus("Logged in successfully.", "ok");

    window.history.replaceState({}, document.title, window.location.pathname + "#lists");
    UI.setActiveView("lists");
  } catch (error) {
    console.error(error);
    UI.setStatus("Could not complete login.", "error");
    window.history.replaceState({}, document.title, window.location.pathname + "#home");
  }
}
