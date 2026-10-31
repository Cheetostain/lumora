/* Lumora design system: behaviour. Plain JS, no library. Load after trades.js, with defer.
   Every motion names its job in a comment (feedback, state change, cause and effect, show our work, one-time focus).
   The page is complete without this file: chips are links, sheets are prerendered, ghost-to-real figures show the fixed
   state, the night band shows its finished frame, the tally shows the full sheet.
   Public API on window.Lumora: trade, trades, money(n), setTrade(key), on(fn), draw(el), ring(svg), pencil(scope), lint(). */
(function () {
  'use strict';
  var D = window.LUMORA_TRADES || {}, ORDER = window.LUMORA_ORDER || Object.keys(D);
  var root = document.documentElement; root.classList.add('js');
  // Spanish pages (<html lang="es">; the Spanish Home first, 2026-10-10): each trade's es block in trades.js (sheets.json and
  // trades-src-es.json) replaces its words, while times, dates, figures and structure stay the English data's. tr() gives the
  // page's own words for what this file writes itself. EN keeps the English data for lint()'s Spanish checks.
  var ES = /^es\b/i.test(root.getAttribute('lang') || ''), EN = {}, ESMISS = [];
  var tr = function (en, es) { return ES ? es : en; };
  // every trade in the data, not only LUMORA_ORDER's eight: Home's offices and clinics sample is homeOnly (2026-10-17 polish)
  if (ES) Object.keys(D).forEach(function (k) { EN[k] = D[k]; D[k] = localize(k, D[k]); });
  function localize(k, t) {            // anything missing stays English and is listed for lint()
    var e = t.es, o = {}, q, n = t.night4; if (!e) { ESMISS.push(k + ': no Spanish block'); return t; }
    for (q in t) if (q !== 'es') o[q] = t[q];
    ['name', 'line', 'href', 'sub', 'short', 'time'].forEach(function (f) { if (e[f] != null) o[f] = e[f]; else if (t[f] != null) ESMISS.push(k + ': ' + f); });
    o.rows = t.rows.map(function (r) {
      var y = (e.rows || {})[r.id] || {}, x = {};
      for (q in r) x[q] = r[q]; for (q in y) x[q] = y[q];
      (r.pair ? ['b', 'fs', 'note', 'pair'] : ['b', 'fs', 'note', 'place', 'after']).forEach(function (f) { if (!y[f]) ESMISS.push(k + ' ' + r.id + ': ' + f); });
      return x;
    });
    if (n) {
      var s = e.night4 || {}; o.night4 = {}; for (q in n) o.night4[q] = n[q];
      o.night4.paper = s.paper || n.paper;
      o.night4.rows = n.rows.map(function (r, i) { return [r[0], (s.rows || [])[i] || r[1], r[2]]; });
      o.night4.nts = n.nts.map(function (x, i) { var y = (s.nts || [])[i] || {}, z = {}; for (q in x) z[q] = x[q]; ['t', 'p', 'fx'].forEach(function (f) { if (y[f]) z[f] = y[f]; }); return z; });
      if (!s.paper || (s.rows || []).length !== n.rows.length || (s.nts || []).length !== n.nts.length) ESMISS.push(k + ': night4');
    }
    o.morning = e.src ? { src: e.src } : null;   // the night log's foot names each trade's own records
    if (t.morning && t.morning.src && !e.src) ESMISS.push(k + ': src');
    return o;
  }
  var DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'],
    MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  // a clock time as the page writes it: "6:30 AM", or on a Spanish page "6:30 a. m." with no-break spaces, so it never splits
  // over two lines (ES-VOICE); data-t keeps the English form
  var hora = function (s) { return ES ? String(s).replace(/\b(\d{1,2}:\d\d) ?([AP])M\b/g, function (m, h, a) { return h + ' ' + a.toLowerCase() + '. m.'; }) : s; };
  var qs = new URLSearchParams(location.search);
  var still = qs.has('still') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  // alive build 2026-10-24 (Franco's pick how-spine): ?still reaches the CSS once, on <html>, for motion that only CSS runs (Home's
  // spine down How it works). Until then it reached CSS per element only (.sheet.still). Reduced motion is the media query's own
  if (qs.has('still')) root.classList.add('still');
  var fine = matchMedia('(hover: hover) and (pointer: fine)');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  // 2026-10-17 round 3 (judges): a line never starts with "·" and an address never ends a line on its bare house number (Water damage
  // ES at 375 opened a line with "· se revisan cada mañana"; "123 / Oak St." split in Plumbing's thread). Every word the system writes
  // passes through esc(), so the fix lives here once: the middle dot binds to the word before it with a no-break space, and a house
  // number, its street and the suffix ("129 Oak St") stay one unit. The pages' own copy says it the same way by hand (&nbsp;).
  // check.py WHOLE_JS fails either, in Chromium from 320 to 430 and in WebKit at 320, 375 and 393
  // Round 4 (2026-10-18, Franco's iPhone: "10 / cases", "20 / days.", "El día 30 / es", "de 2 / galones"): a bare count keeps the word
  // after it, and a formula's operator keeps its number ("× 24%"); the last factors join the one before them ("Tuesday × 52 weeks ÷ 12",
  // "book × $151"), so no line starts with "÷ 12" alone (Restaurants' app errors row at 1280 to 1440). keepCounts() is the same rule
  // the pages' own copy follows by hand (&nbsp;). check.py WHOLE_JS fails a count split from its word and a line of an operator and one token
  var keepCounts = function (s) { return s.replace(/(^|[\s(])(\d{1,4}) (?=[A-Za-z\u00c0-\u00ff])/g, '$1$2\u00a0').replace(/([\u00d7\u00f7]) /g, '$1\u00a0')
    .replace(/ ([\u00d7\u00f7]\u00a0(?:[^\s]|\u00a0)+)$/, '\u00a0$1').replace(/ ([\u00d7\u00f7]\u00a0(?:[^\s]|\u00a0)+)$/, '\u00a0$1'); };
  var keep = function (s) { return keepCounts(s.replace(/ \u00b7 /g, '\u00a0\u00b7 ').replace(/\b(\d{1,5}) ([A-Z][a-z]+(?: [A-Z][a-z]+)?) (St|Ave|Rd|Blvd|Dr|Ln|Way|Ct|Pl|Hwy|Pkwy|Ter|Cir)\b/g, function (m, n, st, sx) { return n + '\u00a0' + st.replace(/ /g, '\u00a0') + '\u00a0' + sx; }).replace(/(\d) (?=[AP]M\b|[ap]\.[ \u00a0]?m\.)/g, '$1\u00a0').replace(/(\d\u00a0[ap]\.) (m\.)/g, '$1\u00a0$2')); };   // keepCounts last, so the address and clock rules see plain spaces; and a clock time ("4:12 PM" split in a badge at 320), as whole() does
  var esc = function (s) { return keep(String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')); };
  // design round picks, 2026-10-19 (item 6): on a Spanish page a heading the system writes (a walk stop's place) never ends a
  // line on a short word (a, de, su, y...): it is bound to the next word with a no-break space, as the page's own headings are
  // written in its source (check.py picks_problems). Split on plain spaces, so no lookbehind (older iPhone Safari lacks it).
  // Every Spanish page since the picks follow-up (same day): Home's picker rewrites its stops too, and its headings joined the rule
  var SHORT_ES = /^(?:a|al|de|del|el|la|las|los|lo|le|se|su|sus|y|e|o|u|en|con|por|que|un|una|no|mi)$/i;
  var headEs = function (s) { if (!ES) return s; var w = String(s).split(' ');
    return w.map(function (x, i) { return x + (i < w.length - 1 ? (SHORT_ES.test(x.split('\u00a0').pop()) ? '\u00a0' : ' ') : ''); }).join(''); };
  // a phone number and a clock time stay on one line where the system writes them into words (round 2 of Franco's iPhone review,
  // 2026-10-17: WebKit broke "(352) 555- / 0148" in Home's night log and "Thu 9:00 / AM" in the plumbing quotes window). It takes
  // escaped text: a number goes in a span.nw (system.css; a no-break space alone still lets it break after the hyphen) and a time
  // gets no-break spaces ("6:39 AM", "12:30 p.m.", "6:39 a. m."). Used on the night log, a window's status line and a phone thread
  var whole = function (s) { return s.replace(/\(\d{3}\) \d{3}-\d{4}/g, '<span class="nw">$&</span>').replace(/(\d) (?=[AP]M\b|[ap]\.[ \u00a0]?m\.)/g, '$1\u00a0').replace(/(\d\u00a0[ap]\.) (m\.)/g, '$1\u00a0$2'); };
  var money = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };
  var total = function (t) { return t.rows.reduce(function (a, r) { return a + r.usd; }, 0); };
  var perWord = function (t) { return t.per === 'yr' ? tr('a year', 'al año') : tr('a month', 'al mes'); };
  var perShort = function (t) { return ' ' + perWord(t); };   // one way to say it on every v4 page ("/ mo" retired, review 2026-10-10)
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked: the page still works */ } }
  };
  var listeners = [];
  var L = window.Lumora = { still: still, trades: D, money: money, trade: null,
    on: function (fn) { listeners.push(fn); } };

  /* ================================================================ the red pen */
  // The ring is redrawn in real pixels so the stroke never stretches. 2026-10-16 (Franco's GO on the new Home, his note 3: a pen
  // ring is level): the hand-drawn point list, which leaned, became p1-final's level ellipse, built the way build.py ring()
  // builds it: the long axis level, a 2.2% pressure wobble, 1.08 turns so the end passes just inside the start, a 4.5% drift
  // in as the pen closes. In the .sh-usd box (system.css section 11) it keeps about 3.7px off the figure (pencil_air.py).
  function ring(svg) {
    if (!svg) return;
    var w = svg.clientWidth || svg.getBoundingClientRect().width, h = svg.clientHeight || svg.getBoundingClientRect().height;
    if (!w || !h) return;
    w = Math.round(w); h = Math.round(h);
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h); svg.removeAttribute('preserveAspectRatio');
    var P = [], f = function (n) { return n.toFixed(1); }, cx = w * .5, cy = h * 26 / 52, rx = w * .46, ry = h * 22.5 / 52;
    for (var j = 0; j <= 48; j++) {
      var q = j / 48, a = 200 * Math.PI / 180 + q * 1.08 * 2 * Math.PI, k = 1 + .022 * Math.sin(2 * a + .7) - .045 * q;
      P.push([cx + rx * k * Math.cos(a), cy + ry * k * Math.sin(a)]);
    }
    var d = 'M' + f(P[0][0]) + ' ' + f(P[0][1]);
    for (var i = 0; i < P.length - 1; i++) {
      var a = P[i - 1] || P[i], b = P[i], c = P[i + 1], e = P[i + 2] || c;
      d += 'C' + f(b[0] + (c[0] - a[0]) / 6) + ' ' + f(b[1] + (c[1] - a[1]) / 6) + ' ' + f(c[0] - (e[0] - b[0]) / 6) + ' ' + f(c[1] - (e[1] - b[1]) / 6) + ' ' + f(c[0]) + ' ' + f(c[1]);
    }
    var p = svg.querySelector('path') || svg.appendChild(document.createElementNS('http://www.w3.org/2000/svg', 'path'));
    p.setAttribute('pathLength', '1'); p.setAttribute('d', d);
  }
  var RING_SVG = '<svg class="pen-ring" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M14 22C30 4 70 2 90 25S98 80 70 90 10 92 5 60 20 10 34 5"/></svg>';
  var UNDER_SVG = '<svg class="pen-under" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true" data-draw><path pathLength="1" d="M2 6C28 2 60 9 98 4"/></svg>';
  function draw(el, delay) {          // job: one-time focus. (Re)start a pen stroke.
    if (!el) return; el.classList.remove('drawn');
    if (still) { el.classList.add('drawn'); return; }
    void el.getBoundingClientRect();
    setTimeout(function () { el.classList.add('drawn'); }, delay || 0);
  }
  function rollTo(el, from, to, fmt) { // job: cause and effect. A number moves only when the owner's own choice changed it.
    if (!el) return;
    if (still || from === to || from == null) { el.textContent = fmt(to); return; }
    if (rolling && el.closest('#walk, .hm4-hero')) { el.textContent = fmt(to); return; }   // digits-roll: Home's walk total rolls with the other figures (rollFigures), not by counting
    var t0 = performance.now();
    (function step(now) { var k = Math.min(1, (now - t0) / 500), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(from + (to - from) * e); if (k < 1) requestAnimationFrame(step); })(t0);
  }
  L.ring = ring; L.draw = draw;

  /* ================================================================ the figures roll (alive build 2026-10-24) */
  // Franco's pick digits-roll (alive round item 7, Oct 23: "a little more alive", calm). When the owner picks another sample
  // business, each money figure that changes rolls from its old value to its new one, 400ms on the house ease-out: the sheet's rows
  // and total, the walk's heading, each stop's figure, the adding slip and the walk's total. NumberFlow 0.6.2 turns the digits (MIT,
  // Maxwell Barvian; self-hosted in assets/vendor beside this file with its licence, number-flow.LICENSE.md, and esm-env's; SYSTEM.md
  // section 2). It loads on the page's first touch on a phone, or when the pointer, focus or a key first reaches the picker or the
  // walk's line naming the other samples (caught before the chip's own handler), so a page nobody touches loads no extra bytes, and
  // never under reduced motion or ?still, which keep plain figures. It is one file, esm-env's one flag written into it (checkers'
  // pass 2026-10-24): a tap's click comes about 50ms after its pointerdown, and three requests in a row made a phone's first pick
  // miss its roll. setTrade() writes the new figures first, as plain text; rollFigures() then puts a NumberFlow
  // element where each one's digits are, starting from the figure it replaced, and hands the figure back as plain text when the roll
  // ends (animationsfinish, or 1200ms if it never ran). NumberFlow keeps its digits in a shadow root, so until then the page text, a
  // copy and a screen reader find nothing where the number is: the round's own check logged the figures empty. The sheet's live
  // region says the new total once, as before. The pen ring on row 1 hides while its row rolls and draws again after, at the figure's
  // new width. A roll starts in the pick's own frame or not at all: a pick that comes before the module is ready, after a frame has
  // shown its new figures, keeps them without a roll (a WebKit tap painted the new figures, then rolled back from the old ones). check.py
  // roll_problems holds it: no request at load, the roll on a real click, no NumberFlow left after it and every figure trades.js's
  var NF_SRC = (function () { var s = document.currentScript && document.currentScript.src; try { return s ? new URL('assets/vendor/number-flow.mjs', s).href : ''; } catch (e) { return ''; } })();
  var ROLL = ['.hm4-hero .sheet .sh-rows > li .sh-usd', '.hm4-hero .sheet [data-f="total"]', '#walk [data-walk-head] .walk-h-usd',
    '#walk .stops > .stop .find-usd', '#walk [data-f="slip"] li > b', '#walk [data-bind="bigfig"] [data-f="n"]'];
  var nfLoad = null, rolling = false;
  function loadFlow() {
    if (!nfLoad && NF_SRC) nfLoad = import(NF_SRC).catch(function () { nfLoad = null; });   // a failed load leaves the figures plain
    return nfLoad || Promise.resolve();
  }
  function rollWatch() {
    if (still || !NF_SRC || !$('[data-picker]') || !$(ROLL.join(','))) return;
    var go = function () { loadFlow(); };
    $$('[data-picker], [data-walk-also]').forEach(function (el) {
      ['pointerover', 'pointerdown', 'focusin', 'keydown'].forEach(function (t) { el.addEventListener(t, go, { once: true, passive: true, capture: true }); });
    });
    addEventListener('touchstart', go, { once: true, passive: true, capture: true });   // a thumb scrolling to the picker starts the load
  }
  function rollAmount(el) {
    var nf = el.querySelector('number-flow'); if (nf && nf._to != null) return nf._to;   // a figure still rolling: where it is going
    var m = /\$([\d,]+)/.exec(el.textContent); return m ? +m[1].replace(/,/g, '') : null;
  }
  function rollSnap() { return ROLL.map(function (s) { return $$(s).map(rollAmount); }); }
  function rollOne(el, from, to) {
    var tn = Array.prototype.filter.call(el.childNodes, function (n) { return n.nodeType === 3 && /\$[\d,]+/.test(n.nodeValue); })[0];
    if (!tn) return null;
    var v = tn.nodeValue, m = /\$[\d,]+/.exec(v), nf = document.createElement('number-flow'), done = false;
    nf.locales = 'en-US'; nf.format = { style: 'currency', currency: 'USD', maximumFractionDigits: 0 };   // every figure is written "$1,900", on the Spanish pages too
    nf.transformTiming = nf.spinTiming = { duration: 400, easing: 'cubic-bezier(.33,1,.68,1)' };          // the house ease-out
    nf.opacityTiming = { duration: 200, easing: 'ease-out' };
    nf._to = to;
    if (m.index) el.insertBefore(document.createTextNode(v.slice(0, m.index)), tn);
    el.insertBefore(nf, tn); tn.nodeValue = v.slice(m.index + m[0].length);
    nf.update(from);
    function end() {   // the figure as plain text again, the page's own words; a figure a later pick rewrote is gone already
      if (done) return; done = true;
      var p = nf.parentNode; if (!p || !nf.isConnected) return;
      p.replaceChild(document.createTextNode(money(nf._to)), nf); p.normalize();
      if (nf._after) nf._after();
    }
    requestAnimationFrame(function () { if (!nf.isConnected) return; nf.addEventListener('animationsfinish', end, { once: true }); nf.update(to); });
    setTimeout(end, 1200);   // a roll that never ran (the tab hidden): the figure still comes back as text
    return nf;
  }
  function rollRing(nf) {   // the pen ring on row 1 waits for its row's roll, then draws again round the figure's new width
    var usd = nf.parentNode, svg = usd && usd.querySelector('.pen-ring'), sheet = usd && usd.closest('.sheet'); if (!svg || !sheet) return;
    sheet.classList.add('nf-roll');
    nf._after = function () {
      sheet.classList.remove('nf-roll'); ring(svg);
      var p = svg.querySelector('path'); if (p) { p.style.animation = 'none'; void p.getBoundingClientRect(); p.style.animation = ''; }
    };
  }
  function rollFigures(was) {
    var ready = function () { return !!(window.customElements && customElements.get('number-flow')); }, shown = false, rolled = false;
    function go() {
      var now = rollSnap();
      ROLL.forEach(function (s, k) { $$(s).forEach(function (el, i) {
        var from = was[k][i], to = now[k][i]; if (from == null || to == null || from === to || !el.getClientRects().length) return;   // a figure not shown (the slip on a phone) just changes
        var nf = rollOne(el, from, to); if (nf && k === 0) rollRing(nf);
      }); });
    }
    if (ready()) return go();   // loaded: the roll starts in the pick's own frame
    // a frame is about to show the new figures: with no roll started, the sheet rises as a plain pick's does (the sheet binder held
    // it still for the roll, .nf-still)
    requestAnimationFrame(function () { shown = true; if (!rolled) $$('.sheet.nf-still').forEach(function (s) { s.classList.remove('nf-still'); }); });
    loadFlow().then(function () { if (ready() && !shown) { rolled = true; go(); } });   // too late once one has: a roll from the old figures would show the number jump back
  }
  // 2026-10-17 (Franco's iPhone: "$399 a month reads like not what we're losing"): a figure that stands alone says it is a loss,
  // "Losing $399 a month" / "Pierde $399 al mes" (per 'yr': a year / al año). Home types or binds the same words
  L.losing = function (n, per) { return tr('Losing ', 'Pierde ') + money(n) + ' ' + (per === 'yr' ? tr('a year', 'al año') : tr('a month', 'al mes')); };

  /* ================================================================ the pencil */
  // 2026-10-17 polish (Franco's list item 4: every pencil mark 3 to 4.5px off what it holds, never crowding its neighbours; the
  // CSS ring, inset -3px -8px, ran through the first and last letters of a wide line and into the p of "Llamada perdida"). A pencil
  // circle round words on one line (.pc) is drawn here in real pixels, in Home's hand (pencil_paths.py: level, a light pressure
  // wobble, 1.06 turns so the end passes just inside the start), 4px off the words' own ink: their top and bottom measured on a
  // drawing of the very string, so "Llamada perdida" gets room for its p and "Missed call" gets none (canvas text metrics come
  // rounded to whole pixels on Windows, which put a ring 1.5px into a "(" or a "p"). Its ends are round and a straight run follows
  // the words, so a long line gets the same ends as a short one. The loop is an inline SVG in the .pc (.pc-loop); the .pc's ::after,
  // the page's CSS ring, steps aside and stays the picture with JS off (a paper's one-time draw reveals either, trade-page.css).
  // A ring round a pill or a box, or round more than one
  // line, keeps its page's own loop (Home's Draft pill, the pest form's box, the water checklist). pencil_air.py measures every
  // ring on every page (check.py PENCIL_ALL).
  var PC_AIR = 4, pcCtx = null, pcInk = {};
  function glyphInk(cs, txt) {         // the ink of a string: drawn 4 times up, scanned for any pixel past a tenth of ink
    var key = [cs.fontStyle, cs.fontWeight, cs.fontSize, cs.fontFamily, cs.letterSpacing, txt].join('|');
    if (pcInk[key]) return pcInk[key];
    var S = 4, fs = parseFloat(cs.fontSize), font = function (sz) { return cs.fontStyle + ' ' + cs.fontWeight + ' ' + sz + 'px ' + cs.fontFamily; };
    pcCtx = pcCtx || document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    var c = pcCtx.canvas; pcCtx.font = font(fs);
    var m = pcCtx.measureText(txt), pad = Math.ceil(fs * S), by = pad * 2;
    c.width = Math.ceil(m.width * S + 2 * pad); c.height = Math.ceil(fs * S * 3);
    pcCtx.font = font(fs * S); pcCtx.textBaseline = 'alphabetic'; pcCtx.fillStyle = '#000';
    if ('letterSpacing' in pcCtx) pcCtx.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : parseFloat(cs.letterSpacing) * S + 'px';
    pcCtx.clearRect(0, 0, c.width, c.height); pcCtx.fillText(txt, pad, by);
    var d = pcCtx.getImageData(0, 0, c.width, c.height).data, W = c.width, H = c.height, t = H, b = -1, l = W, r = -1, x, y;
    for (y = 0; y < H; y++) for (x = 0; x < W; x++) if (d[(y * W + x) * 4 + 3] > 24) { if (y < t) t = y; if (y > b) b = y; if (x < l) l = x; if (x > r) r = x; }
    return (pcInk[key] = b < 0 ? null : { asc: (by - t) / S, desc: (b + 1 - by) / S, l: (l - pad) / S, r: (r + 1 - pad) / S, adv: m.width, fa: m.fontBoundingBoxAscent });
  }
  function pcInkBox(e) {               // the words' ink, in the .pc's own px; null for a pill, a box or more than one line
    var er = e.getBoundingClientRect(); if (!er.width || !er.height) return null;
    var sx = e.offsetWidth ? e.offsetWidth / er.width : 1; if (Math.abs(sx - 1) < .05) sx = 1;   // offsetWidth is a whole px: only a real transform scales
    var sy = sx, k = { t: 1e9, b: -1e9, l: 1e9, r: -1e9 }, tops = [], w, n;
    if ($$('*', e).some(function (c) { var s = getComputedStyle(c); return c.getClientRects().length && (!/^(transparent|rgba\(0, 0, 0, 0\))$/.test(s.backgroundColor) || parseFloat(s.borderTopWidth) > 0 || s.boxShadow !== 'none'); })) return null;
    w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
    while ((n = w.nextNode())) {
      var v = n.nodeValue, i0 = v.search(/\S/); if (i0 < 0) continue;
      var i1 = v.length - v.match(/\s*$/)[0].length, cs = getComputedStyle(n.parentElement); if (cs.visibility === 'hidden') continue;
      var rg = document.createRange(); rg.setStart(n, i0); rg.setEnd(n, i1);
      var rs = Array.prototype.filter.call(rg.getClientRects(), function (q) { return q.width > 0; }); if (!rs.length) continue;
      if (rs.length > 1) return null;
      var q = rs[0], g = glyphInk(cs, v.slice(i0, i1)); if (!g) continue;
      // the baseline where the glyphs are drawn: on the device pixel grid (at 1x a ring could sit a whole px off its words)
      var dpr = window.devicePixelRatio || 1, base = Math.round((q.top + g.fa) * dpr) / dpr, same = Math.abs(g.adv - q.width) < 1.5;   // tabular figures or tracking: keep the box's own sides
      tops.push(q.top);
      k.t = Math.min(k.t, base - g.asc); k.b = Math.max(k.b, base + g.desc);
      k.l = Math.min(k.l, same ? q.left + g.l : q.left); k.r = Math.max(k.r, same ? q.left + g.r : q.right);
    }
    if (k.t > k.b || Math.max.apply(null, tops) - Math.min.apply(null, tops) > (parseFloat(getComputedStyle(e).fontSize) || 16) * .9) return null;
    return { t: (k.t - er.top) * sy, b: (k.b - er.top) * sy, l: (k.l - er.left) * sx, r: (k.r - er.left) * sx, w: er.width * sx, h: er.height * sy };
  }
  function pcLoop(cx, cy, L, rx, b) {  // round ends (superellipse halves, n 2.5), a straight run between them; points even along it
    var B = [], C = [0], P = [], i, T, se = function (v) { return (v < 0 ? -1 : 1) * Math.pow(Math.abs(v), 2 / 2.5); };
    for (i = 0; i <= 45; i++) { var p = (-90 + i * 4) * Math.PI / 180; B.push([L + rx * se(Math.cos(p)), b * se(Math.sin(p))]); }
    for (i = 1; i < 20; i++) B.push([L - 2 * L * i / 20, b]);
    for (i = 0; i <= 45; i++) { var o = (90 + i * 4) * Math.PI / 180; B.push([-L + rx * se(Math.cos(o)), b * se(Math.sin(o))]); }
    for (i = 1; i < 20; i++) B.push([-L + 2 * L * i / 20, -b]);
    for (i = 1; i <= B.length; i++) C.push(C[i - 1] + Math.hypot(B[i % B.length][0] - B[i - 1][0], B[i % B.length][1] - B[i - 1][1]));
    T = C[B.length];
    var at = function (s) { s = ((s % T) + T) % T; var j = 1; while (C[j] < s) j++; var u = (s - C[j - 1]) / (C[j] - C[j - 1]), a = B[j - 1], z = B[j % B.length];
      return [a[0] + (z[0] - a[0]) * u, a[1] + (z[1] - a[1]) * u]; };
    var s0 = C[14], N = Math.max(72, Math.round(T * 1.06 / 5));   // B[14]: 34 degrees above the right end's middle, where Home's loop starts
    for (i = 0; i <= N; i++) {
      var f = i / N, s = s0 + f * 1.06 * T, xy = at(s), th = 2 * Math.PI * (s - s0) / T - 35 * Math.PI / 180,
        k = 1 + .012 * Math.sin(2 * th + .7) - .035 * Math.max(0, (f - .86) / .14), x = xy[0], ax = Math.abs(x);
      P.push([cx + (ax > L ? (x < 0 ? -1 : 1) * (L + (ax - L) * k) : x), cy + xy[1] * k]);
    }
    return P;
  }
  function pcAir(P, R, half) {         // the closest the stroke's inner edge comes to the ink box
    var m = 1e9, i, j;
    for (i = 0; i < P.length - 1; i++) for (j = 0; j < 8; j++) {
      var x = P[i][0] + (P[i + 1][0] - P[i][0]) * j / 8, y = P[i][1] + (P[i + 1][1] - P[i][1]) * j / 8;
      m = Math.min(m, Math.hypot(Math.max(R.l - x, 0, x - R.r), Math.max(R.t - y, 0, y - R.b)) - half);
    }
    return m;
  }
  function fitRing(e) {
    if (!e.getClientRects().length) return;
    var A = getComputedStyle(e, '::after'); if (A.content === 'none' || A.display === 'none') return;
    if (!e.hasAttribute('data-fit')) { e._pcInk = A.borderTopColor; e._pcW = parseFloat(A.borderTopWidth) || 2; }
    var k = pcInkBox(e); if (!k) { e.removeAttribute('data-fit'); if (e._pcSvg) e._pcSvg.remove(); return; }
    var sw = e._pcW, half = sw / 2, cx = (k.l + k.r) / 2, cy = (k.t + k.b) / 2, hw = (k.r - k.l) / 2, hh = (k.b - k.t) / 2;
    var b = (hh + PC_AIR + half) / (1 - .012), P, pass, m;
    // the ends start 1px past the words: a corner letter (the M of "Missed call") measured up to 1px closer than the top on some widths
    for (pass = 0; pass < 4; pass++) { P = pcLoop(cx, cy, hw + 1, b * .8, b); m = pcAir(P, k, half); if (m >= PC_AIR - .02) break; b += PC_AIR - m; }
    var x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9, i;
    P.forEach(function (p) { x0 = Math.min(x0, p[0]); y0 = Math.min(y0, p[1]); x1 = Math.max(x1, p[0]); y1 = Math.max(y1, p[1]); });
    x0 -= half + 1; y0 -= half + 1; x1 += half + 1; y1 += half + 1;
    var f = function (v) { return v.toFixed(1); }, d = 'M' + f(P[0][0] - x0) + ' ' + f(P[0][1] - y0);
    for (i = 0; i < P.length - 1; i++) {   // Catmull-Rom to cubic Bezier, as ring() and pencil_paths.py
      var p0 = P[i - 1] || P[i], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2] || p2;
      d += 'C' + f(p1[0] + (p2[0] - p0[0]) / 6 - x0) + ' ' + f(p1[1] + (p2[1] - p0[1]) / 6 - y0) + ' ' + f(p2[0] - (p3[0] - p1[0]) / 6 - x0) + ' ' +
        f(p2[1] - (p3[1] - p1[1]) / 6 - y0) + ' ' + f(p2[0] - x0) + ' ' + f(p2[1] - y0);
    }
    // an inline SVG, drawn at its exact sub-pixel place (an SVG background image was snapped to whole px and sat up to .5px off)
    var NS = 'http://www.w3.org/2000/svg', s = e._pcSvg;
    if (!s || s.parentNode !== e) {
      s = e._pcSvg = document.createElementNS(NS, 'svg'); s.setAttribute('class', 'pc-loop'); s.setAttribute('aria-hidden', 'true'); s.setAttribute('focusable', 'false');
      s.appendChild(document.createElementNS(NS, 'path')); e.appendChild(s);
    }
    s.setAttribute('viewBox', '0 0 ' + f(x1 - x0) + ' ' + f(y1 - y0));
    s.style.cssText = 'left:' + f(x0) + 'px;top:' + f(y0) + 'px;width:' + f(x1 - x0) + 'px;height:' + f(y1 - y0) + 'px';
    s.firstChild.setAttribute('d', d); s.firstChild.setAttribute('pathLength', '1');
    s.firstChild.setAttribute('stroke', e._pcInk); s.firstChild.setAttribute('stroke-width', sw);
    e.setAttribute('data-fit', '');
  }
  // a ring that turns up later (a Before layer, a tab, a stop drawn for another trade) is fitted when it comes into view
  var pcIO = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) { es.forEach(function (x) { if (x.isIntersecting) fitRing(x.target); }); }) : null;
  function pencil(scope, fresh) {      // fresh: the fonts or the sizes changed, so the words are measured again
    if (fresh) pcInk = {};
    $$('.pc', scope || document).forEach(function (e) { if (pcIO && !e._pcSeen) { e._pcSeen = 1; pcIO.observe(e); } fitRing(e); });
  }
  L.pencil = pencil;

  /* ================================================================ pictures: before (as we find it) and after (fixed) */
  var txt = function (x, y, s, size, cls, anchor) {
    var parts = String(s).split('|');
    return '<text class="gt ' + (cls || '') + '" x="' + x + '" y="' + y + '" font-size="' + size + '" text-anchor="' + (anchor || 'start') + '">' + esc(parts[0]) +
      (parts[1] ? '<tspan x="' + x + '" dy="' + (size * 1.3).toFixed(1) + '" font-weight="500">' + esc(parts[1]) + '</tspan>' : '') + '</text>';
  };
  var scrib = function (x, y, ws) { return ws.map(function (w, i) { return '<path class="gs l" pathLength="1" d="M' + x + ' ' + (y + i * 26) + ' q ' + (w / 4) + ' -3 ' + (w / 2) + ' 0 t ' + (w / 2) + ' 0"/>'; }).join(''); };
  function ghostSVG(kind, g) {        // the shop as we find it, drawn in thin graphite ink
    var s = '';
    if (kind === 'phone') {
      s = '<rect class="gs f" pathLength="1" x="40" y="10" width="220" height="440" rx="36"/><rect class="gs l" pathLength="1" x="51" y="21" width="198" height="418" rx="28"/>' + txt(150, 84, 'Shop line', 17, 'h', 'middle');
      g.forEach(function (v, i) { var y = 108 + i * 78; s += '<rect class="gs" pathLength="1" x="62" y="' + y + '" width="176" height="64" rx="12"/>' + txt(78, y + 27, v, 17, 'h'); });
    } else if (kind === 'clip') {
      s = '<rect class="gs f" pathLength="1" x="30" y="22" width="240" height="420" rx="14"/><rect class="gs f" pathLength="1" x="104" y="8" width="92" height="34" rx="8"/><rect class="gs" pathLength="1" x="46" y="54" width="208" height="372" rx="2"/>' +
        txt(64, 94, g[0], 20, 'h') + '<path class="gs" pathLength="1" d="M64 108h172"/>' + txt(64, 146, g[1], 18) + txt(64, 214, g[2], 18) + scrib(64, 290, [150, 120, 160, 90]);
    } else if (kind === 'pile') {
      [[48, 64, 0, g[0]], [82, 132, 0, g[1]], [58, 204, 0, g[2]]].forEach(function (q) {   // 2026-10-17 round 3: a pile of straight papers (no words turned off the line; it was -7, 5, -2 degrees)
        s += '<g transform="rotate(' + q[2] + ' ' + (q[0] + 92) + ' ' + (q[1] + 115) + ')"><rect class="gs f pf" pathLength="1" x="' + q[0] + '" y="' + q[1] + '" width="186" height="226" rx="2"/>' + txt(q[0] + 18, q[1] + 34, q[3], 18, 'h') + scrib(q[0] + 18, q[1] + 100, [130, 100, 140]) + '</g>'; });
    } else {
      s = '<rect class="gs f" pathLength="1" x="10" y="92" width="280" height="262" rx="10"/><path class="gs" pathLength="1" d="M10 124h280"/>' + txt(150, 114, g[0], 15, 'h', 'middle') +
        '<path class="gs l" pathLength="1" d="M150 124v230M10 164h280M10 244h280M10 304h280"/>' + txt(24, 194, g[1], 16) + txt(24, 272, g[2], 16) + scrib(164, 196, [96]) + scrib(164, 276, [80]) +
        '<path class="gs l" pathLength="1" d="M120 354l-14 50h88l-14-50M92 404h116"/>';
    }
    return '<div class="ghost"><svg viewBox="0 0 300 460" preserveAspectRatio="xMidYMid meet" aria-hidden="true">' + s + '</svg></div>';
  }
  function whiteboardHTML() {          // plumbing stop: the office whiteboard, live HTML so it stays readable on a phone
    return '<div class="wb"><div class="wb-in"><p class="wb-t">THIS WEEK</p><div class="wb-days">' +
      '<div class="wb-day wide-only"><b>MON</b><p>Smith<small>leak, sink</small></p><p>Brown<small>toilet</small></p></div>' +
      '<div class="wb-day"><b>TUE</b><p>Garcia<small>water heater visit</small></p></div>' +
      '<div class="wb-day wide-only"><b>WED</b><p>Miller<small>pressure</small></p></div>' +
      '<div class="wb-day"><b>THU</b><p>Wilson<small>drain</small></p></div>' +
      '<div class="wb-day"><b>FRI</b><p class="wb-late pc">Quote Garcia</p></div></div>' +
      '<svg class="wb-arrow wide" viewBox="0 0 500 64" preserveAspectRatio="none" aria-hidden="true"><path d="M440 6C420 60 200 62 150 14M140 26l10-14 14 10" vector-effect="non-scaling-stroke"/></svg>' +
      '<svg class="wb-arrow narrow" viewBox="0 0 300 64" preserveAspectRatio="none" aria-hidden="true"><path d="M250 6C230 60 90 62 50 14M40 26l10-14 14 10" vector-effect="non-scaling-stroke"/></svg>' +
      '</div><div class="wb-tray"></div></div>';
  }
  function recentsHTML() {             // plumbing stop: the shop phone, the missed call circled in red
    return '<div class="scr-phone tilt"><div class="ph"><div class="ph-sb"><span>6:58</span><i></i></div><div class="ph-body">' +
      '<div class="ph-seg"><span class="on">All</span><span>Missed</span></div><p class="ph-h">Recents</p><ul class="ph-list">' +
      '<li><b>Dave, truck 1</b><small>mobile</small><time>6:41 PM</time></li>' +
      '<li class="miss pc"><b>(352) 555-0131 (2)</b><small>Gainesville, FL</small><time>6:12 PM</time></li>' +
      '<li><b>Supply counter</b><small>work</small><time>3:22 PM</time></li>' +
      '<li><b>Maria Garcia</b><small>mobile</small><time>11:48 AM</time></li>' +
      '<li><b>John Smith</b><small>mobile</small><time>9:30 AM</time></li></ul></div></div></div>';
  }
  var chip = function (c) { return typeof c === 'object' ? '<span class="st ' + (c.chip === 'nt' ? 'gy' : c.chip) + '">' + esc(c.t) + '</span>' : esc(c); };
  function table(R) {
    if (R.xls) {
      var letters = 'ABCDEFG'.slice(0, R.cols.length).split('');
      return '<table><tr class="cl"><td></td>' + letters.map(function (l, i) { return '<td' + (i > 2 ? ' class="hm"' : '') + '>' + l + '</td>'; }).join('') + '</tr><tr><td>1</td>' +
        R.cols.map(function (c, i) { return '<th' + (i > 2 ? ' class="hm"' : '') + '>' + esc(c) + '</th>'; }).join('') + '</tr>' +
        R.rows.map(function (r) { var c = r.c || r; return '<tr' + (r.n ? ' class="on"' : '') + '>' + c.map(function (v, i) { return '<td' + (i > 3 ? ' class="hm"' : '') + '>' + chip(v) + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>';
    }
    var head = R.cols ? '<tr>' + R.cols.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr>' : '';
    return '<table class="dt">' + head + R.rows.map(function (r) { var c = r.c || r; return '<tr' + (r.n ? ' class="n"' : '') + '>' + c.map(function (v) { return '<td>' + chip(v) + '</td>'; }).join('') + '</tr>'; }).join('') + '</table>';
  }
  function docBody(R, withTitle) {
    return (withTitle ? '<div class="dhead"><b>' + esc(R.title) + '</b>' + (R.meta ? '<p class="dmeta">' + esc(R.meta) + '</p>' : '') + '</div>' : (R.meta ? '<p class="dmeta" style="margin:0 0 8px">' + esc(R.meta) + '</p>' : '')) +
      (R.xls ? '<div class="xl">' + table(R) + '</div>' : table(R)) +
      (R.total ? '<div class="dtot"><span>' + esc(R.total[0]) + '</span><span>' + esc(R.total[1]) + '</span></div>' : '') +
      (R.badge ? '<span class="ok' + (R.badge[0] === 'ok' ? '' : ' ' + R.badge[0]) + '">' + (R.badge[0] === 'ok' ? '✓ ' : '') + esc(R.badge[1]) + '</span>' : '') +
      (R.foot ? '<p class="dfoot">' + esc(R.foot) + '</p>' : '');
  }
  function realHTML(R, v4) {           // the fix, as the real screen or paper the shop would use (v4: inside the one phone frame, R6)
    if (R.frame === 'phone') {
      // R4: the text right after a missed call is an SMS text-back, so it shows green (.sms), never blue
      var th = '<div class="ph-who"><i></i>' + esc(R.who) + '</div><div class="thread">' + R.msgs.map(function (m, i) {
        var tb = m[0] === 'out' && i > 0 && /^(Missed call|Llamada perdida)/.test(R.msgs[i - 1][1]);
        return '<p class="' + (m[0] === 'sys' ? 'sys' + (i === R.msgs.length - 1 ? ' k' : '') : 'bub ' + m[0] + (tb ? ' sms' : '')) + '"' + (m[0] === 'sys' ? '' : ' data-ui-ok="nested-card a text bubble on the phone screen (R6): a message, not a box around content"') + '>' + whole(esc(m[1])) + '</p>'; }).join('') + '</div>';
      return v4 ? phoneOf()(th, R.clock || '9:41') : '<div class="scr-phone"><div class="ph"><div class="ph-sb"><span>9:41</span><i></i></div>' + th + '</div></div>';
    }
    if (R.frame === 'clip') return '<div class="doc-clip"><span class="clamp" aria-hidden="true"><i></i></span><div class="doc">' + docBody(R, true) + '</div></div>';
    if (R.frame === 'paper') return '<div class="doc tilt-r">' + docBody(R, true) + '</div>';
    return '<div class="scr-win"><div class="win-tb"><i></i><i></i><i></i><span>' + esc(R.title) + '</span></div><div class="win-b">' + docBody(R, false) + '</div></div>';
  }
  // sentences joined with ". ", never ".." after a part that already ends in a period (Spanish "p. m.", "oct."; review 2026-10-10)
  var sent = function (parts) { return parts.filter(function (s) { return s; }).map(function (s) { s = String(s).trim(); return /[.?]$/.test(s) ? s : s + '.'; }).join(' '); };
  function altAfter(R) {
    return R.frame === 'phone' ? sent([tr('Sample, fixed: a text thread on the shop phone with ', 'Ejemplo, con el arreglo: la conversación en el teléfono del negocio con el ') + R.who].concat(R.msgs.map(function (m) { return m[1]; })))
      : sent([tr('Sample, fixed: ', 'Ejemplo, con el arreglo: ') + R.title + (R.meta ? ', ' + R.meta : ''), R.badge && R.badge[1], R.total && R.total[0] + ' ' + R.total[1]]);
  }
  function altBefore(row) {
    if (row.before.kind === 'whiteboard') return 'Sample, as we find it: the office whiteboard. Garcia\'s water heater visit is under Tuesday; "Quote Garcia" is under Friday, with an arrow back to Tuesday.';
    if (row.before.kind === 'recents') return 'Sample, as we find it: the shop phone\'s Recents. Two missed calls from (352) 555-0131 at 6:12 PM, circled, and no call back.';
    return 'Sample, as we find it: drawing of ' + row.place.toLowerCase() + ': ' + row.before.g.map(function (v) { return v.replace('|', ' '); }).join(', ') + '.';
  }
  function beforeHTML(row) { return row.before.kind === 'whiteboard' ? whiteboardHTML() : row.before.kind === 'recents' ? recentsHTML() : ghostSVG(row.before.ghost, row.before.g); }

  /* ================================================================ v4 pictures (Home v4, 2026-10-10). Used only by v4 markup:
     the one phone frame (R6), and the same-object Before / After pair (R7). A pair is ONE frame; only the cells that change
     carry two layers (.was, .now), both always laid out, so the frame never changes size and nothing goes blank. A cell
     with tr keeps its old value in the after state, struck in pencil: the trace a still or a printout needs (one pencil
     mark per picture, R8). Pairs are [data-g2r] elements, so the ghost-to-real trigger, buttons and test hook drive them. */
  var TASK = { quotes: 'quotes', retyping: 'retyping', calls: 'calls', followups: 'reminders' };   // R1 task tags from sheet icons
  function SB(white) {                 // iOS status bar icons: signal, wifi, battery
    var c = white ? '#fff' : '#000';
    return '<span class="sb-ic"><svg viewBox="0 0 18 12" width="17" height="11"><rect x="0" y="8" width="3" height="4" rx=".7" fill="' + c + '"/><rect x="5" y="5.5" width="3" height="6.5" rx=".7" fill="' + c + '"/><rect x="10" y="3" width="3" height="9" rx=".7" fill="' + c + '"/><rect x="15" y="0" width="3" height="12" rx=".7" fill="' + c + '"/></svg>' +
      '<svg viewBox="0 0 16 12" width="15" height="11"><path d="M8 2.2c2.4 0 4.6.9 6.3 2.5l1.2-1.3C13.5 1.5 10.9.4 8 .4S2.5 1.5.5 3.4l1.2 1.3C3.4 3.1 5.6 2.2 8 2.2zm0 3.6c1.4 0 2.7.5 3.7 1.4l1.2-1.3C11.6 4.7 9.9 4 8 4s-3.6.7-4.9 1.9l1.2 1.3c1-.9 2.3-1.4 3.7-1.4zm0 3.5c-.6 0-1.2.2-1.6.6L8 11.6l1.6-1.7c-.4-.4-1-.6-1.6-.6z" fill="' + c + '"/></svg>' +
      '<svg viewBox="0 0 27 12" width="24" height="11"><rect x=".5" y=".5" width="22" height="11" rx="3" fill="none" stroke="' + c + '" stroke-opacity=".45"/><rect x="2" y="2" width="17" height="8" rx="1.8" fill="' + c + '"/><path d="M24 4v4c.8-.3 1.4-1.1 1.4-2s-.6-1.7-1.4-2z" fill="' + c + '" fill-opacity=".5"/></svg></span>';
  }
  // R6: the one phone. The frame is Magic UI's iPhone drawing (MIT License, Copyright (c) Magic UI;
  // github.com/magicuidesign/magicui, apps/www/registry/magicui/iphone.tsx; licence file checked 2026-10-10), restyled
  // near-black: body and side buttons, bezel, screen edge, speaker slit, camera island and lens, 433 x 882 (.491 wide to
  // tall). The screen is live HTML laid over the drawing's screen area in percentages (system.css .ph4-scr), so the
  // island sits on top of it as on the real phone. No Apple logo, no tilt. A lock screen passes no clock: its big clock
  // is the time (iOS shows no second time in a lock screen's status bar).
  var SCR = 'M21.25 75C21.25 44.21 46.21 19.25 77 19.25H355C385.79 19.25 410.75 44.21 410.75 75V807C410.75 837.79 385.79 862.75 355 862.75H77C46.21 862.75 21.25 837.79 21.25 807V75Z';
  var PH_FRAME = '<svg class="ph4-f" viewBox="0 0 433 882" aria-hidden="true" focusable="false">' +
    '<path fill="#232326" fill-rule="evenodd" d="M2 73C2 32.68 34.68 0 75 0H357C397.32 0 430 32.68 430 73V809C430 849.32 397.32 882 357 882H75C34.68 882 2 849.32 2 809V73Z' + SCR + '"/>' +
    '<path fill="#232326" d="M0 171C0 170.45.45 170 1 170H3V204H1C.45 204 0 203.55 0 203V171ZM1 234C1 233.45 1.45 233 2 233H3.5V300H2C1.45 300 1 299.55 1 299V234ZM1 319C1 318.45 1.45 318 2 318H3.5V385H2C1.45 385 1 384.55 1 384V319ZM430 279H432C432.55 279 433 279.45 433 280V384C433 384.55 432.55 385 432 385H430V279Z"/>' +
    '<path fill="#0a0a0b" fill-rule="evenodd" d="M6 74C6 35.34 37.34 4 76 4H356C394.66 4 426 35.34 426 74V808C426 846.66 394.66 878 356 878H76C37.34 878 6 846.66 6 808V74Z' + SCR + '"/>' +
    '<path fill="none" stroke="#2c2c30" stroke-width=".5" d="' + SCR + '"/>' +
    '<path opacity=".5" fill="#3a3a3e" d="M174 5H258V5.5C258 6.6 257.1 7.5 256 7.5H176C174.9 7.5 174 6.6 174 5.5V5Z"/>' +
    '<path class="ph4-isl" fill="#000" d="M154 48.5C154 38.28 162.28 30 172.5 30H259.5C269.72 30 278 38.28 278 48.5C278 58.72 269.72 67 259.5 67H172.5C162.28 67 154 58.72 154 48.5Z"/>' +
    '<circle cx="259.5" cy="48.5" r="10.5" fill="#0c0c11"/><circle cx="259.5" cy="48.5" r="5.5" fill="#1b1b24"/></svg>';
  function ph4(inner, clock, dark) {
    return '<div class="ph4"><div class="ph4-scr' + (dark ? ' dark' : '') + '"><div class="ph4-sb" aria-hidden="true"><span>' + esc(clock || '') + '</span>' + SB(dark) + '</div>' + inner + '</div>' + PH_FRAME + '</div>';
  }
  // last pass item 28 (2026-10-26): pc rings the Before value in the red pen, pcs only its grey second line (QuickBooks' "Not sent");
  // st draws QuickBooks' status mark before the word (ok its check, od its overdue mark, in the system's ok green and wt amber,
  // never red), and s, its grey second line, may change with the state too ("Card declined" to "Note drafted")
  var ringed = function (h, on) { return on ? '<span class="pc">' + h + '</span>' : h; };
  function cell(v) {
    if (v && typeof v === 'object') {
      // a ringed chip (Sheets' dropdown, QuickBooks' "Total only") is circled round its words, as a pen would, so the loop is the one
      // system.js fits 4px off the ink of any words (pencil()), not a box's CSS ring
      // the reviewers' round (owners judge): the chip's arrow poked out of the ring round its words, so a ringed chip carries its
      // arrow as a glyph inside the ring (.st-chev, shown only in Google Sheets, which draws one) and the loop is fitted round both
      var wv = v.pc && v.was && typeof v.was === 'object' && v.was.chip ? '<span class="st st-pc ' + (v.was.chip === 'nt' ? 'gy' : v.was.chip) + '"><span class="pc">' + esc(v.was.t) + '<span class="st-chev" aria-hidden="true">\u25BC</span></span></span>' : ringed(cell(v.was), v.pc);
      if ('was' in v || 'now' in v) return '<span class="chg' + (v.tr ? ' tr' : '') + '"><span class="was">' + wv + '</span><span class="now">' + cell(v.now) + '</span></span>';
      if (v.chip) return chip(v);
      var sm = v.s != null && v.s !== '' ? '<small>' + ringed(cell(v.s), v.pcs) + '</small>' : '';
      if (v.st) return '<span class="qs qs-' + v.st + '">' + cell(v.t) + '</span>' + sm;
      return cell(v.t) + sm;
    }
    return esc(v == null ? '' : v);
  }
  // two layers for one spot (the window's status line, the formula bar): the old value, then the new one in its place; with tr
  // (a status line, restaurants 2026-10-12) the old words stay, struck in pencil, as a cell's do: the pair's one pencil trace (R7)
  // last pass item 28 (2026-10-26): pcw names the words inside the old line the red pen circles ("Sent 10/01/2026" in a status line)
  // (the reviewers' round: a comma or colon right after the ringed words goes inside the ring, so no space opens before it)
  var was2 = function (v) { if (typeof v !== 'object') return whole(esc(v)); var w = whole(esc(v.was)), k = v.pcw && whole(esc(v.pcw)); if (k && w.indexOf(k) > -1) { var j = w.indexOf(k) + k.length, pu = /^[,:;.]/.test(w.charAt(j)) ? w.charAt(j) : ''; w = w.slice(0, w.indexOf(k)) + '<span class="pc">' + k + pu + '</span>' + w.slice(j + pu.length); }
    return '<span class="chg' + (v.tr ? ' tr' : '') + '"><span class="was">' + w + '</span><span class="now">' + whole(esc(v.now)) + '</span></span>'; };
  // 2026-10-17 round 3 (judges): a column of money, quantities or short counts is set right (.num, system.css), as .dt sets its
  // amounts, so decimals stack (Water damage stop 1's invoice). An ID (a ticket or job number, four digits or more) stays left. The
  // After values decide, since a Before value may be words ("Not added" in the markup column)
  var NUMV = /^[(\u2212-]?\$?\d[\d,]*(?:\.\d+)?\)?%?$/;
  var cellNow = function (v) { return v && typeof v === 'object' ? ('was' in v || 'now' in v ? cellNow(v.now) : String(v.t == null ? '' : v.t)) : String(v == null ? '' : v); };
  var numCol = function (P, i) { var vals = P.rows.map(function (r) { return cellNow(r.c[i]).trim(); }).filter(Boolean);
    return vals.length > 0 && vals.every(function (s) { return NUMV.test(s) && (/[.,%$(\u2212-]/.test(s) || /^\d{1,3}$/.test(s)); }); };
  function pairHTML(P) {
    // P.line: the app's own label over the caller (a business phone line shows calls and texts in one thread)
    // iPhone Messages (item 28): the number under its grey circle with iOS's small chevron (system.css .ph-n), a centred time over
    // a message (ts, "Today 11:21 AM") and the small grey line under the last one sent (dl, "Sent automatically", where iOS says
    // Delivered)
    if (P.frame === 'phone') return phoneOf()('<div class="ph-who">' + (P.line ? '<small class="ph-line">' + esc(P.line) + '</small>' : '') + '<i></i><span class="ph-n">' + esc(P.who) + '</span></div><div class="thread">' + P.msgs.map(function (m) {
      var o = m[2] || {}, cls = m[0] === 'sys' ? 'sys' + (o.k ? ' k' : '') : m[0] === 'ts' ? 'sys ts' : m[0] === 'dl' ? 'sys dl' : 'bub ' + (m[0] === 'sms' ? 'out sms' : m[0]);
      if (m[0] === 'ts' || m[0] === 'dl') return '<p class="' + cls + (o.add ? ' add' : '') + '">' + whole(esc(m[1])).replace(/^(Today|Hoy) /, '<b>$1</b> ') + '</p>';
      return '<p class="' + cls + (o.add ? ' add' : '') + (o.pc ? ' pc' : '') + '"' + (m[0] === 'sys' ? '' : ' data-ui-ok="nested-card a text bubble on the phone screen (R6): a message, not a box around content"') + '>' + whole(esc(m[1])) + '</p>'; }).join('') + '</div>', P.clock || '9:41');
    if (P.frame === 'mail') return mailHTML(P);
    // hm: a column (or, on a row, the row) the picture crops on a narrow container, as the screens kit does; nw: never wraps
    var NUM = P.cols.map(function (c, i) { return numCol(P, i); });
    var QB = P.view === 'list' || P.view === 'form', GS = P.tool === 'Google Sheets', OL = P.tool === 'Outlook' && P.folders;
    var cl = function (i, th, num) { var c = ((P.hm || []).indexOf(i) > -1 ? 'hm ' : '') + (!th && (P.nw || []).indexOf(i) > -1 ? 'nw ' : '') + (num && NUM[i] ? 'num' : ''); return c.trim() ? ' class="' + c.trim() + '"' : ''; };
    // QuickBooks' list types its column names in capitals (typed, never text-transform) and ends each row on its Action link, a
    // computer's column only (hm); Google Sheets marks the selected cell with its frame and the corner dot (P.sel: "D43")
    var ACT = P.view === 'list' && P.act, colName = function (c) { return P.view === 'list' ? String(c).toUpperCase() : c; };
    // QuickBooks' form numbers its lines in a first "#" column (a computer's only, hm), as its invoice, estimate and bill do
    var NO = P.view === 'form';
    var head = (P.xls ? '<tr class="cl"><td></td>' + P.cols.map(function (c, i) { return '<td' + cl(i, 1) + '>' + 'ABCDEFG'.charAt(i) + '</td>'; }).join('') + '</tr>' : '') +
      '<tr>' + (P.xls ? '<td>1</td>' : '') + (NO ? '<th class="hm qb-no num">#</th>' : '') + P.cols.map(function (c, i) { return '<th' + cl(i, 1, 1) + '>' + esc(colName(c)) + '</th>'; }).join('') + (ACT ? '<th class="hm qb-act">' + tr('ACTION', 'ACCIÓN') + '</th>' : '') + '</tr>';
    var body = P.rows.map(function (r, ri) { var rc = ((r.n ? 'n ' : '') + (r.hm ? 'hm ' : '') + (r.tot ? 'tot' : '')).trim(); return '<tr' + (rc ? ' class="' + rc + '"' : '') + '>' + (P.xls ? '<td>' + esc(r.r) + '</td>' : '') + (NO ? '<td class="hm qb-no num">' + (r.tot ? '' : ri + 1) + '</td>' : '') +
      r.c.map(function (v, i) { var sel = GS && P.sel === 'ABCDEFG'.charAt(i) + r.r; return '<td' + (sel ? cl(i, 0, 1).replace(/^$/, ' class=""').replace(/class="/, 'class="gs-sel ') : cl(i, 0, 1)) + '>' + cell(v) + '</td>'; }).join('') +
      (ACT ? '<td class="hm nw qb-act">' + (ACT[ri] ? tr('Edit', 'Editar') + ' <i>|</i> ' + cell(ACT[ri].t != null ? ACT[ri].t : ACT[ri]) : '') + '</td>' : '') + '</tr>'; }).join('');
    var badge = P.badge ? '<p class="pair-badge">' + (P.badge.was ? '<span class="was">' + esc(P.badge.was) + '</span>' : '') + (P.badge.now ? '<span class="now ok">✓ ' + esc(P.badge.now) + '</span>' : '') + '</p>' : '';
    // the software's own furniture, present in both states so the frame never has an empty band (design review 2026-10-10):
    // a spreadsheet's formula bar (the selected cell, then "fx") and its sheet tabs with "Ready"; an app list's status line
    var fx = P.fx ? '<div class="xl-fx"><span class="fx-c">' + esc(P.fx.cell) + '</span><b>fx</b>' + was2({ was: P.fx.was, now: P.fx.now }) + '</div>' : '';
    // Google Sheets has no "Ready" (noReady) and opens its tab bar on a "+"
    var tabs = P.tabs ? '<div class="xl-tabs">' + (GS ? '<b class="gs-add" aria-hidden="true">+</b>' : '') + P.tabs.map(function (t, i) { return '<span' + (i ? '' : ' class="on"') + '>' + esc(t) + '</span>'; }).join('') + (P.noReady ? '' : '<em>' + tr('Ready', 'Listo') + '</em>') + '</div>' : '';
    // QuickBooks' list ends on its count ("1-3 of 3"; "1-3 of 24" when the list runs past the page, P.of: the reviewers' round,
    // Pest's 3 rows under "24 declined"), with our status line on the left of the same row. Its form ends on its own buttons,
    // "Save and close" and the filled "Review and send" (an invoice or estimate) or "Save and close" alone (a bill), the filled one
    // in ink, never QuickBooks' green (owners judge: only the title bar said QuickBooks on the forms; Intuit's trademark page asks
    // that its logo's colours not be used)
    var qbBtns = P.view === 'form' ? '<span class="qb-btns" aria-hidden="true">' + (/^(bill|factura de proveedor)$/i.test(P.doc || '') ? '<b>' + tr('Save and close', 'Guardar y cerrar') + '</b>' :
      '<span>' + tr('Save and close', 'Guardar y cerrar') + '</span><b>' + tr('Review and send', 'Revisar y enviar') + '</b>') + '</span>' : '';
    var status = P.status ? '<p class="win-st' + (P.view === 'list' || qbBtns ? ' qb-foot' : '') + '">' + (P.view === 'list' ? '<span>' + was2(P.status) + '</span><span class="qb-n">1-' + P.rows.length + ' ' + tr('of', 'de') + ' ' + (P.of || P.rows.length) + '</span>' : qbBtns ? '<span>' + was2(P.status) + '</span>' + qbBtns : was2(P.status)) + '</p>' : '';
    var grid = P.xls ? '<div class="xl' + (GS ? ' gs' : '') + '">' + fx + '<table>' + head + body + '</table>' + tabs + '</div>' : '<div class="ptbl"><table>' + head + body + '</table></div>';
    // QuickBooks' list: its two tabs over the table, the page's in ink. Its form: the document's own word ("ESTIMATE", "INVOICE",
    // "Bill") and the line under it, the table, the Billable line a bill carries, then the status line where its activity shows
    if (P.view === 'list') grid = '<div class="qb-tabs">' + (P.apptabs || []).map(function (t, i) { return '<span' + (i === (P.on || 0) ? ' class="on"' : '') + '>' + esc(t) + '</span>'; }).join('') + '</div>' + grid;
    // The reviewers' round (owners judge): its balance due large at the top right, as QuickBooks sets it (the total row's label and
    // amount, or P.due), on a computer's picture; a phone's keeps the total row alone, so the picture is no taller
    var totR = P.rows.filter(function (r) { return r.tot; })[0], due = P.due || (totR && totR.c[totR.c.length - 1]),
      dueL = P.dueLabel || (totR ? cellNow(totR.c[0]) : tr('Balance due', 'Saldo pendiente'));
    if (P.view === 'form') grid = '<div class="qb-h"><div class="qb-hl"><p class="qb-doc">' + esc(P.doc || '') + '</p>' + (P.meta ? '<p class="qb-meta">' + was2(P.meta) + '</p>' : '') + '</div>' +
      (due ? '<p class="qb-due"><small>' + esc(dueL) + '</small><b>' + cell(due) + '</b></p>' : '') + '</div>' + grid +
      (P.billable ? '<p class="qb-bill">' + was2(P.billable) + '</p>' : '');
    // Outlook: its folder pane beside the list on a computer (system.css shows it in a picture 640px wide and up)
    if (OL) grid = '<div class="ol"><ul class="ol-f" aria-hidden="true">' + P.folders.map(function (f, i) { return '<li' + (i === (P.on || 0) ? ' class="on"' : '') + '>' + esc(f) + '</li>'; }).join('') + '</ul><div class="ol-m">' + grid + '</div></div>';
    return '<div class="scr-win' + (QB ? ' qb qb-' + P.view : GS ? ' gsw' : OL ? ' olw' : '') + '"><div class="win-tb"><i></i><i></i><i></i><span>' + esc(P.title) + '</span></div><div class="win-b">' + grid + status + badge + '</div></div>';
  }
  // Gmail (item 28): one email, as Gmail opens it: the subject as its heading, the sender's grey initial, their name in bold with
  // "to me" under it and the date at the right, the message, a table where the email carries one, the attachment, a draft reply as a
  // plain grey box (never Gmail's red Draft), then Reply and Forward as outline buttons
  function mailHTML(P) {
    var who = String(P.from || ''), ini = who.charAt(0).toUpperCase(),
      body = (P.body || []).map(function (para) { return '<p>' + para.map(function (x) { return typeof x === 'object' ? cell(x) : whole(esc(x)); }).join('') + '</p>'; }).join(''),
      tbl = P.rows && P.rows.length ? '<div class="ptbl gm-t"><table>' + P.rows.map(function (r) { return '<tr' + (r.n ? ' class="n"' : '') + '>' + r.c.map(function (v, i) { return '<td' + (i === r.c.length - 1 ? ' class="num nw"' : '') + '>' + cell(v) + '</td>'; }).join('') + '</tr>'; }).join('') + '</table></div>' : '',
      att = P.attach ? '<p class="gm-att">' + esc(P.attach) + '</p>' : '',
      draft = P.draft ? '<p class="gm-draft add">' + esc(P.draft) + '</p>' : '',
      btns = '<p class="gm-btns"><span>' + tr('Reply', 'Responder') + '</span>' + (P.noForward ? '' : '<span>' + tr('Forward', 'Reenviar') + '</span>') + '</p>';
    return '<div class="scr-win gmw"><div class="win-tb"><i></i><i></i><i></i><span>' + esc(P.title) + '</span></div><div class="win-b gm">' +
      '<p class="gm-subj">' + was2(P.page || '') + '</p><div class="gm-from"><span class="gm-av" aria-hidden="true">' + esc(ini) + '</span><p><b>' + esc(who) + '</b><small>' + esc(P.to || '') + '</small></p><span class="gm-when">' + whole(esc(P.when || '')) + '</span></div>' +
      '<div class="gm-body">' + body + tbl + '</div>' + att + draft + btns + (P.status ? '<p class="win-st">' + was2(P.status) + '</p>' : '') + '</div></div>';
  }
  L.render = { ghost: ghostSVG, real: realHTML, whiteboard: whiteboardHTML, recents: recentsHTML, pair: pairHTML, phone: ph4 };
  // the measured iPhone 15 (system.css 28) round a lock screen's own words: Home's night band since 2026-10-17 (data-iph on the band),
  // so Home shows one phone, the same device as its strip (craft judge: the strip's iPhone and the night band's drawn frame, four
  // screens apart, read as two phones). The status bar, padlock, flashlight, camera and home bar are the strip phone's markup.
  // The trade pages keep the drawn .ph4 until Phase D.
  var IPH_TOP = '<span class="iph-isl"></span><div class="iph-sb"><span class="iph-sb-r"><svg class="iph-cell" viewBox="0 0 19.2 12.33" aria-hidden="true"><rect x="0" y="7.33" width="3" height="5" rx=".9"/><rect x="5.4" y="5.33" width="3" height="7" rx=".9"/><rect x="10.8" y="2.66" width="3" height="9.67" rx=".9"/><rect x="16.2" y="0" width="3" height="12.33" rx=".9"/></svg><svg class="iph-wifi" viewBox="0 0 17.14 12.33" aria-hidden="true"><g stroke="currentColor" stroke-width=".6" stroke-linejoin="round"><path d="M0.30 3.73A11.70 11.70 0 0 1 16.84 3.73L15.46 5.11A9.75 9.75 0 0 0 1.68 5.11Z"/><path d="M2.98 6.41A7.90 7.90 0 0 1 14.16 6.41L12.78 7.79A5.95 5.95 0 0 0 4.36 7.79Z"/><path d="M8.57 12.00L5.67 9.10A4.10 4.10 0 0 1 11.47 9.10Z"/></g></svg><svg class="iph-batt" viewBox="0 0 27.33 13" aria-hidden="true"><rect x=".5" y=".5" width="24" height="12" rx="3.8" fill="none" stroke="currentColor" stroke-opacity=".35"/><rect x="2" y="2" width="16.4" height="9" rx="2.4"/><path d="M25.83 4.5v4c.8-.34 1.33-1.1 1.33-2s-.53-1.66-1.33-2z" fill-opacity=".4"/></svg></span><i class="iph-grab"></i></div><svg class="iph-padlock" viewBox="0 0 11 15" aria-hidden="true"><path d="M2.7 6.6V4.4a2.8 2.8 0 0 1 5.6 0v2.2" fill="none" stroke="#fff" stroke-width="1.5"/><rect x=".5" y="6.3" width="10" height="8.2" rx="1.8" fill="#fff"/></svg>',
    IPH_FOOT = '<span class="iph-qb l"><svg class="fl" viewBox="0 0 11.3 25.7" aria-hidden="true"><path fill="#fff" fill-rule="evenodd" d="M1.2 0h8.9c.7 0 1.2.5 1.2 1.2v2.6H0V1.2C0 .5.5 0 1.2 0zM0 4.8h11.3l-1.6 3.6v15.3c0 1.1-.9 2-2 2H3.6c-1.1 0-2-.9-2-2V8.4zM5.65 11.6c-.7 0-1.2.5-1.2 1.2v3.4c0 .7.5 1.2 1.2 1.2s1.2-.5 1.2-1.2v-3.4c0-.7-.5-1.2-1.2-1.2z"/></svg></span><span class="iph-qb r"><svg class="cm" viewBox="0 0 22.3 17.7" aria-hidden="true"><path fill="#fff" fill-rule="evenodd" d="M7.6 0h7.1c.6 0 1.1.3 1.4.8l1.1 1.8h2.1c1.7 0 3 1.3 3 3v9.1c0 1.7-1.3 3-3 3H3c-1.7 0-3-1.3-3-3V5.6c0-1.7 1.3-3 3-3h2.1L6.2.8C6.5.3 7 0 7.6 0zM11.15 4.6a5.6 5.6 0 1 0 0 11.2a5.6 5.6 0 1 0 0-11.2zM11.15 6.3a3.9 3.9 0 1 1 0 7.8a3.9 3.9 0 1 1 0-7.8zM18.6 5.1a1.05 1.05 0 1 0 0 2.1a1.05 1.05 0 1 0 0-2.1z"/></svg></span><i class="iph-home"></i>';
  function iph(inner) { return '<div class="iph" aria-hidden="true"><div class="iph-dev"><i></i><i></i><i></i><i></i><div class="iph-scr iph-lock">' + IPH_TOP + inner + IPH_FOOT + '</div></div></div>'; }
  L.render.iph = iph;
  // 2026-10-17 round 3 (Phase D's one phone, done early on the trade pages): a page that shows the measured iPhone in its night band
  // ([data-iph]) draws its stop phones in it too, as a light Messages screen with the status bar's time, the same thread as before
  // (system.css .iph-msg). Lumora.lint fails a [data-iph] page that still shows the drawn .ph4
  var IPH_SBR = IPH_TOP.slice(IPH_TOP.indexOf('<span class="iph-sb-r">'), IPH_TOP.indexOf('<i class="iph-grab">'));
  function iphMsg(inner, clock) { return '<div class="iph" aria-hidden="true"><div class="iph-dev"><i></i><i></i><i></i><i></i><div class="iph-scr iph-msg" data-ui-ok="nested-card a text thread: the bubbles are the messages on the one phone screen (R6), not boxes around content"><span class="iph-isl"></span><div class="iph-sb"><time>' + esc(clock || '9:41') + '</time>' + IPH_SBR + '</div>' + inner + '<i class="iph-home"></i></div></div></div>'; }
  L.render.iphMsg = iphMsg;
  var phoneOf = function () { return document.querySelector('[data-iph]') ? iphMsg : ph4; };

  /* ================================================================ binders: everything the trade choice rewrites */
  // the walk opens on its number (Franco 2026-10-19, design round item 3; carried from Home to the eight trade pages by the picks
  // follow-up the same day): "Our sample shop, Dunlin Plumbing, loses $2,710 a month. Here's where." One writer for Home's picker
  // and every trade page, reading the sheet's own total, so the heading can't drift from the sheet under it. The word sample sits
  // in the heading (it is the section's sample lead, Lumora.lint R8; owner judge: a skim of the headings never reached the intro),
  // the figure is red with its loss word beside it (check.py MONEY_JS), and each business is called what its page calls it
  // (lane 3b, 2026-10-18: roofers, pest control and restoration owners say company). The Spanish is written in Spanish, usted, its
  // short words bound (item 6). check.py: Home's item 3 checks and walk_head_problems on the trade pages
  function walkHead(el, t) {
    var h = el.querySelector('[data-walk-head]'); if (!h || !t || !t.rows) return;
    var s = (t.short || '').split(',')[0], hx = function (x) { return String(x).replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
    var who = ES ? (/^Restaurante/.test(s) ? 'Nuestro restaurante' : /^Agencia/.test(s) ? 'Nuestra agencia' : /^Control de plagas/.test(s) ? 'Nuestra compañía'
      : /^Daños/.test(s) ? 'Nuestra empresa' : 'Nuestro negocio') + ' de\u00a0ejemplo'
      : 'Our sample ' + (t.per === 'yr' ? 'business' : /^Restaurant/.test(s) ? 'restaurant' : / agency$/i.test(s) ? 'agency'
      : /^(?:Roofing|Pest control|Restoration)$/.test(s) ? 'company' : 'shop');
    h.innerHTML = who + ', ' + hx(t.shop) + (ES ? ', pierde ' : ', loses ') + '<span class="walk-h-usd">' + money(total(t)) + '\u00a0' + perWord(t).replace(/ /g, '\u00a0') + '</span>' +
      (ES ? '. Le\u00a0mostramos dónde.' : '. Here\'s where.');
  }
  var shown = {};
  var BIND = {
    sheet: function (el, t, animate) {
      var f = function (k) { return el.querySelector('[data-f="' + k + '"]'); };
      // 2026-10-15: "2 / trucks" never splits (no-break space). Design round picks, 2026-10-19 (item 1): the place after the short
      // business line sits in span.sh-at, so a trade page's phone reads "Plumbing, 2 trucks" and the Spanish line keeps one line
      if (f('sub')) { var sb = t.sub.replace(/(\d) /g, '$1\u00a0'), so = (t.short || '').replace(/(\d) /g, '$1\u00a0'), hx = function (s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); };
        if (so && sb.length > so.length && sb.indexOf(so) === 0) f('sub').innerHTML = hx(so) + '<span class="sh-at">' + hx(sb.slice(so.length)) + '</span>'; else f('sub').textContent = sb; }
      // 2026-10-17: the money column says what its figures are, a loss ("A month" read as a price list)
      if (f('per')) f('per').textContent = t.per === 'yr' ? tr('Lost a year', 'Pérdida al año') : tr('Lost a month', 'Pérdida al mes');
      var ringOn = el.hasAttribute('data-ring'), short = el.hasAttribute('data-short');   // data-short (v4, R9): the row's one short formula
      if (f('rows')) f('rows').innerHTML = t.rows.map(function (r, i) {
        // 2026-10-16 (p1-final): a count keeps its word, so "48+ hours" never splits over two lines
        return '<li style="--i:' + i + '" data-task="' + (TASK[r.icon] || r.icon) + '"><div class="sh-l"><b>' + esc(r.b).replace(/(\d\+?) (?=\S)/g, '$1\u00a0') + '</b><small>' + esc(short && r.fs ? r.fs : r.f) + '</small></div><span class="sh-usd">' + money(r.usd) + (i === 0 && ringOn ? RING_SVG : '') + '</span></li>'; }).join('');
      if (f('total')) f('total').textContent = money(total(t)) + perShort(t);
      // one short line for screen readers when the owner picks another trade (the sheet itself is not a live region: a pick
      // used to read out about 50 changed words). Empty on load, so nothing is announced before he chooses.
      if (f('live') && animate) f('live').textContent = tr('Sample business: ', 'Negocio de ejemplo: ') + t.name + ', ' + money(total(t)) + ' ' + perWord(t) + tr(' lost before any fix.', ' que pierde hoy, antes de arreglar nada.');
      // 2026-10-17 round 2 (Franco's iPhone): "your office:" keeps together (WebKit broke it "your / office:"); system.css keeps the figure whole
      var tm = f('time'); if (tm) { tm.hidden = !t.time; if (t.time) tm.innerHTML = tr('Time back for you or your\u00a0office: ', 'Usted o su oficina se ahorran ') + '<b>' + esc(t.time) + '</b>'; }
      // the line about where the numbers come from. 2026-10-16 (p1-final round 2) it named each trade's own records from its
      // morning list's foot; since the promise audit (2026-10-23, D38) it says "your own records" for every pick, because a list of
      // record types read as a method he is bound to. Each trade's records stay in its night log's foot, a sample picture
      var nt = f('note'); if (nt) { if (nt._base == null) nt._base = nt.textContent; nt.textContent = nt._base; }
      $$('.pen-ring', el).forEach(ring);
      // checkers' pass (2026-10-24): when the figures roll (digits-roll) the sheet holds still and the digits are the one motion. Its
      // rise starts at opacity 0, so the roll's first 100ms showed the brown board through a dark sheet. A pick that changes plainly
      // (NumberFlow not ready in time) still rises: rollFigures() takes .nf-still off then
      if (animate && !still) { el.classList.remove('writing', 'swap'); void el.offsetWidth; el.classList.add('swap'); el.classList.toggle('nf-still', rolling); } // job: cause and effect
    },
    // the hero strip has no shop name beside it, so "Plumbing, 2 trucks" read as a list (Franco 2026-10-15: "whats meant by
    // plumbing 2 trucks"). Both languages say the size as a phrase; the Spanish one is written from the idea (Friday run,
    // 2026-10-16): "Un pequeño negocio de plomería con 2 camionetas"
    strip: function (el, t) {
      function stripSize(t) {
        if (ES) {
          var e = /^(.*), (\d+) (.+)$/.exec(t.short); if (!e) return t.short;
          if (t.per === 'yr') return 'Una administradora de propiedades con ' + e[2] + ' unidades';
          if (/^Restaurante/.test(e[1])) return 'Un restaurante y bar con capacidad para ' + e[2] + ' personas';
          if (/^Daños/.test(e[1])) return 'Una pequeña empresa de daños por agua con ' + e[2] + ' ' + e[3];
          if (/^Control de plagas$/.test(e[1])) return 'Una pequeña compañía de ' + e[1].toLowerCase() + ' con ' + e[2] + ' ' + e[3];   // lane 3b, 2026-10-18
          return 'Un pequeño negocio de ' + e[1].charAt(0).toLowerCase() + e[1].slice(1) + ' con ' + e[2] + ' ' + e[3];
        }
        var m = /^(.*), (\d+) (\w+?)s?$/.exec(t.short); if (!m) return t.short;
        // Franco asked again what "2 trucks" meant, so the size says "small" outright and keeps the owner's own word:
        // "A small plumbing shop with 2 trucks"; "A property manager with 212 rentals" (doors is jargon too)
        var trade = /^[A-Z]{2}/.test(m[1]) ? m[1] : m[1].charAt(0).toLowerCase() + m[1].slice(1);
        if (t.per === 'yr') return 'A property manager with ' + m[2] + '\u00a0rentals';   // 2026-10-15: no-break space, the count stays with its noun
        if (/^Restaurant/.test(m[1])) return (/^(8\d*|11|18)$/.test(m[2]) ? 'An ' : 'A ') + m[2] + '-' + m[3] + ' restaurant and bar';
        // agency pass 2026-10-18 (lane 3b): roofers, pest control operators and restoration owners call their business a company
        return 'A small ' + trade + (/^(Roofing|Pest control|Restoration)$/.test(m[1]) ? ' company' : ' shop') + ' with ' + m[2] + '\u00a0' + m[3] + (m[2] === '1' ? '' : 's');
      }
      var s = function (k) { return el.querySelector('[data-s="' + k + '"]'); }, r = t.rows[0];
      if (s('sub')) s('sub').textContent = stripSize(t); if (s('leak')) s('leak').textContent = keepCounts(r.b);
      // 2026-10-17: "Losing" in ink beside the red figure, so the figure never reads as a price
      // resume pass 2026-10-19 (both judges: a trade hero on a phone stood still for its first 4 s): the figure wears the walk's red pen
      // underline, drawn once when the card is in view (initDraw; system.css delays it to 0.8 s). One pen ring a page still holds
      // the figure keeps one line (no-break spaces); where it doesn't fit beside "Losing", it goes under it whole
      if (s('usd')) s('usd').innerHTML = '<span class="loss-k">' + tr('Losing', 'Pierde') + '</span> <span class="su">' + (money(r.usd) + perShort(t)).replace(/ /g, ' ') + UNDER_SVG + '</span>'; if (s('f')) s('f').textContent = keepCounts(r.f);
      if (el.tagName === 'A') el.href = '#' + ($('[data-bind=sheet]') ? $('[data-bind=sheet]').id || 'sheet' : 'sheet');
    },
    text: function (el, t) { var v = t[el.getAttribute('data-field')]; if (v != null) el.textContent = v; },
    // the trade index (Industries v4, 2026-10-12): each [data-t] row gets its trade's one-problem line (line: the hero-one under the
    // h1 on that trade's own page; check.py fails the two if they drift) and the top line of its sample sheet with the dollars, as
    // Home's Who we work with reads it, so nothing on the index is typed. The row takes that sheet row's task tag (R1). The shop
    // size is home.js size()'s. A Spanish page keeps its prerendered words until trades-src-es.json carries a Spanish line.
    // The sample line opens "From the sample sheet for a 2-crew shop:" so it reads as its own item, never as the price of the
    // one-problem line above it (Industries review, 2026-10-12: roofing's $771 depreciation row sat under the decking line, and
    // decking is its own $689 row). A trailing number keeps its word ("day 30").
    index: function (el) {
      $$('[data-t]', el).forEach(function (li) {
        var t = D[li.getAttribute('data-t')], r = t && t.rows[0]; if (!r) return;
        var one = li.querySelector('[data-f="one"]'), leak = li.querySelector('[data-f="leak"]'), m = /, (\d+) (\w+?)s?$/.exec(t.short) || [],
          kind = t.per === 'yr' ? 'property manager' : /^Restaurant/.test(t.short) ? 'restaurant and bar' : 'shop';
        // round 4 (2026-10-18): the property manager's units are rentals, said as the strip says them, never "a 212-rental property manager"
        var who = t.per === 'yr' && m[1] ? 'property manager with ' + m[1] + '\u00a0' + m[2] + 's' : (m[1] ? m[1] + '-' + m[2] + ' ' : '') + kind;
        li.setAttribute('data-task', TASK[r.icon] || r.icon);
        if (one) one.textContent = t.line;
        // Spanish (Friday run, 2026-10-16): trades-src-es.json now carries each trade's line, so the index binds in both
        if (ES) {
          var me = /, (\d+) (.+)$/.exec(t.short) || [], qui = t.per === 'yr' ? 'una administradora de propiedades con ' :
            /^Restaurante/.test(t.short) ? 'un restaurante y bar con capacidad para ' : 'un negocio con ';
          if (leak) leak.innerHTML = 'De la hoja de ejemplo de ' + qui + (me[1] ? me[1] + ' ' + (/^Restaurante/.test(t.short) ? 'personas' : me[2]) : '') + ': ' +
            esc(r.b.charAt(0).toLowerCase() + r.b.slice(1).replace(/ (\d+)$/, '\u00a0$1')) + ', una pérdida de <b class="loss">' + money(r.usd) + perShort(t) + '</b>.';
          return;
        }
        // 2026-10-17: the figure is red and says it is a loss ("losing"), so it never reads as the price of the line above
        if (leak) leak.innerHTML = 'From the sample sheet for a ' + who + ': ' + esc(r.b.charAt(0).toLowerCase() + r.b.slice(1).replace(/ (\d+)$/, '\u00a0$1')) + ', losing <b class="loss">' + money(r.usd) + perShort(t) + '</b>.';
      });
    },
    bigfig: function (el, t) {
      var f = function (k) { return el.querySelector('[data-f="' + k + '"]'); }, sum = total(t);
      rollTo(f('n'), shown.big, sum, money); shown.big = sum;
      if (f('per')) f('per').textContent = perWord(t);
      if (f('sub')) f('sub').textContent = t.sub.replace(/(\d) /g, '$1\u00a0');   // 2026-10-15: no-break space after a count
      // a page may give the line its own lead (data-lead; the generalist Home's reviewers' round, 2026-10-30): Home's walk end says
      // "Time back for Sanderling's office:" in place of a second Sample stamp, the film's own just above it
      var lead = f('time') && f('time').getAttribute('data-lead');
      if (f('time')) { f('time').hidden = !t.time; if (t.time) f('time').innerHTML = (lead ? esc(lead) : tr('Time back for you or your\u00a0office: ', 'Usted o su oficina se ahorran ')) + '<b>' + esc(t.time) + '.</b>'; }   // space pass fixes (2026-10-25): the period inside the <b>, so Home's 32px time back on a computer has no small dot hanging at its baseline
      if (f('eq')) f('eq').innerHTML = t.rows.map(function (r, i) { return (i ? '<i>+</i>' : '') + '<span>' + money(r.usd) + ' <small>' + esc(r.b.charAt(0).toLowerCase() + r.b.slice(1)) + '</small></span>'; }).join('') +
        '<i>=</i><span class="r">' + money(sum) + ' <small>' + perWord(t) + '</small></span>';
      $$('.pen-ring', el).forEach(function (s) { requestAnimationFrame(function () { ring(s); }); });
    },
    walk: function (el, t, animate) {
      walkHead(el, t);
      // v4 (R7): same-object stops. Picks gate 2026-10-19: a trade with pairs only (property managers, offices) has no ghost to real
      // picture, so it is walked as pairs on the old walk too (the catalog threw on Property managers)
      if (el.getAttribute('data-walk') === 'pairs' || t.rows.some(function (r) { return !r.after; })) return walkPairs(el, t, animate);
      var list = el.querySelector('[data-f="stops"]'); if (!list) return;
      list.innerHTML = t.rows.map(function (r, i) {
        var id = 'stop-' + (i + 1);
        return '<li class="stop page" id="' + id + '" data-usd="' + r.usd + '" data-place="' + esc(r.place) + '">' +
          '<p class="tab"><span class="tab-n">' + (i + 1) + '</span>Stop ' + (i + 1) + ' · ' + esc(r.place) + '</p><h3>' + esc(r.b) + '</h3>' +
          '<div class="stop-body"><div class="pic"><div class="g2r" data-g2r data-state="after" role="img" aria-label="' + esc(altAfter(r.after)) + '" data-label-before="' + esc(altBefore(r)) + '" data-label-after="' + esc(altAfter(r.after)) + '">' +
          '<div class="before">' + beforeHTML(r) + '</div><div class="after">' + realHTML(r.after) + '</div></div><span class="samp">Sample</span></div>' +
          '<div class="stop-notes"><p class="pencil">' + esc(r.note) + '</p>' +
          '<p class="find"><span class="find-usd money">' + money(r.usd) + ' ' + perWord(t) + UNDER_SVG + '</span><span class="find-f">' + esc(r.f) + '</span></p>' +
          '<p class="fixline"><b>Fix:</b> ' + esc(r.fix) + '</p>' +
          '<div class="seg" role="group" aria-label="Show stop ' + (i + 1) + '"><button type="button" data-show="before" aria-pressed="false">As we find it</button><button type="button" data-show="after" aria-pressed="true">Fixed</button></div>' +
          '</div></div></li>'; }).join('');
      var tl = el.querySelector('[data-tally]');
      if (tl) {
        var ol = tl.querySelector('ol'); if (ol) ol.innerHTML = t.rows.map(function (r, i) { return '<li data-i="' + i + '"><span>' + esc(r.place) + '</span><b>' + money(r.usd) + '</b></li>'; }).join('');
        var sub = tl.querySelector('[data-f="tsub"]'); if (sub) sub.textContent = (t.shop + ', ' + t.short.split(', ').slice(1).join(', ')).replace(/(\d) /g, '$1\u00a0');   // 2026-10-15: no-break space after a count
      }
      var plan = el.querySelector('[data-f="plan-sub"]'); if (plan) plan.textContent = t.shop;
      initG2R(list, animate); initDraw(list); tally.bind(el, t);
    },
    night: function (el, t) {
      var nts = el.querySelector('.nts'); if (!nts) return;
      var PH = '<svg viewBox="0 0 16 16" width="17" height="17"><path fill="#fff" d="M3.6 6.7a8 8 0 0 0 5.7 5.7l1.4-1.4c.2-.2.5-.3.7-.2.7.3 1.5.4 2.3.4.4 0 .7.3.7.7v2.2c0 .4-.3.7-.7.7A11.5 11.5 0 0 1 2 3.1c0-.4.3-.7.7-.7h2.2c.4 0 .7.3.7.7 0 .8.1 1.6.4 2.3.1.2 0 .5-.2.7z"/></svg>',
        MS = '<svg viewBox="0 0 16 16" width="17" height="17"><path fill="#fff" d="M8 2.2c3.6 0 6.4 2.3 6.4 5.2S11.6 12.6 8 12.6c-.7 0-1.3-.1-1.9-.2L3 14l.8-2.7C2.4 10.4 1.6 9 1.6 7.4 1.6 4.5 4.4 2.2 8 2.2z"/></svg>',
        LS = '<svg viewBox="0 0 16 16" width="17" height="17"><path fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" d="M5.5 4.5h7M5.5 8h7M5.5 11.5h7M2.8 4.5h.4M2.8 8h.4M2.8 11.5h.4"/></svg>';
      // one night, told the same way in every place: these numbers and times match each trade's morning log in trades.js
      var N = [['cb', LS, 'Callback list for 7:30', '', '2 callers, both texted back within a minute.', ''],
        ['', PH, 'Missed Call', '6:38 AM', '(352) 555-0148', 'Texted back · 6:39 AM'],
        ['', MS, '(352) 555-0148', '3:06 AM', t.night, 'On the callback list'],
        ['', PH, 'New Voicemail', '3:04 AM', '(352) 555-0148 · 0:41', 'On the callback list'],
        ['', PH, 'Missed Call', '3:02 AM', '(352) 555-0148', 'Texted back · 3:03 AM'],
        ['', PH, 'Missed Call', '11:48 PM', '(352) 555-0119', 'Texted back · 11:49 PM']];
      nts.innerHTML = N.map(function (n) { return '<div class="nt ' + n[0] + '"><span class="ap" aria-hidden="true">' + n[1] + '</span><div><p class="nr"><b>' + esc(n[2]) + '</b>' + (n[3] ? '<span>' + n[3] + '</span>' : '') + '</p><p>' + esc(n[4]) + '</p>' + (n[5] ? '<span class="fx">↩ ' + esc(n[5]) + '</span>' : '') + '</div></div>'; }).join('');
      var lock = el.querySelector('.scr-lock');
      if (lock) lock.setAttribute('aria-label', 'Sample: a shop phone\'s lock screen at 6:41 a.m. Missed calls at 11:48 p.m., 3:02 a.m. and 6:38 a.m., a voicemail at 3:04 a.m. and a text at 3:06 a.m. that says "' + t.night + '" With the fix, each caller got a text back within a minute, and a 7:30 a.m. callback list sits on top.');
      loops.forEach(function (lp) { if (lp.el === el || el.contains(lp.el) || lp.el.contains(el)) lp.reset(); });
    },
    morning: function (el, t) {
      var m = t.morning; if (!m) return;
      var list = el.querySelector('[data-f="list"]');
      if (list) {
        list.innerHTML = '<div class="mo-h"><b>Morning list · ' + esc(t.shop) + '</b><span>' + esc(m.at) + '</span></div>' +
          m.lines.map(function (l, i) { return '<div class="mo-row' + (l[3] ? ' flag' : '') + '" style="--i:' + Math.min(i, 5) + '"><span class="l">' + esc(l[0]) + '</span><span class="v">' + esc(l[1]) + '</span>' + (l[2] ? '<span class="d">' + esc(l[2]) + '</span>' : '') + '</div>'; }).join('') +
          '<div class="mo-foot"><span>' + esc(m.src || 'From your own job list, invoices and call log') + '</span><span>Sample</span></div>';   // m.src: each trade names its own records
        list.setAttribute('role', 'img');
        list.setAttribute('aria-label', 'Sample morning list for ' + t.shop + ': ' + m.lines.map(function (l) { return l[0] + ', ' + l[1]; }).join('; ') + '.');
      }
      // a lock screen that opts in (data-f="date") shows the morning list's own day, so the two never disagree
      var day = el.querySelector('.lk-d[data-f="date"]'), md = /(\w{3}), (\w{3}) (\d+)/.exec(m.at), W = { Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday', Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday', Sun: 'Sunday' },
        MO = { Jan: 'January', Feb: 'February', Mar: 'March', Apr: 'April', Jun: 'June', Jul: 'July', Aug: 'August', Sep: 'September', Oct: 'October', Nov: 'November', Dec: 'December' };
      if (day && md) day.textContent = (W[md[1]] || md[1]) + ', ' + (MO[md[2]] || md[2]) + ' ' + md[3];
      var log = el.querySelector('[data-f="log"]');
      if (log) log.innerHTML = m.log.map(function (l) { return '<li><time>' + esc(l[0]) + '</time><span>' + esc(l[1]) + '</span></li>'; }).join('');
    },
    idx: function (el, t, animate, key) {
      $$('a[data-t]', el).forEach(function (a) {
        var tag = a.querySelector('.your'); if (tag) tag.remove();
        if (a.dataset.t === key && L.picked) { /* never "Your trade" on a guess: only once chosen, or on that trade's own page */ var b = a.querySelector('b'); if (b) b.insertAdjacentHTML('beforeend', '<span class="your">Your trade</span>'); }
      });
      showFig(el, key, false);
    },
    // v4 (R5, Home v4 2026-10-10): the night is office work. One lock screen with mixed notifications, one summary and at
    // most one call, its big clock always showing; the paper night log beside it, every row in place from the start so it
    // stays visible, filling in row by row. Restaurants and property managers get the log alone (no overnight lock screen).
    night4: function (el, t) {
      var N = t.night4, figs = el.querySelector('.n4-figs'); if (!N || !figs) return;
      var key = function (s) { var m = /(\d+):(\d+) ([AP]M)/.exec(s) || [0, 0, 0, 'AM'], h = (+m[1] % 12) + (m[3] === 'PM' ? 12 : 0); return (h * 60 + +m[2] + 360) % 1440; };   // minutes since 6 p.m.
      var seq = [], nRow = [], nNt = [];
      N.rows.forEach(function (r, i) { seq.push({ k: key(r[0]), nt: 0, i: i }); });
      N.nts.forEach(function (x, i) { seq.push({ k: key(x.at), nt: 1, i: i }); });
      seq.sort(function (a, b) { return a.k - b.k || a.nt - b.nt; }).forEach(function (s, j) { (s.nt ? nNt : nRow)[s.i] = j; });   // one clock: a log line, then its notification
      // the evening before the morning: rows stamped p.m. happened the night before N.date, so the log's head and the lock
      // screen's ticking date say so ("Sun night to Mon, Oct 5"; review 2026-10-10: a 9:40 PM row under "Mon, Oct 5" was Sunday)
      var d0 = new Date(N.date + ', 2026'), d1 = new Date(d0.getTime() - 864e5), lg = function (d) { return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }); };
      var eve = isNaN(d1) ? N.date : lg(d1), pm = N.rows.some(function (r) { return / PM$/.test(r[0]); });
      var head = N.date.replace(/^(\w{3})\w*, (\w{3})\w* (\d+)$/, '$1, $2 $3'), logDate = pm ? eve.slice(0, 3) + ' night to ' + head : head, day = N.date;
      if (ES && !isNaN(d1)) {   // "lunes, 5 de octubre", as a Spanish lock screen writes it; the log, short as the English: "Dom. a lun. 5 de oct."
        var dl = function (d) { return DIAS[d.getDay()] + ', ' + d.getDate() + ' de ' + MESES[d.getMonth()]; },
          ab = function (d) { return ['dom.', 'lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.'][d.getDay()]; },
          d5 = ab(d0) + ' ' + d0.getDate() + ' de ' + ['ene.', 'feb.', 'mar.', 'abr.', 'may.', 'jun.', 'jul.', 'ago.', 'sept.', 'oct.', 'nov.', 'dic.'][d0.getMonth()];
        day = dl(d0); eve = dl(d1); logDate = pm ? ab(d1) + ' a ' + d5 : d5; logDate = logDate.charAt(0).toUpperCase() + logDate.slice(1);
      }
      var lock = '', SAMP = '<span class="samp">' + tr('Sample', 'Ejemplo') + '</span>';
      if (N.lock) {
        var nts = N.nts.map(function (x, i) { return { x: x, i: i }; }).sort(function (a, b) { return key(b.x.at) - key(a.x.at); });   // newest on top, as a phone shows them
        // data-day / data-eve: the loop ticks the big clock through the night (9:40 ... 6:41) and the date line with it
        lock = '<div class="pic n4-phone"><div class="lk4 crop-m" data-day="' + esc(day) + '" data-eve="' + esc(eve) + '" role="img" aria-label="' + esc(tr('Sample: the shop phone\'s lock screen at 6:41 a.m., ', 'Ejemplo: la pantalla de bloqueo del teléfono del negocio a las 6:41 a. m., ') + day + '. ' +
          nts.map(function (o) { return o.x.t + ', ' + hora(o.x.at) + ': ' + o.x.p + (o.x.fx ? '. ' + o.x.fx : ''); }).join('. ') + '.') + '">' +
          (el.hasAttribute('data-iph') ? iph : function (s) { return ph4(s, '', true); })('<p class="lk4-d' + (el.hasAttribute('data-iph') ? ' iph-date' : '') + '" aria-hidden="true">' + esc(day) + '</p><p class="lk4-t' + (el.hasAttribute('data-iph') ? ' iph-clock' : '') + '" aria-hidden="true">6:41</p><div class="lk4-nts" aria-hidden="true">' + nts.map(function (o) {
            var x = o.x; return '<div class="lk4-nt" data-n="' + nNt[o.i] + '" data-t="' + esc(x.at) + '" data-task="' + x.task + '"><span class="ap ap-' + x.app.toLowerCase() + '">' + (APPS[x.app] || APPS.List) + '</span><div><p class="nr"><b>' + esc(x.t) + '</b><span>' + whole(esc(hora(x.at))) + '</span></p><p>' + esc(x.p) + '</p>' +
              (x.fx ? '<span class="fx">↩ ' + esc(x.fx) + '</span>' : '') + '</div></div>'; }).join('') + '</div>') + '</div>' + SAMP + '</div>';
      }
      figs.innerHTML = lock + '<div class="pic n4-paper"><div class="np"><div class="np-h"><b>' + esc(N.paper + ', ' + t.shop) + '</b><span>' + esc(logDate) + '</span></div><ol class="np-rows">' +
        N.rows.map(function (r, i) { return '<li data-n="' + nRow[i] + '" data-t="' + esc(r[0]) + '" data-task="' + r[2] + '"><time>' + whole(esc(hora(r[0]))) + '</time><span>' + whole(esc(r[1])) + '</span></li>'; }).join('') +
        '</ol><p class="np-foot">' + esc((t.morning && t.morning.src) || tr('From your own job list, invoices, bills and email', 'De su lista de trabajos, sus facturas, las facturas de proveedores y su correo')) + '</p></div>' + SAMP + '</div>';
      figs.classList.toggle('nolock', !N.lock);
      loops.forEach(function (lp) { if (lp.el === el || el.contains(lp.el) || lp.el.contains(el)) lp.reset(); });
      fitCrops();
    }
  };
  // a cropped phone (.crop-m) ends just under its last line (the callback list, the last notification it keeps), so
  // nothing sits in its 24px fade whatever the trade's words are (Home review 2026-10-10: a fixed crop faded the callback
  // line to 2:1 and cut the last notification in half). A notification still waiting to land sits 12px low (its slide-in),
  // so that offset is taken back out. The CSS height stays the no-JS fallback.
  function fitCrops() {
    $$('.crop-m').forEach(function (c) {
      var items = $$('.thread > *, .lk4-nt', c).filter(function (n) { return n.offsetParent; }), last = items[items.length - 1]; if (!last) return;
      var tf = getComputedStyle(last).transform, ty = tf && tf !== 'none' ? new DOMMatrixReadOnly(tf).m42 : 0;
      c.style.setProperty('--crop-h', Math.ceil(last.getBoundingClientRect().bottom - ty - c.getBoundingClientRect().top + 26) + 'px');
    });
  }
  L.fitCrops = fitCrops;
  // white app glyphs for the lock screen's notifications (v4)
  var APPS = {
    Phone: '<svg viewBox="0 0 16 16" width="16" height="16"><path fill="#fff" d="M3.6 6.7a8 8 0 0 0 5.7 5.7l1.4-1.4c.2-.2.5-.3.7-.2.7.3 1.5.4 2.3.4.4 0 .7.3.7.7v2.2c0 .4-.3.7-.7.7A11.5 11.5 0 0 1 2 3.1c0-.4.3-.7.7-.7h2.2c.4 0 .7.3.7.7 0 .8.1 1.6.4 2.3.1.2 0 .5-.2.7z"/></svg>',
    List: '<svg viewBox="0 0 16 16" width="16" height="16"><path fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" d="M5.5 4.5h7M5.5 8h7M5.5 11.5h7M2.8 4.5h.4M2.8 8h.4M2.8 11.5h.4"/></svg>',
    Files: '<svg viewBox="0 0 16 16" width="16" height="16"><path fill="#fff" d="M1.5 4.2c0-.8.6-1.4 1.4-1.4h3.3l1.5 1.6h5.4c.8 0 1.4.6 1.4 1.4v6.5c0 .8-.6 1.4-1.4 1.4H2.9c-.8 0-1.4-.6-1.4-1.4z"/></svg>',
    Mail: '<svg viewBox="0 0 16 16" width="16" height="16"><rect x="1.8" y="3.5" width="12.4" height="9" rx="1.6" fill="none" stroke="#fff" stroke-width="1.5"/><path d="M2.4 4.4L8 8.6l5.6-4.2" fill="none" stroke="#fff" stroke-width="1.5" stroke-linejoin="round"/></svg>',
    Calendar: '<svg viewBox="0 0 16 16" width="16" height="16"><rect x="2" y="3" width="12" height="11" rx="1.8" fill="none" stroke="#fff" stroke-width="1.5"/><path d="M2 6.5h12M5.2 1.8v2.6M10.8 1.8v2.6" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>'
  };
  // v4 walk (R7, R9): one stop per sheet row; a stop with an approved same-object pair shows it with Before / After buttons,
  // any other shows just its real screen (the plan's fallback, never a drawing). Each stop ends on its dollar figure and
  // its one short formula; the tally names the stops and ticks them off, with no figures of its own.
  // data-walk-formulas="off" on the walk (the trade pages, PLUMBING-INTEGRATE item 3): no formula under the stops. The sheet
  // already shows each one, and R9 deletes a repeat rather than hiding it, so it is never written (prerender.py copies none).
  function walkPairs(el, t, animate) {
    var list = el.querySelector('[data-f="stops"]'); if (!list) return;
    var noF = el.getAttribute('data-walk-formulas') === 'off';
    // data-walk-skip="ROW ID ..." on the walk: rows the page leaves off its walk and its tally. They stay on the sheet, and the
    // page's total line under the stops names them (property managers, 2026-10-12: the vendor bills row, for the 11,000px budget)
    var skip = (el.getAttribute('data-walk-skip') || '').split(/\s+/), rows = t.rows.filter(function (r) { return skip.indexOf(r.id) < 0; });
    // data-walk-rows="N" (the new Home, 2026-10-16): the walk shows the first N rows only. One stop has no number beside it and no
    // "Stop 1:" (a lone "1" read as a step of one), and its find line says what the figure is in each state: Lost / Won back
    var most = +el.getAttribute('data-walk-rows') || 0; if (most) rows = rows.slice(0, most);
    var one = rows.length === 1;
    // 2026-10-17 (Franco: "do we have to include them?"): a Sample tag sits by anything that looks like a real business's dollar
    // results. A stop picture with no dollar figure leaves its tag off where the walk's own lead names the sample business
    // ([data-sample-lead], "Dunlin Plumbing is a sample 2-truck shop."); its alt text still opens "Sample". Lint R8 holds it
    var sec = el.closest('section') || el, led = !!sec.querySelector('[data-sample-lead]'),
      usd = function (h) { return /\$\s?\d/.test(h.replace(/<[^>]*>/g, ' ')); };
    // a page's own stop (li.stop[data-own="ROW ID"], written in the page) stands where that row's stop would be: the row stays on
    // the sheet and its picture leaves the walk (PLUMBING-INTEGRATE item 37, C9; the AC page walks its change-out quote in place of
    // the phone, 2026-10-12). Read once from the page's own markup, so a re-render and the prerender keep it as written.
    // Checkers' pass (2026-10-24): an own stop marked data-own-trade belongs to that sample alone (Home's printed quotes list is
    // plumbing's). Keyed by row id only, Offices, whose first row is also "quotes", walked Plumbing's quotes list as its second stop,
    // numbered 1 and titled for Dunlin Plumbing, and its stops no longer added up to its total. A trade page's own stop has no mark
    // last pass item 26 (2026-10-26): an own stop that belongs to a sample other than the page's default sits in <template
    // data-own-stops> beside the list (Home's Plumbing quotes list, now that Offices is prerendered into the list); read the same way
    if (!el._own) { el._own = {}; el._ownT = {}; var keep = function (li) { var id = li.getAttribute('data-own'); el._own[id] = li.outerHTML; el._ownT[id] = li.getAttribute('data-own-trade'); };
      $$(':scope > li[data-own]', list).forEach(keep);
      $$('template[data-own-stops]', el).forEach(function (tp) { Array.prototype.forEach.call(tp.content.children, function (li) { if (li.matches('li[data-own]')) keep(li); }); }); }
    var ownFor = function (id) { return el._own[id] && (!el._ownT[id] || el._ownT[id] === L.trade) ? el._own[id] : null; },
      ownPlace = function (id) { var m = ownFor(id) && /data-place="([^"]*)"/.exec(ownFor(id)); return m && m[1]; };
    list.innerHTML = rows.map(function (r, i) {
      if (ownFor(r.id)) return ownFor(r.id);
      var P = r.pair, n = i + 1, task = TASK[r.icon] || r.icon, place = (P && P.place) || r.place;
      var crop = (P ? P.frame : r.after.frame) === 'phone' ? ' crop-m' : '';   // R6 crop option: on a phone only the thread's part of the phone shows
      var inner = P ? pairHTML(P) : realHTML(r.after, true), tag = !led || usd(inner);
      // last pass (2026-10-26): Home's walk (data-hold-first) holds its first stop on Before on a computer, as Plumbing's own stop 1 did
      var pic = P ? '<div class="pair' + crop + '" data-g2r data-pair' + (i === 0 && el.hasAttribute('data-hold-first') ? ' data-g2r-hold' : '') + ' data-state="after" role="img" aria-label="' + esc(P.alt.after) + '" data-label-before="' + esc(P.alt.before) + '" data-label-after="' + esc(P.alt.after) + '">' + inner + '</div>'
        : '<div class="solo' + crop + '" role="img" aria-label="' + esc(altAfter(r.after)) + '">' + inner + '</div>';
      // the stop's head is its pencil-circled number beside the PLACE in the shop ("The shop phone"), with the leak's name on
      // a plain line under it: a walk goes room by room, and a calls row never becomes a heading (R1; review 2026-10-10)
      // the Before / After buttons sit under the picture they switch, beside its Sample label
      return '<li class="stop page" id="stop-' + n + '" data-usd="' + r.usd + '" data-place="' + esc(place) + '" data-task="' + task + '"' + (P ? ' data-state="after"' : '') + '>' +
        '<div class="stop-h">' + (one ? '' : '<span class="tab-n">' + n + '</span>') + '<div class="stop-t"><h3>' + (one ? '' : '<span class="sr">' + tr('Stop ', 'Paso ') + n + ': </span>') + esc(headEs(place)) + '</h3><p class="stop-leak">' + esc(r.b) + '</p></div></div>' +
        '<div class="stop-body"><div class="pic' + (P ? ' has-seg' : '') + '"' + (task === 'calls' ? ' data-pic="calls"' : '') + '>' + pic +
        (P ? '<div class="seg" role="group" aria-label="' + tr('Show stop ', 'Mostrar el paso ') + n + ': ' + esc(place) + '"><button type="button" data-show="before" aria-pressed="false">' + tr('Before', 'Antes') + '</button><button type="button" data-show="after" aria-pressed="true">' + tr('After', 'Después') + '</button></div>' : '') +
        (tag ? '<span class="samp">' + tr('Sample', 'Ejemplo') + '</span>' : '') + '</div>' +
        // last pass item 5 (2026-10-26): a row with noteAfter says it under the After picture and its note under Before, as Home's
        // stop 1 always did (a phone opens the walk on After, and "Nobody called back" sat under the text-back)
        '<div class="stop-notes"><p class="pencil">' + (P && r.noteAfter ? '<span class="bo">' + esc(r.note) + '</span><span class="ao">' + esc(r.noteAfter) + '</span>' : esc(r.note)) + '</p>' +
        // 2026-10-17: every stop's figure says what it is in each state, not only a one-stop walk's ("$399 a month" alone read as a price)
        // round 4 (2026-10-18): the label sits on the figure's line, "Won back $1,900 a month", as a loss reads "Losing $1,900 a month";
        // "$1,900 a month" alone in big ink under a small label read as a monthly price. It wraps only where the line can't hold both
        '<p class="find"><span class="find-l">' + (P ? '<span class="find-k"><span class="bo">' + tr('Lost', 'Pierde') + '</span><span class="ao">' + tr('Won back', 'Recupera') + '</span></span>' : '<span class="find-k">' + tr('Lost', 'Pierde') + '</span>') + ' ' +
        '<span class="find-usd money">' + money(r.usd) + ' ' + perWord(t) + UNDER_SVG + '</span></span>' + (noF ? (r.count ? '<span class="find-f">' + esc(r.count) + '</span>' : '') : '<span class="find-f">' + esc(r.fs || r.f) + '</span>') + '</p>' +
        // agency pass 2026-10-18 (rank 8): with no formula under the stops, a row's counting line (trades-src "count") says which of the
        // owner's own records the figure comes from, and names an outside rate once, so a $1,900 never reads as made up for the pitch
        // no "Fix:" line on v4 stops: the After picture shows the fix in the shop's own screen, and the line only repeated it (R9)
        '</div></div></li>'; }).join('');
    var tl = el.querySelector('[data-tally]');
    if (tl) {
      var ol = tl.querySelector('ol'); if (ol) ol.innerHTML = rows.map(function (r, i) { return '<li data-i="' + i + '"><span>' + (ownPlace(r.id) || esc((r.pair && r.pair.place) || r.place)) + '</span></li>'; }).join('');
      var sub = tl.querySelector('[data-f="tsub"]'); if (sub) sub.textContent = (t.shop + ', ' + t.short.split(', ').slice(1).join(', ')).replace(/(\d) /g, '$1\u00a0');   // 2026-10-15: no-break space after a count
    }
    initG2R(list, animate); initDraw(list); tally.bind(el, t); $$('.pair[data-pair]', list).forEach(fitPair); fitCrops(); pencil(el);
  }
  // 2026-10-17 round 3 (judges): on the trade pages (html.fit-pairs) a plain stack shows only its state's layer, so each row is as tall as
  // what it shows (a one-line "Escrito una vez" had sat in a 56px row). The frame keeps its size (R7): the table is measured in both
  // states and the shorter one gets the difference under its table's last row (--fit-pad), so nothing below it moves when the state turns
  function fitPair(p) {
    if (!root.classList.contains('fit-pairs')) return;
    var tb = p.querySelector('.win-b table'); p.classList.toggle('fit', !!tb && !!p.querySelector('.chg:not(.tr)')); if (!p.classList.contains('fit')) return;   // a window's table (a page's own paper pair keeps both layers)
    p.style.removeProperty('--fit-pad');
    var st = p.getAttribute('data-state') || 'after', h = function () { return p.getBoundingClientRect().height; };   // the whole frame: a status line's stack counts too
    p.classList.add('measuring');
    var here = h(); p.setAttribute('data-state', st === 'after' ? 'before' : 'after'); var other = h(); p.setAttribute('data-state', st); h();
    p.classList.remove('measuring');
    if (other > here + 0.5) p.style.setProperty('--fit-pad', (other - here).toFixed(2) + 'px');
    // in a spreadsheet the room under the last row reads as Excel's next empty rows: its row lines at the height of a one-line row,
    // the grey row-number column beside them (system.css paints them from these measures)
    var xl = tb.closest('.xl'); if (!xl || !(other > here + 0.5)) return;
    var rows = [].filter.call(tb.rows, function (r) { return !r.classList.contains('cl') && r.querySelector('td') && r.getClientRects().length; }), rn = tb.rows[0] && tb.rows[0].cells[0];   // a row hidden on a narrow picture has no height
    p.style.setProperty('--fit-top', (tb.getBoundingClientRect().bottom - xl.getBoundingClientRect().top).toFixed(2) + 'px');
    p.style.setProperty('--fit-rowh', Math.min.apply(null, rows.map(function (r) { return r.getBoundingClientRect().height; })).toFixed(2) + 'px');
    if (rn) p.style.setProperty('--fit-rn', rn.getBoundingClientRect().width.toFixed(2) + 'px');
  }
  function showFig(el, key, preview) {
    var box = el.querySelector('[data-f="fig"]'); if (!box || !D[key]) return;
    if (!box.children.length) box.innerHTML = ORDER.map(function (k) { return '<img data-t="' + k + '" src="' + (box.dataset.base || '') + D[k].fig + '" alt="" width="600" height="520" loading="lazy" decoding="async">'; }).join('');
    $$('img', box).forEach(function (im) { var on = im.dataset.t === key; im.classList.toggle('on', on); im.alt = on ? D[key].figAlt : ''; if (on) im.loading = 'eager'; });
    var cap = el.querySelector('[data-f="figcap"]'); if (cap) cap.textContent = D[key].figCap;
    $$('a[data-t]', el).forEach(function (a) { a.classList.toggle('pv', preview && a.dataset.t === key); });
  }

  /* ================================================================ the trade picker */
  var locked = document.body.hasAttribute('data-trade-lock');
  if (locked) root.classList.add('fit-pairs');   // round 3 (system.css): each Before / After stack fits the state it shows (fitPair)
  function setTrade(key, animate) {
    if (!D[key]) return;
    var changed = key !== L.trade; L.trade = key;
    if (animate) L.picked = true;                     // a chip, the select or arrow keys: the visitor chose
    if (L.picked) store.set('lumora.trade', key);     // carried onto the trade pages; a page's default is never stored as a choice
    $$('[data-picker]').forEach(function (p) {
      $$('.chip', p).forEach(function (c) { var on = c.dataset.t === key; c.setAttribute('aria-checked', on ? 'true' : 'false'); c.removeAttribute('aria-current'); c.tabIndex = on ? 0 : -1; });
      var sel = p.querySelector('select'); if (sel) sel.value = key;
    });
    var t = D[key];
    // digits-roll (alive build 2026-10-24): what the figures say before the pick, when a roll can follow it (the module is loading
    // or loaded); a ring still waiting on an earlier pick's roll comes back, since that row is rewritten now
    var was = animate && changed && nfLoad && !still ? rollSnap() : null;
    $$('.sheet.nf-roll').forEach(function (s) { s.classList.remove('nf-roll'); });
    rolling = !!was;
    $$('[data-bind]').forEach(function (el) { var fn = BIND[el.getAttribute('data-bind')]; if (fn) fn(el, t, animate && changed, key); });
    listeners.forEach(function (fn) { fn(key, t, animate && changed); });
    rolling = false;
    if (was) rollFigures(was);
    document.dispatchEvent(new CustomEvent('lumora:trade', { detail: { key: key, trade: t, animate: animate && changed } }));
  }
  L.setTrade = function (k) { setTrade(k, true); };
  function initPickers() {
    $$('[data-picker]').forEach(function (p) {
      var group = p.querySelector('.chips'), chips = $$('.chip', p), sel = p.querySelector('select');
      if (sel && !sel.options.length) sel.innerHTML = ORDER.map(function (k) { return '<option value="' + k + '">' + esc(D[k].name) + '</option>'; }).join('');
      if (sel) sel.addEventListener('change', function () { setTrade(sel.value, true); });
      if (!group) return;
      group.setAttribute('role', 'radiogroup');
      chips.forEach(function (c, i) {
        c.setAttribute('role', 'radio');
        c.addEventListener('click', function (e) { e.preventDefault(); setTrade(c.dataset.t, true); });
        c.addEventListener('keydown', function (e) {  // radiogroup keys: arrows move and choose, Space chooses
          var d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
          if (d) { e.preventDefault(); var n = chips[(i + d + chips.length) % chips.length]; n.focus(); setTrade(n.dataset.t, true); }
          else if (e.key === ' ') { e.preventDefault(); setTrade(c.dataset.t, true); }
        });
      });
    });
    $$('[data-bind=idx]').forEach(function (el) {
      el.addEventListener('pointerover', function (e) { var a = e.target.closest('a[data-t]'); if (a && fine.matches) showFig(el, a.dataset.t, true); });
      el.addEventListener('pointerleave', function () { showFig(el, L.trade, false); });
      el.addEventListener('focusin', function (e) { var a = e.target.closest('a[data-t]'); if (a) showFig(el, a.dataset.t, true); });
      el.addEventListener('focusout', function () { showFig(el, L.trade, false); });
    });
  }

  /* ================================================================ ghost to real */
  function setG2R(g, state) {
    g.dataset.state = state;
    // 2026-10-16 (the new Home): the stop takes the state too, so its margin note and find label (.bo / .ao, system.css) turn with it
    var stop = g.closest('.stop'); if (stop) stop.setAttribute('data-state', state);
    var lab = g.getAttribute('data-label-' + state); if (lab) g.setAttribute('aria-label', lab);
    var scope = g.closest('.stop, [data-g2r-scope]') || g.parentNode;
    $$('[data-show]', scope).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.show === state ? 'true' : 'false'); });
    // job: cause and effect. The stop's money underline draws as the fix lands, not before it (it waits; see initG2R)
    // data-draw="view" (2026-10-16 repair, Home's stop 1): that mark draws when it comes into view, in Before too, as on the approved desktop
    if (state === 'after') $$('[data-draw]:not([data-draw=view])', g.closest('.stop, [data-g2r-scope]') || g).forEach(function (p) { p.removeAttribute('data-wait'); draw(p, 380); });
    if (g.hasAttribute('data-pair')) fitPair(g);   // round 3: the rows take the shown layer's height, the frame keeps its own
    pencil(g.closest('.stop, [data-g2r-scope]') || g);   // a ring in the layer just shown is fitted to it
  }
  // job: state change. History: 55% and 600ms showed the "before" for ~1.3 s; then 95% held 2.5 s, and a timed owner skim
  // on a phone (review 2026-10-10, 470px a flick) left every stop on Before the whole way: he saw only the problems.
  // Now a phone opens on After, which already carries the pencil trace of the old value (R7), and Before is the tap. A
  // computer keeps the switch on view, sooner: half in view (or filling 60% of the screen) for 0.9 s.
  var narrow = matchMedia('(max-width: 899px)');
  var g2rIO = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { var g = e.target;
      if (!e.isIntersecting || (e.intersectionRatio < 0.5 && e.intersectionRect.height < innerHeight * 0.6)) { clearTimeout(g._g2r); g._g2r = 0; return; }
      if (g._g2r) return;   // still in view, only crossed another threshold: keep the clock running, don't restart it
      g._g2r = setTimeout(function () { g2rIO.unobserve(g); if (!g.dataset.touched) setG2R(g, 'after'); }, 900); });
  }, { threshold: [0, 0.25, 0.5, 0.75, 1] }) : null;
  /* the Before / After switch's marker (Franco 2026-10-19, design round item 5; system.css .seg-th). Every two-button .seg gets one
     ink marker holding white copies of its two words; data-on says which half it covers and follows aria-pressed, whoever sets it
     (a stop's switch, the walk's 0.9 s turn, Home's code demo). With a mouse the marker starts on the press, so it and the money it
     changes move together (craft judge: the money swapped at once and the marker got there 260ms later); a press that ends off the
     button puts it back. A touch moves it on the tap, since a touch that starts a scroll is no tap. The arrow keys move it too. A
     marker a prerender copied into the page is replaced, never doubled */
  function segs(scope) {
    $$('.seg', scope).forEach(function (seg) {
      var bs = $$(':scope > button', seg); if (seg._th || bs.length !== 2) return; seg._th = 1;
      $$(':scope > .seg-th', seg).forEach(function (x) { x.remove(); });
      var th = document.createElement('span'); th.className = 'seg-th'; th.setAttribute('aria-hidden', 'true');
      th.innerHTML = '<span class="seg-tx"><span>' + esc(bs[0].textContent.trim()) + '</span><span>' + esc(bs[1].textContent.trim()) + '</span></span>';
      seg.appendChild(th);
      var sync = function () { seg.setAttribute('data-on', bs[1].getAttribute('aria-pressed') === 'true' ? '1' : '0'); };
      sync(); seg.classList.add('th');
      new MutationObserver(sync).observe(seg, { attributes: true, subtree: true, attributeFilter: ['aria-pressed'] });
      requestAnimationFrame(function () { requestAnimationFrame(function () { seg.classList.add('go'); }); });   // no slide on the first paint
      bs.forEach(function (b, i) {
        b.addEventListener('pointerdown', function (e) {
          if (e.pointerType === 'touch' || e.button !== 0) return;
          seg.setAttribute('data-on', String(i));
          addEventListener('pointerup', function () { setTimeout(sync, 0); }, { once: true });   // after the click, or back if there was none
        });
      });
      seg.addEventListener('keydown', function (e) {
        var d = { ArrowLeft: 0, ArrowRight: 1 }[e.key]; if (d == null || e.altKey || e.ctrlKey || e.metaKey) return;
        e.preventDefault(); if (bs[d].getAttribute('aria-pressed') !== 'true') bs[d].click(); bs[d].focus();
      });
    });
  }
  function initG2R(scope, redraw) {
    segs(scope);
    $$('[data-g2r]', scope).forEach(function (g) {
      if (g.dataset.ready) return; g.dataset.ready = '1';
      var sc = g.closest('.stop, [data-g2r-scope]') || g.parentNode;
      $$('[data-show]', sc).forEach(function (b) { b.addEventListener('click', function () { g.dataset.touched = '1'; setG2R(g, b.dataset.show); }); });
      // data-g2r-hold (Home's stop 1, 2026-10-17): a computer with motion opens it on Before and keeps it there until the owner turns
      // it, as the approved desktop meant (owner judge: "Visit Tuesday. Quote Friday." turned away after 0.9 s, before anyone read it).
      // No hover turn either. Phones, reduced motion and ?still open on After, as every stop does
      var hold = g.hasAttribute('data-g2r-hold');
      // job: signifier. Hover a ghost and it comes to life, unless the owner chose "As we find it" himself: then the
      // cursor reaching the paper to read it must not undo his choice (trades-2 review, 2026-10-07)
      g.addEventListener('pointerenter', function () { if (fine.matches && !hold && g.dataset.state === 'before' && !g.dataset.touched) setG2R(g, 'after'); });
      if (redraw && !still) $$('.ghost', g).forEach(function (x) { x.classList.add('draw'); });
      // the still default is the fixed state; with motion allowed, figures below the fold start as found and turn real in view
      if (hold && !still && !narrow.matches) setG2R(g, 'before');
      else if (!still && g2rIO && !narrow.matches && g.getBoundingClientRect().top > innerHeight * 0.8) { setG2R(g, 'before'); g2rIO.observe(g); $$('[data-draw]:not([data-draw=view])', g.closest('.stop, [data-g2r-scope]') || g).forEach(function (p) { p.setAttribute('data-wait', ''); }); }
      else setG2R(g, g.dataset.state || 'after');
    });
  }

  /* ================================================================ the walk tally (from scroll position, never from "passed" events) */
  var tally = {
    els: [], bind: function (walk, t) {
      if (!this.els.some(function (x) { return x.walk === walk; })) this.els.push({ walk: walk });
      this.update();
    },
    update: function () {
      this.els.forEach(function (x) {
        var t = D[L.trade], walk = x.walk, stops = $$('.stop', walk), line = innerHeight * 0.7, sum = 0, n = 0;
        stops.forEach(function (s, i) {
          var f = s.querySelector('.find'), on = !!f && f.getBoundingClientRect().top < line;   // every stop above the line counts, even after a jump
          s.classList.toggle('passed', on); if (on) { sum += +s.dataset.usd; n = i + 1; }
          var li = walk.querySelector('[data-tally] li[data-i="' + i + '"]'); if (li) li.classList.toggle('on', on);
        });
        var all = n === stops.length && n > 0;
        if (walk.getAttribute('data-walk') === 'pairs') {   // v4 (R9): progress only, no dollar figures; the walk's one total line follows the stops
          var nx = stops[Math.min(n, stops.length - 1)], lc = function (s) { return s.charAt(0).toLowerCase() + s.slice(1); };
          var pg = walk.querySelector('[data-tally] [data-f="tprog"]'), b1 = walk.querySelector('[data-f="bar-stop"]'), b2 = walk.querySelector('[data-f="bar-n"]');
          var of = tr(' of ', ' de '), st = tr(' stops', ' pasos');   // Spanish "paso": a "parada" is a bus stop (native read 2026-10-10)
          // round 4: the counts keep their words here too ("3 of 3 stops"), as keepCounts() writes them everywhere else
          if (pg) pg.textContent = keepCounts(all ? tr('Walk done, ', 'Visita terminada, ') + n + of + n + st : n ? n + of + stops.length + st : stops.length + tr(' stops on this walk', ' pasos en esta visita'));
          if (b1) b1.textContent = keepCounts(all ? tr('Walk done', 'Visita terminada') : n ? tr('Next: ', 'Sigue: ') + lc(nx ? nx.dataset.place : '') : tr('The walk, ', 'La visita, ') + stops.length + st);
          if (b2) b2.textContent = keepCounts(n ? n + of + stops.length : tr('Sample business', 'Negocio de ejemplo'));
          return;
        }
        var tot = walk.querySelector('[data-tally] [data-f="tot"]'), tper = walk.querySelector('[data-tally] [data-f="tper"]');
        if (tot) tot.textContent = n ? money(sum) : '';                                     // never "$0": empty until a stop counts
        if (tper) tper.textContent = n ? (t.per === 'yr' ? 'A year' : 'A month') + (all ? '' : ', so far') : 'Adds up as you scroll';
        var bs = walk.querySelector('[data-f="bar-stop"]'), bu = walk.querySelector('[data-f="bar-usd"]');
        var next = stops[Math.min(n, stops.length - 1)];
        // one line on a phone at the start, and it names the NEXT stop (the counted one can still be on screen)
        if (bs) bs.textContent = keepCounts(all ? 'Walk done, ' + n + ' of ' + n + ' stops' : n ? 'Next: ' + (next ? next.dataset.place : '') : 'The walk, ' + stops.length + ' stops');
        if (bu) bu.textContent = n ? money(sum) + ' ' + perWord(t) + (all ? '' : ' so far') : 'Sample business';  // never "$0 so far"
      });
    }
  };
  var tick = 0;
  addEventListener('scroll', function () { if (tick) return; tick = requestAnimationFrame(function () { tick = 0; tally.update(); padTally(); }); }, { passive: true });
  // 2026-10-17 round 3: while a walk's sticky tally bar is stuck under the header, the page's scroll padding takes its height too, so the
  // browser's own focus scroll (smooth, so the focus handler's one frame came too early) stops a control under the bar, not under the tally
  function padTally() { var hdr = $('.hdr'), top = hdr ? hdr.getBoundingClientRect().bottom : 0, pad = 0;
    $$('.tally').forEach(function (t) { if (!t.getClientRects().length || getComputedStyle(t).position !== 'sticky') return; var q = t.getBoundingClientRect(); if (q.height && q.top <= top + 1 && q.bottom > top) pad = Math.max(pad, q.bottom); });
    if (pad) root.style.scrollPaddingTop = Math.ceil(pad + 16) + 'px'; else root.style.removeProperty('scroll-padding-top'); }
  addEventListener('resize', function () { clearTimeout(L._rz); L._rz = setTimeout(function () { $$('.pen-ring').forEach(ring); tally.update(); $$('.pair[data-pair]').forEach(fitPair); fitCrops(); pencil(document, true); seatBar(); }, 150); });

  /* ================================================================ the phone call bar lands between two lines (round 3, 2026-10-17)
     Franco's iPhone review, after Home's p1-final rule: the call bar's top edge lands between two lines of the first screen, never
     across a line, a figure or a button. A page opts in with data-bar-seat on its first section (every page but Home, whose hero
     is tuned by hand in home.css). On load, when the fonts settle and when the width changes (never on a height change alone, so
     iPhone Safari's toolbar can't make the page jump), the block that holds the cut line moves the least it can: up into the air
     above it (12px at most, keeping 8px of that air) or down until the line clears the bar, and never so far that the page's
     first-screen musts ([data-first], the strip's figure, the headline) leave the screen. check.py BAR_JS measures every page that
     opts in, and every trade page, at 393 x 659, 375 x 667, 375 x 812 and 320 x 568 in WebKit and Chromium */
  var seatW = 0, SEAT_ATOM = '.strip, .cta-row, .lf, label, ul, ol, dl, table, figure, .pic, .clip, .facts4, .btn';
  function seatBar(force) {
    var sec = $('main > section[data-bar-seat]'), bar = $('.callbar');
    if (!sec || (!force && innerWidth === seatW)) return; seatW = innerWidth;
    $$('[data-seated]', sec).forEach(function (e) { e.style.marginTop = ''; e.removeAttribute('data-seated'); });
    if (!bar || !bar.getClientRects().length || scrollY > 0) return;
    var B = bar.getBoundingClientRect().top, hdr = $('.hdr'), floor = hdr ? hdr.getBoundingClientRect().bottom + 28 : 0, TOL = 0.5;
    // design round picks, 2026-10-19 (item 1): a line in a sheet that writes itself in ([data-fill]) counts while it is still at
    // opacity 0, since it lands in that place a moment later (the bar was seated, then "$411" wrote in under its edge)
    var shown = function (e) { var s = getComputedStyle(e); return e.getClientRects().length > 0 && s.visibility !== 'hidden' && (+s.opacity > 0 || !!e.closest('.sheet[data-fill]')); };
    // every line of words, and every box the bar must not cross; a button or a field keeps 8px from the bar (a black button on the black
    // bar read as one shape), a line or a small box 2px. y is where it starts, before that room
    var lines = function () { var out = [], tw = document.createTreeWalker(sec, NodeFilter.SHOW_TEXT), n;
      while ((n = tw.nextNode())) { var e = n.parentElement; if (!n.nodeValue.trim() || !e || e.closest('.sr') || !shown(e)) continue;
        var r = document.createRange(); r.selectNodeContents(n); [].forEach.call(r.getClientRects(), function (q) { if (q.width > 0.5) out.push({ e: e, t: q.top, b: q.bottom, y: q.top }); }); }
      // round 4 (2026-10-18): a filter chip is a button too (What we automate at 375 x 667: the bar sat on the second row of chips with
      // their top 8px showing), so it keeps a button's 8px
      $$('.btn, .stamp, .samp, .seg, select, input:not([type=radio]):not([type=checkbox]), .wa-chip, .chip', sec).forEach(function (e) { if (!shown(e)) return;
        var q = e.getBoundingClientRect(), p = e.matches('.btn, .seg, select, input, .wa-chip, .chip') ? 6 : 0; if (q.height > 4) out.push({ e: e, t: q.top - p, b: q.bottom + p, y: q.top }); });
      return out; };
    var cut = function (o, s) { return o.t + s < B + TOL && o.b + s > B - TOL; };   // a line within half a pixel of the edge counts as cut
    // design round picks, 2026-10-19 (item 1): a trade page's phone opens on the sheet, so its ringed row 1 is a must too
    var mustBoxes = function () { return $$('[data-first], .hero-strip .strip-usd, h1, [data-bind=sheet][data-ring] .sh-rows > li:first-child .pen-ring', sec).filter(shown).map(function (e) {   // by the words' own boxes
      var r = document.createRange(); r.selectNodeContents(e); var q = r.getBoundingClientRect(); return q.height ? q : e.getBoundingClientRect(); }); };
    var unitOf = function (e) { var c = e, a = c.closest(SEAT_ATOM);
      while (a && sec.contains(a)) { c = a; a = a.parentElement && a.parentElement.closest(SEAT_ATOM); }   // the outermost unit that holds it
      while (c.parentElement && c.parentElement !== sec && /^inline/.test(getComputedStyle(c).display)) c = c.parentElement;
      return c; };
    for (var pass = 0; pass < 3; pass++) {
      var L = lines(), first = L.filter(function (o) { return cut(o, 0); }).sort(function (a, b) { return a.t - b.t; })[0]; if (!first) return;
      // the unit that holds the cut line, and up to two blocks before it in the same column. A push down happens at that unit alone; a
      // lift is shared by them in proportion to the air over each (each keeps 6px of it, a card with a shadow 16, and gives 16px at most), so no one gap closes
      var units = [unitOf(first.e)], x = units[0];   // a unit with nothing before it in its box takes its box's place: the button row is the first thing in its call block
      while (units.length < 3) { var pv = x.previousElementSibling; while (!pv && x.parentElement && x.parentElement !== sec) { x = x.parentElement; pv = x.previousElementSibling; }
        if (!pv) break; x = pv; if (shown(pv) && getComputedStyle(pv).position !== 'absolute') units.push(pv); }
      var tops = units.map(function (c) { return c.getBoundingClientRect().top; });
      // a card with a shadow above a block counts down to its shadow's reach (12px under its edge), so a lift never sets words in it
      var cards = $$('.strip, .clip, .board, .contact-card, .sheet, .page, .card', sec).filter(function (e) { return shown(e) && getComputedStyle(e).boxShadow !== 'none'; }).map(function (e) { var q = e.getBoundingClientRect(); return { y: q.top, b: q.bottom + 12 }; });
      var caps = units.map(function (c, i) { var air = tops[i] - Math.max.apply(null, L.concat(cards).filter(function (o) { return o.y < tops[i] - 0.5; }).map(function (o) { return o.b; }).concat([floor])); return Math.max(0, Math.min(16, air - (getComputedStyle(c).boxShadow !== 'none' ? 16 : 6))); });   // a card keeps 16px, clear of its own shadow
      var room = caps.reduce(function (a, b) { return a + b; }, 0);
      var after = L.filter(function (o) { return o.y >= tops[0] - 0.5; }).sort(function (x, y) { return x.t - y.t; });
      var musts = mustBoxes().filter(function (q) { return q.top >= tops[0] - 0.5 && q.bottom <= B - TOL; });
      var moved = function (o, s) { if (s >= 0) return o.y >= tops[0] - 0.5 ? s : 0;   // how far a line moves when the units move by s
        var d = 0; for (var i = 0; i < units.length; i++) if (o.y >= tops[i] - 0.5) d += s * caps[i] / room; return d; };
      // where the bar's edge can land: 2px over or under any line (clear of a descender), or the middle of a gap of 2.5px or more
      // between two lines (a narrower one left WebKit's sub-pixel layout too little room; Home's sheet rule); the smallest move wins,
      // a lift on a tie, and a push down never sends a first-screen must under the bar
      var iv = []; after.forEach(function (o) { var l = iv[iv.length - 1]; if (l && o.t < l.b) l.b = Math.max(l.b, o.b); else iv.push({ t: o.t, b: o.b }); });
      var spots = []; iv.forEach(function (v) { spots.push(v.t - 2, v.b + 2); });
      for (var k = 0; k + 1 < iv.length; k++) if (iv[k + 1].t - iv[k].b >= 2.5) spots.push((iv[k].b + iv[k + 1].t) / 2);
      var best = null;
      spots.forEach(function (y) { var s = B - y;   // s > 0 moves the unit down, s < 0 lifts it
        if (s > 0 && musts.some(function (q) { return q.bottom + s > B - TOL; })) return;
        if (s < 0 && -s > room) return;
        if (L.some(function (o) { return cut(o, moved(o, s)); })) return;
        if (best === null || Math.abs(s) < Math.abs(best) - 0.01 || (Math.abs(Math.abs(s) - Math.abs(best)) <= 0.01 && s < 0 && best > 0)) best = s; });
      if (best === null) return;
      // each unit's margin moves it by its share, or by less where a float's clearance takes some of it (the Loss calculator's first
      // field): so it is set, measured and set again until the unit has moved that far
      (best > 0 ? [[units[0], best]] : units.map(function (c, i) { return [c, best * caps[i] / room]; })).forEach(function (cs) {
        var c = cs[0], d = cs[1]; if (Math.abs(d) < 0.25) return;
        var want = c.getBoundingClientRect().top + d, m = parseFloat(getComputedStyle(c).marginTop);
        for (var t = 0; t < 4 && Math.abs(d) > 0.25; t++) { m += d; c.style.marginTop = m.toFixed(2) + 'px'; d = want - c.getBoundingClientRect().top; }
        c.setAttribute('data-seated', ''); });
    }
  }
  L.seatBar = seatBar;

  /* ================================================================ loops: the night band (pause control, off-screen pause) */
  var loops = [];
  function Loop(el) {
    var self = this, btn = el.querySelector('.pause'), timer = 0, user = false, seen = false, plays = 0;
    self.el = el;
    // v4 [data-steps]: every [data-n] item (log rows and notifications) lands in its own clock order; else the v3 calls, oldest first.
    // v4 never opens on an empty frame (review 2026-10-10: a blank paper and a bare lock screen read as unfinished): each
    // play starts with the first row in, the rows still to come stay on the paper dimmed (CSS) and ink in one by one, and
    // the lock screen's big clock and date tick with the night (9:40 ... 6:38), ending on 6:41.
    var steps = el.hasAttribute('data-steps'), ITEM = steps ? '[data-n]' : '.nt', first = steps ? 0 : -1, step = first;
    var items = function () { return steps ? $$('[data-n]', el).sort(function (a, b) { return a.dataset.n - b.dataset.n; }) : $$('.nt:not(.cb)', el).reverse(); };
    // last pass item 9 (2026-10-26, Home's night band, data-loop-open): a play opens with the first notification already on the lock
    // screen, lands the other two 0.8 and 1.6 s in with the night log in step, then holds. A phone shows the newest two notifications
    // under the clock (the third is not drawn), so only the ones shown count
    var NS = steps && el.hasAttribute('data-loop-open'), inCrop = function (n) { var c = n.closest('.crop-m'), b = c && c.getBoundingClientRect(); return !!n.getClientRects().length && (!b || !b.height || n.getBoundingClientRect().bottom <= b.bottom - 12); },
      NSK = function () { var k = []; items().forEach(function (n, i) { if (n.classList.contains('lk4-nt') && inCrop(n)) k.push(i); }); k.push(items().length - 1); return k; },
      F = function () { return NS ? NSK()[0] : first; };
    if (NS) step = F();
    function tick(it) {
      var lk = el.querySelector('.lk4'), clk = lk && lk.querySelector('.lk4-t'), day = lk && lk.querySelector('.lk4-d'); if (!clk) return;
      var cur = el.classList.contains('run') && !still && step < it.length ? it[Math.max(step, 0)] : null, m = cur && /^(\d+:\d\d) ([AP]M)$/.exec(cur.dataset.t || '');
      clk.textContent = m ? m[1] : (lk.dataset.end || '6:41');   // data-end: a night that ends on another clock (electrical's band: Thursday, 2:46 PM)
      if (day) day.textContent = m && m[2] === 'PM' ? lk.dataset.eve : lk.dataset.day;
    }
    function frame() {
      var it = items();
      if (still || !el.classList.contains('run')) { $$(ITEM, el).forEach(function (n) { n.classList.add('on'); }); el.classList.add('fixed'); if (steps) tick(it); return; }
      it.forEach(function (n, i) { n.classList.toggle('on', i <= step); });
      var cb = steps ? null : el.querySelector('.nt.cb'); if (cb) cb.classList.toggle('on', step >= it.length);
      el.classList.toggle('fixed', step >= it.length);
      if (steps) tick(it);
    }
    // the control: one pattern, the label swaps (no aria-pressed beside a swapping label); when the 3 plays end it stays,
    // as "Play again", so keyboard focus never drops to the page (phone-access review 2026-10-10)
    function label(mode) {
      if (!btn) return;
      var vis = (ES ? { pause: 'Pausar', play: 'Reproducir', again: 'Ver otra vez' } : { pause: 'Pause', play: 'Play', again: 'Play again' })[mode], lab = btn.querySelector('.pt');
      btn.setAttribute('aria-label', (ES ? { pause: 'Pausar la animación', play: 'Reproducir la animación', again: 'Ver otra vez' } : { pause: 'Pause animation', play: 'Play animation', again: 'Play again' })[mode]);
      btn.classList.toggle('is-paused', mode !== 'pause'); if (lab) lab.textContent = vis;
    }
    function next() {                                   // job: cause and effect. The night's work lands line by line, in clock order
      clearTimeout(timer);
      var n = items().length;
      if (step >= n) { plays++; if (plays >= 3) { el.classList.remove('run'); frame(); label('again'); return; } step = F(); } else if (NS) { var nx = NSK().filter(function (x) { return x > step; })[0]; step = nx == null ? n : nx; } else step++;
      frame();
      timer = setTimeout(next, NS ? (step < n - 1 ? 800 : 4400) : step === first ? (steps ? 1100 : 700) : step < n - 1 ? (steps ? 650 : 850) : step === n - 1 ? 1600 : 4400);   // about 10 to 13 s a play; stops on the finished frame after 3
    }
    function running() { return el.classList.contains('run') && !user && seen && !document.hidden; }
    function sync() { clearTimeout(timer); if (running()) timer = setTimeout(next, NS ? 800 : 600); }
    self.reset = function () { step = F(); frame(); sync(); };
    if (still) { if (btn) btn.hidden = true; frame(); return; }
    el.classList.add('run'); frame();
    if (btn) btn.addEventListener('click', function () {
      if (!el.classList.contains('run')) { plays = 0; user = false; el.classList.add('run'); step = F(); frame(); label('pause'); sync(); return; }
      user = !user; label(user ? 'play' : 'pause');
      // paused, the night shows finished, every row at full strength, as reduced motion does (phone-access review 2026-10-10: a
      // pause froze 4 of 7 log rows dimmed); Play starts a fresh play from the first row
      if (user && steps) { step = items().length; frame(); }
      sync();
    });
    label('pause');
    document.addEventListener('visibilitychange', sync);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { seen = es[0].isIntersecting; sync(); }, { threshold: 0.25 }).observe(el);
  }

  /* ================================================================ the leak check (only his own input moves the figure) */
  function initLeak(form) {
    // 2026-10-15: a comma with one or two digits after it is a decimal comma ("1,5" is 1.5, never 15); other commas group thousands
    var num = function (v) { v = String(v).replace(/[$%\s]/g, '').replace(/^(\d*),(\d{1,2})$/, '$1.$2').replace(/,/g, ''); return v === '' ? NaN : +v; };
    var g = function (n) { return form.querySelector('[name="' + n + '"]'); };
    var scope = form.closest('[data-leak-scope], section') || document;
    var out = function (k) { return form.querySelector('[data-f="' + k + '"]') || scope.querySelector('[data-f="' + k + '"]') || document.createElement('span'); };
    var last = null;
    function calc(animate) {
      var rang = num(g('rang').value), back = num(g('back').value), book = num(g('book').value), profit = num(g('profit').value), err = '';
      if ([rang, back, book, profit].some(function (x) { return isNaN(x) || x < 0; })) err = 'Use a number of 0 or more in each box.';
      else if (back > rang) err = 'Calls you call back cannot be more than the calls that rang out.';
      else if (book > 100) err = 'Use a share from 0 to 100.';
      out('err').textContent = err;
      if (err) { out('math').textContent = 'Put a number in each box to see your estimate.'; return; }
      var notBack = rang - back, month = notBack * 52 / 12, jobs = month * book / 100, usd = Math.round(jobs * profit / 10) * 10;
      out('math').textContent = notBack + ' call' + (notBack === 1 ? '' : 's') + ' a week nobody returned × 52 ÷ 12 = ' + month.toFixed(1) + ' a month. × ' + book + '% = ' + jobs.toFixed(1) + ' jobs. × ' + money(profit) + ' = ' + money(usd) + ' a month.';
      var dots = out('dots');
      if (dots) {
        var n = Math.min(Math.round(month), 60), full = Math.floor(jobs), part = jobs - full, h = '';
        for (var i = 0; i < n; i++) { var c = i < full ? 'dot job' : (i === full && part > 0.05 ? 'dot part' : 'dot'); h += '<span class="' + c + '"' + (c === 'dot part' ? ' style="--p:' + Math.round(part * 100) + '%"' : '') + '></span>'; }
        dots.innerHTML = h; dots.setAttribute('aria-label', month.toFixed(1) + ' calls a month nobody returned; about ' + jobs.toFixed(1) + ' of them would have booked.');
      }
      var el = out('usd'); rollTo(el, animate ? last : null, usd, money); last = usd;
      if (animate && !still && el) { el.classList.remove('roll'); void el.offsetWidth; el.classList.add('roll'); }
    }
    $$('[data-step]', form).forEach(function (b) { b.addEventListener('click', function () { var i = g(b.dataset.for), v = num(i.value); i.value = Math.max(0, (isNaN(v) ? 0 : v) + +b.dataset.step); calc(true); }); });
    var t; $$('input', form).forEach(function (i) { i.addEventListener('input', function () { clearTimeout(t); t = setTimeout(function () { calc(true); }, 250); }); });
    form.addEventListener('submit', function (e) { e.preventDefault(); calc(true); });
    calc(false);
  }

  /* ================================================================ tabs ("Pick your tool") */
  function initTabs(box) {
    var tabs = $$('[role=tab]', box);
    function sel(tab, focus) {
      tabs.forEach(function (t) { var on = t === tab; t.setAttribute('aria-selected', on ? 'true' : 'false'); t.tabIndex = on ? 0 : -1;
        var p = document.getElementById(t.getAttribute('aria-controls')); if (p) p.hidden = !on; });
      if (focus) tab.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { sel(t); });
      t.addEventListener('keydown', function (e) { var d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (d) { e.preventDefault(); sel(tabs[(i + d + tabs.length) % tabs.length], true); } });
    });
    sel(tabs.filter(function (t) { return t.getAttribute('aria-selected') === 'true'; })[0] || tabs[0]);
  }

  /* ================================================================ reveals and pen draws on view */
  var seeIO = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (!e.isIntersecting) return; var t = e.target; seeIO.unobserve(t);
      if (t.classList.contains('rv')) t.classList.add('in');
      if (t.hasAttribute('data-draw')) draw(t, 0);
      if (t.classList.contains('plan')) t.classList.add('drawn');
      if (t.classList.contains('pen-ring')) { ring(t); draw(t, 120); }
    });
  }, { threshold: 0.2 }) : null;
  function initDraw(scope) {
    $$('.rv, [data-draw], .plan', scope).forEach(function (el) {
      if (still || !seeIO) { el.classList.add('in', 'drawn'); return; }
      if (!el.hasAttribute('data-wait')) seeIO.observe(el);       // data-wait: a ghost-to-real fix draws it instead
    });
    // stagger siblings that reveal together: 50ms apart, at most 6
    $$('.rv', scope).forEach(function (el) { var sib = $$(':scope > .rv', el.parentNode); var i = sib.indexOf(el); if (i > 0 && !el.style.getPropertyValue('--i')) el.style.setProperty('--i', Math.min(i, 5)); });
  }

  /* ================================================================ header menu */
  function initMenu() {
    var b = $('.menu-b'), nav = $('#nav'); if (!b || !nav) return;
    // 2026-10-16 repair: #nav comes before the button in the header, so Tab from Close skipped all seven links and landed on the
    // hero's button, hidden behind the open sheet. Now Tab from the button goes to the first link and Shift+Tab from the first link
    // comes back (the header's language link closes the loop), and the page behind is inert until the menu closes. check.py's
    // MENU_JS holds it on every page
    var open = function () { return nav.classList.contains('open'); };
    var set = function (o) { nav.classList.toggle('open', o); b.setAttribute('aria-expanded', o ? 'true' : 'false'); b.textContent = o ? tr('Close', 'Cerrar') : tr('Menu', 'Menú');
      $$('body > main, body > .foot, body > .callbar').forEach(function (el) { el.inert = o; }); };
    b.addEventListener('click', function () { set(!open()); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    b.addEventListener('keydown', function (e) { var a = $('a', nav); if (e.key === 'Tab' && !e.shiftKey && open() && a) { e.preventDefault(); a.focus(); } });
    nav.addEventListener('keydown', function (e) { if (e.key === 'Tab' && e.shiftKey && open() && e.target === $('a', nav)) { e.preventDefault(); b.focus(); } });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && open()) { set(false); b.focus(); } });
    document.addEventListener('click', function (e) { if (open() && !e.target.closest('.hdr')) set(false); });   // a tap on the page under a dropdown (Spanish, 900 to 1279px) closes it
    addEventListener('resize', function () { if (open() && !b.getClientRects().length) set(false); });   // the window grew past the Menu button: never leave the page inert
  }

  // test hook (E10): put every Before / After picture in one state, as if the visitor had pressed the button, so check.py can
  // lint and measure both states (the in-view trigger alone would leave most of them on one)
  L.showStops = function (state) { $$('[data-g2r]').forEach(function (g) { g.dataset.touched = '1'; setG2R(g, state); }); };

  /* ================================================================ v4 rules (redesign plan R1, R2, R4, R5, R7, R8, R9, R11, R13, R14)
     Only on pages that opt in with body[data-rules=v4]; the v3 pages were built before these rules. check.py runs lint() at
     390 and 1440 and, on Home, for every trade in both stop states. The page budgets (R9) bind the page's default view; for
     the other trades they warn, since those trades' pictures wait on their own owner read (Home 1.5). */
  function lintV4(E, W, vis, text) {
    var shown = function (s, r) { return $$(s, r).filter(vis); }, def = L.trade === (document.body.dataset.trade || 'plumbing'), B = def ? E : W;
    var texts = function (fn) { var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT); while (w.nextNode()) { var nd = w.currentNode, pe = nd.parentElement;
      if (pe && nd.nodeValue.trim() && !pe.closest('.sr,script,style') && vis(pe)) fn(nd.nodeValue, pe); } };
    // R1: back office leads; calls are one row per list, one call per stack, one calls picture per page, never a heading
    var tasks = {}; shown('[data-task]').forEach(function (x) { tasks[x.dataset.task] = 1; });
    if (Object.keys(tasks).length < 6) E.push('R1: ' + Object.keys(tasks).length + ' kinds of task in view (6 at least).');
    $$('ul,ol,.lk4-nts').forEach(function (l) { var c = $$(':scope > [data-task="calls"]', l).filter(vis).length; if (c > 1) E.push('R1: a list or stack with ' + c + ' calls.'); });
    // motion restore, 2026-10-18: Home's hero strip shows the walk's three problems at a glance and the walk fixes each one, so the
    // strip's cropped phone previews stop 3, as its quotes slice previews stop 1; it counts only on a page whose walk has no calls stop
    var cs = !!document.querySelector('.stop [data-pic="calls"]'), cp = shown('[data-pic="calls"]').filter(function (x) { return !(cs && x.closest('.recog')); }).length;
    if (cp > 1) E.push('R1: ' + cp + ' calls pictures (one per page).');
    shown('h1,h2,h3').forEach(function (h) { if (/missed call|voicemail|text ?back|rang out|ring out|calls after hours|after-hours call|calls that ring|llamadas? perdidas?|buz[oó]n de voz|mensaje de voz|fuera de horario/i.test(h.innerText)) E.push('R1: call words in a heading: ' + h.innerText.slice(0, 50)); });
    // R4: nothing incoming stamped 11 p.m. to 5 a.m.; a text-back is a green SMS bubble (Spanish pages write "11:48 p. m.")
    shown('.lk4-nt, [data-task="calls"], .bub.in').forEach(function (x) { if (/\b(11:\d\d\s?(?:PM\b|p\.\s?m\.)|12:\d\d\s?(?:AM\b|a\.\s?m\.)|[1-4]:\d\d\s?(?:AM\b|a\.\s?m\.))/i.test(x.innerText)) E.push('R4: something incoming between 11 p.m. and 5 a.m.: ' + x.innerText.slice(0, 50)); });
    $$('.thread .sys').forEach(function (s) { var b = s.nextElementSibling; if (/^(Missed call|Llamada perdida)/.test(s.textContent) && b && b.classList.contains('out') && !b.classList.contains('sms')) E.push('R4: a text-back in a blue bubble.'); });
    // R2: What we automate, second, at least 6 rows; on Home third since the alive build (2026-10-24, Franco's Oct 23 yes to Oct 19
    // idea 15: the walk comes right under the promise), still before How it works. This code counts rows, not the place; check.py
    // home_src_problems holds Home's section order. A link to the full list before that page is live is golive.py's push gate
    // (full_list_problems): the browser can't know what is live (moved there when /what-we-automate/ was readied, 2026-10-11)
    var auto = document.getElementById('automate'); if (!auto || shown('[data-task]', auto).length < 6) E.push('R2: What we automate is missing or has under 6 rows.');
    // R5: the night band's headline has no call word, and its lock screen clock never hides
    shown('[data-ground=night] h2').forEach(function (h) { if (/\bcalls?\b|voicemail|missed|\bring|llamad|buz[oó]n|perdid/i.test(h.innerText)) E.push('R5: a call word in the night band headline.'); });
    $$('.lk4').forEach(function (k) { var c = k.querySelector('.lk4-t'); if (!c || !vis(c) || +getComputedStyle(c).opacity < 0.9) E.push('R5: the lock screen clock is hidden.'); });
    // R7: one label pair, Before / After; every pair keeps a pencil trace
    if (/as we find it|with the fix/i.test(text)) E.push('R7: an old Before / After label ("As we find it" or "With the fix").');
    shown('button').forEach(function (b) { if (/^\s*(fixed|arreglado)\s*$/i.test(b.innerText)) E.push('R7: a "Fixed" switch.'); });
    $$('[data-pair]').forEach(function (p) { if (!p.querySelector('.chg.tr, .pc')) E.push('R7: a Before / After picture with no pencil trace.'); });
    // R8: no drawings, straight stamps, exactly one Sample label per picture, slots in one of the 3 shapes
    if (shown('.ghost').length) E.push('R8: an ink ghost drawing.');
    if ($$('img').some(function (i) { return /\/figs\//.test(i.getAttribute('src') || ''); })) E.push('R8: a trade drawing.');
    shown('.stamp,.samp').forEach(function (s) { var tf = getComputedStyle(s).transform; if (tf && tf !== 'none' && tf !== 'matrix(1, 0, 0, 1, 0, 0)') E.push('R8: a tilted Sample stamp.'); });
    // papers sit straight too (PLUMBING-INTEGRATE item 42; system.css straightens .ticket and .doc.tilt-* on v4 pages): a move is fine, a turn is not
    shown('.ticket,.doc').forEach(function (d) { var tf = getComputedStyle(d).transform; if (tf && tf !== 'none' && !/^matrix\(1, 0, 0, 1,/.test(tf)) E.push('R8: a tilted paper (' + d.className + ').'); });
    // 2026-10-17: one Sample label at most; none only on a picture with no dollar figure whose section's lead names the sample
    // business ([data-sample-lead] saying sample / ejemplo). A picture with dollar figures or results always keeps its label
    shown('.pic').forEach(function (p) { var n = $$('.samp,.stamp', p).filter(function (s) { return vis(s) && /^(sample|ejemplo)$/i.test(s.textContent.trim()); }).length;
      var sec = p.closest('section') || document.body, lead = shown('[data-sample-lead]', sec).some(function (l) { return /sample|ejemplo/i.test(l.innerText); });
      if (n > 1) E.push('R8: a picture with ' + n + ' Sample labels (' + (p.className || p.id) + ').');
      else if (!n && /\$\s?\d/.test(p.innerText)) E.push('R8: a picture with dollar figures and no Sample label (' + (p.className || p.id) + ').');
      else if (!n && !lead) E.push('R8: a picture with no Sample label, and no lead in its section that names the sample business ([data-sample-lead]) (' + (p.className || p.id) + ').'); });
    // the reviewers' round (2026-10-26): Home's client proof band is one review-only figure.slot, so golive strips it whole; its
    // photo place inside (.proof-ph) carries the shape
    $$('.slot:not(.proof-slot), .proof-slot .proof-ph').forEach(function (s) { if (['16:9', '1:1', '4:5'].indexOf(s.dataset.shape) < 0) E.push('R8: a picture slot that is not 16:9, 1:1 or 4:5.'); });
    // R9: no dollar figure more than twice, 16 or fewer, counted per width; the phone-only top-leak strip is the named exception.
    // The bound price sentence counts its bold price only: the plain words after it are the credit's terms, and their $1,500
    // floor (Franco, 2026-10-13, premortem item 9) is a condition the law needs beside the credit, not a figure on show.
    // 2026-10-16 (Franco's GO on the new Home; a budget, BIG-PLAN-DETAIL R9's table "Dollar figures 16 or fewer"): R9 counts the
    // page's own words. Text inside a .pic Sample picture is the shop's own screen (the quotes app alone brings about 32 figures,
    // $1,912.40 three times) and is not counted; the copy stays held to 16 and to twice each
    var seen = {}, total = 0;
    // Round 2 (2026-10-17, judges): Home's strip under the sheet (.recog) says where each of the sheet's figures comes from, so like
    // the old phone-only strip it repeats the sheet by design and is not counted
    // Design round picks on Home's walk (Franco 2026-10-19, items 3 and 13): the walk heading opens on the sheet's total, the
    // number its end pays off, and on a computer the adding slip lists the three stops it adds up. Both repeat by design, as the
    // strip does, so neither is counted
    texts(function (s, pe) { if (pe.closest('.hero-strip, .recog, .walk-h-usd, .walk-slip') || pe.closest('.pic') || pe.matches('[data-shared="price"]')) return; (s.match(/\$\d[\d,]*(?:\.\d+)?/g) || []).forEach(function (m) { var k = m.replace(/\.0+$/, ''); seen[k] = (seen[k] || 0) + 1; total++; }); });
    Object.keys(seen).forEach(function (k) { if (seen[k] > 2) B.push('R9: ' + k + ' shows ' + seen[k] + ' times (twice at most).'); });
    if (total > 16) B.push('R9: ' + total + ' dollar figures on the page (16 or fewer).');
    // R11: the picked chip is never filled black on a computer screen
    if (innerWidth >= 700) shown('.chip[aria-checked=true]').forEach(function (c) { if (getComputedStyle(c).backgroundColor === 'rgb(17, 17, 16)') E.push('R11: the picked trade chip is filled black.'); });
    // R13: all eight trade links visible on a phone, outside any menu
    if (innerWidth <= 430) { var tl = shown('[data-trades] a').filter(function (a) { return /\/industries\/[^/]+\/$/.test(a.getAttribute('href') || ''); }).length; if (tl < 8) E.push('R13: ' + tl + ' of 8 trade links visible on a phone.'); }
    // R14: no "AI" in the hero, one two-tone heading at most, no "word · word" label outside the pictures
    var hero = document.querySelector('.hero'); if (hero && /\b(AI|IA)\b/.test(hero.innerText)) E.push('R14: "AI" in the hero.');
    var two = $$('.two').filter(function (h) { return vis(h) && h.querySelector('span'); }).length; if (two > 1) E.push('R14: ' + two + ' two-tone headings (one at most).');
    texts(function (s, pe) { if (!pe.closest('.pic,.clip,.np,.ph4,.scr-win,.tally') && /\S · \S/.test(s)) E.push('R14: a "word · word" label: ' + s.trim().slice(0, 40)); });
    if (/data\s+entry|(?:entrada|captura|ingreso)\s+de\s+datos/i.test(text)) E.push('R2: the retired category phrase (Franco: never on the site) is on the page.');   // the phrase itself stays out of this file: propagation_lint bans it under site/
    // ---- added with the Home review fixes (2026-10-10), so what the reviewers caught by eye cannot come back
    // R4: every text-back is the RULES.md script word for word, and the time it promises is the callback list's own time
    // the Spanish script (RULES.md, the same rule) on a Spanish page: "Hola, le escribe ... / Reply STOP to stop texts."
    var SCRIPT = /^Hi, this is .+?\. Sorry we missed your call\. Someone will call you back .+?\. If texting is easier, reply here\. Reply STOP to stop texts\. \/ Responda STOP \(o ALTO\) para no recibir mensajes\.$/;
    var SCRIPT_ES = /^Hola, le escribe .+?\. Disculpe que no pudimos contestar\. Le devolveremos la llamada .+?\. Si le es más fácil, responda por aquí\. Responda STOP \(o ALTO\) para no recibir mensajes\. \/ Reply STOP to stop texts\.$/;
    var hm = function (s) { var m = /(\d{1,2}):?(\d\d)?\s*([ap])\.?\s?m\b/i.exec(s || ''); return m ? (+m[1]) + ':' + (m[2] || '00') + ' ' + m[3].toUpperCase() + 'M' : null; };
    $$('.thread').forEach(function (th) {
      var tb = th.querySelector('.bub.sms') || $$('.bub.out', th).filter(function (b) { var p = b.previousElementSibling; return p && /^(Missed call|Llamada perdida)/.test(p.textContent); })[0]; if (!tb) return;
      var s = tb.textContent.trim(); if (!SCRIPT.test(s) && !SCRIPT_ES.test(s)) E.push('R4: a text-back off the RULES.md script: ' + s.slice(0, 60));
      var said = hm((/call you back by ([^.]*?(?:[ap]\.m\.)[^.]*)|devolveremos la llamada ([^.]*?[ap]\.\s?m\.)/i.exec(s) || []).slice(1).join('')),
        list = $$('.sys', th).filter(function (x) { return /callback list|lista para devolver llamadas|anotad[oa] para devolver(?:le)? la llamada/i.test(x.textContent); })[0];   // Spanish since the native read of 2026-10-10: "Anotado para devolver la llamada a las 12:30 p. m."
      if (said && list && said !== hm(list.textContent)) E.push('R4: the text-back promises ' + said + ' but the callback list says ' + hm(list.textContent) + '.');
    });
    // money back names the walk fee (hard rule 2026-10-10); the old line, "every dollar back", read as the fix money too, right after the price sentence.
    // Spanish: "lo que pagó por la visita", never "todo su dinero" (the old Spanish line) and never a figure
    if (/every dollar back|todo su dinero/i.test(text)) E.push('Money back: "every dollar back" is retired; the line says "the walk fee".');
    // agency pass 2026-10-18 (rank 5): the bound short fact too; the old one, "Money back up to 7 days...", sat under the $1,500 floor and read as the fix money
    shown('.mb, [data-shared^=moneyback]').forEach(function (m) { if (!/walk fee|lo que pagó por la visita/i.test(m.innerText)) E.push('Money back: a money-back line without "the walk fee": ' + m.innerText.slice(0, 50)); });
    // R9 bans the no-reviews line (Franco 2026-10-13: never volunteer what Lumora lacks; say it only when someone asks). Until then R9 required it
    if (/no (?:client )?reviews here yet|no hay rese[ñn]as de clientes/i.test(text)) E.push('R9: the retired no-reviews line ("Lumora is new, so there are no client reviews here yet.") is back; say it only when someone asks.');
    // R6: one phone component (the drawn frame with its camera island), never rotated, one width on a computer, .491 wide to tall
    if (shown('.scr-phone, .scr-lock').length) E.push('R6: an old phone style (.scr-phone or .scr-lock) on a v4 page.');
    // 2026-10-16 (the new Home): the measured iPhone 15 (.iph, system.css section 28) is a phone component too: the device keeps its
    // 432.2 x 891.2 shape and is never turned. A page that shows it and the drawn frame (.ph4) warns until Phase D makes them one
    shown('.iph-dev').forEach(function (p) { var tf = getComputedStyle(p).transform;
      if (Math.abs(p.offsetWidth / p.offsetHeight - 432.2 / 891.2) > 0.01) E.push('R6: a measured phone ' + (p.offsetWidth / p.offsetHeight).toFixed(3) + ' wide to tall (0.485).');
      if (tf && tf !== 'none' && tf !== 'matrix(1, 0, 0, 1, 0, 0)') E.push('R6: a rotated phone.'); });
    // 2026-10-17 polish: a page whose night band shows the measured iPhone (data-iph: Home) fails a second drawing; elsewhere it warns
    if (shown('.iph-dev').length && shown('.ph4').length) (document.querySelector('[data-iph]') ? E : W).push('R6: two phone drawings on the page (the measured .iph and the drawn .ph4); Phase D makes them one.');
    var phs = shown('.ph4'), widths = {};
    phs.forEach(function (p) { var r = p.getBoundingClientRect(), tf = getComputedStyle(p).transform;
      if (!p.querySelector('.ph4-f .ph4-isl')) E.push('R6: a phone without the drawn frame and camera island.');
      if (Math.abs(p.offsetWidth / p.offsetHeight - 433 / 882) > 0.01) E.push('R6: a phone frame ' + (p.offsetWidth / p.offsetHeight).toFixed(3) + ' wide to tall (0.491).');
      if (tf && tf !== 'none' && tf !== 'matrix(1, 0, 0, 1, 0, 0)') E.push('R6: a rotated phone.');
      widths[Math.round(r.width)] = 1; });
    if (innerWidth >= 900 && Object.keys(widths).length > 1) E.push('R6: phones in ' + Object.keys(widths).join(' and ') + 'px widths (one width).');
    // a cropped phone (.crop-m) fades only its last 24px, and no text may sit in that fade (review: the callback line was faded to 2:1)
    shown('.crop-m').forEach(function (c) { if (getComputedStyle(c).overflow !== 'hidden') return; var b = c.getBoundingClientRect();
      $$('p, span, b, small', c).filter(function (x) { return vis(x) && x.children.length === 0 && x.textContent.trim(); }).forEach(function (x) {
        var nt = x.closest('.lk4-nt'), tf = nt && getComputedStyle(nt).transform, ty = tf && tf !== 'none' ? new DOMMatrixReadOnly(tf).m42 : 0, r = x.getBoundingClientRect();   // where it lands, not mid slide-in
        if (r.top - ty < b.bottom && r.bottom - ty > b.bottom - 24) E.push('Crop: "' + x.textContent.trim().slice(0, 30) + '" sits in a cropped phone\'s fade.'); }); });
    // sample data: two pictures of the same spreadsheet agree, row by row (review: rows 975 to 977 skipped jobs 4522 and 4523)
    var files = {};
    shown('.scr-win').forEach(function (w) { var tt = w.querySelector('.win-tb span'), heads = $$('th', w).map(function (h) { return h.textContent.trim(); }); if (!tt || !/\.xlsx$/.test(tt.textContent) || ['Job', 'Trabajo'].indexOf(heads[0]) < 0) return;
      var last = 0, f = files[tt.textContent] = files[tt.textContent] || {};
      $$('tr', w).forEach(function (tr) { var td = tr.querySelectorAll('td'); if (td.length < 2 || !/^\d+$/.test(td[0].textContent.trim())) return; var rn = td[0].textContent.trim(), job = +td[1].textContent.trim();
        if (f[rn] && f[rn] !== job) B.push('Sample: ' + tt.textContent + ' row ' + rn + ' is job ' + f[rn] + ' in one picture and ' + job + ' in another.');
        if (job < last) B.push('Sample: ' + tt.textContent + ' job numbers go down at row ' + rn + '.'); f[rn] = job; last = job; }); });
    // alive build 2026-10-24 (Franco's pick phone-scale, alive round item 12): on a phone the headline is the loudest line. Every
    // section head is smaller than the h1 and the closing line is never bigger than it (system.css section 3: 28px heads and a 28 to
    // 32px closing line; at 44 the phone page ended louder than it started)
    if (innerWidth <= 430) { var h1 = shown('main h1')[0], fsz = function (e) { return parseFloat(getComputedStyle(e).fontSize); };
      if (h1) { var hf = fsz(h1); shown('main h2, main .t-close').forEach(function (h) { if (h.closest('.pic,.clip,.ph4,.scr-win,.iph')) return;
        var f = fsz(h), cl = h.matches('.close-h, .t-close');
        if (cl ? f > hf + 0.05 : f > hf - 0.05) E.push('Type: on a phone the ' + (cl ? 'closing line' : 'section head') + ' "' + h.innerText.trim().slice(0, 30) + '" is ' + f + 'px, the headline ' + hf + 'px (the headline is the loudest line).'); }); } }
    // one type scale outside the pictures, measured on a computer where every clamp sits at its top (review: 16 sizes)
    if (innerWidth >= 1280) {
      var SCALE = [15, 17, 20, 24, 32, 44, 64], odd = {};
      texts(function (s, pe) { if (pe.closest('.pic,.clip,.np,.ph4,.scr-win,.slot,.samp,.stamp,.tally,svg,.util,.foot,.skip')) return;
        var fs = parseFloat(getComputedStyle(pe).fontSize);
        if (pe.closest('h1 .phr') && Math.abs(fs - 58) < 0.6) return;
        if (pe.closest('.walk-sum .walk-total > b') && Math.abs(fs - 120) < 0.6) return;   // design round item 13 (2026-10-19): the walk end's one display figure (SYSTEM.md 4)   // design round picks, 2026-10-19 (item 6): the Spanish trade h1 set by phrase, the 64 role's one step (SYSTEM.md)
        if (!SCALE.some(function (v) { return Math.abs(v - fs) < 0.6; })) odd[Math.round(fs * 10) / 10 + 'px'] = s.trim().slice(0, 24); });
      Object.keys(odd).forEach(function (k) { E.push('Type: ' + k + ' is off the scale (15, 17, 20, 24, 32, 44, 64): "' + odd[k] + '"'); });
    }
    // papers from outside the shop keep their English (lang="en", as they arrive), so the Spanish checks skip them (2026-10-16)
    if (ES) { var tES = text; $$('[lang="en"]').forEach(function (n) { var t = n.innerText; if (t && t.trim()) tES = tES.split(t).join(' '); }); lintES(E, tES); }
  }
  // Spanish pages (2026-10-10): the picked trade's Spanish is complete, its figures, times, dates and numbers are the English
  // data's (digit groups compared field by field), and none of this file's English words show
  function lintES(E, text) {
    var k = L.trade, en = EN[k], es = D[k]; if (!en || !es) return;
    ESMISS.filter(function (m) { return m.split(/[ :]/)[0] === k; }).forEach(function (m) { E.push('Spanish: missing in trades-src-es.json or sheets.json: ' + m); });
    var dg = function (o) { return (JSON.stringify(o == null ? '' : o).match(/\d+/g) || []).sort().join(' '); };
    var same = function (what, a, b) { if (b != null && dg(a) !== dg(b)) E.push('Spanish: ' + k + ' ' + what + ' has other numbers than the English (' + dg(a) + ' / ' + dg(b) + ').'); };
    en.rows.forEach(function (r, i) { var x = es.rows[i]; same(r.id + ' note', r.note, x.note); same(r.id + ' picture', r.pair || r.after, x.pair || x.after); same(r.id + ' row', [r.b, r.fs], [x.b, x.fs]); });
    if (en.night4) { en.night4.rows.forEach(function (r, i) { same('night row ' + (i + 1), r[1], es.night4.rows[i][1]); });
      en.night4.nts.forEach(function (x, i) { same('notification ' + (i + 1), [x.t, x.p], [es.night4.nts[i].t, es.night4.nts[i].p]); }); }
    var left = (text.match(/\b(?:Sample|Before|After|Walk done|a month|a year|Time back|Pause|Play again|Ready)\b|\bNext:|\bStop \d/g) || []);
    if (left.length) E.push('Spanish: English words on the page: ' + left.slice(0, 6).join(', '));
    // lines the native read of 2026-10-10 retired (calques and notary register), so they cannot come back
    var old = text.match(/arreglamos cómo funciona|negocios de oficios|lista para devolver llamadas|Pérdida antes de cualquier arreglo|Tiempo que recuperan|\bparadas?\b|\bprospectos\b|previo acuerdo|con sede en|Hace más de uno|Puede detenerse|\bGanada\b|dentro de los 7 días siguientes/gi);
    if (old) E.push('Spanish: a line the native read retired is back: ' + old.slice(0, 4).join(', '));
  }

  /* ================================================================ lint: the variety and trust rules, checkable */
  // Lumora.lint() returns {errors, warnings}. check.py calls it; ?lint in the URL prints it in the console.
  L.lint = function () {
    var E = [], W = [], catalog = document.body.hasAttribute('data-catalog');
    var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; };
    var text = document.body.innerText;
    if (/[\u2014\u2013]/.test(text)) E.push('Em or en dash in visible text.');
    if (/!/.test(text.replace(/<!--[\s\S]*?-->/g, ''))) E.push('Exclamation mark in visible text.');
    (text.match(/\(352\) \d{3}-\d{4}/g) || []).forEach(function (p) { if (p !== '(352) 226-0681' && !/\(352\) 555-01\d\d/.test(p)) E.push('Phone outside the sample range: ' + p); });
    if (!catalog) {
      // the price sentence (shared-text.json "price", bound with data-shared) may appear twice: the hero and step 2 (Oct 8)
      var prices = $$('[data-shared="price"]').filter(vis).length, p500 = (text.match(/\$500\b/g) || []).length;
      if (prices > 2) E.push('The price sentence appears ' + prices + ' times (at most twice: the hero and step 2).');
      if (p500 > prices) E.push('"$500" appears ' + (p500 - prices) + ' time(s) outside the bound price sentence.');
      var rings = $$('.pen-ring').filter(vis).length; if (rings > 1) E.push(rings + ' pen rings on the page (one per page).');
      var disp = $$('.t-display').length; if (disp > 1) E.push(disp + ' display money figures (one per page).');
      var nights = $$('main [data-ground=night]').length; if (nights > 1) E.push(nights + ' ink bands (one per page).');
      // alive build 2026-10-24 (Franco's pick pine-field, alive round item 4): one pine field a page at most, as one ink band
      var pines = $$('main [data-ground=pine]').length; if (pines > 1) E.push(pines + ' pine fields (one per page at most).');
      var secs = $$('main > section, main > [data-ground]').filter(function (s) { return s.dataset.ground; });
      var KEYS = ['ground', 'density', 'width', 'loud'];
      for (var i = 1; i < secs.length; i++) {
        var a = secs[i - 1].dataset, b = secs[i].dataset, same = KEYS.filter(function (k) { return a[k] && a[k] === b[k]; });
        if (same.length > 2) E.push('Neighbouring sections share ' + same.join(', ') + ': ' + (secs[i - 1].id || i - 1) + ' / ' + (secs[i].id || i));
        if (a.medium && a.medium === b.medium) E.push('Neighbouring sections use the same medium (' + a.medium + '): ' + (secs[i - 1].id || i - 1) + ' / ' + (secs[i].id || i));
        KEYS.forEach(function (k) { if (!b[k] && i === 1 && !a[k]) W.push('Sections need data-' + k + ' for the beat lint.'); });
      }
      var abstract = $$('[data-medium]').filter(function (s) { return /diagram|chart|code/.test(s.dataset.medium); }).length;
      if (abstract > 1) E.push(abstract + ' abstract formats (one per page at most).');
    }
    $$('[data-loop]').forEach(function (l) { if (!l.querySelector('.pause')) E.push('A loop has no pause button.'); });
    // WCAG 2.5.3: a pause button's accessible name starts with the words it shows ("Pausa" vs "Pausar la animación" missed it, 2026-10-10)
    $$('.pause').forEach(function (b) { var v = ((b.querySelector('.pt') || {}).textContent || '').trim(), a = (b.getAttribute('aria-label') || '').trim();
      if (v && a && a.toLowerCase().indexOf(v.toLowerCase()) !== 0) E.push('A pause button shows "' + v + '" but is named "' + a + '" (the name must start with the visible words).'); });
    // 2026-10-17 iPhone round: a picture that drops its tag (R8, its section's lead names the sample) still says so in its alt
    // text, which sits on the screen inside it ("Sample, after: ..."), so the alt text of what it holds counts too
    $$('.pic, .sheet, .morning').forEach(function (p) { var alt = $$('[aria-label]', p).map(function (a) { return a.getAttribute('aria-label'); }).join(' ');
      if (!/sample|ejemplo/i.test(p.innerText + (p.getAttribute('aria-label') || '') + ' ' + alt)) W.push('Picture without a visible "Sample" label: ' + (p.id || p.className)); });
    $$('a[href^="sms:"]').forEach(function (a) { if (!/body=/.test(a.getAttribute('href'))) W.push('sms: link without a prefilled body.'); });
    // agency pass 2026-10-18 (rank 22): a trade page's texts say which page they came from ("Hi, I saw your plumbing page."), so the
    // generic website body on a page locked to one trade is a slip
    if (document.body.hasAttribute('data-trade-lock')) $$('a[href^="sms:"]').forEach(function (a) { var b = decodeURIComponent((a.getAttribute('href').split('body=')[1] || ''));
      if (/saw your website|vi su página web/i.test(b)) W.push('sms: a trade page texts the generic website body; name the trade (SYSTEM 11).'); });
    // type floors at the current width: 12px inside pictures always; 15px for key text outside pictures on phones
    if (innerWidth <= 430) {
      var small = [], tiny = [];
      var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        var n = walker.currentNode, el = n.parentElement; if (!n.nodeValue.trim() || !el || el.closest('.sr,script,style,noscript')) continue;   // aria-hidden text still has to be readable
        if (!vis(el)) continue;
        var fs = parseFloat(getComputedStyle(el).fontSize);
        if (el instanceof SVGElement && el.getScreenCTM) { var m = el.getScreenCTM(); if (m) fs *= Math.hypot(m.a, m.b); }   // svg text: the size it renders at
        var inPic = el.closest('.pic,.clip,.plan,.inpic,.fn,.ghost,.scr-lock,.morning,.wb,.ticket,.doc,.xl,.county,.samp,.slot');   // .slot: review-only placeholder; .clip (2026-10-16): the printed sheet is a picture, as BUDGET_JS counts it
        if (fs < 12) tiny.push(n.nodeValue.trim().slice(0, 30) + ' (' + fs + 'px)');
        else if (fs < 15 && !inPic) small.push(n.nodeValue.trim().slice(0, 30) + ' (' + fs + 'px)');
      }
      if (tiny.length) E.push('Text under 12px: ' + tiny.slice(0, 8).join('; '));
      if (small.length) W.push('Text under 15px outside pictures: ' + small.slice(0, 8).join('; '));
    }
    // alive build 2026-10-24 (Franco's picks pine-field and won-pine): no money and no red on the pine field, and pine as a text
    // colour means money won back only, a walk figure After (.stop[data-state=after] .find-usd). Red still means money lost only
    (function () {
      var rs = getComputedStyle(document.documentElement), tone = function (v) { var i = document.createElement('i'); i.style.color = v; document.body.appendChild(i); var c = getComputedStyle(i).color; i.remove(); return c; };
      var pv = rs.getPropertyValue('--pine').trim(), pine = pv ? tone(pv) : null, reds = ['--red', '--pen', '--red-night', '--mark'].map(function (k) { return tone(rs.getPropertyValue(k).trim()); });
      var tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), seen = {};
      while (tw.nextNode()) {
        var n = tw.currentNode, el = n.parentElement; if (!n.nodeValue.trim() || !el || el.closest('script,style,noscript,.sr') || !vis(el)) continue;
        var c = getComputedStyle(el).color, field = el.closest('[data-ground=pine]'), t = n.nodeValue.trim().slice(0, 30);
        if (field && /\$\s?\d/.test(n.nodeValue) && !seen.usd) { seen.usd = 1; E.push('Money on the pine field: "' + t + '" (no money and no red on it).'); }
        if (field && reds.indexOf(c) > -1 && !seen.red) { seen.red = 1; E.push('Red text on the pine field: "' + t + '" (no money and no red on it).'); }
        // the generalist Home (2026-10-30): the walk film's money line, "Won back $3,552 a month", is a figure won back too
        if (pine && c === pine && !el.closest('.stop[data-state=after] .find-usd, .wm .wk-won .find-usd') && !seen.pine) { seen.pine = 1; E.push('Pine text outside a figure won back: "' + t + '" (pine means money won back only).'); }
      }
    })();
    if (!catalog && document.body.dataset.rules === 'v4') lintV4(E, W, vis, text);
    return { errors: E, warnings: W };
  };

  /* ================================================================ the call card (design round item 2, Franco 2026-10-19)
     On a computer a tel: link opens an app picker, FaceTime or nothing, and an sms: link does nothing at all. With a mouse from 900px,
     Call us, the number beside it and "Or send a text" open a small card under the control instead: the shared reply line
     (since 2026-10-23; it said whether someone picked up now on Gainesville's clock), a code the phone's camera reads to call or text (QR version 2, level M, written by segno; check.py decodes
     it back), the number, "Call from this computer" and the email. Phones keep the dialer exactly as before. Nothing here touches
     the clipboard: the number is plain text. An sms: link whose words the page rewrote since it loaded (the calculator's estimate)
     is left alone, so the visitor's own figure is never dropped on the way to his phone */
  var QR = { tel: 'M0 0.5h7M8 0.5h3M14 0.5h3M18 0.5h7M0 1.5h1M6 1.5h1M8 1.5h1M10 1.5h2M18 1.5h1M24 1.5h1M0 2.5h1M2 2.5h3M6 2.5h1M8 2.5h1M12 2.5h1M15 2.5h2M18 2.5h1M20 2.5h3M24 2.5h1M0 3.5h1M2 3.5h3M6 3.5h1M11 3.5h1M16 3.5h1M18 3.5h1M20 3.5h3M24 3.5h1M0 4.5h1M2 4.5h3M6 4.5h1M8 4.5h4M14 4.5h2M18 4.5h1M20 4.5h3M24 4.5h1M0 5.5h1M6 5.5h1M10 5.5h1M18 5.5h1M24 5.5h1M0 6.5h7M8 6.5h1M10 6.5h1M12 6.5h1M14 6.5h1M16 6.5h1M18 6.5h7M10 7.5h1M13 7.5h1M0 8.5h1M3 8.5h7M12 8.5h2M15 8.5h1M17 8.5h1M20 8.5h1M22 8.5h3M0 9.5h2M3 9.5h1M8 9.5h2M11 9.5h1M13 9.5h1M15 9.5h3M20 9.5h2M0 10.5h1M2 10.5h1M5 10.5h3M9 10.5h1M13 10.5h1M15 10.5h1M17 10.5h2M21 10.5h1M24 10.5h1M2 11.5h1M8 11.5h2M11 11.5h1M13 11.5h1M16 11.5h2M22 11.5h1M24 11.5h1M0 12.5h2M3 12.5h2M6 12.5h1M9 12.5h2M12 12.5h2M17 12.5h2M24 12.5h1M0 13.5h1M3 13.5h1M7 13.5h1M10 13.5h1M13 13.5h3M17 13.5h1M19 13.5h2M22 13.5h1M0 14.5h4M6 14.5h1M9 14.5h5M15 14.5h2M18 14.5h1M21 14.5h1M23 14.5h2M0 15.5h1M2 15.5h1M4 15.5h1M8 15.5h1M10 15.5h2M15 15.5h1M19 15.5h2M22 15.5h1M24 15.5h1M0 16.5h1M2 16.5h1M4 16.5h4M14 16.5h9M24 16.5h1M8 17.5h2M11 17.5h6M20 17.5h1M0 18.5h7M8 18.5h1M11 18.5h1M16 18.5h1M18 18.5h1M20 18.5h1M24 18.5h1M0 19.5h1M6 19.5h1M8 19.5h1M10 19.5h1M12 19.5h1M14 19.5h1M16 19.5h1M20 19.5h1M24 19.5h1M0 20.5h1M2 20.5h3M6 20.5h1M8 20.5h1M12 20.5h9M24 20.5h1M0 21.5h1M2 21.5h3M6 21.5h1M8 21.5h3M14 21.5h1M16 21.5h1M18 21.5h2M22 21.5h3M0 22.5h1M2 22.5h3M6 22.5h1M9 22.5h2M12 22.5h1M14 22.5h2M20 22.5h1M23 22.5h2M0 23.5h1M6 23.5h1M9 23.5h2M14 23.5h2M18 23.5h3M22 23.5h3M0 24.5h7M8 24.5h1M10 24.5h1M13 24.5h5M19 24.5h2M24 24.5h1', sms: 'M0 0.5h7M8 0.5h1M12 0.5h1M14 0.5h1M18 0.5h7M0 1.5h1M6 1.5h1M10 1.5h2M18 1.5h1M24 1.5h1M0 2.5h1M2 2.5h3M6 2.5h1M12 2.5h2M15 2.5h2M18 2.5h1M20 2.5h3M24 2.5h1M0 3.5h1M2 3.5h3M6 3.5h1M8 3.5h4M14 3.5h3M18 3.5h1M20 3.5h3M24 3.5h1M0 4.5h1M2 4.5h3M6 4.5h1M8 4.5h2M11 4.5h4M18 4.5h1M20 4.5h3M24 4.5h1M0 5.5h1M6 5.5h1M8 5.5h1M10 5.5h1M12 5.5h3M16 5.5h1M18 5.5h1M24 5.5h1M0 6.5h7M8 6.5h1M10 6.5h1M12 6.5h1M14 6.5h1M16 6.5h1M18 6.5h7M8 7.5h2M14 7.5h3M0 8.5h1M4 8.5h1M6 8.5h3M13 8.5h2M16 8.5h6M24 8.5h1M0 9.5h2M3 9.5h3M7 9.5h2M10 9.5h1M15 9.5h1M17 9.5h1M19 9.5h2M23 9.5h1M1 10.5h1M4 10.5h1M6 10.5h1M8 10.5h1M10 10.5h1M13 10.5h5M20 10.5h1M0 11.5h1M3 11.5h2M7 11.5h3M13 11.5h1M15 11.5h4M21 11.5h2M0 12.5h2M6 12.5h1M8 12.5h1M12 12.5h2M15 12.5h2M18 12.5h1M21 12.5h3M0 13.5h1M3 13.5h1M7 13.5h1M9 13.5h2M13 13.5h3M17 13.5h1M19 13.5h2M22 13.5h1M2 14.5h1M6 14.5h1M8 14.5h1M10 14.5h1M15 14.5h3M19 14.5h1M21 14.5h1M2 15.5h1M4 15.5h1M7 15.5h1M10 15.5h1M12 15.5h1M14 15.5h1M17 15.5h3M21 15.5h2M24 15.5h1M0 16.5h2M5 16.5h2M8 16.5h4M13 16.5h2M16 16.5h5M22 16.5h1M24 16.5h1M8 17.5h3M12 17.5h1M15 17.5h2M20 17.5h1M22 17.5h2M0 18.5h7M8 18.5h2M11 18.5h4M16 18.5h1M18 18.5h1M20 18.5h1M0 19.5h1M6 19.5h1M9 19.5h1M11 19.5h1M13 19.5h1M15 19.5h2M20 19.5h4M0 20.5h1M2 20.5h3M6 20.5h1M8 20.5h1M10 20.5h1M12 20.5h2M16 20.5h7M24 20.5h1M0 21.5h1M2 21.5h3M6 21.5h1M9 21.5h2M13 21.5h2M18 21.5h1M23 21.5h2M0 22.5h1M2 22.5h3M6 22.5h1M9 22.5h1M15 22.5h2M18 22.5h1M22 22.5h2M0 23.5h1M6 23.5h1M12 23.5h1M14 23.5h1M19 23.5h5M0 24.5h7M8 24.5h1M10 24.5h2M13 24.5h2M19 24.5h6' };
  // The card's first line is the shared reply, word for word (shared-text.json reply; check.py close_static_problems compares them).
  // The open-now line, its holiday list and OUT went on 2026-10-23: Franco, "They can just open the Google business" (the Google
  // profile carries the hours, so the site keeps no second copy that can go stale), and the promise audit (PROPAGATION D38, D46)
  // moved the 10 a.m. clock to the free call script and the voicemail greeting
  function callStatus() {
    return tr('We usually call you back the same business day.', 'Por lo general le devolvemos la llamada el mismo día hábil.');
  }
  L.callStatus = callStatus;   // test hook: check.py reads the line the card would show
  function initCallCard() {
    if (!('popover' in HTMLElement.prototype)) return;   // an older browser: the links dial, as on a phone
    var fine = matchMedia('(hover: hover) and (pointer: fine) and (min-width: 900px)');
    var card = null, anchor = null, closedAt = 0, closedFrom = null, first = new WeakMap();
    var links = function () { return $$('a[href^="tel:"], a[href^="sms:"]').filter(function (a) { return !a.closest('.callcard, .callbar'); }); };
    links().forEach(function (a) { first.set(a, a.getAttribute('href')); });
    var own = function (a) { return /^sms:/.test(a.getAttribute('href')) && first.has(a) && first.get(a) !== a.getAttribute('href'); };
    function mark() {   // the controls say they open a dialog only where they do
      links().forEach(function (a) {
        if (fine.matches && !own(a)) { a.setAttribute('aria-haspopup', 'dialog'); a.setAttribute('aria-controls', 'callcard'); a.setAttribute('aria-expanded', card && a === anchor && card.matches(':popover-open') ? 'true' : 'false'); }
        else ['aria-haspopup', 'aria-controls', 'aria-expanded'].forEach(function (n) { a.removeAttribute(n); });
      });
    }
    function build() {
      var mail = 'franco@lumorafl.com';
      card = document.createElement('div');
      card.className = 'callcard'; card.id = 'callcard'; card.tabIndex = -1;
      card.setAttribute('popover', 'auto'); card.setAttribute('role', 'dialog');
      card.setAttribute('aria-label', tr('Call or text us', 'Llámenos o escríbanos')); card.setAttribute('aria-describedby', 'cc-st');
      card.innerHTML = '<p class="cc-st" id="cc-st"></p>' +
        '<div class="cc-qr"><svg viewBox="-2 -2 29 29" aria-hidden="true" focusable="false"><path d=""/></svg><p class="cc-qc"></p></div>' +
        '<p class="cc-n">(352) 226-0681</p>' +
        '<p class="cc-tel"><a class="u" href="tel:+13522260681">' + tr('Call from this computer', 'Llamar desde esta computadora') + '</a></p>' +
        '<p class="cc-mail">' + tr('Or email ', 'O mándenos un correo a ') + '<a class="u" href="mailto:' + mail + '">' + mail + '</a></p>';
      document.body.appendChild(card);
      card.addEventListener('toggle', function (e) {
        if (e.newState === 'closed') {
          closedAt = performance.now(); closedFrom = anchor; mark();
          var a = document.activeElement; if (anchor && (!a || a === document.body || card.contains(a))) anchor.focus({ preventScroll: true });
        }
      });
      card.addEventListener('focusout', function (e) {   // Tab past the last link: the card steps aside and focus goes on
        if (e.relatedTarget && !card.contains(e.relatedTarget) && e.relatedTarget !== anchor && card.matches(':popover-open')) { anchor = null; card.hidePopover(); }
      });
    }
    function place() {
      var r = anchor.getBoundingClientRect(), hdr = anchor.closest('.hdr'), pin = pinned(anchor), w = card.offsetWidth, vw = document.documentElement.clientWidth;
      var x = r.left + r.width / 2 > vw / 2 ? r.right - w : r.left;   // its edge on the control's edge, on the control's side
      x = Math.max(16, Math.min(x, vw - w - 16));
      var top = hdr ? hdr.getBoundingClientRect().bottom + 8 : r.bottom + 10;
      if (pin && !hdr && top + card.offsetHeight > innerHeight - 16) top = Math.max(16, r.top - card.offsetHeight - 10);   // pinned and no room under it: above, never off the screen
      card.style.position = pin ? 'fixed' : 'absolute';
      card.style.left = (x + (pin ? 0 : scrollX)) + 'px';
      card.style.top = (top + (pin ? 0 : scrollY)) + 'px';
      var over = top + card.offsetHeight + 16 - innerHeight;   // under the control, never over the headline: the page moves up instead
      if (!pin && over > 0 && !noScroll) scrollBy({ top: over, behavior: still ? 'instant' : 'smooth' });
    }
    // a control that rides the screen (the header, the calculator's sticky estimate): the card is fixed to the screen too, and
    // follows it on scroll, since the page moving under it would leave the card behind
    function pinned(a) { for (var e = a.parentElement; e && e !== document.body; e = e.parentElement) { var p = getComputedStyle(e).position; if (p === 'fixed' || p === 'sticky') return e; } return null; }
    var noScroll = false;
    addEventListener('scroll', function () { if (card && anchor && card.matches(':popover-open') && pinned(anchor)) { noScroll = true; place(); noScroll = false; } }, { passive: true });
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="tel:"], a[href^="sms:"]');
      if (!a || !fine.matches || a.closest('.callcard, .callbar') || own(a) || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      if (closedFrom === a && performance.now() - closedAt < 400) { closedFrom = null; return; }   // the press that closed it was on this control
      if (!card) build();
      var text = /^sms:/.test(a.getAttribute('href'));
      anchor = a;
      $('.cc-st', card).innerHTML = callStatus();
      $('.cc-qr path', card).setAttribute('d', QR[text ? 'sms' : 'tel']);
      $('.cc-qc', card).textContent = text
        ? tr('Point your phone\'s camera at this code to text us. It opens a new message to our number.', 'Apunte la cámara de su celular a este código para escribirnos. Se abre un mensaje nuevo a nuestro número.')
        : tr('Point your phone\'s camera at this code to call. It opens your dialer with our number in it.', 'Apunte la cámara de su celular a este código para llamarnos. Se abre el teclado con nuestro número ya marcado.');
      $('.cc-tel', card).hidden = text;
      if (card.matches(':popover-open')) card.hidePopover();
      card.showPopover(); place(); mark();
      card.focus({ preventScroll: true });
    });
    addEventListener('resize', function () { if (!card || !card.matches(':popover-open')) return; if (fine.matches) place(); else card.hidePopover(); });
    if (fine.addEventListener) fine.addEventListener('change', mark);
    mark();
  }

  /* ================================================================ focus never hides under the sticky header or the call bar (WCAG 2.4.11) */
  // Browsers do not scroll an element that is already "in view" but sits under a fixed bar; scrollIntoView honours scroll-padding.
  // Industries review (2026-10-12): the call bar is position:fixed, so its offsetParent is always null and this never saw it
  // (the close's phone link sat 18px under it at 390); a bar counts when it has a box. A stretched link (its ::after covers the
  // whole row, the Industries index) draws its ring on that row, so the row is what must show. The test waits one frame, until
  // the browser's own focus scroll is done. check.py's FOCUS_JS measures the same box (ringBox).
  // Agency pass 2026-10-18 (QA, WCAG 2.4.7): only a link that is not positioned itself is a stretched row link. The footer logo's
  // ::after is its red layer at inset 0 on a position:relative link, its offsetParent the body, so Tab to it threw the page to the top
  var ringBox = function (el) { var a = getComputedStyle(el, '::after'); return a.position === 'absolute' && a.content !== 'none' && a.top === '0px' && a.bottom === '0px' && getComputedStyle(el).position === 'static' && el.offsetParent || el; };
  document.addEventListener('focusin', function (e) {
    var el = e.target; if (!el || !el.getBoundingClientRect || el.closest('.hdr, .callbar')) return;
    el = ringBox(el);
    var fix = function () {
      // checkers' pass (2026-10-24): an element a script has replaced since measures 0 and read as under the header, so a tap on the
      // walk's line (which rewrote its names) threw the page up 73px twice
      if (!el.isConnected) return;
      var r = el.getBoundingClientRect(), hdr = $('.hdr'), bar = $('.callbar');
      var top = hdr ? hdr.getBoundingClientRect().bottom : 0, bottom = bar && bar.getClientRects().length ? bar.getBoundingClientRect().top : innerHeight;
      // 2026-10-17 round 3: a walk's sticky tally bar stuck under the header covers focus too (Shift+Tab left Before / After 66% under it)
      $$('.tally').forEach(function (t) { if (t.contains(el) || !t.getClientRects().length || getComputedStyle(t).position !== 'sticky') return; var q = t.getBoundingClientRect();
        if (q.height && q.top <= top + 1 && q.bottom > top && q.left < r.right && q.right > r.left) top = q.bottom; });
      if (r.top < top) scrollBy({ top: r.top - top - 8, behavior: 'instant' }); else if (r.bottom > bottom) el.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    };
    // round 3: the browser's own focus scroll can land after the first frame (a long Shift+Tab jump into the walk), so the test runs again
    requestAnimationFrame(fix); setTimeout(fix, 60);
  });

  /* ================================================================ the footer's folds (alive build 2026-10-24, Franco's pick foot-fold,
     alive round item 16). Under 700px the How it works and Industries lists fold under their headings, half a screen off the end
     of every page. Each heading gets a button holding its own words, aria-expanded and aria-controls pointing at its list, which
     is hidden; Enter, Space or a tap shows it. The heading stays an h2 with the button inside (the WAI disclosure pattern): the
     round's details and summary made the heading a button and took it out of heading navigation. From 700px the button goes and
     every list shows, live as the width changes; with JavaScript off every list is open. The contact column and the legal rows
     never fold, and the footer part (parts/foot.*.html) is unchanged. system.css section 25; check.py FOLD_JS */
  function initFolds() {
    // checkers' pass (2026-10-24): only a page that loads system.css has the fold's look (section 25). The old build's pages (the
    // articles, Privacy, 404, /hi/, /met/) load /v4/system.js for the header but not system.css, and their footers have the same
    // columns: folded there, each heading became a bare grey browser button 19px tall. Their lists stay open. check.py fold_old_problems
    if (!$('link[rel="stylesheet"][href*="system.css"]')) return;
    var mq = matchMedia('(max-width: 699px)');
    var cols = $$('.foot nav.foot-col').map(function (nav, i) {
      var h = $('.foot-h', nav), ul = $(':scope > ul', nav); if (!h || !ul) return null;
      if (!ul.id) ul.id = (h.id || 'foot-col-' + i) + '-list';
      return { h: h, ul: ul, words: h.textContent };
    }).filter(Boolean);
    var set = function () {
      cols.forEach(function (c) {
        var b = $('.foot-fold', c.h);
        if (mq.matches && !b) {
          b = document.createElement('button'); b.type = 'button'; b.className = 'foot-fold';
          b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-controls', c.ul.id);
          b.textContent = c.words; c.h.textContent = ''; c.h.appendChild(b); c.ul.hidden = true;
          b.addEventListener('click', function () { var open = b.getAttribute('aria-expanded') !== 'true'; b.setAttribute('aria-expanded', open ? 'true' : 'false'); c.ul.hidden = !open; });
        } else if (!mq.matches && b) { c.h.textContent = c.words; c.ul.hidden = false; }
      });
    };
    set();
    if (mq.addEventListener) mq.addEventListener('change', set); else if (mq.addListener) mq.addListener(set);
  }

  /* ================================================================ start */
  // Franco 2026-10-19: each nav link carries its own label, so .nav a::after reserves its semibold width and the row never shifts
  // between pages (with JS off only that reserve goes, never the mark)
  $$('.nav a').forEach(function (a) { a.dataset.label = a.textContent.trim(); });
  initMenu();
  initFolds();   // alive build 2026-10-24 (foot-fold)
  initPickers();
  rollWatch();   // alive build 2026-10-24 (digits-roll): NumberFlow loads on the first touch of the picker
  initCallCard();   // design round item 2 (2026-10-19)
  var start = [qs.get('trade'), locked ? null : store.get('lumora.trade'), document.body.dataset.trade, 'plumbing'].filter(function (k) { return k && D[k]; })[0];
  if (locked) start = document.body.dataset.trade;
  // the generalist Home (2026-10-30; Franco, Oct 27: "just keeping it generalist, so the offices"): body data-sample-lock shows the
  // page's own sample whatever a ?trade= link or a stored pick says, and never stores it, so the industry pages keep remembering the
  // visitor's own trade. Unlike data-trade-lock it makes the page no trade page (no fit-pairs, no trade page's checks)
  var fixed = document.body.hasAttribute('data-sample-lock') && D[document.body.dataset.trade];
  if (fixed) start = document.body.dataset.trade;
  // a choice already made: this trade's own page, ?trade= or a pick stored on an earlier page (trades-1 fix, 2026-10-07)
  L.picked = locked || (!fixed && (!!(qs.get('trade') && D[qs.get('trade')]) || !!(store.get('lumora.trade') && D[store.get('lumora.trade')])));
  $$('[data-loop]').forEach(function (el) { loops.push(new Loop(el)); });
  if (start) setTrade(start, false);
  initG2R(document, false);
  // item 5 (2026-10-19): iPhone Safari shows a control's :active press only when the page listens for touches; one passive listener
  // turns on the press states the system already defines (the switch, the call bar, the buttons)
  document.addEventListener('touchstart', function () {}, { passive: true });
  initDraw(document);
  pencil(document);
  $$('[data-leak]').forEach(initLeak);
  $$('[data-tabs]').forEach(initTabs);
  // job: show our work, once on load (no loop, so no pause is needed)
  // The writing is CSS on .sheet[data-fill] (so prerendered rows never flash before it starts). On a phone the sheet
  // sits below the fold, so it holds its first frame (.wait) until it comes into view, instead of writing unseen. Resume pass
  // 2026-10-19 (craft judge: on Plumbing's phone the sheet arrived with a blank band where its total writes in, 600ms after the
  // scroll stopped): it starts when its top passes 85% of the screen, so the total has landed by the time the sheet is in view.
  $$('.sheet[data-fill]').forEach(function (s) {
    if (still) { s.classList.add('still'); return; }
    s.classList.add('writing');
    if (!('IntersectionObserver' in window) || s.getBoundingClientRect().top < innerHeight * 0.8) return;
    s.classList.add('wait');
    var io = new IntersectionObserver(function (es) { if (!es[0].isIntersecting) return;
      io.disconnect(); s.classList.remove('wait'); }, { rootMargin: '0px 0px -15% 0px', threshold: 0 });
    io.observe(s);
  });
  $$('.pen-ring').forEach(ring);
  seatBar(true);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { $$('.pen-ring').forEach(ring); tally.update(); $$('.pair[data-pair]').forEach(fitPair); fitCrops(); pencil(document, true); seatBar(true); });
  if (qs.has('lint')) { var r = L.lint(); console.log('Lumora lint', r); }
})();
