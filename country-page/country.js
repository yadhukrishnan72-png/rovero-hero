// Country page plan picker.
// Plan fields: gb, days, price; voice + sms (Data + Voice plans); perDay (Unlimited: daily high-speed allowance);
// tag (e.g. 'Most popular'); local: true shows the lightning badge and the "Local plan" box for that tab;
// global: true shows the blue globe badge and the "Global plan" box while that plan is selected;
// number: { country, code } (global Data + Voice plans) says which country's phone number the plan includes.
// The Global plan note shows it, so nobody assumes it is a local number.
// Plans, sizes and which ones are local differ per country; the page logic never checks sizes.
// PLANS is sample data (only 1 GB / 7 days / $3.99 comes from the live page). Replace with your real plans / API.
const PLANS = {
  data: [
    { gb: '1 GB',  days: 7,  price: 3.99 },
    { gb: '3 GB',  days: 15, price: 7.99 },
    { gb: '5 GB',  days: 30, price: 11.99, tag: 'Most popular' },
    { gb: '10 GB', days: 30, price: 19.99, global: true }, // PLACEHOLDER: which plans are global is sample data
    { gb: '20 GB', days: 30, price: 32.99, global: true },
  ],
  // PLACEHOLDER voice bundles (minutes, SMS and prices are invented).
  // scope: 'local' (Indonesia only), 'asia' (Indonesia + Asia) or 'global' (Indonesia + Global); the tab groups plans by it, in that order.
  voice: [
    { scope: 'local',  gb: '5 GB',  voice: '200 min', sms: '50 SMS',  days: 30, price: 17.99, intl: null, tag: 'Most popular', local: true },
    { scope: 'local',  gb: '10 GB', voice: '300 min', sms: '75 SMS',  days: 30, price: 26.99, intl: null, local: true },
    // PLACEHOLDER: Singapore (+65) and France (+33) are sample data for the included phone number
    { scope: 'asia',   gb: '3 GB',  voice: '100 min', sms: '25 SMS',  days: 15, price: 11.99, intl: '30 min + 10 SMS', global: true, number: { country: 'Singapore', code: '+65' } },
    { scope: 'asia',   gb: '10 GB', voice: '300 min', sms: '75 SMS',  days: 30, price: 24.99, intl: '60 min + 20 SMS', global: true, number: { country: 'Singapore', code: '+65' } },
    { scope: 'global', gb: '5 GB',  voice: '150 min', sms: '50 SMS',  days: 30, price: 29.99, intl: '60 min + 25 SMS', global: true, number: { country: 'France', code: '+33' } },
    { scope: 'global', gb: '20 GB', voice: 'Unlimited min', sms: '100 SMS', days: 30, price: 39.99, intl: '100 min + 50 SMS', global: true, number: { country: 'France', code: '+33' } },
  ],
  unlimited: [
    { gb: 'Unlimited', perDay: '2 GB/day', days: 3,  price: 14.99 },
    { gb: 'Unlimited', perDay: '2 GB/day', days: 7,  price: 27.99, tag: 'Most popular' },
    // PLACEHOLDER: which plans have no daily cap (noFup: true) is sample data. noFup plans show the green infinity badge and the "Truly unlimited" note.
    { gb: 'Unlimited', noFup: true, days: 15, price: 49.99 },
  ],
};

// PLACEHOLDER: intl (international minutes + SMS), the Indonesian number (+62) and the activation text are sample data, not real terms.
// intl: null means no international allowance. The "More details" popup builds its rows from the plan fields.
const ACTIVATION = 'Starts when the eSIM first connects to a supported network, or when the package\'s activation policy begins.';

