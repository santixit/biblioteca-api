import { useEffect, useMemo, useRef, useState } from 'react';
import Header from './components/Header.jsx';
import Catalog from './components/Catalog.jsx';
import ReadingList from './components/ReadingList.jsx';
import Reservations from './components/Reservations.jsx';
import Favorites from './components/Favorites.jsx';
import History from './components/History.jsx';
import BookModal from './components/BookModal.jsx';
import Toasts from './components/Toasts.jsx';
import { BOOKS_PER_PAGE, DEFAULT_QUERY, EMPTY_FILTERS } from './constants.js';
import { useLocalStorage } from './hooks/useLocalStorage.js';
import { fetchBooks } from './services/openLibrary.js';
import { readingStatusLabel, reservationStatusLabel } from './utils/books.js';

function App() {
  const didLoad = useRef(false);
  const toastId = useRef(0);
  const [theme, setTheme] = useLocalStorage('cl_theme', 'dark');
  const [favorites, setFavorites] = useLocalStorage('cl_favs', []);
  const [readingList, setReadingList] = useLocalStorage('cl_rl', []);
  const [reservations, setReservations] = useLocalStorage('cl_res', []);
  const [history, setHistory] = useLocalStorage('cl_hist', []);
  const [bookCache, setBookCache] = useLocalStorage('cl_cache', {});

  const [currentTab, setCurrentTab] = useState('catalogo');
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState(DEFAULT_QUERY);
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [readingFilter, setReadingFilter] = useState('todos');
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (didLoad.current) return;
    didLoad.current = true;
    loadCatalog({ reset: true, nextQuery: DEFAULT_QUERY, nextFilters: EMPTY_FILTERS });
  }, []);

  const selectedBook = useMemo(() => findBookById(selectedBookId), [selectedBookId, books, bookCache, readingList]);
  const favoriteBooks = useMemo(
    () => favorites.map((id) => bookCache[id] || books.find((book) => book.id === id)).filter(Boolean),
    [favorites, bookCache, books],
  );

  function addToast(message, type = 'info') {
    const id = ++toastId.current;
    setToasts((items) => [...items, { id, message, type }]);
    setTimeout(() => {
      setToasts((items) => items.filter((toast) => toast.id !== id));
    }, 3200);
  }

  function cacheBooks(nextBooks) {
    setBookCache((current) => {
      const next = { ...current };
      nextBooks.forEach((book) => {
        next[book.id] = { ...next[book.id], ...book };
      });
      return next;
    });
  }

  async function loadCatalog({
    reset = true,
    nextQuery = query,
    nextOffset = reset ? 0 : offset,
    nextFilters = filters,
  } = {}) {
    setCurrentTab('catalogo');
    setLoading(true);
    setError('');

    try {
      const nextBooks = await fetchBooks({ query: nextQuery, offset: nextOffset, filters: nextFilters });
      cacheBooks(nextBooks);
      setBooks((current) => reset ? nextBooks : [...current, ...nextBooks]);
      setQuery(nextQuery);
      setFilters(nextFilters);
      setOffset(nextOffset);
      setHasMore(nextBooks.length >= BOOKS_PER_PAGE);
    } catch {
      setError('No se pudo conectar con Open Library. Verifica tu internet e intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(searchText = searchInput) {
    const text = searchText.trim();
    if (!text) {
      addToast('Escribe algo para buscar', 'warn');
      return;
    }

    setSearchInput(text);
    setHistory((items) => [
      { q: text, hora: new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }) },
      ...items.filter((item) => item.q !== text),
    ].slice(0, 30));

    await loadCatalog({ reset: true, nextQuery: text, nextFilters: EMPTY_FILTERS });
  }

  async function returnToCatalog() {
    setSearchInput('');
    await loadCatalog({ reset: true, nextQuery: DEFAULT_QUERY, nextFilters: EMPTY_FILTERS });
  }

  async function applyFilters(nextFilters) {
    await loadCatalog({ reset: true, nextQuery: query, nextFilters });
  }

  function findBookById(id) {
    if (!id) return null;
    return books.find((book) => book.id === id)
      || bookCache[id]
      || readingList.find((book) => book.id === id)
      || reservations.find((book) => book.id === id)
      || null;
  }

  function toggleFavorite(id) {
    setFavorites((items) => {
      if (items.includes(id)) {
        addToast('Quitado de favoritos', 'info');
        return items.filter((item) => item !== id);
      }
      const book = findBookById(id);
      if (book) cacheBooks([book]);
      addToast('Agregado a favoritos', 'success');
      return [...items, id];
    });
  }

  function addToReadingList(id) {
    const book = findBookById(id);
    if (!book) return;

    setReadingList((items) => {
      if (items.some((item) => item.id === id)) {
        addToast('Ya esta en tu lista de lectura', 'info');
        return items;
      }
      addToast('Agregado a la lista de lectura', 'success');
      return [{ ...book, estado: 'pendiente', agregadoEn: new Date().toISOString() }, ...items];
    });
  }

  function removeFromReadingList(id) {
    setReadingList((items) => items.filter((item) => item.id !== id));
    addToast('Eliminado de la lista de lectura', 'info');
  }

  function updateReadingStatus(id, status) {
    setReadingList((items) => items.map((item) => item.id === id ? { ...item, estado: status } : item));
    addToast(`Estado: ${readingStatusLabel(status)}`, 'success');
  }

  function reserveBook(id) {
    const book = findBookById(id);
    if (!book) return;

    const hasActiveReservation = reservations.some((item) => item.id === id && item.estado !== 'cancelada');
    if (hasActiveReservation) {
      addToast('Ya tienes una reserva activa para este libro', 'warn');
      return;
    }

    const rid = `RES-${Date.now().toString().slice(-6)}`;
    const reservation = {
      id: book.id,
      titulo: book.titulo,
      autores: book.autores,
      portada: book.portada,
      estado: 'solicitada',
      fecha: new Date().toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }),
      rid,
    };

    setReservations((items) => [reservation, ...items]);
    addToast('Reserva solicitada', 'success');

    setTimeout(() => {
      setReservations((items) => items.map((item) => (
        item.rid === rid && item.estado === 'solicitada'
          ? { ...item, estado: 'aprobada' }
          : item
      )));
      addToast(`Reserva de "${book.titulo}" aprobada`, 'success');
    }, 3000);
  }

  function cancelReservation(rid) {
    setReservations((items) => items.map((item) => (
      item.rid === rid ? { ...item, estado: 'cancelada' } : item
    )));
    addToast(`Reserva ${reservationStatusLabel('cancelada').toLowerCase()}`, 'info');
  }

  function updateCachedBook(book) {
    cacheBooks([book]);
  }

  return (
    <>
      <Header
        currentTab={currentTab}
        searchInput={searchInput}
        theme={theme}
        onLogoClick={returnToCatalog}
        onSearch={handleSearch}
        onSearchInput={setSearchInput}
        onTabChange={setCurrentTab}
        onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      />

      <main>
        {currentTab === 'catalogo' && (
          <Catalog
            books={books}
            error={error}
            favorites={favorites}
            filters={filters}
            hasMore={hasMore}
            loading={loading}
            query={query}
            onApplyFilters={applyFilters}
            onLoadMore={() => loadCatalog({ reset: false, nextOffset: offset + BOOKS_PER_PAGE })}
            onOpenBook={setSelectedBookId}
            onRetry={() => loadCatalog({ reset: true, nextQuery: query, nextFilters: filters })}
            onReturnToCatalog={returnToCatalog}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {currentTab === 'lectura' && (
          <ReadingList
            filter={readingFilter}
            items={readingList}
            onFilterChange={setReadingFilter}
            onRemove={removeFromReadingList}
            onStatusChange={updateReadingStatus}
          />
        )}

        {currentTab === 'reservas' && (
          <Reservations items={reservations} onCancel={cancelReservation} />
        )}

        {currentTab === 'favoritos' && (
          <Favorites
            books={favoriteBooks}
            favorites={favorites}
            onOpenBook={setSelectedBookId}
            onToggleFavorite={toggleFavorite}
          />
        )}

        {currentTab === 'historial' && (
          <History
            items={history}
            onClear={() => {
              setHistory([]);
              addToast('Historial limpiado', 'info');
            }}
            onRepeat={(text) => handleSearch(text)}
          />
        )}
      </main>

      {selectedBook && (
        <BookModal
          book={selectedBook}
          isFavorite={favorites.includes(selectedBook.id)}
          readingItem={readingList.find((item) => item.id === selectedBook.id)}
          onAddReading={addToReadingList}
          onClose={() => setSelectedBookId(null)}
          onRemoveReading={removeFromReadingList}
          onReserve={reserveBook}
          onToggleFavorite={toggleFavorite}
          onUpdateCachedBook={updateCachedBook}
          onUpdateReadingStatus={updateReadingStatus}
        />
      )}

      <Toasts items={toasts} />
    </>
  );
}

export default App;
