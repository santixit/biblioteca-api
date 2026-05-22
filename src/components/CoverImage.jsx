import { BookMarked } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

function CoverImage({ book, alt, placeholderSize = 32 }) {
  const sources = useMemo(() => {
    const candidates = book.portadas?.length ? book.portadas : [book.portada].filter(Boolean);
    return [...new Set(candidates.filter(Boolean))];
  }, [book]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(0);
  }, [book.id, sources.join('|')]);

  if (!sources[index]) {
    return (
      <div className="cover-ph">
        <BookMarked size={placeholderSize} />
        <span>Sin portada</span>
      </div>
    );
  }

  return (
    <img
      src={sources[index]}
      alt={alt}
      loading="lazy"
      onError={() => setIndex((current) => current + 1)}
    />
  );
}

export default CoverImage;
