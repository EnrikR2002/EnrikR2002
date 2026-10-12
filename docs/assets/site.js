const root = document.querySelector('[data-project-directory]');
if (root) {
  const search = document.querySelector('#project-search');
  const filters = [...document.querySelectorAll('[data-filter]')];
  const cards = [...root.querySelectorAll('[data-project]')];
  const counter = document.querySelector('[data-result-count]');
  const empty = document.querySelector('[data-empty]');
  const reset = document.querySelector('[data-reset]');
  const params = new URLSearchParams(location.search);
  let category = filters.some(f => f.dataset.filter === params.get('category')) ? params.get('category') : 'all';
  search.value = params.get('q') || '';
  function update(writeUrl = true) {
    const query = search.value.trim().toLowerCase();
    let count = 0;
    for (const card of cards) {
      const show = (category === 'all' || card.dataset.category === category) && card.dataset.search.includes(query);
      card.hidden = !show;
      if (show) count++;
    }
    for (const filter of filters) filter.setAttribute('aria-pressed', String(filter.dataset.filter === category));
    counter.textContent = `${count} ${count === 1 ? 'project' : 'projects'}`;
    empty.hidden = count !== 0;
    if (writeUrl) {
      const state = new URLSearchParams();
      if (category !== 'all') state.set('category', category);
      if (search.value.trim()) state.set('q', search.value.trim());
      const url = `${location.pathname}${state.size ? '?' + state : ''}${location.hash}`;
      history.replaceState(null, '', url);
    }
  }
  filters.forEach(button => button.addEventListener('click', () => { category = button.dataset.filter; update(); }));
  search.addEventListener('input', () => update());
  reset.addEventListener('click', () => { category = 'all'; search.value = ''; update(); search.focus(); });
  document.addEventListener('keydown', event => {
    const typing = /INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) || document.activeElement?.isContentEditable;
    if (event.key === '/' && !typing && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault(); search.focus();
    }
    if (event.key === 'Escape' && document.activeElement === search) { search.value = ''; update(); }
  });
  update(false);
}
const copyButton = document.querySelector('[data-copy-discord]');
if (copyButton) {
  const notice = document.querySelector('[data-copy-notice]');
  copyButton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(copyButton.dataset.copyDiscord);
      notice.textContent = 'Discord username copied.';
    } catch {
      notice.textContent = `Discord: ${copyButton.dataset.copyDiscord}`;
    }
  });
}
