// Rovero destination page (countries and regions). Reads window.ROVERO_PAGE (see ../data/pages/*.js and the README).
//
// Plan fields: gb, days, price; coverage (key into ROVERO_PAGE.coverage: the countries this plan works in; regions only);
// optional: voice + sms (Data + Voice), perDay (Unlimited allowance), tag (e.g. 'Most popular'), local: true (lightning badge), global: true (blue globe badge + "Global plan" notice with a countries popup), number: { country, code } (global voice plans: the phone number included; shown in the Global plan notice),
// scope: 'local' | '<key in ROVERO_PAGE.scopes>' (Data + Voice plans are grouped under a heading per scope, e.g. "Indonesia Only" / "Indonesia + Asia"),
// intl: '60 min + 20 SMS' or null (international minutes + SMS, shown in the Details popup), noFup: true (truly unlimited, no daily cap: green infinity badge + note; combine with local: true to show both badges),
// more: true (hidden until the "More plans" link under the tiles is pressed; never the preselected plan).
// The page logic never checks sizes or names: tabs, tiles, notices and the country sheet are all driven by this data.
//
// Developer hooks (CustomEvents on document):
//   'rovero:select'  detail = { kind, plan }            fired when the selected plan changes
//   'rovero:pay'     detail = { kind, plan, page }      fired when "Pay now" is pressed
(function () {
  const P = window.ROVERO_PAGE;
  if (!P) return;
  const $ = (id) => document.getElementById(id);
  const usd = (n) => `$${n.toFixed(2)}`;
  const PLANS = P.plans || {};
  const COVERAGE = P.coverage || {};
  const isRegion = P.kind === 'region';
  const GLOBAL = [...(P.globalCountries || [])].sort((a, b) => a.localeCompare(b));
  const ACTIVATION = P.activation || "Starts when the eSIM first connects to a supported network, or when the package's activation policy begins.";

  // Plan scopes: group headings in the plan list and the country list behind each "Global/Asia plan" notice (see README, "scopes").
  const SCOPES = P.scopes || {};
  const scopeOf = (p) => p.scope || (p.global ? 'global' : 'local');
  const scopeInfo = (key) => {
    const s = SCOPES[key] || {};
    const countries = [...(s.countries || (key === 'local' ? [] : GLOBAL))].sort((a, b) => a.localeCompare(b));
    return {
      title: s.title || (key === 'local' ? `${P.name} Only` : `${P.name} + ${key.charAt(0).toUpperCase()}${key.slice(1)}`),
      custom: !!s.title,
      sub: s.sub || '',
      note: s.note || 'Global plan.',
      where: s.where || 'other countries',
      countries,
    };
  };

  // ---- 1. text tokens and kind-specific blocks --------------------------------------------------------------
  const tokens = { name: P.name, the: P.the || P.name };
  const sub = (s) => s.replace(/\{(\w+)\}/g, (m, k) => (k in tokens ? tokens[k] : m));
  document.title = sub(document.title);
  document.querySelectorAll('meta[name="description"]').forEach((m) => m.setAttribute('content', sub(m.getAttribute('content'))));
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = walker.nextNode(); n; n = walker.nextNode()) {
    if (n.nodeValue.includes('{')) n.nodeValue = sub(n.nodeValue);
  }
  document.querySelectorAll('[data-for]').forEach((el) => { el.hidden = el.dataset.for !== P.kind; });

  // ---- 2. hero image, networks, related destinations --------------------------------------------------------
  const hero = $('hero-img');
  hero.src = P.image;
  hero.alt = P.alt || '';

  if (!isRegion && (P.networks || []).length) {
    $('nets').hidden = false;
    $('nets-list').replaceChildren(...P.networks.map((n) => {
      const li = document.createElement('li');
      li.append(n.name + ' ');
      if (n.tech) {
        const s = document.createElement('span');
        s.textContent = n.tech;
        li.append(s);
      }
      return li;
    }));
  }

  const GLOBE = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.6 3.8 5.6 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3z"/></svg>';
  if ((P.related || []).length) {
    $('related').hidden = false;
    $('related-title').textContent = P.relatedTitle || 'Explore more eSIM plans';
    $('related-text').textContent = P.relatedText || 'Travelling to several places? Browse more destinations and keep using the same rovero eSIM.';
    $('related-list').replaceChildren(...P.related.map((r) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = r.href || '#';
      const ic = document.createElement('span');
      ic.className = 'chip__icon';
      ic.setAttribute('aria-hidden', 'true');
      if (r.image) {
        const img = document.createElement('img');
        img.src = r.image;
        img.alt = '';
        img.width = img.height = 32;
        ic.append(img);
      } else {
        ic.innerHTML = GLOBE;
      }
      a.append(ic, r.label);
      li.append(a);
      return li;
    }));
  }

  // ---- 3. plan picker ---------------------------------------------------------------------------------------
  const list = $('plan-list');
  const tabsEl = $('tabs');
  const localNote = $('local-note');
  const unlNote = $('unl-note');
  const globalNote = $('global-note');
  const globalTail = $('global-tail');
  const noFupNote = $('nofup-note');
  const DAY_LABEL = 'No daily limit';
  if (P.unlimitedNote) {
    const t = $('unl-text');
    const s = document.createElement('strong');
    s.textContent = P.unlimitedNote.strong || '';
    t.append(s, P.unlimitedNote.text || '');
  }
  {
    const n = P.noFupNote || { strong: 'Truly unlimited.', text: ' No daily limit and no speed reduction.' };
    const s = document.createElement('strong');
    s.textContent = n.strong;
    $('nofup-text').append(s, n.text);
  }
  const out = { plan: $('o-plan'), price: $('o-price') };
  const BOLT = '<svg viewBox="0 0 36 36" aria-hidden="true"><rect width="36" height="36" rx="8" fill="#FFF4D9"/><path d="M19 10 18 16h7v2l-8 8.5h-1V20H9v-1z" fill="#F0B100" stroke="#F0B100" stroke-width=".8" stroke-linejoin="round"/></svg>';
  const GLOBE_BADGE = '<svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="18" fill="#E3F0FF"/><g fill="none" stroke="#1A73E8" stroke-width="1.7" stroke-linecap="round"><circle cx="18" cy="18" r="8"/><ellipse cx="18" cy="18" rx="3.6" ry="8"/><path d="M10 18h16"/></g></svg>';
  const INFINITY_BADGE = '<svg viewBox="0 0 36 36" aria-hidden="true"><rect width="36" height="36" rx="8" fill="#E4F6EA"/><path d="M18 18c-1.8-2.6-3.2-4-5-4a4 4 0 0 0 0 8c1.8 0 3.2-1.4 5-4s3.2-4 5-4a4 4 0 0 1 0 8c-1.8 0-3.2-1.4-5-4z" fill="none" stroke="#1E9E55" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const TAB_LABELS = { data: 'Data', voice: 'Data + Voice', unlimited: 'Unlimited' };

  const names = (id) => [...(COVERAGE[id] || [])].sort((a, b) => a.localeCompare(b));
  const count = (p) => (COVERAGE[p.coverage] || []).length;
  const label = (p) => `${p.gb}${p.voice ? ` + ${p.voice}` : ''}${p.sms ? ` + ${p.sms}` : ''}`;
  const plural = (n) => `${n} ${n === 1 ? 'country' : 'countries'}`;
  const kinds = Object.keys(PLANS).filter((k) => (PLANS[k] || []).length);
  let kind = kinds[0];
  let selected = 0;
  let sheetPlan = 0;
  let moreOpen = false;
  const moreBtn = $('more-btn');
  const tiles = () => [...list.querySelectorAll('.plan')];

  function fill(ul, emptyEl, all, query) {
    const q = query.trim().toLowerCase();
    const shown = q ? all.filter((n) => n.toLowerCase().includes(q)) : all;
    ul.replaceChildren(...shown.map((n) => {
      const li = document.createElement('li');
      li.textContent = n;
      return li;
    }));
    emptyEl.hidden = shown.length > 0;
  }

  function summarise() {
    const p = PLANS[kind][selected];
    out.plan.textContent = `${label(p)} · ${p.days} days`;
    out.price.textContent = usd(p.price);
    const info = scopeInfo(scopeOf(p));
    globalNote.hidden = !(p.global && info.countries.length);
    if (!globalNote.hidden) {
      $('global-name').textContent = info.note;
      $('global-lead').textContent = isRegion ? plural(info.countries.length) : `${P.the || P.name} and ${info.countries.length} ${info.where}`;
    }
    unlNote.hidden = !(kind === 'unlimited' && !p.noFup && P.unlimitedNote);
    noFupNote.hidden = !p.noFup;
    localNote.hidden = !p.local;    // Local plan note follows the selected plan
    // Sticky pay bar
    $('s-days').textContent = `${p.days} days`;
    $('s-gb').textContent = p.noFup ? '\u221E ' + p.gb : p.gb;
    const sx = $('s-extra');
    sx.textContent = p.voice ? `${p.voice} + ${p.sms}` : (p.noFup ? DAY_LABEL : (p.perDay || ''));
    sx.hidden = !sx.textContent;
    $('s-price').textContent = usd(p.price);
    if (p.number) {
      const s = document.createElement('strong');
      s.textContent = `Includes a ${p.number.country} phone number (${p.number.code}).`;
      globalTail.replaceChildren(s);
    } else {
      globalTail.textContent = 'Speeds depend on the partner network.';
    }
    document.dispatchEvent(new CustomEvent('rovero:select', { detail: { kind, plan: p } }));
  }

  function select(i) {
    selected = i;
    tiles().forEach((el, n) => {
      el.classList.toggle('is-on', n === i);
      el.querySelector('.plan__pick').setAttribute('aria-checked', String(n === i));
    });
    summarise();
  }

  function groupHead(key) {
    const info = scopeInfo(key);
    const h = document.createElement('div');
    h.className = `plan-group plan-group--${key}`;
    const t = document.createElement('h3');
    t.textContent = info.title;
    const sub = document.createElement('p');
    sub.textContent = info.sub;
    h.append(t, sub);
    if (key !== 'local' && info.countries.length) {
      const lnk = document.createElement('button');
      lnk.type = 'button';
      lnk.className = 'linkbtn';
      lnk.textContent = `See all ${info.countries.length} countries`;
      lnk.addEventListener('click', () => openCountries(key));
      sub.append(' ', lnk);
    }
    return h;
  }

  function render() {
    moreOpen = false;
    const recommended = PLANS[kind].findIndex((p) => p.tag && !p.more);
    selected = recommended >= 0 ? recommended : Math.max(0, PLANS[kind].findIndex((p) => !p.more));
    moreBtn.hidden = !PLANS[kind].some((p) => p.more);
    moreBtn.setAttribute('aria-expanded', 'false');
    moreBtn.textContent = 'More plans';

    let lastScope = null;
    const nodes = [];
    PLANS[kind].forEach((p, i) => {
      if (p.scope && p.scope !== lastScope) {
        lastScope = p.scope;
        nodes.push(groupHead(p.scope));
      }
      const el = document.createElement('div');
      el.className = 'plan' + (p.voice ? ' plan--voice' : '');
      el.setAttribute('role', 'presentation');
      // The overlay button (.plan__pick) carries the radio role; the countries link sits above it
      el.innerHTML = `
        <button type="button" class="plan__pick" role="radio"></button>
        <span class="plan__dot" aria-hidden="true"></span>
        <span class="plan__data" aria-hidden="true"></span>
        ${p.voice || p.perDay || p.noFup ? '<span class="plan__voice" aria-hidden="true"></span>' : ''}
        <span class="plan__meta" aria-hidden="true"></span>
        ${isRegion && p.coverage ? '<button type="button" class="plan__countries"></button>' : ''}
        <span class="plan__price" aria-hidden="true"></span>`;

      const data = el.querySelector('.plan__data');
      data.textContent = p.gb;
      if (!/^\d/.test(p.gb)) data.classList.add('plan__data--word');

      const extra = el.querySelector('.plan__voice');
      if (p.voice) {
        for (const t of [`+ ${p.voice}`, `+ ${p.sms}`]) {
          const s = document.createElement('span');
          s.textContent = t;
          extra.append(s, ' ');
        }
      } else if (p.noFup) {
        extra.textContent = DAY_LABEL;
      } else if (p.perDay) {
        extra.textContent = p.perDay;
      }

      el.querySelector('.plan__meta').textContent = `${p.days} days`;
      el.querySelector('.plan__price').textContent = usd(p.price);
      el.querySelector('.plan__pick').setAttribute(
        'aria-label',
        `${label(p)}, ${p.days} days, ${usd(p.price)}${isRegion && p.coverage ? `, ${plural(count(p))}` : ''}`);

      const link = el.querySelector('.plan__countries');
      if (link) {
        link.textContent = `${plural(count(p))} ›`;
        link.setAttribute('aria-label', `View the ${plural(count(p))} included in the ${label(p)} plan`);
        link.addEventListener('click', () => openSheet(i));
      }
      if (p.local) {
        const b = document.createElement('span');
        b.className = 'plan__local';
        b.setAttribute('role', 'img');
        b.setAttribute('aria-label', 'Local plan');
        b.innerHTML = BOLT;
        el.append(b);
      }
      if (p.global) {
        const b = document.createElement('span');
        b.className = 'plan__local';
        b.setAttribute('role', 'img');
        b.setAttribute('aria-label', 'Global plan');
        b.innerHTML = GLOBE_BADGE;
        el.append(b);
      }
      if (p.noFup) {
        const b = document.createElement('span');
        b.className = 'plan__local';
        b.setAttribute('role', 'img');
        b.setAttribute('aria-label', 'Truly unlimited');
        b.innerHTML = INFINITY_BADGE;
        el.append(b);
      }
      // A tile with two badges (e.g. local + truly unlimited): the second sits beside (desktop) or under (phones) the first
      el.querySelectorAll('.plan__local').forEach((b, n) => { if (n > 0) b.classList.add('plan__local--next'); });
      if (p.voice) { // "Details" popup: Data + Voice plans only
        const d = document.createElement('button');
        d.type = 'button';
        d.className = 'plan__details';
        d.textContent = 'Details';
        d.setAttribute('aria-label', `Details for the ${label(p)} plan`);
        d.addEventListener('click', () => openDetails(p));
        el.append(d);
      }
      if (p.tag) {
        const t = document.createElement('span');
        t.className = 'plan__tag';
        t.textContent = p.tag;
        el.append(t);
      }
      el.querySelector('.plan__pick').addEventListener('click', () => select(i));
      el.hidden = !!p.more;
      nodes.push(el);
    });
    list.replaceChildren(...nodes);
    select(selected);
  }

  // "More plans" shows or hides the plans flagged more:true. Collapsing while one is selected falls back to the default plan.
  moreBtn.addEventListener('click', () => {
    moreOpen = !moreOpen;
    PLANS[kind].forEach((p, i) => { if (p.more) tiles()[i].hidden = !moreOpen; });
    moreBtn.setAttribute('aria-expanded', String(moreOpen));
    moreBtn.textContent = moreOpen ? 'Fewer plans' : 'More plans';
    if (!moreOpen && PLANS[kind][selected].more) {
      const back = PLANS[kind].findIndex((p) => p.tag && !p.more);
      select(back >= 0 ? back : Math.max(0, PLANS[kind].findIndex((p) => !p.more)));
    }
  });

  list.addEventListener('keydown', (e) => {
    if (!e.target.classList.contains('plan__pick')) return;
    const n = PLANS[kind].length;
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const t = tiles();
    let next = selected;
    do { next = (next + step + n) % n; } while (t[next].hidden && next !== selected);
    select(next);
    tiles()[selected].querySelector('.plan__pick').focus();
  });

  // Tabs appear only when there is more than one kind of plan
  if (kinds.length > 1) {
    tabsEl.replaceChildren(...kinds.map((k) => {
      const b = document.createElement('button');
      b.className = 'tabs__btn';
      b.type = 'button';
      b.setAttribute('role', 'tab');
      b.setAttribute('aria-selected', String(k === kind));
      b.dataset.kind = k;
      b.textContent = TAB_LABELS[k];
      b.addEventListener('click', () => {
        kind = k;
        [...tabsEl.children].forEach((t) => t.setAttribute('aria-selected', String(t === b)));
        render();
      });
      return b;
    }));
  } else {
    tabsEl.hidden = true;
  }

  // ---- 4. countries sheet (regions) -------------------------------------------------------------------------
  const dlg = {
    el: $('cty-dlg'), sub: $('dlg-sub'), list: $('dlg-list'), search: $('dlg-search'),
    empty: $('dlg-empty'), pick: $('dlg-pick'), close: $('dlg-close'), title: $('dlg-title'),
  };
  function renderSheet() {
    const p = PLANS[kind][sheetPlan];
    dlg.title.textContent = `Countries in the ${label(p)} plan`;
    dlg.sub.textContent = `${plural(count(p))} · ${p.days} days`;
    dlg.pick.textContent = sheetPlan === selected ? 'Done' : 'Choose this plan';
    fill(dlg.list, dlg.empty, names(p.coverage), dlg.search.value);
  }
  function openSheet(i) {
    sheetPlan = i;
    dlg.search.value = '';
    renderSheet();
    dlg.el.showModal();
    dlg.list.scrollTop = 0;
  }
  dlg.search.addEventListener('input', renderSheet);
  dlg.close.addEventListener('click', () => dlg.el.close());
  dlg.pick.addEventListener('click', () => { select(sheetPlan); dlg.el.close(); });
  dlg.el.addEventListener('click', (e) => { if (e.target === dlg.el) dlg.el.close(); });

  // ---- 5. global / regional plan countries popup -----------------------------------------------------------
  const glb = { el: $('glb-dlg'), sub: $('glb-sub'), list: $('glb-list'), search: $('glb-search'), empty: $('glb-empty'), title: $('glb-title'), all: [] };
  const showGlobal = () => fill(glb.list, glb.empty, glb.all, glb.search.value);
  glb.search.addEventListener('input', showGlobal);
  function openCountries(key) {
    const info = scopeInfo(key);
    glb.all = info.countries;
    glb.title.textContent = info.custom ? `${info.title} countries` : 'Global plan countries';
    glb.sub.textContent = plural(info.countries.length);
    glb.search.value = '';
    showGlobal();
    glb.el.showModal();
    glb.list.scrollTop = 0;
  }
  $('global-open').addEventListener('click', () => openCountries(scopeOf(PLANS[kind][selected])));
  $('glb-close').addEventListener('click', () => glb.el.close());
  glb.el.addEventListener('click', (e) => { if (e.target === glb.el) glb.el.close(); });

  // ---- 6. plan details popup (Data + Voice tiles) -----------------------------------------------------------
  const det = { el: $('det-dlg'), title: $('det-title'), list: $('det-list') };
  function openDetails(p) {
    const rows = [['Data', p.gb], ['Validity', `${p.days} days`]];
    rows.push(['Coverage', p.scope ? scopeInfo(p.scope).title : (p.global ? `${P.name} + Global` : (P.the || P.name))]);
    if (p.voice) {
      rows.push(['Calls', p.voice], ['SMS', p.sms]);
      if ('intl' in p) rows.push(['International minutes & SMS', p.intl || 'Not included']);
      if (p.number) rows.push(['Phone number', `${p.number.country} (${p.number.code})`]);
    }
    rows.push(['Activation policy', ACTIVATION]);
    det.title.textContent = `${p.gb} + Voice \u00B7 ${p.days} days`;
    det.list.replaceChildren(...rows.map(([k, v]) => {
      const d = document.createElement('div');
      const dt = document.createElement('dt');
      dt.textContent = k;
      const dd = document.createElement('dd');
      dd.textContent = v;
      d.append(dt, dd);
      return d;
    }));
    det.el.showModal();
  }
  $('det-close').addEventListener('click', () => det.el.close());
  det.el.addEventListener('click', (e) => { if (e.target === det.el) det.el.close(); });

  // ---- 7. sticky pay bar: shown until the order summary is on screen; its button presses the real Pay now ------
  const bar = $('stickypay');
  const setBar = (show) => { bar.classList.toggle('is-visible', show); bar.setAttribute('aria-hidden', String(!show)); $('s-pay').tabIndex = show ? 0 : -1; };
  $('s-pay').addEventListener('click', () => $('pay').click());
  setBar(true);
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([e]) => setBar(!e.isIntersecting)).observe(document.querySelector('.order'));
  }

  $('pay').addEventListener('click', () => {
    document.dispatchEvent(new CustomEvent('rovero:pay', { detail: { kind, plan: PLANS[kind][selected], page: P.code } }));
  });

  if (kinds.length) render();
  document.documentElement.classList.add('ready');
})();
