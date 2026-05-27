/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

import React, { useState, useEffect } from 'react';

interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  personalization: boolean;
}

interface ConsentManagerProps {
  onConsentChange?: (consent: ConsentPreferences) => void;
}

const ConsentManager: React.FC<ConsentManagerProps> = ({ onConsentChange }) => {
  const [showBanner, setShowBanner] = useState(false);
  const [showManageOptions, setShowManageOptions] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>({
    necessary: true, // Always true - required for site functionality
    analytics: false,
    marketing: false,
    personalization: false,
  });

  // Check if user is in EEA, UK, or Switzerland
  const isInTargetRegion = (): boolean => {
    // This is a simplified check - in production, you might want to use a more sophisticated geolocation service
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
  };

  // Initialize Google Consent Mode
  const initializeConsentMode = (consent: ConsentPreferences) => {
    // @ts-ignore - Google Consent Mode types
    if (typeof window !== 'undefined' && window.gtag) {
      // @ts-ignore
      window.gtag('consent', 'default', {
        'ad_storage': consent.marketing ? 'granted' : 'denied',
        'analytics_storage': consent.analytics ? 'granted' : 'denied',
        'functionality_storage': consent.personalization ? 'granted' : 'denied',
        'personalization_storage': consent.personalization ? 'granted' : 'denied',
        'security_storage': 'granted', // Always granted for security
        'wait_for_update': 2000,
      });

      // @ts-ignore
      window.gtag('consent', 'update', {
        'ad_storage': consent.marketing ? 'granted' : 'denied',
        'analytics_storage': consent.analytics ? 'granted' : 'denied',
        'functionality_storage': consent.personalization ? 'granted' : 'denied',
        'personalization_storage': consent.personalization ? 'granted' : 'denied',
      });
    }
  };

  // Load saved consent preferences
  useEffect(() => {
    const savedConsent = localStorage.getItem('consent-preferences');
    const hasConsented = localStorage.getItem('has-consented');
    
    if (savedConsent) {
      const parsedConsent = JSON.parse(savedConsent);
      setPreferences(parsedConsent);
      initializeConsentMode(parsedConsent);
    }

    // Show banner if user hasn't consented and is in target region
    if (!hasConsented && isInTargetRegion()) {
      setShowBanner(true);
    }
  }, []);

  // Handle consent acceptance
  const handleAcceptAll = () => {
    const fullConsent: ConsentPreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      personalization: true,
    };
    
    setPreferences(fullConsent);
    localStorage.setItem('consent-preferences', JSON.stringify(fullConsent));
    localStorage.setItem('has-consented', 'true');
    setShowBanner(false);
    setShowManageOptions(false);
    initializeConsentMode(fullConsent);
    onConsentChange?.(fullConsent);
  };

  // Handle consent rejection
  const handleRejectAll = () => {
    const minimalConsent: ConsentPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      personalization: false,
    };
    
    setPreferences(minimalConsent);
    localStorage.setItem('consent-preferences', JSON.stringify(minimalConsent));
    localStorage.setItem('has-consented', 'true');
    setShowBanner(false);
    setShowManageOptions(false);
    initializeConsentMode(minimalConsent);
    onConsentChange?.(minimalConsent);
  };

  // Handle custom preferences
  const handleSavePreferences = () => {
    localStorage.setItem('consent-preferences', JSON.stringify(preferences));
    localStorage.setItem('has-consented', 'true');
    setShowBanner(false);
    setShowManageOptions(false);
    initializeConsentMode(preferences);
    onConsentChange?.(preferences);
  };

  // Handle preference toggle
  const togglePreference = (key: keyof ConsentPreferences) => {
    if (key === 'necessary') return; // Can't toggle necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Don't render if not in target region or already consented
  if (!showBanner) return null;

  return (
    <>
      {/* Consent Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                We value your privacy
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                We use cookies and similar technologies to provide, protect, and improve our services. 
                Some cookies are necessary for our site to function, while others help us understand 
                how you use our site so we can improve it.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAcceptAll}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Accept All
                </button>
                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
                >
                  Reject All
                </button>
                <button
                  onClick={() => setShowManageOptions(true)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Manage Options
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manage Options Modal */}
      {showManageOptions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Cookie Preferences
                </h2>
                <button
                  onClick={() => setShowManageOptions(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Necessary Cookies */}
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">Necessary Cookies</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Essential for the website to function properly. These cannot be disabled.
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center justify-end px-1">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>

                {/* Analytics Cookies */}
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">Analytics Cookies</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Help us understand how visitors interact with our website by collecting and reporting information anonymously.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => togglePreference('analytics')}
                      aria-label={`${preferences.analytics ? 'Disable' : 'Enable'} Analytics Cookies`}
                      className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                        preferences.analytics ? 'bg-blue-600 justify-end' : 'bg-gray-300 dark:bg-gray-600 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full mx-1"></div>
                    </button>
                  </div>
                </div>

                {/* Marketing Cookies */}
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">Marketing Cookies</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Used to track visitors across websites to display relevant and engaging advertisements.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => togglePreference('marketing')}
                      aria-label={`${preferences.marketing ? 'Disable' : 'Enable'} Marketing Cookies`}
                      className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                        preferences.marketing ? 'bg-blue-600 justify-end' : 'bg-gray-300 dark:bg-gray-600 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full mx-1"></div>
                    </button>
                  </div>
                </div>

                {/* Personalization Cookies */}
                <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white">Personalization Cookies</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                      Allow the website to remember choices you make and provide enhanced, more personal features.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => togglePreference('personalization')}
                      aria-label={`${preferences.personalization ? 'Disable' : 'Enable'} Personalization Cookies`}
                      className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                        preferences.personalization ? 'bg-blue-600 justify-end' : 'bg-gray-300 dark:bg-gray-600 justify-start'
                      }`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full mx-1"></div>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button
                  onClick={handleSavePreferences}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Save Preferences
                </button>
                <button
                  onClick={handleAcceptAll}
                  className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Accept All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConsentManager;
