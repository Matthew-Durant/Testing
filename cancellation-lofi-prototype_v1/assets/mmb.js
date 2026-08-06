/* =============================================================================
   MMB CANCELLATION PROTOTYPE - scenario data and logic model on window.MMB

   Composes with lofi.js: the visual system, screen-heading focus, Reset link
   and state store come from window.LOFI. This file adds only what the
   cancellation study needs, per the mmb-usability-prototype conventions:

   - Participant scenario data (flow 1: paid in full)
   - Dynamic date model. Today is the participant's real date; departure is
     computed as today + dtd. Nothing date-derived is ever hardcoded.
   - The fee schedule, expressed once, as days-to-departure bands
   - Integer-pence money maths. One formula feeds every figure on screen.

   State is delegated to LOFI.save/load so the Reset link clears everything,
   including the dtd override. Load this AFTER lofi.js.
   ============================================================================= */
(function () {
  'use strict';

  /* --- Participant scenario (flow 1: paid in full) ------------------------ */
  var SCENARIO = {
    leadFirstName: 'John',
    leadName: 'Mr. John Smith',
    partnerName: 'Mrs. Jane Smith',
    dob: '12/12/1980',
    phone: '07898 464938',
    email: 'john.smith@gmail.com',
    address: 'Wigmore House, Wigmore Place, Luton, LU29TN, United Kingdom',
    reference: '29140653',
    hotel: 'Flamingo Beach',
    resort: 'Playa Blanca',
    hotelLocation: 'In Playa Blanca, Lanzarote, Canary Islands, Spain',
    nights: 7,
    board: 'Half board',
    room: 'Twin room with sliding doors and balcony',
    outFlight: 'TOM01',
    retFlight: 'TOM02',
    outFrom: 'London Gatwick', outFromCode: 'LGW',
    outTo: 'Manrique-Lanzarote', outToCode: 'ACE',
    departTime: '06:00', arriveTime: '10:45', duration: '4hr 45min',
    contactPhone: '01 693 7700',
    card: 'Visa card ending 1083',

    /* Money, in integer pence. Paid in full, so paid == total price. */
    totalPricePence: 1043900,   /* GBP 10,439.00 total holiday price          */
    paidToDatePence: 1043900,   /* GBP 10,439.00 paid in full                 */
    depositPence:      40000,   /* GBP    400.00 deposit, non-refundable      */
    extrasPence:           0    /* GBP      0.00 non-refundable extras        */
  };

  /* --- Fee schedule -------------------------------------------------------
     Expressed once, as days-to-departure bands, so every date range, every
     percentage and every amount on every screen derives from this one table.
     Band boundaries were read off the source design and verified against its
     departure date of Wed 21 Oct 2026.
     ------------------------------------------------------------------------ */
  var BANDS = [
    { pct: null, label: 'Loss of deposit', minDtd: 71, maxDtd: 3650 },
    { pct: 30,   label: '30% of total',    minDtd: 64, maxDtd: 70   },
    { pct: 50,   label: '50% of total',    minDtd: 50, maxDtd: 63   },
    { pct: 70,   label: '70% of total',    minDtd: 30, maxDtd: 49   },
    { pct: 90,   label: '90% of total',    minDtd: 16, maxDtd: 29   },
    { pct: 100,  label: '100% of total',   minDtd:  1, maxDtd: 15   }
  ];

  var DEFAULT_DTD = 83;   /* reproduces the source design exactly:
                             departure 83 days out, loss-of-deposit band,
                             13 days until the fee rises to 30%            */

  var MONTHS      = ['Jan','Feb','Mar','Apr','May','Jun',
                     'Jul','Aug','Sept','Oct','Nov','Dec'];
  var MONTHS_LONG = ['January','February','March','April','May','June','July',
                     'August','September','October','November','December'];

  var MMB = {

    scenario: SCENARIO,
    bands: BANDS,

    /* ---- state: delegated to LOFI so Reset clears it -------------------- */
    save:  function (patch) { return window.LOFI.save(patch); },
    load:  function ()      { return window.LOFI.load(); },
    get:   function (k, d)  { return window.LOFI.get(k, d); },
    track: function (n, d)  { return window.LOFI.track(n, d); },

    /* ---- dates ---------------------------------------------------------- */
    dates: {
      DEFAULT_DTD: DEFAULT_DTD,
      MONTHS: MONTHS,

      /* Resolve days-to-departure: URL override, then stored, then default.
         Garbage input falls back safely. Stored in the LOFI state blob so
         Reset clears the override along with everything else. */
      dtd: function () {
        var raw = null;
        try {
          var m = window.location.search.match(/[?&]dtd=([^&]*)/);
          if (m) raw = m[1];
        } catch (e) {}
        if (raw !== null) {
          var n = parseInt(raw, 10);
          if (!isNaN(n) && n > 0 && n < 1000) {
            window.LOFI.save({ dtd: n });
            return n;
          }
        }
        var stored = window.LOFI.get('dtd', null);
        if (typeof stored === 'number' && stored > 0) return stored;
        return DEFAULT_DTD;
      },

      today: function () {
        var n = new Date();
        return new Date(n.getFullYear(), n.getMonth(), n.getDate());
      },

      addDays: function (d, n) {
        return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
      },

      departure: function () { return this.addDays(this.today(), this.dtd()); },

      /* Return date: departure plus the holiday length */
      returnDate: function () {
        return this.addDays(this.departure(), SCENARIO.nights);
      },

      daysBetween: function (a, b) {
        var MS = 86400000;
        var a0 = new Date(a.getFullYear(), a.getMonth(), a.getDate());
        var b0 = new Date(b.getFullYear(), b.getMonth(), b.getDate());
        return Math.round((b0 - a0) / MS);
      },

      /* "21 Oct 2026" */
      fmt: function (d) {
        return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear();
      },
      /* "12 Aug" */
      fmtShort: function (d) {
        return d.getDate() + ' ' + MONTHS[d.getMonth()];
      },
      /* "12 August 2026" */
      fmtLong: function (d) {
        return d.getDate() + ' ' + MONTHS_LONG[d.getMonth()] + ' ' + d.getFullYear();
      },
      /* "Wed 21 Oct 2026" */
      fmtDay: function (d) {
        var days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
        return days[d.getDay()] + ' ' + this.fmt(d);
      },
      /* "12 Aug - 18 Aug", matching the source design's hyphen style */
      fmtRange: function (a, b) {
        return this.fmtShort(a) + ' - ' + this.fmtShort(b);
      }
    },

    /* ---- fee schedule --------------------------------------------------- */

    /* The band that applies at a given days-to-departure */
    bandFor: function (dtd) {
      for (var i = 0; i < BANDS.length; i++) {
        if (dtd >= BANDS[i].minDtd && dtd <= BANDS[i].maxDtd) return BANDS[i];
      }
      return BANDS[BANDS.length - 1];
    },

    /* Calendar range a band occupies, derived from departure. A band that
       runs from minDtd to maxDtd days before departure starts at
       departure - maxDtd and ends at departure - minDtd. */
    bandRange: function (band) {
      var dep = this.dates.departure();
      var dtd = this.dates.dtd();
      var start = this.dates.addDays(dep, -Math.min(band.maxDtd, dtd));
      var end   = this.dates.addDays(dep, -band.minDtd);
      return { start: start, end: end };
    },

    /* The band immediately more expensive than the current one, or null if
       already at the top. Drives the conditional "N days at this fee level"
       card, which must disappear or change wording outside its band. */
    nextBand: function () {
      var current = this.bandFor(this.dates.dtd());
      var i = BANDS.indexOf(current);
      return i >= 0 && i < BANDS.length - 1 ? BANDS[i + 1] : null;
    },

    /* Date the next band begins, and how many days away it is */
    nextBandStart: function () {
      var next = this.nextBand();
      if (!next) return null;
      return this.dates.addDays(this.dates.departure(), -next.maxDtd);
    },
    daysAtCurrentFee: function () {
      var s = this.nextBandStart();
      return s ? this.dates.daysBetween(this.dates.today(), s) : null;
    },

    /* ---- money: integer pence throughout, formatted only at render ------ */

    /* The cancellation charge. The deposit is non-refundable even when the
       percentage charge is lower, so the charge is the greater of the two.
       Every figure on every screen comes from this one function. */
    chargePence: function () {
      var band = this.bandFor(this.dates.dtd());
      if (band.pct === null) return SCENARIO.depositPence;
      var pctCharge = Math.round(SCENARIO.totalPricePence * band.pct / 100);
      return Math.max(SCENARIO.depositPence, pctCharge);
    },

    /* The part of the charge above the deposit already held. This is the
       line the source design labels "Cancellation fee today". */
    feeAboveDepositPence: function () {
      return this.chargePence() - SCENARIO.depositPence;
    },

    refundPence: function () {
      return Math.max(
        0,
        SCENARIO.paidToDatePence - this.chargePence() - SCENARIO.extrasPence
      );
    },

    money: function (pence) {
      var neg = pence < 0;
      var p = Math.abs(Math.round(pence));
      var pounds = String(Math.floor(p / 100))
        .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return (neg ? '-' : '') + '\u00a3' + pounds + '.'
        + String(p % 100).padStart(2, '0');
    },

    /* ---- rendering helpers ---------------------------------------------- */

    /* Substitute every [data-mmb="key"] element on the page in one pass, so
       no screen ever hardcodes a date or an amount. */
    render: function () {
      var d = this.dates;
      var band = this.bandFor(d.dtd());
      var next = this.nextBand();
      var map = {
        'lead-first':    SCENARIO.leadFirstName,
        'lead-name':     SCENARIO.leadName,
        'resort':        SCENARIO.resort,
        'hotel':         SCENARIO.hotel,
        'hotel-location':SCENARIO.hotelLocation,
        'reference':     SCENARIO.reference,
        'email':         SCENARIO.email,
        'contact-phone': SCENARIO.contactPhone,
        'card':          SCENARIO.card,
        'depart-date':   d.fmtDay(d.departure()),
        'return-date':   d.fmtDay(d.returnDate()),
        'stay-range':    d.fmtDay(d.departure()) + ' - ' + d.fmtDay(d.returnDate()),
        'deposit':       this.money(SCENARIO.depositPence),
        'paid-to-date':  this.money(SCENARIO.paidToDatePence),
        'charge':        this.money(this.chargePence()),
        'fee-today':     this.money(this.feeAboveDepositPence()),
        'extras':        this.money(SCENARIO.extrasPence),
        'refund':        this.money(this.refundPence()),
        'band-label':    band.label,
        'next-pct':      next ? next.pct + '%' : '',
        'next-date':     next ? d.fmtLong(this.nextBandStart()) : '',
        'days-at-fee':   next ? String(this.daysAtCurrentFee()) : ''
      };
      Object.keys(map).forEach(function (k) {
        var nodes = document.querySelectorAll('[data-mmb="' + k + '"]');
        for (var i = 0; i < nodes.length; i++) nodes[i].textContent = map[k];
      });
    },

    /* Build the fee schedule rows. Severity is carried by bar length and by
       the percentage written on the row, never by shade alone. */
    renderBands: function (containerId) {
      var host = document.getElementById(containerId);
      if (!host) return;
      var self = this, d = this.dates;
      var dtd = d.dtd();
      var current = this.bandFor(dtd);
      host.innerHTML = '';

      BANDS.forEach(function (band) {
        var isNow = band === current;
        /* Bar length encodes what the source encoded with hue. The
           loss-of-deposit band is charged at the deposit, so its share of the
           total price is small but real. */
        var share = band.pct === null
          ? Math.round(SCENARIO.depositPence / SCENARIO.totalPricePence * 100)
          : band.pct;

        var when;
        if (band === BANDS[0]) {
          when = 'Until ' + d.fmtShort(d.addDays(d.departure(), -(BANDS[1].maxDtd + 1)));
        } else {
          var r = self.bandRange(band);
          when = d.fmtRange(r.start, r.end);
        }

        var row = document.createElement('li');
        row.className = 'lo-band' + (isNow ? ' is-selected' : '');

        var pct = document.createElement('span');
        pct.className = 'lo-band-pct';
        pct.textContent = band.label;

        var whenEl = document.createElement('span');
        whenEl.className = 'lo-band-when';
        whenEl.textContent = isNow ? 'Today' : when;

        var track = document.createElement('span');
        track.className = 'lo-band-track';
        var fill = document.createElement('i');
        fill.style.width = Math.max(share, 4) + '%';
        track.appendChild(fill);

        row.appendChild(pct);
        row.appendChild(whenEl);
        row.appendChild(track);
        row.setAttribute('aria-label',
          band.label + ', ' + (isNow ? 'today, ' + when : when));
        host.appendChild(row);
      });
    }
  };

  window.MMB = MMB;

  /* Render on load, after lofi.js has booted. */
  function boot() { try { MMB.render(); } catch (e) {} }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else { boot(); }
})();
