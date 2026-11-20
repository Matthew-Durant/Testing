/* =============================================================================
   MMB CANCELLATION, RELEASE VALIDATION ROUND - scenario data and logic on
   window.MMB

   Composes with lofi.js: the visual system, screen-heading focus and state
   store come from window.LOFI. Load this AFTER lofi.js.

   - Four participant scenarios (A to D), selected by data-flow on <html>.
   - Dynamic date model. Today is the participant's real date; departure is
     today + days-to-departure. Nothing date-derived is hardcoded, so the
     stimulus cannot go stale between the draft and the session.
   - The cancellation schedule, expressed once, as days-to-departure bands.
   - Integer-pence money maths. One formula feeds every figure on screen.
   - One routing rule. If today's cost is greater than the amount paid, the
     customer owes money, no online payment path exists, and the screen
     switches to the call-us route.

   Two URL overrides, both stored for the tab session only:
     ?dtd=N             move a scenario along the schedule
     ?today=YYYY-MM-DD  pin the session date, for checking against the draft
   ============================================================================= */
(function () {
  'use strict';

  var COMMON = {
    reference: '29140653',
    hotel: 'Flamingo Beach Hotel',
    hotelLocation: 'Playa Blanca, Lanzarote, Canary Islands, Spain',
    nights: 7,
    contactPhone: '0203 451 2688',
    card: 'VISA ending 1083'
  };

  /* Money is integer pence throughout and formatted only at render. */
  var SCENARIOS = {
    /* A. Part-paid, partial refund. 50% band. */
    a: { id: 'a', name: 'Part-paid, partial refund', defaultDtd: 55,
         totalPricePence: 1043900, paidToDatePence: 700000,
         depositPence: 40000, lowDeposit: false },
    /* B. Deposit only, owes money outside a Low Deposit Offer. 30% band. */
    b: { id: 'b', name: 'Deposit only, owes money', defaultDtd: 66,
         totalPricePence: 1043900, paidToDatePence: 40000,
         depositPence: 40000, lowDeposit: false },
    /* C. Low deposit, owes money. Loss-of-deposit band. The invoice deposit
       is 400.00 but only 300.00 has been paid. */
    c: { id: 'c', name: 'Low deposit, owes money', defaultDtd: 82,
         totalPricePence: 400000, paidToDatePence: 30000,
         depositPence: 40000, lowDeposit: true },
    /* D. Paid in full, refund. Loss-of-deposit band. */
    d: { id: 'd', name: 'Paid in full, refund', defaultDtd: 82,
         totalPricePence: 1043900, paidToDatePence: 1043900,
         depositPence: 40000, lowDeposit: false }
  };

  function resolveFlow() {
    var el = document.documentElement;
    var attr = el && el.getAttribute('data-flow');
    if (attr && SCENARIOS[attr]) return attr;
    var path = '';
    try { path = String(window.location.pathname); } catch (e) {}
    var m = path.match(/scenario-([a-d])\b/);
    return m ? m[1] : 'a';
  }

  var FLOW = resolveFlow();
  var SCENARIO = {};
  Object.keys(COMMON).forEach(function (k) { SCENARIO[k] = COMMON[k]; });
  Object.keys(SCENARIOS[FLOW]).forEach(function (k) {
    SCENARIO[k] = SCENARIOS[FLOW][k];
  });

  /* --- Cancellation schedule ----------------------------------------------
     Days-to-departure bands, read off the validation-round draft and checked
     against all four of its bookings at a session date of Mon 12 Oct 2026.
     Every range, percentage and amount on every screen derives from here.
     ------------------------------------------------------------------------ */
  var BANDS = [
    { pct: null, label: 'Loss of deposit', minDtd: 70, maxDtd: 3650 },
    { pct: 30,   label: '30% of total',    minDtd: 63, maxDtd: 69   },
    { pct: 50,   label: '50% of total',    minDtd: 49, maxDtd: 62   },
    { pct: 70,   label: '70% of total',    minDtd: 29, maxDtd: 48   },
    { pct: 90,   label: '90% of total',    minDtd: 15, maxDtd: 28   },
    { pct: 100,  label: '100% of total',   minDtd:  0, maxDtd: 14   }
  ];

  var DAYS        = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var MONTHS      = ['Jan','Feb','Mar','Apr','May','Jun',
                     'Jul','Aug','Sept','Oct','Nov','Dec'];
  var MONTHS_LONG = ['January','February','March','April','May','June','July',
                     'August','September','October','November','December'];

  function param(name) {
    try {
      var m = window.location.search.match(
        new RegExp('[?&]' + name + '=([^&]*)'));
      return m ? decodeURIComponent(m[1]) : null;
    } catch (e) { return null; }
  }

  var MMB = {

    flow: FLOW,
    scenario: SCENARIO,
    scenarios: SCENARIOS,
    bands: BANDS,

    /* Every event carries the scenario, so a log reads without context. */
    track: function (n, d) {
      var data = {};
      Object.keys(d || {}).forEach(function (k) { data[k] = d[k]; });
      data.scenario = FLOW;
      return window.LOFI.track(n, data);
    },

    /* ---- dates ---------------------------------------------------------- */
    dates: {

      /* Days to departure: URL override, then stored, then the scenario
         default. Stored per scenario so moving A does not move B. */
      dtd: function () {
        var key = 'dtd_' + FLOW;
        var raw = param('dtd');
        if (raw !== null) {
          var n = parseInt(raw, 10);
          if (!isNaN(n) && n >= 0 && n < 1000) {
            var patch = {}; patch[key] = n;
            window.LOFI.save(patch);
            return n;
          }
        }
        var stored = window.LOFI.get(key, null);
        if (typeof stored === 'number' && stored >= 0) return stored;
        return SCENARIO.defaultDtd;
      },

      /* The session date. Real today unless pinned with ?today=YYYY-MM-DD. */
      today: function () {
        var raw = param('today');
        if (raw && /^\d{4}-\d{2}-\d{2}$/.test(raw)) {
          window.LOFI.save({ today: raw });
        }
        var pinned = window.LOFI.get('today', null);
        if (typeof pinned === 'string') {
          var p = pinned.split('-');
          var d = new Date(+p[0], +p[1] - 1, +p[2]);
          if (!isNaN(d.getTime())) return d;
        }
        var n = new Date();
        return new Date(n.getFullYear(), n.getMonth(), n.getDate());
      },

      addDays: function (d, n) {
        return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
      },
      departure: function () { return this.addDays(this.today(), this.dtd()); },
      returnDate: function () {
        return this.addDays(this.departure(), SCENARIO.nights);
      },
      daysBetween: function (a, b) {
        var a0 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
        var b0 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
        return Math.round((b0 - a0) / 86400000);
      },

      /* "5 Oct" */
      fmtShort: function (d) { return d.getDate() + ' ' + MONTHS[d.getMonth()]; },
      /* "19 October 2026" */
      fmtLong: function (d) {
        return d.getDate() + ' ' + MONTHS_LONG[d.getMonth()] + ' ' + d.getFullYear();
      },
      /* "Sun 6 Dec 2026" */
      fmtDay: function (d) {
        return DAYS[d.getDay()] + ' ' + d.getDate() + ' ' + MONTHS[d.getMonth()]
          + ' ' + d.getFullYear();
      }
    },

    /* ---- schedule ------------------------------------------------------- */

    bandFor: function (dtd) {
      for (var i = 0; i < BANDS.length; i++) {
        if (dtd >= BANDS[i].minDtd && dtd <= BANDS[i].maxDtd) return BANDS[i];
      }
      return BANDS[BANDS.length - 1];
    },
    currentBand: function () { return this.bandFor(this.dates.dtd()); },

    /* The full calendar range a band occupies. Passed bands keep their whole
       range, as in the draft, so the schedule reads as a fixed timetable. */
    bandWhen: function (band) {
      var d = this.dates, dep = d.departure();
      var end = d.addDays(dep, -band.minDtd);
      if (band === BANDS[0]) return 'Until ' + d.fmtShort(end);
      return d.fmtShort(d.addDays(dep, -band.maxDtd)) + ' - ' + d.fmtShort(end);
    },

    nextBand: function () {
      var i = BANDS.indexOf(this.currentBand());
      return i >= 0 && i < BANDS.length - 1 ? BANDS[i + 1] : null;
    },
    nextBandStart: function () {
      var next = this.nextBand();
      return next ? this.dates.addDays(this.dates.departure(), -next.maxDtd) : null;
    },
    daysAtCurrentCost: function () {
      var s = this.nextBandStart();
      return s ? this.dates.daysBetween(this.dates.today(), s) : null;
    },

    /* ---- money ---------------------------------------------------------- */

    /* The cost to cancel. The deposit is non-refundable even when the
       percentage charge is lower, so the cost is the greater of the two. */
    chargePence: function () {
      var band = this.currentBand();
      if (band.pct === null) return SCENARIO.depositPence;
      return Math.max(SCENARIO.depositPence,
        Math.round(SCENARIO.totalPricePence * band.pct / 100));
    },
    refundPence: function () {
      return Math.max(0, SCENARIO.paidToDatePence - this.chargePence());
    },
    /* Still to pay in order to cancel today. */
    shortfallPence: function () {
      return Math.max(0, this.chargePence() - SCENARIO.paidToDatePence);
    },
    /* What is still owed on the holiday itself. */
    outstandingPence: function () {
      return Math.max(0, SCENARIO.totalPricePence - SCENARIO.paidToDatePence);
    },

    /* THE ROUTING RULE. */
    canCancelOnline: function () { return this.shortfallPence() === 0; },

    money: function (pence) {
      var p = Math.abs(Math.round(pence));
      var pounds = String(Math.floor(p / 100))
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return '£' + pounds + '.' + String(p % 100).padStart(2, '0');
    },

    /* ---- rendering ------------------------------------------------------ */

    /* Fill every [data-mmb="key"] element in one pass. */
    render: function () {
      var d = this.dates, next = this.nextBand();
      var map = {
        'hotel':          SCENARIO.hotel,
        'hotel-location': SCENARIO.hotelLocation,
        'reference':      SCENARIO.reference,
        'contact-phone':  SCENARIO.contactPhone,
        'card':           SCENARIO.card,
        'stay-range':     d.fmtDay(d.departure()) + ' - ' + d.fmtDay(d.returnDate()),
        'paid-to-date':   this.money(SCENARIO.paidToDatePence),
        'outstanding':    this.money(this.outstandingPence()),
        'charge':         this.money(this.chargePence()),
        'charge-minus':   '−' + this.money(this.chargePence()),
        'refund':         this.money(this.refundPence()),
        'shortfall':      this.money(this.shortfallPence()),
        'next-date-short': next ? d.fmtShort(this.nextBandStart()) : ''
      };
      Object.keys(map).forEach(function (k) {
        var nodes = document.querySelectorAll('[data-mmb="' + k + '"]');
        for (var i = 0; i < nodes.length; i++) nodes[i].textContent = map[k];
      });
    },

    /* Build the schedule rows. Cost level is carried by bar length and by the
       percentage written on the row; state is carried by a word ("Passed",
       "Today") plus border weight, never by shade alone. */
    renderBands: function (containerId) {
      var host = document.getElementById(containerId);
      if (!host) return;
      var self = this;
      var dtd = this.dates.dtd();
      var current = this.currentBand();
      host.innerHTML = '';

      BANDS.forEach(function (band) {
        var isNow = band === current;
        var isPassed = band.minDtd > dtd;
        var share = band.pct === null ? 4 : band.pct;

        var row = document.createElement('li');
        row.className = 'lo-band' + (isNow ? ' is-selected' : '')
          + (isPassed ? ' is-passed' : '');

        var label = document.createElement('span');
        label.className = 'lo-band-label';
        var pct = document.createElement('span');
        pct.className = 'lo-band-pct';
        pct.textContent = band.label;
        var when = document.createElement('span');
        when.className = 'lo-band-dates';
        when.textContent = self.bandWhen(band);
        label.appendChild(pct);
        label.appendChild(when);
        row.appendChild(label);

        if (isNow || isPassed) {
          var flag = document.createElement('span');
          flag.className = 'lo-band-flag';
          flag.textContent = isNow ? 'Today' : 'Passed';
          row.appendChild(flag);
        }

        var track = document.createElement('span');
        track.className = 'lo-band-track';
        track.setAttribute('aria-hidden', 'true');
        var fill = document.createElement('i');
        fill.style.width = share + '%';
        track.appendChild(fill);
        row.appendChild(track);

        host.appendChild(row);
      });
    },

    /* The boundary note. The wording has to stay true at the edges, so the
       top band and the last day of a band are written differently rather
       than suppressed. Only reachable under a ?dtd override. */
    renderBoundary: function (titleId, bodyId) {
      var title = document.getElementById(titleId);
      var body  = document.getElementById(bodyId);
      if (!title || !body) return;
      var next = this.nextBand();
      if (!next) {
        title.textContent = 'The cost of cancelling won\'t go up again';
        body.textContent  = 'Cancelling now costs 100% of your total booking '
          + 'price. This will not change before departure.';
        return;
      }
      var days = this.daysAtCurrentCost();
      title.textContent = days === 1
        ? 'Today is the last day at today\'s cost'
        : days + ' days at today\'s cost';
      body.textContent = 'From ' + this.dates.fmtLong(this.nextBandStart())
        + ' the cost of cancelling increases to ' + next.pct
        + '% of your total booking price.'
        + (days === 1 ? '' : ' You don\'t need to decide today.');
    }
  };

  window.MMB = MMB;

  function boot() { try { MMB.render(); } catch (e) {} }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();
