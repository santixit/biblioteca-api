import { BookMarked, Star } from 'lucide-react';
import { languageTag } from '../utils/books.js';

function BookCard({ book, favorite, onOpen, onToggleFavorite }) {
  return (
    <article className="book-card">
      <button className="book-card-main" onClick={() => onOpen(book.id)} aria-label={`Ver detalles de ${book.titulo}`}>
        <div className="book-cover">
          {book.portada ? (
            <img src={book.portada} alt={`Portada de ${book.titulo}`} loading="lazy" />
          ) : (
            <div className="cover-ph"><BookMarked size={32} /></div>
          )}
        </div>
        <div className="book-info">
          <h3 className="book-title">{book.titulo}</h3>
          <p className="book-author">{book.autores}</p>
          <div className="book-meta">
            {book.anio !== '-' && <span className="tag">{book.anio}</span>}
            <span className="tag tag-a">{languageTag(book.idioma)}</span>
          </div>
        </div>
      </button>

      <div className="card-actions">
        <button className="btn btn-ghost btn-sm" onClick={() => onOpen(book.id)}>
          Ver mas
        </button>
        <button
          className={`btn-fav ${favorite ? 'active' : ''}`}
          onClick={() => onToggleFavorite(book.id)}
          aria-label={favorite ? 'Quitar favorito' : 'Agregar favorito'}
          title={favorite ? 'Quitar favorito' : 'Agregar favorito'}
        >
          <Star size={16} fill={favorite ? 'currentColor' : 'none'} />
        </button>
      </div>
    </article>
  );
}

export default BookCard;
