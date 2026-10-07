/* How it works + About only. Light page motion on top of system.js (SYSTEM.md section 9). Load after system.js, with defer.
   Nothing here loops, so no pause control is needed. Every sequence is CSS (how-about.css, "motion"): first frames
   exist only under html.js and prefers-reduced-motion: no-preference, as animations with fill "both", so if this file
   never runs a sequence still plays to its end. This file only:
   - holds a sequence (.wait) until it can end on screen, and ends it at once under ?still (.still); real-scroll check:
     python scrolltest.py (motion.py freezes and seeks, so it cannot see how a sequence lines up with scrolling)
   - numbers the items of a .seq list (--i) for the stagger
   - times each floor-plan stop to the moment the drawn route reaches it
   - pairs a plan stop with its line in the list (hover and focus light it; a click or tap picks it)
   - opens a disclosure when a link points at it ("Full terms") */
(function () {
  'use strict';
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var still = (window.Lumora && window.Lumora.still) || /[?&]still\b/.test(location.search) || matchMedia('(prefers-reduced-motion: reduce)').matches;

  // the part of the screen a reader actually sees: below the sticky header, above the phone call bar
  var hdr = document.querySelector('.hdr'), bar = document.querySelector('.callbar');
  function band() {
    var b = innerHeight - (bar && getComputedStyle(bar).display !== 'none' ? bar.offsetHeight : 0);
    return [hdr ? Math.max(0, hdr.getBoundingClientRect().bottom) : 0, b];
  }
  function fullyIn(el, bd) { var r = el.getBoundingClientRect(); return r.top >= bd[0] - 1 && r.bottom <= bd[1] + 1; }
  function bottomIn(el, bd) { var b = el.getBoundingClientRect().bottom; return b > bd[0] && b <= bd[1] + 1; }

  // job: show our work. Every sequence must END where the reader is looking (most end beats sit at the bottom of their
  // block). A block that fits the screen starts once its bottom is in view (not "all of it": a block nearly a screen tall
  // is fully in view for only a few pixels, and one flick skips that). A taller block (the full sheet, At a glance on a
  // laptop) starts once it covers 60% of the screen or its first item is in view, and then each of its items (.seq children, [data-beat]) writes
  // itself when that item's bottom is in view; items that come in together keep their stagger (--i = order in the batch).
  // While the page is scrolling, a started sequence pauses when less than half of it is on screen, so a skimming reader
  // never has the last beat play where nobody sees it; once scrolling stops (200ms), any part on screen plays on, so a
  // reader who stops at a half-visible block never looks at a frozen one. Nothing loops; once finished, it is let go.
  function once() {
    var held = [];
    $$('[data-once]').forEach(function (s) {
      $$('.seq', s).concat(s.classList.contains('seq') ? [s] : []).forEach(function (list) {
        Array.prototype.forEach.call(list.children, function (c, i) { c.style.setProperty('--i', i); });
      });
      if (still) { s.classList.add('still'); return; }
      var bd = band(), h = { el: s, items: [] };
      if (s.getBoundingClientRect().height > bd[1] - bd[0]) {
        s.classList.add('tall');
        $$('.seq > *, [data-beat]', s).forEach(function (el) { el.classList.add('wait'); h.items.push({ el: el }); });
      }
      s.classList.add('wait'); held.push(h);
    });
    if (!held.length) return;
    var queued = false;
    function ready(h, bd) {
      var r = h.el.getBoundingClientRect(), H = bd[1] - bd[0];
      if (r.height <= H) return bottomIn(h.el, bd);
      // taller: 60% of the screen, or its first item is in view (a reader resting with the top of the sheet low on the
      // screen must not look at blank rows)
      return Math.min(r.bottom, bd[1]) - Math.max(r.top, bd[0]) >= 0.6 * H || (h.items.length > 0 && bottomIn(h.items[0].el, bd));
    }
    var idle = true, timer;
    function seen(el, bd) {             // scrolling: half of it on screen (half the screen, if taller); stopped: any of it
      var r = el.getBoundingClientRect(), v = Math.min(r.bottom, bd[1]) - Math.max(r.top, bd[0]);
      return idle ? v > 0 : v >= 0.5 * Math.min(r.height, bd[1] - bd[0]);
    }
    function done(el) { return el.getAnimations({ subtree: true }).every(function (a) { return a.playState === 'finished'; }); }
    function check() {
      queued = false;
      var bd = band();
      held = held.filter(function (h) {
        if (!h.go && ready(h, bd)) h.go = true;
        if (!h.go) return true;
        var k = 0;
        h.items.forEach(function (it) {
          if (!it.go && bottomIn(it.el, bd)) { it.go = true; it.el.style.setProperty('--i', k++); }
          it.el.classList.toggle('wait', !it.go || !seen(it.el, bd));
        });
        h.el.classList.toggle('wait', !seen(h.el, bd));
        h.items = h.items.filter(function (it) { return !it.go || !done(it.el); });
        return h.items.length || !done(h.el);
      });
      if (!held.length) { removeEventListener('scroll', queue); removeEventListener('resize', queue); clearTimeout(timer); }
    }
    function queue() {
      idle = false; clearTimeout(timer); timer = setTimeout(function () { idle = true; check(); }, 200);
      if (!queued) { queued = true; requestAnimationFrame(check); }
    }
    addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
    check();
  }

  // job: show our work. The route is drawn from the door at walking pace; each stop number lands as the line reaches it.
  // ROUTE_* and EASE must match the .pl-route-m rule in how-about.css.
  // 1.4 s, not 2 s: at 2 s a reader who keeps scrolling had stop 4 land after the plan had left the screen
  var ROUTE_DELAY = 200, ROUTE_MS = 1400, EASE = [0.45, 0, 0.55, 1];
  function timeAt(f) {                  // the moment (0..1) a cubic-bezier animation reaches progress f
    var b = function (s, p1, p2) { return 3 * (1 - s) * (1 - s) * s * p1 + 3 * (1 - s) * s * s * p2 + s * s * s; };
    var lo = 0, hi = 1, s = f;
    for (var k = 0; k < 30; k++) { s = (lo + hi) / 2; if (b(s, EASE[1], EASE[3]) < f) lo = s; else hi = s; }
    return b(s, EASE[0], EASE[2]);
  }
  function planTiming(plan) {
    var path = plan.querySelector('.pl-route-m'), svg = plan.querySelector('svg');
    if (!path || !svg || !path.getTotalLength) return;
    var vb = svg.viewBox.baseVal, len = path.getTotalLength(), N = 240, pts = [];
    for (var k = 0; k <= N; k++) { var p = path.getPointAtLength(len * k / N); pts.push([p.x, p.y]); }
    $$('.plan-stops a', plan).forEach(function (a) {
      var x = parseFloat(a.style.getPropertyValue('--x')) / 100 * vb.width, y = parseFloat(a.style.getPropertyValue('--y')) / 100 * vb.height;
      var best = 0, bd = Infinity;
      pts.forEach(function (q, i) { var d = (q[0] - x) * (q[0] - x) + (q[1] - y) * (q[1] - y); if (d < bd) { bd = d; best = i; } });
      a.style.setProperty('--at', Math.round(ROUTE_DELAY + ROUTE_MS * timeAt(best / N)) + 'ms');
    });
  }

  // job: signifier. Pointing at a stop on the plan lights its line in the list, and the other way round (.hl, mouse and
  // keyboard). A click or tap picks a stop (.pick, both sides stay lit). On a laptop the list sits beside the plan, so a
  // pick whose line is already in view does not jump the page (it only updates the address); on a phone it scrolls to
  // the line. Pointing at another stop hides the pick (how-about.css), so only one line ever shows as selected.
  function planPair(plan) {
    var pairs = [];
    var pick = function (id) { pairs.forEach(function (p) { var v = p[1].id === id; p[0].classList.toggle('pick', v); p[1].classList.toggle('pick', v); }); };
    $$('.plan-stops a', plan).forEach(function (a) {
      var li = document.querySelector(a.getAttribute('href')); if (!li) return;
      pairs.push([a, li]);
      var on = function (v) { a.classList.toggle('hl', v); li.classList.toggle('hl', v); };
      var mouse = function (e) { if (e.pointerType === 'mouse') on(true); };
      [a, li].forEach(function (el) { el.addEventListener('pointerenter', mouse); el.addEventListener('pointerleave', function () { on(false); }); });
      a.addEventListener('focus', function () { on(true); });
      a.addEventListener('blur', function () { on(false); });
      a.addEventListener('click', function (e) {
        pick(li.id);
        if (fullyIn(li, band())) { e.preventDefault(); history.replaceState(null, '', '#' + li.id); }
      });
    });
    var fromHash = function () { pick(location.hash.slice(1)); };
    addEventListener('hashchange', fromHash); fromHash();
  }

  // job: state change. A link to a disclosure ("Full terms") lands on it open, not on a closed line.
  function openTarget(id) {
    var d = id && document.getElementById(id);
    if (d && d.tagName === 'DETAILS') d.open = true;
  }
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href*="#"]'); if (!a) return;
    var u = new URL(a.href, location.href);
    if (u.pathname === location.pathname) openTarget(u.hash.slice(1));
  });
  addEventListener('hashchange', function () { openTarget(location.hash.slice(1)); });

  once();
  var plan = document.getElementById('plan');
  if (plan) { planTiming(plan); planPair(plan); }
  openTarget(location.hash.slice(1));
})();
