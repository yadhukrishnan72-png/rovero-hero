// Hero destination search. Swap DESTINATIONS for your real list / API (slug used for /destinations/{slug}).
const DESTINATIONS = [
  'Japan', 'France', 'Thailand', 'United States', 'United Kingdom', 'Italy', 'Spain', 'Germany',
  'United Arab Emirates', 'Singapore', 'Australia', 'Turkey', 'India', 'Indonesia', 'Canada',
  'Mexico', 'South Korea', 'Vietnam', 'Greece', 'Portugal', 'Switzerland', 'Netherlands',
];

(function initHeroSearch() {
  const form = document.querySelector('[data-hero-search]');
  if (!form) return;
  const input = form.querySelector('input');
  const list = form.querySelector('.hero-search__list');
  let active = -1;

  const slug = (n) => n.toLowerCase().replace(/\s+/g, '-');
  const items = () => [...list.children];

  function close() {
    list.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    active = -1;
  }

  function setActive(i) {
    items().forEach((li, n) => li.setAttribute('aria-selected', String(n === i)));
    active = i;
  }

  function render() {
    const q = input.value.trim().toLowerCase();
    const matches = q ? DESTINATIONS.filter((d) => d.toLowerCase().includes(q)).slice(0, 6) : [];
    list.replaceChildren(...matches.map((name) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      const a = document.createElement('a');
      a.href = `/destinations/${slug(name)}`;
      a.textContent = name;
      li.append(a);
      return li;
    }));
    list.hidden = !matches.length;
    input.setAttribute('aria-expanded', String(matches.length > 0));
    active = -1;
  }

  input.addEventListener('input', render);
  input.addEventListener('keydown', (e) => {
    const n = items().length;
    if (e.key === 'ArrowDown' && n) { e.preventDefault(); setActive((active + 1) % n); }
    else if (e.key === 'ArrowUp' && n) { e.preventDefault(); setActive((active - 1 + n) % n); }
    else if (e.key === 'Enter' && active >= 0) { e.preventDefault(); items()[active].firstChild.click(); }
    else if (e.key === 'Escape') close();
  });
  document.addEventListener('click', (e) => { if (!form.contains(e.target)) close(); });
})();
