'use client';

import { useEffect, useState } from 'react';

export const useLocalStorage = <T,>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn('useLocalStorage read error', error);
      return initialValue;
    }
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Reading from localStorage is side-effectful; updating state once keeps cache consistent.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStoredValue((current) => {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : current;
    });
  }, [key]);

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(value));
      }
    } catch (error) {
      console.warn('useLocalStorage write error', error);
    }
  };

  return [storedValue, setValue] as const;
};
