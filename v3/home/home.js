/* Home only. The walk heading names the three stops of the trade the owner picked, so the promise above the walk
   matches the pictures in it ("the move-out list, the work order and the office computer" for a property manager). */
(function () {
  var FOLLOW = { // what one walk follows from start to money; trade shops default to the job
    food: 'Then we follow one night of sales to the bank deposit.',
    rentals: 'Then we follow one unit from move-out to the deposit claim.'
  };
  function heading(key, t) {
    var h = document.querySelector('.hm-walk-h'); if (!h || !t || !t.rows) return;
    var p = t.rows.map(function (r) { return r.place.charAt(0).toLowerCase() + r.place.slice(1); });
    var list = p.length > 1 ? p.slice(0, -1).join(', ') + ' and ' + p[p.length - 1] : p[0];
    h.firstChild.nodeValue = 'We look at ' + list + '. ';
    h.querySelector('span').textContent = FOLLOW[key] || 'Then we follow one job to the paid invoice.';
  }
  // job: cause and effect. On a phone the strip sits above the trade menu, so it rises once when a pick rewrites it
  function cue(key, t, animate) {
    var s = document.querySelector('.hero-strip'); if (!s || !animate || Lumora.still) return;
    s.classList.remove('swapping'); void s.offsetWidth; s.classList.add('swapping');
  }
  // job: show our work. Back at the desk the sum prints like an adding-machine tape, line by line, once, when it is
  // half in view. The still page (no JS, reduced motion) shows the whole tape.
  function tape() {
    var eq = document.querySelector('.bigfig .eq');
    if (!eq || Lumora.still || !('IntersectionObserver' in window) || eq.getBoundingClientRect().top < innerHeight) return;
    eq.classList.add('tape-wait');
    var io = new IntersectionObserver(function (es) { if (!es[0].isIntersecting) return; io.disconnect(); eq.classList.replace('tape-wait', 'tape'); }, { threshold: 0.5 });
    io.observe(eq);
  }
  function start() {
    if (!window.Lumora) return;
    Lumora.on(heading); Lumora.on(cue);
    if (Lumora.trade) heading(Lumora.trade, Lumora.trades[Lumora.trade]);
    tape();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
