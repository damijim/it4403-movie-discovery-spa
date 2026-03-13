//Written by Chris H and James S
window.Router = (function () {
  function getViewFromHash() {
    const hash = window.location.hash.replace("#", "").trim();

    if (hash.startsWith("details/")) return "details";
    if (hash === "discover") return "discover";
    if (hash === "lists") return "lists";
    return "home";
  }

  function getDetailsIdFromHash() {
    const hash = window.location.hash.replace("#", "").trim();
    const parts = hash.split("/");
    return parts[0] === "details" ? parts[1] : "";
  }

  function go(viewName) {
    window.location.hash = viewName;
  }

  function goDetails(movieId) {
    window.location.hash = `details/${movieId}`;
  }

  return {
    getViewFromHash,
    getDetailsIdFromHash,
    go,
    goDetails
  };
})();
