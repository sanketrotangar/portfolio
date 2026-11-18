/* ==========================================================================
   "Ask my AI" launcher
   Floating entry point, present on every page. It opens the real assistant
   widget when one is mounted (window.PortfolioAssistant.open, or a #chat-widget
   element). No chat backend is connected on this build, so until then the panel
   states that plainly and links to email. It never fabricates answers.

   TODO: mount the assistant widget on #chat-widget and delete the fallback copy.
   ========================================================================== */
(function () {
  'use strict';

  function init() {
    if (document.querySelector('.assistant-launcher')) return;

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'assistant-launcher';
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', 'assistant-panel');
    button.setAttribute('aria-label', 'Ask my AI');
    button.innerHTML =
      '<svg class="assistant-launcher__icon" viewBox="0 0 24 24" aria-hidden="true">' +
      '<rect x="3.5" y="7" width="17" height="12.5" rx="4.5"/>' +
      '<path d="M12 7V4.4"/>' +
      '<circle cx="12" cy="2.9" r="1.4"/>' +
      '<path d="M1.8 12v2.6M22.2 12v2.6"/>' +
      '<circle cx="8.8" cy="12.6" r="1.15" fill="currentColor" stroke="none"/>' +
      '<circle cx="15.2" cy="12.6" r="1.15" fill="currentColor" stroke="none"/>' +
      '<path d="M9.6 16.3h4.8"/>' +
      '</svg><span>Ask my AI</span>';

    var panel = document.createElement('div');
    panel.className = 'assistant-panel';
    panel.id = 'assistant-panel';
    panel.hidden = true;
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', 'Ask my AI');
    panel.innerHTML =
      '<h2>Ask my AI</h2>' +
      '<p>The assistant is not connected on this build yet. Until it is, email me and I will answer directly.</p>' +
      '<p><a href="mailto:sanketrotangar04@gmail.com">sanketrotangar04@gmail.com</a></p>';

    document.body.appendChild(panel);
    document.body.appendChild(button);

    function setOpen(open) {
      panel.hidden = !open;
      button.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function hasWidget() {
      return (
        (window.PortfolioAssistant && typeof window.PortfolioAssistant.open === 'function') ||
        document.getElementById('chat-widget')
      );
    }

    button.addEventListener('click', function (event) {
      event.stopPropagation();
      if (window.PortfolioAssistant && typeof window.PortfolioAssistant.open === 'function') {
        window.PortfolioAssistant.open();
        return;
      }
      setOpen(panel.hidden);
    });

    panel.addEventListener('click', function (event) {
      event.stopPropagation();
    });

    document.addEventListener('click', function () {
      if (!panel.hidden) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && !panel.hidden) {
        setOpen(false);
        button.focus();
      }
    });

    if (hasWidget()) panel.removeAttribute('data-fallback');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
