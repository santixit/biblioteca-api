function SkeletonGrid({ count = 12 }) {
  return (
    <>
      <div className="books-grid">
        {Array.from({ length: count }).map((_, index) => (
          <div className="book-card-skeleton" key={index}>
            <div className="skeleton skeleton-cover" />
            <div className="skeleton-body">
              <div className="skeleton skeleton-title" />
              <div className="skeleton skeleton-title-2" />
              <div className="skeleton skeleton-author" />
              <div className="skeleton-tags">
                <div className="skeleton skeleton-tag" />
                <div className="skeleton skeleton-tag" />
              </div>
            </div>
          </div>
        ))}
      </div>
      <p className="loading-msg">Conectando con Open Library...</p>
    </>
  );
}

export default SkeletonGrid;
