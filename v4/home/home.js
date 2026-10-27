/* Home v4 only (2026-10-10). The walk's intro names the sample shop the owner picked, and says honestly whether its stops
   show the same screen before and after (plumbing, the pilot) or only the fixed screen (trades still waiting on their
   own Before / After pictures, the plan's R7 fallback). v3's Home script is kept in "backup ORIGINAL-2026-10-10/". */
(function () {
  function size(t) {                       // "Plumbing, 2 trucks" -> "2-truck shop"; "Property manager, 212 doors" -> "212-door property manager"
    var m = /, (\d+) (\w+?)s?$/.exec(t.short) || [], kind = t.per === 'yr' ? 'property manager' : /^Restaurant/.test(t.short) ? 'restaurant and bar' :
      /agency|office/i.test(t.short) ? t.short.split(',')[0].toLowerCase() : /^(?:Roofing|Pest control|Restoration),/.test(t.short) ? 'company' : 'shop';   // "Insurance agency, 10 people" -> "10-person insurance agency" (offices, 2026-10-18)
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
  // What we automate, the PDF that files itself (Franco's pick B, Oct 27: "i really like the B animation. one more time."). The
  // trial's anim.js (solution-anim-2026-10-26/prototype), B's beats only, on the same clock and curves: the owner's sheet, Gmail's
  // notice brings the order PDF, which opens; four details are boxed and fly up into a new row; the PDF folds back into its
  // notice; QuickBooks and Gmail say what else got done; the hours back close it. 5.7 s, once, when all of it is in view (a screen
  // shorter than the picture starts it at 60%), then .done hands the frame back to home.css, so nothing jumps. Pause, Play and
  // Play again (WCAG 2.2.2: it moves for more than 5 s beside the list). GSAP 3.15.0 with Flip and CustomEase, vendored beside
  // system.js (assets/vendor, gsap.LICENSE.md), loads only when the band comes within 600px of the screen; reduced motion, ?still,
  // no IntersectionObserver or a file that fails to load: the finished frame and no control. Every motion names its job
  // (SYSTEM.md 9): only transform, opacity and stroke-dashoffset move, on the house curves, with no bounce and no overshoot. One
  // clock for English and Spanish: the times never read the words. window.SA is what the clip and check tools read
  function orderPic() {
    var fig = document.querySelector('figure[data-sa]'); if (!fig) return;
    var still = (window.Lumora && Lumora.still) || /[?&]still\b/.test(location.search) || matchMedia('(prefers-reduced-motion: reduce)').matches;
    var sys = document.querySelector('script[src*="system.js"]'), base = null;
    try { base = new URL('assets/vendor/', sys.src).href; } catch (e) { /* no system.js address: the finished frame */ }
    if (still || !base || !('IntersectionObserver' in window)) { fig.classList.add('still'); return; }
    var $ = function (s) { return fig.querySelector(s); }, $$ = function (s) { return [].slice.call(fig.querySelectorAll(s)); };
    var stage = $('.sa-stage'), fx = $('.sa-fx'), btn = $('.sa-pause'), lab = btn && btn.querySelector('.pt');
    var G, F, CE, MOVE, OUT, IN, tl = null, mode = 'wait', played = false, made = [], ready = false, armed = false;

    /* the box: an ink rounded box, drawn with stroke-dashoffset */
    var f1 = function (n) { return Math.round(n * 10) / 10; };
    function roundBox(w, h) {           // starts just past the top-left corner and runs clockwise, as a pen would
      var o = .75, x0 = o, y0 = o, x1 = w - o, y1 = h - o, r = Math.min(6, (x1 - x0) / 2, (y1 - y0) / 2);
      return 'M' + f1(x0 + r) + ' ' + y0 + 'H' + f1(x1 - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + f1(x1) + ' ' + f1(y0 + r) + 'V' + f1(y1 - r) +
        'A' + r + ' ' + r + ' 0 0 1 ' + f1(x1 - r) + ' ' + f1(y1) + 'H' + f1(x0 + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + x0 + ' ' + f1(y1 - r) +
        'V' + f1(y0 + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + f1(x0 + r) + ' ' + y0;
    }
    function boxSVG(val) {              // the box over a value, sized to it in real pixels
      var old = val.querySelector('svg'); if (old) old.remove();
      var W = val.offsetWidth, H = val.offsetHeight;
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'), p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H); svg.setAttribute('aria-hidden', 'true');
      p.setAttribute('d', roundBox(W, H)); p.setAttribute('pathLength', '1');
      p.style.strokeDasharray = '1 2';
      svg.appendChild(p); val.appendChild(svg);
      return p;
    }
    /* geometry, relative to the stage */
    function rect(el) {
      var r = el.getBoundingClientRect(), s = stage.getBoundingClientRect();
      return { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height };
    }
    // a copy of a boxed value laid over it, in the stage's top layer, so it can travel over every window (a window clips)
    function flyer(val) {
      var b = rect(val), el = document.createElement('span');
      el.className = 'sa-fly';
      el.innerHTML = '<span class="fly-in"><span class="fly-sh"></span><span class="fly-bg"></span><span class="fly-t"><span class="fly-w"></span></span></span>';
      el.querySelector('.fly-w').textContent = val.textContent;
      el.style.cssText = 'position:absolute;left:' + b.x + 'px;top:' + b.y + 'px;width:' + b.w + 'px;height:' + b.h + 'px';
      var cs = getComputedStyle(val), t = el.querySelector('.fly-t');     // the same size and padding as the value it copies
      t.style.fontSize = cs.fontSize; t.style.lineHeight = cs.lineHeight; t.style.paddingLeft = cs.paddingLeft; t.style.paddingRight = cs.paddingRight;
      fx.appendChild(el);
      return el;
    }
    /* the first frame and the hand-back */
    function first() {                  // the first frame: home.css holds most of it; this adds what depends on sizes
      fig.classList.remove('done');
      // dash 1, gap 2, offset just past 1: nothing shows, not even the round cap's dot, until the box starts to draw
      $$('.sa-pdf .val.bx').forEach(function (v) { var p = boxSVG(v); p.style.strokeDashoffset = '1.01'; G.set(p.parentNode, { opacity: 1 }); });
    }
    function done() {                   // hand the frame back to home.css: the same picture, with no inline styles left
      if (tl) { tl.kill(); tl = null; }
      fx.innerHTML = '';
      if (made.length) G.set(made, { clearProps: 'all' }); made = [];   // an empty list made GSAP warn "target not found"
      $$('.sa-pdf .val svg').forEach(function (s) { s.remove(); });
      fig.classList.add('done');
      mode = 'done'; label('again'); armed = false;   // Play again builds it anew (arming here would bring the first frame back)
    }
    function track(els) { [].concat(els).forEach(function (e) { if (e && made.indexOf(e) < 0) made.push(e); }); return els; }
    /* the beats */
    function drawBox(t, val, dur) {     // job: show our work. The box draws round a value, the way a pen would
      tl.to(val.querySelector('svg path'), { strokeDashoffset: 0, duration: dur || .42, ease: OUT }, t);
    }
    // job: cause and effect. A copy of the boxed value lifts a few px clear of its box and travels to the cell it fills; the cell
    // gets Sheets' selected-cell frame as it arrives; the source box stays in ink, and keepSel leaves the frame on the last cell
    function fly(t, val, dest, opts) {
      opts = opts || {};
      var el = flyer(val), inn = el.firstChild, sh = inn.firstChild, bg = sh.nextSibling, tx = el.querySelector('.fly-w');
      // Flip.fit: the copy's words land exactly on the cell's words (both are tight boxes, line-height 1, so the scale is even)
      var vars = F.fit(el, dest, { fitChild: tx, scale: true, getVars: true });
      var sf = dest.parentNode.querySelector('.sf'), lift = opts.lift || 0;
      tl.set(el, { opacity: 1 }, t)
        .to(inn, { scale: 1.06, y: -lift, duration: .18, ease: OUT }, t)
        .to(sh, { opacity: 1, duration: .18, ease: OUT }, t)
        .to(el, { x: vars.x, y: vars.y, scaleX: vars.scaleX, scaleY: vars.scaleY, duration: .7, ease: MOVE }, t + .18)
        .to(inn, { scale: 1, y: 0, duration: .7, ease: MOVE }, t + .18)
        .to(sh, { opacity: 0, duration: .3, ease: OUT }, t + .58);
      if (sf) { tl.to(track(sf), { opacity: 1, duration: .12, ease: OUT }, t + .76); if (!opts.keepSel) tl.to(sf, { opacity: 0, duration: .25, ease: OUT }, t + 1.2); }
      tl.to(bg, { opacity: 0, duration: .18, ease: OUT }, t + .88)
        .to(track(dest), { opacity: 1, duration: .16, ease: OUT }, t + .88)
        .to(el, { opacity: 0, duration: .12, ease: OUT }, t + .94);
    }
    function fadeIn(t, els, dy, dur) {  // job: state change. A line comes in where it belongs (rise and fade)
      tl.fromTo(track(els), { opacity: 0, y: dy == null ? 4 : dy }, { opacity: 1, y: 0, duration: dur || .32, ease: OUT }, t);
    }
    function lightRow(t) {              // job: state change. The new row is lit, as the house lights a changed row
      tl.to(track($$('tr[data-new] .tint')), { opacity: 1, duration: .4, ease: OUT }, t);
      tl.set(track($$('tr[data-new] .rn-n')), { color: '#111110', fontWeight: 700 }, t);   // pairHTML's row number, bold as Sheets marks it
    }
    function dest(key) { return $('[data-to="' + key + '"]'); }
    // the polish the judges asked for (Oct 26): the flights are measured with the page open, so each copy lifts off its own box;
    // the page grows out of the chip and folds back at full white, fading only in its last 0.1 s; the email arrives at 0 s and
    // the reply notice is in by 4.8 s; the hours back close it
    function build() {
      var nts = $$('.mn'), page = $('.sa-over'), chip = $('[data-chip]'), keys = ['name', 'id', 'date', 'total'];
      var vals = keys.map(function (k) { return $('.sa-over .val[data-from="' + k + '"]'); });
      G.set(nts[0], { y: 0 });                 // measure the chip where the notice comes to rest, the page where it opens
      var pr = rect(page), cr = rect(chip), s = cr.w / pr.w,
        gx = cr.x + cr.w / 2 - (pr.x + pr.w / 2), gy = cr.y + cr.h / 2 - (pr.y + pr.h / 2);
      // job: cause and effect. The values go up into the new row, left to right (measured now, while nothing is moved)
      keys.forEach(function (k, i) { fly(2.15 + i * .16, vals[i], dest(k), { keepSel: k === 'total', lift: 4 }); });
      // job: cause and effect. Gmail's notice comes in, first thing
      tl.fromTo(track(nts[0]), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .45, ease: OUT }, 0);
      // job: cause and effect. The attachment opens: the page grows out of its chip, white from its first frame
      tl.fromTo(track(page), { visibility: 'visible', opacity: 0, x: gx, y: gy, scale: s, transformOrigin: '50% 50%' },
        { opacity: 1, duration: .08, ease: 'none' }, .55)
        .to(page, { x: 0, y: 0, scale: 1, duration: .5, ease: MOVE }, .55);
      vals.forEach(function (v, i) { drawBox(1.1 + i * .2, v); });
      lightRow(3.45);
      // and folds back into it, at full white until its last 0.1 s
      tl.to(page, { x: gx, y: gy, scale: s, duration: .4, ease: IN }, 3.5)
        .to(page, { opacity: 0, duration: .1, ease: 'none' }, 3.82)
        .set(page, { visibility: 'hidden' }, 3.92);
      tl.fromTo(track(nts[1]), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .45, ease: OUT }, 3.95)
        .fromTo(track(nts[2]), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .45, ease: OUT }, 4.35);
      fadeIn(4.85, $('.sa-out'), 6, .4);       // job: state change. The hours back, last
      return 5.7;
    }
    /* play, pause, play again */
    function label(m) {
      if (!btn) return;
      var vis = (ES ? { pause: 'Pausar', play: 'Reproducir', again: 'Ver otra vez' } : { pause: 'Pause', play: 'Play', again: 'Play again' })[m];
      btn.setAttribute('aria-label', (ES ? { pause: 'Pausar la animación', play: 'Reproducir la animación', again: 'Ver otra vez' } : { pause: 'Pause animation', play: 'Play animation', again: 'Play again' })[m]);
      btn.classList.toggle('is-paused', m !== 'pause'); if (lab) lab.textContent = vis;
    }
    // the timeline, built ahead and held paused on its first frame, so a play starts with no setup in its first frame (measured
    // Oct 27: built in the frame that starts the play, the first play's first frame took 63 to 74 ms on a phone slowed 4x)
    function arm() {
      if (tl) { tl.kill(); tl = null; }
      fx.innerHTML = ''; if (made.length) G.set(made, { clearProps: 'all' }); made = [];
      first();
      tl = G.timeline({ paused: true, onComplete: done });
      tl.set({}, {}, build());              // the last beat holds until the end time
      armed = true;
    }
    function play() {
      if (!armed) arm();
      armed = false; mode = 'play'; played = true; label('pause');
      tl.play(0);
      fig.setAttribute('data-t0', String(performance.now()));
    }
    if (btn) btn.addEventListener('click', function () {
      if (mode === 'play') { tl.pause(); mode = 'paused'; label('play'); }
      else if (mode === 'paused') { tl.play(); mode = 'play'; label('pause'); }
      else if (mode === 'wait') { mode = 'held'; label('play'); }     // pressed before it began: it never starts by itself
      else if (ready) play();                                          // held or done: play (again) from the start
      else { mode = 'wait'; label('pause'); }                         // held while GSAP is still on its way: it plays when in view
    });
    function start() {                  // GSAP is in: the first frame, then the play once the whole picture is in view
      G = window.gsap; F = window.Flip; CE = window.CustomEase;
      if (!G || !F || !CE) { fig.classList.add('still'); return; }
      G.registerPlugin(F, CE);
      MOVE = CE.create('saMove', '.2,0,0,1'); OUT = CE.create('saOut', '.33,1,.68,1'); IN = CE.create('saIn', '.3,0,1,1');
      ready = true;
      window.SA = { variant: 'b', play: play, done: done, get mode() { return mode; }, get tl() { return tl; } };
      // armed after the fonts: the PDF grows out of the chip in Gmail's notice, set in Familjen Grotesk, and measured before
      // the font swaps in it would fold a few px off the chip (reviewers' round, Oct 27), as seat() and lastPass() wait too
      (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () {
        if (!tl && mode !== 'play') arm();
        watch();
      });
      // a width change while it waits redraws the boxes at their new size; while it plays, it ends on the finished frame
      var lastW = innerWidth;
      addEventListener('resize', function () {
        if (innerWidth === lastW) return; lastW = innerWidth;
        if (mode === 'wait' || mode === 'held') { arm(); if (!played) watch(); } else if (mode === 'play' || mode === 'paused') done();
      });
    }
    // job: one-time focus. Plays once, when the whole picture is in view of the reader (SYSTEM.md 9: a one-time sequence ends on
    // screen). The sticky header and the phone's call bar cover the screen's top and foot, so they come off the view (reviewers'
    // round, Oct 27: at 393 the play began with the stage's last 75px, where the reply notice and the hours line land, under the bar)
    var io = null;
    function watch() {
      if (io) io.disconnect();
      var hdr = document.querySelector('.hdr'), bar = document.querySelector('.callbar');
      var top = hdr ? hdr.offsetHeight : 0, bot = bar && bar.getClientRects().length ? bar.offsetHeight : 0;
      io = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          // the whole stage where the screen holds it (at .95 its last 20px, the hours line's, could still sit under the bar);
          // a screen shorter than the stage plays once most of it is in view
          var room = (innerHeight - top - bot) / stage.offsetHeight, need = room >= 1 ? 1 : room >= .95 ? .95 : room >= .6 ? .6 : .3;
          if (!played && mode === 'wait' && en.intersectionRatio >= need) { io.disconnect(); play(); }
        });
      }, { threshold: [0, .3, .6, .95, 1], rootMargin: '-' + top + 'px 0px -' + bot + 'px 0px' });
      io.observe(stage);
    }
    // GSAP comes in only when the band is near: three files in order (the plugins need gsap first), none from a CDN
    var near = new IntersectionObserver(function (es) {
      if (!es.some(function (e) { return e.isIntersecting; })) return;
      near.disconnect();
      var files = ['gsap.min.js', 'Flip.min.js', 'CustomEase.min.js'], left = files.length, failed = false;
      files.forEach(function (f) {
        var s = document.createElement('script'); s.src = base + f; s.async = false;
        s.onload = function () { if (!--left && !failed) start(); };
        s.onerror = function () { failed = true; fig.classList.add('still'); };   // the finished frame, never a half-drawn one
        document.head.appendChild(s);
      });
    }, { rootMargin: '600px 0px' });
    near.observe(fig);
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
  /* ================================================================================================================================
     The last pass (2026-10-26, Franco's picks; ported from the prototype's last-pass.js with its chg- switches taken off). Each part
     listens to Lumora.on(), so a pick redraws it. Motion follows the house rules: ?still and reduced motion get the finished frame */
  var LP_STILL = /[?&]still\b/.test(location.search) || matchMedia('(prefers-reduced-motion: reduce)').matches;
  var lpLater = [], lpResize = [], lpT = 0;
  addEventListener('resize', function () { clearTimeout(lpT); lpT = setTimeout(function () { lpResize.forEach(function (f) { f(); }); }, 120); });

  /* 1 picker-row (computer): "Your business:" then four sample businesses as plain tabs and More, which opens the list picker()
     already opens from its field (More presses that field). An ink underline slides to the pick (260ms; a jump under reduced
     motion). A pick from the list puts its name where More was. The row holds what fits: a tab steps into More's list first (it is
     there already), from the end and never the picked one, and the label steps aside only after every tab but the first */
  function pickerRow() {
    var box = document.querySelector('.hm4-hero .pk'), row = box && box.querySelector('.pk-tabs'); if (!row) return;
    var field = box.querySelector('.pk-field'), more = row.querySelector('.pk-mo'), ul = row.querySelector('.pk-ul'), lab = row.querySelector('.pk-tabs-k'),
      tabs = Array.prototype.slice.call(row.querySelectorAll('.pk-tab')), desk = matchMedia('(min-width: 900px)');
    tabs.forEach(function (t) { t.addEventListener('click', function () { if (box.hasAttribute('data-open')) field.click(); Lumora.setTrade(t.dataset.t); }); });
    more.addEventListener('click', function () { field.click(); });
    new MutationObserver(function () { more.setAttribute('aria-expanded', box.hasAttribute('data-open') ? 'true' : 'false'); }).observe(box, { attributes: true, attributeFilter: ['data-open'] });
    // picker() gives focus back to its field after a pick from the list; the field is hidden here, so focus comes back to More
    box.addEventListener('click', function (e) { if (e.target.closest('.pk-list .chip')) setTimeout(function () { more.focus({ preventScroll: true }); }, 0); });
    box.addEventListener('keydown', function (e) { if (e.key === 'Escape') setTimeout(function () { if (document.activeElement === document.body || !box.contains(document.activeElement)) more.focus({ preventScroll: true }); }, 0); });
    function mark(key, move) {
      var chip = box.querySelector('.chip[data-t="' + key + '"] b');
      tabs.forEach(function (t) { t.hidden = false; }); if (lab) lab.hidden = false;
      var own = tabs.filter(function (x) { return x.dataset.t === key; })[0];
      more.textContent = own || !chip ? more.getAttribute('data-more') : chip.textContent;
      more.classList.toggle('is-pick', !own);
      if (desk.matches) {
        var over = function () { return row.scrollWidth > row.clientWidth + 1; };
        for (var i = tabs.length - 1; i > 0 && over(); i--) if (tabs[i] !== own) tabs[i].hidden = true;
        if (lab && over()) lab.hidden = true;
      }
      var t = own && !own.hidden ? own : null;
      if (own && own.hidden) { more.textContent = chip ? chip.textContent : more.textContent; more.classList.add('is-pick'); }
      tabs.forEach(function (x) { x.setAttribute('aria-pressed', x === t ? 'true' : 'false'); });
      if (!desk.matches) return;
      var el = t || more, rr = row.getBoundingClientRect(), er = el.getBoundingClientRect(), cs = getComputedStyle(el),
        w = er.width - (parseFloat(cs.paddingLeft) || 0) - (parseFloat(cs.paddingRight) || 0) - (el === more ? 20 : 0);   // More's arrow is not its name
      ul.style.transition = move && !LP_STILL ? '' : 'none';
      ul.style.transform = 'translateX(' + (er.left - rr.left + (parseFloat(cs.paddingLeft) || 0)).toFixed(1) + 'px) scaleX(' + Math.max(1, w).toFixed(1) + ')';
      row.classList.add('is-set');
    }
    mark(Lumora.trade, false);
    Lumora.on(function (k) { mark(k, true); });
    lpResize.push(function () { mark(Lumora.trade, false); }); lpLater.push(function () { mark(Lumora.trade, false); });
  }

  /* 2 tools-follow (computer; a phone hides the names): the lede's tool names follow the pick, the everyday tools most businesses
     use first and the sample's own industry tool after (Franco, Oct 26: "we are like a general purpose automation business"). Four
     names, or three where four would take the lede past the lines the default sample's take, so Call us and the price never move.
     Every name is on What we automate's tools list */
  // The reviewers' round (craft judge, a must): every Spanish list kept four names, so the Spanish lede ran to three lines at 1280 to
  // 1440 ("o Gmail." alone on the third) and pushed the price block past a 768px screen, and the English Water and Roofing picks
  // moved Call us 30px. So the lede keeps the lines the page's own default takes, two at most: the names drop from four to two
  // until it fits, Water and Roofing name Excel (their screens use it too), and the Spanish default ships three names.
  // check.py tools_line_problems holds it at 1280, 1366 and 1440 for every pick, both languages
  var TOOLS = {
    offices: ES ? ['QuickBooks', 'Outlook', 'Excel', 'Gmail'] : ['QuickBooks', 'Excel', 'Outlook', 'Gmail'], plumbing: ['QuickBooks', 'Excel', 'Housecall Pro', 'Jobber'], ac: ['QuickBooks', 'Excel', 'ServiceTitan', 'Housecall Pro'],
    electrical: ['QuickBooks', 'Excel', 'Jobber', 'Housecall Pro'], water: ['QuickBooks', 'Excel', 'Xactimate', 'DASH'], pest: ['QuickBooks', 'Google Sheets', 'Gmail', 'PestPac'],
    roofing: ['QuickBooks', 'Excel', 'JobNimbus', 'AccuLynx'], food: ['QuickBooks', 'Google Sheets', 'Toast', 'Square'], rentals: ['QuickBooks', 'Excel', 'AppFolio', 'Buildium']
  };
  function toolsFollow() {
    var sp = document.querySelector('.hm4-hero .t-tools'), lede = sp && sp.closest('.t-lede'); if (!sp) return;
    var say = function (n) { return (ES ? ', como ' : ', like ') + n.slice(0, -1).join(', ') + (ES ? ' o ' : ' or ') + n[n.length - 1]; };
    var BASE = sp.textContent;   // the default as the page ships it (what a reader with JS off sees)
    function set(k) {
      var n = TOOLS[k]; if (!n) return;
      if (getComputedStyle(sp).display === 'none') { sp.textContent = say(n); return; }
      var cs = getComputedStyle(lede), lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.4;
      sp.textContent = BASE; var cap = Math.min(lede.getBoundingClientRect().height, lh * 2.5);
      for (var c = n.length; c >= 2; c--) { sp.textContent = say(n.slice(0, c)); if (lede.getBoundingClientRect().height <= cap + 1) break; }
    }
    Lumora.on(set); set(Lumora.trade);
    lpResize.push(function () { set(Lumora.trade); }); lpLater.push(function () { set(Lumora.trade); });
  }

  /* 18 sheet-map: each problem row on the walk sheet links to its stop, with the stop's own thin circled number (a CSS counter: no
     words added). A tap lands with the stop's title at the top of the screen (scroll-margin), and the title takes focus once the
     scroll has ended, so the page's focus guard never cancels the smooth scroll halfway (judges' note) */
  function sheetMap() {
    function wire() {
      Array.prototype.forEach.call(document.querySelectorAll('.hm4-hero .sheet .sh-rows > li'), function (li, i) {
        var b = li.querySelector('.sh-l > b'); if (!b || b.querySelector('a')) return;
        var a = document.createElement('a'); a.className = 'sh-go'; a.href = '#stop-' + (i + 1);
        while (b.firstChild) a.appendChild(b.firstChild);
        b.appendChild(a);
      });
    }
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a.sh-go'); if (!a) return;
      var s = document.getElementById(a.getAttribute('href').slice(1)); if (!s) return;
      e.preventDefault();
      var h = s.querySelector('.stop-t h3'), done = false, focus = function () { if (done || !h) return; done = true; h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); };
      if (LP_STILL) { s.scrollIntoView({ block: 'start' }); focus(); return; }
      if ('onscrollend' in window) addEventListener('scrollend', focus, { once: true });
      setTimeout(focus, 900);
      s.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    Lumora.on(wire); wire();
  }

  /* 8 stop-head (computer, 1000px and up): each stop's Before / After switch moves up under its title, the Sample stamp right after
     it; the notes stay beside the picture. Plumbing's own stop 1 and every sample's stops alike (judges: AC's stamp floated mid-page;
     and with the switch out of the picture's top, a stop's notes sit at its picture's own middle, so AC's fourth stop, alone beside
     its phone, left no blank run). Moved back under 1000px, where the switch rides with the picture */
  function stopHead() {
    var mq = matchMedia('(min-width: 1000px)');
    function apply() { Array.prototype.forEach.call(document.querySelectorAll('#walk .stops > .stop'), one); }
    function one(st) {
      var pic = st.querySelector('.stop-body > .pic'), seg = st.querySelector('.pic > .seg, .stop-ctl > .seg'), samp = st.querySelector('.pic > .samp, .stop-ctl > .samp'), box = st.querySelector(':scope > .stop-ctl');
      if (mq.matches && seg && pic) {
        if (!box) { box = document.createElement('div'); box.className = 'stop-ctl'; st.insertBefore(box, st.querySelector('.stop-body')); }
        if (seg.parentNode !== box) box.appendChild(seg);
        if (samp && samp.parentNode !== box) box.appendChild(samp);
        st.classList.add('is-head');
      } else if (box) {
        if (seg) pic.appendChild(seg);
        if (samp) pic.appendChild(samp);
        box.remove(); st.classList.remove('is-head');
      }
    }
    Lumora.on(apply); apply();
    if (mq.addEventListener) mq.addEventListener('change', apply);
  }

  /* 12 two-tone (the walk's heading): the claim in ink, "Here's where." in the muted second tone; system.js writes the heading again
     on each pick. The close's heading carries its own span in the markup */
  function twoTone() {
    function apply() {
      var h = document.querySelector('#walk [data-walk-head]'); if (!h || h.querySelector('.walk-where')) return;
      var last = h.lastChild, m = last && last.nodeType === 3 && /^(\.\s*)(\S.*)$/.exec(last.nodeValue); if (!m) return;
      last.nodeValue = m[1]; var sp = document.createElement('span'); sp.className = 'walk-where'; sp.textContent = m[2]; h.appendChild(sp);
    }
    Lumora.on(apply); apply();
  }

  /* 11 chips-peek (phone): the chips' side padding is set so the screen's edge cuts a chip near its middle, never its last letter or
     two, with scroll snap. Every label setting ("Your business:" on one line or two) and padding from 8 to 16px is tried: the cut
     nearest a third of a chip wins, never under a fifth or past two thirds; from 390px wide the first three chips stay whole */
  function chipsPeek() {
    var row = document.querySelector('.hm4-hero .pk .chips'), box = document.querySelector('.hm4-hero .pk'), mq = matchMedia('(max-width: 899px)'); if (!row || !box) return;
    function cutAt(two, p) {
      box.classList.toggle('pk-q2', two); row.style.setProperty('--pk-cx', p + 'px');
      var chips = Array.prototype.filter.call(row.querySelectorAll('.chip'), function (c) { return c.getClientRects().length; }), rr = row.getBoundingClientRect(),
        edge = Math.min(innerWidth, rr.left + row.clientWidth);
      for (var i = 0; i < chips.length; i++) { var c = chips[i].getBoundingClientRect(); if (c.left < edge && c.right > edge) return { i: i, f: (edge - c.left) / c.width }; }
      return { i: -1, f: 0 };
    }
    function fit() {
      if (!mq.matches) { box.classList.remove('pk-q2'); row.style.removeProperty('--pk-cx'); return; }
      var best = null;
      [true, false].forEach(function (two) {
        for (var p = 16; p >= 8; p -= 0.5) {
          var r = cutAt(two, p); if (r.i < 0) continue;
          var score = Math.abs(r.f - 0.35) + (r.f < 0.2 || r.f > 0.66 ? 1 : 0) + (r.i < 3 && innerWidth >= 390 ? 0.5 : 0) + Math.abs(p - 11) * 0.004 + (two ? 0.01 : 0);
          if (!best || score < best.s) best = { s: score, p: p, two: two };
        }
      });
      cutAt(best ? best.two : true, best ? best.p : 8);
    }
    fit(); lpResize.push(fit); lpLater.push(fit);
  }

  function lastPass() {
    pickerRow(); toolsFollow(); sheetMap(); stopHead(); twoTone(); chipsPeek();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { lpLater.forEach(function (f) { f(); }); });
  }

  function start() {
    orderPic();   // What we automate's picture (the code picture it replaced moved to How it works, Oct 27)
    if (!window.Lumora) return;
    Lumora.on(intro); Lumora.on(picked); Lumora.on(slip);   // cue() went with the hero strip (2026-10-16): the sheet itself rises on a pick (system.css .sheet.swap)
    Lumora.on(function () { seat(); nightTag(); });
    if (Lumora.trade) { intro(Lumora.trade, Lumora.trades[Lumora.trade]); picked(Lumora.trade, Lumora.trades[Lumora.trade]); slip(Lumora.trade, Lumora.trades[Lumora.trade]); }
    variants(); picker(); seat(); nightTag(); slipMotion(); walkAlso();   // stripPlay() left with the strip (alive build 2026-10-24)
    lastPass();   // the last pass's parts (2026-10-26), after picker() has wired the list they open
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(seat);
    addEventListener('resize', seat);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
