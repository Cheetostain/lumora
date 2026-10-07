/* Lumora, lumorafl.com. Small helpers shared by every page. Nothing here calls the network.
   1. The phone menu closes on Escape, on a link and on a tap outside it.
   2. The language switch remembers the choice in this browser only ("lumora-lang"), so the
      home page can open in that language next time. The overnight phone remembers a pause
      ("lumora-feed"). Those are the two values the site stores (privacy page, section 1). */
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
  document.querySelectorAll(".demo video").forEach(function (v) {
    var b = v.parentNode.querySelector(".demo-ctl");
    function set(p) { b.setAttribute("aria-label", b.getAttribute(p ? "data-pause" : "data-play")); b.className = "demo-ctl" + (p ? "" : " paused"); }
    function go() { v.play().then(function () { set(1); }, function () { set(0); }); }
    function stop() { v.pause(); set(0); }
    b.onclick = function () { v.dataset.u = 1; if (v.paused) go(); else stop(); };
    if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      new IntersectionObserver(function (e) { if (!v.dataset.u) { if (e[0].isIntersecting) go(); else stop(); } }, { threshold: 0.4 }).observe(v);
    } else set(0);
  });
  var f = document.querySelector("[data-feed]");
  if (f && "IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var L = [].slice.call(f.querySelectorAll(".notes li")), C = f.querySelector(".clock"), B = f.querySelector(".demo-ctl"), raf, t0, on, P, el = 0,
      A = [1.2, 4.4, 6.2, 8, 11.4], K = ["11:48", "3:02", "3:04", "3:06", "6:41"],
      e = function (x) { x = x < 0 ? 0 : x > 1 ? 1 : x; return x * x * (3 - 2 * x); },
      reset = function () { el = 0; L.forEach(function (li) { li.style.top = li.style.opacity = ""; }); C.textContent = "6:41"; },
      draw = function (t) {
        var n = 0, fade = 1 - e((t - 16.4) / 0.8);
        A.forEach(function (a) { if (t >= a) n++; });
        C.textContent = n ? K[n - 1] : "11:47";
        L.forEach(function (li, i) {
          var s = 0, g = e((t - A[i]) / 0.5);
          for (var j = i + 1; j < A.length; j++) s += e((t - A[j]) / 0.5);
          li.style.top = "calc(var(--st)*" + s + " - " + (1 - g) * 10 + "cqw)";
          li.style.opacity = i < n ? Math.min(g, fade) : 0;
        });
      },
      tick = function (now) { t0 = t0 || now - el * 1e3; el = (now - t0) / 1e3 % 18; draw(el); raf = requestAnimationFrame(tick); },
      go = function () { cancelAnimationFrame(raf); t0 = 0; if (on && !P) raf = requestAnimationFrame(tick); B.setAttribute("aria-pressed", !!P); B.className = "demo-ctl" + (P ? " paused" : ""); };
    try { P = localStorage.getItem("lumora-feed") == "1"; } catch (x) {}
    B.hidden = false;
    B.onclick = function () { P = !P; try { localStorage.setItem("lumora-feed", P ? 1 : 0); } catch (x) {} go(); };
    new IntersectionObserver(function (en) { on = en[0].isIntersecting; if (!on && !P) reset(); go(); }, { threshold: 0.3 }).observe(f);
  }
  // state change: the trade sheet stays sticky only while it fits under the bar (site.css .tsheet.tall)
  var ts = document.querySelector(".tsheet"), fit = function () { ts.classList.toggle("tall", ts.offsetHeight > innerHeight - 88); };
  if (ts) { fit(); addEventListener("resize", fit); addEventListener("load", fit); }
  var m = document.querySelector(".bird-fig");
  if (m && "IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var busy, hop = function () {
      if (busy) return;
      busy = 1; m.classList.remove("hop"); void m.offsetWidth; m.classList.add("hop");
      setTimeout(function () { busy = 0; }, 3300);
    };
    new IntersectionObserver(function (e, o) {
      if (e[0].isIntersecting) { m.classList.add("in"); setTimeout(hop, 1300); o.disconnect(); }
    }, { threshold: 0.5 }).observe(m);
    m.addEventListener("mouseenter", hop);
    m.addEventListener("click", hop);
  }
})();
