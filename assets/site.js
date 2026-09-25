/* Lumora Ops, lumorafl.com. Small helpers shared by every page. Nothing here calls the network.
   1. The phone menu closes on Escape, on a link and on a tap outside it.
   2. The language switch remembers the choice in this browser only ("lumora-lang"), so the
      home page can open in that language next time. That is the one value the site stores. */
(function () {
  "use strict";

  var menu = document.querySelector("details.menu");
  if (menu) {
    var summary = menu.querySelector("summary");
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.open) {
        menu.open = false;
        if (summary) summary.focus();
      }
    });
    menu.addEventListener("click", function (e) {
      if (e.target.closest && e.target.closest(".menu-panel a")) menu.open = false;
    });
    document.addEventListener("click", function (e) {
      if (menu.open && !menu.contains(e.target)) menu.open = false;
    });
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[data-lang]");
    if (!a) return;
    try { localStorage.setItem("lumora-lang", a.getAttribute("data-lang")); } catch (err) {}
  });
})();
