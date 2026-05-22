
export function loadLS(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

export function saveLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
