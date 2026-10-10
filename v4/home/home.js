/* Home v4 only (2026-10-10). The walk's intro names the sample shop the owner picked, and says honestly whether its stops
   show the same screen before and after (plumbing, the pilot) or only the fixed screen (trades still waiting on their
   own Before / After pictures, the plan's R7 fallback). v3's Home script is kept in "backup ORIGINAL-2026-10-10/". */
(function () {
  function size(t) {                       // "Plumbing, 2 trucks" -> "2-truck shop"; "Property manager, 212 doors" -> "212-door property manager"
    var m = /, (\d+) (\w+?)s?$/.exec(t.short) || [], kind = t.per === 'yr' ? 'property manager' : /^Restaurant/.test(t.short) ? 'restaurant and bar' : 'shop';
    return m[1] ? m[1] + '-' + m[2] + ' ' + kind : kind;
  }
  // the tally no longer counts dollars (R9) and is not shown on phones, so the intro promises the end total, not a running sum
  // The Spanish Home (index.es.html, 2026-10-10) says it in Spanish, from the trade's Spanish short line ("Plomería, 2 camionetas")
  var ES = /^es\b/i.test(document.documentElement.getAttribute('lang') || '');
  function sizeEs(t) {                     // "un negocio de ejemplo con 2 camionetas"; "una administradora de propiedades de ejemplo con 212 unidades"
    var m = /, (\d+ .+)$/.exec(t.short) || [], kind = t.per === 'yr' ? 'una administradora de propiedades' : /^Restaurante/.test(t.short) ? 'un restaurante y bar' : 'un negocio';
    return kind + ' de ejemplo' + (m[1] ? ' con ' + m[1] : '');
  }
  function intro(key, t) {
    var p = document.querySelector('[data-walk-intro]'); if (!p || !t || !t.rows) return;
    var pairs = t.rows.some(function (r) { return r.pair; });
    if (ES) { p.textContent = t.shop + ' es ' + sizeEs(t) + '. ' + (pairs ? 'En cada parada se ve la misma pantalla antes y después del arreglo, y la visita termina con el total de la hoja.'
      : 'En cada parada se ve el arreglo en la pantalla del propio negocio, y la visita termina con el total de la hoja.'); return; }
    p.textContent = t.shop + ' is a sample ' + size(t) + '. ' + (pairs ? 'Each stop shows the same screen before and after the fix, and the walk ends on the sheet\'s total.'
      : 'Each stop shows the fix on the shop\'s own screen, and the walk ends on the sheet\'s total.');
  }
  // job: cause and effect. On a phone the strip sits above the sheet's trade menu, so it rises once when a pick rewrites it
  function cue(key, t, animate) {
    var s = document.querySelector('.hero-strip'); if (!s || !animate || Lumora.still) return;
    s.classList.remove('swapping'); void s.offsetWidth; s.classList.add('swapping');
  }
  // Who we work with: under each trade link, that trade's biggest leak (its sample sheet's first row), no dollar figure, so the
  // index shows what a walk finds in each trade (review 2026-10-10, Franco's note 12 "bland"). Prerendered by prerender.py.
  function who() {
    var ul = document.querySelector('[data-trades]'); if (!ul || !window.Lumora) return;
    var T = Lumora.trades, esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
    Array.prototype.forEach.call(ul.querySelectorAll('a'), function (a) {
      var k = Object.keys(T).filter(function (k) { return T[k].href === a.getAttribute('href'); })[0], b0 = a.querySelector('b'), name = b0 ? b0.textContent : a.textContent;   // prerendered or plain
      if (k && T[k].rows && T[k].rows[0]) a.innerHTML = '<b>' + esc(name) + '</b><small>' + esc(T[k].rows[0].b) + '</small>';
    });
  }
  // review only: the night band's other two layouts and its other headline, for Franco's pick on the section card (outline 6)
  function variants() {
    var q = new URLSearchParams(location.search), n4 = document.querySelector('.n4');
    if (n4 && /^[bc]$/.test(q.get('n4') || '')) n4.setAttribute('data-layout', q.get('n4'));
    var h = n4 && n4.querySelector('h2'); if (h && q.get('n4h') === '2') h.textContent = ES ? 'El trabajo de oficina, hecho antes de que usted se levante.' : 'Office work done before you wake up.';
  }
  function start() {
    if (!window.Lumora) return;
    Lumora.on(intro); Lumora.on(cue);
    if (Lumora.trade) intro(Lumora.trade, Lumora.trades[Lumora.trade]);
    who(); variants();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
