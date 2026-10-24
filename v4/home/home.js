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
  // the hero under the sheet (2026-10-17 polish, both judges): one line under the picker opens the picked sample's walk. The strip's
  // label, which said whose screens the strip showed once another sample was picked, left with the strip (alive build 2026-10-24,
  // Franco's pick strip-out)
  function picked(key, t) {
    var a = document.querySelector('[data-f="pick-walk"]');
    if (a && t) { var w = walkLink(t); a.href = w.href; a.textContent = w.text; }
  }
  // Oct 19 idea 15 (Franco's yes, Oct 23; alive build 2026-10-24): the walk comes right under the promise, and its start names the
  // other sample businesses, so a restaurant owner or a property manager sees at once that the walk is a sample and can switch it
  // there. With JS off each name is a link to its page, as the picker's chips are; here each becomes a button that picks that
  // sample through the picker's own path (Lumora.setTrade), and every pick names the samples not picked, from the picker's first
  // five in its order, each by its chip's sentence name (data-say: "property managers", "administración de propiedades"; a
  // chip's label is a label). The pressed button now names the sample the walk left, so focus goes to the walk's heading, which
  // names the new sample and what it loses. Checkers' pass (2026-10-24): the four buttons stay and only their words and data-t
  // change; when every pick rebuilt them, the pressed one left the page and system.js's focus guard measured it as hidden under
  // the header, so a tap threw the page up 146px
  function walkAlso() {
    var p = document.querySelector('#walk [data-walk-also]'); if (!p || !window.Lumora) return;
    var chips = Array.prototype.slice.call(document.querySelectorAll('.hm4-hero .pk .chip[data-t]'), 0, 5);
    var all = chips.map(function (c) { return c.dataset.t; }), links = Array.prototype.slice.call(p.querySelectorAll('a[data-t]'));
    if (all.length < 2 || links.length !== all.length - 1) return;   // the links stay as they are
    var say = function (k) { var c = chips[all.indexOf(k)], b = c && c.querySelector('b'); return c ? c.getAttribute('data-say') || (b || c).textContent : k; };
    var btns = links.map(function (a) { var b = document.createElement('button'); b.type = 'button'; b.className = 'u'; a.parentNode.replaceChild(b, a); return b; });
    function render(key) {
      var ks = all.filter(function (k) { return k !== key; }).slice(0, btns.length);
      btns.forEach(function (b, i) { b.setAttribute('data-t', ks[i]); b.textContent = say(ks[i]); });
    }
    // the pick rewrites the sheet in the hero above, whose height changes with the sample (Property managers' is 77px taller than
    // Restaurants'); Chrome's scroll anchoring held the hero still instead and WebKit has none, so the line just pressed slid down
    // under the finger. The walk's heading is held where it was on screen (checkers' pass, 2026-10-24; check.py walk_line_problems)
    p.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('button[data-t]'); if (!b) return;
      var h = document.querySelector('#walk .walk-h'), y0 = h && h.getBoundingClientRect().top;
      Lumora.setTrade(b.getAttribute('data-t'));
      if (h) { var d = h.getBoundingClientRect().top - y0; if (Math.abs(d) > 0.5) scrollBy({ top: d, behavior: 'instant' }); h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    });
    Lumora.on(function (k) { render(k); });
    render(Lumora.trade);
  }
  function intro(key, t) {
    // the link under the walk opens the picked trade's page (a restaurant owner who picks Restaurants gets there in one tap). It
    // follows the pick whatever the walk shows: the motion restore (2026-10-18) put the walk back to every stop, and the link stayed.
    // 2026-10-23 (a shorter Home, D39): Home's walk has no intro line now, so the link is set before the intro is looked for
    var more = document.querySelector('[data-f="walk-more"]');
    if (more && t) { var w = walkLink(t); more.href = w.href; more.textContent = w.text; }
    var p = document.querySelector('[data-walk-intro]'); if (!p || !t || !t.rows) return;
    var pairs = t.rows.some(function (r) { return r.pair; }), walk = p.closest('[data-walk-rows]');
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
  // Who we work with's trade index and its leak lines (who(), review 2026-10-10) left Home on 2026-10-23 (a shorter Home, D39;
  // mixed examples, D40): the leak lines live on Industries, and the plain Industry pages list in Who we work with needs no script
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
    Lumora.on(intro); Lumora.on(picked); Lumora.on(slip);   // cue() went with the hero strip (2026-10-16): the sheet itself rises on a pick (system.css .sheet.swap)
    Lumora.on(function () { seat(); nightTag(); });
    if (Lumora.trade) { intro(Lumora.trade, Lumora.trades[Lumora.trade]); picked(Lumora.trade, Lumora.trades[Lumora.trade]); slip(Lumora.trade, Lumora.trades[Lumora.trade]); }
    variants(); picker(); seat(); nightTag(); slipMotion(); walkAlso();   // stripPlay() left with the strip (alive build 2026-10-24)
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(seat);
    addEventListener('resize', seat);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
