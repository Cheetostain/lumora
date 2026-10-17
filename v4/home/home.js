/* Home v4 only (2026-10-10). The walk's intro names the sample shop the owner picked, and says honestly whether its stops
   show the same screen before and after (plumbing, the pilot) or only the fixed screen (trades still waiting on their
   own Before / After pictures, the plan's R7 fallback). v3's Home script is kept in "backup ORIGINAL-2026-10-10/". */
(function () {
  function size(t) {                       // "Plumbing, 2 trucks" -> "2-truck shop"; "Property manager, 212 doors" -> "212-door property manager"
    var m = /, (\d+) (\w+?)s?$/.exec(t.short) || [], kind = t.per === 'yr' ? 'property manager' : /^Restaurant/.test(t.short) ? 'restaurant and bar' :
      /office|clinic/i.test(t.short) ? 'office' : 'shop';   // "Dental office, 2 dentists" -> "2-dentist office" (offices and clinics, 2026-10-17)
    return m[1] ? m[1] + '-' + m[2] + ' ' + kind : kind;
  }
  // the tally no longer counts dollars (R9) and is not shown on phones, so the intro promises the end total, not a running sum
  // The Spanish Home (index.es.html, 2026-10-10) says it in Spanish, from the trade's Spanish short line ("Plomería, 2 camionetas")
  var ES = /^es\b/i.test(document.documentElement.getAttribute('lang') || '');
  function sizeEs(t) {                     // "un negocio de ejemplo con 2 camionetas"; "una administradora de propiedades de ejemplo con 212 unidades"
    var m = /, (\d+ .+)$/.exec(t.short) || [], kind = t.per === 'yr' ? 'una administradora de propiedades' : /^Restaurante/.test(t.short) ? 'un restaurante y bar' :
      /^Consultorio/.test(t.short) ? 'un ' + t.short.split(',')[0].toLowerCase() : 'un negocio';   // "un consultorio dental de ejemplo con 2 dentistas"
    return kind + ' de ejemplo' + (m[1] ? ' con ' + m[1].replace(' ', ' ') : '');   // "2 camionetas" never splits over two lines
  }
  // where the picked sample's whole walk is: its trade page, or How it works for a sample with no page yet (offices and clinics,
  // 2026-10-17 polish). The line under the picker and the line under the walk's stop say it the same way
  function walkLink(t) {
    if (t.href) return { href: t.href, text: ES ? 'La visita completa, en la página de ' + t.name : 'The full walk, on the ' + t.name + ' page' };
    return { href: ES ? '/es/how-it-works/#walk' : '/how-it-works/#walk', text: ES ? 'Cómo es la visita, en la página Cómo funciona' : 'How a walk goes, on the How it works page' };
  }
  // the hero under the sheet (2026-10-17 polish, both judges): the strip's three pictures are the plumbing sample's own screens, so
  // with another sample picked its label says where they come from; and one line under the picker opens the picked sample's walk
  function picked(key, t) {
    var k = document.querySelector('[data-rc-k]'), a = document.querySelector('[data-f="pick-walk"]');
    if (k) { if (k._base == null) k._base = k.innerHTML;
      if (key === 'plumbing') k.innerHTML = k._base; else k.textContent = ES ? 'Del negocio de ejemplo de plomería, Dunlin Plumbing' : 'From the plumbing sample, Dunlin Plumbing'; }
    if (a && t) { var w = walkLink(t); a.href = w.href; a.textContent = w.text; }
  }
  function intro(key, t) {
    var p = document.querySelector('[data-walk-intro]'); if (!p || !t || !t.rows) return;
    var pairs = t.rows.some(function (r) { return r.pair; });
    // the new Home (2026-10-16, Franco's GO): the walk shows one stop (data-walk-rows="1"), so the intro says so and the link under
    // it opens the picked trade's page, where the whole walk is (a restaurant owner who picks Restaurants gets there in one tap)
    var walk = p.closest('[data-walk-rows]'), more = document.querySelector('[data-f="walk-more"]');
    if (walk && walk.getAttribute('data-walk-rows') === '1') {
      var same = t.rows[0] && t.rows[0].pair;
      p.textContent = ES ? t.shop + ' es ' + sizeEs(t) + '. Este es un paso de su visita: ' + (same ? 'la misma pantalla, antes y después del arreglo.' : 'el arreglo en la pantalla del propio negocio.')
        : t.shop + ' is a sample ' + size(t) + '. Here is the first stop from its walk: ' + (same ? 'the same screen before and after the fix.' : 'the fix on the shop\'s own screen.');
      if (more) { var w = walkLink(t); more.href = w.href; more.textContent = w.text; }
      return;
    }
    if (ES) { p.textContent = t.shop + ' es ' + sizeEs(t) + '. ' + (pairs ? 'En cada paso se ve la misma pantalla antes y después del arreglo, y la visita termina con el total de la hoja.'
      : 'En cada paso se ve el arreglo en la pantalla del propio negocio, y la visita termina con el total de la hoja.'); return; }   // "paso", never "parada" (a bus stop; native read 2026-10-10)
    p.textContent = t.shop + ' is a sample ' + size(t) + '. ' + (pairs ? 'Each stop shows the same screen before and after the fix, and the walk ends on the sheet\'s total.'
      : 'Each stop shows the fix on the shop\'s own screen, and the walk ends on the sheet\'s total.');
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
  // the night band (round 2, 2026-10-17, judges: two Sample tags side by side): the phone and the log are one picture with one tag,
  // under the log; home.css hides the phone's. The binder writes the pair again on every pick, so the log's tag is marked again each
  // time as the section's sample lead ([data-sample-lead], Lumora.lint R8): it labels the phone beside it, and the log's head names the shop
  function nightTag() {
    var t = document.querySelector('[data-bind=night4] .n4-paper > .samp'); if (t) t.setAttribute('data-sample-lead', '');
  }
  // review only: the night band's other two layouts and its other headline, for Franco's pick on the section card (outline 6)
  function variants() {
    var q = new URLSearchParams(location.search), n4 = document.querySelector('.n4');
    if (n4 && /^[bc]$/.test(q.get('n4') || '')) n4.setAttribute('data-layout', q.get('n4'));
    var h = n4 && n4.querySelector('h2'); if (h && q.get('n4h') === '2') h.textContent = ES ? 'El trabajo de oficina, hecho antes de que usted se levante.' : 'Office work done before you wake up.';
  }
  // What we automate, the code picture (2026-10-10, code demo B; on the Spanish Home too since 2026-10-11, the same 43 lines
  // with Spanish comments, so STEPS and MAIN hold for both; ES picks the button words). It runs
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
    var AGAIN = ES ? 'Verlo otra vez' : 'Run it again', SKIP = ES ? 'Saltar a la lista' : 'Skip to the list';   // "Saltar", as the page's skip link
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
      fig.setAttribute('data-run', 'done'); again.textContent = AGAIN;
      if (view === 'code') scrollTo(1, false);
    }
    function run() {
      stop(); light(null); done(0); show('code'); scrollTo(1, false);
      fig.setAttribute('data-run', 'running'); again.textContent = SKIP;
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
    light(null); done(0); show('code'); fig.setAttribute('data-run', 'idle'); again.textContent = SKIP;   // the start state: the code, nothing run yet
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); run(); } }, { threshold: 0.6 });
    io.observe(fig);
  }
  // stop 1 on a computer: the quote card hangs over the list's last rows; its top edge lands on a row line, never through a row's
  // words (2026-10-17 polish, owner judge: at 1440 the Spanish card cut "Aceptada $4,105.60" in half). The card hangs from the
  // stage's foot, so the stage's bottom padding moves it to the nearest line (--qc-nudge, set on the section, outside the
  // prerendered stop). Measured again when the window or the card changes size (Before and After, a trade, the fonts)
  var seatObs = 'ResizeObserver' in window ? new ResizeObserver(function () { seat(); }) : null;
  function seat() {
    var walk = document.getElementById('walk'), st = walk && walk.querySelector('.stop-q .stage'), qc = st && st.querySelector('.qcard'), qa = st && st.querySelector('.qa');
    if (!qc || !qa) return;
    if (seatObs && !qc._seat) { qc._seat = 1; seatObs.observe(qc); seatObs.observe(qa); }
    if (getComputedStyle(qc).position !== 'absolute') { walk.style.removeProperty('--qc-nudge'); return; }
    var now = parseFloat(walk.style.getPropertyValue('--qc-nudge')) || 0, top = qc.getBoundingClientRect().top - now, best = null;
    Array.prototype.forEach.call(qa.querySelectorAll('.qt tbody tr'), function (tr) {
      if (!tr.getClientRects().length) return; var d = tr.getBoundingClientRect().bottom - top; if (d >= -48 && (best === null || Math.abs(d) < Math.abs(best))) best = d; });   // the card keeps 24px or more below the window
    if (best === null) return;
    var nudge = Math.round(best * 10) / 10;
    if (Math.abs(nudge - now) > 0.4) walk.style.setProperty('--qc-nudge', nudge + 'px');
  }
  function start() {
    codeDemo();
    if (!window.Lumora) return;
    Lumora.on(intro); Lumora.on(picked);   // cue() went with the hero strip (2026-10-16): the sheet itself rises on a pick (system.css .sheet.swap)
    Lumora.on(function () { seat(); nightTag(); });
    if (Lumora.trade) { intro(Lumora.trade, Lumora.trades[Lumora.trade]); picked(Lumora.trade, Lumora.trades[Lumora.trade]); }
    who(); variants(); seat(); nightTag();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(seat);
    addEventListener('resize', seat);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
