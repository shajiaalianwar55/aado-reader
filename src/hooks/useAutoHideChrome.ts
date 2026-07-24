import { useCallback, useEffect, useRef } from 'react';

const DEFAULT_MS = 4000;

/**
 * Hides reader chrome after a period of inactivity while it is visible.
 * Pass delayMs <= 0 to disable auto-hide.
 * Any user interaction should call `bump` to reset the timer.
 */
export function useAutoHideChrome(
  visible: boolean,
  setVisible: (visible: boolean) => void,
  delayMs: number = DEFAULT_MS,
) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clear = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  const bump = useCallback(() => {
    clear();
    if (!visible || delayMs <= 0) return;
    timer.current = setTimeout(() => {
      setVisible(false);
    }, delayMs);
  }, [clear, delayMs, setVisible, visible]);

  useEffect(() => {
    if (visible && delayMs > 0) {
      bump();
    } else {
      clear();
    }
    return clear;
  }, [visible, bump, clear, delayMs]);

  return { bump, clear };
}
