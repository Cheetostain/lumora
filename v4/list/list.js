/* What we automate (/what-we-automate/): the trade filter (W2). Job: cause and effect. A picked trade hides the other trades'
   lines and the stages left empty, never reorders, updates the stage index and the count line (read out politely; it sits above
   the chips, so the words a tap changes are in view), and goes into the address as ?trade= (?trade=all once All is picked here),
   so a trade page can link straight to its own list and an owner can text the link. The pick is also handed to Lumora.setTrade,
   so Home and the trade pages open on it, and a pick made there opens this page on it. While a trade is picked: its 5 read-first
   rows show as jump links above the list (items.json "top"), the papers picture turns into that trade's own when there is one
   (AC: Kestrel Air), and on a phone one line under the header says which trade is showing once the filter has scrolled away.
   Since the everything run (2026-11-25) a stage's place on a phone ("5 of 10") counts the stages showing, a block whose stages are all
   empty hides with them, and a picture of the one job shows only beside rows at least as tall as it and its stage's name; where it
   doesn't fit on the pine block, the name goes over the rows. One movement: the bill's four lines land in the Excel sheet once.
   Filtering has no animation. Without JS the filter, the links and the line are hidden and every line shows with its trade names (list.css).
   The Spanish page (what-we-automate.es.html, agency pass 2026-10-18) runs the same file; only the three lines it writes change words. */
