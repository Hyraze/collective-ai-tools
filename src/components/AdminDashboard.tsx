import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Users,
  Database,
  LayoutDashboard,
  MessageSquare,
  FileText,
  Settings,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming you have a utils file, usually standard in shadcn-like setups
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  const navItems = [
    {
      path: '/admin',
      label: 'Overview',
      icon: LayoutDashboard,
      exact: true
    },
    {
      path: '/admin/submissions',
      label: 'Submissions',
      icon: FileText
    },
    {
      path: '/admin/prompts', // Added new nav item for Prompts
      label: 'Prompts',
      icon: MessageSquare // Assuming MessageSquare is for prompts
    },
    {
      label: 'Resources',
      icon: Database,
      children: [
        { path: '/admin/resources/mcp-servers', label: 'MCP Servers' },
        { path: '/admin/resources/mcp-clients', label: 'MCP Clients' },
        { path: '/admin/resources/ai-tools', label: 'Tools' },
        { path: '/admin/resources/categories', label: 'Categories' },
        { path: '/admin/resources/tiers', label: 'Tiers' },
        { path: '/admin/resources/languages', label: 'Languages' },
      ]
    },
    {
      path: '/admin/users',
      label: 'Users',
      icon: Users
    },
    {
      path: '/admin/settings',
      label: 'Settings',
      icon: Settings
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-200 ease-in-out lg:transform-none",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-700">
          <span className="text-xl font-bold text-gray-900 dark:text-white">Admin Panel</span>
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            if (item.children) {
                return (
                    <div key={item.label} className="space-y-1">
                        <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300">
                            <item.icon className="h-5 w-5" />
                            {item.label}
                        </div>
                        <div className="pl-9 space-y-1">
                            {item.children.map(child => {
                                const isActive = location.pathname === child.path;
                                return (
                                    <Link
                                        key={child.path}
                                        to={child.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={cn(
                                            "block px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                            isActive 
                                                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                                                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                                        )}
                                    >
                                        {child.label}
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                );
            }

            const isActive = item.exact 
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);
            
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
             <div className="flex items-center gap-3 px-3 py-2">
                <img src={user?.avatar} alt="" className="w-8 h-8 rounded-full" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {user?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {user?.email}
                    </p>
                </div>
             </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-gray-600 dark:text-gray-300 -ml-2"
          >
            <Menu className="h-6 w-6" />
          </button>
          <span className="ml-4 text-lg font-semibold text-gray-900 dark:text-white">Admin</span>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <Outlet />
        </main>
      </div>
    </div>
  );
}
