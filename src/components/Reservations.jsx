import { Archive, XCircle } from 'lucide-react';
import EmptyState from './EmptyState.jsx';
import { reservationStatusLabel } from '../utils/books.js';
import CoverImage from './CoverImage.jsx';

function Reservations({ items, onCancel }) {
  return (
    <section className="page active">
      <h2 className="section-title">Mis reservas</h2>

      {!items.length ? (
        <EmptyState icon={Archive} title="No tienes reservas aun" text="Busca un libro y pulsa Reservar para crear una solicitud." />
      ) : (
        <div className="item-list">
          {items.map((item) => (
            <div className="item-row" key={item.rid}>
              <div className="thumb">
                {item.portada || item.portadas?.length ? <CoverImage book={item} alt="" placeholderSize={20} /> : <Archive size={22} />}
              </div>
              <div className="item-info">
                <div className="item-title">{item.titulo}</div>
                <div className="item-author mono">{item.rid} - {item.fecha}</div>
                <span className={`sbadge s-${item.estado}`}>{reservationStatusLabel(item.estado)}</span>
              </div>
              {item.estado !== 'cancelada' && (
                <button className="btn btn-ghost btn-sm" onClick={() => onCancel(item.rid)}>
                  <XCircle size={15} />
                  Cancelar
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default Reservations;
