/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';

interface NavigationProps {
  currentPath: string;
}

const Navigation: React.FC<NavigationProps> = ({ currentPath }) => {
  const navItems = [
    {
      path: '/tools',
      label: 'Tools',
      description: 'Curated AI tools from around the web',
      icon: '🔗'
    },
    {
      path: '/built-in-tools',
      label: 'AI Workspace',
      description: 'AI tools built right into this platform',
      icon: '⚡'
    }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
        {/* Mobile Layout */}
        <div className="block sm:hidden">
          {/* Top row: Title and theme toggle */}
          <div className="flex items-center justify-between mb-3">
            <Link to="/" className="flex items-center">
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Collective AI Tools
              </h1>
            </Link>
            <button 
              className="inline-flex items-center justify-center w-8 h-8 border border-gray-300 dark:border-gray-600 rounded-full text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
              onClick={() => {
                const body = document.body;
                const isDark = body.dataset.theme === 'dark';
                body.dataset.theme = isDark ? 'light' : 'dark';
                localStorage.setItem('theme', isDark ? 'light' : 'dark');
              }}
              title="Toggle dark/light mode"
            >
              <svg className="w-4 h-4 dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              <svg className="w-4 h-4 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
              </svg>
            </button>
          </div>
          
          {/* Navigation tabs */}
          <nav className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center justify-center flex-1 px-2 py-2 rounded-md text-sm font-medium transition-colors",
                  currentPath === item.path
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                )}
                title={item.description}
              >
                <span className="text-base mr-1">{item.icon}</span>
                <span className="text-xs">{item.label}</span>
              </Link>
            ))}
          </nav>
          
          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <a 
              href="https://ko-fi.com/hanish" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center flex-1 px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200"
              title="Buy me a coffee"
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.5 3H6c-1.1 0-2 .9-2 2v5.71c0 3.83 2.95 7.18 6.78 7.29 3.96.12 7.22-3.06 7.22-7v-1h.5c1.38 0 2.5-1.12 2.5-2.5S19.88 3 18.5 3zM16 5v5.5c0 2.76-2.24 5-5 5s-5-2.24-5-5V5h10z"/>
              </svg>
              <span className="text-xs">Coffee</span>
            </a>
            
            <a 
              href="https://github.com/Hyraze/collective-ai-tools" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Contribute on GitHub"
            >
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="text-xs">Contribute</span>
            </a>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden sm:flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
            <Link to="/" className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">
                Collective AI Tools
              </h1>
            </Link>
            <p className="hidden lg:block text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">
              A curated selection of AI tools and resources
            </p>
          </div>
          
          {/* Navigation Tabs and Actions */}
          <div className="flex items-center space-x-1 sm:space-x-2">
            <nav className="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                    currentPath === item.path
                      ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                  )}
                  title={item.description}
                >
                  <span className="text-base">{item.icon}</span>
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              ))}
            </nav>
            
            {/* Buy me a coffee button */}
            <a 
              href="https://ko-fi.com/hanish" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-sm hover:shadow-md"
              title="Buy me a coffee"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.5 3H6c-1.1 0-2 .9-2 2v5.71c0 3.83 2.95 7.18 6.78 7.29 3.96.12 7.22-3.06 7.22-7v-1h.5c1.38 0 2.5-1.12 2.5-2.5S19.88 3 18.5 3zM16 5v5.5c0 2.76-2.24 5-5 5s-5-2.24-5-5V5h10z"/>
              </svg>
              <span className="hidden sm:inline">Coffee</span>
            </a>
            
            {/* Contribute button */}
            <a 
              href="https://github.com/Hyraze/collective-ai-tools" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              title="Contribute on GitHub"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              <span className="hidden sm:inline">Contribute</span>
            </a>
            
            {/* Theme toggle button */}
            <button 
              className="inline-flex items-center justify-center w-9 h-9 border border-gray-300 dark:border-gray-600 rounded-full text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md"
              onClick={() => {
                const body = document.body;
                const isDark = body.dataset.theme === 'dark';
                body.dataset.theme = isDark ? 'light' : 'dark';
                localStorage.setItem('theme', isDark ? 'light' : 'dark');
              }}
              title="Toggle dark/light mode"
            >
              {/* Sun icon for dark mode */}
              <svg className="w-4 h-4 dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              {/* Moon icon for light mode */}
              <svg className="w-4 h-4 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;

