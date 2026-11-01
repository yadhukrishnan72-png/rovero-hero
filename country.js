// Country page plan picker.
// PLANS is sample data (only 1 GB / 7 days / $3.99 comes from the live page). Replace with your real plans / API.
const PLANS = {
  data: [
    { gb: '1 GB',  days: 7,  price: 3.99 },
    { gb: '3 GB',  days: 15, price: 7.99 },
    { gb: '5 GB',  days: 30, price: 11.99, tag: 'Most popular' },
    { gb: '10 GB', days: 30, price: 19.99 },
    { gb: '20 GB', days: 30, price: 32.99 },
  ],
  unlimited: [
    { gb: 'Unlimited', days: 3,  price: 14.99 },
    { gb: 'Unlimited', days: 7,  price: 27.99, tag: 'Most popular' },
    { gb: 'Unlimited', days: 15, price: 49.99 },
  ],
};

// TODO before launch: PLACEHOLDER competitor prices (USD per GB, comparable ~20 GB Indonesia plan).
// Replace with figures you have verified, and set CHECKED_ON to the date you checked them.
const COMPETITORS = [
  { name: 'Airalo', perGb: 3.2 },
  { name: 'Saily',  perGb: 3.0 },
  { name: 'Nomad',  perGb: 2.6 },
  { name: 'Ubigi',  perGb: 3.5 },
];
const CHECKED_ON = '';

// Price battle: Rovero's best per-GB rate comes from its own plans above, so the two never drift apart.
(function initPriceCompare() {
  const list = document.getElementById('cmp-list');
  if (!list) return;
  const rate = (p) => p.price / parseFloat(p.gb);
  const ours = Math.min(...PLANS.data.map(rate));
  const rows = [{ name: 'rovero', perGb: ours, us: true }, ...COMPETITORS].sort((a, b) => a.perGb - b.perGb);
  const max = rows[rows.length - 1].perGb;

  list.replaceChildren(...rows.map((r) => {
    const li = document.createElement('li');
    li.className = 'cmp__row' + (r.us ? ' cmp__row--us' : '');
    const name = document.createElement('span');
    name.className = 'cmp__name';
    const logo = document.createElement('span');
    logo.className = 'cmp__logo';
    logo.setAttribute('aria-hidden', 'true');
    logo.textContent = r.name[0].toLowerCase();
    name.append(logo, r.name);
    if (r.us && r === rows[0]) {
      const tag = document.createElement('span');
      tag.className = 'cmp__tag';
      tag.textContent = 'Cheapest';
      name.append(tag);
    }
    const val = document.createElement('span');
    val.className = 'cmp__val';
    val.innerHTML = '<span></span><small>/GB</small>';
    val.firstChild.textContent = `$${r.perGb.toFixed(2)}`;
    if (!r.us) {
      const more = document.createElement('span');
      more.className = 'cmp__more';
      more.textContent = `${(r.perGb / ours).toFixed(1)}× more`;
      val.append(more);
    }
    const track = document.createElement('span');
    track.className = 'cmp__track';
    track.innerHTML = '<span class="cmp__fill"></span>';
    track.firstChild.style.setProperty('--w', `${Math.round((r.perGb / max) * 100)}%`);
    li.append(name, val, track);
    return li;
  }));

  const avg = COMPETITORS.reduce((s, c) => s + c.perGb, 0) / COMPETITORS.length;
  document.getElementById('cmp-saving').textContent = `${Math.round((1 - ours / avg) * 100)}%`;

  document.getElementById('cmp-note').textContent =
    'Indicative prices' + (CHECKED_ON ? `, checked ${CHECKED_ON}` : '') + '. Competitor prices change often.';
})();

(function initPlanPicker() {
  const list = document.getElementById('plan-list');
  if (!list) return;
  const tabs = [...document.querySelectorAll('.tabs__btn')];
  const out = {
    data: document.getElementById('o-data'),
    days: document.getElementById('o-days'),
    price: document.getElementById('o-price'),
  };
  const usd = (n) => `$${n.toFixed(2)}`;
  let kind = 'data';
  let selected = 0;

  function summarise() {
    const p = PLANS[kind][selected];
    out.data.textContent = p.gb;
    out.days.textContent = `${p.days} days`;
    out.price.textContent = usd(p.price);
  }

  function select(i) {
    selected = i;
    [...list.children].forEach((el, n) => el.setAttribute('aria-checked', String(n === i)));
    summarise();
  }

  function render() {
    const recommended = PLANS[kind].findIndex((p) => p.tag);
    selected = recommended >= 0 ? recommended : 0;
    list.replaceChildren(...PLANS[kind].map((p, i) => {
      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'plan';
      el.setAttribute('role', 'radio');
      el.innerHTML = `
        <span class="plan__dot" aria-hidden="true"></span>
        <span><span class="plan__data"></span><span class="plan__meta"></span></span>
        <span class="plan__price"></span>`;
      el.querySelector('.plan__data').textContent = p.gb;
      el.querySelector('.plan__meta').textContent = `Valid ${p.days} days`;
      el.querySelector('.plan__price').textContent = usd(p.price);
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
    tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
    render();
  }));

  render();
})();
