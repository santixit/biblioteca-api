
import { state, persistState } from '../core/state.js';
import { findBookById, showToast } from '../ui/navigation.js';

export function reservationStatusLabel(status) {
  return {
    solicitada: '🕐 Solicitada',
    aprobada: '✅ Aprobada',
    cancelada: '✕ Cancelada'
  }[status] || status;
}

export function reserveBook(id, onUpdate) {
  const book = findBookById(id);
  if (!book) return;
  if (state.reservations.find(item => item.id === id && item.estado !== 'cancelada')) {
    showToast('Ya tienes una reserva activa para este libro', 'warn');
    return;
  }

  const reservation = {
    id: book.id,
    titulo: book.titulo,
    autores: book.autores,
    portada: book.portada,
    estado: 'solicitada',
    fecha: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
    rid: 'RES-' + Date.now().toString().slice(-6),
  };

  state.reservations.unshift(reservation);
  persistState();
  showToast('✅ Reserva solicitada', 'success');
  if (onUpdate) onUpdate();

  setTimeout(() => {
    const current = state.reservations.find(item => item.rid === reservation.rid);
    if (current && current.estado === 'solicitada') {
      current.estado = 'aprobada';
      persistState();
      showToast(`📗 Reserva de "${book.titulo}" aprobada`, 'success');
      if (onUpdate) onUpdate();
    }
  }, 3000);
}

export function cancelReservation(rid) {
  const reservation = state.reservations.find(item => item.rid === rid);
  if (reservation) {
    reservation.estado = 'cancelada';
    persistState();
    showToast('Reserva cancelada', 'info');
  }
}
