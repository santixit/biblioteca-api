
import { state, persistState } from '../core/state.js';
import { findBookById, showToast } from '../ui/navigation.js';

export function addToReadingList(id) {
  const book = findBookById(id);
  if (!book) return;
  if (state.readingList.some(item => item.id === id)) {
    showToast('Ya está en tu lista de lectura', 'info');
    return;
  }
  state.readingList.push({ ...book, estado: 'pendiente', agregadoEn: new Date().toISOString() });
  persistState();
  showToast('Agregado a la lista de lectura 📖', 'success');
}

export function removeFromReadingList(id) {
  state.readingList = state.readingList.filter(item => item.id !== id);
  persistState();
  showToast('Eliminado de la lista de lectura', 'info');
}

export function updateReadingStatus(id, status) {
  const item = state.readingList.find(book => book.id === id);
  if (item) {
    item.estado = status;
    persistState();
    showToast(`Estado: ${readingStatusLabel(status)}`, 'success');
  }
}

export function readingStatusLabel(status) {
  return {
    pendiente: '⏳ Pendiente',
    leyendo: '📖 Leyendo',
    terminado: '✅ Terminado'
  }[status] || status;
}
