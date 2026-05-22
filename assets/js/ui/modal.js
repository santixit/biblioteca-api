
import { fetchDescription } from '../services/openLibrary.js';
import { state, persistState } from '../core/state.js';
import { findBookById, languageTag } from './navigation.js';
import { isFavorite, toggleFavorite } from '../features/favorites.js';
import { addToReadingList, removeFromReadingList, updateReadingStatus } from '../features/readingList.js';
import { reserveBook } from '../features/reservations.js';

export async function openBookDetail(id, onUpdate) {
  const book = findBookById(id);
  if (!book) return;

  const readingItem = state.readingList.find(item => item.id === id);
  document.getElementById('mHead').innerHTML = buildHeader(book, readingItem);
  document.getElementById('mBody').innerHTML = `
    <div class="modal-stats">
      <div class="stat-box"><div class="stat-val">${book.paginas}</div><div class="stat-lbl">Páginas</div></div>
      <div class="stat-box"><div class="stat-val">${book.año}</div><div class="stat-lbl">Publicación</div></div>
      <div class="stat-box"><div class="stat-val">${languageTag(book.idioma)}</div><div class="stat-lbl">Idioma</div></div>
      <div class="stat-box"><div class="stat-val">${book.ediciones}</div><div class="stat-lbl">Ediciones</div></div>
    </div>
    <h4>Descripción</h4>
    <p id="descTexto"><span class="spinner" style="width:18px;height:18px;border-width:2px"></span> Cargando...</p>`;

  document.getElementById('bookOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  bindModalEvents(onUpdate, id);

  const description = await fetchDescription(book.id);
  const desc = document.getElementById('descTexto');
  if (desc) desc.textContent = description;
  if (state.bookCache[id]) {
    state.bookCache[id].descripcion = description;
    persistState();
  }
}

function buildHeader(book, readingItem) {
  return `
    <div class="modal-cover">
      ${book.portada ? `<img src="${book.portada}" alt="Portada" onerror="this.parentElement.innerHTML='<div class=modal-cover-ph>📗</div>'">` : `<div class="modal-cover-ph">📗</div>`}
    </div>
    <div class="modal-meta">
      <div class="modal-title">${book.titulo}</div>
      <div class="modal-author">✍️ ${book.autores}</div>
      <div class="modal-tags">
        ${book.año !== '—' ? `<span class="tag">${book.año}</span>` : ''}
        <span class="tag tag-a">${languageTag(book.idioma)}</span>
        ${book.categorias.slice(0, 2).map(category => `<span class="tag">${category}</span>`).join('')}
        ${book.isbn ? `<span class="tag" style="font-family:var(--font-mono)">ISBN: ${book.isbn}</span>` : ''}
      </div>
      <div class="modal-actions">
        <button class="btn btn-primary btn-sm" id="reserveBtn">🗂 Reservar</button>
        <button class="btn btn-ghost btn-sm" id="btnFavModal" data-book-id="${book.id}">${isFavorite(book.id) ? '⭐ En favoritos' : '☆ Favorito'}</button>
        ${!readingItem
          ? `<button class="btn btn-ghost btn-sm" id="addToReadingListBtn">📖 + Lista de lectura</button>`
          : `<select class="filter-select" id="readingStatusSelect" style="padding:5px 10px;font-size:.8rem">
               <option value="pendiente" ${readingItem.estado === 'pendiente' ? 'selected' : ''}>⏳ Pendiente</option>
               <option value="leyendo" ${readingItem.estado === 'leyendo' ? 'selected' : ''}>📖 Leyendo</option>
               <option value="terminado" ${readingItem.estado === 'terminado' ? 'selected' : ''}>✅ Terminado</option>
             </select>
             <button class="btn btn-ghost btn-sm" id="removeFromReadingListBtn">✕</button>`}
        <a href="${book.previewLink}" target="_blank" rel="noopener" class="btn btn-ghost btn-sm">🔗 Open Library</a>
      </div>
    </div>`;
}

function bindModalEvents(onUpdate, bookId) {
  document.getElementById('reserveBtn')?.addEventListener('click', () => {
    reserveBook(bookId, onUpdate);
    closeModal();
  });

  document.getElementById('btnFavModal')?.addEventListener('click', () => {
    toggleFavorite(bookId);
    onUpdate?.();
  });

  document.getElementById('addToReadingListBtn')?.addEventListener('click', () => {
    addToReadingList(bookId);
    onUpdate?.();
    openBookDetail(bookId, onUpdate);
  });

  document.getElementById('removeFromReadingListBtn')?.addEventListener('click', () => {
    removeFromReadingList(bookId);
    onUpdate?.();
    closeModal();
  });

  document.getElementById('readingStatusSelect')?.addEventListener('change', (event) => {
    updateReadingStatus(bookId, event.target.value);
    onUpdate?.();
  });
}

export function closeModal() {
  document.getElementById('bookOverlay').classList.remove('open');
  document.body.style.overflow = '';
}
