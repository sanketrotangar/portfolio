/**
 * Portfolio Client Script
 * Handles:
 * 1. Contact Form mailto submission
 * 2. 3D Card Flip — Terminal ↔ AI Assistant (Desktop/Laptop)
 * 3. Interactive AI Assistant chat placeholder logic
 * 4. Bento Grid Card Morphing & Expansion (Desktop/Laptop only)
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
  /*  2. 3D Card Flip — Terminal ↔ AI Assistant                         */
  /* ------------------------------------------------------------------ */
  const cardScene    = document.getElementById('card-scene');
  const flipTrigger  = document.getElementById('flip-trigger');
  const flipBack     = document.getElementById('flip-back');
  const chatFormEl   = document.getElementById('chat-form');
  const chatBody     = document.getElementById('chat-body');
  const suggestions  = document.getElementById('chat-suggestions');

  if (flipTrigger && cardScene) {
    flipTrigger.addEventListener('click', () => {
      cardScene.classList.add('is-flipped');
      setTimeout(() => {
        const input = cardScene.querySelector('.chat-input');
        if (input) input.focus();
      }, 750);
    });
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
    typing.innerHTML = '<p style="color:#71867c">Thinking<span class="typing-dots">...</span></p>';
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
    "Sanket has completed <em>2 engineering internships</em>, finished <em>Top 12 in eYantra India</em>, and won the <em>GOIC Innovation</em> award.",
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
  /*  4. Bento Grid Morphing Expansion (Desktop / Laptop Only)          */
  /* ------------------------------------------------------------------ */
  const workGrid = document.getElementById('work-grid');
  const overlay  = document.getElementById('project-expanded-overlay');

  // Deep project data dictionary
  const projectsData = {
    meetingmind: {
      kicker: '01 / MEETINGS, MADE USEFUL',
      badge: 'PRODUCTION · AI WORKFLOWS',
      title: 'MeetingMind',
      tagline: 'A calmer way to turn conversations into structured summaries, action items, and transcripts.',
      theme: 'theme-featured',
      github: 'https://github.com/Sanket-Rotangar/MeetingMind',
      problem: 'Engineering syncs and client calls contain vital commitments that routinely get lost in unread recordings or scattered notes, leading to dropped tasks and manual transcription fatigue.',
      architecture: 'Architected across three independent client surfaces (Chrome Extension, Web app, React Native Mobile) backed by Python FastAPI services, Google OAuth2, Gmail/Calendar automation, and automated LLM summarization pipelines.',
      highlights: [
        'Zero-friction Google Calendar & Gmail API workflow automation',
        'Multi-format structured exports: Markdown, PDF, and actionable task lists',
        'Real-time low-latency transcript streaming with speaker identification'
      ],
      chips: ['Python', 'Node.js', 'Google APIs', 'FastAPI', 'Chrome Extension', 'RAG & LLMs'],
      mediaHtml: `
        <div class="preview-frame">
          <div class="preview-header">
            <div class="preview-dots"><span></span><span></span><span></span></div>
            <span>MeetingMind v1.4 · Real-Time Audio Engine</span>
          </div>
          <div class="waveform-container">
            <div class="waveform-bar"></div>
            <div class="waveform-bar"></div>
            <div class="waveform-bar"></div>
            <div class="waveform-bar"></div>
            <div class="waveform-bar"></div>
            <div class="waveform-bar"></div>
            <div class="waveform-bar"></div>
          </div>
          <div class="preview-snippet">
            <div class="preview-snippet-title">LIVE SPEECH RECOGNITION</div>
            <p style="margin:0;font-size:12px;opacity:0.9;"><strong>[Sanket R.]:</strong> "We fine-tuned the model with QLoRA to extract structured JSON schemas directly from meeting streams..."</p>
          </div>
          <div class="preview-items">
            <div class="preview-item"><span class="preview-item-check">✓</span><span>FastAPI summarization pipeline (99.2% extraction accuracy)</span></div>
            <div class="preview-item"><span class="preview-item-check">✓</span><span>Google Calendar sync: auto-invite note recipients</span></div>
            <div class="preview-item"><span class="preview-item-check">✓</span><span>Cross-platform: Web + Mobile + Chrome Extension</span></div>
          </div>
        </div>
      `
    },

    nightvigil: {
      kicker: '02 / PUBLIC SAFETY & PATROL ACCOUNTABILITY',
      badge: 'HACKATHON WINNER · POLICE DEPT',
      title: 'NightVigil',
      tagline: 'Smart patrolling verification designed around real on-ground accountability.',
      theme: 'theme-compact',
      github: 'https://github.com/Sanket-Rotangar/NightVigil-App',
      problem: 'Manual patrol logs and physical naka registers are vulnerable to spoofing, lack real-time supervisor verification, and make monitoring officer compliance in high-risk zones inefficient.',
      architecture: 'Engineered a mobile verification app integrating facial recognition models, tamper-resistant geofencing polygons, naka/patrol checkpoint assignment, and a real-time admin monitoring portal.',
      highlights: [
        '1st Place Winner at Goa Police Hackathon 2025 · Felicitated by DGP Alok Kumar',
        'Automated duty verification with high-accuracy biometric facial recognition',
        'Geofencing compliance tracker with dynamic credit ranking for police personnel'
      ],
      chips: ['Mobile', 'Geofencing', 'Computer Vision', 'Face Recognition', 'Admin Analytics', 'Python'],
      mediaHtml: `
        <div class="preview-frame">
          <div class="preview-header">
            <div class="preview-dots"><span></span><span></span><span></span></div>
            <span>NightVigil · Tactical Patrol Verification</span>
          </div>
          <div class="radar-box">
            <div class="radar-circle">
              <div class="radar-sweep"></div>
              <div class="radar-dot"></div>
            </div>
          </div>
          <div class="preview-snippet">
            <div class="preview-snippet-title">BIOMETRIC DUTY VERIFICATION</div>
            <div class="preview-items">
              <div class="preview-item"><span class="preview-item-check">✓</span><span>Biometric Match: <strong>99.4% Face Verification</strong></span></div>
              <div class="preview-item"><span class="preview-item-check">✓</span><span>Location: <strong>15.2993° N, 74.1240° E (Geofence Validated)</strong></span></div>
              <div class="preview-item"><span class="preview-item-check">★</span><span style="color:var(--lime);">Goa Police Hackathon Winner · DGP Commendation</span></div>
            </div>
          </div>
        </div>
      `
    },

    aeroconnect: {
      kicker: '03 / AIR, UNDERSTOOD · IOT & TELEMETRY',
      badge: 'IIT BOMBAY FINALIST · TOP 12 PAN-INDIA',
      title: 'AeroConnect',
      tagline: 'An IoT air-quality system for remote environments with live analytics and hybrid forecasting.',
      theme: 'theme-third',
      github: 'https://github.com/Sanket-Rotangar/AeroBackend',
      problem: 'Commercial air quality stations are cost-prohibitive, power-hungry, and fail in remote areas lacking cellular connectivity or reliable power grids.',
      architecture: 'Designed compact hardware sensor nodes communicating over a LoRa-based mesh architecture with MQTT protocol. Built real-time React WebSocket telemetry dashboards and hybrid gradient boosting ML models for predictive pollution forecasting.',
      highlights: [
        'Top 12 Finalist out of 312 teams Pan-India in eYantra (IIT Bombay)',
        'Ultra-reliable LoRa telemetry achieving 99.76% Packet Delivery Ratio (PDR)',
        'Co-authored peer-reviewed environmental IoT research paper',
        'Felicitated by Chief Minister Pramod Sawant at Converge 2.0'
      ],
      chips: ['MQTT', 'LoRa Mesh', 'React', 'ML Forecasting', 'WebSockets', 'Python'],
      mediaHtml: `
        <div class="preview-frame">
          <div class="preview-header">
            <div class="preview-dots"><span></span><span></span><span></span></div>
            <span>AeroConnect · Telemetry & Forecast Engine</span>
          </div>
          <div class="iot-stats-grid">
            <div class="iot-stat-card">
              <span class="iot-stat-val">42</span>
              <span class="iot-stat-label">AQI (Good)</span>
            </div>
            <div class="iot-stat-card">
              <span class="iot-stat-val">8.4</span>
              <span class="iot-stat-label">PM2.5 (µg/m³)</span>
            </div>
            <div class="iot-stat-card">
              <span class="iot-stat-val">99.8%</span>
              <span class="iot-stat-label">LoRa PDR</span>
            </div>
          </div>
          <div class="preview-snippet">
            <div class="preview-snippet-title">GRADIENT BOOSTING FORECAST</div>
            <div class="preview-items">
              <div class="preview-item"><span class="preview-item-check">✓</span><span>Hybrid forecasting model predicting AQI trends 12h ahead</span></div>
              <div class="preview-item"><span class="preview-item-check">✓</span><span>Low-power LoRa mesh operating in off-grid conditions</span></div>
              <div class="preview-item"><span class="preview-item-check">★</span><span style="color:var(--lime);">eYantra IIT Bombay Top 12 Pan-India</span></div>
            </div>
          </div>
        </div>
      `
    },

    pipingmto: {
      kicker: '04 / DRAWINGS TO DECISIONS · COMPUTER VISION',
      badge: 'COMPUTER VISION · AUTOMATION',
      title: 'Piping MTO Extraction',
      tagline: 'Turns piping isometric drawings into structured material take-offs, eliminating manual entry.',
      theme: 'theme-fourth',
      github: 'https://github.com/Sanket-Rotangar/AI-Piping-Isometric-to-MTO-Extraction-Tool',
      problem: 'Piping engineers spend hundreds of hours manually squinting at complex 2D isometric CAD drawings, counting weld symbols, pipe schedules, and flange classes into Excel spreadsheets.',
      architecture: 'Engineered an automated parsing engine using computer vision, custom geometric heuristic rules, and OCR to detect isometric lines, component blocks, weld tags, and extract structured Bill of Materials directly into database rows.',
      highlights: [
        'Eliminated over 90% of manual transcription time in industrial piping workflows',
        'Automated component identification: seamless pipes, weld necks, reducers, flanges',
        'High-precision dimension parsing and CSV/JSON export pipeline'
      ],
      chips: ['Python', 'OpenCV', 'Computer Vision', 'FastAPI', 'OCR', 'Full Stack'],
      mediaHtml: `
        <div class="preview-frame">
          <div class="preview-header">
            <div class="preview-dots"><span></span><span></span><span></span></div>
            <span>CAD Isometric Parser v2.1</span>
          </div>
          <div style="background:rgba(15,40,30,0.06);padding:10px;border-radius:8px;border:1px dashed rgba(15,40,30,0.2);">
            <table class="blueprint-table">
              <thead>
                <tr><th>Tag</th><th>Item Description</th><th>Qty</th><th>Status</th></tr>
              </thead>
              <tbody>
                <tr><td>W-01</td><td>4" CS Seamless Pipe A106-B</td><td>12.4m</td><td>✓ Parsed</td></tr>
                <tr><td>W-02</td><td>Cl 300 Weld Neck Flange RF</td><td>4 pcs</td><td>✓ Parsed</td></tr>
                <tr><td>W-03</td><td>90° Long Radius Elbow</td><td>6 pcs</td><td>✓ Parsed</td></tr>
              </tbody>
            </table>
          </div>
          <div class="preview-snippet">
            <div class="preview-snippet-title">EXTRACTION ACCURACY</div>
            <div class="preview-items">
              <div class="preview-item"><span class="preview-item-check">✓</span><span>100% automated MTO table generation from PDF/CAD</span></div>
              <div class="preview-item"><span class="preview-item-check">✓</span><span>Eliminates tedious manual human data entry error</span></div>
            </div>
          </div>
        </div>
      `
    }
  };

  if (workGrid && overlay) {
    const cards = workGrid.querySelectorAll('.project');
    const backBtn = document.getElementById('expanded-back-btn');
    const kickerEl = document.getElementById('expanded-kicker');
    const badgeEl = document.getElementById('expanded-badge');
    const titleEl = document.getElementById('expanded-title');
    const taglineEl = document.getElementById('expanded-tagline');
    const problemEl = document.getElementById('expanded-problem');
    const archEl = document.getElementById('expanded-architecture');
    const highlightsEl = document.getElementById('expanded-highlights');
    const chipsEl = document.getElementById('expanded-chips');
    const githubBtn = document.getElementById('expanded-github-btn');
    const mediaCol = document.getElementById('expanded-media-col');

    let activeCard = null;
    let startCoords = null;
    let isTransitioning = false;

    // Expand card handler
    function expandCard(card) {
      // Laptop/desktop screen check (>= 721px)
      if (window.innerWidth <= 720 || isTransitioning) return;

      const projectKey = card.dataset.project;
      const data = projectsData[projectKey];
      if (!data) return;

      isTransitioning = true;
      activeCard = card;

      // 1. Measure initial card bounding box relative to workGrid
      const gridRect = workGrid.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();

      startCoords = {
        left: cardRect.left - gridRect.left,
        top: cardRect.top - gridRect.top,
        width: cardRect.width,
        height: cardRect.height
      };

      // 2. Populate overlay content
      overlay.className = `project-expanded-overlay ${data.theme}`;
      if (kickerEl) kickerEl.textContent = data.kicker;
      if (badgeEl) badgeEl.textContent = data.badge;
      if (titleEl) titleEl.textContent = data.title;
      if (taglineEl) taglineEl.textContent = data.tagline;
      if (problemEl) problemEl.textContent = data.problem;
      if (archEl) archEl.textContent = data.architecture;
      if (githubBtn) githubBtn.href = data.github;

      if (highlightsEl) {
        highlightsEl.innerHTML = data.highlights.map(h => `<li>${h}</li>`).join('');
      }

      if (chipsEl) {
        chipsEl.innerHTML = data.chips.map(c => `<span>${c}</span>`).join('');
      }

      if (mediaCol) {
        mediaCol.innerHTML = data.mediaHtml;
      }

      // 3. Set overlay to exact starting card position (instant, no transition)
      overlay.style.transition = 'none';
      overlay.style.left = `${startCoords.left}px`;
      overlay.style.top = `${startCoords.top}px`;
      overlay.style.width = `${startCoords.width}px`;
      overlay.style.height = `${startCoords.height}px`;
      overlay.style.opacity = '1';
      overlay.style.visibility = 'visible';
      overlay.style.pointerEvents = 'all';
      overlay.setAttribute('aria-hidden', 'false');

      // 4. Trigger smooth FLIP morph expansion on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          overlay.style.transition = 'all 1.0s cubic-bezier(0.2, 0.9, 0.2, 1)';
          overlay.style.left = '0px';
          overlay.style.top = '0px';
          overlay.style.width = '100%';
          overlay.style.height = '100%';
          overlay.classList.add('is-expanded');
          workGrid.classList.add('has-expanded');

          setTimeout(() => {
            isTransitioning = false;
            if (backBtn) backBtn.focus();
          }, 1020);
        });
      });
    }

    // Collapse card handler
    function collapseCard() {
      if (!activeCard || isTransitioning) return;
      isTransitioning = true;

      // Re-measure in case layout adjusted slightly
      const gridRect = workGrid.getBoundingClientRect();
      const cardRect = activeCard.getBoundingClientRect();
      const returnCoords = {
        left: cardRect.left - gridRect.left,
        top: cardRect.top - gridRect.top,
        width: cardRect.width,
        height: cardRect.height
      };

      overlay.classList.remove('is-expanded');
      overlay.style.transition = 'all 0.85s cubic-bezier(0.2, 0.9, 0.2, 1)';
      overlay.style.left = `${returnCoords.left}px`;
      overlay.style.top = `${returnCoords.top}px`;
      overlay.style.width = `${returnCoords.width}px`;
      overlay.style.height = `${returnCoords.height}px`;
      overlay.style.opacity = '0';
      workGrid.classList.remove('has-expanded');

      setTimeout(() => {
        overlay.style.visibility = 'hidden';
        overlay.style.pointerEvents = 'none';
        overlay.setAttribute('aria-hidden', 'true');
        isTransitioning = false;
        if (activeCard) {
          activeCard.focus();
          activeCard = null;
        }
      }, 870);
    }

    // Attach listeners to cards
    cards.forEach((card) => {
      // Click on card body expands
      card.addEventListener('click', (e) => {
        // If the click originated on the arrow link, do not expand
        if (e.target.closest('.project-arrow')) return;
        expandCard(card);
      });

      // Keyboard support: Enter / Space expands
      card.addEventListener('keydown', (e) => {
        if (e.target.closest('.project-arrow')) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          expandCard(card);
        }
      });
    });

    // Arrow link buttons: ensure stopPropagation so card does not expand
    const arrowLinks = workGrid.querySelectorAll('.project-arrow');
    arrowLinks.forEach((arrow) => {
      arrow.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    });

    // Back button click collapses
    if (backBtn) {
      backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        collapseCard();
      });
    }

    // Escape key closes expanded view
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-expanded')) {
        collapseCard();
      }
    });

    // Handle window resize: if resized to mobile while expanded, close gracefully
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 720 && overlay.classList.contains('is-expanded')) {
        collapseCard();
      }
    });
  }

  /* ------------------------------------------------------------------ */
  /*  5. Hero Status Typewriter Effect                                  */
  /* ------------------------------------------------------------------ */
  const typewriterEl = document.getElementById('hero-typewriter');
  if (typewriterEl) {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const phrases = [
      "Available for select collaborations.",
      "Open to backend / AI engineering roles — Remote / Pune / Bangalore / Goa",
      "Engineering agentic AI pipelines & resilient backends.",
      "Fast learner, relentless builder, ready to ship."
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
  const resumeLinks = document.querySelectorAll('a[href="/resume"], [data-track*="resume"]');
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
