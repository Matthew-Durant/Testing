/* =============================================================================
   LO-FI GRAYSCALE PROTOTYPE - shared utilities on window.LOFI
   Framework-free, offline, no network requests.
   Load at the end of <body>, after the markup.
   ============================================================================= */
(function () {
  'use strict';

  var KEY = 'lofi-proto';
  var EVENTS = 'lofi-events';

  var LOFI = {

    /* ---- state: sessionStorage only, so it dies with the tab and the next
       participant starts clean. Persistent local storage is banned - the
       audit enforces it. ------------------------------------------------- */

    load: function () {
      try { return JSON.parse(sessionStorage.getItem(KEY)) || {}; }
      catch (e) { return {}; }
    },

    save: function (patch) {
      var next = Object.assign(this.load(), patch || {});
      try { sessionStorage.setItem(KEY, JSON.stringify(next)); } catch (e) {}
      return next;
    },

    get: function (path, fallback) {
      var v = this.load();
      var parts = String(path).split('.');
      for (var i = 0; i < parts.length; i++) {
        if (v == null || typeof v !== 'object') return fallback;
        v = v[parts[i]];
      }
      return v === undefined ? fallback : v;
    },

    clear: function () {
      try { sessionStorage.removeItem(KEY); sessionStorage.removeItem(EVENTS); }
      catch (e) {}
    },

    /* ---- events: fire only names approved in the brief, so QA can assert
       an exact sequence after a session. -------------------------------- */

    track: function (name, data) {
      var log = this.events();
      log.push({ t: Date.now(), name: name, data: data || null });
      try { sessionStorage.setItem(EVENTS, JSON.stringify(log)); } catch (e) {}
      if (window.LOFI_DEBUG) console.log('[event]', name, data || '');
    },

    events: function () {
      try { return JSON.parse(sessionStorage.getItem(EVENTS)) || []; }
      catch (e) { return []; }
    },

    /* ---- text helpers ------------------------------------------------- */

    money: function (pence, symbol) {
      var s = symbol === undefined ? '\u00A3' : symbol;
      var neg = pence < 0;
      var v = Math.abs(Math.round(pence));
      var whole = String(Math.floor(v / 100)).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      return (neg ? '-' : '') + s + whole + '.' + String(v % 100).padStart(2, '0');
    },

    fill: function (map) {
      Object.keys(map || {}).forEach(function (k) {
        document.querySelectorAll('[data-fill="' + k + '"]').forEach(function (el) {
          el.textContent = map[k];
        });
      });
    },

    /* ---- components --------------------------------------------------- */

    /* Toggle switches: <button class="lo-switch" aria-checked="false"> */
    bindSwitches: function (root) {
      (root || document).querySelectorAll('.lo-switch').forEach(function (el) {
        if (el.dataset.loBound) return;
        el.dataset.loBound = '1';
        el.setAttribute('role', 'switch');
        if (!el.hasAttribute('aria-checked')) el.setAttribute('aria-checked', 'false');
        el.addEventListener('click', function () {
          var on = el.getAttribute('aria-checked') === 'true';
          el.setAttribute('aria-checked', String(!on));
          el.dispatchEvent(new CustomEvent('lo:change', { detail: { on: !on } }));
        });
      });
    },

    /* Tabs: <div role="tablist"><button class="lo-tab" aria-controls="id"> */
    bindTabs: function (root) {
      (root || document).querySelectorAll('[role="tablist"]').forEach(function (list) {
        var tabs = Array.prototype.slice.call(list.querySelectorAll('.lo-tab'));
        tabs.forEach(function (tab, i) {
          tab.addEventListener('click', function () { select(i); });
          tab.addEventListener('keydown', function (e) {
            var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
            if (!d) return;
            e.preventDefault();
            var n = (i + d + tabs.length) % tabs.length;
            select(n); tabs[n].focus();
          });
        });
        function select(n) {
          tabs.forEach(function (t, j) {
            t.setAttribute('aria-selected', String(j === n));
            t.setAttribute('tabindex', j === n ? '0' : '-1');
            var panel = document.getElementById(t.getAttribute('aria-controls'));
            if (panel) panel.hidden = j !== n;
          });
        }
      });
    },

    /* Bottom sheet / dialog. Returns a close function. */
    openSheet: function (id) {
      var el = document.getElementById(id);
      if (!el) return function () {};
      var opener = document.activeElement;
      el.hidden = false;
      var frame = document.querySelector('.lo-frame');
      if (frame) frame.setAttribute('aria-hidden', 'true');
      var focusable = el.querySelectorAll(
        'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])');
      if (focusable.length) focusable[0].focus();

      function onKey(e) {
        if (e.key === 'Escape') { close(); return; }
        if (e.key !== 'Tab' || !focusable.length) return;
        var first = focusable[0], last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
      function close() {
        el.hidden = true;
        if (frame) frame.removeAttribute('aria-hidden');
        document.removeEventListener('keydown', onKey);
        if (opener && opener.focus) opener.focus();
      }
      document.addEventListener('keydown', onKey);
      el.querySelectorAll('[data-sheet-close]').forEach(function (b) {
        b.addEventListener('click', close, { once: true });
      });
      return close;
    },

    toast: function (message, ms) {
      var t = document.createElement('div');
      t.className = 'lo-toast';
      t.setAttribute('role', 'status');
      t.textContent = message;
      document.body.appendChild(t);
      setTimeout(function () { t.remove(); }, ms || 2600);
    },

    /* ---- conformance audit (moderator/dev use) -------------------------
       Flags anything that breaks the system: chromatic colour, sub-44px
       tap targets, missing screen heading. Run LOFI.audit() in console. */

    audit: function () {
      var issues = [];

      function chromatic(rgb) {
        var m = /rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(rgb);
        if (!m) return false;
        var r = +m[1], g = +m[2], b = +m[3];
        return Math.max(r, g, b) - Math.min(r, g, b) > 2;
      }

      document.querySelectorAll('body *').forEach(function (el) {
        var cs = getComputedStyle(el);
        ['color', 'backgroundColor', 'borderTopColor', 'borderLeftColor'].forEach(function (p) {
          if (chromatic(cs[p])) {
            issues.push({ type: 'chromatic-colour', prop: p, value: cs[p], el: el });
          }
        });
        var tappable = el.matches('a[href],button,input,select,[role="button"],[role="tab"],[role="switch"]');
        if (tappable && !el.disabled) {
          var r = el.getBoundingClientRect();
          if (r.width && r.height && (r.height < 44 || r.width < 44)) {
            issues.push({
              type: 'tap-target', size: Math.round(r.width) + 'x' + Math.round(r.height), el: el
            });
          }
        }
      });

      if (!document.querySelector('[data-screen-heading]')) {
        issues.push({ type: 'missing-screen-heading' });
      }

      if (issues.length) { console.warn('LOFI audit:', issues.length + ' issue(s)'); console.table(issues); }
      else { console.log('LOFI audit: clean'); }
      return issues;
    },

    /* ---- boot ---------------------------------------------------------- */

    init: function () {
      /* Focus the screen heading so keyboard and screen-reader users land in
         context after every navigation. */
      var h = document.querySelector('[data-screen-heading]');
      if (h) {
        if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1');
        h.focus({ preventScroll: true });
      }

      /* Derive folder depth from the stylesheet link so Reset points home
         from any folder level without hardcoding a path. */
      var link = document.querySelector('link[rel="stylesheet"][href*="lofi.css"]');
      var root = link ? link.getAttribute('href').replace(/assets\/lofi\.css$/, '') : '';

      if (!document.querySelector('.lo-reset')) {
        var a = document.createElement('a');
        a.className = 'lo-reset';
        a.href = root + 'index.html';
        a.textContent = 'Reset';
        a.addEventListener('click', function () { LOFI.clear(); });
        document.body.appendChild(a);
      }

      this.bindSwitches();
      this.bindTabs();
      this.bindSheets();
    },

    /* <button data-open-sheet="filters"> opens #filters */
    bindSheets: function (root) {
      (root || document).querySelectorAll('[data-open-sheet]').forEach(function (el) {
        if (el.dataset.loBound) return;
        el.dataset.loBound = '1';
        el.addEventListener('click', function (e) {
          e.preventDefault();
          LOFI.openSheet(el.getAttribute('data-open-sheet'));
        });
      });
    }
  };

  window.LOFI = LOFI;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { LOFI.init(); });
  } else { LOFI.init(); }
})();
