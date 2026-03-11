//The page was written by Chris H and James S.
window.TMDB = (function () {
  function buildUrl(path, params = {}) {
    const url = new URL(Store.config.baseUrl + path);
    url.searchParams.set("api_key", Store.config.apiKey);

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        url.searchParams.set(key, value);
      }
    });

    return url.toString();
  }

  function get(path, params = {}) {
    return $.ajax({
      url: buildUrl(path, params),
      method: "GET",
      dataType: "json"
    });
  }

  function post(path, body = {}, params = {}) {
    return $.ajax({
      url: buildUrl(path, params),
      method: "POST",
      contentType: "application/json",
      data: JSON.stringify(body),
      dataType: "json"
    });
  }

  return {
    getPopularMovies(page = 1) {
      return get("/movie/popular", { page });
    },

    searchMovies(query, page = 1) {
      return get("/search/movie", {
        query,
        page,
        include_adult: false
      });
    },

    discoverMovies({ genre = "", sort = "popularity.desc", page = 1 } = {}) {
      return get("/discover/movie", {
        with_genres: genre,
        sort_by: sort,
        page,
        include_adult: false
      });
    },

    getGenres() {
      return get("/genre/movie/list");
    },

    // AUTH 
    createRequestToken() {
      return get("/authentication/token/new");
    },

    createSession(requestToken) {
      return post("/authentication/session/new", {
        request_token: requestToken
      });
    },

    getAccount(sessionId) {
      return get("/account", {
        session_id: sessionId
      });
    },      

    //Favorites and Watchlist
    getFavoriteMovies(accountId, sessionId, page = 1) {
      return get(`/account/${accountId}/favorite/movies`, {
        session_id: sessionId,
        page
      });
    },

    getWatchlistMovies(accountId, sessionId, page = 1) {
      return get(`/account/${accountId}/watchlist/movies`, {
        session_id: sessionId,
        page
      });
    },

    setFavorite(accountId, sessionId, movieId, isFavorite) {
      return post(`/account/${accountId}/favorite`, {
        media_type: "movie",
        media_id: Number(movieId),
        favorite: isFavorite
      }, {
        session_id: sessionId
      });
    },

    setWatchlist(accountId, sessionId, movieId, isWatchlist) {
      return post(`/account/${accountId}/watchlist`, {
        media_type: "movie",
        media_id: Number(movieId),
        watchlist: isWatchlist
      }, {
        session_id: sessionId
      });
    }
  };
})();
