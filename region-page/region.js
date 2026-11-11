// Region page plan picker.
//
// Plan fields: gb, days, price, coverage (key into COVERAGE: which countries this plan works in);
// optional voice + sms (Data + Voice), perDay (Unlimited allowance), tag (e.g. 'Most popular'),
// local: true (lightning badge + "Local plan" box for that tab).
// Tabs are built from the plan kinds that have plans; a region with a single kind shows no tab bar.
// Plans, prices and country lists differ per region: the page logic never checks sizes or names.
//
// PLACEHOLDER DATA: every plan, price, voice/SMS bundle, local flag and country list below is invented. The 21 countries are a stand-in
// for the real "Africa (21 areas)" list. Replace COVERAGE and PLANS with the real source (API / CMS).
const COVERAGE = {
  'af-8': ['Egypt', 'Ghana', 'Kenya', 'Morocco', 'Nigeria', 'South Africa', 'Tanzania', 'Tunisia'],
  'af-14': ['Egypt', 'Ethiopia', 'Ghana', 'Kenya', 'Morocco', 'Nigeria', 'Rwanda', 'Senegal', 'South Africa',
    'Tanzania', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe'],
  'af-21': ['Algeria', 'Cameroon', 'Chad', 'Côte d’Ivoire', 'Democratic Republic of the Congo', 'Egypt', 'Ethiopia',
    'Gabon', 'Ghana', 'Kenya', 'Morocco', 'Mozambique', 'Nigeria', 'Rwanda', 'Senegal', 'South Africa',
    'Tanzania', 'Tunisia', 'Uganda', 'Zambia', 'Zimbabwe'],
};

const PLANS = {
  data: [
    { gb: '1 GB',  days: 7,  price: 5.99,  coverage: 'af-8' },
    { gb: '3 GB',  days: 15, price: 12.99, coverage: 'af-14' },
    { gb: '5 GB',  days: 30, price: 19.99, coverage: 'af-21', tag: 'Most popular' },
    { gb: '10 GB', days: 30, price: 34.99, coverage: 'af-21', local: true },
    { gb: '20 GB', days: 30, price: 59.99, coverage: 'af-21' },
  ],
  voice: [
    { gb: '3 GB',  voice: '100 min', sms: '25 SMS',  days: 15, price: 17.99, coverage: 'af-14' },
    { gb: '5 GB',  voice: '200 min', sms: '50 SMS',  days: 30, price: 26.99, coverage: 'af-21', tag: 'Most popular', local: true },
    { gb: '10 GB', voice: '300 min', sms: '75 SMS',  days: 30, price: 42.99, coverage: 'af-21' },
  ],
  unlimited: [
    { gb: 'Unlimited', perDay: '2 GB/day', days: 3,  price: 24.99, coverage: 'af-14' },
    { gb: 'Unlimited', perDay: '2 GB/day', days: 7,  price: 44.99, coverage: 'af-21', tag: 'Most popular' },
    { gb: 'Unlimited', perDay: '2 GB/day', days: 15, price: 79.99, coverage: 'af-21' },
  ],
};

const TAB_LABELS = { data: 'Data', voice: 'Data + Voice', unlimited: 'Unlimited' };
const BOLT = '<svg viewBox="0 0 36 36" aria-hidden="true"><rect width="36" height="36" rx="8" fill="#FFF4D9"/><path d="M19 10 18 16h7v2l-8 8.5h-1V20H9v-1z" fill="#F0B100" stroke="#F0B100" stroke-width=".8" stroke-linejoin="round"/></svg>';

(function initRegionPage() {
  const list = document.getElementById('plan-list');
  if (!list) return;

  const $ = (id) => document.getElementById(id);
  const tabsEl = $('tabs');
  const localNote = $('local-note');
  const unlNote = $('unl-note');
  const out = { plan: $('o-plan'), price: $('o-price') };
  const dlg = {
    el: $('cty-dlg'), sub: $('dlg-sub'), list: $('dlg-list'), search: $('dlg-search'),
    empty: $('dlg-empty'), pick: $('dlg-pick'), close: $('dlg-close'), title: $('dlg-title'),
  };

  const usd = (n) => `$${n.toFixed(2)}`;
  const names = (id) => [...(COVERAGE[id] || [])].sort((a, b) => a.localeCompare(b));
  const count = (p) => (COVERAGE[p.coverage] || []).length;
  const label = (p) => `${p.gb}${p.voice ? ` + ${p.voice}` : ''}${p.sms ? ` + ${p.sms}` : ''}`;
  const plural = (n) => `${n} ${n === 1 ? 'country' : 'countries'}`;

  const kinds = Object.keys(PLANS).filter((k) => PLANS[k].length);
  let kind = kinds[0];
  let selected = 0;
  let sheetPlan = 0;

  // Fill a <ul> with countries matching the query; shows the empty note when nothing matches.
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
  }

  function select(i) {
    selected = i;
    [...list.children].forEach((el, n) => {
      el.classList.toggle('is-on', n === i);
      el.querySelector('.plan__pick').setAttribute('aria-checked', String(n === i));
    });
    summarise();
  }

  function render() {
    const recommended = PLANS[kind].findIndex((p) => p.tag);
    selected = recommended >= 0 ? recommended : 0;
    localNote.hidden = !PLANS[kind].some((p) => p.local);
    unlNote.hidden = kind !== 'unlimited';

    list.replaceChildren(...PLANS[kind].map((p, i) => {
      const el = document.createElement('div');
      el.className = 'plan' + (p.voice ? ' plan--voice' : '');
      el.setAttribute('role', 'presentation');
      el.innerHTML = `
        <button type="button" class="plan__pick" role="radio"></button>
        <span class="plan__dot" aria-hidden="true"></span>
        <span class="plan__data" aria-hidden="true"></span>
        ${p.voice || p.perDay ? '<span class="plan__voice" aria-hidden="true"></span>' : ''}
        <span class="plan__meta" aria-hidden="true"></span>
        ${p.coverage ? '<button type="button" class="plan__countries"></button>' : ''}
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
      } else if (p.perDay) {
        extra.textContent = p.perDay;
      }

      el.querySelector('.plan__meta').textContent = `${p.days} days`;
      el.querySelector('.plan__price').textContent = usd(p.price);
      el.querySelector('.plan__pick').setAttribute(
        'aria-label',
        `${label(p)}, ${p.days} days, ${usd(p.price)}${p.coverage ? `, ${plural(count(p))}` : ''}`);

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
      if (p.tag) {
        const t = document.createElement('span');
        t.className = 'plan__tag';
        t.textContent = p.tag;
        el.append(t);
      }
      el.querySelector('.plan__pick').addEventListener('click', () => select(i));
      return el;
    }));
    select(selected);
  }

  // Arrow keys move between plans, like a native radio group.
  list.addEventListener('keydown', (e) => {
    if (!e.target.classList.contains('plan__pick')) return;
    const n = PLANS[kind].length;
    const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    select((selected + step + n) % n);
    list.children[selected].querySelector('.plan__pick').focus();
  });

  // Tabs only appear when the region has more than one kind of plan.
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

  // Countries sheet: opens for any tile without changing the selected plan.
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
  // Clicking the dimmed backdrop (the dialog element itself) closes the sheet.
  dlg.el.addEventListener('click', (e) => { if (e.target === dlg.el) dlg.el.close(); });

  render();
})();
