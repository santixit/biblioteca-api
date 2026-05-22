
import { state, persistState } from '../core/state.js';
import { renderFavoriteGrid } from '../ui/catalog.js';
import { showToast } from '../ui/navigation.js';

export function isFavorite(id) {
  return state.favorites.includes(id);
}

export function toggleFavorite(id) {
  if (isFavorite(id)) {
    state.favorites = state.favorites.filter(item => item !== id);
    showToast('Quitado de favoritos', 'info');
  } else {
    state.favorites.push(id);
    showToast('¡Agregado a favoritos! ⭐', 'success');
  }
  persistState();
  refreshFavoriteButtons(id);
  if (state.currentTab === 'favoritos') renderFavoriteGrid();
}

export function refreshFavoriteButtons(id) {
  document.querySelectorAll('.btn-fav').forEach(btn => {
    if ((btn.dataset.bookId || '') === id) {
      const favorite = isFavorite(id);
      btn.classList.toggle('active', favorite);
      btn.textContent = favorite ? '⭐' : '☆';
      btn.setAttribute('aria-label', favorite ? 'Quitar favorito' : 'Agregar favorito');
    }
  });

  const modalBtn = document.getElementById('btnFavModal');
  if (modalBtn && modalBtn.dataset.bookId === id) {
    modalBtn.textContent = isFavorite(id) ? '⭐ En favoritos' : '☆ Favorito';
  }
}
