/* How it works + About only. Light page motion on top of system.js (SYSTEM.md section 9). Load after system.js, with defer.
   Nothing here loops, so no pause control is needed. Every sequence is CSS (how-about.css, "motion"): first frames
   exist only under html.js and prefers-reduced-motion: no-preference, as animations with fill "both", so if this file
   never runs a sequence still plays to its end. This file only:
   - holds a sequence that starts below the fold (.wait) until it is seen, and ends it at once under ?still (.still)
   - numbers the items of a .seq list (--i) for the stagger
   - times each floor-plan stop to the moment the drawn route reaches it
   - pairs a plan stop with its line in the list (hover and focus; a tap follows the link)
   - opens a disclosure when a link points at it ("Full terms") */
(function () {
  'use strict';
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var still = (window.Lumora && window.Lumora.still) || /[?&]still\b/.test(location.search) || matchMedia('(prefers-reduced-motion: reduce)').matches;

  // job: show our work. A [data-once] scope already on screen at load plays now; one below the fold holds its first
  // frame until it is 35% in view or covers 40% of the screen (a tall sheet on a phone never gets to 35%).
  function once() {
    $$('[data-once]').forEach(function (s) {
      $$('.seq', s).concat(s.classList.contains('seq') ? [s] : []).forEach(function (list) {
        Array.prototype.forEach.call(list.children, function (c, i) { c.style.setProperty('--i', i); });
      });
      if (still) { s.classList.add('still'); return; }
      if (!('IntersectionObserver' in window) || s.getBoundingClientRect().top < innerHeight * 0.85) return;
      s.classList.add('wait');
      var io = new IntersectionObserver(function (es) {
        var e = es[0];
        if (!e.isIntersecting || (e.intersectionRatio < 0.35 && e.intersectionRect.height < innerHeight * 0.4)) return;
        io.disconnect(); s.classList.remove('wait');
      }, { threshold: [0, 0.2, 0.35, 0.6] });
      io.observe(s);
    });
  }

  // job: show our work. The route is drawn from the door at walking pace; each stop number lands as the line reaches it.
  // ROUTE_* must match the .pl-route-m rule in how-about.css; EASE is --ease-move.
  var ROUTE_DELAY = 200, ROUTE_MS = 2000, EASE = [0.2, 0, 0, 1];
  function timeAt(f) {                  // the moment (0..1) a cubic-bezier animation reaches progress f
    var b = function (s, p1, p2) { return 3 * (1 - s) * (1 - s) * s * p1 + 3 * (1 - s) * s * s * p2 + s * s * s; };
    var lo = 0, hi = 1, s = f;
    for (var k = 0; k < 30; k++) { s = (lo + hi) / 2; if (b(s, EASE[1], EASE[3]) < f) lo = s; else hi = s; }
    return b(s, EASE[0], EASE[2]);
  }
  function planTiming(plan) {
    var path = plan.querySelector('.pl-route-m'), svg = plan.querySelector('svg');
    if (!path || !svg || !path.getTotalLength) return;
    var vb = svg.viewBox.baseVal, len = path.getTotalLength(), N = 240, pts = [];
    for (var k = 0; k <= N; k++) { var p = path.getPointAtLength(len * k / N); pts.push([p.x, p.y]); }
    $$('.plan-stops a', plan).forEach(function (a) {
      var x = parseFloat(a.style.getPropertyValue('--x')) / 100 * vb.width, y = parseFloat(a.style.getPropertyValue('--y')) / 100 * vb.height;
      var best = 0, bd = Infinity;
      pts.forEach(function (q, i) { var d = (q[0] - x) * (q[0] - x) + (q[1] - y) * (q[1] - y); if (d < bd) { bd = d; best = i; } });
      a.style.setProperty('--at', Math.round(ROUTE_DELAY + ROUTE_MS * timeAt(best / N)) + 'ms');
    });
  }

  // job: signifier. Pointing at a stop on the plan lights its line in the list, and the other way round.
  // Mouse and keyboard only: on a phone a tap follows the link, and the line it lands on lights (:target).
  function planPair(plan) {
    $$('.plan-stops a', plan).forEach(function (a) {
      var li = document.querySelector(a.getAttribute('href')); if (!li) return;
      var on = function (v) { a.classList.toggle('hl', v); li.classList.toggle('hl', v); };
      var mouse = function (e) { if (e.pointerType === 'mouse') on(true); };
      [a, li].forEach(function (el) { el.addEventListener('pointerenter', mouse); el.addEventListener('pointerleave', function () { on(false); }); });
      a.addEventListener('focus', function () { on(true); });
      a.addEventListener('blur', function () { on(false); });
    });
  }

  // job: state change. A link to a disclosure ("Full terms") lands on it open, not on a closed line.
  function openTarget(id) {
    var d = id && document.getElementById(id);
    if (d && d.tagName === 'DETAILS') d.open = true;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="#"]'); if (!a) return;
    var u = new URL(a.href, location.href);
    if (u.pathname === location.pathname) openTarget(u.hash.slice(1));
  });
  addEventListener('hashchange', function () { openTarget(location.hash.slice(1)); });

  once();
  var plan = document.getElementById('plan');
  if (plan) { planTiming(plan); planPair(plan); }
  openTarget(location.hash.slice(1));
})();
