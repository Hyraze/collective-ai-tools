/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

export interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

export interface ConsentState {
  hasConsented: boolean;
  preferences: ConsentPreferences;
  timestamp: number;
}

// Google Consent Mode integration
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

/**
 * Initialize Google Consent Mode with default values
 */
export const initializeConsentMode = (): void => {
  if (typeof window === 'undefined') return;

  // Initialize dataLayer if it doesn't exist
  window.dataLayer = window.dataLayer || [];

  // Set default consent state
  window.gtag = window.gtag || function() {
    window.dataLayer.push(arguments);
  };

  // Default consent state (deny all except necessary)
  window.gtag('consent', 'default', {
    'ad_storage': 'denied',
    'analytics_storage': 'denied',
    'functionality_storage': 'denied',
    'personalization_storage': 'denied',
    'security_storage': 'granted',
    'wait_for_update': 2000,
  });
};

/**
 * Update Google Consent Mode based on user preferences
 */
export const updateConsentMode = (preferences: ConsentPreferences): void => {
  if (typeof window === 'undefined' || !window.gtag) return;

  window.gtag('consent', 'update', {
    'ad_storage': preferences.marketing ? 'granted' : 'denied',
    'analytics_storage': preferences.analytics ? 'granted' : 'denied',
    'functionality_storage': preferences.personalization ? 'granted' : 'denied',
    'personalization_storage': preferences.personalization ? 'granted' : 'denied',
  });
};

/**
 * Check if user is in EEA, UK, or Switzerland
 * This is a simplified check - in production, consider using a more sophisticated geolocation service
 */
export const isInTargetRegion = (): boolean => {
  if (typeof window === 'undefined') return false;

  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const targetTimezones = [
      // EEA countries
      'Europe/Amsterdam', 'Europe/Berlin', 'Europe/Brussels', 'Europe/Copenhagen',
      'Europe/Dublin', 'Europe/Helsinki', 'Europe/Lisbon', 'Europe/Luxembourg',
      'Europe/Madrid', 'Europe/Paris', 'Europe/Prague', 'Europe/Rome',
      'Europe/Stockholm', 'Europe/Vienna', 'Europe/Warsaw', 'Europe/Zurich',
      // UK
      'Europe/London', 'Europe/Belfast', 'Europe/Edinburgh',
      // Switzerland
      'Europe/Zurich', 'Europe/Geneva'
    ];
    
    return targetTimezones.some(tz => timezone.includes(tz.split('/')[1]));
  } catch (error) {
    console.warn('Could not determine user location:', error);
    return false;
  }
};

/**
 * Load consent preferences from localStorage
 */
export const loadConsentPreferences = (): ConsentState | null => {
  if (typeof window === 'undefined') return null;

  try {
    const savedConsent = localStorage.getItem('consent-preferences');
    const hasConsented = localStorage.getItem('has-consented');
    
    if (savedConsent && hasConsented) {
      const preferences = JSON.parse(savedConsent);
      return {
        hasConsented: hasConsented === 'true',
        preferences,
        timestamp: Date.now()
      };
    }
  } catch (error) {
    console.warn('Could not load consent preferences:', error);
  }
  
  return null;
};

/**
 * Save consent preferences to localStorage
 */
export const saveConsentPreferences = (preferences: ConsentPreferences): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem('consent-preferences', JSON.stringify(preferences));
    localStorage.setItem('has-consented', 'true');
    localStorage.setItem('consent-timestamp', Date.now().toString());
  } catch (error) {
    console.warn('Could not save consent preferences:', error);
  }
};

/**
 * Clear consent preferences
 */
export const clearConsentPreferences = (): void => {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem('consent-preferences');
    localStorage.removeItem('has-consented');
    localStorage.removeItem('consent-timestamp');
  } catch (error) {
    console.warn('Could not clear consent preferences:', error);
  }
};

/**
 * Check if consent is required for the current user
 */
export const isConsentRequired = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const consentState = loadConsentPreferences();
  const inTargetRegion = isInTargetRegion();
  
  return inTargetRegion && (!consentState || !consentState.hasConsented);
};

/**
 * Get default consent preferences
 */
export const getDefaultConsentPreferences = (): ConsentPreferences => ({
  necessary: true,
  analytics: false,
  marketing: false,
  personalization: false,
});

/**
 * Validate consent preferences
 */
export const validateConsentPreferences = (preferences: any): preferences is ConsentPreferences => {
  return (
    typeof preferences === 'object' &&
    preferences !== null &&
    typeof preferences.necessary === 'boolean' &&
    typeof preferences.analytics === 'boolean' &&
    typeof preferences.marketing === 'boolean' &&
    typeof preferences.personalization === 'boolean' &&
    preferences.necessary === true // Necessary cookies must always be true
  );
};

/**
 * Create a consent audit log entry
 */
export const createConsentAuditLog = (action: string, preferences: ConsentPreferences): void => {
  if (typeof window === 'undefined') return;

  try {
    const auditEntry = {
      action,
      preferences,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // Store audit log (in production, you might want to send this to your backend)
    const existingLogs = JSON.parse(localStorage.getItem('consent-audit-log') || '[]');
    existingLogs.push(auditEntry);
    
    // Keep only last 100 entries
    if (existingLogs.length > 100) {
      existingLogs.splice(0, existingLogs.length - 100);
    }
    
    localStorage.setItem('consent-audit-log', JSON.stringify(existingLogs));
  } catch (error) {
    console.warn('Could not create consent audit log:', error);
  }
};

