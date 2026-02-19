import { useSyncExternalStore } from 'react';

function subscribeToMediaQuery(query: string, callback: () => void): () => void {
  if (typeof globalThis.matchMedia !== 'function') {
    return () => {};
  }

  const mediaQueryList = globalThis.matchMedia(query);
  const onChange = () => callback();
  mediaQueryList.addEventListener('change', onChange);

  return () => {
    mediaQueryList.removeEventListener('change', onChange);
  };
}

function getMediaQuerySnapshot(query: string): boolean {
  if (typeof globalThis.matchMedia !== 'function') {
    return false;
  }

  return globalThis.matchMedia(query).matches;
}

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onStoreChange) => subscribeToMediaQuery(query, onStoreChange),
    () => getMediaQuerySnapshot(query),
    () => false,
  );
}
