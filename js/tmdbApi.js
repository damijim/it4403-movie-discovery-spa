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
    }
  };
})();
