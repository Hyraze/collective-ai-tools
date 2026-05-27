/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '../context/AuthContext';
import { LogOut, Menu, Coffee, Github, X, Wrench, Terminal, Briefcase, Database, Sparkles, Map,  GitBranch,
  MessageSquare,
} from 'lucide-react';

interface NavigationProps {
  currentPath: string;
}

const Navigation: React.FC<NavigationProps> = ({ currentPath }) => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when path changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [currentPath]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);
  
  const navItems = [
    {
      path: '/',
      label: 'Home',
      description: 'The ultimate ecosystem for AI builders',
      icon: null
    },
    {
      path: '/tools',
      label: 'Tools',
      description: 'Curated AI tools from around the web',
      icon: Wrench
    },
    {
      path: '/built-in-tools',
      label: 'Workspace',
      description: 'Powerful AI tools built for productivity',
      icon: Sparkles
    },
    {
      path: '/mcp-catalog',
      label: 'MCP Catalog',
      description: 'Discover Model Context Protocol servers',
      icon: Database
    },
    {
      path: '/roadmap',
      label: 'Roadmap',
      description: 'Step-by-step AI learning paths',
      icon: Map
    },
    {
      path: '/prompts',
      label: 'Prompts Library',
      description: 'Community Prompt Library',
      icon: MessageSquare
    },
    {
      path: '/prompt-studio',
      label: 'Prompt Studio',
      description: 'Augment your AI workflows with Patterns',
      icon: Terminal
    },
    {
      path: '/trending',
      label: 'Resources',
      description: 'Hottest AI repositories on GitHub',
      icon: GitBranch
    },
    {
      path: '/job-board',
      label: 'Job Board',
      description: 'Browse AI job opportunities',
      icon: Briefcase
    },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-3">
        {/* Universal Header Bar */}
        <div className="flex items-center justify-between">
            {/* Left: Menu Button & Logo */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
              
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                    C
                </div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Collective AI
                </h1>
              </Link>
            </div>

            {/* Right: Theme Toggle (Visible on bar) */}
             <button 
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                onClick={() => {
                  const body = document.body;
                  const isDark = body.dataset.theme === 'dark';
                  body.dataset.theme = isDark ? 'light' : 'dark';
                  localStorage.setItem('theme', isDark ? 'light' : 'dark');
                }}
                title="Toggle theme"
              >
                <svg className="w-5 h-5 dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
                <svg className="w-5 h-5 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                </svg>
             </button>
        </div>
      </div>

      {/* Sidebar (Portaled to body) */}
      {createPortal(
        <>
          {/* Sidebar Overlay */}
          {isMobileMenuOpen && (
            <div 
              className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />
          )}

          {/* Sidebar Drawer */}
          <div className={cn(
              "fixed top-0 left-0 z-[70] h-full w-[280px] bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out overflow-y-auto shadow-2xl",
              isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          )}>
               <div className="p-4 flex flex-col h-full">
                  {/* Drawer Header */}
                  <div className="flex items-center justify-between mb-6">
                      <Link to="/" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-xl">
                              C
                          </div>
                          <span className="text-lg font-bold text-gray-900 dark:text-white">Collective AI</span>
                      </Link>
                      <button 
                          onClick={() => setIsMobileMenuOpen(false)}
                          className="p-2 -mr-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                      >
                          <X className="w-5 h-5" />
                      </button>
                  </div>

                  {/* Submit Action */}
                  <Link
                      to="/submit"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 w-full p-3 bg-blue-600 text-white rounded-xl font-medium shadow-lg hover:bg-blue-700 transition-colors mb-6"
                  >
                      <span>Submit Resource</span>
                  </Link>

                  {/* Navigation Links */}
                  <div className="flex-1 space-y-1">
                      <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 pl-3">Menu</div>
                      {navItems.map((item) => (
                          <Link
                              key={item.path}
                              to={item.path}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className={cn(
                                  "flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                                  currentPath === item.path
                                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                              )}
                          >
                              <span>{item.label}</span>
                              {currentPath === item.path && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                          </Link>
                      ))}
                  </div>

                  {/* Footer Actions */}
                   <div className="pt-6 border-t border-gray-100 dark:border-gray-800 space-y-4">
                       {/* Links */}
                      <div className="grid grid-cols-2 gap-2">
                          <a 
                              href="https://github.com/Hyraze/collective-ai-tools"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                              <Github className="w-4 h-4" /> Contribute
                          </a>
                           <a 
                              href="https://ko-fi.com/hanish"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
                          >
                              <Coffee className="w-4 h-4" /> Donate
                          </a>
                      </div>
                      
                      {/* User Profile */}
                      {user ? (
                          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                              <div className="flex items-center gap-3">
                                  <img src={user.avatar} alt={user.name} className="w-9 h-9 rounded-full" />
                                  <div className="flex flex-col">
                                      <span className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</span>
                                      <span className="text-xs text-gray-500">Member</span>
                                  </div>
                              </div>
                               <button
                                  onClick={handleLogout}
                                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                              >
                                  <LogOut className="w-5 h-5" />
                              </button>
                          </div>
                      ) : (
                           <div className="flex flex-col gap-2">
                              <Link 
                                  to="/login"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="flex items-center justify-center w-full p-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                              >
                                  Log in
                              </Link>
                               <Link 
                                  to="/register"
                                  onClick={() => setIsMobileMenuOpen(false)}
                                  className="flex items-center justify-center w-full p-2.5 text-sm font-medium text-white bg-gray-900 dark:bg-gray-700 rounded-lg hover:opacity-90"
                              >
                                  Sign up
                              </Link>
                          </div>
                      )}
                   </div>
               </div>
          </div>
        </>,
        document.body
      )}
    </header>
  );
};

export default Navigation;
