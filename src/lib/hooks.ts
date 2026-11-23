'use client';
import { useEffect, useState } from 'react';
export function useQ(k: string) {
  const [v, setV] = useState('');
  useEffect(() => { setV(new URLSearchParams(window.location.search).get(k) || ''); }, [k]);
  return v;
}
