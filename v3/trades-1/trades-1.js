/* Lumora prototypes, group trades-1. Page-specific behaviour, loaded after system.js (defer).
   The walk binder in system.js draws one stop per sheet row. A trade page adds two things to its stops:
   - <template id="before-N" data-label="..." data-place="..."> replaces stop N's "as we find it" layer with the
     trade's own object (the AC dispatch board, the electrical counter ticket), where the system would draw a generic
     ink ghost; data-place renames the stop (its tab and its tally line) after that object;
   - <template id="fact-N"> adds the sourced line from the page copy under stop N's money line.
   On Industries (unlocked), [data-trade-link] follows the picker to the chosen trade's page.
   It runs once now (system.js has already rendered the trade) and again after any trade change. The built .html
   files also carry the result prerendered (build.py), so the page reads the same with JS off. */
(function () {
  'use strict';
  var PAGES = { plumbing: '/industries/plumbing/', ac: '/industries/ac-and-heating/', electrical: '/industries/electrical/',
    water: '/industries/water-damage-and-mold/', pest: '/industries/pest-control/', roofing: '/industries/roofing/',
    food: '/industries/restaurants-and-bars/', rentals: '/industries/property-managers/' };
  function apply() {
    var stops = document.querySelectorAll('.stop');
    for (var i = 0; i < stops.length; i++) {
      var s = stops[i], n = i + 1;
      var tb = document.getElementById('before-' + n), tf = document.getElementById('fact-' + n);
      if (tb) {
        var g = s.querySelector('[data-g2r]'), bf = g && g.querySelector('.before');
        if (bf && !bf.hasAttribute('data-own')) {
          bf.innerHTML = tb.innerHTML; bf.setAttribute('data-own', '');
          g.setAttribute('data-label-before', tb.getAttribute('data-label'));
          if (g.getAttribute('data-state') === 'before') g.setAttribute('aria-label', tb.getAttribute('data-label'));
        }
        var place = tb.getAttribute('data-place');
        if (place) {
          s.setAttribute('data-place', place);
          var tab = s.querySelector('.tab');
          if (tab && tab.lastChild) tab.lastChild.nodeValue = 'Stop ' + n + ' · ' + place;
          var tl = document.querySelector('[data-tally] li[data-i="' + i + '"] span');
          if (tl) tl.textContent = place;
        }
      }
      if (tf && !s.querySelector('.stop-fact')) {
        var fx = s.querySelector('.fixline');
        if (fx) fx.insertAdjacentHTML('beforebegin', tf.innerHTML);
      }
    }
    var L = window.Lumora, D = window.LUMORA_TRADES;
    // Industries: until the visitor picks, the hero strip says whose sample it is, so no owner is told his trade is plumbing
    var stamp = !document.body.hasAttribute('data-trade-lock') && document.querySelector('.hero-strip .stamp');
    if (stamp && L && D && D[L.trade]) {
      var nm0 = D[L.trade].name.toLowerCase().replace(/^ac/, 'AC');
      stamp.textContent = L.picked ? 'Sample' : 'Sample: ' + (/^[aeiou]/i.test(nm0) ? 'an ' : 'a ') + nm0 + ' shop';
    }
    if (L && D && L.trade) {
      var links = document.querySelectorAll('[data-trade-link]');
      for (var j = 0; j < links.length; j++) {
        links[j].href = PAGES[L.trade] || '/industries/';
        var nm = links[j].querySelector('[data-f="tname"]');
        if (nm) nm.textContent = D[L.trade].name.toLowerCase().replace(/^ac/, 'AC');
      }
    }
  }
  apply();
  document.addEventListener('lumora:trade', apply);
})();

/* Motion pass (2026-10-07). One-shot parts land once they are in view; trades-1.css holds the timings and the still
   default. Under ?still or reduced motion every part gets .in at once, so nothing waits. */
(function () {
  'use strict';
  var still = /[?&]still\b/.test(location.search) || matchMedia('(prefers-reduced-motion: reduce)').matches;
  var io = !still && 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (e.isIntersecting) { io.unobserve(e.target); e.target.classList.add('in'); } });
  }, { threshold: 0.35 }) : null;
  // a pencil circle inside two papers, a reveal or the calendar lands with that part (.in .pc), so only lone ones are watched
  function arm() {
    var els = document.querySelectorAll('[data-land], .cal, .pc');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      if (el.hasAttribute('data-armed') || (el.classList.contains('pc') && el.parentNode.closest('[data-land], .cal, .rv'))) continue;
      el.setAttribute('data-armed', '');
      if (io) io.observe(el); else el.classList.add('in');
    }
  }
  arm();
  document.addEventListener('lumora:trade', arm);                   // a trade change redraws the walk stops and their circles
  // job: state change. "As we find it" tapped or clicked: the circle lands again on the evidence as the old state returns
  document.addEventListener('click', function (e) {
    var b = !still && e.target.closest && e.target.closest('[data-show="before"]'), sc = b && b.closest('.stop, [data-g2r-scope]');
    if (!sc) return;
    var pcs = sc.querySelectorAll('.before .pc');
    for (var i = 0; i < pcs.length; i++) { pcs[i].classList.remove('in'); void pcs[i].offsetWidth; pcs[i].classList.add('in'); }
  });
})();
