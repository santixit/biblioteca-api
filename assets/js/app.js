
import { initTheme, toggleTheme } from './core/theme.js';
import { state } from './core/state.js';
import { goToTab, showToast } from './ui/navigation.js';
import { closeModal, openBookDetail } from './ui/modal.js';
import { performSearch, loadCatalog, loadMoreBooks, toggleFilters, closeFilters, applyFilters, clearFilters, renderFavoriteGrid } from './ui/catalog.js';
import { addToHistory, clearHistory } from './features/history.js';
import { addToReadingList, removeFromReadingList, updateReadingStatus, readingStatusLabel } from './features/readingList.js';
import { cancelReservation, reservationStatusLabel } from './features/reservations.js';

function renderReadingList() {
  const list = document.getElementById('rlList');
  const items = state.readingFilter === 'todos' ? state.readingList : state.readingList.filter(item => item.estado === state.readingFilter);
  if (!items.length) {
    list.innerHTML = `<div class="empty"><div class="empty-icon">📖</div><p>No hay libros en esta categoría.</p></div>`;
    return;
  }
  list.innerHTML = items.map(book => `
    <div class="item-row">
      <div class="thumb">${book.portada ? `<img src="${book.portada}" alt="" loading="lazy" onerror="this.parentElement.textContent='📗'">` : '📗'}</div>
      <div class="item-info">
        <div class="item-title">${book.titulo}</div>
        <div class="item-author">${book.autores}</div>
        <span class="sbadge s-${book.estado}">${readingStatusLabel(book.estado)}</span>
      </div>
      <div class="item-actions">
        <select class="filter-select reading-status-select" data-book-id="${book.id}" style="padding:5px 10px;font-size:.8rem">
          <option value="pendiente" ${book.estado === 'pendiente' ? 'selected' : ''}>⏳ Pendiente</option>
          <option value="leyendo" ${book.estado === 'leyendo' ? 'selected' : ''}>📖 Leyendo</option>
          <option value="terminado" ${book.estado === 'terminado' ? 'selected' : ''}>✅ Terminado</option>
        </select>
        <button class="btn btn-ghost btn-sm remove-reading-btn" data-book-id="${book.id}">✕</button>
      </div>
    </div>`).join('');

  list.querySelectorAll('.reading-status-select').forEach(select => {
    select.addEventListener('change', () => {
      updateReadingStatus(select.dataset.bookId, select.value);
      renderReadingList();
    });
  });

  list.querySelectorAll('.remove-reading-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      removeFromReadingList(btn.dataset.bookId);
      renderReadingList();
    });
  });
}

function renderReservations() {
  const list = document.getElementById('reservasList');
  if (!state.reservations.length) {
    list.innerHTML = `<div class="empty"><div class="empty-icon">🗂</div><p>No tienes reservas aún.<br>Busca un libro y pulsa "Reservar".</p></div>`;
    return;
  }
  list.innerHTML = state.reservations.map(item => `
    <div class="item-row">
      <div class="thumb">${item.portada ? `<img src="${item.portada}" alt="" loading="lazy" onerror="this.parentElement.textContent='📗'">` : '📗'}</div>
      <div class="item-info">
        <div class="item-title">${item.titulo}</div>
        <div class="item-author" style="font-family:var(--font-mono);font-size:.78rem">${item.rid} · ${item.fecha}</div>
        <span class="sbadge s-${item.estado}">${reservationStatusLabel(item.estado)}</span>
      </div>
      <div class="item-actions">
        ${item.estado !== 'cancelada' ? `<button class="btn btn-ghost btn-sm cancel-reservation-btn" data-rid="${item.rid}">Cancelar</button>` : ''}
      </div>
    </div>`).join('');

  list.querySelectorAll('.cancel-reservation-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      cancelReservation(btn.dataset.rid);
      renderReservations();
    });
  });
}

function renderHistory() {
  const list = document.getElementById('histList');
  if (!state.history.length) {
    list.innerHTML = `<div class="empty"><div class="empty-icon">🕐</div><p>Tu historial de búsquedas aparecerá aquí.</p></div>`;
    return;
  }
  list.innerHTML = state.history.map((item, index) => `
    <div class="hist-item" style="animation-delay:${index * 20}ms">
      <span>🔍</span>
      <span class="hist-q">${item.q}</span>
      <span class="hist-t">${item.hora}</span>
      <button class="hist-redo" data-query="${item.q}">↩ Buscar</button>
    </div>`).join('');

  list.querySelectorAll('.hist-redo').forEach(btn => {
    btn.addEventListener('click', () => repeatSearch(btn.dataset.query));
  });
}

async function repeatSearch(query) {
  document.getElementById('searchInput').value = query;
  goToTab('catalogo');
  state.currentSearch = query;
  state.offset = 0;
  state.allBooks = [];
  addToHistory(query);
  await loadCatalog(true);
}

async function backToStart() {
  document.getElementById('searchInput').value = '';
  state.currentSearch = 'novela';
  state.offset = 0;
  state.allBooks = [];
  clearFilters();
  goToTab('catalogo');
  await loadCatalog(true);
}

function bindGlobalEvents() {
  document.getElementById('themeBtn')?.addEventListener('click', toggleTheme);
  document.getElementById('logoBtn')?.addEventListener('click', backToStart);
  document.getElementById('searchBtn')?.addEventListener('click', performSearch);
  document.getElementById('searchInput')?.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') performSearch();
  });

  document.querySelectorAll('.nav-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      goToTab(tab);
      if (tab === 'lectura') renderReadingList();
      if (tab === 'reservas') renderReservations();
      if (tab === 'favoritos') renderFavoriteGrid();
      if (tab === 'historial') renderHistory();
    });
  });

  document.querySelectorAll('.rl-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      state.readingFilter = btn.dataset.rl;
      document.querySelectorAll('.rl-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.rl === state.readingFilter));
      renderReadingList();
    });
  });

  document.getElementById('btnFiltros')?.addEventListener('click', toggleFilters);
  document.getElementById('closeFiltrosBtn')?.addEventListener('click', closeFilters);
  document.getElementById('applyFiltersBtn')?.addEventListener('click', async () => {
    await applyFilters();
    closeFilters();
  });
  document.getElementById('clearFiltersBtn')?.addEventListener('click', clearFilters);
  document.getElementById('loadMoreBtn')?.addEventListener('click', loadMoreBooks);
  document.getElementById('clearHistoryBtn')?.addEventListener('click', () => {
    clearHistory();
    renderHistory();
    showToast('Historial limpiado', 'info');
  });

  document.getElementById('closeModalBtn')?.addEventListener('click', closeModal);
  document.getElementById('bookOverlay')?.addEventListener('click', (event) => {
    if (event.target.id === 'bookOverlay') closeModal();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal();
  });
}

function createFiltersBackdrop() {
  const backdrop = document.createElement('div');
  backdrop.id = 'filtrosBackdrop';
  backdrop.className = 'filtros-backdrop';
  backdrop.onclick = closeFilters;
  document.body.appendChild(backdrop);
}

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  createFiltersBackdrop();
  bindGlobalEvents();
  await loadCatalog(true);
  renderReadingList();
  renderReservations();
  renderFavoriteGrid();
  renderHistory();
});
