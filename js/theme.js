/* ==========================================================================
   Theme toggle — sets data-theme on <html> and persists the choice.
   The no-flash default is applied by the inline script in each page <head>.
   ========================================================================== */
(function () {
  var KEY = 'theme';
  var root = document.documentElement;

  function button() {
    return document.getElementById('theme-toggle') || document.getElementById('svc-theme-toggle');
  }

  function current() {
    return root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function apply(theme) {
    root.setAttribute('data-theme', theme);
    var btn = button();
    if (btn) {
      btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
      btn.setAttribute('data-theme-state', theme);
    }
  }

  function init() {
    apply(current());
    var btn = button();
    if (!btn) return;
    btn.addEventListener('click', function () {
      var next = current() === 'dark' ? 'light' : 'dark';
      apply(next);
      try {
        localStorage.setItem(KEY, next);
      } catch (e) {
        /* Storage restricted; theme still applies for this page view. */
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
