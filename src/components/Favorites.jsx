import { Star } from 'lucide-react';
import BookGrid from './BookGrid.jsx';
import EmptyState from './EmptyState.jsx';

function Favorites({ books, favorites, onOpenBook, onToggleFavorite }) {
  return (
    <section className="page active">
      <h2 className="section-title">Favoritos</h2>
      {!books.length ? (
        <EmptyState icon={Star} title="Aun no tienes favoritos" text="Explora el catalogo y guarda los libros que mas te interesen." />
      ) : (
        <BookGrid books={books} favorites={favorites} onOpenBook={onOpenBook} onToggleFavorite={onToggleFavorite} />
      )}
    </section>
  );
}

export default Favorites;
