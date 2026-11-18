/* ==========================================================================
   SERVICES INTERACTIVE ENGINE
   Manages industry state, sample demo playback, leak calculator,
   "Which sounds like you?" drawer, Tuesday timeline, and lead form.
   Strict tone: calm, direct, honest. No hype words. Zero exclamation marks.
   ========================================================================== */

(function () {
  'use strict';

  /* --------------------------------------------------------------------------
     1. Industry Data Store (Single JS Object)
     -------------------------------------------------------------------------- */
  var INDUSTRY_DATA = {
    hotel: {
      id: 'hotel',
      name: 'Hotel',
      tag: 'Boutique hotels, resorts & guesthouses',
      systemPromise: 'No guest enquiry, late check-in, or special request falls through the cracks.',
      stack: {
        frontDesk: 'Answers room availability, parking, and late check-in questions 24/7 in the languages your guests use.',
        memory: 'Logs guest names, arrival times, room preferences, and booking channels in one tidy ledger.',
        brain: 'Answers staff and guests accurately using your hotel guest handbook, check-in policies, and rate cards.',
        hands: 'Dispatches arrival directions 24 hours prior and schedules housekeeping updates on checkout.'
      },
      calculatorDefaults: {
        enquiries: 75,
        missedPct: 22,
        avgValue: 180,
        adminHours: 14,
        hourlyRate: 25
      },
      demo: {
        clientName: 'Elena Rostova',
        channel: 'WhatsApp',
        time: '23:14',
        steps: [
          {
            sender: 'customer',
            text: 'Hello, we arrive around midnight tonight. Is front desk open, and can we park our car?',
            updateField: 'contact',
            crmValue: 'Elena Rostova · WhatsApp (+44 7911 204***)'
          },
          {
            sender: 'agent',
            text: 'Good evening Elena. Night check-in is staffed 24/7. Drive directly to Gate 2; parking is reserved under reservation #H-842. The gate code is 4821.',
            updateField: 'knowledge',
            crmValue: 'hotel_guest_handbook_v3.pdf (Section 4: Parking & Night Staff)'
          },
          {
            sender: 'customer',
            text: 'Thank you. Also, do you have gluten-free breakfast tomorrow morning?',
            updateField: 'request',
            crmValue: 'Midnight arrival · Gate 2 parking · Gluten-free breakfast'
          },
          {
            sender: 'agent',
            text: 'Yes, our kitchen serves gluten-free options from 07:00 to 10:30. I have recorded this note on your breakfast ticket.',
            updateField: 'status',
            crmValue: 'Active · Night duty notified · Kitchen slip queued'
          }
        ]
      },
      tuesday: [
        {
          time: '07:30',
          before: 'Front desk arrives to 18 unread WhatsApp messages from overnight travellers. 4 have already booked nearby rooms.',
          after: 'Front desk opens a clear log. All 18 overnight queries were answered accurately. 3 direct bookings were confirmed and filed.'
        },
        {
          time: '11:00',
          before: 'Housekeeping repeatedly calls the desk to verify late checkouts, delaying room cleaning for arriving guests.',
          after: 'Housekeeping checks real-time room status updates on their mobile view as guests confirm checkouts.'
        },
        {
          time: '15:30',
          before: 'Reception spends 90 minutes manually typing directions, gate codes, and parking rules to incoming arrivals.',
          after: 'Automated arrival guides dispatch 24 hours prior with turn-by-turn directions, gate code, and breakfast hours.'
        },
        {
          time: '19:30',
          before: 'Guests in the lobby wait while the sole receptionist handles repetitive phone calls about dining hours.',
          after: 'The front desk assistant handles phone queries quietly, allowing staff to give full attention to checking in guests.'
        },
        {
          time: '22:30',
          before: 'Owner takes the hotel phone to bed to answer late-night enquiries or risks losing hundreds in revenue.',
          after: 'Owner leaves the phone at work. The system handles late check-in queries and logs edge cases for morning review.'
        }
      ]
    },

    restaurant: {
      id: 'restaurant',
      name: 'Restaurant',
      tag: 'Bistros, dining rooms & busy cafes',
      systemPromise: 'No reservation call, dietary restriction, or group booking falls through the cracks.',
      stack: {
        frontDesk: 'Answers reservation requests, dietary questions, and private dining queries over phone and chat.',
        memory: 'Records table requests, repeat customer dining preferences, and cancellations in one clean ledger.',
        brain: 'Knows your current seasonal menu, allergy matrices, and corkage policy from your files.',
        hands: 'Sends booking confirmations, sends reminder 3 hours ahead to reduce no-shows, and updates the shift host.'
      },
      calculatorDefaults: {
        enquiries: 90,
        missedPct: 25,
        avgValue: 85,
        adminHours: 12,
        hourlyRate: 22
      },
      demo: {
        clientName: 'Marcus Vance',
        channel: 'Voice Call / WhatsApp',
        time: '18:42',
        steps: [
          {
            sender: 'customer',
            text: 'Hi, do you have a table for 4 this Friday at 8:00 PM? One guest has a severe peanut allergy.',
            updateField: 'contact',
            crmValue: 'Marcus Vance · Phone (+1 415 882 ****)'
          },
          {
            sender: 'agent',
            text: 'Good evening Marcus. We have a booth available at 8:15 PM this Friday. Our kitchen is peanut-free and our chef flags all allergy tickets in advance.',
            updateField: 'knowledge',
            crmValue: 'allergen_matrix_fall.pdf (Page 2: Kitchen Safety Policy)'
          },
          {
            sender: 'customer',
            text: '8:15 PM works well. Please confirm the table.',
            updateField: 'request',
            crmValue: 'Friday 8:15 PM · 4 guests (Booth) · Severe peanut allergy'
          },
          {
            sender: 'agent',
            text: 'Reserved for 4 guests this Friday at 8:15 PM. Confirmation sent to your phone with a link to amend if needed.',
            updateField: 'status',
            crmValue: 'Confirmed · Shift host sheet updated · Reminder queued'
          }
        ]
      },
      tuesday: [
        {
          time: '07:30',
          before: 'Manager sifts through voicemail recordings and Instagram DMs trying to reconstruct the reservation book.',
          after: 'The morning floor sheet is already populated. Late-night table requests were checked against capacity and recorded.'
        },
        {
          time: '11:00',
          before: 'Lunch rush starts. Phone rings 14 times while servers run plates. Callers hang up without booking.',
          after: 'Call assistant answers on the first ring, taking bookings and answering parking questions while servers focus on tables.'
        },
        {
          time: '15:30',
          before: 'Host spends two hours sending manual messages to tonight\'s 32 bookings to confirm attendance.',
          after: 'Automated 3-hour confirmations go out quietly. Cancellations are released to waitlisted guests automatically.'
        },
        {
          time: '19:30',
          before: 'A diner asks if the dressing has dairy. Server runs back and forth to the busy kitchen to ask the head chef.',
          after: 'Server checks the staff assistant on a phone in 5 seconds: "House dressing is dairy-free (Batch 18)".'
        },
        {
          time: '22:30',
          before: 'No-show rate hits 18% because there was no time to confirm bookings, leaving tables empty on a peak shift.',
          after: 'No-shows dropped because reminders went out on time. The evening shift summary is emailed to the owner.'
        }
      ]
    },

    supermarket: {
      id: 'supermarket',
      name: 'Supermarket',
      tag: 'Grocery stores, organic markets & regional retailers',
      systemPromise: 'No wholesale inquiry, customer delivery order, or supplier update falls through the cracks.',
      stack: {
        frontDesk: 'Answers stock inquiries, operating hours, delivery slots, and bulk order requests automatically.',
        memory: 'Logs customer bulk requests, item requests not in stock, and wholesale accounts in a clear ledger.',
        brain: 'Reads your product catalogue, weekly specials flyer, and supplier delivery schedules.',
        hands: 'Compiles out-of-stock customer requests for purchasing and prepares delivery dispatch manifests.'
      },
      calculatorDefaults: {
        enquiries: 120,
        missedPct: 18,
        avgValue: 65,
        adminHours: 18,
        hourlyRate: 20
      },
      demo: {
        clientName: 'Kavita Patel',
        channel: 'WhatsApp Business',
        time: '14:15',
        steps: [
          {
            sender: 'customer',
            text: 'Hello, do you have organic almond milk in stock, and do you deliver to Sector 4 today?',
            updateField: 'contact',
            crmValue: 'Kavita Patel · WhatsApp (+91 98201 *****)'
          },
          {
            sender: 'agent',
            text: 'Hello Kavita. Yes, we have two brands on shelf at $3.80 and $4.20. We deliver to Sector 4 between 16:00 and 19:00 for orders placed before 15:00.',
            updateField: 'knowledge',
            crmValue: 'inventory_daily_sync.csv & delivery_zones_rates.pdf'
          },
          {
            sender: 'customer',
            text: 'Please send 6 cartons of the $3.80 brand and 5kg whole wheat flour to 42 Orchard Lane.',
            updateField: 'request',
            crmValue: '6x Almond Milk ($3.80) · 1x 5kg Whole Wheat ($9.00) · 42 Orchard Lane'
          },
          {
            sender: 'agent',
            text: 'Recorded. Total is $31.80 including delivery. Your order is logged for today\'s 17:00 dispatch run. Invoice link prepared.',
            updateField: 'status',
            crmValue: 'Logged · Dispatch slip printed · Driver route assigned'
          }
        ]
      },
      tuesday: [
        {
          time: '07:30',
          before: 'Fresh produce crates arrive at the loading bay while the manager is stuck on phone answering customer questions about opening hours.',
          after: 'Manager inspects delivery crates. Front desk handles opening hour questions and weekly sale queries.'
        },
        {
          time: '11:00',
          before: 'Cashier leaves the register to walk down aisle 4 to check if a specific infant formula is in stock for a phone caller.',
          after: 'The system instantly confirms stock availability and shelf price for phone and chat callers from the daily catalog.'
        },
        {
          time: '15:30',
          before: 'Delivery orders taken across sticky notes and chat messages get mixed up, leading to wrong items delivered.',
          after: 'All phone and chat delivery orders are neatly structured in the Memory ledger and sorted by route.'
        },
        {
          time: '19:30',
          before: 'Evening checkout rush. Phone keeps ringing with customers asking if the deli counter is still open.',
          after: 'Callers get clear answers: "Deli counter closes at 20:00 tonight." Store floor remains orderly.'
        },
        {
          time: '22:30',
          before: 'Manager spends two hours after closing matching manual delivery chits to driver cash collected.',
          after: 'Daily delivery summary and pending tabs are already cross-referenced and waiting in the manager\'s inbox.'
        }
      ]
    },

    distributor: {
      id: 'distributor',
      name: 'Distributor',
      tag: 'B2B wholesalers, industrial suppliers & trade merchants',
      systemPromise: 'No purchase order, quote request, or credit-tier question falls through the cracks.',
      stack: {
        frontDesk: 'Captures purchase orders, verifies pricing tiers, and takes re-order requests 24 hours a day.',
        memory: 'Maintains company accounts, historical order cadence, tax numbers, and credit terms.',
        brain: 'References your wholesale price matrix, Minimum Order Quantities (MOQs), and delivery freight tables.',
        hands: 'Extracts purchase orders into invoices, alerts warehouse staff, and flags overdue balance notices.'
      },
      calculatorDefaults: {
        enquiries: 45,
        missedPct: 30,
        avgValue: 650,
        adminHours: 20,
        hourlyRate: 35
      },
      demo: {
        clientName: 'David Chen (Metro Supply Co.)',
        channel: 'Email / WhatsApp B2B',
        time: '16:05',
        steps: [
          {
            sender: 'customer',
            text: 'Hi, we need 50 units of part #ST-900 for delivery by Thursday. What is our tier price and do you have stock?',
            updateField: 'contact',
            crmValue: 'Metro Supply Co. · David Chen (Procurement)'
          },
          {
            sender: 'agent',
            text: 'Hello David. For Metro Supply Co., part #ST-900 is $44.50 per unit on Tier-2. We have 180 units in Central Warehouse. Thursday delivery is confirmed if ordered by 17:30.',
            updateField: 'knowledge',
            crmValue: 'client_tiers_2026.xlsx (Account ID: MS-402)'
          },
          {
            sender: 'customer',
            text: 'Approved. PO #99420 is issued. Bill to our standard net 30 account.',
            updateField: 'request',
            crmValue: '50x #ST-900 @ $44.50/ea ($2,225.00 total) · PO #99420 · Net 30'
          },
          {
            sender: 'agent',
            text: 'PO #99420 received and verified. Sales order #SO-3108 created for $2,225.00 net 30. Warehouse dispatch pick-list printed.',
            updateField: 'status',
            crmValue: 'Sales Order #SO-3108 logged · Pick list sent to warehouse'
          }
        ]
      },
      tuesday: [
        {
          time: '07:30',
          before: 'Inbox has 28 purchase order emails. Staff types numbers manually into accounting software. Typos in part codes happen weekly.',
          after: 'Orders arriving overnight are parsed. Item codes, quantities, and client price tiers are matched and drafted for approval.'
        },
        {
          time: '11:00',
          before: 'Contractors call demanding to know if specific inventory is in stock. Reps put callers on hold while running to warehouse.',
          after: 'Reps and clients query the stock assistant in seconds, getting accurate quantities and lead times instantly.'
        },
        {
          time: '15:30',
          before: 'Quotes requested by new prospective buyers sit in a draft folder because reps are busy packing orders.',
          after: 'Standard price tier quotations and catalog PDFs dispatch automatically within 90 seconds of enquiry.'
        },
        {
          time: '19:30',
          before: 'Warehouse shuts down without knowing tomorrow morning\'s delivery route schedule because paperwork is delayed.',
          after: 'Hands automation compiles tomorrow\'s manifest by 18:00 and sends driver route sheets to warehouse tablets.'
        },
        {
          time: '22:30',
          before: 'Business owner stays up reviewing outstanding invoices and copying ledger entries by hand into spreadsheets.',
          after: 'Owner checks a one-page summary on their phone. All accounts are reconciled and flagged follow-ups are queued.'
        }
      ]
    },

    new_business: {
      id: 'new_business',
      name: 'New business',
      tag: 'Consultancies, trade services, agencies & founders',
      systemPromise: 'No introductory lead, client questionnaire, or follow-up task falls through the cracks.',
      stack: {
        frontDesk: 'Greets inbound leads on your website and WhatsApp, answers FAQs, and books introductory calls.',
        memory: 'Keeps every prospect, conversation note, and proposal deadline in an organised simple ledger.',
        brain: 'Answers prospect questions accurately based on your service agreements, pricing sheets, and scope limits.',
        hands: 'Sends pre-call questionnaires, dispatches follow-up emails, and prepares receipts for your accountant.'
      },
      calculatorDefaults: {
        enquiries: 25,
        missedPct: 35,
        avgValue: 400,
        adminHours: 16,
        hourlyRate: 30
      },
      demo: {
        clientName: 'Sarah Jenkins',
        channel: 'Website Chat / WhatsApp',
        time: '19:10',
        steps: [
          {
            sender: 'customer',
            text: 'Hi, I need help setting up client intake for my new studio. Do you work with solo firms and what is the onboarding timeline?',
            updateField: 'contact',
            crmValue: 'Sarah Jenkins · Studio Director'
          },
          {
            sender: 'agent',
            text: 'Hello Sarah. Yes, we work directly with solo service businesses. Onboarding starts with a free 30-minute workflow check, followed by a 14-day pilot with one agreed metric. Would you like to check openings this week?',
            updateField: 'knowledge',
            crmValue: 'services_scope_2026.pdf (Section 1: Workflow Audits)'
          },
          {
            sender: 'customer',
            text: 'Yes please. Thursday afternoon would be ideal.',
            updateField: 'request',
            crmValue: 'Studio intake & onboarding setup · Prefers Thursday afternoon'
          },
          {
            sender: 'agent',
            text: 'Here are two openings: Thursday at 14:00 or Thursday at 16:30. Which suits your schedule better?',
            updateField: 'status',
            crmValue: 'Consultation held · Questionnaire link sent to prospect'
          }
        ]
      },
      tuesday: [
        {
          time: '07:30',
          before: 'You wake up feeling anxious about unanswered emails from potential clients who messaged last night while you slept.',
          after: 'You wake up to two pre-qualified consultation bookings added to your calendar with complete brief notes attached.'
        },
        {
          time: '11:00',
          before: 'You are in the middle of client work when a prospect calls. You answer, lose your train of thought, and take 40 minutes to resume.',
          after: 'Front desk handles the enquiry smoothly, collects their requirements, and lets you focus on billable work.'
        },
        {
          time: '15:30',
          before: 'You spend two hours retyping the same service scope and answers into five separate email threads.',
          after: 'Brain assistant drafts accurate, clear answers based on your service scope documents in seconds.'
        },
        {
          time: '19:30',
          before: 'You eat dinner while answering WhatsApp enquiries from people who end up not being a good fit.',
          after: 'Inbound leads are automatically filtered and answered based on your criteria before reaching your personal inbox.'
        },
        {
          time: '22:30',
          before: 'You spend another late evening copying client contact info into an Excel sheet that is already three weeks out of date.',
          after: 'Your Memory ledger is automatically current. You close your laptop at 18:00 and have your evening back.'
        }
      ]
    }
  };

  /* Active state */
  var currentIndustryKey = 'hotel';
  var demoRunning = false;
  var demoTimer = null;
  var demoCurrentStepIndex = 0;

  /* --------------------------------------------------------------------------
     2. Analytics Logger
     -------------------------------------------------------------------------- */
  function logEvent(name, detail) {
    var payload = {
      event: name,
      detail: detail || '',
      path: window.location.pathname,
      ts: new Date().toISOString()
    };
    try {
      var history = JSON.parse(localStorage.getItem('svc_events') || '[]');
      history.push(payload);
      localStorage.setItem('svc_events', JSON.stringify(history.slice(-50)));
    } catch (e) {
      /* Storage restricted; continue silently */
    }
    if (typeof window.gtag === 'function') {
      window.gtag('event', name, {
        event_category: 'services_landing',
        event_label: detail || ''
      });
    }
    if (window.console && window.console.log) {
      window.console.log('[Analytics]', payload);
    }
  }

  /* --------------------------------------------------------------------------
     3. "Which sounds like you?" Selection Logic
     -------------------------------------------------------------------------- */
  var SOUND_RESPONSES = {
    a: {
      kicker: 'Recommended starting point',
      text: 'You run operations from your phone and paper notes. Customer details live across chat threads. When things get busy, replies wait hours and follow-ups get forgotten. We connect your inbound messages to a simple ledger that logs every customer and alerts you only when human attention is needed.',
      ctaText: 'Book a workflow check for spreadsheet-first teams',
      ctaParam: 'run_on_whatsapp_excel'
    },
    b: {
      kicker: 'System audit',
      text: 'You pay monthly subscriptions for tools your staff dislikes or only partially uses. Data still gets copied by hand, and reports do not reflect the ground reality. We do not replace your core tools; we bridge them so data moves itself without manual entry.',
      ctaText: 'Book a workflow check to audit your current stack',
      ctaParam: 'software_not_helping'
    },
    c: {
      kicker: 'Diagnostic check',
      text: 'You know manual tasks slow you down, but you do not know which workflow to fix first or what is realistic. In our 30-minute check, we review your typical workday, measure where hours leak, and pick one single task with the clearest return.',
      ctaText: 'Book a 30-min diagnostic call',
      ctaParam: 'not_sure_where_to_start'
    },
    d: {
      kicker: 'Capacity build',
      text: 'Inquiries and customer orders are climbing, but hiring additional admin staff just to handle repetitive intake is slow and expensive. We give your current team the capacity to handle double the volume without evening overtime or dropped orders.',
      ctaText: 'Book a workflow check for growth',
      ctaParam: 'want_to_grow_faster'
    }
  };

  function initSoundCards() {
    var cards = document.querySelectorAll('.svc-sound-card');
    var responseBox = document.getElementById('svc-sound-response');
    var kickerEl = document.getElementById('svc-sound-kicker');
    var textEl = document.getElementById('svc-sound-text');
    var ctaEl = document.getElementById('svc-sound-cta');

    if (!cards.length || !responseBox) {
      return;
    }

    cards.forEach(function (card) {
      card.addEventListener('click', function () {
        var key = card.getAttribute('data-sound-key');
        var data = SOUND_RESPONSES[key];
        if (!data) {
          return;
        }

        cards.forEach(function (c) {
          c.setAttribute('aria-selected', 'false');
        });
        card.setAttribute('aria-selected', 'true');

        if (kickerEl) {
          kickerEl.textContent = data.kicker;
        }
        if (textEl) {
          textEl.textContent = data.text;
        }
        if (ctaEl) {
          ctaEl.textContent = data.ctaText;
          ctaEl.setAttribute('data-sound-choice', data.ctaParam);
        }

        responseBox.style.display = 'flex';
        logEvent('sound_card_selected', key);

        /* Smooth scroll to response on mobile */
        if (window.innerWidth < 768) {
          responseBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      });
    });
  }

  /* --------------------------------------------------------------------------
     4. Industry Switcher Logic
     -------------------------------------------------------------------------- */
  function switchIndustry(key) {
    var data = INDUSTRY_DATA[key];
    if (!data) {
      return;
    }
    currentIndustryKey = key;

    /* Update Tab UI */
    var tabs = document.querySelectorAll('.svc-industry-pill, .svc-industry-tab');
    tabs.forEach(function (tab) {
      var isTarget = tab.getAttribute('data-industry') === key;
      tab.setAttribute('aria-selected', isTarget ? 'true' : 'false');
    });

    /* Update Industry Tags & Labels */
    var tagEls = document.querySelectorAll('.svc-current-industry-tag');
    tagEls.forEach(function (el) {
      el.textContent = data.tag;
    });

    var nameEls = document.querySelectorAll('.svc-current-industry-name');
    nameEls.forEach(function (el) {
      el.textContent = data.name;
    });

    /* Update Hero System Stack */
    var heroPromise = document.getElementById('svc-hero-promise');
    if (heroPromise) {
      heroPromise.textContent = data.systemPromise;
    }
    var stackFront = document.getElementById('svc-stack-front');
    if (stackFront) {
      stackFront.textContent = data.stack.frontDesk;
    }
    var stackMemory = document.getElementById('svc-stack-memory');
    if (stackMemory) {
      stackMemory.textContent = data.stack.memory;
    }
    var stackBrain = document.getElementById('svc-stack-brain');
    if (stackBrain) {
      stackBrain.textContent = data.stack.brain;
    }
    var stackHands = document.getElementById('svc-stack-hands');
    if (stackHands) {
      stackHands.textContent = data.stack.hands;
    }

    /* Update Calculator Defaults */
    var calc = data.calculatorDefaults;
    setCalcInputValue('calc-enquiries', calc.enquiries);
    setCalcInputValue('calc-missed', calc.missedPct);
    setCalcInputValue('calc-value', calc.avgValue);
    setCalcInputValue('calc-admin', calc.adminHours);
    setCalcInputValue('calc-rate', calc.hourlyRate);
    recalculateLeaks();

    /* Update Tuesday Timeline */
    renderTuesdayTimeline(data.tuesday);

    /* Reset and Mount Demo */
    resetDemo(key);

    logEvent('industry_selected', key);
  }

  function setCalcInputValue(id, val) {
    var input = document.getElementById(id);
    var range = document.getElementById(id + '-range');
    if (input) {
      input.value = val;
    }
    if (range) {
      range.value = val;
    }
  }

  function initIndustrySwitcher() {
    var tabs = document.querySelectorAll('.svc-industry-pill, .svc-industry-tab');
    tabs.forEach(function (tab) {
      tab.addEventListener('click', function () {
        var key = tab.getAttribute('data-industry');
        switchIndustry(key);
      });
    });
  }

  /* --------------------------------------------------------------------------
     5. Interactive Sample Demo
     -------------------------------------------------------------------------- */
  function resetDemo(key) {
    if (demoTimer) {
      clearTimeout(demoTimer);
      demoTimer = null;
    }
    demoRunning = false;
    demoCurrentStepIndex = 0;

    var data = INDUSTRY_DATA[key];
    var stream = document.getElementById('svc-chat-stream');
    var playBtn = document.getElementById('svc-demo-play-btn');
    var clientNameEl = document.getElementById('svc-demo-client-name');
    var channelEl = document.getElementById('svc-demo-channel');
    var ticketIdEl = document.getElementById('svc-crm-ticket-id');

    if (clientNameEl) {
      clientNameEl.textContent = data.demo.clientName;
    }
    if (channelEl) {
      channelEl.textContent = data.demo.channel + ' · ' + data.demo.time;
    }
    if (ticketIdEl) {
      ticketIdEl.textContent = '#TICK-' + key.toUpperCase().substring(0, 3) + '-042';
    }

    if (stream) {
      stream.innerHTML = '';
    }

    /* Clear CRM fields */
    setCRMField('crm-contact', 'Waiting for enquiry...', true);
    setCRMField('crm-knowledge', 'No document referenced yet', true);
    setCRMField('crm-request', 'Pending details...', true);
    setCRMField('crm-status', 'Idle · Monitoring channel', true);

    if (playBtn) {
      playBtn.textContent = 'Play demo';
    }
  }

  function setCRMField(id, text, isMuted) {
    var el = document.getElementById(id);
    if (!el) {
      return;
    }
    el.textContent = text;
    var row = el.closest('.svc-crm-row');
    if (row) {
      if (isMuted) {
        row.classList.remove('is-updated');
        el.classList.add('svc-crm-val-empty');
      } else {
        row.classList.add('is-updated');
        el.classList.remove('svc-crm-val-empty');
      }
    }
  }

  function playNextDemoStep() {
    var data = INDUSTRY_DATA[currentIndustryKey];
    var steps = data.demo.steps;
    var stream = document.getElementById('svc-chat-stream');
    var playBtn = document.getElementById('svc-demo-play-btn');

    if (!stream || demoCurrentStepIndex >= steps.length) {
      demoRunning = false;
      if (playBtn) {
        playBtn.textContent = 'Replay sample demo';
      }
      return;
    }

    var step = steps[demoCurrentStepIndex];

    /* If agent reply, show typing indicator first */
    if (step.sender === 'agent') {
      var typingEl = document.createElement('div');
      typingEl.className = 'svc-typing';
      typingEl.id = 'svc-typing-indicator';
      typingEl.innerHTML = '<span class="svc-typing-dot"></span><span class="svc-typing-dot"></span><span class="svc-typing-dot"></span><span style="margin-left:4px;">Checking business documents...</span>';
      stream.appendChild(typingEl);
      stream.scrollTop = stream.scrollHeight;

      demoTimer = setTimeout(function () {
        var existingTyping = document.getElementById('svc-typing-indicator');
        if (existingTyping) {
          existingTyping.remove();
        }
        appendMessage(step);
        updateCRMFromStep(step);
        demoCurrentStepIndex += 1;
        scheduleNextStep();
      }, 900);
    } else {
      appendMessage(step);
      updateCRMFromStep(step);
      demoCurrentStepIndex += 1;
      scheduleNextStep();
    }
  }

  function scheduleNextStep() {
    var data = INDUSTRY_DATA[currentIndustryKey];
    if (demoCurrentStepIndex < data.demo.steps.length && demoRunning) {
      demoTimer = setTimeout(playNextDemoStep, 1500);
    } else if (demoCurrentStepIndex >= data.demo.steps.length) {
      demoRunning = false;
      var playBtn = document.getElementById('svc-demo-play-btn');
      if (playBtn) {
        playBtn.textContent = 'Replay sample demo';
      }
    }
  }

  function appendMessage(step) {
    var stream = document.getElementById('svc-chat-stream');
    if (!stream) {
      return;
    }

    var msgDiv = document.createElement('div');
    msgDiv.className = 'svc-msg ' + (step.sender === 'agent' ? 'svc-msg-agent' : 'svc-msg-customer');

    var senderDiv = document.createElement('div');
    senderDiv.className = 'svc-msg-sender';
    senderDiv.textContent = step.sender === 'agent' ? 'Front Desk System' : 'Customer';

    var textDiv = document.createElement('div');
    textDiv.textContent = step.text;

    msgDiv.appendChild(senderDiv);
    msgDiv.appendChild(textDiv);
    stream.appendChild(msgDiv);
    stream.scrollTop = stream.scrollHeight;
  }

  function updateCRMFromStep(step) {
    if (step.updateField === 'contact') {
      setCRMField('crm-contact', step.crmValue, false);
    } else if (step.updateField === 'knowledge') {
      setCRMField('crm-knowledge', step.crmValue, false);
    } else if (step.updateField === 'request') {
      setCRMField('crm-request', step.crmValue, false);
    } else if (step.updateField === 'status') {
      setCRMField('crm-status', step.crmValue, false);
    }
  }

  function initDemo() {
    var playBtn = document.getElementById('svc-demo-play-btn');
    var resetBtn = document.getElementById('svc-demo-reset-btn');

    if (playBtn) {
      playBtn.addEventListener('click', function () {
        logEvent('demo_started', currentIndustryKey);
        if (demoRunning) {
          clearTimeout(demoTimer);
          demoRunning = false;
          playBtn.textContent = 'Resume demo';
          return;
        }

        var data = INDUSTRY_DATA[currentIndustryKey];
        if (demoCurrentStepIndex >= data.demo.steps.length) {
          resetDemo(currentIndustryKey);
        }

        demoRunning = true;
        playBtn.textContent = 'Pause demo';
        playNextDemoStep();
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', function () {
        resetDemo(currentIndustryKey);
      });
    }

    /* Mount initial hotel demo state */
    resetDemo('hotel');
  }

  /* --------------------------------------------------------------------------
     6. Leak Calculator Logic
     -------------------------------------------------------------------------- */
  function recalculateLeaks() {
    var enquiriesInput = document.getElementById('calc-enquiries');
    var missedInput = document.getElementById('calc-missed');
    var valueInput = document.getElementById('calc-value');
    var adminInput = document.getElementById('calc-admin');
    var rateInput = document.getElementById('calc-rate');

    if (!enquiriesInput || !missedInput || !valueInput || !adminInput || !rateInput) {
      return;
    }

    var enquiries = parseFloat(enquiriesInput.value) || 0;
    var missedPct = parseFloat(missedInput.value) || 0;
    var avgValue = parseFloat(valueInput.value) || 0;
    var adminHours = parseFloat(adminInput.value) || 0;
    var hourlyRate = parseFloat(rateInput.value) || 0;

    /* Update slider numerical badges */
    updateBadge('calc-enquiries-val', Math.round(enquiries) + ' enquiries/wk');
    updateBadge('calc-missed-val', Math.round(missedPct) + '%');
    updateBadge('calc-value-val', '$' + Math.round(avgValue));
    updateBadge('calc-admin-val', Math.round(adminHours) + ' hrs/wk');
    updateBadge('calc-rate-val', '$' + Math.round(hourlyRate) + '/hr');

    /* Formula:
       Missed monthly enquiries = Weekly enquiries * (missed% / 100) * 4.33
       Estimated monthly sales leak = Missed monthly enquiries * Average customer value * 0.25 (modest close rate)
       Monthly admin hours leak = Weekly admin hours * 4.33
       Monthly payroll leak = Monthly admin hours * Hourly rate
       Total leak = Sales leak + Payroll leak
    */
    var monthlyMissed = enquiries * (missedPct / 100) * 4.33;
    var monthlySalesLeak = Math.round(monthlyMissed * avgValue * 0.25);
    var monthlyAdminHours = Math.round(adminHours * 4.33);
    var monthlyPayrollLeak = Math.round(monthlyAdminHours * hourlyRate);
    var totalLeakMoney = monthlySalesLeak + monthlyPayrollLeak;

    /* Populate receipt DOM */
    var leakMoneyEl = document.getElementById('calc-out-money');
    var leakHoursEl = document.getElementById('calc-out-hours');
    var formulaEnquiriesEl = document.getElementById('calc-f-enquiries');
    var formulaSalesEl = document.getElementById('calc-f-sales');
    var formulaPayrollEl = document.getElementById('calc-f-payroll');

    if (leakMoneyEl) {
      leakMoneyEl.textContent = '$' + totalLeakMoney.toLocaleString('en-US');
    }
    if (leakHoursEl) {
      leakHoursEl.textContent = monthlyAdminHours + ' hrs';
    }
    if (formulaEnquiriesEl) {
      formulaEnquiriesEl.textContent = Math.round(monthlyMissed) + ' enquiries missed or delayed per month';
    }
    if (formulaSalesEl) {
      formulaSalesEl.textContent = '$' + monthlySalesLeak.toLocaleString('en-US') + ' estimated lost revenue (at 25% close rate)';
    }
    if (formulaPayrollEl) {
      formulaPayrollEl.textContent = '$' + monthlyPayrollLeak.toLocaleString('en-US') + ' paid for repetitive manual tasks';
    }
  }

  function updateBadge(id, text) {
    var el = document.getElementById(id);
    if (el) {
      el.textContent = text;
    }
  }

  function bindSyncSlider(inputId, rangeId) {
    var input = document.getElementById(inputId);
    var range = document.getElementById(rangeId);
    if (!input || !range) {
      return;
    }

    range.addEventListener('input', function () {
      input.value = range.value;
      recalculateLeaks();
      logEvent('calc_used', inputId);
    });

    input.addEventListener('input', function () {
      range.value = input.value;
      recalculateLeaks();
      logEvent('calc_used', inputId);
    });
  }

  function initCalculator() {
    bindSyncSlider('calc-enquiries', 'calc-enquiries-range');
    bindSyncSlider('calc-missed', 'calc-missed-range');
    bindSyncSlider('calc-admin', 'calc-admin-range');

    var valInput = document.getElementById('calc-value');
    if (valInput) {
      valInput.addEventListener('input', function () {
        recalculateLeaks();
        logEvent('calc_used', 'calc-value');
      });
    }

    var rateInput = document.getElementById('calc-rate');
    if (rateInput) {
      rateInput.addEventListener('input', function () {
        recalculateLeaks();
        logEvent('calc_used', 'calc-rate');
      });
    }

    recalculateLeaks();
  }

  /* --------------------------------------------------------------------------
     7. Tuesday Timeline Render
     -------------------------------------------------------------------------- */
  function renderTuesdayTimeline(entries) {
    var container = document.getElementById('svc-tuesday-timeline');
    if (!container || !entries || !entries.length) {
      return;
    }

    container.innerHTML = '';

    entries.forEach(function (row) {
      var rowDiv = document.createElement('div');
      rowDiv.className = 'svc-timeline-row';

      /* Time column */
      var timeCol = document.createElement('div');
      timeCol.className = 'svc-timeline-time';
      timeCol.innerHTML = '<span>' + row.time + '</span>';

      /* Before column */
      var beforeCol = document.createElement('div');
      beforeCol.className = 'svc-timeline-col';
      beforeCol.innerHTML = '<div class="svc-timeline-col-head before">Without the system</div><p>' + row.before + '</p>';

      /* After column */
      var afterCol = document.createElement('div');
      afterCol.className = 'svc-timeline-col';
      afterCol.innerHTML = '<div class="svc-timeline-col-head after">With the system</div><p>' + row.after + '</p>';

      rowDiv.appendChild(timeCol);
      rowDiv.appendChild(beforeCol);
      rowDiv.appendChild(afterCol);
      container.appendChild(rowDiv);
    });
  }

  /* --------------------------------------------------------------------------
     9. Contact & Booking Form Handling (/api/lead stub with graceful fallback)
     -------------------------------------------------------------------------- */
  function initBookingForm() {
    var form = document.getElementById('svc-lead-form');
    var statusEl = document.getElementById('svc-form-status');
    var submitBtn = document.getElementById('svc-form-submit');

    if (!form) {
      return;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      logEvent('cta_book', 'form_submit_start');

      var nameInput = form.elements['name'];
      var businessInput = form.elements['business_type'];
      var headacheInput = form.elements['headache'];
      var prefInput = form.querySelector('input[name="contact_pref"]:checked');
      var contactInput = form.elements['contact_details'];
      var turnstileInput = form.querySelector('input[name="cf-turnstile-response"]');

      var nameVal = (nameInput ? nameInput.value : '').trim();
      var businessVal = businessInput ? businessInput.value : 'General';
      var headacheVal = (headacheInput ? headacheInput.value : '').trim();
      var prefVal = prefInput ? prefInput.value : 'WhatsApp';
      var contactVal = (contactInput ? contactInput.value : '').trim();
      var turnstileToken = turnstileInput ? turnstileInput.value : '';

      /* Validation */
      if (!nameVal || !headacheVal || !contactVal) {
        showStatus('Please fill in your name, biggest headache, and contact details.', 'is-error');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending request...';
      }

      var payload = {
        name: nameVal,
        business_type: businessVal,
        headache: headacheVal,
        contact_preference: prefVal,
        contact_details: contactVal,
        token: turnstileToken,
        industry_context: currentIndustryKey,
        ts: new Date().toISOString()
      };

      /* Post to /api/lead */
      fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(function (res) {
        if (res.ok) {
          return res.json();
        }
        throw new Error('Server returned ' + res.status);
      })
      .then(function (data) {
        showStatus('Request received. We will review your workflow and reply within [RESPONSE TIME — e.g. 1 business day].', 'is-success');
        form.reset();
        logEvent('cta_book', 'form_success');
        if (submitBtn) {
          submitBtn.textContent = 'Request sent';
        }
      })
      .catch(function (err) {
        /* Graceful fallback: construct direct mailto and WhatsApp options */
        var mailSubject = encodeURIComponent('Workflow Check Request: ' + nameVal);
        var mailBody = encodeURIComponent(
          'Name: ' + nameVal + '\n' +
          'Business: ' + businessVal + '\n' +
          'Preferred contact: ' + prefVal + ' (' + contactVal + ')\n' +
          'Biggest headache:\n' + headacheVal
        );
        var fallbackMailto = 'mailto:[EMAIL — e.g. sanketrotangar04@gmail.com]?subject=' + mailSubject + '&body=' + mailBody;

        showStatus(
          'Server endpoint is in preview mode. Your message is ready to send directly: ' +
          '<a href="' + fallbackMailto + '" class="svc-email" style="font-weight:700;margin-left:4px;">Open email draft</a> or use the WhatsApp button below.',
          'is-error'
        );
        logEvent('cta_book', 'form_fallback');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Send via email draft';
          submitBtn.onclick = function () {
            window.location.href = fallbackMailto;
          };
        }
      });
    });

    function showStatus(html, statusClass) {
      if (!statusEl) {
        return;
      }
      statusEl.innerHTML = html;
      statusEl.className = 'svc-form-status is-active ' + statusClass;
    }
  }

  /* --------------------------------------------------------------------------
     10. Click tracking & Initialization
     -------------------------------------------------------------------------- */
  document.addEventListener('click', function (e) {
    var target = e.target.closest('[data-track]');
    if (target) {
      var trackName = target.getAttribute('data-track');
      var trackDetail = target.getAttribute('data-track-detail') || target.textContent.trim().substring(0, 30);
      logEvent(trackName, trackDetail);
    }
  });

  /* Boot on DOM load */
  document.addEventListener('DOMContentLoaded', function () {
    initSoundCards();
    initIndustrySwitcher();
    initDemo();
    initCalculator();
    initBookingForm();

    /* Render default hotel timeline */
    renderTuesdayTimeline(INDUSTRY_DATA.hotel.tuesday);
  });

})();
