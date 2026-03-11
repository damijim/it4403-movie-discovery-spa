window.Store = {
  config: {
    apiKey: "7edb209ee6014a0d39422a95e0af0362",
    baseUrl: "https://api.themoviedb.org/3",
    imageBase: "https://image.tmdb.org/t/p/w500",
    placeholderPoster: "https://via.placeholder.com/400x600?text=No+Poster"
  },

  state: {
    currentView: "home",
    homeMode: "popular", // popular | search
    homePage: 1,
    homeQuery: "",

    discoverPage: 1,
    discoverGenre: "",
    discoverSort: "popularity.desc",

    genresLoaded: false,
    genres: []
    //Auth/Session fields
    sessionId: localStorage.getItem("tmdb_session_id") || "",
    accountId: localStorage.getItem("tmdb_account_id") || ""
  }
};
