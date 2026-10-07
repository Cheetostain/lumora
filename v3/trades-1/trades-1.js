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
