export function readStorage(kind: 'sessionStorage' | 'localStorage', key: string) {
  try {
    return window[kind].getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(kind: 'sessionStorage' | 'localStorage', key: string, value: string) {
  try {
    window[kind].setItem(key, value);
  } catch {
    // The current visit still uses React state when storage is unavailable.
  }
}
