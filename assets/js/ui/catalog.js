
import { state, BOOKS_PER_PAGE, persistState } from '../core/state.js';
import { fetchBooks, mapBook } from '../services/openLibrary.js';
import { addToHistory } from '../features/history.js';
import { isFavorite, toggleFavorite } from '../features/favorites.js';
import { openBookDetail } from './modal.js';
import { showToast, languageTag } from './navigation.js';

const LANG_MAP = { es:'spa', en:'eng', fr:'fre', de:'ger', pt:'por', it:'ita', ja:'jpn' };
const LANG_LABELS = { es:'Español', en:'Inglés', fr:'Francés', pt:'Portugués', de:'Alemán', it:'Italiano', ja:'Japonés' };

export function skeletonHTML(n = 12) {
  const card = `
    <div class="book-card-skeleton">
      <div class="skeleton skeleton-cover"></div>
      <div class="skeleton-body">
        <div class="skeleton skeleton-title"></div>
        <div class="skeleton skeleton-title-2"></div>
        <div class="skeleton skeleton-author"></div>
        <div style="display:flex;gap:5px;margin-top:4px">
          <div class="skeleton skeleton-tag"></div>
          <div class="skeleton skeleton-tag"></div>
        </div>
      </div>
      <div class="skeleton-footer skeleton"></div>
    </div>`;
  return `<div class="books-grid">${card.repeat(n)}</div><p class="loading-msg">Conectando con Open Library…</p>`;
}

export async function performSearch() {
  const text = document.getElementById('searchInput').value.trim();
  if (!text) {
    showToast('Escribe algo para buscar', 'warn');
    return;
  }
  state.currentSearch = text;
  state.offset = 0;
  state.allBooks = [];
  addToHistory(text);
  await loadCatalog(true);
}

export async function loadCatalog(reset = true) {
  const container = document.getElementById('booksContainer');
  if (reset) {
    container.innerHTML = skeletonHTML(BOOKS_PER_PAGE);
    document.getElementById('loadMoreWrap').style.display = 'none';
  }

  try {
    const books = (await fetchBooks(state.currentSearch, state.offset)).map(mapBook);
    books.forEach(book => { state.bookCache[book.id] = book; });
    persistState();
    state.allBooks = reset ? books : [...state.allBooks, ...books];

    const hasFilters = document.getElementById('filterLang')?.value || document.getElementById('filterYear')?.value || document.getElementById('filterGenre')?.value;
    if (hasFilters) {
      await applyFilters();
    } else {
      state.visibleBooks = state.allBooks;
      renderBookGrid();
      document.getElementById('resultsInfo').textContent = state.visibleBooks.length ? `${state.visibleBooks.length} resultado(s)` : '';
    }

    document.getElementById('loadMoreWrap').style.display = books.length >= BOOKS_PER_PAGE ? 'block' : 'none';
  } catch {
    container.innerHTML = `<div class="state-box"><div class="icon">⚠️</div><p>No se pudo conectar con Open Library.<br>Verifica tu internet e intenta de nuevo.</p><button class="btn btn-primary" id="retryCatalogBtn">Reintentar</button></div>`;
    document.getElementById('retryCatalogBtn')?.addEventListener('click', () => loadCatalog(true));
  }
}

export function loadMoreBooks() {
  state.offset += BOOKS_PER_PAGE;
  loadCatalog(false);
}

export function toggleFilters() {
  const panel = document.getElementById('filtrosPanel');
  panel.classList.contains('visible') ? closeFilters() : openFilters();
}

export function openFilters() {
  document.getElementById('filtrosPanel').classList.add('visible');
  document.getElementById('btnFiltros').classList.add('abierto');
  document.getElementById('filtrosBackdrop')?.classList.add('visible');
}

export function closeFilters() {
  document.getElementById('filtrosPanel')?.classList.remove('visible');
  document.getElementById('btnFiltros')?.classList.remove('abierto');
  document.getElementById('filtrosBackdrop')?.classList.remove('visible');
}

export async function applyFilters() {
  const language = (document.getElementById('filterLang')?.value || '').trim();
  const year = (document.getElementById('filterYear')?.value || '').trim();
  const genre = (document.getElementById('filterGenre')?.value || '').trim().toLowerCase();

  updateFilterChips(language, year, genre);
  updateFilterBadge(language, year, genre);

  const queryParts = [];
  if (state.currentSearch && state.currentSearch !== 'literatura') queryParts.push(state.currentSearch);
  if (genre) queryParts.push(genre);
  const finalQuery = queryParts.join(' ') || state.currentSearch || 'literatura';

  const container = document.getElementById('booksContainer');
  container.innerHTML = skeletonHTML(BOOKS_PER_PAGE);
  document.getElementById('loadMoreWrap').style.display = 'none';

  try {
    let url = `https://openlibrary.org/search.json?q=${encodeURIComponent(finalQuery)}&offset=0&limit=${BOOKS_PER_PAGE}&fields=key,title,author_name,first_publish_year,language,publisher,subject,isbn,cover_i,number_of_pages_median,edition_count`;
    if (language) url += `&language=${LANG_MAP[language] || language}`;
    if (year) url += `&published_in=${year}-2030`;

    const response = await fetch(url);
    if (!response.ok) throw new Error();
    const books = ((await response.json()).docs || []).map(mapBook);

    books.forEach(book => { state.bookCache[book.id] = book; });
    persistState();
    state.allBooks = books;
    state.offset = 0;
    state.visibleBooks = year ? books.filter(book => {
      const currentYear = parseInt(book.año, 10);
      return !isNaN(currentYear) && currentYear >= parseInt(year, 10);
    }) : books;

    renderBookGrid();
    document.getElementById('resultsInfo').textContent = state.visibleBooks.length ? `${state.visibleBooks.length} resultado(s)` : '';
    document.getElementById('loadMoreWrap').style.display = books.length >= BOOKS_PER_PAGE ? 'block' : 'none';
  } catch {
    container.innerHTML = `<div class="state-box"><div class="icon">⚠️</div><p>No se pudo aplicar el filtro. Intenta de nuevo.</p><button class="btn btn-primary" id="retryFilterBtn">Reintentar</button></div>`;
    document.getElementById('retryFilterBtn')?.addEventListener('click', () => applyFilters());
  }
}

