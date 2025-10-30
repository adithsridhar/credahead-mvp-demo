'use client';

import { useEffect, useState } from 'react';
import { getAppVersion, isVersionCurrent } from '@/lib/version';

/**
 * Hook to check if the client has the latest version
 * Periodically checks for version updates and can trigger reload
 */
export function useVersionCheck(checkIntervalMs: number = 60000) {
  const [isUpToDate, setIsUpToDate] = useState(true);
  const [currentVersion, setCurrentVersion] = useState(getAppVersion());
  
  useEffect(() => {
    const checkVersion = async () => {
      try {
        // Check version against server
        const response = await fetch('/api/version', {
          cache: 'no-cache',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });
        
        if (response.ok) {
          const serverVersion = response.headers.get('X-App-Version') || response.headers.get('ETag');
          
          if (serverVersion && !isVersionCurrent(serverVersion)) {
            setIsUpToDate(false);
            console.log('🔄 New app version detected, refresh recommended');
          }
        }
      } catch (error) {
        console.warn('Version check failed:', error);
      }
    };
    
    // Check immediately
    checkVersion();
    
    // Set up periodic checking
    const interval = setInterval(checkVersion, checkIntervalMs);
    
    return () => clearInterval(interval);
  }, [checkIntervalMs]);
  
  const forceRefresh = () => {
    console.log('🔄 Force refreshing application...');
    // Clear various caches
    if ('caches' in window) {
      caches.keys().then(cacheNames => {
        cacheNames.forEach(cacheName => caches.delete(cacheName));
      });
    }
    
    // Force reload with cache bypass
    window.location.reload();
  };
  
  return {
    isUpToDate,
    currentVersion,
    forceRefresh,
  };
}

/**
 * Simple version check that just returns current state
 */
export function useAppVersion() {
  return {
    version: getAppVersion(),
    isProduction: process.env.NODE_ENV === 'production',
  };
}