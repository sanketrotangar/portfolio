/**
 * Portfolio Client Script
 * Handles:
 * 1. Contact Form mailto submission
 * 2. Sticky header scroll state + 'Ask my AI' entry points
 * 3. 3D Card Flip — Terminal ↔ AI Assistant (Desktop/Laptop)
 * 4. Interactive AI Assistant chat placeholder logic
 * 5. Bento Grid Card Morphing & Expansion (Desktop/Laptop only)
 */

document.addEventListener('DOMContentLoaded', () => {

  /* ------------------------------------------------------------------ */
  /*  1. Contact Form — Web3Forms reachout with async feedback & fallback */
  /* ------------------------------------------------------------------ */
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  const submitBtn = document.getElementById('contact-submit-btn');

  if (contactForm) {
    contactForm.addEventListener('submit', async function (event) {
      event.preventDefault();

      const formData = new FormData(contactForm);
      const name = formData.get('name') || '';
      const email = formData.get('email') || '';
      const message = formData.get('message') || '';
      const accessKey = formData.get('access_key');

      // Update button state to loading
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Sending message...</span> <span style="font-size:14px">⏳</span>';
      }
      if (formStatus) {
        formStatus.className = 'form-status form-status--loading';
        formStatus.textContent = 'Transmitting your message...';
      }

      // If key is not yet configured with user's Web3Forms access key:
      if (!accessKey || accessKey === 'YOUR_ACCESS_KEY_HERE') {
        setTimeout(() => {
          const subject = `Portfolio reachout from ${name}`;
          const body = `Hi Sanket,\n\n${message}\n\nFrom: ${name} (${email})`;
          window.location.href = `mailto:sanketrotangar04@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

          if (formStatus) {
            formStatus.className = 'form-status form-status--info';
            formStatus.innerHTML = `Note: Set your Web3Forms key in index.html to receive messages directly in your inbox. Opened your email client as fallback! (<a href="https://web3forms.com" target="_blank" rel="noreferrer" class="contact-direct-email">Get free key</a>)`;
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<span>Send message</span> <span>↗</span>';
          }
        }, 600);
        return;
      }

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(Object.fromEntries(formData))
        });

        const result = await response.json();

        if (response.status === 200 && result.success) {
          if (formStatus) {
            formStatus.className = 'form-status form-status--success';
            formStatus.innerHTML = '✓ Message received! Thanks for reaching out—I’ll get back to you soon.';
          }
          contactForm.reset();
        } else {
          throw new Error(result.message || 'Submission failed');
        }
      } catch (err) {
        console.error('Web3Forms submission error:', err);
        if (formStatus) {
          formStatus.className = 'form-status form-status--error';
          formStatus.innerHTML = `Could not send automatically (${err.message}). <a href="mailto:sanketrotangar04@gmail.com?subject=Portfolio%20reachout%20from%20${encodeURIComponent(name)}&body=${encodeURIComponent(message)}" class="contact-direct-email">Click here to send direct email</a>.`;
        }
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Send message</span> <span>↗</span>';
        }
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /*  2. Sticky Header + Card Flip — Terminal ↔ AI Assistant            */
  /* ------------------------------------------------------------------ */
  const cardScene    = document.getElementById('card-scene');
  const flipTrigger  = document.getElementById('flip-trigger');
  const flipBack     = document.getElementById('flip-back');
  const navAiTrigger = document.getElementById('nav-ai-trigger');
  const chatFormEl   = document.getElementById('chat-form');
  const chatBody     = document.getElementById('chat-body');
  const suggestions  = document.getElementById('chat-suggestions');

  function openAssistant() {
    if (!cardScene) return;
    cardScene.classList.add('is-flipped');
    setTimeout(() => {
      const input = cardScene.querySelector('.chat-input');
      if (input) input.focus();
    }, 780);
  }

  const cardFlipBtn  = document.getElementById('card-flip-btn');

  if (flipTrigger && cardScene) {
    flipTrigger.addEventListener('click', openAssistant);
  }

  if (cardFlipBtn && cardScene) {
    cardFlipBtn.addEventListener('click', openAssistant);
  }

  // Header "Ask my AI": scroll back to the hero, then flip the card
  if (navAiTrigger && cardScene) {
    navAiTrigger.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      openAssistant();
    });
  }

  // Sticky header: add a border once the page is scrolled
  const siteHeader = document.getElementById('site-header');
  if (siteHeader) {
    const toggleHeaderState = () => {
      siteHeader.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    toggleHeaderState();
    window.addEventListener('scroll', toggleHeaderState, { passive: true });
  }

  if (flipBack && cardScene) {
    flipBack.addEventListener('click', () => {
      cardScene.classList.remove('is-flipped');
    });
  }

  /* ------------------------------------------------------------------ */
  /*  3. Chat UI — Frontend-Only Placeholder Logic                     */
  /* ------------------------------------------------------------------ */
  function appendMessage(role, text) {
    if (!chatBody) return;
    const wrapper = document.createElement('div');
    wrapper.className = `chat-msg chat-msg--${role}`;

    const p = document.createElement('p');
    if (role === 'ai') {
      p.innerHTML = text;
    } else {
      p.textContent = text;
    }

    wrapper.appendChild(p);
    chatBody.appendChild(wrapper);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function showTypingThenReply(replyHtml) {
    if (!chatBody) return;
    const typing = document.createElement('div');
    typing.className = 'chat-msg chat-msg--ai';
    typing.innerHTML = '<p style="color:var(--on-ink-muted)">Thinking<span class="typing-dots">...</span></p>';
    chatBody.appendChild(typing);
    chatBody.scrollTop = chatBody.scrollHeight;

    setTimeout(() => {
      if (typing.parentNode) chatBody.removeChild(typing);
      appendMessage('ai', replyHtml);
    }, 800 + Math.random() * 400);
  }

  const placeholderResponses = [
    "Sanket focuses on <em>AI engineering</em> and <em>backend systems</em> — Python, FastAPI, RAG pipelines, and LLM integrations are his core toolkit.",
    "He's built projects like <em>MeetingMind</em> (meeting intelligence), <em>NightVigil</em> (public safety), <em>AeroConnect</em> (IoT air quality), and an <em>AI piping MTO extraction</em> tool.",
    "Right now he's building an <em>MCP-native multi-agent orchestrator</em> with human-in-the-loop control and evaluation harnesses.",
    "Sanket has completed <em>3 engineering internships</em>, won the <em>Goa Open Innovation Challenge (GOIC)</em>, and earned multiple accolades across hackathons and innovation challenges.",
    "His approach: start with the real problem, make complexity feel quiet, and keep learning in public. 🔧",
    "Want to connect? Scroll down to the contact section or reach out on <em>LinkedIn</em> or <em>GitHub</em>."
  ];

  let responseIndex = 0;

  function getPlaceholderReply() {
    const reply = placeholderResponses[responseIndex % placeholderResponses.length];
    responseIndex++;
    return reply;
  }

  if (suggestions) {
    suggestions.addEventListener('click', (e) => {
      const chip = e.target.closest('.chat-chip');
      if (!chip) return;

      const question = chip.textContent;
      appendMessage('user', question);
      suggestions.style.display = 'none';
      showTypingThenReply(getPlaceholderReply());
    });
  }

  if (chatFormEl) {
    chatFormEl.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = chatFormEl.querySelector('.chat-input');
      const text = input.value.trim();
      if (!text) return;

      appendMessage('user', text);
      input.value = '';

      if (suggestions) suggestions.style.display = 'none';
      showTypingThenReply(getPlaceholderReply());
    });
  }

  /* ------------------------------------------------------------------ */
  /*  4. Scroll Reveal for Project Cards (Once, Transform/Opacity Only) */
  /* ------------------------------------------------------------------ */
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const revealCards = document.querySelectorAll(".project-reveal");
  if (!prefersReduced && "IntersectionObserver" in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -20px 0px" });

    revealCards.forEach(el => observer.observe(el));
  } else {
    revealCards.forEach(el => el.classList.add("is-revealed"));
  }

  /* ------------------------------------------------------------------ */
  /*  5. Hero Status Typewriter Effect                                  */
  /* ------------------------------------------------------------------ */
  const typewriterEl = document.getElementById('hero-typewriter');
  if (typewriterEl) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const phrases = [
      "Open to SDE, Agentic Systems & AI engineering roles · Open to relocate.",
      "Design, architect, build & maintain reliable production systems.",
      "Specialized in Agentic Systems, GenAI, Knowledge Assistants & Voice Agents.",
      "Goa, India — open to relocate worldwide."
    ];

    if (prefersReducedMotion) {
      let phraseIdx = 0;
      setInterval(() => {
        phraseIdx = (phraseIdx + 1) % phrases.length;
        typewriterEl.textContent = phrases[phraseIdx];
      }, 4000);
    } else {
      let phraseIdx = 0;
      let charIdx = phrases[0].length;
      let isDeleting = false;

      // Initial reading dwell before starting typewriter cycle
      setTimeout(tick, 2200);

      function tick() {
        const currentPhrase = phrases[phraseIdx];

        if (isDeleting) {
          charIdx--;
          typewriterEl.textContent = currentPhrase.substring(0, charIdx);

          if (charIdx === 0) {
            isDeleting = false;
            phraseIdx = (phraseIdx + 1) % phrases.length;
            setTimeout(tick, 380);
            return;
          }
          setTimeout(tick, 22);
        } else {
          charIdx++;
          typewriterEl.textContent = currentPhrase.substring(0, charIdx);

          if (charIdx === currentPhrase.length) {
            isDeleting = true;
            // Dwell on completed phrase so it is easy to read
            setTimeout(tick, 2600);
            return;
          }
          const delay = 42 + Math.random() * 24;
          setTimeout(tick, delay);
        }
      }
    }
  }

  /* ------------------------------------------------------------------ */
  /*  6. Resume Download Tracked Redirect & Local Protocol Handler      */
  /* ------------------------------------------------------------------ */
  const resumeLinks = document.querySelectorAll('a[href$="resume/index.html"], [data-track*="resume"]');
  resumeLinks.forEach((link) => {
    // If opened via local file:// protocol, update relative path to avoid root filesystem navigation
    if (window.location.protocol === 'file:') {
      link.setAttribute('href', 'resume/index.html');
    }

    link.addEventListener('click', () => {
      const source = link.getAttribute('data-track') || 'general';
      const trackPayload = {
        event: 'resume_download_click',
        source: source,
        timestamp: new Date().toISOString(),
        referrer: document.referrer || window.location.href,
        path: window.location.pathname
      };

      try {
        const history = JSON.parse(localStorage.getItem('tracked_resume_downloads') || '[]');
        history.push(trackPayload);
        localStorage.setItem('tracked_resume_downloads', JSON.stringify(history.slice(-50)));
      } catch (err) {
        // Safe fail in case storage is restricted
      }

      if (typeof gtag === 'function') {
        gtag('event', 'resume_download', {
          event_category: 'engagement',
          event_label: source
        });
      }

      console.log('[Analytics] Tracked resume click event:', trackPayload);
    });
  });
});
