/* =============================================================
   Shared prototype utilities.
   - Levenshtein distance for character-change counting (AMD-PD-003)
   - sessionStorage helpers to carry edits across screens
   - Reset link injection
   - Real countdown timer (used on Review/Pay pages)
   ============================================================= */

(function () {
  'use strict';

  /* ─── Storage keys ─── */
  const STORAGE_KEY = 'tui-mmb-proto';

  /* ─── Default participant data (matches Figma) ─── */
  const DEFAULTS = {
    title: 'Mr',
    firstName: 'John',
    surname: 'Smith',
    dobDay: '12',
    dobMonth: '12',
    dobYear: '1980',
    email: 'John.Smith@gmail.com',
    mobile: '07898 464938',
    address: {
      houseNumber: 'Wigmore House',
      street: 'Wigmore Place',
      line2: '',
      city: 'Luton',
      postcode: 'LU29TN',
      country: 'United Kingdom'
    }
  };

  /* ─── Public API on window.MMB ─── */
  window.MMB = {

    defaults: DEFAULTS,

    /* Levenshtein distance — used to count character changes between
       the original value and the current input. Equivalent to AMD-PD-003:
       each addition, removal, or substitution counts as 1. */
    levenshtein: function (a, b) {
      a = (a || '').toLowerCase();
      b = (b || '').toLowerCase();
      if (a === b) return 0;
      if (!a.length) return b.length;
      if (!b.length) return a.length;

      const m = a.length;
      const n = b.length;
      const prev = new Array(n + 1);
      const curr = new Array(n + 1);
      for (let j = 0; j <= n; j++) prev[j] = j;
      for (let i = 1; i <= m; i++) {
        curr[0] = i;
        for (let j = 1; j <= n; j++) {
          const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
          curr[j] = Math.min(
            prev[j] + 1,
            curr[j - 1] + 1,
            prev[j - 1] + cost
          );
        }
        for (let j = 0; j <= n; j++) prev[j] = curr[j];
      }
      return prev[n];
    },

    /* Detect direct first/surname transposition (AMD-PD-002 rule 2) */
    isTransposition: function (origFirst, origSurname, newFirst, newSurname) {
      return (
        origFirst === newSurname &&
        origSurname === newFirst &&
        origFirst !== origSurname
      );
    },

    /* Evaluate the edit against AMD-PD-002 / AMD-PD-005:
       Returns one of:
         { state: 'unchanged' }
         { state: 'correction', firstChanges, surnameChanges, total }
         { state: 'change',     firstChanges, surnameChanges, total, reason }
    */
    evaluateNameEdit: function (orig, edited) {
      const f = this.levenshtein(orig.firstName, edited.firstName);
      const s = this.levenshtein(orig.surname,   edited.surname);
      const total = f + s;

      if (f === 0 && s === 0) {
        return { state: 'unchanged', firstChanges: 0, surnameChanges: 0, total: 0 };
      }

      // Transposition is always treated as correction
      if (this.isTransposition(orig.firstName, orig.surname, edited.firstName, edited.surname)) {
        return { state: 'correction', firstChanges: f, surnameChanges: s, total, reason: 'transposition' };
      }

      // Both fields changed → name change (AMD-PD-002)
      if (f > 0 && s > 0) {
        return { state: 'change', firstChanges: f, surnameChanges: s, total, reason: 'multi-field' };
      }

      // Single field changed by > 3 chars → name change
      if (f > 3 || s > 3) {
        return { state: 'change', firstChanges: f, surnameChanges: s, total, reason: 'over-limit' };
      }

      // Otherwise: single field, ≤ 3 chars → correction
      return { state: 'correction', firstChanges: f, surnameChanges: s, total };
    },

    /* Save edited state for cross-screen continuity */
    save: function (data) {
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) { /* no-op */ }
    },

    load: function () {
      try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : null;
      } catch (e) { return null; }
    },

    clear: function () {
      try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) {}
    },

    /* Inject the persistent moderator reset link */
    injectResetLink: function (depth) {
      const a = document.createElement('a');
      a.className = 'mod-reset';
      a.href = (depth === 1 ? '../index.html' : 'index.html');
      a.textContent = '↻ Reset';
      a.addEventListener('click', function () { window.MMB.clear(); });
      document.body.appendChild(a);
    },

    /* Live countdown timer.
       Pass an element ID and a number of seconds; renders mm:ss s and ticks every second.
       Returns a stop() function. */
    startCountdown: function (elementId, totalSeconds, opts) {
      opts = opts || {};
      const el = document.getElementById(elementId);
      if (!el) return function () {};
      let remaining = totalSeconds;
      const tpl = opts.template || '{m}m {s}s';
      function fmt(t) {
        const m = Math.floor(t / 60);
        const s = t % 60;
        return tpl
          .replace('{m}', m)
          .replace('{s}', String(s).padStart(2, '0'));
      }
      el.textContent = fmt(remaining);
      const interval = setInterval(function () {
        remaining = Math.max(0, remaining - 1);
        el.textContent = fmt(remaining);
        if (remaining === 0) clearInterval(interval);
      }, 1000);
      return function () { clearInterval(interval); };
    },

    /* Countdown to a date (days/hrs/mins/secs) — used on MMB hub */
    startDateCountdown: function (targetDate, ids) {
      function tick() {
        const now = new Date();
        let diff = Math.max(0, Math.floor((targetDate - now) / 1000));
        const days = Math.floor(diff / 86400); diff %= 86400;
        const hrs  = Math.floor(diff / 3600);  diff %= 3600;
        const mins = Math.floor(diff / 60);
        const secs = diff % 60;
        if (ids.days)  document.getElementById(ids.days).textContent  = String(days).padStart(3, '0');
        if (ids.hours) document.getElementById(ids.hours).textContent = String(hrs).padStart(2, '0');
        if (ids.mins)  document.getElementById(ids.mins).textContent  = String(mins).padStart(2, '0');
        if (ids.secs)  document.getElementById(ids.secs).textContent  = String(secs).padStart(2, '0');
      }
      tick();
      return setInterval(tick, 1000);
    }
  };

  /* Auto-inject reset link on every page once DOM is ready.
     depth=1 for pages inside /flow1 or /flow2; depth=0 for index. */
  document.addEventListener('DOMContentLoaded', function () {
    const depth = window.location.pathname.match(/\/flow[12]\//) ? 1 : 0;
    window.MMB.injectResetLink(depth);
  });
})();
