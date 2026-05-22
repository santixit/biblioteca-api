import { Clock, RotateCcw, Search, Trash2 } from 'lucide-react';
import EmptyState from './EmptyState.jsx';

function History({ items, onClear, onRepeat }) {
  return (
    <section className="page active">
      <div className="section-header">
        <h2 className="section-title">Historial de busquedas</h2>
        {items.length > 0 && (
          <button className="btn btn-ghost btn-sm" onClick={onClear}>
            <Trash2 size={15} />
            Limpiar historial
          </button>
        )}
      </div>

      {!items.length ? (
        <EmptyState icon={Clock} title="Tu historial esta vacio" text="Las busquedas recientes apareceran aqui." />
      ) : (
        <div className="item-list">
          {items.map((item) => (
            <div className="hist-item" key={`${item.q}-${item.hora}`}>
              <Search size={16} />
              <span className="hist-q">{item.q}</span>
              <span className="hist-t">{item.hora}</span>
              <button className="hist-redo" onClick={() => onRepeat(item.q)}>
                <RotateCcw size={14} />
                Buscar
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default History;
