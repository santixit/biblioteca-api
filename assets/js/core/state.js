
import { loadLS, saveLS } from './storage.js';

export const TABS_ORDER = ['catalogo', 'lectura', 'reservas', 'favoritos', 'historial'];
export const BOOKS_PER_PAGE = 30;

export const state = {
  allBooks: [],
  visibleBooks: [],
  currentSearch: 'novela',
  currentTab: 'catalogo',
  readingFilter: 'todos',
  offset: 0,
  favorites: loadLS('cl_favs', []),
  readingList: loadLS('cl_rl', []),
  reservations: loadLS('cl_res', []),
  history: loadLS('cl_hist', []),
  bookCache: loadLS('cl_cache', {})
};

export function persistState() {
  saveLS('cl_favs', state.favorites);
  saveLS('cl_rl', state.readingList);
  saveLS('cl_res', state.reservations);
  saveLS('cl_hist', state.history);
  saveLS('cl_cache', state.bookCache);
}
