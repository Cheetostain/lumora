/* Lumora prototypes, group trades-3. Page behaviour, loaded after system.js (defer). Plain JS, no library.
   1. Trade pages: <template id="before-N" data-label="..."> swaps stop N's "as we find it" layer for the trade's own
      object (the restaurant's posted schedule, the property manager's wall calendar) where the system would draw a
      generic ink ghost. Same convention as pages/trades-1, so every trade page works one way. build.py prerenders it.
   2. Leak check: the full calculator from content-en.md section 4. Nothing leaves the browser: no fetch, no storage,
      no form action; Enter never submits. Only the owner's own input moves the figure. */
(function () {
  'use strict';
  var L = window.Lumora || {}, still = !!L.still;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ================================================================ 1. the trade's own "before" objects */
  function apply() {
    $$('.stop').forEach(function (s, i) {
      var tb = document.getElementById('before-' + (i + 1)); if (!tb) return;
      var g = s.querySelector('[data-g2r]'), bf = g && g.querySelector('.before');
      if (!bf || bf.hasAttribute('data-own')) return;
      bf.innerHTML = tb.innerHTML; bf.setAttribute('data-own', '');
      g.setAttribute('data-label-before', tb.getAttribute('data-label'));
      if (g.getAttribute('data-state') === 'before') g.setAttribute('aria-label', tb.getAttribute('data-label'));
    });
  }
  apply();
  document.addEventListener('lumora:trade', apply);

  /* ================================================================ 2. the leak check */
  var form = document.getElementById('lk'); if (!form) return;
  var F = ['calls', 'rang', 'back', 'book', 'profit', 'quotes', 'qprofit', 'minutes', 'days', 'rate'];
  var REQ = ['calls', 'rang', 'back', 'book', 'profit'];
  var EX = { calls: '40', rang: '6', back: '3', book: '40%', profit: '$150', quotes: '2', qprofit: '$400', minutes: '30', days: '22', rate: '$25' };
  var inp = function (n) { return form.querySelector('[name="' + n + '"]'); };
  var o = function (k) { return $('[data-o="' + k + '"]'); };
  var num = function (v) { v = String(v).replace(/[$,%\s]/g, ''); return v === '' ? NaN : +v; };
  var usd = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };
  var one = function (n) { return (Math.round(n * 10) / 10).toFixed(1); };
  var plain = function (n) { return String(+n.toFixed(2)); };
  var SMS = 'sms:+13522260681?&body=';
  var shown = null, liveT = 0, firstRun = true;

  function line(key, label, text, value, off) {
    var li = o(key); if (!li) return;
    li.innerHTML = '<span' + (off ? ' class="off"' : '') + '><b>' + label + '</b>' + text + '</span>' + (value ? '<span class="v">' + value + '</span>' : '');
  }
  function roll(el, from, to) {        // job: cause and effect. The figure moves only because the owner changed a box.
    var fmt = function (n) { return '$' + (Math.round(n / 10) * 10).toLocaleString('en-US'); };
    var txt = el.firstChild && el.firstChild.nodeType === 3 ? el.firstChild : el.insertBefore(document.createTextNode(''), el.firstChild);
    if (still || from == null || from === to) { txt.nodeValue = fmt(to); return; }
    var t0 = performance.now();
    (function step(now) { var k = Math.min(1, (now - t0) / 500), e = 1 - Math.pow(1 - k, 3);
      txt.nodeValue = fmt(from + (to - from) * e); if (k < 1) requestAnimationFrame(step); else if (L.ring) L.ring(el.querySelector('.pen-ring')); })(t0);
  }

  function calc() {
    var v = {}; F.forEach(function (n) { v[n] = num(inp(n).value); });
    var err = '';
    F.forEach(function (n) { if (!err && (inp(n).value.trim() !== '' && (isNaN(v[n]) || v[n] < 0))) err = 'Use a number of 0 or more.'; });
    if (!err && !isNaN(v.calls) && !isNaN(v.rang) && v.rang > v.calls) err = 'Calls that ring out cannot be more than calls a week.';
    if (!err && !isNaN(v.rang) && !isNaN(v.back) && v.back > v.rang) err = 'Calls you call back cannot be more than the calls that rang out.';
    if (!err && !isNaN(v.book) && v.book > 100) err = 'Use a share from 0 to 100.';
    o('err').textContent = err;
    var missing = REQ.some(function (n) { return isNaN(v[n]); });
    var ok = !err && !missing;
    o('result').hidden = !ok; o('empty').hidden = ok;
    if (!ok) {
      o('bar').textContent = 'Fill in the missed-call boxes';
      o('sms').href = SMS + encodeURIComponent('Hi, I saw your website. When is a good time for the free call?');
      return null;
    }
    // math, word for word from the spec (content-en.md section 4); round only for display
    var notBack = v.rang - v.back, month = notBack * 52 / 12, jobs = month * v.book / 100, callsUSD = jobs * v.profit;
    var hasQ = !isNaN(v.quotes) && !isNaN(v.qprofit), quotesUSD = hasQ ? v.quotes * v.qprofit : 0;
    var hasH = !isNaN(v.minutes) && !isNaN(v.days), hours = hasH ? v.minutes * v.days / 60 : 0;
    var hasR = hasH && !isNaN(v.rate), retypeUSD = hasR ? hours * v.rate : 0;
    var total = callsUSD + quotesUSD + retypeUSD, round10 = Math.round(total / 10) * 10;

    line('l-calls', 'Missed calls', notBack + ' a week nobody returned × 52 ÷ 12 = ' + one(month) + ' a month. × ' + plain(v.book) + '% that would have booked = ' + one(jobs) + ' jobs. × ' + usd(v.profit) + ' profit a job = ' + usd(callsUSD) + ' a month.', usd(callsUSD));
    if (hasQ) line('l-quotes', 'Quotes', plain(v.quotes) + ' a month that went cold × ' + usd(v.qprofit) + ' profit a job = ' + usd(quotesUSD) + ' a month.', usd(quotesUSD));
    else line('l-quotes', 'Quotes', 'Left out: this line is not filled in.', '', true);
    if (hasR) line('l-retype', 'Retyping', plain(v.minutes) + ' minutes a day × ' + plain(v.days) + ' days ÷ 60 = ' + one(hours) + ' hours × ' + usd(v.rate) + ' an hour = ' + usd(retypeUSD) + ' a month.', usd(retypeUSD));
    else if (hasH) line('l-retype', 'Retyping', plain(v.minutes) + ' minutes a day × ' + plain(v.days) + ' days ÷ 60 = ' + one(hours) + ' hours a month. No hourly cost, so hours, not dollars: left out of the total.', '', true);
    else line('l-retype', 'Retyping', 'Left out: this line is not filled in.', '', true);

    // one dot per call nobody returned in a month; filled = would have booked (the page's one abstract format)
    var dots = o('dots'), n = Math.min(Math.round(month), 60), full = Math.floor(jobs), part = jobs - full, h = '';
    for (var i = 0; i < n; i++) { var c = i < full ? 'dot job' : (i === full && part > 0.05 ? 'dot part' : 'dot'); h += '<span class="' + c + '"' + (c === 'dot part' ? ' style="--p:' + Math.round(part * 100) + '%"' : '') + '></span>'; }
    dots.innerHTML = h; dots.setAttribute('aria-label', one(month) + ' calls a month nobody returned; about ' + one(jobs) + ' of them would have booked a job.');

    var words = 'About ' + usd(round10) + ' a month';
    roll(o('total'), firstRun ? null : shown, round10); shown = round10; firstRun = false;
    o('bar').textContent = words;
    o('sms').href = SMS + encodeURIComponent('Hi, I ran the leak check on your site: about ' + usd(round10) + ' a month. When is a good time for the free call?');
    return words;
  }

  function announce(words) {           // one polite announcement once the owner stops typing, not one per keystroke
    clearTimeout(liveT);
    liveT = setTimeout(function () { o('live').textContent = words ? 'Your estimate: ' + words + '.' :o('err').textContent || 'Put a number in each missed-call box to see your estimate.'; }, 700);
  }
  function edited(n) {
    var tag = $('[data-ex="' + n + '"]'); if (tag) tag.hidden = true;
    o('stamp').hidden = true;
  }
  var deb = 0;
  F.forEach(function (n) {
    var el = inp(n);
    el.addEventListener('input', function () { edited(n); clearTimeout(deb); deb = setTimeout(function () { announce(calc()); }, 250); });
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter') e.preventDefault(); });
  });
  $$('[data-step]', form).forEach(function (b) {
    b.addEventListener('click', function () {
      var el = inp(b.dataset.for), v = num(el.value);
      el.value = Math.max(0, (isNaN(v) ? 0 : v) + +b.dataset.step); edited(b.dataset.for); announce(calc());
    });
  });
  form.addEventListener('submit', function (e) { e.preventDefault(); });
  $('[data-act="reset"]', form).addEventListener('click', function () {
    F.forEach(function (n) { inp(n).value = EX[n]; var t = $('[data-ex="' + n + '"]'); if (t) t.hidden = false; });
    o('stamp').hidden = false; announce(calc());
  });
  $('[data-act="clear"]', form).addEventListener('click', function () {
    F.forEach(function (n) { inp(n).value = ''; var t = $('[data-ex="' + n + '"]'); if (t) t.hidden = true; });
    o('stamp').hidden = true; announce(calc()); inp('calls').focus();
  });
  calc();

  // the phone estimate bar is sticky; focus must never sit under it (WCAG 2.4.11). system.js clears the header only.
  var bar = $('.lk-bar');
  document.addEventListener('focusin', function (e) {
    if (!bar || !bar.offsetParent || !form.contains(e.target) || e.target === bar) return;
    var r = e.target.getBoundingClientRect(), b = bar.getBoundingClientRect();
    if (r.top < b.bottom + 4 && r.bottom > b.top) window.scrollBy({ top: r.top - b.bottom - 16, behavior: 'instant' });
  });
})();
