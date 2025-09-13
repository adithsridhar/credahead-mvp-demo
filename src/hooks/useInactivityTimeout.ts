import { useEffect, useRef } from 'react';

export function useInactivityTimeout(timeout: number, onTimeout: () => void) {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  const resetTimeout = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(onTimeout, timeout);
  };
  
  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    const handleActivity = () => resetTimeout();
    
    events.forEach(event => {
      document.addEventListener(event, handleActivity);
    });
    
    resetTimeout();
    
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      events.forEach(event => {
        document.removeEventListener(event, handleActivity);
      });
    };
  }, [timeout, onTimeout]);
}