import { BOOKS_PER_PAGE, DEFAULT_QUERY, LANG_MAP } from '../constants.js';

const FIELDS = [
  'key',
  'title',
  'author_name',
  'first_publish_year',
  'language',
  'publisher',
  'subject',
  'isbn',
  'cover_i',
  'number_of_pages_median',
  'edition_count',
].join(',');

export async function fetchBooks({ query = DEFAULT_QUERY, offset = 0, filters = {} }) {
  const queryParts = [query || DEFAULT_QUERY];
  if (filters.genre) queryParts.push(filters.genre);

  const params = new URLSearchParams({
    q: queryParts.join(' '),
    offset: String(offset),
    limit: String(BOOKS_PER_PAGE),
    fields: FIELDS,
  });

  if (filters.language) params.set('language', LANG_MAP[filters.language] || filters.language);
  if (filters.year) params.set('published_in', `${filters.year}-2030`);

  const response = await fetch(`https://openlibrary.org/search.json?${params.toString()}`);
  if (!response.ok) throw new Error('No se pudo conectar con Open Library');

  const docs = (await response.json()).docs || [];
  return docs.map(mapBook).filter((book) => {
    if (!filters.year) return true;
    const year = Number.parseInt(book.anio, 10);
    return Number.isFinite(year) && year >= Number.parseInt(filters.year, 10);
  });
}

export function mapBook(doc) {
  const coverId = doc.cover_i;
  const id = doc.key ? doc.key.replace('/works/', '') : Math.random().toString(36).slice(2);

  return {
    id,
    titulo: doc.title || 'Sin titulo',
    autores: Array.isArray(doc.author_name) ? doc.author_name.slice(0, 2).join(', ') : 'Autor desconocido',
    descripcion: '',
    editorial: Array.isArray(doc.publisher) ? doc.publisher[0] : '-',
    anio: doc.first_publish_year ? String(doc.first_publish_year) : '-',
    paginas: doc.number_of_pages_median || '-',
    idioma: Array.isArray(doc.language) ? doc.language[0] : (doc.language || 'und'),
    categorias: Array.isArray(doc.subject) ? doc.subject.slice(0, 3) : [],
    isbn: Array.isArray(doc.isbn) ? doc.isbn[0] : '',
    portada: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : '',
    previewLink: `https://openlibrary.org${doc.key}`,
    ediciones: doc.edition_count || 1,
  };
}

export async function fetchDescription(bookId) {
  try {
    const response = await fetch(`https://openlibrary.org/works/${bookId}.json`);
    if (!response.ok) return 'Sin descripcion disponible.';

    const data = await response.json();
    if (!data.description) return 'Sin descripcion disponible.';

    return typeof data.description === 'string'
      ? data.description
      : data.description.value || 'Sin descripcion disponible.';
  } catch {
    return 'Sin descripcion disponible.';
  }
}
