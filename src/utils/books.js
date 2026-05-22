export function languageTag(code) {
  const map = {
    es: 'ES',
    en: 'EN',
    fr: 'FR',
    de: 'DE',
    pt: 'PT',
    it: 'IT',
    ja: 'JA',
    zh: 'ZH',
    und: '?',
  };
  const normalized = (code || 'und').substring(0, 2).toLowerCase();
  return map[normalized] || normalized.toUpperCase();
}

export function readingStatusLabel(status) {
  return {
    pendiente: 'Pendiente',
    leyendo: 'Leyendo',
    terminado: 'Terminado',
  }[status] || status;
}

export function reservationStatusLabel(status) {
  return {
    solicitada: 'Solicitada',
    aprobada: 'Aprobada',
    cancelada: 'Cancelada',
  }[status] || status;
}

export function activeFilterCount(filters) {
  return Object.values(filters).filter(Boolean).length;
}
