import { BookOpen, Trash2 } from 'lucide-react';
import EmptyState from './EmptyState.jsx';
import { readingStatusLabel } from '../utils/books.js';
import CoverImage from './CoverImage.jsx';

const filters = [
  { id: 'todos', label: 'Todos' },
  { id: 'pendiente', label: 'Pendiente' },
  { id: 'leyendo', label: 'Leyendo' },
  { id: 'terminado', label: 'Terminado' },
];

function ReadingList({ filter, items, onFilterChange, onRemove, onStatusChange }) {
  const visibleItems = filter === 'todos' ? items : items.filter((item) => item.estado === filter);

  return (
    <section className="page active">
      <h2 className="section-title">Lista de lectura</h2>
      <div className="rl-tabs">
        {filters.map((item) => (
          <button
            className={`rl-tab ${filter === item.id ? 'active' : ''}`}
            key={item.id}
            onClick={() => onFilterChange(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {!visibleItems.length ? (
        <EmptyState icon={BookOpen} title="No hay libros en esta categoria" text="Agrega libros desde el catalogo para organizar tu lectura." />
      ) : (
        <div className="item-list">
          {visibleItems.map((book) => (
            <div className="item-row" key={book.id}>
              <div className="thumb">
                {book.portada || book.portadas?.length ? <CoverImage book={book} alt="" placeholderSize={20} /> : <BookOpen size={22} />}
              </div>
              <div className="item-info">
                <div className="item-title">{book.titulo}</div>
                <div className="item-author">{book.autores}</div>
                <span className={`sbadge s-${book.estado}`}>{readingStatusLabel(book.estado)}</span>
              </div>
              <div className="item-actions">
                <select
                  className="filtro-select compact-select"
                  value={book.estado}
                  onChange={(event) => onStatusChange(book.id, event.target.value)}
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="leyendo">Leyendo</option>
                  <option value="terminado">Terminado</option>
                </select>
                <button className="icon-btn danger" onClick={() => onRemove(book.id)} aria-label="Quitar de la lista">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default ReadingList;
