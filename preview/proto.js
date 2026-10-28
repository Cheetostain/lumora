/* TOOLBOX. The walk-motion trial (Franco, Oct 27: "I should be able to see the emails get dragged into the folders... the machine
   running and scrolling and it detects two unfinished invoices... then straight to your phone"). Home's walk and night band in
   B's language: one film per picture, each a GSAP timeline on B's clock and curves (What we automate's orderPic in home.js),
   played once when the whole picture is in view between the sticky header and the phone's call bar, one film at a time on the
   page, with Pause and Play again; reduced motion, ?still and a file that fails to load show the finished frame (proto.css).
   Only transform, opacity and stroke-dashoffset move (SYSTEM.md 9), plus text that a tool itself would change (a clock, a count,
   a status line), set at its moment. window.WM is what the clip and check tools read. */
(function () {
  'use strict';
  var H = document.documentElement, ES = H.lang === 'es', Q = new URLSearchParams(location.search);
  var V = H.getAttribute('data-v') || 'a';
  var STILL = Q.has('still') || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window);
  var $ = function (s, r) { return (r || document).querySelector(s); }, $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
  var WM = window.WM = window.WM || {};
  WM.films = {}; WM.v = V;

  /* ------------------------------------------------------------------ the direction shown (?v=a, b, c) */
  function pick() {
    $$('#walk .wv').forEach(function (w) {
      var on = w.getAttribute('data-wv') === V; w.hidden = !on;
      // the ids live only in the shown direction: the hero sheet's rows jump to #stop-1 to #stop-3
      $$(on ? '[data-id]' : '[id^="stop-"]', w).forEach(function (el) {
        if (on) { el.id = el.getAttribute('data-id'); el.removeAttribute('data-id'); } else { el.setAttribute('data-id', el.id); el.removeAttribute('id'); }
      });
    });
    var rv = $('.wm-review');
    if (rv) {
      $$('a[data-pick]', rv).forEach(function (a) { if (a.getAttribute('data-pick') === V) a.setAttribute('aria-current', 'true'); });
      var keep = $('a[data-keep]', rv); if (keep) keep.href = keep.getAttribute('href').split('?')[0] + '?v=' + V;
      var st = $('a[data-still]', rv); if (st) st.href = '?v=' + V + '&still';
    }
    $$('a.lang').forEach(function (a) { if (!/^\//.test(a.getAttribute('href'))) a.href = a.getAttribute('href').split('?')[0] + '?v=' + V; });
  }
  pick();
  if (window.Lumora && Lumora.pencil) try { Lumora.pencil(document.getElementById('walk'), true); } catch (e) { /* the CSS rings stay */ }

  /* ------------------------------------------------------------------ GSAP, vendored beside system.js, shared with What we automate */
  var sys = $('script[src*="system.js"]'), BASE = null;
  try { BASE = new URL('assets/vendor/', sys.src).href; } catch (e) { /* no address: the finished frames */ }
  function loadGsap() {
    if (WM.gsapLoading) return WM.gsapLoading;
    WM.gsapLoading = new Promise(function (res, rej) {
      if (window.gsap && window.Flip && window.CustomEase) return res();
      if (!BASE) return rej();
      var files = ['gsap.min.js', 'Flip.min.js', 'CustomEase.min.js'], left = files.length;
      files.forEach(function (f) {
        var s = document.createElement('script'); s.src = BASE + f; s.async = false;
        s.onload = function () { if (!--left) res(); }; s.onerror = rej;
        document.head.appendChild(s);
      });
    });
    return WM.gsapLoading;
  }
  var G, MOVE, OUT, IN;
  function easings() {
    if (G) return; G = window.gsap; G.registerPlugin(window.Flip, window.CustomEase);
    MOVE = CustomEase.create('wmMove', '.2,0,0,1'); OUT = CustomEase.create('wmOut', '.33,1,.68,1'); IN = CustomEase.create('wmIn', '.3,0,1,1');
  }

  /* ------------------------------------------------------------------ one film at a time on the page */
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
    function pairs(state) { $$('.wm-pair', hooks.scope || fig).forEach(function (p) { p.setAttribute('data-state', state); }); }

    /* the kit: geometry relative to the stage, and the beats every film is made of */
    function rect(el) {
      var r;
      if (el.tagName === 'TD' || el.tagName === 'P') { var rg = document.createRange(); rg.selectNodeContents(el); r = rg.getBoundingClientRect(); }   // a cell's or a line's words
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
      // job: show our work. An ink box draws round a value, the way a pen would (B's drawBox), 4px off its words
      box: function (tl, t, el, dur, keep) {
        var b = rect(el), pad = 4, W = b.w + pad * 2, Hh = b.h + pad * 2 - 2, NS = 'http://www.w3.org/2000/svg';
        var svg = document.createElementNS(NS, 'svg'), p = document.createElementNS(NS, 'path');
        svg.setAttribute('class', 'wm-box'); svg.setAttribute('width', W); svg.setAttribute('height', Hh); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + Hh);
        svg.style.left = (b.x - pad) + 'px'; svg.style.top = (b.y - pad + 1) + 'px';
        p.setAttribute('d', roundBox(W, Hh)); p.setAttribute('pathLength', '1'); p.style.strokeDasharray = '1 2'; p.style.strokeDashoffset = '1.01';
        svg.appendChild(p); fx.appendChild(svg);
        tl.to(p, { strokeDashoffset: 0, duration: dur || .42, ease: OUT }, t);
        if (keep !== true) tl.to(svg, { opacity: 0, duration: .25, ease: OUT }, typeof keep === 'number' ? keep : t + (dur || .42) + .9);
        return svg;
      },
      // job: cause and effect. A copy of a value (or the words given) lifts off its place and travels to where it lands; what it
      // fills fades in under it as it arrives (B's fly, with the copy's centre landing on the target's)
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
        if (opts.alignLeft) { x0 = a.x - 6; x1 = b.x - 6; }
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
        tl
          .to(sh, { opacity: 0, duration: .3, ease: OUT }, t + .18 + d * .55)
          .to(el, { opacity: 0, duration: .14, ease: OUT }, t + .18 + d + .02);
        if (opts.land) K.show(tl, t + .18 + d - .04, opts.land, .16, 0);
        return t + .18 + d;
      },
      // job: cause and effect. An element itself travels (a file chip into its row, an attachment into its folder)
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
        if (tr) {
          var s = $('.wm-strike', was);
          if (s) tl.fromTo(track(s), { scaleX: 0 }, { scaleX: 1, duration: .42, ease: MOVE }, t);
          tl.set(track(was), { color: 'var(--pencil)' }, t + .1);
          var loop = $('.pc-loop', was); if (loop) tl.to(track(loop), { opacity: 0, duration: .2, ease: OUT }, t + .3);
        } else if (was && was.textContent.trim() && !opts.flat) {
          tl.to(track(was), { autoAlpha: 0, duration: .14, ease: OUT }, t);
        }
        // opts.flat: a row the machine runs past changes at once, as a machine ticks (a stream changes a row every 40 to 80 ms; a
        // fade with a lift on each kept a slow phone repainting every frame and dropped frames)
        // and it is written straight to the style (no tween reads the page back mid-film, which forced a whole-page layout on a phone)
        if (opts.flat) {
          if (was) track(was); if (now) track(now);
          tl.call(function () { if (was) { was.style.visibility = 'hidden'; was.style.opacity = '0'; } if (now) { now.style.visibility = 'inherit'; now.style.opacity = '1'; } }, null, t);
          return t;
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
        var p = pc && $('.pc-loop path', pc); if (!p) { if (pc) K.show(tl, t, pc, .2, 0); return; }
        var loop = p.ownerSVGElement; p.setAttribute('pathLength', '1');
        tl.set(track(loop), { opacity: 1, visibility: 'visible' }, t)
          .fromTo(track(p), { strokeDasharray: '1 2', strokeDashoffset: 1.01 }, { strokeDashoffset: 0, duration: dur || .6, ease: MOVE }, t);
      },
      // job: show our work. A pile's boxes tick off one after another, too fast to count and slow enough to see
      ticks: function (tl, t, pile, opts) {
        opts = opts || {};
        var boxes = $$(':scope > i', pile), step = opts.step || .03, k = 0, at = [];
        boxes.forEach(function (b, i) {
          at[i] = t + k * step; k++;
          var tick = $('b', b);
          if (b.classList.contains('t')) tl.fromTo(track(tick), { opacity: 0, scale: .3 }, { opacity: 1, scale: 1, duration: .16, ease: OUT }, at[i]);
          if (b.classList.contains('c') || b.classList.contains('x')) tl.fromTo(track($('u', b)), { opacity: 0, scale: 1.5 }, { opacity: 1, scale: 1, duration: .3, ease: OUT }, at[i]);
        });
        return { end: t + k * step, at: at };
      },
      // job: cause and effect. A figure moves only as the thing it counts lands: n steps of one unit, each its own moment
      count: function (tl, t, el, unit, n, dur, fmt) {
        var o = { v: 0 }; fmt = fmt || money;
        K.hold(el);
        tl.fromTo(o, { v: 0 }, { v: n, duration: dur, ease: 'none', immediateRender: false, onUpdate: function () { el.textContent = fmt(Math.max(1, Math.ceil(o.v - .001)) * unit); } }, t);
      },
      // a figure that counts keeps the width of its last value, so the words after it never move (no layout shift)
      hold: function (el) { if (el && !el.style.minWidth) el.style.minWidth = Math.ceil(el.getBoundingClientRect().width) + 'px'; },
      // words a tool itself would change (a clock, a count, a status line), set at their moment; each comes back at the hand-back
      text: function (tl, t, el, s) {
        if (!el) return;
        if (!texts.some(function (x) { return x[0] === el; })) texts.push([el, el.textContent]);
        tl.call(function () { el.textContent = s; }, null, t);
      },
      // job: state change. One cell lit, as the house lights a done cell in the finished frame (Excel's green Called)
      tintCell: function (tl, t, td, color) {   // the cell's own ground, at once with the row's tick (no layer, no read of the page)
        if (td) { track(td); tl.call(function () { td.style.backgroundColor = color || '#e2f1e5'; }, null, t); }
      },
      // job: show our work. A list runs under its header (build.py roll()): B's ink box goes down the rows in view, then holds on the
      // last while the rest come up under it at the machine's pace, each row changing as the box reaches it (onRow); hold(k) adds a
      // stop after row k (the night's two never paid). Only transforms move; the rows are one height (proto.css .wk-vp)
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
    function first() {
      fig.classList.remove('done');
      pairs('before');
      if (hooks.first) hooks.first();
    }
    function clean() {
      if (F.tl) { F.tl.kill(); F.tl = null; }
      fx.innerHTML = '';
      // only what the film set: system.js gives some of these their own inline styles (a red pen loop's size and place)
      if (made.length) G.set(made, { clearProps: CLEAR }); made = [];
      temp.forEach(function (x) { x.remove(); }); temp = [];
      texts.forEach(function (x) { x[0].textContent = x[1]; }); texts = [];
      lit.forEach(function (x) { x.classList.remove('wm-lit'); }); lit = [];
    }
    function done() {                   // hand the frame back to proto.css and the house's after state, with no inline styles left
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
      requestAnimationFrame(function () { requestAnimationFrame(function () { if (F.mode === 'start' && F.tl) { F.mode = 'play'; F.tl.play(0); } }); });
    };
    F.done = done; F.arm = arm;
    if (btn) btn.addEventListener('click', function () {
      if (F.mode === 'play' || F.mode === 'start') { if (F.mode === 'play') F.tl.pause(); F.mode = 'paused'; label('play'); }
      else if (F.mode === 'paused') { if (F.tl.time() === 0 && !F.tl.isActive()) F.tl.play(0); else F.tl.play(); F.mode = 'play'; label('pause'); }
      else if (F.mode === 'wait' || F.mode === 'queued') { F.mode = 'held'; label('play'); var i = queue.indexOf(F); if (i > -1) queue.splice(i, 1); }
      else if (G) F.play();
    });
    // plays once, when the whole stage is in view between the sticky header and the phone's call bar (B's rule); a screen
    // shorter than the stage plays once most of it is in view
    var io = null;
    F.watch = function () {
      if (io) io.disconnect();
      var hdr = $('.hdr'), bar = $('.callbar'), top = hdr ? hdr.offsetHeight : 0, bot = bar && bar.getClientRects().length ? bar.offsetHeight : 0;
      io = new IntersectionObserver(function (es) {
        es.forEach(function (en) {
          // a stage taller than the screen plays once the screen holds nearly as much of it as it can
          var room = (innerHeight - top - bot) / stage.offsetHeight, need = room >= 1 ? 1 : Math.max(.3, Math.floor(room * 20) / 20 - .05);
          if (!F.played && F.mode === 'wait' && en.intersectionRatio >= need) { io.disconnect(); F.play(); }
        });
      }, { threshold: [0, .3, .35, .4, .45, .5, .55, .6, .65, .7, .75, .8, .85, .9, .95, 1], rootMargin: '-' + top + 'px 0px -' + bot + 'px 0px' });
      io.observe(stage);
    };
    F.still = function () { fig.classList.add('still'); pairs('after'); if (hooks.done) hooks.done(); };
    return F;
  }

  /* ------------------------------------------------------------------ the films */
  var rowsOf = function (win) { return $$('tr', win).filter(function (tr) { return tr.querySelector('td') && !tr.classList.contains('cl'); }); };
  var lastChg = function (tr) { var c = $$('td', tr).pop(); return c && $('.chg', c); };
  var stChg = function (root) { return $('.win-st .chg', root); };

  // the walk, stop 1 (A and C): the agency's sent mail. One quote's follow-up goes out at reading speed (its "Re:" copy lifts off
  // the quote and lands in Follow-up), then the other two, then the month's 48 tick off; the 6 that buy fill pine as the money counts
  function sentMail(pile) {
    return function (tl, K) {
      var win = $('.scr-win', K.stage), rows = rowsOf(win), n = rows.filter(function (r) { return r.classList.contains('n'); })[0] || rows[rows.length - 1];
      var others = rows.filter(function (r) { return r !== n; }), subj = function (r) { return $$('td', r)[1]; };
      var re = ES ? 'RE: ' : 'Re: ', t = .9;
      K.box(tl, t, subj(n), .42);
      var land = K.fly(tl, t + .3, subj(n), $('.now', lastChg(n)), { text: re + subj(n).textContent.trim(), dur: .72 });
      K.swap(tl, land - .08, lastChg(n), { drop: true }); K.tint(tl, land, n);
      var t2 = land + .35;
      others.forEach(function (r, i) {
        var s = t2 + i * .22; K.box(tl, s, subj(r), .25, s + .9);
        var l = K.fly(tl, s + .12, subj(r), $('.now', lastChg(r)), { text: re + subj(r).textContent.trim(), dur: .45 });
        K.swap(tl, l - .06, lastChg(r), { drop: true });
      });
      return pileEnd(tl, K, pile, land, t2 + .6);
    };
  }
  // the pile's ticks, then the status line, the pine fills and the money line, shared by the three stops
  function pileEnd(tl, K, pile, tFirst, tRest) {
    var stop = K.stage.closest('.wm-stop, .wm-mo'), findL = stop && $('.wm-find', stop), num = findL && $('.wm-n', findL);
    if (pile) {
      var boxes = $$(':scope > i', pile), firstT = boxes.filter(function (b) { return b.classList.contains('t'); })[0];
      // the first box ticks with the first item, at reading speed; the rest follow fast
      var r = K.ticks(tl, tRest, pile, { step: Math.min(.03, 1.3 / boxes.length) });
      if (firstT) tl.fromTo($('b', firstT), { opacity: 0, scale: .3 }, { opacity: 1, scale: 1, duration: .2, ease: OUT, immediateRender: false }, tFirst);
      var t3 = r.end + .15;
      K.swap(tl, t3, stChg(K.stage));
      var won = boxes.filter(function (b) { return b.classList.contains('w'); }), usd = num ? +num.getAttribute('data-usd') : 0;
      var t4 = t3 + .35;
      if (findL) K.show(tl, t4, findL, .32, 6);
      if (won.length) {
        won.forEach(function (b, i) { tl.fromTo(K.track($('s', b)), { opacity: 0 }, { opacity: 1, duration: .18, ease: OUT }, t4 + .12 + i * .15); });
        if (num) K.count(tl, t4 + .12, num, usd / won.length, won.length, won.length * .15);
        return K.under(tl, t4 + .3 + won.length * .15, findL), t4 + 1.1 + won.length * .15;
      }
      return t4 + 1;
    }
    K.swap(tl, tRest, stChg(K.stage));   // C's moments: the window's own status line comes to the month's count
    if (findL) { K.show(tl, tRest + .3, findL, .32, 6); K.under(tl, tRest + .65, findL); }
    return tRest + 1.5;
  }
  // stop 2: the renewal list. Each renewal going up 10% or more gets its ink box, then its call: Maria Garcia's at reading speed,
  // Mike Johnson's and Linda Brown's after it; the formula bar follows the selected cell; the month's 30 tick off
  function renewals(pile) {
    return function (tl, K) {
      var win = $('.scr-win', K.stage), rows = rowsOf(win).filter(function (r) { return !$('th', r); }), n = rows[0];
      var inc = function (r) { return $('td.num', r) || $$('td', r)[4]; }, t = .9;
      K.box(tl, t, inc(n), .42, true);
      K.swap(tl, t + .55, lastChg(n), { drop: true }); K.tint(tl, t + .75, n);
      K.swap(tl, t + .6, $('.xl-fx .chg', win));
      var t2 = t + 1.35;
      rows.slice(1).forEach(function (r, i) { var s = t2 + i * .3; K.box(tl, s, inc(r), .25, true); K.swap(tl, s + .3, lastChg(r), { drop: true }); });
      var tR = t2 + .75;
      $$('.wm-box', K.stage).forEach(function (b) { tl.to(b, { opacity: 0, duration: .25, ease: OUT }, tR + 1.3); });
      return pileEnd(tl, K, pile, t + .75, tR);
    };
  }
  // stop 3: the QuickBooks invoice. The red pen catches the amount typed wrong; the policy's own figure is boxed in the status line
  // and flies up into the amount, the balance follows; then the month's 22 working days tick off, each one typed once
  function invoice(pile) {
    return function (tl, K) {
      var win = $('.scr-win', K.stage), cell = $('tr.n .chg.tr', win), pc = cell && $('.was .pc', cell), src = $('.wm-src', win), t = .8;
      K.ring(tl, t, pc, .6);
      if (src) { K.box(tl, t + .75, src, .36); var land = K.fly(tl, t + 1.05, src, $('.now', cell), { dur: .62 }); }
      else land = t + 1.6;
      K.swap(tl, land - .06, cell); K.tint(tl, land, cell.closest('tr'));
      $$('.qb-due .chg, tr.tot .chg', win).forEach(function (c) { K.swap(tl, land + .25, c); });
      return pileEnd(tl, K, pile, land + .1, land + .55);
    };
  }

  // job: state change. One job's window leaves the desk and the next comes in, over it. The scenes waiting their turn are drawn at
  // 1% from the first frame, under the one on the desk (proto.css), so their first frame on screen costs nothing new and nothing
  // shows through (judges, Oct 27)
  function scene(tl, t, out, inn, z) {
    tl.set(inn, { zIndex: z }, t)
      .to(out, { opacity: 0, duration: .2, ease: OUT }, t).set(out, { visibility: 'hidden' }, t + .2)
      .fromTo(inn, { opacity: .01, y: 8 }, { opacity: 1, y: 0, duration: .3, ease: OUT, immediateRender: false }, t + .12);
    [out, inn].forEach(function (x) { if (WM.films.night) WM.films.night.kit.track(x); });
  }
  // the night: three beats on the desk, each landing as a line of the morning list on the sleeping phone, whose clock runs the
  // night; at 6:30 the phone wakes with the list (judges, Oct 27: a lit 6:30 AM notice at 11:40 PM came from the future)
  function night(tl, K) {
    var S = K.stage, sc = function (k) { return $('.nb-sc[data-sc=' + k + ']', S); };
    var clock = $('.iph-clock', S), date = $('.iph-date', S), nt = $('.nb-nt', S), li = $$('.nb-list li', S), dim = $('.nb-dim', S), stamp = $('.nb-at', S);
    var day = date.getAttribute('data-day') || date.textContent;
    K.track([dim, stamp]);
    /* 1. the bills: each file goes into its row of QuickBooks' bills, each is checked against its quote, the one over is ringed */
    var b = sc('bills'), files = $$('.nb-file', b), rows = $$('tr[data-new]', b), lands = [];
    K.text(tl, .3, clock, '11:40');
    rows.forEach(function (r, i) {
      var s = i ? .82 + (i - 1) * .16 : .3, d = i ? .34 : .5;
      var l = K.carry(tl, s, files[i], $$('td', r)[0], { dur: d, toLeft: true });
      K.show(tl, l - .06, $$('td', r), .18, 0); lands.push(l);
    });
    var tc = lands[lands.length - 1] + .06, over = $('tr.n', b);
    rows.forEach(function (r, i) { K.swap(tl, tc + i * .08, lastChg(r)); });
    K.ring(tl, tc + .12, $('tr.n .pc', b), .45);
    K.swap(tl, tc + .35, stChg(b));
    tl.set(K.track(nt), { autoAlpha: 1 }, tc + .4).fromTo(nt, { y: -10, scale: .97 }, { y: 0, scale: 1, duration: .3, ease: OUT }, tc + .4);
    var l1 = K.fly(tl, tc + .38, $$('td', over)[0], li[0], { text: li[0].textContent, dur: .45, size: 12 });
    K.show(tl, l1 - .05, li[0], .2, 0);
    /* 2. the mail: each email is dragged onto its client's folder, one or two in the air at a time; the inbox counts down, the
       folders count up, each folder lit as its email lands */
    var m = sc('mail'), t2 = l1 + .05;
    scene(tl, t2, b, m, 5);
    K.text(tl, t2 + .12, clock, '12:05'); K.text(tl, t2 + .12, date, day);
    var atts = $$('.ib .att', m), irows = $$('.ib-m tr', m), fl = $$('.ib-f li[data-f]', m), inboxC = $('.ib-f li.on .ib-c', m), cnt = [0, 0, 0, 0], ta = t2 + .25, la = ta;
    atts.forEach(function (a, i) {
      var f = +a.getAttribute('data-to'), s = i ? ta + .62 + (i - 1) * .13 : ta, d = i ? .32 : .45;
      la = K.fly(tl, s, a, $('span', fl[f]), { dur: d, size: 11 });
      K.hide(tl, s + .05, irows[i], .2);
      cnt[f]++; K.text(tl, la - .02, $('.ib-c', fl[f]), String(cnt[f])); K.text(tl, la - .02, inboxC, 5 - i ? String(5 - i) : '');
      var lit = $('.nb-lit', fl[f]); if (!lit) { lit = document.createElement('i'); lit.className = 'nb-lit'; fl[f].appendChild(lit); } K.track(lit);
      tl.fromTo(lit, { opacity: 0 }, { opacity: 1, duration: .1, ease: OUT, immediateRender: false }, la - .04).to(lit, { opacity: 0, duration: .35, ease: OUT }, la + .12);
    });
    var tf = la + .08;
    K.swap(tl, tf, stChg($('.ib', m)));
    var l2 = K.fly(tl, tf + .05, $('.ib .win-st', m), li[1], { text: li[1].textContent, dur: .4, size: 12 });
    K.show(tl, l2 - .05, li[1], .2, 0);
    /* 3. the check: September's sheet runs under its header, each commission against the carrier's statement; it stops on the two
       never paid and the red pen rings them */
    var c = sc('check'), t3 = l2 + .05;
    scene(tl, t3, m, c, 6);
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
    var c = $('.ib-f li.on .ib-c', S); if (c) c.textContent = '6';
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

  // B: the week of 9/28 at reading speed, then the rest of October in fast-forward; the date drives every change, and the money
  // moves with it: the loss struck when the first fix lands, then won back, step by step (judges, Oct 27). Each tool is a list:
  // the walk's own row first, then in the fast-forward the month's rows run past the ink box, one tool at a time
  var FLAT = { flat: true };
  var WON = { quotes: [0, 4, 6, 10, 12, 14], renewals: [0, 3, 5, 8, 10] };   // spec.py B_QUOTES_WON, B_RENEWALS_WON
  function week(tl, K) {
    var S = K.stage, d = $('.wk-d', S), days = $$('.wk-days li', S), cur = $('.wk-cur', S), W = {};
    $$('.wk-w', S).forEach(function (w) { W[w.getAttribute('data-k')] = w; });
    var labels = days.slice(0, 8).map(function (li) { return li.getAttribute('data-d'); });
    var c0 = K.rect(cur), mid = function (el) { var r = K.rect(el); return r.x + r.w / 2 - (c0.x + c0.w / 2); };
    var go = function (t, i) { tl.to(cur, { x: mid(days[i]), duration: .26, ease: MOVE }, t); K.text(tl, t + .1, d, labels[i]); };
    K.track(cur); tl.set(cur, { x: 0 }, 0);
    var rowsIn = function (w) { return $$('.wk-roll tr:not([data-h])', w); }, Q = rowsIn(W.quotes), R = rowsIn(W.renewals), I = rowsIn(W.invoices);
    var shown = function (el) { return el && el.getClientRects().length; }, re = ES ? 'RE: ' : 'Re: ';
    // the money: the hero's loss first, then what comes back
    var lost = $('.wk-lost', S), won = $('.wk-won', S), num = $('.wm-n', won), sum = 0, phone = S.clientWidth < 1000;
    K.hold(num); K.track(lost);
    var add = function (t, usd) { sum += usd; K.text(tl, t, num, money(sum)); };
    // Wed 9/30: Karen Davis's follow-up, two days after her quote, goes out by itself
    go(.35, 1); go(.7, 2);
    var karen = Q[0], tds = $$('td', karen), subj = shown(tds[1]) ? tds[1] : tds[0], rh = karen.getBoundingClientRect().height;
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
    var seg = FF / 3, sQ = (seg - .1) / (Q.length - 1), sR = (seg - .1) / (R.length - 1), sI = (seg - .1) / (I.length - 1);
    var cQ = run(W.quotes, t4, Q.length - 1);
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

  // C, the hero: the walk sheet's rows each carry their month as a pile, the costly ones marked in red; after the sheet has
  // written itself (system.js, CSS) the fix runs down every pile and ticks each box, the red marks turning to ticks
  var PILES = [{ n: 48, red: [5, 12, 20, 28, 36, 44] }, { n: 30, red: [2, 8, 13, 21, 26] }, { n: 22, red: 'all' }];
  function heroPiles() {
    var sheet = $('.hm4-hero .sheet'); if (!sheet || V !== 'c') return null;
    var ok = window.Lumora && Lumora.trade === 'offices';
    H.classList.toggle('wm-nopile', !ok);
    if (!ok) return null;
    $$('.sh-rows > li', sheet).forEach(function (li, i) {
      var P = PILES[i]; if (!P || $('.sh-pile', li)) return;
      var boxes = ''; for (var k = 0; k < P.n; k++) { var r = P.red === 'all' || P.red.indexOf(k) > -1; boxes += '<i class="t' + (r ? ' r' : '') + '"><s></s><b></b><u></u></i>'; }
      var sp = document.createElement('span'); sp.className = 'sh-pile'; sp.setAttribute('aria-hidden', 'true');
      sp.innerHTML = '<span class="pile" style="--n:' + P.n + '">' + boxes + '</span>';
      ($('.sh-l', li) || li).appendChild(sp);
    });
    return sheet;
  }
  function heroFix(tl, K) {
    var sheet = K.stage, piles = $$('.sh-pile .pile', sheet), t = .2;
    piles.forEach(function (p, i) {
      var boxes = $$(':scope > i', p), step = .012;   // with the sheet's own write-in the whole hero runs under 5 s (WCAG 2.2.2)
      boxes.forEach(function (b, k) {
        var at = t + k * step;
        if (b.classList.contains('r')) { tl.to(K.track($('u', b)), { opacity: 0, duration: .14, ease: OUT }, at); tl.fromTo(K.track($('s', b)), { opacity: 0 }, { opacity: 1, duration: .16, ease: OUT }, at); }
        tl.fromTo(K.track($('b', b)), { opacity: 0, scale: .3 }, { opacity: 1, scale: 1, duration: .14, ease: OUT }, at);
      });
      t += boxes.length * step + .1;
    });
    return t + .15;
  }

  /* ------------------------------------------------------------------ wiring */
  var films = [];
  function make(sel, build, hooks) { var fig = $(sel); if (!fig || fig.closest('[hidden]')) return null; var f = Film(fig, build, hooks); films.push(f); return f; }
  function wireWalk() {
    if (V === 'a') {
      make('[data-film=a1]', sentMail($('[data-film=a1] .pile')));
      make('[data-film=a2]', renewals($('[data-film=a2] .pile')));
      make('[data-film=a3]', invoice($('[data-film=a3] .pile')));
    } else if (V === 'b') {
      var bf = $('[data-film=b]');
      make('[data-film=b]', week, { first: function () { weekFirst($('.wm-stage', bf)); }, done: function () { weekDone($('.wm-stage', bf)); } });
    } else {
      make('[data-film=c1]', sentMail(null)); make('[data-film=c2]', renewals(null)); make('[data-film=c3]', invoice(null));
    }
    var nf = $('[data-film=night]');
    make('[data-film=night]', night, { first: function () { nightFirst($('.wm-stage', nf)); }, done: function () { nightDone($('.wm-stage', nf)); } });
  }
  // the policy's own figure in the invoice's status line, as its own span, so the box can draw round it and it can fly
  function markSources() {
    $$('.wm .qb .win-st .was').forEach(function (w) {
      if ($('.wm-src', w)) return;
      w.innerHTML = w.innerHTML.replace(/1,248\.00/, '<span class="wm-src">1,248.00</span>');
    });
    // the red pen draws these rings during the play, so its first frame has none
    $$('.wm:not(.wm-b) .qb tr.n .was .pc').forEach(function (p) { p.setAttribute('data-wm-draw', ''); });
  }
  markSources();
  wireWalk();
  // the films are the Offices sample's: on another sample, today's walk and night band follow the pick (system.js's binders write
  // them), and the stops shown carry the ids the hero sheet's rows jump to (judges, Oct 27: a plumber who picked Plumbing read an
  // insurance agency below the hero)
  function sampleMode() {
    var k = window.Lumora && Lumora.trade, off = !!k && k !== 'offices';
    H.classList.toggle('wm-off', off);
    var tw = $('#walk .wv-today'), nb = $('#night .wrap.nb'), n4 = $('#night .wm-today');
    if (tw) tw.hidden = !off; if (nb) nb.hidden = off; if (n4) n4.hidden = !off;
    var toData = function (el) { el.setAttribute('data-id', el.id); el.removeAttribute('id'); }, toId = function (el) { el.id = el.getAttribute('data-id'); el.removeAttribute('data-id'); };
    if (off) { $$('#walk .wv [id^="stop-"]').forEach(toData); $$('#walk .wv-today [data-id^="stop-"]').forEach(toId); }
    else { $$('#walk .wv-today [id^="stop-"]').forEach(toData); pick(); fitRolls(); }
    if (off) films.forEach(function (f) { if (f.mode === 'play' || f.mode === 'paused' || f.mode === 'start') f.done(); });
  }
  if (window.Lumora && Lumora.on) Lumora.on(function () { sampleMode(); });
  sampleMode(); fitRolls();

  // C's hero: its own film on the sheet, after the sheet's write-in (no control: with the write-in it runs under 5 s)
  var heroF = null;
  function wireHero() {
    var sheet = heroPiles(); if (!sheet) return;
    var shell = sheet.parentNode;   // the sheet is its own stage; its stack is the film's figure (no .wm class: it would change the clipboard)
    shell.setAttribute('data-film', 'hero');
    sheet.classList.add('wm-stage');
    if (!$('.wm-fx', sheet)) { var fx = document.createElement('div'); fx.className = 'wm-fx'; fx.setAttribute('aria-hidden', 'true'); sheet.appendChild(fx); }
    heroF = Film(shell, heroFix, { first: function () { sheet.classList.remove('wm-done'); }, done: function () { sheet.classList.add('wm-done'); } });
  }
  if (V === 'c') { wireHero(); if (window.Lumora) Lumora.on(function () { setTimeout(function () { var s = heroPiles(); if (s) s.classList.add('wm-done'); }, 0); }); }

  function startAll() {
    easings();
    var auto = !Q.has('noauto');   // the clip and frame tools step each timeline themselves
    films.forEach(function (f) { f.arm(); if (auto) f.watch(); });
    if (heroF) {
      var sheet = $('.hm4-hero .sheet'), ringP = $('.sh-rows .pen-ring path', sheet);
      heroF.arm();
      var go = function () { if (heroF.mode === 'wait' && auto) heroF.play(); };
      // after the sheet's own write-in: its ring is the last thing it draws (1.95 s + 0.8 s, paused while the sheet waits for view)
      if (ringP && sheet.classList.contains('writing')) ringP.addEventListener('animationend', function () { setTimeout(go, 150); }, { once: true });
      else setTimeout(go, 300);
    }
    WM.ready = true;
  }
  if (STILL || !BASE) {
    films.forEach(function (f) { f.still(); });
    if (heroF) { heroF.still(); $('.hm4-hero .sheet').classList.add('wm-done'); }
    WM.ready = true; WM.still = true;
    return;
  }
  // GSAP comes in when the first film is near (600px), as What we automate's does; the fonts first, so every flight is measured
  // on the words as they will be drawn
  var near = new IntersectionObserver(function (es) {
    if (!es.some(function (e) { return e.isIntersecting; })) return;
    near.disconnect();
    loadGsap().then(function () { return document.fonts && document.fonts.ready; }).then(startAll, function () {
      films.forEach(function (f) { f.still(); }); if (heroF) heroF.still();
    });
  }, { rootMargin: '600px 0px' });
  films.concat(heroF ? [heroF] : []).forEach(function (f) { near.observe(f.fig); });
  // a width change re-arms a film that has not played and ends one that is playing on its finished frame
  var lastW = innerWidth;
  addEventListener('resize', function () {
    if (innerWidth === lastW || !G) return; lastW = innerWidth;
    films.forEach(function (f) { if (f.mode === 'wait' || f.mode === 'held' || f.mode === 'queued') { f.arm(); if (!f.played) f.watch(); } else if (f.mode === 'play' || f.mode === 'paused' || f.mode === 'start') f.done(); });
    fitRolls();
  });
})();
