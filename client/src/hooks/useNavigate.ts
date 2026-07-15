import { useCallback } from 'react';

const listeners: ((page: string, detailId?: number) => void)[] = [];
let currentDetailId: number | undefined;

export function navigateTo(page: string, detailId?: number) {
  currentDetailId = detailId;
  listeners.forEach((fn) => fn(page, detailId));
}

export function useNavigate() {
  return useCallback((page: string, detailId?: number) => {
    navigateTo(page, detailId);
  }, []);
}

export function addNavigateListener(fn: (page: string, detailId?: number) => void) {
  listeners.push(fn);
  return () => {
    const idx = listeners.indexOf(fn);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}

export function consumeDetailId(): number | undefined {
  const id = currentDetailId;
  currentDetailId = undefined;
  return id;
}
