/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import ExternalTools from './components/ExternalTools';
import BuiltInTools from './components/BuiltInTools';
import JobBoard from './components/JobBoard';
import MCPCatalog from './components/MCPCatalog';
import MCPServerDetail from './components/MCPServerDetail';
import Login from './components/Login';
import Register from './components/Register';
import SubmitTool from './components/SubmitTool';
import Navigation from './components/Navigation';
import PatternStudio from './components/PatternStudio';
import AdminGuard from './components/AdminGuard';
import AdminDashboard from './components/AdminDashboard';
import AdminOverview from './components/admin/AdminOverview';
import SubmissionList from './components/admin/SubmissionList';
import AdminUsers from './components/admin/AdminUsers';
import AdminPrompts from './components/admin/AdminPrompts';
import AdminMCPServers from './components/admin/resources/AdminMCPServers';
import AdminMCPClients from './components/admin/resources/AdminMCPClients';
import AdminAITools from './components/admin/resources/AdminAITools';
import AdminCategories from './components/admin/resources/AdminCategories';
import AdminTiers from './components/admin/resources/AdminTiers';
import AdminLanguages from './components/admin/resources/AdminLanguages';
import Footer from './components/Footer';
import ErrorBoundary from './components/ErrorBoundary';
import BackToTop from './components/BackToTop';
import ConsentManager from './components/ConsentManager';
import ComparisonPage from './components/ComparisonPage';
import RoadmapPage from './components/RoadmapPage';
import TrendingPage from './components/TrendingPage';
import CommunityPromptsPage from './components/CommunityPromptsPage';
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
            <Route index element={<LandingPage />} />
            <Route path="tools" element={<ExternalTools />} />
            <Route path="built-in-tools" element={<BuiltInTools />} />
            <Route path="built-in-tools/:toolId" element={<BuiltInTools />} />
            <Route path="job-board" element={<JobBoard />} />
            <Route path="/roadmap" element={<RoadmapPage />} />
          <Route path="/trending" element={<TrendingPage />} />
          <Route path="/prompts" element={<CommunityPromptsPage />} />
            <Route path="mcp-catalog" element={<MCPCatalog />} />
            <Route path="prompt-studio" element={<PatternStudio />} />
            <Route path="compare/:comparisonId" element={<ComparisonPage />} />

            <Route path="mcp-catalog/:serverId" element={<MCPServerDetail />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="submit" element={<SubmitTool />} />
            
            {/* Admin Routes */}
            <Route path="admin" element={<AdminGuard />}>
              <Route element={<AdminDashboard />}>
                <Route index element={<AdminOverview />} />
                <Route path="submissions" element={<SubmissionList />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="prompts" element={<AdminPrompts />} />
                <Route path="resources/mcp-servers" element={<AdminMCPServers />} />
                <Route path="resources/mcp-clients" element={<AdminMCPClients />} />
                <Route path="resources/ai-tools" element={<AdminAITools />} />
                <Route path="resources/categories" element={<AdminCategories />} />
                <Route path="resources/tiers" element={<AdminTiers />} />
                <Route path="resources/languages" element={<AdminLanguages />} />
                <Route path="settings" element={<div>Settings coming soon...</div>} />
              </Route>
            </Route>
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
