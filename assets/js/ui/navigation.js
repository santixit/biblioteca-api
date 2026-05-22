
import { state, TABS_ORDER } from '../core/state.js';

export function goToTab(tab) {
  state.currentTab = tab;
  document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
  document.getElementById('page-' + tab)?.classList.add('active');
  document.querySelectorAll('.nav-tab').forEach((btn, index) => {
    const active = TABS_ORDER[index] === tab;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', active);
  });
}

export function showToast(message, type = 'info') {
  const wrap = document.getElementById('toastsWrap');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  wrap.appendChild(toast);
  setTimeout(() => toast.remove(), 3200);
}

export function findBookById(id) {
  return state.allBooks.find(book => book.id === id)
    || state.bookCache[id]
    || state.readingList.find(book => book.id === id);
}

export function languageTag(code) {
  const map = { es:'ES', en:'EN', fr:'FR', de:'DE', pt:'PT', it:'IT', ja:'JA', zh:'ZH', und:'?' };
  return map[(code || 'und').substring(0, 2).toLowerCase()] || code.toUpperCase();
}
