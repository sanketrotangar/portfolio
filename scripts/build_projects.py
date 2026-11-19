import json
import os
import re

def build():
    with open("data/projects.json") as f:
        projects = json.load(f)

    build_warnings = []

    # Validate missing fields
    for p in projects:
        slug = p["slug"]
        title = p["title"]
        d = p.get("detail", {})
        
        # Check title / working title
        if "[TBD" in p.get("working_title", ""):
            build_warnings.append(f"[{slug}] Working title pending: {p['working_title']}")
        if not d.get("problem"):
            build_warnings.append(f"[{slug}] Missing 'detail.problem'")
        if not d.get("role"):
            build_warnings.append(f"[{slug}] Missing 'detail.role'")
        if not d.get("timeframe"):
            build_warnings.append(f"[{slug}] Missing 'detail.timeframe'")
        if not p.get("stack"):
            build_warnings.append(f"[{slug}] Missing 'stack'")
        if not p.get("links", {}).get("github"):
            build_warnings.append(f"[{slug}] Missing 'links.github' (hidden per rule)")
        if not p.get("links", {}).get("live"):
            build_warnings.append(f"[{slug}] Missing 'links.live' (hidden per rule)")
        if not d.get("decisions"):
            build_warnings.append(f"[{slug}] Missing 'detail.decisions'")
        if not d.get("outcomes"):
            build_warnings.append(f"[{slug}] Missing 'detail.outcomes'")
        
        # Check diagram
        card_svg_path = f"public/diagrams/{slug}.card.svg"
        if not os.path.exists(card_svg_path) or "BUILD WARNING" in open(card_svg_path).read():
            build_warnings.append(f"[{slug}] Diagram missing / placeholder used for card SVG")

    print(f"=== BUILD TIME WARNINGS ({len(build_warnings)} warnings) ===")
    for w in build_warnings:
        print(f"  * {w}")

    # Build List Section HTML
    featured_projects = [p for p in projects if p.get("featured", True)]
    more_projects = [p for p in projects if not p.get("featured", True)]

    cards_html = []
    for p in featured_projects:
        slug = p["slug"]
        idx = p["index"]
        label = p["label"]
        title = p["title"]
        oneLiner = p["oneLiner"]
        outcome = p["outcome"]
        stack = p["stack"]
        status = p["status"]
        status_raw = p.get("status_raw", "In build")

        # Read inline card SVG
        card_svg_file = f"public/diagrams/{slug}.card.svg"
        if os.path.exists(card_svg_file):
            with open(card_svg_file) as f:
                card_svg = f.read().strip()
        else:
            card_svg = f'<div class="diagram-placeholder"><span class="badge-todo">TODO: Diagram Pending</span></div>'

        stack_chips = "".join([f'<span class="project-chip">{item}</span>' for item in stack])
        if not stack:
            stack_chips = '<span class="project-chip chip--warning">TODO: Stack Pending</span>'

        status_badge = f'<span class="project-status-badge">{status_raw}</span>' if status == "in-progress" else ''
        
        outcome_html = f'''<p class="project-card-outcome">
          <span class="project-card-outcome-dot" aria-hidden="true"></span>
          <span>{outcome}</span>
        </p>'''

        card_html = f'''
        <a href="/projects/{slug}/" class="project-card project-reveal" aria-label="View {title} project details">
          <span class="project-card-arrow" aria-hidden="true">↗</span>
          <div class="project-card-info">
            <div>
              <div class="project-card-tagline">
                <span class="project-card-mono">{idx} / {label}</span>
                {status_badge}
              </div>
              <h3 class="project-card-title">{title}</h3>
              <p class="project-card-oneliner">{oneLiner}</p>
            </div>
            {outcome_html}
            <div class="project-card-stack" aria-label="Technology stack">
              {stack_chips}
            </div>
          </div>
          <div class="project-card-diagram" aria-label="{title} flow diagram">
            {card_svg}
          </div>
        </a>'''
        cards_html.append(card_html)

    # Build More Projects HTML
    more_rows_html = []
    for p in more_projects:
        slug = p["slug"]
        idx = p["index"]
        label = p["label"]
        title = p["title"]
        oneLiner = p["oneLiner"]
        status_raw = p.get("status_raw", "TBD")
        row = f'''
        <a href="/projects/{slug}/" class="more-project-row">
          <div class="more-project-left">
            <span class="more-project-tag">{idx} / {label}</span>
            <span class="more-project-title">{title}</span>
            <span class="more-project-desc">{oneLiner}</span>
          </div>
          <div class="more-project-right">
            <span class="project-status-badge">{status_raw}</span>
            <span class="more-project-arrow">↗</span>
          </div>
        </a>'''
        more_rows_html.append(row)

    more_section_html = ""
    if more_rows_html:
        more_section_html = f'''
        <div class="more-projects-section">
          <h3 class="more-projects-title">Additional Works &amp; Assessments</h3>
          <div class="more-projects-list">
            {"".join(more_rows_html)}
          </div>
        </div>'''

    new_projects_section = f'''
      <section class="section" id="projects">
        <div class="section-header">
          <div>
            <p class="section-kicker">Projects</p>
            <h2 class="section-title">Selected builds.</h2>
          </div>
          <p class="section-note">Permission-aware agents, real-time voice systems, and backend pipelines built for production.</p>
        </div>
        <div class="projects-list">
          {"".join(cards_html)}
        </div>
        {more_section_html}
      </section>'''

    # Update index.html
    with open("index.html") as f:
        index_html = f.read()

    # Replace old #work section
    work_pattern = re.compile(r'<section class="section" id="work">.*?</section>', re.DOTALL)
    if work_pattern.search(index_html):
        index_html = work_pattern.sub(new_projects_section, index_html)
    else:
        # maybe already id="projects"
        projects_pattern = re.compile(r'<section class="section" id="projects">.*?</section>', re.DOTALL)
        if projects_pattern.search(index_html):
            index_html = projects_pattern.sub(new_projects_section, index_html)

    # Update nav links in index.html to #projects
    index_html = index_html.replace('href="#work"', 'href="#projects"')

    with open("index.html", "w") as f:
        f.write(index_html)
    print("Updated index.html projects section.")

    # Generate Detail Pages
    for i, p in enumerate(projects):
        slug = p["slug"]
        title = p["title"]
        oneLiner = p["oneLiner"]
        idx = p["index"]
        label = p["label"]
        stack = p["stack"]
        status = p["status"]
        status_raw = p.get("status_raw", "In build")
        links = p.get("links", {})
        d = p.get("detail", {})

        # Next project link
        next_proj = projects[(i + 1) % len(projects)]
        next_slug = next_proj["slug"]
        next_title = next_proj["title"]

        # Detail SVG
        detail_svg_file = f"public/diagrams/{slug}.detail.svg"
        if os.path.exists(detail_svg_file):
            with open(detail_svg_file) as f:
                detail_svg = f.read().strip()
        else:
            detail_svg = f'<div class="diagram-placeholder"><span class="badge-todo">TODO: Architecture Diagram Pending</span></div>'

        # Meta row elements
        role_val = d.get("role") or '<span class="badge-todo">TODO: Role not specified in source</span>'
        timeframe_val = d.get("timeframe") or '<span class="badge-todo">TODO: Timeframe not specified in source</span>'
        
        stack_chips = "".join([f'<span class="project-chip">{item}</span>' for item in stack])
        if not stack:
            stack_chips = '<span class="badge-todo">TODO: Stack specification pending</span>'

        # Links (Rule 5: if repo_url or demo_url is empty, hide button)
        links_html = []
        if links.get("github"):
            links_html.append(f'<a href="{links["github"]}" target="_blank" rel="noreferrer" class="btn-detail-link">GitHub <span>↗</span></a>')
        if links.get("live"):
            links_html.append(f'<a href="{links["live"]}" target="_blank" rel="noreferrer" class="btn-detail-link btn-detail-link--accent">Live Demo <span>↗</span></a>')
        if not links_html:
            links_html.append('<span class="meta-note-dimmed">Links hidden: Repo and demo URLs pending publication</span>')
        links_rendered = "".join(links_html)

        # 1. Problem
        problem_val = d.get("problem")
        if problem_val:
            problem_html = f'<p class="detail-body-text">{problem_val}</p>'
        else:
            problem_html = '<div class="warning-box"><strong>BUILD WARNING · MISSING FIELD</strong><p>Problem statement not yet written in portfolio-projects.md. TODO: draft in owner\'s words.</p></div>'

        # How it works (if present)
        how_it_works_items = d.get("how_it_works", [])
        how_html = ""
        if how_it_works_items:
            how_list = "".join([f'<li>{item}</li>' for item in how_it_works_items])
            how_html = f'''
            <div class="how-it-works-block">
              <h4>How it works</h4>
              <ul class="detail-bullet-list">
                {how_list}
              </ul>
            </div>'''

        # 2. Architecture
        arch_html = f'''
        <div class="architecture-diagram-wrapper">
          {detail_svg}
        </div>'''

        # 3. Key Decisions
        decisions = d.get("decisions", [])
        if decisions:
            decision_cards = []
            for dec in decisions:
                c_html = f'''
                <div class="decision-card">
                  <div class="decision-header">
                    <span class="decision-choice-label">Decision</span>
                    <h4 class="decision-choice">{dec["choice"]}</h4>
                  </div>
                  <div class="decision-body">
                    <div class="decision-why">
                      <strong>Why:</strong> {dec["why"]}
                    </div>
                    <div class="decision-rejected">
                      <strong>Rejected alternative:</strong> {dec["rejected"]}
                    </div>
                  </div>
                </div>'''
                decision_cards.append(c_html)
            decisions_html = f'<div class="decisions-grid">{"".join(decision_cards)}</div>'
        else:
            decisions_html = '<div class="warning-box"><strong>BUILD WARNING · MISSING FIELD</strong><p>Key decisions not yet drafted in portfolio-projects.md. TODO: document architectural trade-offs.</p></div>'

        # Differentiators
        diffs = d.get("differentiators", [])
        diffs_html = ""
        if diffs:
            d_list = "".join([f'<li>{item}</li>' for item in diffs])
            diffs_html = f'''
            <div class="diff-block">
              <h4>What sets it apart</h4>
              <ul class="detail-bullet-list">
                {d_list}
              </ul>
            </div>'''

        # 4. Outcomes (Measured only vs design targets)
        outcomes = d.get("outcomes", [])
        if outcomes:
            rows = []
            for out in outcomes:
                is_target = out.get("isTarget", False)
                tag_badge = '<span class="badge-target">Design Target</span>' if is_target else '<span class="badge-measuring">Measuring</span>'
                val_text = out["value"]
                rows.append(f'''
                <tr>
                  <td class="outcomes-metric-col">{out["metric"]}</td>
                  <td class="outcomes-val-col"><strong>{val_text}</strong> {tag_badge}</td>
                  <td class="outcomes-note-col">{out.get("note", "")}</td>
                </tr>''')
            outcomes_html = f'''
            <div class="outcomes-table-wrapper">
              <table class="outcomes-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th>Measured Value / Status</th>
                    <th>Validation Context</th>
                  </tr>
                </thead>
                <tbody>
                  {"".join(rows)}
                </tbody>
              </table>
              <p class="outcomes-hard-rule-notice">
                <em>Rule: Outcome slots are populated only from measured test runs. Design targets are explicitly tagged and never presented as achieved results.</em>
              </p>
            </div>'''
        else:
            outcomes_html = '<div class="warning-box"><strong>BUILD WARNING · MISSING FIELD</strong><p>Outcomes and test telemetry not yet recorded in portfolio-projects.md. TODO: record measured numbers.</p></div>'

        # Status note
        status_note = d.get("status_note")
        status_note_html = f'<div class="status-note-banner"><span>ℹ</span> {status_note}</div>' if status_note else ""

        # 5. What I'd improve next
        next_steps = d.get("next", [])
        if next_steps:
            next_items = "".join([f'<li>{item}</li>' for item in next_steps])
            next_html = f'<ul class="detail-bullet-list detail-next-list">{next_items}</ul>'
        else:
            next_html = '<div class="warning-box"><strong>BUILD WARNING · MISSING FIELD</strong><p>Next improvements not yet specified in portfolio-projects.md.</p></div>'

        page_dir = f"projects/{slug}"
        os.makedirs(page_dir, exist_ok=True)
        page_file = f"{page_dir}/index.html"

        # Build full detail page HTML
        detail_page_content = f'''<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title} — Sanket Rotangar</title>
    <meta name="description" content="{oneLiner}" />
    <meta property="og:title" content="{title} — Sanket Rotangar" />
    <meta property="og:description" content="{oneLiner}" />
    <meta property="og:type" content="article" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500;600&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/css/tokens.css" />
    <link rel="stylesheet" href="/css/style.css" />
  </head>
  <body class="detail-body">
    <header class="site-header" id="site-header">
      <nav aria-label="Main navigation">
        <a class="brand" href="/#top">sanket<span>.</span>rotangar</a>
        <div class="nav-links">
          <a href="/#projects">Projects</a>
          <a href="/#problems">Systems</a>
          <a href="/#experience">Experience</a>
          <a href="/#contact">Contact</a>
        </div>
        <div class="nav-actions">
          <a class="nav-resume" href="../../resume/index.html" data-track="nav-resume" target="_blank" rel="noopener noreferrer">Resume <span>↓</span></a>
          <a class="nav-ai" href="/#contact">Let's talk <span>↗</span></a>
        </div>
      </nav>
    </header>

    <main class="detail-container">
      <div class="detail-nav-back">
        <a href="/#projects" class="back-link">← Back to all projects</a>
      </div>

      <header class="detail-header">
        <div class="detail-tagline">
          <span class="detail-mono">{idx} / {label}</span>
          <span class="project-status-badge">{status_raw}</span>
        </div>
        <h1 class="detail-title">{title}</h1>
        <p class="detail-oneliner">{oneLiner}</p>

        <div class="detail-meta-grid">
          <div class="meta-item">
            <span class="meta-label">My Role</span>
            <div class="meta-val">{role_val}</div>
          </div>
          <div class="meta-item">
            <span class="meta-label">Timeframe</span>
            <div class="meta-val">{timeframe_val}</div>
          </div>
          <div class="meta-item meta-item--wide">
            <span class="meta-label">Stack</span>
            <div class="meta-val project-card-stack">{stack_chips}</div>
          </div>
          <div class="meta-item meta-item--wide">
            <span class="meta-label">Links</span>
            <div class="meta-val">{links_rendered}</div>
          </div>
        </div>
      </header>

      {status_note_html}

      <section class="detail-section" id="problem">
        <h2 class="detail-section-title">1. Problem</h2>
        {problem_html}
        {how_html}
      </section>

      <section class="detail-section" id="architecture">
        <h2 class="detail-section-title">2. Architecture</h2>
        <p class="detail-section-sub">System topology, transactional boundaries and data flow.</p>
        {arch_html}
      </section>

      <section class="detail-section" id="decisions">
        <h2 class="detail-section-title">3. Key decisions &amp; trade-offs</h2>
        <p class="detail-section-sub">Deliberate engineering choices, underlying reasons, and rejected alternatives.</p>
        {decisions_html}
        {diffs_html}
      </section>

      <section class="detail-section" id="outcomes">
        <h2 class="detail-section-title">4. Outcomes (measured only)</h2>
        <p class="detail-section-sub">Rigorous evaluation results and validation metrics.</p>
        {outcomes_html}
      </section>

      <section class="detail-section" id="next">
        <h2 class="detail-section-title">5. What I'd improve next</h2>
        <p class="detail-section-sub">Next phases, production hardening, and scale roadmap.</p>
        {next_html}
      </section>

      <footer class="detail-footer-next">
        <span class="detail-footer-label">Next Project</span>
        <a href="/projects/{next_slug}/" class="detail-next-link">
          <span>{next_title}</span>
          <span class="detail-next-arrow">→</span>
        </a>
      </footer>
    </main>

    <footer class="site-footer">
      <div class="contact-bottom" style="margin-top:40px;border-top:1px solid var(--border);">
        <span>Goa, India · open to relocate</span>
        <a href="/services.html">Services ↗</a>
        <a href="https://linkedin.com/in/sanketrotangar" target="_blank" rel="noreferrer">LinkedIn ↗</a>
        <a href="https://github.com/Sanket-Rotangar" target="_blank" rel="noreferrer">GitHub ↗</a>
      </div>
    </footer>
  </body>
</html>'''

        with open(page_file, "w") as f:
            f.write(detail_page_content)
        print(f"Generated detail page: {page_file}")

if __name__ == "__main__":
    build()
