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
  voice: [
    // PLACEHOLDER: France (+33) is sample data for the included phone number
    { gb: '3 GB',  voice: '100 min', sms: '25 SMS',  days: 15, price: 11.99, global: true, number: { country: 'France', code: '+33' } },
    { gb: '5 GB',  voice: '200 min', sms: '50 SMS',  days: 30, price: 17.99, tag: 'Most popular', local: true },
    { gb: '10 GB', voice: '300 min', sms: '75 SMS',  days: 30, price: 26.99, local: true },
    { gb: '20 GB', voice: 'Unlimited min', sms: '100 SMS', days: 30, price: 39.99, global: true, number: { country: 'France', code: '+33' } },
  ],
  unlimited: [
    { gb: 'Unlimited', perDay: '2 GB/day', days: 3,  price: 14.99 },
    { gb: 'Unlimited', perDay: '2 GB/day', days: 7,  price: 27.99, tag: 'Most popular' },
    { gb: 'Unlimited', perDay: '2 GB/day', days: 15, price: 49.99 },
  ],
};

// PLACEHOLDER list of countries covered by the global plan (sample data, not the real coverage).
// Replace with the real list; the count in the note and the popup both come from this array.
const GLOBAL_COUNTRIES = [
  'Australia', 'Austria', 'Belgium', 'Brazil', 'Cambodia', 'Canada', 'Chile', 'Croatia', 'Czechia', 'Denmark',
  'Egypt', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'India', 'Ireland', 'Italy', 'Japan',
  'Kenya', 'Malaysia', 'Mexico', 'Morocco', 'Netherlands', 'New Zealand', 'Norway', 'Philippines', 'Poland', 'Portugal',
  'Singapore', 'South Africa', 'South Korea', 'Spain', 'Sweden', 'Switzerland', 'Thailand', 'Turkey',
  'United Arab Emirates', 'United Kingdom', 'United States', 'Vietnam',
];

(function initGlobalModal() {
  const modal = document.getElementById('global-modal');
  if (!modal) return;
  const list = document.getElementById('gmodal-list');
  const search = document.getElementById('gmodal-search');
  const empty = document.getElementById('gmodal-empty');
  const countries = [...GLOBAL_COUNTRIES].sort((a, b) => a.localeCompare(b));
  document.getElementById('global-count').textContent = countries.length;
  list.replaceChildren(...countries.map((c) => {
    const li = document.createElement('li');
    li.textContent = c;
    return li;
  }));
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
  document.getElementById('global-open').addEventListener('click', () => {
    search.value = '';
    search.dispatchEvent(new Event('input'));
    modal.showModal();
  });
  document.getElementById('gmodal-close').addEventListener('click', () => modal.close());
  modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); }); // backdrop click
})();

(function initPlanPicker() {
  const list = document.getElementById('plan-list');
  if (!list) return;
  const tabs = [...document.querySelectorAll('.tabs__btn')];
  const unlNote = document.getElementById('unl-note');
  const localNote = document.getElementById('local-note');
  const globalNote = document.getElementById('global-note');
  const globalTail = document.getElementById('global-tail');
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
    globalNote.hidden = !p.global;
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
    [...list.children].forEach((el, n) => el.setAttribute('aria-checked', String(n === i)));
    summarise();
  }

  function render() {
    const recommended = PLANS[kind].findIndex((p) => p.tag);
    selected = recommended >= 0 ? recommended : 0;
    localNote.hidden = !PLANS[kind].some((p) => p.local);
    list.replaceChildren(...PLANS[kind].map((p, i) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'plan' + (p.voice ? ' plan--voice' : '');
      el.setAttribute('role', 'radio');
      el.innerHTML = `
        <span class="plan__dot" aria-hidden="true"></span>
        <span class="plan__data"></span>
        ${p.voice || p.perDay ? '<span class="plan__voice"></span>' : ''}
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
      if (p.tag) {
        const t = document.createElement('span');
        t.className = 'plan__tag';
        t.textContent = p.tag;
        el.append(t);
      }
      el.addEventListener('click', () => select(i));
      return el;
    }));
    select(selected);
  }

  // Arrow keys move between plans, like a native radio group.
  list.addEventListener('keydown', (e) => {
    const n = PLANS[kind].length;
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    select((selected + step + n) % n);
    list.children[selected].focus();
  });

  tabs.forEach((tab) => tab.addEventListener('click', () => {
    kind = tab.dataset.kind;
    unlNote.hidden = kind !== 'unlimited';
    tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
    render();
  }));

  render();
})();
