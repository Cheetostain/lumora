/* Trades group 2: the "as we find it" side of each walk stop, drawn as the trade's own paper and screens.
   system.js renders the walk from trades.js with ink-drawing ghosts for every trade but plumbing; this file swaps
   each stop's "before" for the real object an owner in that trade would recognise (the equipment log, the claim
   folder, the renewal card file, the insurer's statement, the crew board...). The "after" (the fix) stays as the
   system renders it, so the numbers still come from trades.js. Load after system.js, with defer.
   No motion here: the cross-fade, the switch and the reduced-motion rules all stay the system's. */
(function () {
  'use strict';
  var L = window.Lumora; if (!L) return;
  var key = document.body.dataset.trade;

  var BEFORE = {
    water: [
      { // Stop 1 · The equipment log
        alt: 'Sample, as we find it: the equipment log on a clipboard for job 26-0412, Maria Garcia, claim 900127. Dehumidifier DH-01 and air movers AM-03 and AM-04 were set October 5 and pulled October 11: 6 days each. The 6 is circled in pencil.',
        html: '<div class="doc-clip t2o"><span class="clamp" aria-hidden="true"><i></i></span><div class="t2-form">' +
          '<div class="f-h"><b>EQUIPMENT LOG</b><span>Job <span class="hw">26-0412</span></span></div>' +
          '<p class="f-m">Customer <span class="hw">Garcia, Maria</span><br>Claim <span class="hw">900127</span> · Kitchen, Cat 1</p>' +
          '<table><tr><th>Unit</th><th>Set</th><th>Pulled</th><th class="ck">Days</th></tr>' +
          '<tr><td>DH-01</td><td class="hw">10/5</td><td class="hw">10/11</td><td class="ck"><span class="hw pc">6</span></td></tr>' +
          '<tr><td>AM-03</td><td class="hw">10/5</td><td class="hw">10/11</td><td class="ck hw">6</td></tr>' +
          '<tr><td>AM-04</td><td class="hw">10/5</td><td class="hw">10/11</td><td class="ck hw">6</td></tr>' +
          '<tr><td></td><td></td><td></td><td></td></tr><tr><td></td><td></td><td></td><td></td></tr></table></div></div>'
      },
      { // Stop 2 · The claim file
        alt: 'Sample, as we find it: the manila claim folder for job 26-0412, Maria Garcia, claim 900127. The carrier\'s check, $211.00, is written in, and the deductible, $1,000.00. The line "Deductible billed" is blank and circled in pencil. A sticky note asks: billed? ask Linda.',
        html: '<div class="t2-folder t2o"><div class="fo-paper" aria-hidden="true"><p>Work authorization, signed 10/5</p><p>Estimate SMW-26-0412</p><p>Photos, 38</p></div>' +
          '<div class="fo-front"><span class="fo-tab"><b>26-0412-WTR · GARCIA, M.</b></span><dl>' +
          '<div><dt>Claim</dt><dd class="hw">900127</dd></div>' +
          '<div><dt>Carrier check</dt><dd class="hw">$211.00 rec\'d 10/30</dd></div>' +
          '<div><dt>Deductible</dt><dd class="hw">$1,000.00</dd></div>' +
          '<div><dt>Deductible billed</dt><dd><span class="pc">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></dd></div></dl></div>' +
          '<p class="t2-sticky"><span class="hw mk">Ded. billed??<br>ask Linda</span></p></div>'
      },
      { // Stop 3 · The office computer
        alt: 'Sample, as we find it: the insurer\'s 6-page PDF open on the office computer, page 1: claim 900140 for Lisa Brown, 125 Oak St, water from a kitchen supply line on October 5, desk adjuster Davis, (352) 555-0177, deductible $1,000.00. The claim number is circled in pencil.',
        html: '<div class="scr-win t2-pdf t2o"><div class="win-tb"><i></i><i></i><i></i><span>Claim 900140 notice.pdf · Page 1 of 6</span></div><div class="win-b"><div class="pdf-pg">' +
          '<div class="pdf-h"><b>NOTICE OF CLAIM</b><span>Oct 7, 2026</span></div><dl class="pdf-dl">' +
          '<div><dt>Insured</dt><dd>Brown, Lisa</dd></div><div><dt>Loss address</dt><dd>125 Oak St</dd></div>' +
          '<div><dt>Claim number</dt><dd><span class="pc">900140</span></dd></div><div><dt>Date of loss</dt><dd>Oct 5, 2026</dd></div>' +
          '<div><dt>Type of loss</dt><dd>Water, supply line, kitchen</dd></div><div><dt>Desk adjuster</dt><dd>Davis, (352) 555-0177</dd></div>' +
          '<div><dt>Deductible</dt><dd>$1,000.00</dd></div></dl><div class="pdf-lines" aria-hidden="true"><i></i><i></i><i></i></div></div></div></div>'
      }
    ],
    pest: [
      { // Stop 1 · The clipboard -> the renewal card file
        note: 'Notice printed Oct 1. Smith never paid, and nobody called.',
        alt: 'Sample, as we find it: the termite renewal card file, at the November tab. John Smith\'s card, account 7710, 123 Main St, bait, 22 stations, renews November 3 at $271.00, notice printed October 1. The Paid and Called lines are blank, and Called is circled in pencil.',
        html: '<div class="t2-cards t2o"><div class="cd back" aria-hidden="true"><div class="cd-h"><b>WILSON, DAVID</b><span>Acct 7702</span></div></div>' +
          '<div class="cd back b2" aria-hidden="true"><div class="cd-h"><b>TAYLOR, ANN</b><span>Acct 7706</span></div></div>' +
          '<div class="cd front"><span class="cd-tab" aria-hidden="true">NOV</span><div class="cd-h"><b>SMITH, JOHN</b><span>Acct 7710</span></div>' +
          '<p class="hw">123 Main St · bait, 22 stations</p><p class="hw"><small>Renews</small>Nov 3 · $271.00</p><p class="hw"><small>Notice</small>printed 10/1</p>' +
          '<p><small>Paid</small></p><p><small>Called</small><span class="pc">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</span></p></div></div>'
      },
      { // Stop 2 · The payment report
        alt: 'Sample, as we find it: a printed report of declined autopay charges for October 10: Ana Martinez $118.00, card expired; Lisa Brown $118.00, insufficient funds; Tom Anderson $89.00, do not honor. The Retry column is empty, and its heading is circled in pencil.',
        html: '<div class="t2-gb t2o"><p class="gb-h"><span>BLUESTEM PEST CONTROL</span><span>PAGE 1</span></p><p class="gb-s"><span>DECLINED AUTOPAY</span><span>10/10/26</span></p>' +
          '<table><thead><tr><th>CUSTOMER</th><th class="r">AMT</th><th>REASON</th><th class="rt"><span class="pc">RETRY</span></th></tr></thead><tbody>' +
          '<tr><td>MARTINEZ, ANA</td><td class="r">118.00</td><td>CARD EXPIRED</td><td></td></tr>' +
          '<tr><td>BROWN, LISA</td><td class="r">118.00</td><td>NSF</td><td></td></tr>' +
          '<tr><td>ANDERSON, TOM</td><td class="r">89.00</td><td>DO NOT HONOR</td><td></td></tr></tbody></table>' +
          '<p class="gb-f">DECLINED THIS MONTH: 24</p></div>'
      },
      { // Stop 3 · The paper tickets -> route B's route sheet
        alt: 'Sample, as we find it: route B\'s paper route sheet for Tuesday, October 13, truck 3. Seven stops are checked off by hand, among them account 7731, Tom Davis, quarterly, and 7732, Ann Miller, termite inspection. A sticky note says: type in tonight.',
        html: '<div class="doc-clip t2o" style="position:relative"><span class="clamp" aria-hidden="true"><i></i></span><div class="t2-form">' +
          '<div class="f-h"><b>ROUTE B</b><span>Tue 10/13 · Truck 3</span></div>' +
          '<table><tr><th>Acct</th><th>Service</th><th class="ck">Done</th></tr>' +
          '<tr><td>7726</td><td>Quarterly, ext</td><td class="ck hw">✓</td></tr>' +
          '<tr><td>7728</td><td>Quarterly, ext + int</td><td class="ck hw">✓</td></tr>' +
          '<tr><td>7729</td><td>Initial</td><td class="ck hw">✓</td></tr>' +
          '<tr><td>7730</td><td>Re-service, ants</td><td class="ck hw">✓</td></tr>' +
          '<tr><td>7731</td><td>Quarterly, ext</td><td class="ck hw">✓</td></tr>' +
          '<tr><td>7732</td><td>Termite inspection</td><td class="ck hw">✓</td></tr>' +
          '<tr><td>7734</td><td>Quarterly, ext</td><td class="ck hw">✓</td></tr></table></div>' +
          '<p class="t2-sticky" style="right:-8px;bottom:-14px;width:46%"><span class="hw mk">type in tonight</span></p></div>'
      }
    ],
    roofing: [
      { // Stop 1 · The insurer letter
        alt: 'Sample, as we find it: the insurer\'s statement of loss for claim 900131, Ann Miller, wind, September 27, 2026. Replacement cost $17,242.74, less recoverable depreciation $5,140.00, less the 2% hurricane deductible $6,200.00, payment enclosed $5,902.74. The sentence saying depreciation is paid when repairs are complete and proof is received is circled in pencil.',
        html: '<div class="t2-letter t2o"><div class="lt-top"><b>STATEMENT OF LOSS</b><span>Claims department</span></div>' +
          '<dl class="lt-meta"><dt>Insured</dt><dd>Ann Miller</dd><dt>Claim</dt><dd>900131</dd><dt>Loss</dt><dd>Wind, Sep 27, 2026</dd></dl>' +
          '<table><tr><td>Replacement cost value</td><td class="r">$17,242.74</td></tr><tr><td>Less recoverable depreciation</td><td class="r">($5,140.00)</td></tr>' +
          '<tr><td>Less deductible, 2% hurricane</td><td class="r">($6,200.00)</td></tr><tr class="tot"><td>Payment enclosed</td><td class="r">$5,902.74</td></tr></table>' +
          '<p class="lt-fine">Recoverable depreciation <span class="pc">is paid when repairs are complete and proof is received</span>, within the time your policy allows.</p></div>'
      },
      { // Stop 2 · The crew's notes -> the crew board in the shop
        alt: 'Sample, as we find it: the crew board for the week of October 5. Monday, Davis tear-off at 125 Main St, with "12 sh. decking" written beside it and circled in pencil. Tuesday, Davis dry-in. Wednesday, Brown tear-off. Thursday, Garcia inspection. Friday, Davis shingles.',
        html: '<div class="wb t2o"><div class="wb-in"><p class="wb-t">CREW BOARD · WEEK OF 10/5</p><div class="wb-days">' +
          '<div class="wb-day"><b>MON</b><p>Davis<small>tear-off, 125 Main</small></p><p class="pc">12 sh. decking</p></div>' +
          '<div class="wb-day wide-only"><b>TUE</b><p>Davis<small>dry-in</small></p></div>' +
          '<div class="wb-day wide-only"><b>WED</b><p>Brown<small>tear-off</small></p></div>' +
          '<div class="wb-day"><b>THU</b><p>Garcia<small>inspection</small></p></div>' +
          '<div class="wb-day"><b>FRI</b><p>Davis<small>shingles</small></p></div></div></div><div class="wb-tray"></div></div>'
      },
      { // Stop 3 · The office computer -> the measurement report
        alt: 'Sample, as we find it: a roof measurement report for Ann Taylor, a hip roof drawn from above: 2,850 square feet, 28.5 squares, 6/12 pitch, 186 feet of eaves, 96 feet of hips, 38 feet of ridge, 12% waste. "28.5 squares" is circled in pencil.',
        html: '<div class="t2-meas t2o"><div class="ms-h"><b>ROOF MEASUREMENTS</b><span>Taylor, Ann · Oct 6</span></div><div class="ms-g">' +
          '<svg viewBox="0 0 240 150" aria-hidden="true"><path class="ms-roof" d="M12 18H228V132H12Z"/><path class="ms-line" d="M12 18L76 75H164L228 18M12 132L76 75M164 75L228 132"/><path class="ms-dim" d="M12 144H228M232 18V132"/></svg>' +
          '<dl class="ms-dl"><div><dt>Total area</dt><dd>2,850 sq ft</dd></div><div><dt>Squares</dt><dd><span class="pc">28.5</span></dd></div>' +
          '<div><dt>Pitch</dt><dd>6/12</dd></div><div><dt>Eaves</dt><dd>186 ft</dd></div><div><dt>Hips</dt><dd>96 ft</dd></div><div><dt>Ridge</dt><dd>38 ft</dd></div><div><dt>Waste</dt><dd>12%</dd></div></dl></div></div>'
      }
    ]
  };

  var B = BEFORE[key];
  if (!B) return;
  function patch() {
    Array.prototype.forEach.call(document.querySelectorAll('[data-bind=walk] .stop'), function (s, i) {
      var b = B[i], g = s.querySelector('[data-g2r]'); if (!b || !g) return;
      var before = g.querySelector('.before'); if (!before || before.dataset.t2) return;
      before.innerHTML = b.html; before.dataset.t2 = '1';
      g.setAttribute('data-label-before', b.alt);
      if (g.dataset.state === 'before') g.setAttribute('aria-label', b.alt);
      if (b.note) { var n = s.querySelector('.stop-notes .pencil'); if (n) n.textContent = b.note; }
    });
  }
  patch();
  L.on(patch);   // a trade page is locked, but if a binder ever re-renders the walk, the real objects come back
})();
