
import { BOOKS_PER_PAGE } from '../core/state.js';

export async function fetchBooks(query, offset = 0) {
  const q = encodeURIComponent(query);
  const off = (offset % (BOOKS_PER_PAGE * 2)) || 0;
  const url = `https://openlibrary.org/search.json?q=${q}&offset=${off}&limit=${BOOKS_PER_PAGE}&fields=key,title,author_name,first_publish_year,language,publisher,subject,isbn,cover_i,number_of_pages_median,edition_count`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Error Open Library');
  return (await response.json()).docs || [];
}

export function mapBook(doc) {
  const coverId = doc.cover_i;
  const id = doc.key ? doc.key.replace('/works/', '') : Math.random().toString(36).slice(2);
  return {
    id,
    titulo: doc.title || 'Sin título',
    autores: Array.isArray(doc.author_name) ? doc.author_name.slice(0, 2).join(', ') : 'Autor desconocido',
    descripcion: '',
    editorial: Array.isArray(doc.publisher) ? doc.publisher[0] : '—',
    año: doc.first_publish_year ? String(doc.first_publish_year) : '—',
    paginas: doc.number_of_pages_median || '—',
    idioma: Array.isArray(doc.language) ? doc.language[0] : (doc.language || 'und'),
    categorias: Array.isArray(doc.subject) ? doc.subject.slice(0, 3) : [],
    isbn: Array.isArray(doc.isbn) ? doc.isbn[0] : '',
    portada: coverId ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg` : '',
    previewLink: `https://openlibrary.org${doc.key}`,
    tipo: 'BOOK',
    ediciones: doc.edition_count || 1,
  };
}

export async function fetchDescription(bookId) {
  try {
    const response = await fetch(`https://openlibrary.org/works/${bookId}.json`);
    if (!response.ok) return 'Sin descripción disponible.';
    const data = await response.json();
    if (!data.description) return 'Sin descripción disponible.';
    return typeof data.description === 'string' ? data.description : (data.description.value || 'Sin descripción disponible.');
  } catch {
    return 'Sin descripción disponible.';
  }
}
