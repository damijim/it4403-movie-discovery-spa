//Written by Chris H and James S
window.Router = (function () {
  function getViewFromHash() {
    const hash = window.location.hash.replace("#", "").trim();

    if (hash === "discover") return "discover";
    if (hash === "lists") return "lists";
    return "home";
  }

  function go(viewName) {
    window.location.hash = viewName;
  }

  return {
    getViewFromHash,
    go
  };
})();
