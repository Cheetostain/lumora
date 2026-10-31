/* Home (2026-10-10; the generalist Home since 2026-10-30, plan P10). Franco, Oct 27: "clean up the home... just keeping it
   generalist, so the offices." Home shows the Offices sample only (body data-sample-lock, system.js), so nothing here rewrites the page
   after a pick: the picker, the walk's stops and the night's lock screen left, with their scripts (size, walkLink, picked, walkAlso,
   intro, slip, picker, nightTag, variants, seat, pickerRow, toolsFollow, stopHead, chipsPeek; "home ORIGINAL-2026-10-30-generalist.js"
   beside this file has them). What runs: What we automate's PDF picture (orderPic, as built), the walk film and the night film
   (films), the sheet's rows that jump to the film (sheetMap) and the walk heading's second tone (twoTone). */
(function () {
  var ES = /^es\b/i.test(document.documentElement.getAttribute('lang') || '');
  // GSAP 3.15.0 with Flip and CustomEase, vendored beside system.js (system/assets/vendor, gsap.LICENSE.md): one load for the page,
  // asked for by whichever picture comes near the screen first (the walk film, the night film or What we automate's PDF picture)
  var gsapP = null;
  function loadGsap() {
    if (gsapP) return gsapP;
    gsapP = new Promise(function (res, rej) {
      if (window.gsap && window.Flip && window.CustomEase) return res();
      var base = null; try { base = new URL('assets/vendor/', document.querySelector('script[src*="system.js"]').src).href; } catch (e) { return rej(); }
      var files = ['gsap.min.js', 'Flip.min.js', 'CustomEase.min.js'], left = files.length, failed = false;
      files.forEach(function (f) {
        var s = document.createElement('script'); s.src = base + f; s.async = false;
        s.onload = function () { if (!--left && !failed) res(); };
        s.onerror = function () { failed = true; rej(); };
        document.head.appendChild(s);
      });
    });
    return gsapP;
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
      // the font swaps in it would fold a few px off the chip (reviewers' round, Oct 27), as the walk and night films wait too
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
    // GSAP comes in only when the band is near (loadGsap: three files in order, the plugins after gsap, none from a CDN)
    var near = new IntersectionObserver(function (es) {
      if (!es.some(function (e) { return e.isIntersecting; })) return;
      near.disconnect();
      // the walk film above may have loaded it already (2026-10-30): one load for the page
      loadGsap().then(start, function () { fig.classList.add('still'); });   // the finished frame, never a half-drawn one
    }, { rootMargin: '600px 0px' });
    near.observe(fig);
  }
  /* ================================================================================================================================
     The walk film and the night film (the generalist Home, 2026-10-30; the walk-motion trial's direction B, all five judges' pick,
     walk-motion-2026-10-27/prototype/proto.js with its other two directions, its ?v switch and its review parts off). Franco, Oct 27:
     "I should be able to see the emails get dragged into the folders... the machine running and scrolling and it detects two
     unfinished invoices... then straight to your phone." Each film is one GSAP timeline on B's clock and curves (orderPic above),
     built ahead and held on its first frame, played once when the whole picture is in view between the sticky header and the
     phone's call bar, one film at a time, with Pause and Play again (WCAG 2.2.2). Reduced motion, ?still, no IntersectionObserver or
     a file that fails to load: the finished frame, which is the page itself (home.css). Only transform, opacity and
     stroke-dashoffset move (SYSTEM.md 9), plus words a tool itself would change (a clock, a count, a status line), set at their
     moment. Two polish items the trial left for this build: the play waits for the Pause under the picture to clear the call bar
     too, where the screen holds both, and the night's check boxes the quote's $920.00 before the red pen rings the bill's $1,180.00,
     so the two figures are read together (Plover IT's bill was $1,240.00 over $980.00 until the reviewers' round, 2026-10-30: What
     we automate's order is $1,240.00 too, and one business showing the same figure twice read as copied numbers). window.WM is
     what the clip and check tools read */
  var FLAT = { flat: true };
  function films() {
    var Q = new URLSearchParams(location.search), $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
    var STILL = Q.has('still') || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window);
    var WM = window.WM = window.WM || {}; WM.films = {};
    if (!$('figure.wm[data-film]')) return;
    var G, MOVE, OUT, IN;
    function easings() {
      if (G) return; G = window.gsap; G.registerPlugin(window.Flip, window.CustomEase);
      MOVE = CustomEase.create('wmMove', '.2,0,0,1'); OUT = CustomEase.create('wmOut', '.33,1,.68,1'); IN = CustomEase.create('wmIn', '.3,0,1,1');
    }
    /* one film at a time on the page */
    var busy = null, queue = [];
    function next() { busy = null; while (queue.length) { var f = queue.shift(); if (f.mode === 'queued') { f.play(); return; } } }
    var LAB = ES ? { pause: 'Pausar', play: 'Reproducir', again: 'Ver otra vez' } : { pause: 'Pause', play: 'Play', again: 'Play again' };
    var LAL = ES ? { pause: 'Pausar la animación', play: 'Reproducir la animación', again: 'Ver otra vez' } : { pause: 'Pause animation', play: 'Play animation', again: 'Play again' };
    var CLEAR = 'transform,translate,rotate,scale,opacity,visibility,color,boxShadow,strokeDasharray,strokeDashoffset,zIndex,backgroundColor';
    var money = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };

    function Film(fig, build, hooks) {
      var F = { name: fig.getAttribute('data-film'), fig: fig, mode: 'wait', tl: null, played: false, armed: false };
      var stage = $('.wm-stage', fig), fx = $('.wm-fx', fig), btn = $('.wm-pause', fig), lab = btn && $('.pt', btn), made = [], temp = [], lit = [], texts = [];
      hooks = hooks || {};
      WM.films[F.name] = F;
      function label(m) { if (!btn) return; btn.setAttribute('aria-label', LAL[m]); btn.classList.toggle('is-paused', m !== 'pause'); if (lab) lab.textContent = LAB[m]; }
      function pairs(state) { $$('.wm-pair', fig).forEach(function (p) { p.setAttribute('data-state', state); }); }
      /* the kit: geometry relative to the stage, and the beats every film is made of */
      function rect(el) {
        var r;
        // a cell's or a line's words; a SMALL too (the reviewers' round, 2026-10-30: the bill's quote is a block-level small, and its
        // box drew round 190px of empty cell on a computer, the words at its right end)
        if (el.tagName === 'TD' || el.tagName === 'P' || el.tagName === 'SMALL') { var rg = document.createRange(); rg.selectNodeContents(el); r = rg.getBoundingClientRect(); }
        else r = el.getBoundingClientRect();
        var s = stage.getBoundingClientRect(); return { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height };
      }
      function track(els) { [].concat(els).forEach(function (e) { if (e && made.indexOf(e) < 0) made.push(e); }); return els; }
      function f1(n) { return Math.round(n * 10) / 10; }
      function roundBox(w, h) {           // B's box: starts just past the top-left corner and runs clockwise, as a pen would
        var o = .75, x0 = o, y0 = o, x1 = w - o, y1 = h - o, r = Math.min(6, (x1 - x0) / 2, (y1 - y0) / 2);
        return 'M' + f1(x0 + r) + ' ' + y0 + 'H' + f1(x1 - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + f1(x1) + ' ' + f1(y0 + r) + 'V' + f1(y1 - r) +
          'A' + r + ' ' + r + ' 0 0 1 ' + f1(x1 - r) + ' ' + f1(y1) + 'H' + f1(x0 + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + x0 + ' ' + f1(y1 - r) +
          'V' + f1(y0 + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + f1(x0 + r) + ' ' + y0;
      }
      var K = {
        stage: stage, rect: rect, track: track,
        // job: show our work. An ink box draws round a value, the way a pen would (B's drawBox), 4px off its words. o.pad and o.dy
        // fit a line set right under another (the bill's quote under its $1,180.00: 3px off and 2px lower, so the box's top edge
        // clears the amount's line and the bill never reads as underlined; reviewers' round, 2026-10-30)
        box: function (tl, t, el, dur, keep, o) {
          o = o || {};
          var b = rect(el), pad = o.pad || 4, W = b.w + pad * 2, Hh = b.h + pad * 2 - 2, NS = 'http://www.w3.org/2000/svg';
          var svg = document.createElementNS(NS, 'svg'), p = document.createElementNS(NS, 'path');
          svg.setAttribute('class', 'wm-box'); svg.setAttribute('width', W); svg.setAttribute('height', Hh); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + Hh);
          svg.style.left = (b.x - pad) + 'px'; svg.style.top = (b.y - pad + 1 + (o.dy || 0)) + 'px';
          p.setAttribute('d', roundBox(W, Hh)); p.setAttribute('pathLength', '1'); p.style.strokeDasharray = '1 2'; p.style.strokeDashoffset = '1.01';
          svg.appendChild(p); fx.appendChild(svg);
          tl.to(p, { strokeDashoffset: 0, duration: dur || .42, ease: OUT }, t);
          if (keep !== true) tl.to(svg, { opacity: 0, duration: .25, ease: OUT }, typeof keep === 'number' ? keep : t + (dur || .42) + .9);
          return svg;
        },
        // job: cause and effect. A copy of a value (or the words given) lifts off its place and travels to where it lands; what it
        // fills comes in under it as it arrives (B's fly, the copy's centre landing on the target's)
        fly: function (tl, t, from, to, opts) {
          opts = opts || {};
          var a = rect(from), b = rect(to), el = document.createElement('span'), fs = opts.size || parseFloat(getComputedStyle(from).fontSize) || 13;
          el.className = 'wm-fly';
          el.innerHTML = '<span class="fly-in"><span class="fly-sh"></span><span class="fly-bg"></span><span class="fly-t"><span class="fly-w"></span></span></span>';
          el.querySelector('.fly-w').textContent = opts.text || from.textContent.trim();
          el.querySelector('.fly-t').style.fontSize = fs + 'px';
          fx.appendChild(el);
          var w = el.offsetWidth, h = el.offsetHeight;
          var x0 = a.x + a.w / 2 - w / 2, y0 = a.y + a.h / 2 - h / 2, x1 = b.x + b.w / 2 - w / 2, y1 = b.y + b.h / 2 - h / 2;
          var sw = stage.offsetWidth, cl = function (x) { return Math.max(2, Math.min(sw - w - 2, x)); }; x0 = cl(x0); x1 = cl(x1);   // a copy wider than its cell stays inside the picture
          el.style.left = x0 + 'px'; el.style.top = y0 + 'px';
          var inn = el.firstChild, sh = inn.firstChild, d = opts.dur || .7, lift = opts.lift == null ? 4 : opts.lift;
          tl.set(el, { opacity: 1 }, t)
            .fromTo(inn, { scale: .96 }, { scale: 1.06, y: -lift, duration: .18, ease: OUT }, t)
            .to(sh, { opacity: 1, duration: .18, ease: OUT }, t)
            .to(el, { x: x1 - x0, y: y1 - y0, duration: d, ease: MOVE }, t + .18);
          // opts.arc: the copy rises over its own row and comes down on the cell's edge, so the row it fixes stays readable (judges, Oct 27)
          if (opts.arc) tl.to(inn, { scale: 1, duration: d, ease: MOVE }, t + .18).to(inn, { y: -lift - opts.arc, duration: d * .45, ease: OUT }, t + .18)
            .to(inn, { y: 0, duration: d * .55, ease: IN }, t + .18 + d * .45);
          else tl.to(inn, { scale: 1, y: 0, duration: d, ease: MOVE }, t + .18);
          tl.to(sh, { opacity: 0, duration: .3, ease: OUT }, t + .18 + d * .55)
            .to(el, { opacity: 0, duration: .14, ease: OUT }, t + .18 + d + .02);
          if (opts.land) K.show(tl, t + .18 + d - .04, opts.land, .16, 0);
          return t + .18 + d;
        },
        // job: cause and effect. An element itself travels (a file chip into its row)
        carry: function (tl, t, el, to, opts) {
          opts = opts || {};
          var a = rect(el), b = rect(to), d = opts.dur || .7;
          var dx = (opts.toLeft ? b.x : b.x + b.w / 2 - a.w / 2) - a.x, dy = b.y + b.h / 2 - (a.y + a.h / 2);
          track(el);
          tl.to(el, { scale: 1.06, y: -4, boxShadow: '0 12px 24px rgba(58,47,28,.22)', duration: .16, ease: OUT }, t)
            .to(el, { x: dx, y: dy, scale: opts.scale || .92, duration: d, ease: MOVE }, t + .16)
            .to(el, { opacity: 0, duration: .14, ease: OUT }, t + .16 + d - .06);
          return t + .16 + d;
        },
        // job: state change. Something comes in where it belongs (rise and fade)
        show: function (tl, t, els, dur, dy) {
          els = [].concat(els).filter(Boolean);
          if (!els.length) return;
          tl.fromTo(track(els), { autoAlpha: 0, y: dy == null ? 4 : dy }, { autoAlpha: 1, y: 0, duration: dur || .32, ease: OUT }, t);
        },
        hide: function (tl, t, els, dur) { els = [].concat(els).filter(Boolean); if (els.length) tl.to(track(els), { autoAlpha: 0, duration: dur || .2, ease: OUT }, t); },
        // job: state change. One changed cell (pairHTML's .chg): the old value is struck in pencil (a struck one stays, as the house's
        // after frame keeps it) or fades out, and the new one comes in over or under it
        swap: function (tl, t, chg, opts) {
          if (!chg) return t;
          opts = opts || {};
          var was = $(':scope > .was', chg), now = $(':scope > .now', chg), tr = chg.classList.contains('tr');
          // R7 (check.py film_problems; the reviewers' round, 2026-10-30): old words never fade out under new ones fading in. That
          // left both under 90% opacity for 150 to 200 ms in four status lines ("Typed again" to "From policy", "3 bills since
          // Friday" to "3 bills read"...). Unstruck words change at once, as the tool changes them; a dropped value keeps its fall,
          // at full opacity from its first frame. A struck value stays, so its new one may still fade in beside it
          var said = !tr && was && was.textContent.trim();
          if (said && !opts.drop) opts = FLAT;
          if (tr) {
            var s = $('.wm-strike', was);
            if (s) tl.fromTo(track(s), { scaleX: 0 }, { scaleX: 1, duration: .42, ease: MOVE }, t);
            tl.set(track(was), { color: 'var(--pencil)' }, t + .1);
            var loop = $('.pc-loop', was); if (loop) tl.to(track(loop), { opacity: 0, duration: .2, ease: OUT }, t + .3);
          }
          // opts.flat: a row the machine runs past changes at once, as a machine ticks, written straight to the style, so no tween
          // reads the page back mid-film (a fade on each kept a slow phone repainting every frame)
          if (opts.flat) {
            if (was) track(was); if (now) track(now);
            tl.call(function () { if (was) { was.style.visibility = 'hidden'; was.style.opacity = '0'; } if (now) { now.style.visibility = 'inherit'; now.style.opacity = '1'; } }, null, t);
            return t;
          }
          if (said) {   // a drop over old words: the old leave and the new land in the same frame, the new at full opacity
            tl.set(track(was), { autoAlpha: 0 }, t + .06);
            if (now) tl.set(track(now), { autoAlpha: 1, scale: 1.12, y: -6 }, t + .06).to(now, { scale: 1, y: 0, duration: .3, ease: OUT }, t + .06);
            return t + .5;
          }
          if (now) tl.fromTo(track(now), { autoAlpha: 0, scale: opts.drop ? 1.12 : 1, y: opts.drop ? -6 : 3 },
            { autoAlpha: 1, scale: 1, y: 0, duration: opts.drop ? .3 : .22, ease: OUT }, t + (tr ? .28 : .06));
          return t + .5;
        },
        // job: state change. The changed row lit, as the house lights it in the finished frame
        tint: function (tl, t, row, color) {
          $$('td', row).forEach(function (td, i) {
            var x = document.createElement('i'); x.className = 'wm-tint'; x.style.background = (i === 0 && row.closest('.xl')) ? '#dedede' : (color || (row.closest('.xl') ? '#e9f5ec' : '#eef7f0'));
            td.insertBefore(x, td.firstChild); temp.push(x); td.classList.add('wm-lit'); lit.push(td);
            tl.fromTo(x, { opacity: 0 }, { opacity: 1, duration: .4, ease: OUT }, t);
          });
        },
        // job: show our work. The red pen draws round a problem (system.js pencil() fitted the loop to the words)
        ring: function (tl, t, pc, dur) {
          var p = pc && $('.pc-loop path', pc);
          // a ring in a row the film brings in has no loop yet (the reviewers' round, 2026-10-30: K.show hides the row's cells while
          // the film is built, pencil() skips hidden words, and the bill's red pen never drew): fit it now, the words shown for the
          // measure only
          if (!p && pc && window.Lumora && Lumora.pencil) { var v = pc.style.visibility; pc.style.visibility = 'visible'; Lumora.pencil(pc.parentNode); pc.style.visibility = v; p = $('.pc-loop path', pc); }
          if (!p) { if (pc) K.show(tl, t, pc, .2, 0); return; }
          var loop = p.ownerSVGElement; p.setAttribute('pathLength', '1');
          tl.set(track(loop), { opacity: 1, visibility: 'visible' }, t)
            .fromTo(track(p), { strokeDasharray: '1 2', strokeDashoffset: 1.01 }, { strokeDashoffset: 0, duration: dur || .6, ease: MOVE }, t);
        },
        // a figure that counts keeps the width of its last value, so the words after it never move (no layout shift)
        hold: function (el) { if (el && !el.style.minWidth) el.style.minWidth = Math.ceil(el.getBoundingClientRect().width) + 'px'; },
        // words a tool itself would change (a clock, a count, a status line), set at their moment; each comes back at the hand-back
        text: function (tl, t, el, s) {
          if (!el) return;
          if (!texts.some(function (x) { return x[0] === el; })) texts.push([el, el.textContent]);
          // the words keep their own text node and take the new words (a new node each time sent the page's :has() rules on body
          // through a style recalc of the whole page on every tick of a running list: frames of 26 to 33 ms on a phone slowed 4x,
          // 2026-10-30). Words of a new length (the money passing $1,000, set from the right) and the phone's clock and date (centred,
          // changed five times a night) get a new node: the same node starting further left or right counts as a layout shift
          var own = !el.closest('.iph');
          tl.call(function () { var n = el.firstChild; if (own && n && n.nodeType === 3 && !n.nextSibling && n.nodeValue.length === s.length) n.nodeValue = s; else el.textContent = s; }, null, t);
        },
        // job: state change. One cell lit, as the house lights a done cell in the finished frame (Excel's green Called)
        tintCell: function (tl, t, td, color) {
          if (td) { track(td); tl.call(function () { td.style.backgroundColor = color || '#e2f1e5'; }, null, t); }
        },
        // job: show our work. A list runs under its header: B's ink box goes down the rows in view, then holds on the last while the
        // rest come up under it at the machine's pace, each row changing as the box reaches it (onRow); hold(k) adds a stop after
        // row k (the night's two never paid). Only transforms move; the rows are one height (home.css .wk-vp)
        stream: function (tl, t, vp, from, step, onRow, hold) {
          var roll = $('.wk-roll', vp), rows = $$('tr:not([data-h])', roll); if (rows.length < 2) return t;
          var hh = rows[0].offsetTop, rh = rows[1].offsetTop - rows[0].offsetTop, V = Math.max(1, Math.round((vp.clientHeight - hh) / rh));
          var scan = document.createElement('i'); scan.className = 'wk-scan'; scan.style.top = hh + 'px'; scan.style.height = rh + 'px';
          vp.appendChild(scan); temp.push(scan); track(roll);
          G.set(scan, { opacity: 0, y: Math.min(from, V - 1) * rh }); G.getProperty(roll, 'y');   // their transforms read now, while the film is built, never mid-play
          tl.fromTo(scan, { opacity: 0, y: Math.min(from, V - 1) * rh }, { opacity: 1, duration: .14, ease: OUT, immediateRender: false }, t - .14);
          var at = t;
          for (var k = from; k < rows.length; k++) {
            if (k > from) {
              if (k < V) tl.to(scan, { y: k * rh, duration: step * .9, ease: MOVE }, at - step * .9);
              else tl.to(roll, { y: -(k - V + 1) * rh, duration: step, ease: 'none' }, at - step);
            }
            onRow(rows[k], k, at);
            at += step + (hold ? hold(k) || 0 : 0);
          }
          tl.to(scan, { opacity: 0, duration: .2, ease: OUT }, at - step + .1);
          return at - step;
        },
        under: function (tl, t, root) { var p = $('.pen-under path', root); if (p) tl.fromTo(track(p), { strokeDasharray: '1 1', strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: .7, ease: MOVE }, t); }
      };
      F.kit = K;
      function first() { fig.classList.remove('done'); pairs('before'); if (hooks.first) hooks.first(); }
      function clean() {
        if (F.tl) { F.tl.kill(); F.tl = null; }
        fx.innerHTML = '';
        // only what the film set: system.js gives some of these their own inline styles (a red pen loop's size and place)
        if (made.length) G.set(made, { clearProps: CLEAR }); made = [];
        temp.forEach(function (x) { x.remove(); }); temp = [];
        texts.forEach(function (x) { x[0].textContent = x[1]; }); texts = [];
        lit.forEach(function (x) { x.classList.remove('wm-lit'); }); lit = [];
      }
      function done() {                   // hand the frame back to home.css and the house's after state, with no inline styles left
        clean();
        pairs('after');
        if (hooks.done) hooks.done();
        fig.classList.add('done');
        F.mode = 'done'; label('again'); F.armed = false;
        if (busy === F) next();
      }
      function arm() {
        clean(); first();
        F.tl = G.timeline({ paused: true, onComplete: done });
        F.tl.set({}, {}, build(F.tl, K));   // the last beat holds until the end time
        F.armed = true;
      }
      F.play = function () {
        if (busy && busy !== F) { F.mode = 'queued'; if (queue.indexOf(F) < 0) queue.push(F); return; }
        if (!F.armed) arm();
        F.armed = false; F.mode = 'start'; F.played = true; busy = F; label('pause');
        // two frames after the trigger: the frame that paints what a scroll just brought in is never the play's first
        requestAnimationFrame(function () { requestAnimationFrame(function () { if (F.mode === 'start' && F.tl) { F.mode = 'play'; F.tl.play(0); fig.setAttribute('data-t0', String(performance.now())); } }); });
      };
      F.done = done; F.arm = arm;
      if (btn) btn.addEventListener('click', function () {
        if (F.mode === 'play' || F.mode === 'start') { if (F.mode === 'play') F.tl.pause(); F.mode = 'paused'; label('play'); }
        else if (F.mode === 'paused') { if (F.tl.time() === 0 && !F.tl.isActive()) F.tl.play(0); else F.tl.play(); F.mode = 'play'; label('pause'); }
        else if (F.mode === 'wait' || F.mode === 'queued') { F.mode = 'held'; label('play'); var i = queue.indexOf(F); if (i > -1) queue.splice(i, 1); }
        else if (G) F.play();
      });
      // job: one-time focus. Plays once, when the whole picture is in view between the sticky header and the phone's call bar (B's
      // rule), with its Pause in view too, or within 24px of it (the trial's note: on a phone the Pause sat under the call bar while
      // the walk played). A reader who stops with the whole picture in view and the Pause still lower gets the play 350 ms later, so
      // a film never waits on a scroll position a few px wide. A screen shorter than the stage plays once most of it is in view
      var io = null, idle = 0, TH = []; for (var th = 0; th <= 1.0001; th += .02) TH.push(+th.toFixed(2));
      F.watch = function () {
        if (io) io.disconnect(); clearTimeout(idle);
        var hdr = $('.hdr'), bar = $('.callbar'), top = hdr ? hdr.offsetHeight : 0, bot = bar && bar.getClientRects().length ? bar.offsetHeight : 0;
        // a stage within 40px of the room between the header and the call bar counts as tall too, and plays once 95% of it is in
        // view: whole, it would fit only within a scroll window a few px wide, which a reader's scroll steps over (the reviewers'
        // round, 2026-10-30: the night film at 393 x 659 is 526px in 538, and verify.py's scroll passed it by)
        var tall = innerHeight - top - bot < stage.offsetHeight + 40;
        var ok = function () {             // 2: play now; 1: play if the reader stays; 0: not yet
          var y0 = top, y1 = innerHeight - bot, s = stage.getBoundingClientRect(), f = fig.getBoundingClientRect();
          if (tall) return Math.min(s.bottom, y1) - Math.max(s.top, y0) >= Math.min(.95, Math.max(.3, Math.floor((y1 - y0) / s.height * 20) / 20 - .05)) * s.height ? 2 : 0;
          return s.top >= y0 - 1 && s.bottom <= y1 + 1 ? (f.bottom <= y1 + 24 ? 2 : 1) : 0;
        };
        var go = function () { if (F.played || F.mode !== 'wait') return; io.disconnect(); clearTimeout(idle); F.play(); };
        io = new IntersectionObserver(function () {
          if (F.played || F.mode !== 'wait') return;
          clearTimeout(idle);
          var k = ok();
          if (k === 2) go(); else if (k === 1) idle = setTimeout(function () { if (ok()) go(); }, 350);
        }, { threshold: TH, rootMargin: '-' + top + 'px 0px -' + bot + 'px 0px' });
        io.observe(stage); io.observe(fig);
      };
      F.still = function () { fig.classList.add('still'); pairs('after'); if (hooks.done) hooks.done(); };
      return F;
    }

    var lastChg = function (tr) { var c = $$('td', tr).pop(); return c && $('.chg', c); };
    var stChg = function (root) { return $('.win-st .chg', root); };
    // job: state change. One job's window leaves the desk and the next comes in, over it. The scenes waiting their turn are drawn at
    // 1% from the first frame, under the one on the desk (home.css), so their first frame on screen costs nothing new and nothing
    // shows through (judges, Oct 27)
    function scene(tl, t, out, inn, z, K) {
      tl.set(inn, { zIndex: z }, t)
        .to(out, { opacity: 0, duration: .2, ease: OUT }, t).set(out, { visibility: 'hidden' }, t + .2)
        .fromTo(inn, { opacity: .01, y: 8 }, { opacity: 1, y: 0, duration: .3, ease: OUT, immediateRender: false }, t + .12);
      K.track([out, inn]);
    }
    // the night: three beats on the desk, each landing as a line of the morning list on the sleeping phone, whose clock runs the
    // night; at 6:30 the phone wakes with the list (judges, Oct 27: a lit 6:30 AM notice at 11:40 PM came from the future)
    function night(tl, K) {
      var S = K.stage, sc = function (k) { return $('.nb-sc[data-sc=' + k + ']', S); };
      var clock = $('.iph-clock', S), date = $('.iph-date', S), nt = $('.nb-nt', S), li = $$('.nb-list li', S), dim = $('.nb-dim', S), stamp = $('.nb-at', S);
      var day = date.getAttribute('data-day') || date.textContent;
      K.track([dim, stamp]);
      /* 1. the bills: each file goes into its row of QuickBooks' bills; the quote each is checked against is boxed where it is over,
         and the bill over it gets the red pen */
      var b = sc('bills'), files = $$('.nb-file', b), rows = $$('tr[data-new]', b), lands = [];
      K.text(tl, .3, clock, '11:40');
      rows.forEach(function (r, i) {
        var s = i ? .82 + (i - 1) * .16 : .3, d = i ? .34 : .5;
        var l = K.carry(tl, s, files[i], $$('td', r)[0], { dur: d, toLeft: true });
        K.show(tl, l - .06, $$('td', r), .18, 0); lands.push(l);
      });
      var tc = lands[lands.length - 1] + .06, over = $('tr.n', b), quote = over && $('td small', over);
      if (quote) K.box(tl, tc, quote, .3, tc + 1.2, { pad: 3, dy: 2 });   // the trial's note: the quote's $920.00 read beside the bill's $1,180.00
      rows.forEach(function (r, i) { K.swap(tl, tc + i * .08 + (r === over ? .22 : 0), lastChg(r)); });
      K.ring(tl, tc + .3, $('tr.n .pc', b), .45);
      K.swap(tl, tc + .45, stChg(b));
      tl.set(K.track(nt), { autoAlpha: 1 }, tc + .5).fromTo(nt, { y: -10, scale: .97 }, { y: 0, scale: 1, duration: .3, ease: OUT }, tc + .5);
      var l1 = K.fly(tl, tc + .48, $$('td', over)[0], li[0], { text: li[0].textContent, dur: .45, size: 12 });
      K.show(tl, l1 - .05, li[0], .2, 0);
      /* 2. the mail: each email's attachment is dragged onto its client's folder, one or two in the air at a time; the inbox counts
         down, the folders count up, each folder lit as its email lands */
      var m = sc('mail'), t2 = l1 + .05;
      scene(tl, t2, b, m, 5, K);
      K.text(tl, t2 + .12, clock, '12:05'); K.text(tl, t2 + .12, date, day);
      var atts = $$('.ib .att', m), irows = $$('.ib-m tr', m), fl = $$('.ib-f li[data-f]', m), inboxC = $('.ib-f li.on .ib-c', m), cnt = [0, 0, 0, 0], ta = t2 + .25, la = ta;
      atts.forEach(function (a, i) {
        var f = +a.getAttribute('data-to'), s = i ? ta + .62 + (i - 1) * .13 : ta, d = i ? .32 : .45;
        la = K.fly(tl, s, a, $('span', fl[f]), { dur: d, size: 11 });
        K.hide(tl, s + .05, irows[i], .2);
        cnt[f]++; K.text(tl, la - .02, $('.ib-c', fl[f]), String(cnt[f])); K.text(tl, la - .02, inboxC, 5 - i ? String(5 - i) : '');
        var lt = $('.nb-lit', fl[f]); if (!lt) { lt = document.createElement('i'); lt.className = 'nb-lit'; fl[f].appendChild(lt); } K.track(lt);
        tl.fromTo(lt, { opacity: 0 }, { opacity: 1, duration: .1, ease: OUT, immediateRender: false }, la - .04).to(lt, { opacity: 0, duration: .35, ease: OUT }, la + .12);
      });
      var tf = la + .08;
      K.swap(tl, tf, stChg($('.ib', m)));
      var l2 = K.fly(tl, tf + .05, $('.ib .win-st', m), li[1], { text: li[1].textContent, dur: .4, size: 12 });
      K.show(tl, l2 - .05, li[1], .2, 0);
      /* 3. the check: September's sheet runs under its header, each commission against the carrier's statement; it stops on the two
         never paid and the red pen rings them */
      var c = sc('check'), t3 = l2 + .05;
      scene(tl, t3, m, c, 6, K);
      K.text(tl, t3 + .12, clock, '5:40');
      var vp = $('.wk-vp', c), miss = function (r) { return !!$('.now .pc', r); };
      var end = K.stream(tl, t3 + .35, vp, 0, .033, function (r, k, at) {
        var ch = lastChg(r); K.swap(tl, at, ch, FLAT);
        if (miss(r)) K.ring(tl, at + .06, $('.now .pc', ch), .35); else K.tintCell(tl, at, $$('td', r).pop());
      }, function (k) { var r = $$('.wk-roll tr:not([data-h])', vp)[k]; return r && miss(r) ? .22 : 0; });
      K.swap(tl, end + .12, stChg(c));
      var l3 = K.fly(tl, end + .18, $('.win-st', c), li[2], { text: li[2].textContent, dur: .4, size: 12 });
      K.show(tl, l3 - .05, li[2], .2, 0);
      /* 6:30: the phone wakes with the morning list */
      var tw = l3 + .1;
      K.text(tl, tw, clock, '6:30');
      tl.to(dim, { opacity: 0, duration: .45, ease: OUT }, tw).fromTo(stamp, { opacity: 0 }, { opacity: 1, duration: .3, ease: OUT, immediateRender: false }, tw + .2)
        .fromTo(nt, { scale: .98 }, { scale: 1, duration: .3, ease: OUT, immediateRender: false }, tw + .05);
      return tw + .7;
    }
    function nightFirst(S) {
      var clock = $('.iph-clock', S), date = $('.iph-date', S);
      if (!date.getAttribute('data-day')) date.setAttribute('data-day', date.textContent);
      clock.textContent = '11:00'; date.textContent = date.getAttribute('data-eve');
      $$('.ib tr', S).forEach(function (r) { r.classList.add('unread'); });
      var c = $('.ib-f li.on .ib-c', S); if (c) c.textContent = c.getAttribute('data-n');
      $$('.ib-f li[data-f] .ib-c', S).forEach(function (x) { x.textContent = ''; });
    }
    function nightDone(S) {
      var clock = $('.iph-clock', S), date = $('.iph-date', S);
      clock.textContent = '6:30'; if (date.getAttribute('data-day')) date.textContent = date.getAttribute('data-day');
      $$('.ib tr', S).forEach(function (r) { r.classList.remove('unread'); });
      var c = $('.ib-f li.on .ib-c', S); if (c) c.textContent = '';
      var n = [0, 0, 0, 0]; $$('.ib .att', S).forEach(function (a) { n[+a.getAttribute('data-to')]++; });
      $$('.ib-f li[data-f] .ib-c', S).forEach(function (x, i) { x.textContent = n[i] ? String(n[i]) : ''; });
      fitRolls(S);
    }
    // each list's finished frame: run to its last rows (the CSS reads --end; a phone and a computer show a different number of rows)
    function fitRolls(root) {
      $$('.wk-vp', root || document).forEach(function (vp) {
        var roll = $('.wk-roll', vp), t = roll && $('table', roll); if (!t || !vp.clientHeight) return;
        roll.style.setProperty('--end', -Math.max(0, t.offsetHeight - vp.clientHeight) + 'px');
      });
    }

    // the walk: the week of 9/28 at reading speed, then the rest of October in fast-forward; the date drives every change, and the
    // money moves with it: the loss struck when the first fix lands, then won back, step by step (judges, Oct 27). Each tool is a list:
    // the walk's own row first, then in the fast-forward the month's rows run past the ink box, one tool at a time
    var WON = { quotes: [0, 4, 6, 10, 12, 14], renewals: [0, 3, 5, 8, 10] };   // the trial's spec.py B_QUOTES_WON, B_RENEWALS_WON
    function week(tl, K) {
      var S = K.stage, d = $('.wk-d', S), days = $$('.wk-days li', S), cur = $('.wk-cur', S), W = {};
      $$('.wk-w', S).forEach(function (w) { W[w.getAttribute('data-k')] = w; });
      var labels = days.slice(0, 8).map(function (li) { return li.getAttribute('data-d'); });
      var c0 = K.rect(cur), mid = function (el) { var r = K.rect(el); return r.x + r.w / 2 - (c0.x + c0.w / 2); };
      var go = function (t, i) { tl.to(cur, { x: mid(days[i]), duration: .26, ease: MOVE }, t); K.text(tl, t + .1, d, labels[i]); };
      K.track(cur); tl.set(cur, { x: 0 }, 0);
      var rowsIn = function (w) { return $$('.wk-roll tr:not([data-h])', w); }, Qr = rowsIn(W.quotes), R = rowsIn(W.renewals), I = rowsIn(W.invoices);
      var shown = function (el) { return el && el.getClientRects().length; }, re = ES ? 'RE: ' : 'Re: ';
      // the money: the hero's loss first, then what comes back
      var lost = $('.wk-lost', S), won = $('.wk-won', S), num = $('.wm-n', won), sum = 0, phone = S.clientWidth < 1000;
      K.hold(num); K.track(lost);
      var add = function (t, usd) { sum += usd; K.text(tl, t, num, money(sum)); };
      // Wed 9/30: Karen Davis's follow-up, two days after her quote, goes out by itself
      go(.35, 1); go(.7, 2);
      var karen = Qr[0], tds = $$('td', karen), subj = shown(tds[1]) ? tds[1] : tds[0], rh = karen.getBoundingClientRect().height;
      K.box(tl, .9, subj, .36);
      var l = K.fly(tl, 1, subj, $('.now', lastChg(karen)), { text: re + tds[1].textContent.trim(), dur: .55, arc: rh * .8 });
      K.swap(tl, l - .06, lastChg(karen), { drop: true }); K.tint(tl, l, karen);
      tl.fromTo(K.track($('.wm-strike', lost)), { scaleX: 0 }, { scaleX: 1, duration: .42, ease: MOVE }, l + .05).set(lost, { color: 'var(--pencil)' }, l + .15);
      if (phone) tl.to(lost, { autoAlpha: 0, duration: .22, ease: OUT }, l + .55);
      var tw = phone ? l + .7 : l + .35;
      K.show(tl, tw, won, .3, 4); add(tw, 260);
      // Fri 10/2: invoice 1047's amount, typed wrong, fills in from its policy
      go(l + .25, 3); go(l + .55, 4);
      var inv = I[0], cell = $('.chg.tr', inv), src = $('.wm-src', W.invoices), t2 = l + .7;
      K.box(tl, t2, src, .3);
      var l2 = K.fly(tl, t2 + .2, src, $('.now', cell), { dur: .45 });
      K.swap(tl, l2 - .06, cell); K.swap(tl, l2 + .08, lastChg(inv), { drop: true }); K.tint(tl, l2, inv); add(l2 + .08, 36);
      // Sat 10/3, Sun 10/4, Mon 10/5: Maria Garcia called, four weeks before her renewal goes up 18%
      go(l2 + .2, 5); go(l2 + .35, 6); go(l2 + .5, 7);
      var maria = R[0], t3 = l2 + .75;
      K.box(tl, t3, $('td.num', maria) || $$('td', maria)[4], .3, t3 + 1);
      K.swap(tl, t3 + .32, lastChg(maria), { drop: true }); K.tint(tl, t3 + .45, maria); add(t3 + .45, 240);
      // the rest of October: the date runs to 10/31 along the dashed line while each list runs by, one tool at a time
      var t4 = t3 + .8, FF = 2.8, o = { v: 5 }, end = d.getAttribute('data-end');
      var WD = ES ? ['lun.', 'mar.', 'mié.', 'jue.', 'vie.', 'sáb.', 'dom.'] : ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      var restB = $('.wk-rest b', S), rb = K.rect(restB);
      tl.to(cur, { x: rb.x - c0.x, duration: FF, ease: 'none' }, t4);
      // the date moves with the rows' ticks, so a frame that changes words changes them all at once (a slow phone keeps up)
      var dateAt = function (at) { var n = Math.min(30, Math.max(6, 5 + Math.round(26 * (at - t4) / FF))); if (n !== o.n) { o.n = n; K.text(tl, at, d, WD[(2 + n) % 7] + ' 10/' + n); } };
      K.text(tl, t4 + FF + .01, d, end);
      var run = function (w, t, last) {   // a list's status line counts as its rows run: the count moves with each row's tick
        var st = $('.win-st', w), ch = $('.chg', st), now = $('.now', ch), tpl = st.getAttribute('data-run'), N = +st.getAttribute('data-n'), n0 = +st.getAttribute('data-n0') || 0, fin = now.textContent;
        K.text(tl, t, now, tpl.replace('{n}', n0)); K.swap(tl, t, ch, FLAT);   // the line turns into a count at once, as the rows start
        return function (at, k) { K.text(tl, at, now, k >= last ? fin : tpl.replace('{n}', Math.round(n0 + (N - n0) * k / last))); };
      };
      var seg = FF / 3, sQ = (seg - .1) / (Qr.length - 1), sR = (seg - .1) / (R.length - 1), sI = (seg - .1) / (I.length - 1);
      var cQ = run(W.quotes, t4, Qr.length - 1);
      K.stream(tl, t4 + sQ, $('.wk-vp', W.quotes), 1, sQ, function (r, k, at) { K.swap(tl, at, lastChg(r), FLAT); cQ(at, k); dateAt(at); if (WON.quotes.indexOf(k) > 0) add(at, 260); });
      var cR = run(W.renewals, t4 + seg, R.length - 1);
      K.stream(tl, t4 + seg + sR, $('.wk-vp', W.renewals), 1, sR, function (r, k, at) {
        var ch = lastChg(r); K.swap(tl, at, ch, FLAT); cR(at, k); dateAt(at); if ($('.now .st.ok', ch)) K.tintCell(tl, at, $$('td', r).pop());
        if (WON.renewals.indexOf(k) > 0) add(at, 240);
      });
      // the invoices count the month's working days: 21 more at $36 a day, as the rows run
      var cI = run(W.invoices, t4 + 2 * seg, I.length - 1), base = 260 * WON.quotes.length + 36 + 240 * WON.renewals.length;
      K.stream(tl, t4 + 2 * seg + sI, $('.wk-vp', W.invoices), 1, sI, function (r, k, at) {
        K.swap(tl, at, lastChg(r), FLAT); cI(at, k); dateAt(at); K.text(tl, at, num, money(base + Math.round(21 * k / (I.length - 1)) * 36));
      });
      K.under(tl, t4 + FF + .05, won);
      return t4 + FF + .7;
    }
    function weekFirst(S) { var d = $('.wk-d', S); d.textContent = $$('.wk-days li', S)[0].getAttribute('data-d'); }
    function weekDone(S) { var d = $('.wk-d', S); d.textContent = d.getAttribute('data-end'); fitRolls(S); }

    /* wiring */
    // the policy's own figure in the invoice's status line, as its own span, so the box can draw round it and it can fly
    $$('.wm .qb .win-st .was').forEach(function (w) { if (!$('.wm-src', w)) w.innerHTML = w.innerHTML.replace(/1,248\.00/, '<span class="wm-src">1,248.00</span>'); });
    var list = [], bf = $('[data-film=b]'), nf = $('[data-film=night]');
    if (bf) list.push(Film(bf, week, { first: function () { weekFirst($('.wm-stage', bf)); }, done: function () { weekDone($('.wm-stage', bf)); } }));
    if (nf) list.push(Film(nf, night, { first: function () { nightFirst($('.wm-stage', nf)); }, done: function () { nightDone($('.wm-stage', nf)); } }));
    fitRolls();
    if (STILL) { list.forEach(function (f) { f.still(); }); WM.ready = true; WM.still = true; return; }
    function startAll() {
      easings();
      var auto = !Q.has('noauto');   // the clip and frame tools step each timeline themselves
      list.forEach(function (f) { f.arm(); if (auto) f.watch(); });
      WM.ready = true;
    }
    // GSAP comes in when the first film is near (600px), as What we automate's does, from the same one load; the fonts first, so
    // every flight is measured on the words as they will be drawn
    var near = new IntersectionObserver(function (es) {
      if (!es.some(function (e) { return e.isIntersecting; })) return;
      near.disconnect();
      loadGsap().then(function () { return document.fonts && document.fonts.ready; }).then(startAll, function () { list.forEach(function (f) { f.still(); }); WM.ready = true; });
    }, { rootMargin: '600px 0px' });
    list.forEach(function (f) { near.observe(f.fig); });
    // a width change re-arms a film that has not played and ends one that is playing on its finished frame
    var lastW = innerWidth;
    addEventListener('resize', function () {
      if (innerWidth === lastW || !G) return; lastW = innerWidth;
      list.forEach(function (f) { if (f.mode === 'wait' || f.mode === 'held' || f.mode === 'queued') { f.arm(); if (!f.played) f.watch(); } else if (f.mode === 'play' || f.mode === 'paused' || f.mode === 'start') f.done(); });
      fitRolls();
    });
  }
  var LP_STILL = /[?&]still\b/.test(location.search) || matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 18 sheet-map: each problem row on the walk sheet links to its stop (the film's window since 2026-10-30), with the stop's own thin circled number (a CSS counter: no
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
      // since the generalist Home (2026-10-30) each row's stop is that problem's window in the walk film: the scroll brings the whole
      // film into view, so it can play, and focus goes to the walk's heading. The window's caption sits inside the film's role="img"
      // stage, where a screen reader finds no name to read (the reviewers' round, 2026-10-30); the heading names the loss, and the
      // film's own description comes right after it
      var film = s.closest('.wm-week'), h = film ? document.querySelector('#walk .walk-h') : s.querySelector('.stop-t h3'), to = film || s, done = false, focus = function () { if (done || !h) return; done = true; h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); };
      if (LP_STILL) { to.scrollIntoView({ block: 'start' }); focus(); return; }
      if ('onscrollend' in window) addEventListener('scrollend', focus, { once: true });
      setTimeout(focus, 900);
      to.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    wire();
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


  function start() {
    orderPic();   // What we automate's picture (the code picture it replaced moved to How it works, Oct 27)
    films();      // the walk film and the night film (2026-10-30)
    if (!window.Lumora) return;
    sheetMap(); twoTone();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
