import { SlidersHorizontal, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { LANG_LABELS } from '../constants.js';
import { activeFilterCount } from '../utils/books.js';

function FiltersPanel({ filters, onApply }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const count = activeFilterCount(filters);

  useEffect(() => {
    setDraft(filters);
  }, [filters]);

  function updateField(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function apply(nextFilters = draft) {
    onApply(nextFilters);
    setOpen(false);
  }

  function removeFilter(field) {
    const next = { ...filters, [field]: '' };
    setDraft(next);
    apply(next);
  }

  return (
    <div className="filters-wrap">
      <button className={`btn-filtros ${open ? 'abierto' : ''}`} onClick={() => setOpen((value) => !value)}>
        <SlidersHorizontal size={16} />
        Filtros
        {count > 0 && <span className="filtros-badge">{count}</span>}
      </button>

      <div className={`filtros-panel ${open ? 'visible' : ''}`}>
        <div className="filtros-panel-header">
          <span className="filtros-panel-title">Filtros</span>
          <button className="filtros-panel-close" onClick={() => setOpen(false)} aria-label="Cerrar filtros">
            <X size={16} />
          </button>
        </div>

        <label className="filtro-group">
          <span className="filtro-label">Idioma</span>
          <select className="filtro-select" value={draft.language} onChange={(event) => updateField('language', event.target.value)}>
            <option value="">Todos los idiomas</option>
            <option value="es">Espanol</option>
            <option value="en">Ingles</option>
            <option value="fr">Frances</option>
            <option value="pt">Portugues</option>
            <option value="de">Aleman</option>
            <option value="it">Italiano</option>
            <option value="ja">Japones</option>
          </select>
        </label>

        <label className="filtro-group">
          <span className="filtro-label">Ano desde</span>
          <input
            className="filtro-input"
            inputMode="numeric"
            maxLength={4}
            placeholder="ej. 2000"
            value={draft.year}
            onChange={(event) => updateField('year', event.target.value.replace(/\D/g, '').slice(0, 4))}
          />
        </label>

        <label className="filtro-group">
          <span className="filtro-label">Tema o genero</span>
          <input
            className="filtro-input"
            placeholder="ej. terror, romance..."
            value={draft.genre}
            onChange={(event) => updateField('genre', event.target.value)}
          />
        </label>

        <div className="filtros-panel-footer">
          <button className="btn-filtro-limpiar" onClick={() => apply({ language: '', year: '', genre: '' })}>
            Limpiar
          </button>
          <button className="btn-filtro-aplicar" onClick={() => apply()}>
            Aplicar
          </button>
        </div>
      </div>

      {open && <button className="filtros-backdrop visible" aria-label="Cerrar filtros" onClick={() => setOpen(false)} />}

      {count > 0 && (
        <div className="filtros-chips">
          {filters.language && (
            <span className="chip">
              {LANG_LABELS[filters.language] || filters.language}
              <button className="chip-x" onClick={() => removeFilter('language')} aria-label="Quitar filtro idioma">
                <X size={12} />
              </button>
            </span>
          )}
          {filters.year && (
            <span className="chip">
              Desde {filters.year}
              <button className="chip-x" onClick={() => removeFilter('year')} aria-label="Quitar filtro ano">
                <X size={12} />
              </button>
            </span>
          )}
          {filters.genre && (
            <span className="chip">
              {filters.genre}
              <button className="chip-x" onClick={() => removeFilter('genre')} aria-label="Quitar filtro tema">
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default FiltersPanel;
