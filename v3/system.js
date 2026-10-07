/* Lumora design system: behaviour. Plain JS, no library. Load after trades.js, with defer.
   Every motion names its job in a comment (feedback, state change, cause and effect, show our work, one-time focus).
   The page is complete without this file: chips are links, sheets are prerendered, ghost-to-real figures show the fixed
   state, the night band shows its finished frame, the tally shows the full sheet.
   Public API on window.Lumora: trade, trades, money(n), setTrade(key), on(fn), draw(el), ring(svg), lint(). */
(function () {
  'use strict';
  var D = window.LUMORA_TRADES || {}, ORDER = window.LUMORA_ORDER || Object.keys(D);
  var root = document.documentElement; root.classList.add('js');
  var qs = new URLSearchParams(location.search);
  var still = qs.has('still') || matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = matchMedia('(hover: hover) and (pointer: fine)');
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); };
  var money = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };
  var total = function (t) { return t.rows.reduce(function (a, r) { return a + r.usd; }, 0); };
  var perWord = function (t) { return t.per === 'yr' ? 'a year' : 'a month'; };
  var perShort = function (t) { return t.per === 'yr' ? ' / yr' : ' / mo'; };
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) { /* storage blocked: the page still works */ } }
  };
  var listeners = [];
  var L = window.Lumora = { still: still, trades: D, money: money, trade: null,
    on: function (fn) { listeners.push(fn); } };

  /* ================================================================ the red pen */
  // The ring is redrawn in real pixels (Catmull-Rom through hand-drawn points) so the stroke never stretches.
  var RING = [[14.2,22.4],[18.1,17.3],[23,12.7],[28.7,8.9],[35,6.2],[41.9,4.7],[48.8,4.4],[55.7,5.4],[62.1,7.3],[68.1,10],[73.7,13.3],[78.7,17.1],[83.4,21.2],[87.7,25.7],[91.6,30.6],[94.9,36.1],[97.4,42],[98.9,48.4],[99.2,54.9],[98,61.5],[95.6,67.7],[92,73.3],[87.4,78.2],[82.1,82.3],[76.4,85.7],[70.4,88.4],[64.3,90.5],[58,92.2],[51.6,93.3],[44.9,93.8],[38.1,93.6],[31.3,92.4],[24.7,90.1],[18.6,86.7],[13.4,82.2],[9.1,76.9],[6.1,71],[4.2,64.7],[3.3,58.3],[3.3,52],[4,45.8],[5.3,39.8],[7.1,33.9],[9.6,28],[12.7,22.4],[16.7,17.1],[21.5,12.3],[27.3,8.3],[33.7,5.3]];
  function ring(svg) {
    if (!svg) return;
    var w = svg.clientWidth || svg.getBoundingClientRect().width, h = svg.clientHeight || svg.getBoundingClientRect().height;
    if (!w || !h) return;
    w = Math.round(w); h = Math.round(h);
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h); svg.removeAttribute('preserveAspectRatio');
    var P = RING.map(function (p) { return [p[0] / 102 * w, p[1] / 98 * h]; }), f = function (n) { return n.toFixed(1); };
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
    var t0 = performance.now();
    (function step(now) { var k = Math.min(1, (now - t0) / 500), e = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(from + (to - from) * e); if (k < 1) requestAnimationFrame(step); })(t0);
  }
  L.ring = ring; L.draw = draw;

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
      [[48, 64, -7, g[0]], [82, 132, 5, g[1]], [58, 204, -2, g[2]]].forEach(function (q) {
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
  function recentsHTML() {             // plumbing stop: the shop phone, the missed call circled in pencil
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
  function realHTML(R) {               // the fix, as the real screen or paper the shop would use
    if (R.frame === 'phone') return '<div class="scr-phone"><div class="ph"><div class="ph-sb"><span>9:41</span><i></i></div><div class="ph-who"><i></i>' + esc(R.who) + '</div><div class="thread">' +
      R.msgs.map(function (m, i) { return '<p class="' + (m[0] === 'sys' ? 'sys' + (i === R.msgs.length - 1 ? ' k' : '') : 'bub ' + m[0]) + '">' + esc(m[1]) + '</p>'; }).join('') + '</div></div></div>';
    if (R.frame === 'clip') return '<div class="doc-clip"><span class="clamp" aria-hidden="true"><i></i></span><div class="doc">' + docBody(R, true) + '</div></div>';
    if (R.frame === 'paper') return '<div class="doc tilt-r">' + docBody(R, true) + '</div>';
    return '<div class="scr-win"><div class="win-tb"><i></i><i></i><i></i><span>' + esc(R.title) + '</span></div><div class="win-b">' + docBody(R, false) + '</div></div>';
  }
  function altAfter(R) {
    return R.frame === 'phone' ? 'Sample, fixed: a text thread on the shop phone with ' + R.who + '. ' + R.msgs.map(function (m) { return m[1]; }).join('. ') + '.'
      : 'Sample, fixed: ' + R.title + (R.meta ? ', ' + R.meta : '') + '. ' + (R.badge ? R.badge[1] + '.' : '') + (R.total ? ' ' + R.total[0] + ' ' + R.total[1] + '.' : '');
  }
  function altBefore(row) {
    if (row.before.kind === 'whiteboard') return 'Sample, as we find it: the office whiteboard. Garcia\'s water heater visit is under Tuesday; "Quote Garcia" is under Friday, with an arrow back to Tuesday.';
    if (row.before.kind === 'recents') return 'Sample, as we find it: the shop phone\'s Recents. Two missed calls from (352) 555-0131 at 6:12 PM, circled, and no call back.';
    return 'Sample, as we find it: drawing of ' + row.place.toLowerCase() + ': ' + row.before.g.map(function (v) { return v.replace('|', ' '); }).join(', ') + '.';
  }
  function beforeHTML(row) { return row.before.kind === 'whiteboard' ? whiteboardHTML() : row.before.kind === 'recents' ? recentsHTML() : ghostSVG(row.before.ghost, row.before.g); }
  L.render = { ghost: ghostSVG, real: realHTML, whiteboard: whiteboardHTML, recents: recentsHTML };

  /* ================================================================ binders: everything the trade choice rewrites */
  var shown = {};
  var BIND = {
    sheet: function (el, t, animate) {
      var f = function (k) { return el.querySelector('[data-f="' + k + '"]'); };
      if (f('sub')) f('sub').textContent = t.sub;
      if (f('per')) f('per').textContent = t.per === 'yr' ? 'A year' : 'A month';
      var ringOn = el.hasAttribute('data-ring');
      if (f('rows')) f('rows').innerHTML = t.rows.map(function (r, i) {
        return '<li style="--i:' + i + '"><div class="sh-l"><b>' + esc(r.b) + '</b><small>' + esc(r.f) + '</small></div><span class="sh-usd">' + money(r.usd) + (i === 0 && ringOn ? RING_SVG : '') + '</span></li>'; }).join('');
      if (f('total')) f('total').textContent = money(total(t)) + perShort(t);
      var tm = f('time'); if (tm) { tm.hidden = !t.time; if (t.time) tm.innerHTML = 'Time back for you or your office: <b>' + esc(t.time) + '</b>'; }
      $$('.pen-ring', el).forEach(ring);
      if (animate && !still) { el.classList.remove('writing', 'swap'); void el.offsetWidth; el.classList.add('swap'); } // job: cause and effect
    },
    strip: function (el, t) {
      var s = function (k) { return el.querySelector('[data-s="' + k + '"]'); }, r = t.rows[0];
      if (s('sub')) s('sub').textContent = t.short; if (s('leak')) s('leak').textContent = r.b;
      if (s('usd')) s('usd').textContent = money(r.usd) + perShort(t); if (s('f')) s('f').textContent = r.f;
      if (el.tagName === 'A') el.href = '#' + ($('[data-bind=sheet]') ? $('[data-bind=sheet]').id || 'sheet' : 'sheet');
    },
    text: function (el, t) { var v = t[el.getAttribute('data-field')]; if (v != null) el.textContent = v; },
    bigfig: function (el, t) {
      var f = function (k) { return el.querySelector('[data-f="' + k + '"]'); }, sum = total(t);
      rollTo(f('n'), shown.big, sum, money); shown.big = sum;
      if (f('per')) f('per').textContent = perWord(t);
      if (f('sub')) f('sub').textContent = t.sub;
      if (f('time')) { f('time').hidden = !t.time; if (t.time) f('time').innerHTML = 'Time back for you or your office: <b>' + esc(t.time) + '</b>.'; }
      if (f('eq')) f('eq').innerHTML = t.rows.map(function (r, i) { return (i ? '<i>+</i>' : '') + '<span>' + money(r.usd) + ' <small>' + esc(r.b.charAt(0).toLowerCase() + r.b.slice(1)) + '</small></span>'; }).join('') +
        '<i>=</i><span class="r">' + money(sum) + ' <small>' + perWord(t) + '</small></span>';
      $$('.pen-ring', el).forEach(function (s) { requestAnimationFrame(function () { ring(s); }); });
    },
    walk: function (el, t, animate) {
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
        var sub = tl.querySelector('[data-f="tsub"]'); if (sub) sub.textContent = t.shop + ', ' + t.short.split(', ').slice(1).join(', ');
      }
      var plan = el.querySelector('[data-f="plan-sub"]'); if (plan) plan.textContent = t.shop;
      initG2R(list, animate); initDraw(list); tally.bind(el, t);
    },
    night: function (el, t) {
      var nts = el.querySelector('.nts'); if (!nts) return;
      var PH = '<svg viewBox="0 0 16 16" width="17" height="17"><path fill="#fff" d="M3.6 6.7a8 8 0 0 0 5.7 5.7l1.4-1.4c.2-.2.5-.3.7-.2.7.3 1.5.4 2.3.4.4 0 .7.3.7.7v2.2c0 .4-.3.7-.7.7A11.5 11.5 0 0 1 2 3.1c0-.4.3-.7.7-.7h2.2c.4 0 .7.3.7.7 0 .8.1 1.6.4 2.3.1.2 0 .5-.2.7z"/></svg>',
        MS = '<svg viewBox="0 0 16 16" width="17" height="17"><path fill="#fff" d="M8 2.2c3.6 0 6.4 2.3 6.4 5.2S11.6 12.6 8 12.6c-.7 0-1.3-.1-1.9-.2L3 14l.8-2.7C2.4 10.4 1.6 9 1.6 7.4 1.6 4.5 4.4 2.2 8 2.2z"/></svg>',
        LS = '<svg viewBox="0 0 16 16" width="17" height="17"><path fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" d="M5.5 4.5h7M5.5 8h7M5.5 11.5h7M2.8 4.5h.4M2.8 8h.4M2.8 11.5h.4"/></svg>';
      var N = [['cb', LS, 'Callback list · 7:30 AM', '', '2 callers, both texted back within a minute.', ''],
        ['', PH, 'Missed Call', '6:38 AM', '(352) 555-0148', 'On the callback list'],
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
          '<div class="mo-foot"><span>From your own job list, invoices and call log</span><span>Sample</span></div>';
        list.setAttribute('role', 'img');
        list.setAttribute('aria-label', 'Sample morning list for ' + t.shop + ': ' + m.lines.map(function (l) { return l[0] + ', ' + l[1]; }).join('; ') + '.');
      }
      var log = el.querySelector('[data-f="log"]');
      if (log) log.innerHTML = m.log.map(function (l) { return '<li><time>' + esc(l[0]) + '</time><span>' + esc(l[1]) + '</span></li>'; }).join('');
    },
    idx: function (el, t, animate, key) {
      $$('a[data-t]', el).forEach(function (a) {
        var tag = a.querySelector('.your'); if (tag) tag.remove();
        if (a.dataset.t === key) { var b = a.querySelector('b'); if (b) b.insertAdjacentHTML('beforeend', '<span class="your">Your trade</span>'); }
      });
      showFig(el, key, false);
    }
  };
  function showFig(el, key, preview) {
    var box = el.querySelector('[data-f="fig"]'); if (!box || !D[key]) return;
    if (!box.children.length) box.innerHTML = ORDER.map(function (k) { return '<img data-t="' + k + '" src="' + (box.dataset.base || '') + D[k].fig + '" alt="" width="600" height="520" loading="lazy" decoding="async">'; }).join('');
    $$('img', box).forEach(function (im) { var on = im.dataset.t === key; im.classList.toggle('on', on); im.alt = on ? D[key].figAlt : ''; if (on) im.loading = 'eager'; });
    var cap = el.querySelector('[data-f="figcap"]'); if (cap) cap.textContent = D[key].figCap;
    $$('a[data-t]', el).forEach(function (a) { a.classList.toggle('pv', preview && a.dataset.t === key); });
  }

  /* ================================================================ the trade picker */
  var locked = document.body.hasAttribute('data-trade-lock');
  function setTrade(key, animate) {
    if (!D[key]) return;
    var changed = key !== L.trade; L.trade = key;
    store.set('lumora.trade', key);                   // carried onto the trade pages
    $$('[data-picker]').forEach(function (p) {
      $$('.chip', p).forEach(function (c) { var on = c.dataset.t === key; c.setAttribute('aria-checked', on ? 'true' : 'false'); c.removeAttribute('aria-current'); c.tabIndex = on ? 0 : -1; });
      var sel = p.querySelector('select'); if (sel) sel.value = key;
    });
    var t = D[key];
    $$('[data-bind]').forEach(function (el) { var fn = BIND[el.getAttribute('data-bind')]; if (fn) fn(el, t, animate && changed, key); });
    listeners.forEach(function (fn) { fn(key, t, animate && changed); });
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
    var lab = g.getAttribute('data-label-' + state); if (lab) g.setAttribute('aria-label', lab);
    var scope = g.closest('.stop, [data-g2r-scope]') || g.parentNode;
    $$('[data-show]', scope).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.show === state ? 'true' : 'false'); });
    // job: cause and effect. The stop's money underline draws as the fix lands, not before it (it waits; see initG2R)
    if (state === 'after') $$('[data-draw]', g.closest('.stop, [data-g2r-scope]') || g).forEach(function (p) { p.removeAttribute('data-wait'); draw(p, 380); });
  }
  // job: state change. The shop as we find it is the recognition moment, so it gets time on screen: the fix lands once
  // the picture is 55% in view (or fills half the screen) and has stayed there 600ms. Scroll past fast and it waits.
  var g2rIO = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) { var g = e.target; clearTimeout(g._g2r);
      if (!e.isIntersecting || (e.intersectionRatio < 0.55 && e.intersectionRect.height < innerHeight * 0.5)) return;
      g._g2r = setTimeout(function () { g2rIO.unobserve(g); if (!g.dataset.touched) setG2R(g, 'after'); }, 600); });
  }, { threshold: [0, 0.3, 0.55, 0.8] }) : null;
  function initG2R(scope, redraw) {
    $$('[data-g2r]', scope).forEach(function (g) {
      if (g.dataset.ready) return; g.dataset.ready = '1';
      var sc = g.closest('.stop, [data-g2r-scope]') || g.parentNode;
      $$('[data-show]', sc).forEach(function (b) { b.addEventListener('click', function () { g.dataset.touched = '1'; setG2R(g, b.dataset.show); }); });
      g.addEventListener('pointerenter', function () { if (fine.matches && g.dataset.state === 'before') setG2R(g, 'after'); });  // job: signifier. Hover a ghost and it comes to life
      if (redraw && !still) $$('.ghost', g).forEach(function (x) { x.classList.add('draw'); });
      // the still default is the fixed state; with motion allowed, figures below the fold start as found and turn real in view
      if (!still && g2rIO && g.getBoundingClientRect().top > innerHeight * 0.8) { setG2R(g, 'before'); g2rIO.observe(g); $$('[data-draw]', g.closest('.stop, [data-g2r-scope]') || g).forEach(function (p) { p.setAttribute('data-wait', ''); }); }
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
        var tot = walk.querySelector('[data-tally] [data-f="tot"]'), tper = walk.querySelector('[data-tally] [data-f="tper"]');
        if (tot) tot.textContent = n ? money(sum) : '';                                     // never "$0": empty until a stop counts
        if (tper) tper.textContent = n ? (t.per === 'yr' ? 'A year' : 'A month') + (all ? '' : ', so far') : 'Adds up as you scroll';
        var bs = walk.querySelector('[data-f="bar-stop"]'), bu = walk.querySelector('[data-f="bar-usd"]');
        var next = stops[Math.min(n, stops.length - 1)];
        if (bs) bs.textContent = all ? 'Walk done, ' + n + ' of ' + n + ' stops' : 'Stop ' + Math.min(n + 1, stops.length) + ' of ' + stops.length + ' · ' + (next ? next.dataset.place : '');
        if (bu) bu.textContent = n ? money(sum) + ' ' + perWord(t) + (all ? '' : ' so far') : t.shop + ' · Sample';  // never "$0 so far"
      });
    }
  };
  var tick = 0;
  addEventListener('scroll', function () { if (tick) return; tick = requestAnimationFrame(function () { tick = 0; tally.update(); }); }, { passive: true });
  addEventListener('resize', function () { clearTimeout(L._rz); L._rz = setTimeout(function () { $$('.pen-ring').forEach(ring); tally.update(); }, 150); });

  /* ================================================================ loops: the night band (pause control, off-screen pause) */
  var loops = [];
  function Loop(el) {
    var self = this, btn = el.querySelector('.pause'), step = -1, timer = 0, user = false, seen = false, plays = 0;
    self.el = el;
    var items = function () { return $$('.nt:not(.cb)', el).reverse(); };       // oldest first
    function frame() {
      if (still || !el.classList.contains('run')) { $$('.nt', el).forEach(function (n) { n.classList.add('on'); }); el.classList.add('fixed'); return; }
      var it = items(); it.forEach(function (n, i) { n.classList.toggle('on', i <= step); });
      var cb = el.querySelector('.nt.cb'); if (cb) cb.classList.toggle('on', step >= it.length);
      el.classList.toggle('fixed', step >= it.length);
    }
    function next() {                                   // job: cause and effect. The night lands call by call, then the text-back answers each
      clearTimeout(timer);
      var n = items().length;
      if (step >= n) { plays++; if (plays >= 3) { el.classList.remove('run'); frame(); if (btn) btn.hidden = true; return; } step = -1; } else step++;
      frame();
      timer = setTimeout(next, step === -1 ? 700 : step < n - 1 ? 850 : step === n - 1 ? 1600 : 4400);   // about 10 s a play; stops on the finished frame after 3
    }
    function running() { return el.classList.contains('run') && !user && seen && !document.hidden; }
    function sync() { clearTimeout(timer); if (running()) timer = setTimeout(next, 600); }
    self.reset = function () { step = -1; frame(); sync(); };
    if (still) { if (btn) btn.hidden = true; frame(); return; }
    el.classList.add('run'); frame();
    if (btn) btn.addEventListener('click', function () {
      user = !user; btn.setAttribute('aria-pressed', user ? 'true' : 'false');
      var lab = btn.querySelector('.pt'); if (lab) lab.textContent = user ? 'Play animation' : 'Pause animation';
      sync();
    });
    document.addEventListener('visibilitychange', sync);
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { seen = es[0].isIntersecting; sync(); }, { threshold: 0.25 }).observe(el);
  }

  /* ================================================================ the leak check (only his own input moves the figure) */
  function initLeak(form) {
    var num = function (v) { v = String(v).replace(/[$,%\s]/g, ''); return v === '' ? NaN : +v; };
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
    var set = function (o) { nav.classList.toggle('open', o); b.setAttribute('aria-expanded', o ? 'true' : 'false'); b.textContent = o ? 'Close' : 'Menu'; };
    b.addEventListener('click', function () { set(!nav.classList.contains('open')); });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) set(false); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { set(false); b.focus(); } });
  }

  /* ================================================================ lint: the variety and trust rules, checkable */
  // Lumora.lint() returns {errors, warnings}. check.py calls it; ?lint in the URL prints it in the console.
  L.lint = function () {
    var E = [], W = [], catalog = document.body.hasAttribute('data-catalog');
    var vis = function (el) { var r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; };
    var text = document.body.innerText;
    if (/[—–]/.test(text)) E.push('Em or en dash in visible text.');
    if (/!/.test(text.replace(/<!--[\s\S]*?-->/g, ''))) E.push('Exclamation mark in visible text.');
    (text.match(/\(352\) \d{3}-\d{4}/g) || []).forEach(function (p) { if (p !== '(352) 226-0681' && !/\(352\) 555-01\d\d/.test(p)) E.push('Phone outside the sample range: ' + p); });
    if (!catalog) {
      var p500 = (text.match(/\$500\b/g) || []).length; if (p500 > 1) E.push('"$500" appears ' + p500 + ' times (only the one price sentence).');
      var rings = $$('.pen-ring').filter(vis).length; if (rings > 1) E.push(rings + ' pen rings on the page (one per page).');
      var disp = $$('.t-display').length; if (disp > 1) E.push(disp + ' display money figures (one per page).');
      var nights = $$('main [data-ground=night]').length; if (nights > 1) E.push(nights + ' ink bands (one per page).');
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
    $$('.pic, .sheet, .morning').forEach(function (p) { if (!/sample/i.test(p.innerText + (p.getAttribute('aria-label') || ''))) W.push('Picture without a visible "Sample" label: ' + (p.id || p.className)); });
    $$('a[href^="sms:"]').forEach(function (a) { if (!/body=/.test(a.getAttribute('href'))) W.push('sms: link without a prefilled body.'); });
    // type floors at the current width: 12px inside pictures always; 15px for key text outside pictures on phones
    if (innerWidth <= 430) {
      var small = [], tiny = [];
      var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      while (walker.nextNode()) {
        var n = walker.currentNode, el = n.parentElement; if (!n.nodeValue.trim() || !el || el.closest('.sr,script,style,noscript')) continue;   // aria-hidden text still has to be readable
        if (!vis(el)) continue;
        var fs = parseFloat(getComputedStyle(el).fontSize);
        if (el instanceof SVGElement && el.getScreenCTM) { var m = el.getScreenCTM(); if (m) fs *= Math.hypot(m.a, m.b); }   // svg text: the size it renders at
        var inPic = el.closest('.pic,.plan,.inpic,.fn,.ghost,.scr-lock,.morning,.wb,.ticket,.doc,.xl,.county,.samp');
        if (fs < 12) tiny.push(n.nodeValue.trim().slice(0, 30) + ' (' + fs + 'px)');
        else if (fs < 15 && !inPic) small.push(n.nodeValue.trim().slice(0, 30) + ' (' + fs + 'px)');
      }
      if (tiny.length) E.push('Text under 12px: ' + tiny.slice(0, 8).join('; '));
      if (small.length) W.push('Text under 15px outside pictures: ' + small.slice(0, 8).join('; '));
    }
    return { errors: E, warnings: W };
  };

  /* ================================================================ focus never hides under the sticky header or the call bar (WCAG 2.4.11) */
  // Browsers do not scroll an element that is already "in view" but sits under a fixed bar; scrollIntoView honours scroll-padding.
  document.addEventListener('focusin', function (e) {
    var el = e.target; if (!el || !el.getBoundingClientRect || el.closest('.hdr, .callbar')) return;
    var r = el.getBoundingClientRect(), hdr = $('.hdr'), bar = $('.callbar');
    var top = hdr ? hdr.getBoundingClientRect().bottom : 0, bottom = bar && bar.offsetParent ? bar.getBoundingClientRect().top : innerHeight;
    if (r.top < top || r.bottom > bottom) el.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  });

  /* ================================================================ start */
  initMenu();
  initPickers();
  var start = [qs.get('trade'), locked ? null : store.get('lumora.trade'), document.body.dataset.trade, 'plumbing'].filter(function (k) { return k && D[k]; })[0];
  if (locked) start = document.body.dataset.trade;
  $$('[data-loop]').forEach(function (el) { loops.push(new Loop(el)); });
  if (start) setTrade(start, false);
  initG2R(document, false);
  initDraw(document);
  $$('[data-leak]').forEach(initLeak);
  $$('[data-tabs]').forEach(initTabs);
  // job: show our work, once on load (no loop, so no pause is needed)
  // The writing is CSS on .sheet[data-fill] (so prerendered rows never flash before it starts). On a phone the sheet
  // sits below the fold, so it holds its first frame (.wait) until it is a third in view, instead of writing unseen.
  $$('.sheet[data-fill]').forEach(function (s) {
    if (still) { s.classList.add('still'); return; }
    s.classList.add('writing');
    if (!('IntersectionObserver' in window) || s.getBoundingClientRect().top < innerHeight * 0.8) return;
    s.classList.add('wait');
    var io = new IntersectionObserver(function (es) { if (es[0].intersectionRatio < 0.33 && es[0].intersectionRect.height < innerHeight * 0.4) return;
      io.disconnect(); s.classList.remove('wait'); }, { threshold: [0, 0.33, 0.6] });
    io.observe(s);
  });
  $$('.pen-ring').forEach(ring);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { $$('.pen-ring').forEach(ring); tally.update(); });
  if (qs.has('lint')) { var r = L.lint(); console.log('Lumora lint', r); }
})();