// PLACEHOLDER country lists (sample data, not the real coverage). The counts in the note and the popup come from these arrays.
const ASIA_COUNTRIES = [
  'Cambodia', 'China', 'Hong Kong', 'India', 'Japan', 'Laos', 'Macao', 'Malaysia', 'Philippines', 'Singapore',
  'South Korea', 'Sri Lanka', 'Taiwan', 'Thailand', 'Vietnam',
];
const GLOBAL_COUNTRIES = [
  'Australia', 'Austria', 'Belgium', 'Brazil', 'Cambodia', 'Canada', 'Chile', 'Croatia', 'Czechia', 'Denmark',
  'Egypt', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'India', 'Ireland', 'Italy', 'Japan',
  'Kenya', 'Malaysia', 'Mexico', 'Morocco', 'Netherlands', 'New Zealand', 'Norway', 'Philippines', 'Poland', 'Portugal',
  'Singapore', 'South Africa', 'South Korea', 'Spain', 'Sweden', 'Switzerland', 'Thailand', 'Turkey',
  'United Arab Emirates', 'United Kingdom', 'United States', 'Vietnam',
];
const SCOPES = {
  local:  { title: 'Indonesia Only',     sub: 'Works in Indonesia only. Includes an Indonesian number.' },
  asia:   { title: 'Indonesia + Asia',   sub: 'Works in Indonesia and other Asian countries.', note: 'Asia plan.', where: 'other Asian countries', countries: ASIA_COUNTRIES },
  global: { title: 'Indonesia + Global', sub: 'Works in Indonesia and countries around the world.', note: 'Global plan.', where: 'other countries', countries: GLOBAL_COUNTRIES },
};
const scopeOf = (p) => p.scope || (p.global ? 'global' : 'local');

const openCountries = (function initGlobalModal() {
  const modal = document.getElementById('global-modal');
  if (!modal) return () => {};
  const list = document.getElementById('gmodal-list');
  const search = document.getElementById('gmodal-search');
  const empty = document.getElementById('gmodal-empty');
  const title = document.getElementById('gmodal-title');
  search.addEventListener('input', () => {
    const q = search.value.trim().toLowerCase();
    let shown = 0;
    for (const li of list.children) {
      const hit = li.textContent.toLowerCase().includes(q);
      li.hidden = !hit;
      if (hit) shown++;
    }
    empty.hidden = shown > 0;
  });
  document.getElementById('gmodal-close').addEventListener('click', () => modal.close());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); }); // backdrop click
  return (scope) => {
    const sc = SCOPES[scope] || SCOPES.global;
    title.textContent = `${sc.title} countries`;
    list.replaceChildren(...[...sc.countries].sort((a, b) => a.localeCompare(b)).map((c) => {
      const li = document.createElement('li');
      li.textContent = c;
      return li;
    }));
    search.value = '';
    search.dispatchEvent(new Event('input'));
    modal.showModal();
  };
})();

