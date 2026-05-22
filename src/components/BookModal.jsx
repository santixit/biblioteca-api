import { Archive, BookMarked, BookOpen, ExternalLink, Star, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fetchDescription } from '../services/openLibrary.js';
import { languageTag, readingStatusLabel } from '../utils/books.js';

function BookModal({
  book,
  isFavorite,
  readingItem,
  onAddReading,
  onClose,
  onRemoveReading,
  onReserve,
  onToggleFavorite,
  onUpdateCachedBook,
  onUpdateReadingStatus,
}) {
  const [description, setDescription] = useState(book.descripcion || '');
  const [loadingDescription, setLoadingDescription] = useState(!book.descripcion);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    let active = true;
    setDescription(book.descripcion || '');
    setLoadingDescription(!book.descripcion);

    if (!book.descripcion) {
      fetchDescription(book.id).then((text) => {
        if (!active) return;
        setDescription(text);
        setLoadingDescription(false);
        onUpdateCachedBook({ ...book, descripcion: text });
      });
    }

    return () => {
      active = false;
    };
  }, [book.id]);

  return (
    <div className="overlay open" role="dialog" aria-modal="true" aria-label="Detalle del libro" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <button className="close-btn" onClick={onClose} aria-label="Cerrar">
          <X size={18} />
        </button>

        <div className="modal-header">
          <div className="modal-cover">
            {book.portada ? (
              <img src={book.portada} alt={`Portada de ${book.titulo}`} />
            ) : (
              <div className="modal-cover-ph"><BookMarked size={34} /></div>
            )}
          </div>

          <div className="modal-meta">
            <h2 className="modal-title">{book.titulo}</h2>
            <p className="modal-author">{book.autores}</p>
            <div className="modal-tags">
              {book.anio !== '-' && <span className="tag">{book.anio}</span>}
              <span className="tag tag-a">{languageTag(book.idioma)}</span>
              {book.categorias.slice(0, 2).map((category) => <span className="tag" key={category}>{category}</span>)}
              {book.isbn && <span className="tag">ISBN: {book.isbn}</span>}
            </div>

            <div className="modal-actions">
              <button className="btn btn-primary btn-sm" onClick={() => { onReserve(book.id); onClose(); }}>
                <Archive size={15} />
                Reservar
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => onToggleFavorite(book.id)}>
                <Star size={15} fill={isFavorite ? 'currentColor' : 'none'} />
                {isFavorite ? 'En favoritos' : 'Favorito'}
              </button>
              {!readingItem ? (
                <button className="btn btn-ghost btn-sm" onClick={() => onAddReading(book.id)}>
                  <BookOpen size={15} />
                  Lista de lectura
                </button>
              ) : (
                <>
                  <select
                    className="filtro-select modal-select"
                    value={readingItem.estado}
                    onChange={(event) => onUpdateReadingStatus(book.id, event.target.value)}
                    aria-label="Estado de lectura"
                  >
                    <option value="pendiente">{readingStatusLabel('pendiente')}</option>
                    <option value="leyendo">{readingStatusLabel('leyendo')}</option>
                    <option value="terminado">{readingStatusLabel('terminado')}</option>
                  </select>
                  <button className="btn btn-ghost btn-sm" onClick={() => { onRemoveReading(book.id); onClose(); }}>
                    Quitar
                  </button>
                </>
              )}
              <a href={book.previewLink} target="_blank" rel="noreferrer" className="btn btn-ghost btn-sm">
                <ExternalLink size={15} />
                Open Library
              </a>
            </div>
          </div>
        </div>

        <div className="modal-body">
          <div className="modal-stats">
            <div className="stat-box"><div className="stat-val">{book.paginas}</div><div className="stat-lbl">Paginas</div></div>
            <div className="stat-box"><div className="stat-val">{book.anio}</div><div className="stat-lbl">Publicacion</div></div>
            <div className="stat-box"><div className="stat-val">{languageTag(book.idioma)}</div><div className="stat-lbl">Idioma</div></div>
            <div className="stat-box"><div className="stat-val">{book.ediciones}</div><div className="stat-lbl">Ediciones</div></div>
          </div>
          <h3>Descripcion</h3>
          <p>{loadingDescription ? 'Cargando descripcion...' : description}</p>
        </div>
      </div>
    </div>
  );
}

export default BookModal;
