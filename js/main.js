/* ==========================================================================
   Site behaviour: scroll reveal, load more, diagram zoom, contact form.
   Every hook is optional so the same file runs on every page.
   ========================================================================== */
(function () {
  'use strict';

  /* --- Scroll reveal: single 200ms fade, once --------------------------- */
  var revealEls = document.querySelectorAll('.reveal');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (revealEls.length) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      var observer = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting) return;
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          });
        },
        { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
      );
      Array.prototype.forEach.call(revealEls, function (el) {
        observer.observe(el);
      });
    } else {
      Array.prototype.forEach.call(revealEls, function (el) {
        el.classList.add('is-visible');
      });
    }
  }

  /* --- Achievements ticker: repeat the list so the loop never gaps ------- */
  var tickerTrack = document.getElementById('achievement-track');

  if (tickerTrack) {
    var tickerList = tickerTrack.querySelector('.ticker__list');
    var tickerWidth = tickerList ? tickerList.getBoundingClientRect().width : 0;

    if (tickerWidth > 0) {
      // At least two copies, then enough to fill wide displays: the loop shifts
      // exactly one copy, so the strip is never empty while it wraps.
      var copies = 2;
      while (copies * tickerWidth < window.innerWidth * 1.25 && copies < 6) copies++;

      for (var c = 1; c < copies; c++) {
        var copy = tickerList.cloneNode(true);
        copy.removeAttribute('id');
        copy.classList.add('ticker__list--clone');
        copy.setAttribute('aria-hidden', 'true');
        tickerTrack.appendChild(copy);
      }

      tickerTrack.style.setProperty('--ticker-copies', String(copies));
      // Constant reading speed however many achievements are added.
      tickerTrack.style.setProperty('--ticker-duration', Math.max(16, Math.round(tickerWidth / 60)) + 's');
    }
  }

  /* --- Load more: three cards per click --------------------------------- */
  var list = document.getElementById('project-list');
  var loadMore = document.getElementById('load-more');

  if (list && loadMore) {
    var pageSize = 3;
    var cards = Array.prototype.slice.call(list.querySelectorAll('[data-project]'));
    var shown = cards.filter(function (card) {
      return !card.hasAttribute('hidden');
    }).length;

    loadMore.hidden = shown >= cards.length;

    loadMore.addEventListener('click', function () {
      var start = shown;
      var end = Math.min(start + pageSize, cards.length);

      for (; shown < end; shown++) {
        cards[shown].removeAttribute('hidden');
        cards[shown].classList.add('is-visible');
      }

      loadMore.hidden = shown >= cards.length;

      // The button disappears on the last batch; keep keyboard focus in the list.
      if (loadMore.hidden) {
        var firstNew = cards[start] && cards[start].querySelector('a');
        if (firstNew) firstNew.focus();
      }
    });
  }

  /* --- Load more: awards ------------------------------------------------- */
  var awardsCard = document.querySelector('.awards-card');
  var loadMoreAwards = document.getElementById('load-more-awards');

  if (awardsCard && loadMoreAwards) {
    var hiddenRows = awardsCard.querySelectorAll('.awards-card__row[hidden]');
    if (hiddenRows.length === 0) {
      loadMoreAwards.hidden = true;
    }

    loadMoreAwards.addEventListener('click', function () {
      var rows = awardsCard.querySelectorAll('.awards-card__row[hidden]');
      for (var i = 0; i < rows.length; i++) {
        rows[i].removeAttribute('hidden');
      }
      loadMoreAwards.hidden = true;
    });
  }

  /* --- Diagram zoom ----------------------------------------------------- */
  var dialog = document.getElementById('lightbox');
  var dialogImage = document.getElementById('lightbox-image');

  if (dialog && dialogImage && typeof dialog.showModal === 'function') {
    Array.prototype.forEach.call(document.querySelectorAll('[data-zoom]'), function (btn) {
      btn.addEventListener('click', function () {
        dialogImage.src = btn.getAttribute('data-zoom');
        dialogImage.alt = btn.getAttribute('data-zoom-alt') || '';
        dialog.showModal();
      });
    });

    dialog.addEventListener('click', function (event) {
      if (event.target === dialog) dialog.close();
    });

    var closeBtn = dialog.querySelector('.lightbox__close');
    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        dialog.close();
      });
    }
  }

  /* --- Notes section: hidden when empty --------------------------------- */
  var notes = document.getElementById('notes');
  if (notes) {
    notes.hidden = notes.querySelectorAll('.note-item').length === 0;
  }

  /* --- Header border on scroll ------------------------------------------ */
  var header = document.querySelector('.site-header');
  if (header) {
    var setScrolled = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    setScrolled();
    window.addEventListener('scroll', setScrolled, { passive: true });
  }

  /* Contact form is handled on index.html (posts to /api/contact). */
})();