(function initPlanPicker() {
  const list = document.getElementById('plan-list');
  if (!list) return;
  const tabs = [...document.querySelectorAll('.tabs__btn')];
  const unlNote = document.getElementById('unl-note');
  const noFupNote = document.getElementById('nofup-note');
  const localNote = document.getElementById('local-note');
  const globalNote = document.getElementById('global-note');
  const globalTail = document.getElementById('global-tail');
  const globalLead = document.getElementById('global-lead');
  const globalCount = document.getElementById('global-count');
  const globalWhere = document.getElementById('global-where');
  const dModal = document.getElementById('details-modal');
  function showDetails(p) {
    const sc = SCOPES[scopeOf(p)];
    const rows = [];
    if (p.perDay) rows.push(['Data', `Unlimited (${p.perDay} high-speed)`]);
    else rows.push(['Data', p.gb]);
    rows.push(['Validity', `${p.days} days`]);
    rows.push(['Coverage', p.scope ? sc.title : (p.global ? 'Indonesia + Global' : 'Indonesia')]);
    if (p.voice) {
      rows.push(['Calls', p.voice]);
      rows.push(['SMS', p.sms]);
      rows.push(['International minutes & SMS', p.intl || 'Not included']);
      rows.push(['Phone number', p.number ? `${p.number.country} (${p.number.code})` : 'Indonesia (+62)']);
    }
    rows.push(['Activation policy', ACTIVATION]);
    document.getElementById('dmodal-title').textContent = `${p.gb}${p.voice ? ' + Voice' : ''} · ${p.days} days`;
    document.getElementById('dmodal-list').replaceChildren(...rows.map(([k, v]) => {
      const d = document.createElement('div');
      const dt = document.createElement('dt'); dt.textContent = k;
      const dd = document.createElement('dd'); dd.textContent = v;
      d.append(dt, dd);
      return d;
    }));
    dModal.showModal();
  }
  document.getElementById('dmodal-close').addEventListener('click', () => dModal.close());
  dModal.addEventListener('click', (e) => { if (e.target === dModal) dModal.close(); });
  const plansEl = () => [...list.querySelectorAll('.plan')];
  document.getElementById('global-open').addEventListener('click', () => openCountries(scopeOf(PLANS[kind][selected])));
  const GLOBE_SVG = '<svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="18" fill="#E3F0FF"/><g fill="none" stroke="#1A73E8" stroke-width="1.7" stroke-linecap="round"><circle cx="18" cy="18" r="8"/><ellipse cx="18" cy="18" rx="3.6" ry="8"/><path d="M10 18h16"/></g></svg>';
  const out = {
    plan: document.getElementById('o-plan'),
    price: document.getElementById('o-price'),
  };
  const usd = (n) => `$${n.toFixed(2)}`;
  let kind = 'data';
  let selected = 0;

  function summarise() {
    const p = PLANS[kind][selected];
    out.plan.textContent = `${p.gb}${p.voice ? ` + ${p.voice}` : ''}${p.sms ? ` + ${p.sms}` : ''} · ${p.days} days`;
    out.price.textContent = usd(p.price);
    document.getElementById('s-days').textContent = `${p.days} days`;
    document.getElementById('s-gb').textContent = p.gb;
    const extra = document.getElementById('s-extra'); // voice: minutes + SMS; unlimited: daily allowance; data: none
    extra.textContent = p.voice ? `${p.voice} + ${p.sms}` : (p.noFup ? 'No daily limit' : (p.perDay || ''));
    document.getElementById('s-gb').textContent = p.noFup ? '∞ Unlimited' : p.gb;
    extra.hidden = !extra.textContent;
    document.getElementById('s-price').textContent = out.price.textContent;
    globalNote.hidden = !p.global;
    unlNote.hidden = !p.perDay;      // capped unlimited: 2 GB/day note
    noFupNote.hidden = !p.noFup;     // truly unlimited note
    if (p.global) {
      const sc = SCOPES[scopeOf(p)];
      globalLead.textContent = sc.note;
      globalCount.textContent = sc.countries.length;
      globalWhere.textContent = sc.where;
    }
    if (p.number) {
      const s = document.createElement('strong');
      s.textContent = `Includes a ${p.number.country} phone number (${p.number.code}).`;
      globalTail.replaceChildren(s);
    } else {
      globalTail.textContent = 'Speeds depend on the partner network.';
    }
  }

  function select(i) {
    selected = i;
    plansEl().forEach((el, n) => el.setAttribute('aria-checked', String(n === i)));
    summarise();
  }

  function render() {
    const recommended = PLANS[kind].findIndex((p) => p.tag);
    selected = recommended >= 0 ? recommended : 0;
    localNote.hidden = !PLANS[kind].some((p) => p.local);
    let lastScope = null;
    const nodes = [];
    PLANS[kind].forEach((p, i) => {
      if (p.scope && p.scope !== lastScope) {
        lastScope = p.scope;
        const sc = SCOPES[p.scope];
        const h = document.createElement('div');
        h.className = `plan-group plan-group--${p.scope}`;
        const t = document.createElement('h3');
        t.textContent = sc.title;
        const sub = document.createElement('p');
        sub.textContent = sc.sub;
        h.append(t, sub);
        if (sc.countries) {
          const lnk = document.createElement('button');
          lnk.type = 'button';
          lnk.className = 'linkbtn';
          lnk.textContent = `See all ${sc.countries.length} countries`;
          lnk.addEventListener('click', () => openCountries(p.scope));
          sub.append(' ', lnk);
        }
        nodes.push(h);
      }
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'plan' + (p.voice ? ' plan--voice' : '');
      el.setAttribute('role', 'radio');
      el.innerHTML = `
        <span class="plan__dot" aria-hidden="true"></span>
        <span class="plan__data"></span>
        ${p.voice || p.perDay || p.noFup ? '<span class="plan__voice"></span>' : ''}
        <span class="plan__meta"></span>
        <span class="plan__price"></span>`;
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
        extra.textContent = 'No daily limit';
      } else if (p.perDay) {
        extra.textContent = p.perDay;
      }
      el.querySelector('.plan__meta').textContent = `${p.days} days`;
      el.querySelector('.plan__price').textContent = usd(p.price);
      if (p.local) {
        const b = document.createElement('span');
        b.className = 'plan__local';
        b.setAttribute('role', 'img');
        b.setAttribute('aria-label', 'Local plan');
        b.innerHTML = '<svg viewBox="0 0 36 36" aria-hidden="true"><rect width="36" height="36" rx="8" fill="#FFF4D9"/><path d="M19 10 18 16h7v2l-8 8.5h-1V20H9v-1z" fill="#F0B100" stroke="#F0B100" stroke-width=".8" stroke-linejoin="round"/></svg>';
        el.append(b);
      }
      if (p.global) {
        const b = document.createElement('span');
        b.className = 'plan__local plan__local--global';
        b.setAttribute('role', 'img');
        b.setAttribute('aria-label', 'Global plan');
        b.innerHTML = GLOBE_SVG;
        el.append(b);
      }
      if (p.noFup) {
        const b = document.createElement('span');
        b.className = 'plan__local plan__local--nofup';
        b.setAttribute('role', 'img');
        b.setAttribute('aria-label', 'Truly unlimited');
        b.innerHTML = '<svg viewBox="0 0 36 36" aria-hidden="true"><rect width="36" height="36" rx="8" fill="#E4F6EA"/><path d="M18 18c-1.8-2.6-3.2-4-5-4a4 4 0 0 0 0 8c1.8 0 3.2-1.4 5-4s3.2-4 5-4a4 4 0 0 1 0 8c-1.8 0-3.2-1.4-5-4z" fill="none" stroke="#1E9E55" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
        el.append(b);
      }
      if (p.tag) {
        const t = document.createElement('span');
        t.className = 'plan__tag';
        t.textContent = p.tag;
        el.append(t);
      }
      el.addEventListener('click', () => select(i));
      if (p.voice) { // "More details" only on Data + Voice plans
        const cell = document.createElement('div');
        cell.className = 'plan-cell';
        const more = document.createElement('button');
        more.type = 'button';
        more.className = 'linkbtn plan-more';
        more.textContent = 'Details';
        more.addEventListener('click', () => showDetails(p));
        cell.append(el, more);
        nodes.push(cell);
      } else {
        nodes.push(el);
      }
    });
    list.replaceChildren(...nodes);
    select(selected);
  }

  // Arrow keys move between plans, like a native radio group.
  list.addEventListener('keydown', (e) => {
    const n = PLANS[kind].length;
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    select((selected + step + n) % n);
    plansEl()[selected].focus();
  });

  tabs.forEach((tab) => tab.addEventListener('click', () => {
    kind = tab.dataset.kind;
    tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
    render();
  }));

  render();
})();

// Sticky pay bar: mirrors the selected plan, fires the real Pay now button, and hides while the order summary is on screen.
(function initStickyPay() {
  const bar = document.getElementById('stickypay');
  const order = document.querySelector('.order');
  if (!bar || !order) return;
  document.getElementById('s-pay').addEventListener('click', () => document.getElementById('pay').click());
  const set = (show) => { bar.classList.toggle('is-visible', show); bar.setAttribute('aria-hidden', String(!show)); document.getElementById('s-pay').tabIndex = show ? 0 : -1; };
  set(true);
  if (!('IntersectionObserver' in window)) return;
  new IntersectionObserver(([e]) => set(!e.isIntersecting)).observe(order);
})();
