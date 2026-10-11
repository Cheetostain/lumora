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
    return kind + ' de ejemplo' + (m[1] ? ' con ' + m[1].replace(' ', ' ') : '');   // "2 camionetas" never splits over two lines
  }
  function intro(key, t) {
    var p = document.querySelector('[data-walk-intro]'); if (!p || !t || !t.rows) return;
    var pairs = t.rows.some(function (r) { return r.pair; });
    if (ES) { p.textContent = t.shop + ' es ' + sizeEs(t) + '. ' + (pairs ? 'En cada paso se ve la misma pantalla antes y después del arreglo, y la visita termina con el total de la hoja.'
      : 'En cada paso se ve el arreglo en la pantalla del propio negocio, y la visita termina con el total de la hoja.'); return; }   // "paso", never "parada" (a bus stop; native read 2026-10-10)
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
  // What we automate, the code picture (2026-10-10, code demo B; English Home only, the Spanish page has no [data-bm]). It runs
  // once when 60% of it is in view, about 10 seconds. Each step lights its two lines in main(), the plain comment and the call,
  // in the order the code really runs; then the call line gets a tick and its run log row goes from Waiting to done. After the
  // fourth, the code fades and the log rises into the owner's screen (home.css times the fold). The text button skips to the
  // end while it runs (WCAG 2.2.2) and runs it again after. Reduced motion or ?still: no run, the finished screen.
  // ?view=code opens on the code, for review shots.
  function codeDemo() {
    var fig = document.querySelector('[data-bm]'); if (!fig) return;
    var code = fig.querySelector('.bm-code'), lines = code.querySelectorAll('.l'), rows = fig.querySelectorAll('.bm-rows li'),
        segs = fig.querySelectorAll('.seg button'), again = fig.querySelector('.bm-again'), src = fig.querySelector('.bm-src'), timers = [];
    var q = new URLSearchParams(location.search),
        still = (window.Lumora && Lumora.still) || q.has('still') || matchMedia('(prefers-reduced-motion: reduce)').matches;
    var STEPS = [[30, 31], [32, 33], [34, 35], [36, 37]], MAIN = 28;   // new_jobs.py line numbers: comment and call; def main() is line 28
    var FIRST = 800, GAP = 2000, LOG = 800, FOLD = 1400;                // ms; FOLD covers the longest fold transition in home.css
    for (var j = 0; j < lines.length; j++) lines[j].style.setProperty('--ind', (/^ */.exec(lines[j].textContent)[0].length + 4) + 'ch');
    function scrollTo(n, smooth) {         // line n at the top, under the code's 8px padding (a wrapped line on a 320 phone is taller, so measure)
      code.scrollTo({ top: n > 1 ? lines[n - 1].offsetTop - 8 : 0, behavior: smooth && !still ? 'smooth' : 'auto' });
    }
    function light(s) {
      for (var i = 0; i < lines.length; i++) lines[i].classList.toggle('hot', !!s && i + 1 >= s[0] && i + 1 <= s[1]);
      code.classList.toggle('is-run', !!s);
    }
    function done(n) {                     // the first n steps finished: their call lines ticked (.ran, since system.css styles .ok as a green chip), their run log rows checked
      STEPS.forEach(function (s, i) { lines[s[1] - 1].classList.toggle('ran', i < n); });
      for (var i = 0; i < rows.length; i++) rows[i].classList.toggle('on', i < n);
    }
    function show(view) {
      fig.setAttribute('data-view', view);
      for (var i = 0; i < segs.length; i++) segs[i].setAttribute('aria-pressed', String(segs[i].getAttribute('data-view') === view));
      code.inert = view !== 'code';
    }
    function stop() { while (timers.length) clearTimeout(timers.pop()); }
    function at(ms, fn) { timers.push(setTimeout(fn, ms)); }
    function finish(view) {
      stop(); light(null); done(STEPS.length); show(view);
      fig.setAttribute('data-run', 'done'); again.textContent = 'Run it again';
      if (view === 'code') scrollTo(1, false);
    }
    function run() {
      stop(); light(null); done(0); show('code'); scrollTo(1, false);
      fig.setAttribute('data-run', 'running'); again.textContent = 'Skip to the list';
      STEPS.forEach(function (s, i) {
        at(FIRST + i * GAP, function () { light(s); if (!i) scrollTo(MAIN, true); });
        at(FIRST + i * GAP + LOG, function () { done(i + 1); });
      });
      at(FIRST + STEPS.length * GAP, function () { light(null); show('screen'); });
      at(FIRST + STEPS.length * GAP + FOLD, function () { finish('screen'); });
    }
    for (var i = 0; i < segs.length; i++) segs[i].addEventListener('click', function () { finish(this.getAttribute('data-view')); });
    src.addEventListener('click', function () { finish('code'); code.focus({ preventScroll: true }); });   // its button hides with the screen; focus goes to the code
    again.addEventListener('click', function () { if (fig.getAttribute('data-run') === 'running') finish('screen'); else run(); });
    if (q.get('view') === 'code') { finish('code'); return; }
    if (still || !('IntersectionObserver' in window)) { finish('screen'); return; }
    light(null); done(0); show('code'); fig.setAttribute('data-run', 'idle'); again.textContent = 'Skip to the list';   // the start state: the code, nothing run yet
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); run(); } }, { threshold: 0.6 });
    io.observe(fig);
  }
  function start() {
    codeDemo();
    if (!window.Lumora) return;
    Lumora.on(intro); Lumora.on(cue);
    if (Lumora.trade) intro(Lumora.trade, Lumora.trades[Lumora.trade]);
    who(); variants();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