(function () {
  var box = document.querySelector('.wa-filter'); if (!box) return;
  var root = document.documentElement, hdr = document.querySelector('.hdr'), list = document.getElementById('automate');
  var items = [].slice.call(document.querySelectorAll('.wa-items > li'));
  var stages = [].slice.call(document.querySelectorAll('.wa-stage'));
  var blocks = [].slice.call(document.querySelectorAll('.wa-blk')).filter(function (b) { return b.querySelector('.wa-stage'); });
  var pics = [].slice.call(document.querySelectorAll('[data-pic-for]'));
  var count = document.getElementById('wa-count'), top = document.getElementById('wa-top'), now = document.getElementById('wa-now');
  var phone = window.matchMedia('(max-width:899px) and (min-height:501px)'), cur = 'all', es = root.lang === 'es';
  var hdrBottom = function () { return hdr ? hdr.getBoundingClientRect().bottom : 0; };
  var barTop = function () { var b = document.querySelector('.callbar'); return b && b.getClientRects().length ? b.getBoundingClientRect().top : innerHeight; };

  function readFirst(key, who) {
    var picks = key === 'all' ? [] : items.filter(function (li) { return (li.getAttribute('data-top') || '').split(' ').indexOf(key) >= 0; });
    var ol = top.querySelector('ol'); ol.textContent = '';
    picks.forEach(function (li) {   // the row's bold lead as the link, its stage beside it; built from the page, so it cannot drift
      var t = li.querySelector('b').textContent, a = document.createElement('a'), s = document.createElement('span'), x = document.createElement('li');
      a.href = '#' + li.id; a.textContent = t.charAt(0).toUpperCase() + t.slice(1) + ' ';
      s.textContent = li.closest('.wa-stage').querySelector('.wa-nm').textContent;
      a.appendChild(s); x.appendChild(a); ol.appendChild(x);
    });
    top.querySelector('.wa-top-k').textContent = es ? 'Para ' + who + ', lea primero estos:' : 'For ' + who + ', read these first:';
    top.hidden = !picks.length;
  }

  // the filter rule (DESIGN 6.4): a picture shows only where its stage's rows are at least as tall as the picture and the name over it
  function fit() {
    stages.forEach(function (s) {
      var p = s.querySelector('.wj'); if (!p) return;
      p.hidden = false; s.classList.remove('wa-bare');
      if (s.hidden) return;
      var rows = s.querySelector('.wa-items').offsetHeight, name = s.querySelector('.wa-sh'), gap = parseFloat(getComputedStyle(p).marginTop) || 0;
      var out = !p.offsetHeight || rows < name.offsetHeight + gap + p.offsetHeight;
      p.hidden = out; s.classList.toggle('wa-bare', out);
    });
  }

  // the phone line: shown once the first stage has gone under the header, while the list is still in view
  function stick() {
    var on = false;
    if (cur !== 'all' && phone.matches) {
      var hb = hdrBottom(), first = stages.filter(function (s) { return !s.hidden; })[0];
      on = !!first && first.getBoundingClientRect().top < hb && list.getBoundingClientRect().bottom > hb + 120;
    }
    if (now.hidden === on) now.hidden = !on;
  }

  function show(key, picked) {
    var all = key === 'all', n = 0, radio = box.querySelector('input[value="' + key + '"]');
    if (!radio) return;
    cur = key;
    items.forEach(function (li) { var on = all || li.getAttribute('data-t').split(' ').indexOf(key) >= 0; li.hidden = !on; if (on) n++; });
    stages.forEach(function (s) {
      var c = s.querySelectorAll('.wa-items > li:not([hidden])').length, a = document.querySelector('.wa-index a[href="#' + s.id + '"]');
      s.hidden = !c;
      if (a) { a.parentNode.hidden = !c; a.querySelector('.wa-ni').textContent = c; }
    });
    blocks.forEach(function (b) { b.hidden = !b.querySelector('.wa-stage:not([hidden])'); });
    var up = stages.filter(function (s) { return !s.hidden; });
    up.forEach(function (s, i) { s.querySelector('.wa-of').textContent = (i + 1) + (es ? '\u00a0de\u00a0' : '\u00a0of\u00a0') + up.length; });
    root.classList.toggle('wa-one', !all);
    fit();
    var who = radio.getAttribute('data-who');
    count.textContent = es ? (all ? 'Los ' + items.length + ' de la lista, en ' + stages.length + ' etapas del trabajo.' : n + ' de los ' + items.length + ' son para ' + who + '.')
      : all ? 'All ' + items.length + ' on the list, in ' + stages.length + ' stages of the job.' : n + ' of the ' + items.length + ' are for ' + who + '.';
    document.getElementById('wa-now-t').textContent = all ? '' : radio.nextElementSibling.textContent + ', ' + n + (es ? ' de ' : ' of ') + items.length + '.';
    readFirst(key, who);
    var own = pics.some(function (p) { return p.getAttribute('data-pic-for') === key; });
    pics.forEach(function (p) { p.hidden = p.getAttribute('data-pic-for') !== (own ? key : 'default'); });
    stick();
    if (picked) {
      try { history.replaceState(null, '', '?trade=' + key + location.hash); } catch (e) {}
      if (!all && window.Lumora && Lumora.setTrade) Lumora.setTrade(key);
      var r = count.getBoundingClientRect();   // in view above the chip just tapped; brought in if a scroll left it under a bar
      if (r.top < hdrBottom() || r.bottom > barTop()) count.scrollIntoView({ block: 'nearest', behavior: 'instant' });
    }
  }

  box.addEventListener('change', function (e) { if (e.target.name === 'wa-trade') show(e.target.value, true); });
  now.querySelector('a').addEventListener('click', function (e) {   // "Change": back to the chips, the picked one focused
    e.preventDefault();
    var r = box.querySelector('input:checked'); if (r) r.focus({ preventScroll: true });
    box.scrollIntoView({ block: 'start', behavior: 'instant' });
  });
  var ticking = false;
  addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(function () { ticking = false; stick(); }); } }, { passive: true });
  addEventListener('resize', function () { fit(); stick(); });
  fit();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  // focus never lands under the phone line (system.js keeps it out from under the header and the call bar)
  document.addEventListener('focusin', function (e) {
    if (now.hidden || now.contains(e.target) || !e.target.getBoundingClientRect) return;
    var r = e.target.getBoundingClientRect();
    if (r.top < now.getBoundingClientRect().bottom && r.bottom > 0) e.target.scrollIntoView({ block: 'nearest', behavior: 'instant' });
  });

  // where to start: the address (?trade=); else the trade the visitor picked on Home or a trade page (Lumora.picked: never Home's
  // plumbing default); else whatever the browser restored on Back
  var q = new URLSearchParams(location.search).get('trade'), start = q && box.querySelector('input[value="' + q + '"]');
  if (!q && window.Lumora && Lumora.picked && Lumora.trade) start = box.querySelector('input[value="' + Lumora.trade + '"]');
  if (start) start.checked = true;
  var c = box.querySelector('input:checked');
  if (c && c.value !== 'all') show(c.value, false);

  // job: show our work. The bill's four lines land in the Excel sheet one after another, once, when the whole picture is in view between
  // the header and the call bar (on a phone, where the picture is taller than the screen, when the sheet is); then "Not yet" takes its
  // tint. A sheet already on screen or passed at load, reduced motion and ?still show it landed; so does a visitor who scrolls by it
  var doc = document.getElementById('papers');
  if (doc && !(window.Lumora && Lumora.still) && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var pic = function () { return pics.filter(function (p) { return !p.hidden; })[0]; };
    var box2 = function (e) { return e.getBoundingClientRect(); };
    var done = function () { removeEventListener('scroll', land); doc.classList.remove('wa-wait', 'wa-land'); };
    var land = function () {
      var p = pic(), top = hdrBottom(), bot = barTop(), b = box2(p);
      if (b.bottom < top) return done();
      if (b.height > bot - top) b = box2(p.querySelector('.wa-panels'));
      if (b.top >= top && b.bottom <= bot) { removeEventListener('scroll', land); doc.classList.add('wa-land'); setTimeout(done, 1900); }
    };
    if (pic() && box2(pic()).top > innerHeight) { doc.classList.add('wa-wait'); addEventListener('scroll', land, { passive: true }); }
    doc.addEventListener('click', function (e) { if (e.target.closest('[role=tab]')) done(); });
  }
})();
