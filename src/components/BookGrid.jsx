import BookCard from './BookCard.jsx';

function BookGrid({ books, favorites, onOpenBook, onToggleFavorite }) {
  return (
    <div className="books-grid">
      {books.map((book) => (
        <BookCard
          book={book}
          favorite={favorites.includes(book.id)}
          key={book.id}
          onOpen={onOpenBook}
          onToggleFavorite={onToggleFavorite}
        />
      ))}
    </div>
  );
}

export default BookGrid;
