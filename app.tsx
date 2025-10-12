/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import ExternalTools from './components/ExternalTools';
import BuiltInTools from './components/BuiltInTools';
import JobBoard from './components/JobBoard';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import BackToTop from './components/BackToTop';
import ConsentManager from './components/ConsentManager';
import { initializeConsentMode } from './lib/consentUtils';

function App() {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize theme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.body.dataset.theme = initialTheme;
    
    // Initialize Google Consent Mode
    initializeConsentMode();
    
    // Simulate loading time for smooth transition
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Loading AI tools...</h2>
          <p className="text-gray-600 dark:text-gray-400">Discovering the best AI tools for you</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <Navigation currentPath={location.pathname} />
        <main className="flex-1">
          <Routes>
            <Route index element={<ExternalTools />} />
            <Route path="tools" element={<Navigate to="/" replace />} />
            <Route path="built-in-tools" element={<BuiltInTools />} />
            <Route path="built-in-tools/:toolId" element={<BuiltInTools />} />
            <Route path="job-board" element={<JobBoard />} />
          </Routes>
        </main>
        <Footer />
        <BackToTop />
        <ConsentManager />
      </div>
    </ErrorBoundary>
  );
}

export default App;
