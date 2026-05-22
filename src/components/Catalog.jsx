import { ArrowLeft, BookOpen, RefreshCw } from 'lucide-react';
import { DEFAULT_QUERY } from '../constants.js';
import { activeFilterCount } from '../utils/books.js';
import BookGrid from './BookGrid.jsx';
import EmptyState from './EmptyState.jsx';
import FiltersPanel from './FiltersPanel.jsx';
import SkeletonGrid from './SkeletonGrid.jsx';

function Catalog({
  books,
  error,
  favorites,
  filters,
  hasMore,
  loading,
  query,
  onApplyFilters,
  onLoadMore,
  onOpenBook,
  onRetry,
  onReturnToCatalog,
  onToggleFavorite,
}) {
  const hasCustomSearch = query !== DEFAULT_QUERY || activeFilterCount(filters) > 0;

  return (
    <section className="page active">
      <div className="catalog-topbar">
        <div className="catalog-summary">
          <span className="results-info">
            {loading ? 'Buscando libros...' : `${books.length} resultado(s)`}
          </span>
          {hasCustomSearch && (
            <span className="search-context">
              Resultados para <strong>{query}</strong>
            </span>
          )}
        </div>

        <div className="catalog-actions">
          {hasCustomSearch && (
            <button className="btn btn-ghost" onClick={onReturnToCatalog}>
              <ArrowLeft size={16} />
              Volver al catalogo
            </button>
          )}
          <FiltersPanel filters={filters} onApply={onApplyFilters} />
        </div>
      </div>

      {error && (
        <EmptyState
          icon={RefreshCw}
          title="No se pudo cargar el catalogo"
          text={error}
          action={<button className="btn btn-primary" onClick={onRetry}>Reintentar</button>}
        />
      )}

      {!error && loading && books.length === 0 && <SkeletonGrid />}

      {!error && !loading && books.length === 0 && (
        <EmptyState
          icon={BookOpen}
          title="No se encontraron libros"
          text="Prueba con otro titulo, autor, ISBN o limpia los filtros."
          action={hasCustomSearch ? (
            <button className="btn btn-primary" onClick={onReturnToCatalog}>Volver al catalogo</button>
          ) : null}
        />
      )}

      {!error && books.length > 0 && (
        <>
          <BookGrid
            books={books}
            favorites={favorites}
            onOpenBook={onOpenBook}
            onToggleFavorite={onToggleFavorite}
          />
          <div className="load-more-wrap">
            {hasMore && (
              <button className="btn btn-ghost" disabled={loading} onClick={onLoadMore}>
                {loading ? 'Cargando...' : 'Cargar mas libros'}
              </button>
            )}
          </div>
        </>
      )}
    </section>
  );
}

export default Catalog;
