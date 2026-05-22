
import { state, persistState } from '../core/state.js';

export function addToHistory(query) {
  state.history = [{
    q: query,
    hora: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })
  }, ...state.history.filter(item => item.q !== query)].slice(0, 30);
  persistState();
}

export function clearHistory() {
  state.history = [];
  persistState();
}