export function clearFilters() {
  ['filterLang', 'filterYear', 'filterGenre'].forEach(id => {
    const field = document.getElementById(id);
    if (field) field.value = '';
  });
  updateFilterChips('', '', '');
  updateFilterBadge('', '', '');
  loadCatalog(true);
}

export function removeSingleFilter(id) {
  const field = document.getElementById(id);
  if (field) field.value = '';
  const language = document.getElementById('filterLang')?.value || '';
  const year = document.getElementById('filterYear')?.value || '';
  const genre = document.getElementById('filterGenre')?.value || '';
  if (!language && !year && !genre) {
    updateFilterChips('', '', '');
    updateFilterBadge('', '', '');
    loadCatalog(true);
  } else {
    applyFilters();
  }
}

function chipHTML(filterId, text) {
  return `<span class="chip">${text}<button class="chip-x" data-filter-id="${filterId}" title="Quitar filtro">✕</button></span>`;
}

function updateFilterChips(language, year, genre) {
  const container = document.getElementById('filtrosChips');
  if (!container) return;
  let chips = '';
  if (language) chips += chipHTML('filterLang', '🌐 ' + (LANG_LABELS[language] || language));
  if (year) chips += chipHTML('filterYear', '📅 Desde ' + year);
  if (genre) chips += chipHTML('filterGenre', '📂 ' + genre);
  container.innerHTML = chips;
  container.querySelectorAll('.chip-x').forEach(btn => btn.addEventListener('click', () => removeSingleFilter(btn.dataset.filterId)));
}

function updateFilterBadge(language, year, genre) {
  const badge = document.getElementById('filtrosBadge');
  const activeFilters = [language, year, genre].filter(Boolean).length;
  if (!badge) return;
  badge.style.display = activeFilters > 0 ? 'inline-flex' : 'none';
  badge.textContent = activeFilters;
}

export function renderBookGrid() {
  const container = document.getElementById('booksContainer');
  if (!state.visibleBooks.length) {
    container.innerHTML = `<div class="state-box"><div class="icon">📭</div><p>No se encontraron libros con esos criterios.</p></div>`;
    return;
  }
  container.innerHTML = `<div class="books-grid">${state.visibleBooks.map((book, index) => cardHTML(book, index)).join('')}</div>`;
  bindBookCardEvents(container);
}

export function renderFavoriteGrid() {
  const grid = document.getElementById('favGrid');
  const favoriteBooks = state.favorites.map(id => state.bookCache[id] || state.allBooks.find(book => book.id === id)).filter(Boolean);
  if (!favoriteBooks.length) {
    grid.innerHTML = `<div class="empty" style="grid-column:1/-1"><div class="empty-icon">☆</div><p>Aún no tienes favoritos.<br>Explora el catálogo y guarda los que más te gusten.</p></div>`;
    return;
  }
  grid.innerHTML = favoriteBooks.map((book, index) => cardHTML(book, index)).join('');
  bindBookCardEvents(grid);
}

function cardHTML(book, index = 0) {
  const favorite = isFavorite(book.id);
  return `
    <div class="book-card" data-book-id="${book.id}" style="animation-delay:${Math.min(index * 35, 400)}ms" tabindex="0" role="button" aria-label="Ver detalles de ${book.titulo}">
      <div class="book-cover">
        ${book.portada ? `<img src="${book.portada}" alt="Portada de ${book.titulo}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=cover-ph>📗</div>'">` : `<div class="cover-ph">📗</div>`}
      </div>
      <div class="book-info">
        <div class="book-title">${book.titulo}</div>
        <div class="book-author">${book.autores}</div>
        <div class="book-meta">
          ${book.año !== '—' ? `<span class="tag">${book.año}</span>` : ''}
          <span class="tag tag-a">${languageTag(book.idioma)}</span>
        </div>
      </div>
      <div class="card-actions">
        <button class="btn btn-ghost btn-sm open-detail-btn" data-book-id="${book.id}">Ver más</button>
        <button class="btn-fav ${favorite ? 'active' : ''}" data-book-id="${book.id}" aria-label="${favorite ? 'Quitar favorito' : 'Agregar favorito'}">${favorite ? '⭐' : '☆'}</button>
      </div>
    </div>`;
}

function bindBookCardEvents(scope) {
  scope.querySelectorAll('.book-card').forEach(card => {
    card.addEventListener('click', (event) => {
      if (event.target.closest('.card-actions')) return;
      openBookDetail(card.dataset.bookId, rerenderCurrentViews);
    });
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') openBookDetail(card.dataset.bookId, rerenderCurrentViews);
    });
  });

  scope.querySelectorAll('.open-detail-btn').forEach(btn => {
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      openBookDetail(btn.dataset.bookId, rerenderCurrentViews);
    });
  });

  scope.querySelectorAll('.btn-fav').forEach(btn => {
    btn.addEventListener('click', (event) => {
      event.stopPropagation();
      toggleFavorite(btn.dataset.bookId);
    });
  });
}

function rerenderCurrentViews() {
  renderBookGrid();
  renderFavoriteGrid();
}
