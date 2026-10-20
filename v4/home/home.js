/* Home v4 only (2026-10-10). The walk's intro names the sample shop the owner picked, and says honestly whether its stops
   show the same screen before and after (plumbing, the pilot) or only the fixed screen (trades still waiting on their
   own Before / After pictures, the plan's R7 fallback). v3's Home script is kept in "backup ORIGINAL-2026-10-10/". */
(function () {
  function size(t) {                       // "Plumbing, 2 trucks" -> "2-truck shop"; "Property manager, 212 doors" -> "212-door property manager"
    var m = /, (\d+) (\w+?)s?$/.exec(t.short) || [], kind = t.per === 'yr' ? 'property manager' : /^Restaurant/.test(t.short) ? 'restaurant and bar' :
      /agency|office/i.test(t.short) ? t.short.split(',')[0].toLowerCase() : /^(?:Roofing|Pest control|Restoration),/.test(t.short) ? 'company' : 'shop';   // "Insurance agency, 4 people" -> "4-person insurance agency" (offices, 2026-10-18)
    return m[1] ? m[1] + '-' + (m[2] === 'people' ? 'person' : m[2]) + ' ' + kind : kind;
  }
  // the tally no longer counts dollars (R9) and is not shown on phones, so the intro promises the end total, not a running sum
  // The Spanish Home (index.es.html, 2026-10-10) says it in Spanish, from the trade's Spanish short line ("Plomería, 2 camionetas")
  var ES = /^es\b/i.test(document.documentElement.getAttribute('lang') || '');
  function sizeEs(t) {                     // "un negocio de ejemplo con 2 camionetas"; "una administradora de propiedades de ejemplo con 212 unidades"
    var m = /, (\d+ .+)$/.exec(t.short) || [], kind = t.per === 'yr' ? 'una administradora de propiedades' : /^Restaurante/.test(t.short) ? 'un restaurante y bar' :
      /^Agencia/.test(t.short) ? 'una ' + t.short.split(',')[0].toLowerCase() : /^Control de plagas,/.test(t.short) ? 'una compañía'
      : /^Daños/.test(t.short) ? 'una empresa' : 'un negocio';   // "una agencia de seguros de ejemplo con 4 personas"; pest control and restoration as the heading says them (system.js walkHead, picks follow-up 2026-10-19)
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
    // the link under the walk opens the picked trade's page (a restaurant owner who picks Restaurants gets there in one tap). It
    // follows the pick whatever the walk shows: the motion restore (2026-10-18) put the walk back to every stop, and the link stayed
    var walk = p.closest('[data-walk-rows]'), more = document.querySelector('[data-f="walk-more"]');
    if (more) { var w = walkLink(t); more.href = w.href; more.textContent = w.text; }
    // a walk cut to one stop (data-walk-rows="1", the Home of 2026-10-16 to 18) says so
    if (walk && walk.getAttribute('data-walk-rows') === '1') {
      var same = t.rows[0] && t.rows[0].pair;
      p.textContent = ES ? t.shop + ' es ' + sizeEs(t) + '. Este es un paso de su visita: ' + (same ? 'la misma pantalla, antes y después del arreglo.' : 'el arreglo en la pantalla del propio negocio.')
        : t.shop + ' is a sample ' + size(t) + '. Here is the first stop from its walk: ' + (same ? 'the same screen before and after the fix.' : 'the fix on the shop\'s own screen.');
      return;
    }
    // the heading names the sample business, so the intro opens on its size alone: "A 2-truck shop." ("Un negocio con 2 camionetas.")
    var cap = function (s) { return s.charAt(0).toUpperCase() + s.slice(1); }, lead = ES ? cap(sizeEs(t).replace(' de ejemplo', '')) : 'A ' + size(t);
    if (ES) { p.textContent = lead + '. ' + (pairs ? 'En cada paso se ve la misma pantalla antes y después del arreglo, y la visita termina con el total de la hoja.'
      : 'En cada paso se ve el arreglo en la pantalla del propio negocio, y la visita termina con el total de la hoja.'); return; }   // "paso", never "parada" (a bus stop; native read 2026-10-10)
    p.textContent = lead + '. ' + (pairs ? 'Each stop shows the same screen before and after the fix, and the walk ends on the sheet\'s total.'
      : 'Each stop shows the fix on the shop\'s own screen, and the walk ends on the sheet\'s total.');
  }
  // the walk's heading opens on its number (Franco 2026-10-19, design round item 3): system.js walkHead() writes it for every pick,
  // the one writer Home and the eight trade pages share since the picks follow-up, so it reads the sheet's own total
  // the walk adds up its stops on a computer (Franco 2026-10-19, design round item 13; UI's slip with Motion's timing, both judges'
  // fixes): each stop's circled number, its place and what it loses, in the order walked, then the walk sheet's double rule, and the
  // total under it (the bigfig binder) is the answer, shown once. Written from the stops themselves, so a pick rewrites it. The rows
  // write in 420ms apart when the walk end comes into view, the rule draws, then the total lands (home.css; reduced motion, ?still
  // and a phone show the finished slip, and a phone hides it: data-extra)
  function slip(key, t) {
    var ol = document.querySelector('[data-f="slip"]'), per = document.querySelector('[data-f="slip-per"]'); if (!ol || !window.Lumora) return;
    var esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
    ol.innerHTML = Array.prototype.map.call(document.querySelectorAll('#walk .stops > .stop'), function (s, i) {
      var h3 = s.querySelector('.stop-t h3'), c = h3 && h3.cloneNode(true); if (c) Array.prototype.forEach.call(c.querySelectorAll('.sr'), function (x) { x.remove(); });
      return '<li style="--i:' + i + '"><span class="tab-n">' + (i + 1) + '</span><span class="ws-p">' + esc(c ? c.textContent.trim() : s.dataset.place) + '</span><b>' + Lumora.money(+s.dataset.usd) + '</b></li>';
    }).join('');
    var end = ol.closest('.walk-end'); if (end) end.style.setProperty('--n', ol.children.length);   // the rule and the total wait for the last row
    if (per && t) per.textContent = t.per === 'yr' ? (ES ? 'Pérdida al año' : 'Lost a year') : (ES ? 'Pérdida al mes' : 'Lost a month');
  }
  function slipMotion() {
    var end = document.querySelector('#walk .walk-end'), q = new URLSearchParams(location.search);
    if (!end || !end.querySelector('.walk-slip') || !('IntersectionObserver' in window)) return;
    if ((window.Lumora && Lumora.still) || q.has('still') || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (end.getBoundingClientRect().top < innerHeight) return;   // already on screen (a jump to #walk): the finished slip, nothing replays
    end.classList.add('ws-wait');
    var io = new IntersectionObserver(function (es) {
      var r = es[0].boundingClientRect; if (!es[0].isIntersecting || (es[0].intersectionRatio < 0.5 && r.top > innerHeight * 0.6)) return;
      io.disconnect(); end.classList.remove('ws-wait'); end.classList.add('ws-run');
    }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
    io.observe(end);
  }
  // the business picker over the sheet (Franco 2026-10-19, design round item 12). The chips are system.js's radiogroup; this adds
  // what a chip can't say by itself. Each business's size, from its sample's own short line: "Restaurant and bar, 110 seats" gives
  // "110 seats", and "Restoration, 2 crews" keeps its kind, since "Water and mold" doesn't say it. A computer opens the list from its
  // field ("Sample business  Plumbing, 2 trucks  Change"); a pick closes it and focus goes back to the field, so the sheet rewrites
  // in view with nothing over it, and Esc, a click outside or Tab out of it close it too. The field names the business; its size is
  // on the sheet's letterhead under it. A phone keeps the picked chip in its row's view, scrolling the row no further than it must
  // (the row scrolls inside itself; the page never moves)
  function picker() {
    var box = document.querySelector('.hm4-hero .pk'); if (!box || !window.Lumora) return;
    var field = box.querySelector('.pk-field'), now = box.querySelector('[data-pk-now]'), row = box.querySelector('.chips'),
        chips = Array.prototype.slice.call(box.querySelectorAll('.chip[data-t]')), desk = matchMedia('(min-width: 900px)');
    function sizeOf(k) {
      var t = Lumora.trades[k], s = (t && t.short) || '', i = s.indexOf(', '); if (i < 0) return '';
      return (s.slice(0, 6).toLowerCase() === t.name.slice(0, 6).toLowerCase() ? s.slice(i + 2) : s).replace(/(\d) /g, '$1 ');
    }
    chips.forEach(function (c) { var sm = c.querySelector('small'); if (sm) sm.textContent = sizeOf(c.dataset.t); });
    function mark(key) {
      var c = box.querySelector('.chip[data-t="' + key + '"]'); if (!c) return;
      if (now) now.textContent = (c.querySelector('b') || c).textContent;
      if (desk.matches || !row || row.scrollWidth <= row.clientWidth) return;
      var l = c.offsetLeft - row.offsetLeft, r = l + c.offsetWidth, x = row.scrollLeft, w = row.clientWidth;   // both from .pk: l is the chip's place in the row
      var to = l < x + 6 ? l - 6 : r > x + w - 16 ? r - w + 16 : x;   // 6px of room for the focus ring at the left, the gutter at the right
      if (to !== x) row.scrollTo({ left: Math.max(0, to), behavior: Lumora.still || matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
    Lumora.on(mark); mark(Lumora.trade);
    if (!field) return;
    function open(on, back) {
      if (on) box.setAttribute('data-open', ''); else box.removeAttribute('data-open');
      field.setAttribute('aria-expanded', on ? 'true' : 'false');
      if (on) (box.querySelector('.chip[aria-checked="true"]') || chips[0]).focus();
      else if (back) field.focus();
    }
    var isOpen = function () { return box.hasAttribute('data-open'); };
    field.addEventListener('click', function () { open(!isOpen(), false); });
    box.addEventListener('click', function (e) { if (isOpen() && e.target.closest('.chip')) open(false, true); });   // after system.js chose it
    box.addEventListener('keydown', function (e) { if (e.key === 'Escape' && isOpen()) { e.preventDefault(); open(false, true); } });
    box.addEventListener('focusout', function (e) { if (isOpen() && (!e.relatedTarget || !box.contains(e.relatedTarget))) open(false, false); });
    document.addEventListener('pointerdown', function (e) { if (isOpen() && !box.contains(e.target)) open(false, false); });
    var shut = function () { if (!desk.matches && isOpen()) open(false, false); };   // a phone shows the row, not the list
    if (desk.addEventListener) desk.addEventListener('change', shut);
  }
  // Who we work with: under each trade link, that trade's biggest leak (its sample sheet's first row), no dollar figure, so the
  // index shows what a walk finds in each trade (review 2026-10-10, Franco's note 12 "bland"). Prerendered by prerender.py.
  function who() {
    var ul = document.querySelector('[data-trades]'); if (!ul || !window.Lumora) return;
    var T = Lumora.trades, esc = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
    Array.prototype.forEach.call(ul.querySelectorAll('a'), function (a) {
      var k = Object.keys(T).filter(function (k) { return T[k].href === a.getAttribute('href'); })[0], b0 = a.querySelector('b'), name = b0 ? b0.textContent : a.textContent;   // prerendered or plain
      // a count keeps its noun, as the sheet's rows do (round 4, 2026-10-18: "48 / horas" split under the Spanish plumbing link at 1180)
      if (k && T[k].rows && T[k].rows[0]) a.innerHTML = '<b>' + esc(name) + '</b><small>' + esc(T[k].rows[0].b).replace(/(\d\+?) (?=\S)/g, '$1 ') + '</small>';
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
  // the strip's three screens find their own leaks (Franco 2026-10-19, design round item 8; home.css "the strip's three screens").
  // A phone plays each screen when 75% of its picture is in view (70% of the phone's band); a computer, where the screens sit side
  // by side, waits until every one it shows is in view and plays them left to right, 400ms apart, so the eye follows one finding
  // at a time and the last ring lands by about 2.4s. One play each, then still. ?still and a browser with no IntersectionObserver
  // get the finished strip (.rc-done), as does a screen hidden at that width; reduced motion never sees a start state (CSS)
  function stripPlay() {
    var box = document.querySelector('.hm4-hero .recog'); if (!box) return;
    var all = Array.prototype.slice.call(box.querySelectorAll('.rc-q, .rc-x, .rc-p')), q = new URLSearchParams(location.search);
    var shown = function (r) { return r.getClientRects().length > 0; }, done = function (r) { r.classList.add('rc-done'); };
    if ((window.Lumora && Lumora.still) || q.has('still') || !('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) { all.forEach(done); return; }
    var rcs = all.filter(shown); all.filter(function (r) { return !shown(r); }).forEach(done);
    // the phone's loop draws by its dash; it scales with its own viewBox, so pathLength 1 keeps the dash one stroke
    Array.prototype.forEach.call(box.querySelectorAll('.rc-p .iph-ring path'), function (p) { p.setAttribute('pathLength', '1'); });
    var pic = function (r) { return r.querySelector('.rc-pic') || r; };
    var seen = function (el, frac) { var b = el.getBoundingClientRect(), v = Math.min(b.bottom, innerHeight) - Math.max(b.top, 0); return v >= Math.min(b.height, innerHeight) * frac - 1; };
    var last = -1e9, play = function (r) {
      var t = Math.max(0, last + 400 - Date.now()); last = Date.now() + t;
      setTimeout(function () { if (r.classList.contains('rc-x')) pixels(r); r.classList.add('play'); }, t);
    };
    var steps = { threshold: [0, .25, .5, .7, .75, .8, .9, 1] };
    if (matchMedia('(min-width: 900px)').matches) {
      var io = new IntersectionObserver(function () {
        if (!rcs.every(function (r) { return seen(pic(r), .75); })) return;
        io.disconnect(); rcs.forEach(play);   // document order is left to right
      }, steps);
      rcs.forEach(function (r) { io.observe(pic(r)); });
    } else rcs.forEach(function (r) {
      var o = new IntersectionObserver(function (es) { if (!es[0].isIntersecting || !seen(pic(r), r.classList.contains('rc-p') ? .7 : .75)) return; o.disconnect(); play(r); }, steps);
      o.observe(pic(r));
    });
  }
  // the spreadsheet's ring is drawn in a stretched viewBox with a non-scaling stroke, where a dash breaks (SYSTEM.md 6); for its one
  // draw it is written in the svg's own pixels, then put back as it was, so a window resized later still fits it
  function pixels(r) {
    var svg = r.querySelector('.xl-ring'), p = svg && svg.querySelector('path'); if (!p) return;
    var vb = (svg.getAttribute('viewBox') || '').split(/[\s,]+/).map(Number), b = svg.getBoundingClientRect(), d = p.getAttribute('d') || '';
    if (vb.length !== 4 || vb[0] || vb[1] || !b.width || !b.height || /[^MCLZ\d\s.,-]/.test(d)) { r.classList.add('rc-drawn'); return; }
    var old = svg.getAttribute('viewBox'), k = 0, sx = b.width / vb[2], sy = b.height / vb[3];
    p.setAttribute('d', d.replace(/-?\d*\.?\d+/g, function (n) { return (+n * (k++ % 2 ? sy : sx)).toFixed(2); }));
    p.style.vectorEffect = 'none'; p.setAttribute('pathLength', '1'); svg.setAttribute('viewBox', '0 0 ' + b.width.toFixed(2) + ' ' + b.height.toFixed(2));
    svg.addEventListener('animationend', function back(e) {
      if (e.target !== p) return; svg.removeEventListener('animationend', back);
      r.classList.add('rc-drawn'); p.setAttribute('d', d); p.removeAttribute('pathLength'); p.style.vectorEffect = ''; svg.setAttribute('viewBox', old);
    });
  }
  function start() {
    codeDemo();
    if (!window.Lumora) return;
    Lumora.on(intro); Lumora.on(picked); Lumora.on(slip);   // cue() went with the hero strip (2026-10-16): the sheet itself rises on a pick (system.css .sheet.swap)
    Lumora.on(function () { seat(); nightTag(); });
    if (Lumora.trade) { intro(Lumora.trade, Lumora.trades[Lumora.trade]); picked(Lumora.trade, Lumora.trades[Lumora.trade]); slip(Lumora.trade, Lumora.trades[Lumora.trade]); }
    who(); variants(); picker(); seat(); nightTag(); slipMotion(); stripPlay();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(seat);
    addEventListener('resize', seat);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
