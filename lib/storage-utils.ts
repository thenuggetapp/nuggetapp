/**
 * Storage Utilities for Iframe Environments
 * 
 * Handles storage access in environments where localStorage/sessionStorage
 * may be blocked (iframes with third-party cookie restrictions, private browsing, etc.)
 */

// In-memory fallback storage for when localStorage is not available
class MemoryStorage implements Storage {
  private store: Map<string, string> = new Map();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null;
  }

  key(index: number): string | null {
    const keys = Array.from(this.store.keys());
    return keys[index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

// Singleton instances
let memoryStorage: MemoryStorage | null = null;
let isLocalStorageAvailable: boolean | null = null;
let isSessionStorageAvailable: boolean | null = null;
let isInIframe: boolean | null = null;

/**
 * Check if running in an iframe
 */
export function checkIsInIframe(): boolean {
  if (typeof window === 'undefined') return false;
  if (isInIframe !== null) return isInIframe;
  
  try {
    isInIframe = window.self !== window.top;
  } catch (e) {
    // If we can't access window.top due to cross-origin restrictions, we're in an iframe
    isInIframe = true;
  }
  
  return isInIframe;
}

/**
 * Check if localStorage is available and working
 */
export function checkLocalStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  if (isLocalStorageAvailable !== null) return isLocalStorageAvailable;

  try {
    const testKey = '__storage_test__';
    window.localStorage.setItem(testKey, 'test');
    window.localStorage.removeItem(testKey);
    isLocalStorageAvailable = true;
    console.log('[Storage] ✅ localStorage is available');
    return true;
  } catch (e) {
    console.warn('[Storage] ⚠️ localStorage is NOT available, using memory fallback:', e);
    isLocalStorageAvailable = false;
    return false;
  }
}

/**
 * Check if sessionStorage is available and working
 */
export function checkSessionStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  if (isSessionStorageAvailable !== null) return isSessionStorageAvailable;

  try {
    const testKey = '__storage_test__';
    window.sessionStorage.setItem(testKey, 'test');
    window.sessionStorage.removeItem(testKey);
    isSessionStorageAvailable = true;
    console.log('[Storage] ✅ sessionStorage is available');
    return true;
  } catch (e) {
    console.warn('[Storage] ⚠️ sessionStorage is NOT available, using memory fallback:', e);
    isSessionStorageAvailable = false;
    return false;
  }
}

/**
 * Get memory storage singleton
 */
function getMemoryStorage(): MemoryStorage {
  if (!memoryStorage) {
    memoryStorage = new MemoryStorage();
    console.log('[Storage] 📦 Created in-memory storage fallback');
  }
  return memoryStorage;
}

/**
 * Safe localStorage wrapper that falls back to memory storage
 */
export const safeLocalStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      if (checkLocalStorageAvailable()) {
        return window.localStorage.getItem(key);
      }
    } catch (e) {
      console.warn(`[Storage] Error reading from localStorage (${key}):`, e);
    }
    
    // Fallback to memory storage
    return getMemoryStorage().getItem(key);
  },

  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    
    try {
      if (checkLocalStorageAvailable()) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      console.warn(`[Storage] Error writing to localStorage (${key}):`, e);
    }
    
    // Fallback to memory storage
    getMemoryStorage().setItem(key, value);
  },

  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    
    try {
      if (checkLocalStorageAvailable()) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch (e) {
      console.warn(`[Storage] Error removing from localStorage (${key}):`, e);
    }
    
    // Fallback to memory storage
    getMemoryStorage().removeItem(key);
  },

  clear: (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      if (checkLocalStorageAvailable()) {
        window.localStorage.clear();
        return;
      }
    } catch (e) {
      console.warn('[Storage] Error clearing localStorage:', e);
    }
    
    // Fallback to memory storage
    getMemoryStorage().clear();
  },
};

/**
 * Safe sessionStorage wrapper that falls back to memory storage
 */
export const safeSessionStorage = {
  getItem: (key: string): string | null => {
    if (typeof window === 'undefined') return null;
    
    try {
      if (checkSessionStorageAvailable()) {
        return window.sessionStorage.getItem(key);
      }
    } catch (e) {
      console.warn(`[Storage] Error reading from sessionStorage (${key}):`, e);
    }
    
    // Fallback to memory storage
    return getMemoryStorage().getItem(key);
  },

  setItem: (key: string, value: string): void => {
    if (typeof window === 'undefined') return;
    
    try {
      if (checkSessionStorageAvailable()) {
        window.sessionStorage.setItem(key, value);
        return;
      }
    } catch (e) {
      console.warn(`[Storage] Error writing to sessionStorage (${key}):`, e);
    }
    
    // Fallback to memory storage
    getMemoryStorage().setItem(key, value);
  },

  removeItem: (key: string): void => {
    if (typeof window === 'undefined') return;
    
    try {
      if (checkSessionStorageAvailable()) {
        window.sessionStorage.removeItem(key);
        return;
      }
    } catch (e) {
      console.warn(`[Storage] Error removing from sessionStorage (${key}):`, e);
    }
    
    // Fallback to memory storage
    getMemoryStorage().removeItem(key);
  },

  clear: (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      if (checkSessionStorageAvailable()) {
        window.sessionStorage.clear();
        return;
      }
    } catch (e) {
      console.warn('[Storage] Error clearing sessionStorage:', e);
    }
    
    // Fallback to memory storage
    getMemoryStorage().clear();
  },
};

/**
 * Get environment information for debugging
 */
export function getStorageEnvironmentInfo() {
  if (typeof window === 'undefined') {
    return {
      isServer: true,
      isInIframe: false,
      localStorageAvailable: false,
      sessionStorageAvailable: false,
      cookiesEnabled: false,
    };
  }

  return {
    isServer: false,
    isInIframe: checkIsInIframe(),
    localStorageAvailable: checkLocalStorageAvailable(),
    sessionStorageAvailable: checkSessionStorageAvailable(),
    cookiesEnabled: navigator.cookieEnabled,
    origin: window.location.origin,
    userAgent: navigator.userAgent,
  };
}

/**
 * Log storage environment info for debugging
 */
export function logStorageEnvironment() {
  const info = getStorageEnvironmentInfo();
  console.log('[Storage Environment]', info);
  
  if (info.isInIframe) {
    console.warn('[Storage] ⚠️ Running in iframe - storage may be restricted');
  }
  
  if (!info.localStorageAvailable) {
    console.warn('[Storage] ⚠️ localStorage not available - using memory fallback');
  }
  
  if (!info.cookiesEnabled) {
    console.warn('[Storage] ⚠️ Cookies are disabled - authentication may not work');
  }
}

