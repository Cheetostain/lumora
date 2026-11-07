/* Home (2026-10-10; the generalist Home since 2026-10-30, plan P10). Franco, Oct 27: "clean up the home... just keeping it
   generalist, so the offices." Home shows the Offices sample only (body data-sample-lock, system.js), so nothing here rewrites the page
   after a pick: the picker, the walk's stops and the night's lock screen left, with their scripts (size, walkLink, picked, walkAlso,
   intro, slip, picker, nightTag, variants, seat, pickerRow, toolsFollow, stopHead, chipsPeek; "home ORIGINAL-2026-10-30-generalist.js"
   beside this file has them). What runs: What we automate's PDF picture (orderPic, as built), the walk film and the night film
   (films; direction C of the Nov 4 review since Nov 5, "home ORIGINAL-2026-11-05-films-c.js" has the Oct 30 films), the hero
   sheet's late rows on a phone (heroFill), the sheet's rows that jump to the film (sheetMap) and the walk heading's second tone
   (twoTone). */
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
  // notice; QuickBooks and Gmail say what else got done; the hours back close it. 5.7 s, when all of it is in view (a screen
  // shorter than the picture starts it at 60%), then .done hands the frame back to home.css, so nothing jumps; the end holds 3 s
  // and it plays again while it is in view (Nov 6, with the films: Franco found Play again "feels like a video"). It pauses off the
  // screen and goes on when back. One round Pause icon, Pause and Play (WCAG 2.2.2: it moves for more than 5 s beside the list). GSAP 3.15.0 with Flip and CustomEase, vendored beside
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
    var G, F, CE, MOVE, OUT, IN, tl = null, mode = 'wait', played = false, made = [], ready = false, armed = false, loopT = 0, seen = false;

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
      armed = false;   // the next play builds it anew (arming here would bring the first frame back)
      // Nov 6: the end holds 3 s, then it plays again from the start when the reader can see it (a reader who paused keeps it paused)
      clearTimeout(loopT);
      if (mode === 'paused') { mode = 'stopped'; label('play'); return; }
      mode = 'done'; label('pause');
      loopT = setTimeout(function () { if (mode !== 'done') return; mode = 'wait'; played = false; arm(); watch(); }, 3000);
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
    /* pause and play (the round icon; its word for screen readers) */
    function label(m) {
      if (!btn) return;
      var vis = (ES ? { pause: 'Pausar', play: 'Reproducir' } : { pause: 'Pause', play: 'Play' })[m];
      btn.setAttribute('aria-label', (ES ? { pause: 'Pausar la animación', play: 'Reproducir la animación' } : { pause: 'Pause animation', play: 'Play animation' })[m]);
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
      else if (mode === 'away') { mode = 'paused'; label('play'); }   // stopped off the screen: it stays stopped
      else if (mode === 'done') { clearTimeout(loopT); mode = 'stopped'; label('play'); }   // holding its end: no next play
      else if (mode === 'wait') { mode = 'held'; label('play'); }     // pressed before it began: it never starts by itself
      else if (ready) play();                                          // held or stopped: play from the start
      else { mode = 'wait'; label('pause'); }                         // held while GSAP is still on its way: it plays when in view
    });
    // job: one-time focus, kept on a loop. Off the screen it pauses where it is and goes on when back (Nov 6)
    new IntersectionObserver(function (es) {
      seen = es[0].isIntersecting;
      if (!seen && mode === 'play') { tl.pause(); mode = 'away'; }
      else if (seen && mode === 'away') { tl.play(); mode = 'play'; }
    }).observe(stage);
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
        if (mode === 'wait' || mode === 'held') { arm(); if (!played) watch(); } else if (mode === 'play' || mode === 'paused' || mode === 'away') done();
      });
    }
    // job: one-time focus. Plays when the whole picture is in view of the reader (SYSTEM.md 9: a sequence ends on screen), each
    // time round. The sticky header and the phone's call bar cover the screen's top and foot, so they come off the view (reviewers'
    // round, Oct 27: at 393 the play began with the stage's last 75px, where the reply notice and the hours line land, under the bar)
    // Nov 5 (the Nov 4 review): its Pause under the picture clears the call bar too, where the screen holds the picture and the
    // Pause together, and it waits while the night film above still plays where the reader can see it (window.CF, films below:
    // at 1440 the play began with the night film's last 114px still moving on screen)
    var io = null, ctl = fig.querySelector('.sa-ctl');
    function inView() {
      var hdr = document.querySelector('.hdr'), bar = document.querySelector('.callbar');
      var top = hdr ? hdr.offsetHeight : 0, barH = bar && bar.getClientRects().length && getComputedStyle(bar).display !== 'none' ? bar.offsetHeight : 0, bot = innerHeight - barH;
      // the whole stage where the screen holds it (at .95 its last 20px, the hours line's, could still sit under the bar);
      // a screen shorter than the stage plays once most of it is in view
      var r = stage.getBoundingClientRect(), seen = Math.max(0, Math.min(r.bottom, bot) - Math.max(r.top, top)) / r.height;
      var room = (bot - top) / r.height, need = room >= 1 ? 1 : room >= .95 ? .95 : room >= .6 ? .6 : .3;
      if (seen < need - .001) return false;
      if (ctl) { var c = ctl.getBoundingClientRect(); if (c.bottom - r.top <= bot - top && c.bottom > bot + .5) return false; }
      return true;
    }
    // the review round (Nov 5): with B in view and a film still playing above it, mostly off the screen, that film is asked to stop at
    // its next stop (CF.yieldTo), at most 6 s on, and its cf:idle starts B; at 1440 B had sat on its first frame for up to 20 s
    function tryPlay() {
      if (played || mode !== 'wait' || !inView()) return;
      if (window.CF && CF.busy()) { if (CF.yieldTo) CF.yieldTo(); return; }
      io.disconnect(); play();
    }
    function watch() {
      if (io) io.disconnect();
      var hdr = document.querySelector('.hdr'), bar = document.querySelector('.callbar');
      var top = hdr ? hdr.offsetHeight : 0, bot = bar && bar.getClientRects().length ? bar.offsetHeight : 0;
      io = new IntersectionObserver(tryPlay, { threshold: [0, .3, .6, .95, 1], rootMargin: '-' + top + 'px 0px -' + bot + 'px 0px' });
      io.observe(stage); if (ctl) io.observe(ctl);
    }
    document.addEventListener('cf:idle', function () { if (io) tryPlay(); });
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
     The walk film and the night film: direction C of the Nov 4 animation review (anim-review-2026-11-04, REPORT.html and
     science/RULES.md; Franco, Nov 5: "I like this... This is perfect."), moved here from the prototype's films-c.js on Nov 5.
     Rules from the review: one region changes at a time, at least 0.5 s between changes; every caption is held long enough to
     read (1 s plus 0.33 s a word, in its own language); money moves only on the walk sheet, after the work is shown; the end frame
     tells the story alone. home.css draws each film's END frame, so reduced motion, ?still or a failed load show the finished
     picture with no control. Here GSAP 3.15 (the vendored copy beside system.js, loaded once for the page by loadGsap) sets the
     first frame and plays one timeline per film. A film starts once half of it is on screen, between the sticky header and the
     phone's call bar, and runs on its own. A film that leaves the screen pauses at its next stop and goes on when it is back. At
     its end it holds 3 s, then plays again from the start while half of it is on screen (one that is away waits for the reader).
     Nov 6 (Franco: "the 1, 2, 3 and the play again... just feels like a video almost and doesn't feel like part of the website"):
     the 1 2 3 marks and Play again are gone; one round Pause icon sits inside the film, at its top (WCAG 2.2.2), and the walk
     sheet's lit line says which step is on. The hero sheet's rows still jump to their step (#stop-1 to 3). Step 3 shows the copy
     and the check (Franco, Nov 5: "it should be clear that there are no mistakes being made"): the premium lands in the invoice,
     then the name, the policy number and the amount get their ticks on the invoice, and the policy's name and number get theirs,
     each group in one place. While a film plays on screen, What we automate's picture waits (CF.busy, and a cf:idle event when it
     stops; CF.yieldTo asks a film mostly off the screen to stop at its next stop). window.CF is what the clip and check tools
     read: each film's beats ({t, d, region, what, with}) and end. Only transform, opacity and stroke-dashoffset move. */
  function films() {
    var figs = [].slice.call(document.querySelectorAll('figure.cf[data-cfilm]'));
    var CF = window.CF = { films: {}, ready: false, busy: function () { return false; } };
    if (!figs.length) { CF.ready = true; return; }
    var Q = new URLSearchParams(location.search);
    var STILL = Q.has('still') || matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window);
    var $ = function (s, r) { return (r || document).querySelector(s); };
    var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };
    // the night's policy sheet: the rows' real pitch (a row is its height plus a 1px border), so the roll and the cursor never drift,
    // and the cursor on column C; the still frame needs it too
    function polFit(fig) {
      var vp = $('.pol-vp', fig), roll = vp && $('.pol-roll', vp); if (!roll) return 0;
      var rws = $$('tr', roll), cur = $('.pol-cur', vp), cc = $('td.pol-c', roll), rh = rws[1].offsetTop - rws[0].offsetTop;
      vp.style.setProperty('--rp', rh + 'px'); cur.style.left = cc.offsetLeft + 'px'; cur.style.width = cc.offsetWidth + 'px';
      return rh;
    }
    if (STILL) {
      figs.forEach(function (f) { f.classList.add('still'); polFit(f); });
      addEventListener('resize', function () { figs.forEach(polFit); });
      CF.ready = true; CF.still = true; return;
    }

    var G, MOVE, OUT;
    var LAB = ES ? { pause: 'Pausar', play: 'Reproducir' } : { pause: 'Pause', play: 'Play' };
    var LAL = ES ? { pause: 'Pausar la animación', play: 'Reproducir la animación' } : { pause: 'Pause animation', play: 'Play animation' };
    var HOLD = 3000;   // Nov 6: the end frame holds 3 s before the next play
    // a film that stops moving (paused, done, or off the screen) tells What we automate's picture, which waits while one plays on screen
    function idle() { document.dispatchEvent(new Event('cf:idle')); }

    function Film(fig, build, stops, steps) {
      var F = { name: fig.getAttribute('data-cfilm'), fig: fig, mode: 'wait', tl: null, played: false, away: false, beats: [], end: 0, ratio: 0, pending: null, due: false, loopT: 0 };
      var btn = $('.cf-pause', fig), lab = btn && $('.pt', btn), fx = $('.cf-fx', fig), made = [], temp = [];
      CF.films[F.name] = F;
      function label(m) { if (!btn) return; btn.setAttribute('aria-label', LAL[m]); btn.classList.toggle('is-paused', m !== 'pause'); lab.textContent = LAB[m]; }
      function arr(x) { return [].concat(x).filter(Boolean); }
      function rect(el) { var r = el.getBoundingClientRect(), s = fx.getBoundingClientRect(); return { x: r.left - s.left, y: r.top - s.top, w: r.width, h: r.height }; }
      function f1(n) { return Math.round(n * 10) / 10; }
      function roundBox(w, h) {           // B's ink box: starts just past the top-left corner and runs clockwise, as a pen would
        var o = .75, x0 = o, y0 = o, x1 = w - o, y1 = h - o, r = Math.min(6, (x1 - x0) / 2, (y1 - y0) / 2);
        return 'M' + f1(x0 + r) + ' ' + y0 + 'H' + f1(x1 - r) + 'A' + r + ' ' + r + ' 0 0 1 ' + f1(x1) + ' ' + f1(y0 + r) + 'V' + f1(y1 - r) +
          'A' + r + ' ' + r + ' 0 0 1 ' + f1(x1 - r) + ' ' + f1(y1) + 'H' + f1(x0 + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + x0 + ' ' + f1(y1 - r) +
          'V' + f1(y0 + r) + 'A' + r + ' ' + r + ' 0 0 1 ' + f1(x0 + r) + ' ' + y0;
      }
      var tl;
      var K = {
        fig: fig, phone: false,
        track: function (els) { arr(els).forEach(function (e) { if (made.indexOf(e) < 0) made.push(e); }); return els; },
        // the first frame: written now, read back by every tween as its start
        start: function (els, vars) { els = arr(els); if (els.length) { K.track(els); G.set(els, vars); } },
        beat: function (t, d, region, what, withPrev) { if (region) F.beats.push({ t: +t.toFixed(3), d: d, region: region, what: String(what).replace(/\s+/g, ' ').trim(), with: !!withPrev }); },
        to: function (t, els, vars, region, what, withPrev) {
          els = arr(els); if (!els.length) return t;
          var v = Object.assign({ duration: .25, ease: OUT }, vars);
          tl.to(K.track(els), v, t); K.beat(t, v.duration, region, what, withPrev);
          return t + v.duration;
        },
        // job: state change. Words or a mark in one place become others: the old out in .15 s, the new in .25 s
        swap: function (t, out, inn, region, what) {
          tl.to(K.track(arr(out)), { autoAlpha: 0, duration: .15, ease: OUT }, t);
          tl.to(K.track(arr(inn)), { autoAlpha: 1, y: 0, duration: .25, ease: OUT }, t + .08);
          K.beat(t, .33, region, what);
        },
        cap: function (t, out, inn) { K.swap(t, out, inn, 'caption', inn.textContent); },
        // job: show our work. B's ink box round a value, drawn by the pen
        box: function (el) {
          var b = rect(el), pad = 4, W = b.w + pad * 2, H = b.h + pad * 2 - 2, NS = 'http://www.w3.org/2000/svg';
          var svg = document.createElementNS(NS, 'svg'), p = document.createElementNS(NS, 'path');
          svg.setAttribute('class', 'cf-box'); svg.setAttribute('width', W); svg.setAttribute('height', H); svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
          svg.style.left = (b.x - pad) + 'px'; svg.style.top = (b.y - pad + 1) + 'px';
          p.setAttribute('d', roundBox(W, H)); p.setAttribute('pathLength', '1');
          svg.appendChild(p); fx.appendChild(svg); temp.push(svg);
          G.set(p, { strokeDasharray: '1 2', strokeDashoffset: 1.01 });
          return p;
        },
        // job: cause and effect. A copy of a value lifts off its place and lands where it fills (B's fly). Both places are measured
        // on the timeline itself, at the moment the copy leaves and lands
        fly: function (t, from, to, text, d, region, what) {
          tl.seek(t, true); var a = rect(from);
          tl.seek(t + d + .2, true); var b = rect(to);
          var el = document.createElement('span'); el.className = 'cf-fly'; el.textContent = text;
          if (from.closest('.cf-night')) el.style.fontSize = '13px';
          fx.appendChild(el); temp.push(el);
          var w = el.offsetWidth, h = el.offsetHeight, fw = fx.clientWidth, cl = function (x) { return Math.max(2, Math.min(fw - w - 2, x)); };
          var x0 = cl(a.x + a.w / 2 - w / 2), y0 = a.y + a.h / 2 - h / 2, x1 = cl(b.x + b.w / 2 - w / 2), y1 = b.y + b.h / 2 - h / 2;
          G.set(el, { x: x0, y: y0, autoAlpha: 0 });
          tl.to(el, { autoAlpha: 1, scale: 1.06, y: y0 - 4, duration: .18, ease: OUT }, t)
            .to(el, { x: x1, y: y1, scale: 1, duration: d - .18, ease: MOVE }, t + .18)
            .to(el, { autoAlpha: 0, duration: .14, ease: OUT }, t + d);
          K.beat(t, d, region, what);
          return t + d;
        }
      };
      F.kit = K;
      function clean() {
        if (tl) { tl.kill(); tl = F.tl = null; }
        temp.forEach(function (x) { x.remove(); }); temp = [];
        if (made.length) G.set(made, { clearProps: 'all' }); made = [];
        F.beats = [];
      }
      function arm() {
        clean();
        K.phone = fig.clientWidth < 760;
        tl = F.tl = G.timeline({ paused: true, defaults: { lazy: false }, onComplete: done });
        F.end = build(tl, K);
        tl.set({}, {}, F.end);
        // a film that left the screen stops at its next stop, so the visitor comes back to a readable frame
        stops.forEach(function (s) { tl.call(function () { if (F.away && F.mode === 'play') { tl.pause(); F.mode = 'away'; label('play'); idle(); } }, null, s); });
        tl.seek(0, true);
        F.armed = true;
      }
      // the end: hold 3 s, then play again from the start if half the film is on screen and What we automate's picture isn't playing
      // there; otherwise the next play is due when the reader is back (F.due, the observer below). Its mode stays 'done' until then
      function again() {
        if (F.mode !== 'done') return;
        var sa = window.SA && SA.mode === 'play';
        if (F.ratio >= .5 && !sa && !document.hidden) { F.due = false; F.play(0); }
        else { F.due = true; if (sa) F.loopT = setTimeout(again, 1000); }
      }
      function done() { F.mode = 'done'; label('pause'); fig.classList.add('done'); idle(); clearTimeout(F.loopT); F.loopT = setTimeout(again, HOLD); }
      F.arm = arm;
      F.play = function (from) {
        if (!tl) return;
        clearTimeout(F.loopT); F.due = false;
        fig.classList.remove('done');
        F.played = true; F.away = io ? F.ratio < .2 : false; F.mode = 'play'; label('pause');
        if (from != null) tl.play(from); else tl.play();
        fig.setAttribute('data-t0', String(performance.now()));
      };
      F.replay = function () { F.play(0); };
      F.jump = function (i) {
        if (!tl) { F.pending = i; return; }
        F.play(steps[i] || 0);
      };
      if (btn) btn.addEventListener('click', function () {
        if (!tl) { F.mode = F.mode === 'held' ? 'wait' : 'held'; label(F.mode === 'held' ? 'play' : 'pause'); return; }
        if (F.mode === 'play') { tl.pause(); F.mode = 'paused'; label('play'); idle(); }
        else if (F.mode === 'paused' || F.mode === 'away') F.play();
        else if (F.mode === 'done') { clearTimeout(F.loopT); F.due = false; F.mode = 'stopped'; label('play'); }   // holding its end: no next play
        else if (F.mode === 'stopped') F.play(0);
        else if (F.mode === 'wait') { F.mode = 'held'; label('play'); }
        else if (F.mode === 'held') F.play(0);
      });
      // job: one-time focus. Half the film on screen between the header and the call bar starts it; under a fifth, it is away
      var io = null;
      F.watch = function () {
        if (io) io.disconnect();
        var hdr = $('.hdr'), bar = $('.callbar'), top = hdr ? hdr.offsetHeight : 0, bot = bar && bar.getClientRects().length && getComputedStyle(bar).display !== 'none' ? bar.offsetHeight : 0;
        io = new IntersectionObserver(function (es) {
          es.forEach(function (e) {
            F.ratio = e.intersectionRatio;
            if (F.ratio >= .5) {
              F.away = false;
              if (F.mode === 'wait' && !F.played) { if (F.pending != null) { F.jump(F.pending); F.pending = null; } else F.play(0); }
              else if (F.mode === 'away') F.play();
              else if (F.mode === 'done' && F.due) again();   // the next play waited for the reader
            } else if (F.ratio < .2 && F.mode === 'play') F.away = true;
            if (!e.isIntersecting) idle();
          });
        }, { threshold: [0, .2, .5, .8, 1], rootMargin: '-' + top + 'px 0px -' + bot + 'px 0px' });
        io.observe(fig);
      };
      return F;
    }

    /* ---------- the walk: the walk sheet is the step list ---------- */
    function walk(tl, K) {
      var f = K.fig, ph = K.phone, dim = ph ? 0 : .38;
      var sheet = $('.cf-main-sheet', f), over = $('.cf-over', f), L = $$('.cf-ln', sheet);
      var strike = function (i) { return $('.cf-strike', L[i]); }, res = function (i) { return $('.cf-res', L[i]); };
      var caps = $$('.cf-cap', f), b = caps.map(function (c) { return $('.cf-b', c); }), c2 = $('.cf-c', caps[2]), main = $('.cf-main', f);
      var ol = $('.cf-ol', f), xl = $('.cf-xl', f), inv = $('.cf-inv', f), end = ph ? over : sheet;
      var selbg = $('.ol-selbg', ol), empty = $('.ol-empty', ol), read = $('.ol-read', ol), mail = $('.ol-mail', ol), flag = $('.ol-flag', ol), sent = $('.ol-sent', ol);
      var cur = $('.cx-cur', xl), okf = $('.cx-okf', xl), e0 = [$('.cx-e12 .v0', xl), $('.cx-fv .v0', xl)], e1 = [$('.cx-e12 .v1', xl), $('.cx-fv .v1', xl)];
      var prem = $('.prem', inv), fld = $('.cq-fld', inv), qv = $('.cq-v', inv), rs = $('.cq-rs', inv), saved = $('.cq-saved', inv);
      var ok = $$('.cf-brw .cq-ok path', inv), okp = $$('.cf-doc .cq-ok path', inv);   // the invoice's ticks, then the policy's
      /* the first frame: line 1 lit, Outlook's Sent Items, Karen's flagged quote */
      K.start(L, { autoAlpha: dim }); K.start(L[0], { autoAlpha: 1 });
      K.start($$('.cf-strike', sheet), { scaleX: 0 }); K.start($$('.cf-res', sheet), { autoAlpha: 0, y: 4 });
      K.start($('.cf-won', sheet), { autoAlpha: 0, y: 4 }); K.start($('.cf-under path', sheet), { strokeDasharray: '1 1', strokeDashoffset: 1 });
      if (ph) { K.start(over, { autoAlpha: 0, y: 8 }); K.start($('.cf-tot .cf-strike', over), { scaleX: 0 }); K.start($('.cf-won', over), { autoAlpha: 0, y: 4 }); K.start($('.cf-under path', over), { strokeDasharray: '1 1', strokeDashoffset: 1 }); }
      K.start(main, { opacity: 1 });
      K.start(caps[0], { autoAlpha: 1, y: 0 }); K.start([caps[1], caps[2]], { autoAlpha: 0, y: 4 }); K.start(b.concat(c2), { autoAlpha: 0, y: 4 });
      K.beat(0, 0, 'caption', $('.cf-a', caps[0]).textContent, true);   // on screen from the first frame (the caption rule reads it)
      K.start(ol, { autoAlpha: 1, y: 0 }); K.start([xl, inv], { autoAlpha: 0, y: 8 });
      K.start(selbg, { autoAlpha: 0 }); K.start([flag], { autoAlpha: 1 }); K.start(sent, { autoAlpha: 0 });
      if (ph) K.start(read, { yPercent: 104 }); else { K.start(empty, { autoAlpha: 1 }); K.start(mail, { autoAlpha: 0, x: 40 }); }
      K.start([cur, okf].concat(e1), { autoAlpha: 0 }); K.start(e0, { autoAlpha: 1 });
      K.start([qv, saved], { autoAlpha: 0 }); K.start(rs, { autoAlpha: 1 }); K.start(ok.concat(okp), { strokeDasharray: '1 1', strokeDashoffset: 1 });
      /* 1. Karen Davis: the follow-up sends itself */
      K.to(2.4, selbg, { autoAlpha: 1 }, 'stage', "Karen's row fills light blue");
      if (ph) K.to(2.9, read, { yPercent: 0, duration: .8, ease: MOVE }, 'stage', 'the reply slides up under her row');
      else { tl.to(K.track(empty), { autoAlpha: 0, duration: .2, ease: OUT }, 2.9); K.to(2.9, mail, { autoAlpha: 1, x: 0, duration: .8, ease: MOVE }, 'stage', 'the reading pane slides in'); }
      // 4.0 s: the Spanish first line, "Karen Davis recibió su cotización el lunes. No contestó.", is nine words (3.97 s)
      K.to(4.0, b[0], { autoAlpha: 1, y: 0 }, 'caption', b[0].textContent);
      K.swap(4.5, flag, sent, 'stage', 'the flag becomes Sent');
      K.to(6.4, strike(0), { scaleX: 1, duration: .5, ease: MOVE }, 'sheet', 'the pen strikes $1,560');
      K.to(6.9, res(0), { autoAlpha: 1, y: 0, duration: .4 }, 'sheet', '36 of 48 followed up');
      /* 2. Maria Garcia: on today's call list */
      K.to(8.6, L[0], { autoAlpha: dim }, 'sheet', 'line 2 lights'); tl.to(K.track(L[1]), { autoAlpha: 1, duration: .25, ease: OUT }, 8.6);
      K.to(9.1, ol, { autoAlpha: 0, duration: .3 }, 'stage', 'crossfade to Excel'); tl.to(K.track(xl), { autoAlpha: 1, y: 0, duration: .3, ease: OUT }, 9.1);
      tl.to(caps[0], { autoAlpha: 0, duration: .25, ease: OUT }, 9.1);
      // 9.6 to 14.0 s: the Spanish line, "La renovación de Maria sube 18%. Nadie la ha llamado.", is ten words (4.30 s)
      K.to(9.6, caps[1], { autoAlpha: 1, y: 0 }, 'caption', $('.cf-a', caps[1]).textContent);
      K.to(13.0, cur, { autoAlpha: 1 }, 'stage', 'E12 selected');
      K.to(14.0, b[1], { autoAlpha: 1, y: 0 }, 'caption', b[1].textContent);
      K.swap(14.5, e0, e1, 'stage', 'E12 becomes Yes and the call date'); tl.to(K.track(okf), { autoAlpha: 1, duration: .3, ease: OUT }, 14.5);
      K.to(17.3, strike(1), { scaleX: 1, duration: .5, ease: MOVE }, 'sheet', 'the pen strikes $1,200');
      K.to(17.8, res(1), { autoAlpha: 1, y: 0, duration: .4 }, 'sheet', '24 of 30 called in time');
      /* 3. Lisa Anderson: the invoice fills in from her policy, then its details are checked against it */
      K.to(19.4, L[1], { autoAlpha: dim }, 'sheet', 'line 3 lights'); tl.to(K.track(L[2]), { autoAlpha: 1, duration: .25, ease: OUT }, 19.4);
      K.to(19.9, xl, { autoAlpha: 0, duration: .3 }, 'stage', 'crossfade to the policy and the invoice'); tl.to(K.track(inv), { autoAlpha: 1, y: 0, duration: .3, ease: OUT }, 19.9);
      tl.to(caps[1], { autoAlpha: 0, duration: .25, ease: OUT }, 19.9);
      K.to(20.7, caps[2], { autoAlpha: 1, y: 0 }, 'caption', $('.cf-a', caps[2]).textContent);
      tl.seek(22.4, true); var box = K.box(prem);
      K.to(22.5, box, { strokeDashoffset: 0, duration: .3 }, 'stage', 'the premium is boxed');
      tl.to(K.track(qv), { autoAlpha: 1, duration: .16, ease: OUT }, 24.0);
      K.fly(23.3, prem, fld, prem.textContent.trim(), .8, 'stage', '$1,248.00 lands in Amount');
      K.to(24.1, b[2], { autoAlpha: 1, y: 0 }, 'caption', b[2].textContent);
      // the check (Nov 5): the name, the policy number and the amount each get a tick on the invoice, then the policy's own name and
      // number get theirs, 0.5 s on, so the eye sees what each was checked against (the review round: the invoice's ticks alone
      // showed a tick but not its other half). Each group is like items in one place, 0.16 s apart (RULES.md 2: up to four like
      // items moving the same way in one region read as one change). The caption says it once both are drawn
      K.to(27.25, ok, { strokeDashoffset: 0, duration: .3, stagger: .16, ease: MOVE }, 'stage', 'check: name, policy number and amount ticked on the invoice');
      K.to(27.75, okp, { strokeDashoffset: 0, duration: .3, stagger: .16, ease: MOVE }, 'stage', "check: the policy's name and number ticked");
      K.to(28.25, c2, { autoAlpha: 1, y: 0 }, 'caption', c2.textContent);
      K.swap(28.75, rs, saved, 'stage', 'Review and send becomes Saved');
      // on a phone the full sheet comes over the stage and covers the check's caption, so the phone's end starts 0.95 s later
      // (the review round: at 32.0 s the line had 2.6 s of quiet reading; the Spanish one needs 4.96 s)
      var e = ph ? 32.1 : 31.15;
      K.to(e, strike(2), { scaleX: 1, duration: .5, ease: MOVE }, 'sheet', 'the pen strikes $792');
      K.to(e + .5, res(2), { autoAlpha: 1, y: 0, duration: .4 }, 'sheet', '33 hours of typing back');
      /* the end: the whole sheet, the loss struck, the month won back */
      e += ph ? 1.5 : 1.1;
      if (ph) K.to(e, over, { autoAlpha: 1, y: 0 }, 'sheet', 'the full sheet comes over the stage');
      else K.to(e, [L[0], L[1]], { autoAlpha: 1 }, 'sheet', 'the whole sheet lights');
      K.to(e + .5, $('.cf-tot .cf-strike', end), { scaleX: 1, duration: .5, ease: MOVE }, 'sheet', 'the pen strikes Lost before any fix');
      K.to(e + 1.1, $('.cf-won', end), { autoAlpha: 1, y: 0, duration: .4 }, 'sheet', 'Won back $3,552 a month');
      tl.to(K.track($('.cf-under path', end)), { strokeDashoffset: 0, duration: .7, ease: MOVE }, e + 1.3);
      K.to(e + 2.0, main, { opacity: .45, duration: .3 }, 'stage', 'the stage steps back');
      return e + 2.3;
    }

    /* ---------- the night: the phone leads, two desk scenes, the morning list ---------- */
    function night(tl, K) {
      var f = K.fig, caps = $$('.cf-cap', f), desk = $('.cf-desk', f), bills = $('.cf-bills', f), pol = $('.cf-pol', f);
      var okRows = $$('.b-ok', bills), okSt = $$('.b-ok .b-st', bills), red = $('.b-red', bills);
      var dd = $$('.ph-date span', f), kk = $$('.ph-clk span', f), nt = $('.ph-nt', f), tm = $$('.nt-tm span', f), ntH = $('.nt-h', f), li = $$('.nt-l li', f);
      var vp = $('.pol-vp', pol), roll = $('.pol-roll', pol), cur = $('.pol-cur', pol), np = $$('.pol-np', pol), rings = $$('.pol-ring path', pol);
      var rh = polFit(f), c = parseFloat(getComputedStyle(vp).getPropertyValue('--c')) || 2;
      var at = function (row) { return -(row - 2 - c) * rh; };   // the roll's y that puts a sheet row under the cursor
      /* the first frame: 11:40 PM, QuickBooks' bills, the phone asleep with nothing on it */
      K.start(caps, { autoAlpha: 0, y: 4 }); K.start(caps[0], { autoAlpha: 1, y: 0 });
      K.beat(0, 0, 'caption', caps[0].textContent, true);   // on screen from the first frame (the caption rule reads it)
      K.start(desk, { opacity: 1 }); K.start(bills, { autoAlpha: 1, y: 0 }); K.start(pol, { autoAlpha: 0, y: 8 });
      K.start(okRows, { opacity: 1 }); K.start([red].concat(okSt), { autoAlpha: 0 });
      K.start(dd, { autoAlpha: 0 }); K.start(dd[0], { autoAlpha: 1 }); K.start(kk, { autoAlpha: 0 }); K.start(kk[0], { autoAlpha: 1 });
      K.start(nt, { autoAlpha: 0, y: -10 }); K.start(tm[1], { autoAlpha: 0 }); K.start(tm[0], { autoAlpha: 1 });
      K.start([ntH, li[1], li[2]], { autoAlpha: 0, display: 'none' });
      K.start(roll, { y: 0 }); K.start(cur, { autoAlpha: 0 }); K.start(np, { autoAlpha: 0 }); K.start(rings, { strokeDasharray: '1 2', strokeDashoffset: 1.01 });
      /* 11:40 PM: three bills against their quotes, one over */
      K.to(1.0, okSt, { autoAlpha: 1, duration: .75 }, 'desk', 'two Matches quote ticks');
      K.to(2.4, okRows, { opacity: .4 }, 'desk', 'the other rows dim, Plover IT turns red'); tl.to(K.track(red), { autoAlpha: 1, duration: .25, ease: OUT }, 2.4);
      K.cap(5.0, caps[0], caps[1]);
      tl.to(nt, { autoAlpha: 1, y: 0, duration: .25, ease: OUT }, 6.5);
      K.fly(5.75, red, li[0], li[0].textContent, .9, 'phone', 'the red line lands on the morning list');
      /* 12:05 AM: the filing, as one line on the phone */
      K.cap(9.3, caps[1], caps[2]);
      K.swap(9.8, [kk[0], dd[0]], [kk[1], dd[1]], 'phone', 'clock 12:05 AM, Monday');
      tl.set(li[1], { display: 'list-item' }, 10.4); K.to(10.4, li[1], { autoAlpha: 1 }, 'phone', '6 attachments filed joins the note');
      /* 5:40 AM: September's policies against the carrier's statement */
      K.to(13.0, bills, { autoAlpha: 0, duration: .3 }, 'desk', 'crossfade to Policies 2026.xlsx'); tl.to(K.track(pol), { autoAlpha: 1, y: 0, duration: .3, ease: OUT }, 13.0);
      K.cap(13.8, caps[2], caps[3]);
      K.swap(14.3, kk[1], kk[2], 'phone', 'clock 5:40');
      tl.to(cur, { autoAlpha: 1, duration: .12, ease: OUT }, 14.8);
      K.to(14.8, roll, { y: at(29), duration: 1.2, ease: 'power2.inOut' }, 'desk', 'the rows run and stop on row 29');
      K.to(16.0, np[0], { autoAlpha: 1 }, 'desk', 'Not paid, circled, beside $0.00'); tl.to(rings[0], { strokeDashoffset: 0, duration: .5, ease: MOVE }, 16.0);
      K.to(18.0, roll, { y: at(31), duration: .3, ease: MOVE }, 'desk', 'one step to row 31');
      K.to(18.5, np[1], { autoAlpha: 1 }, 'desk', 'Not paid, circled'); tl.to(rings[1], { strokeDashoffset: 0, duration: .5, ease: MOVE }, 18.5);
      /* 6:30 AM: the desk steps back, the phone carries the list */
      K.cap(20.5, caps[3], caps[4]);
      K.to(21.0, desk, { opacity: .35, duration: .5 }, 'desk', 'the desk dims');
      K.swap(21.5, kk[2], kk[3], 'phone', 'clock 6:30');
      tl.set(ntH, { display: 'block' }, 22.0); tl.set(li[2], { display: 'list-item' }, 22.0);
      K.to(22.0, [ntH, li[2]], { autoAlpha: 1, duration: .4 }, 'phone', 'the note grows: 3 things need you');
      tl.to(K.track(tm[0]), { autoAlpha: 0, duration: .15 }, 22.0); tl.to(K.track(tm[1]), { autoAlpha: 1, duration: .25 }, 22.08);
      return 26.5;
    }

    /* ---------- wiring ---------- */
    var list = [];
    figs.forEach(function (fig) {
      var n = fig.getAttribute('data-cfilm');
      // the walk's stops: each step's start, and 27.0 s, just before the check, so a reader who scrolled away in step 3 comes back
      // to the ticks being drawn, not to a finished film (the review round, Nov 5)
      if (n === 'walk') list.push(Film(fig, walk, [8.6, 19.4, 27.0], [0, 8.6, 19.4]));
      if (n === 'night') list.push(Film(fig, night, [5.0, 9.3, 13.0, 20.5], [0]));
    });
    // a film that plays where the reader can see any of it; What we automate's picture waits for it (orderPic)
    CF.busy = function () {
      return list.some(function (f) { if (f.mode !== 'play') return false; var r = f.fig.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight; });
    };
    // B is in view and waits: a film playing with under half of it on screen stops at its next stop, and its cf:idle starts B
    CF.yieldTo = function () { list.forEach(function (f) { if (f.mode === 'play' && f.ratio < .5) f.away = true; }); };
    // the hero sheet's rows link to the walk's marks (#stop-1 to 3): the page scrolls there (sheetMap), and the film plays that step
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#stop-"]'); if (!a || !CF.films.walk) return;
      var i = +a.getAttribute('href').slice(6) - 1; if (i >= 0 && i < 3) CF.films.walk.jump(i);
    });
    function startAll() {
      G = window.gsap; G.registerPlugin(window.CustomEase);
      MOVE = CustomEase.create('cfMove', '.2,0,0,1'); OUT = CustomEase.create('cfOut', '.33,1,.68,1');
      var auto = !Q.has('noauto');   // the clip tools step the timelines themselves
      // each film is built in a task of its own (the review round, Nov 5: both in one task made a 170 to 211 ms frame at 393 on a
      // slow phone, about 90 ms the walk's and 70 to 100 ms the night's)
      each(function (f) { f.arm(); if (auto) f.watch(); }, function () { CF.ready = true; });
    }
    function each(fn, then) {
      var i = 0;
      (function next() { if (i >= list.length) { if (then) then(); return; } fn(list[i++]); setTimeout(next, 0); })();
    }
    var near = new IntersectionObserver(function (es) {
      if (!es.some(function (e) { return e.isIntersecting; })) return;
      near.disconnect();
      loadGsap().then(function () { return document.fonts && document.fonts.ready; }).then(startAll, function () { figs.forEach(function (f) { f.classList.add('still'); polFit(f); }); CF.ready = true; });
    }, { rootMargin: '600px 0px' });
    figs.forEach(function (f) { near.observe(f); });
    // a width change rebuilds each film for the new layout and puts it back where it was
    var lastW = innerWidth;
    addEventListener('resize', function () {
      if (innerWidth === lastW || !G) return; lastW = innerWidth;
      each(function (f) {
        if (!f.tl) return;
        var t = f.tl.time(), going = f.mode === 'play';
        f.arm(); f.tl.seek(t, true); if (going) f.tl.play();
      });
    });
  }

  /* the hero sheet on a phone (Nov 5; the Nov 4 review: "the hero writes itself below the fold on phones"). system.js writes the
     sheet in on load when its top is on the first screen, which on Home's phone layout leaves rows 2 and 3 and the total writing
     under the call bar, unseen. Here every part of the sheet that starts below the call bar waits, empty, and writes in when it
     scrolls into view, one row after another as the sheet does. A computer, reduced motion and ?still are left as they are */
  function heroFill() {
    var s = document.querySelector('.hm4-hero .sheet[data-fill]');
    if (!s || !s.classList.contains('writing') || s.classList.contains('wait') || !('IntersectionObserver' in window)) return;
    var bar = document.querySelector('.callbar'), barH = bar && bar.getClientRects().length && getComputedStyle(bar).display !== 'none' ? bar.offsetHeight : 0;
    if (!barH) return;
    var low = innerHeight - barH;
    var parts = [].slice.call(s.querySelectorAll('.sh-rows > li, .sh-total, .sh-time')).filter(function (e) { return e.getBoundingClientRect().top > low - 8; });
    if (!parts.length) return;
    parts.forEach(function (e) { e.classList.add('fill-wait'); });
    var io = new IntersectionObserver(function (es) {
      var k = 0;   // the parts that come into view together write in one after another, from their own start
      es.forEach(function (en) {
        if (!en.isIntersecting) return;
        var e = en.target; io.unobserve(e);
        if (e.tagName === 'LI') e.style.setProperty('--i', String(k)); else e.style.animationDelay = (k * 420 + 200) + 'ms';
        k++; e.classList.remove('fill-wait');
      });
    }, { rootMargin: '0px 0px -' + (barH + 8) + 'px 0px' });
    parts.forEach(function (e) { io.observe(e); });
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
      var film = s.closest('.cf-walk'), h = film ? document.querySelector('#walk .walk-h') : s.querySelector('.stop-t h3'), to = film || s, done = false, focus = function () { if (done || !h) return; done = true; h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); };
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
    films();      // the walk film and the night film (direction C, Nov 5)
    heroFill();   // the hero sheet on a phone: what starts under the call bar writes in when it comes into view (Nov 5)
    if (!window.Lumora) return;
    sheetMap(); twoTone();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
