/**
 * @license
 * AGPL-3.0-or-later
 * Collective AI Tools (https://collectiveai.tools)
 */

// Import statements removed as they're not used in the current implementation

interface Tool {
  name: string;
  url: string;
  description: string;
  tags: string[];
  addedDate?: string;
  clickCount?: number;
  lastClicked?: string;
}

interface Category {
  name: string;
  id: string;
  tools: Tool[];
}

// --- STATE ---
let allCategories: Category[] = [];
let allDiscoveredTags = new Set<string>();
let searchTerm = '';
let activeTags = new Set<string>();
let favoriteToolNames = new Set<string>();
let showOnlyFavorites = false;
let selectedCategory = '';
let trendingTools: Tool[] = [];
let recentlyAddedTools: Tool[] = [];
let mobileMenuOpen = false;

const FAVORITES_KEY = 'favoriteTools';
const CLICKS_KEY = 'toolClicks';
// const SEARCH_DEBOUNCE_MS = 300; // Unused constant
const TRENDING_DAYS = 7;
const RECENT_DAYS = 30;

// --- HELPERS ---

function addTrackingParams(url: string, source: string = 'collectiveai.tools', contentType: string = 'tool_link'): string {
  try {
    const urlObj = new URL(url);
    urlObj.searchParams.set('utm_source', source);
    urlObj.searchParams.set('utm_medium', 'referral');
    urlObj.searchParams.set('utm_campaign', 'ai_tools_directory');
    urlObj.searchParams.set('utm_content', contentType);
    urlObj.searchParams.set('ref', source);
    urlObj.searchParams.set('source', source);
    urlObj.searchParams.set('referrer', 'collectiveai.tools');
    return urlObj.toString();
  } catch (error) {
    console.warn('Invalid URL for tracking:', url);
    return url;
  }
}

function trackClick(url: string, type: string = 'tool_click') {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'click', {
      event_category: 'outbound_link',
      event_label: url,
      value: type
    });
  }
  
  if (type === 'tool_click') {
    trackToolClick(url);
  }
  
  console.log(`Tracked click: ${type} -> ${url}`);
}

function trackToolClick(url: string) {
  try {
    const clicks = JSON.parse(localStorage.getItem(CLICKS_KEY) || '{}');
    const now = new Date().toISOString();
    
    if (!clicks[url]) {
      clicks[url] = { count: 0, lastClicked: now, firstClicked: now };
    }
    
    clicks[url].count += 1;
    clicks[url].lastClicked = now;
    
    localStorage.setItem(CLICKS_KEY, JSON.stringify(clicks));
    updateToolClickCount(url, clicks[url].count);
  } catch (error) {
    console.warn('Failed to track tool click:', error);
  }
}

function updateToolClickCount(url: string, count: number) {
  for (const category of allCategories) {
    for (const tool of category.tools) {
      if (tool.url === url) {
        tool.clickCount = count;
        tool.lastClicked = new Date().toISOString();
        break;
      }
    }
  }
}

function calculateTrendingTools(): Tool[] {
  const allTools: Tool[] = [];
  allCategories.forEach(category => {
    allTools.push(...category.tools);
  });

  const now = new Date();
  const trendingThreshold = new Date(now.getTime() - (TRENDING_DAYS * 24 * 60 * 60 * 1000));

  let trendingTools = allTools
    .filter(tool => {
      if (!tool.lastClicked) return false;
      const lastClicked = new Date(tool.lastClicked);
      return lastClicked >= trendingThreshold;
    })
    .sort((a, b) => {
      const aClicks = a.clickCount || 0;
      const bClicks = b.clickCount || 0;
      return bClicks - aClicks;
    });

  if (trendingTools.length === 0) {
    trendingTools = allTools
      .filter(tool => (tool.clickCount || 0) > 0)
      .sort((a, b) => {
        const aClicks = a.clickCount || 0;
        const bClicks = b.clickCount || 0;
        return bClicks - aClicks;
      });
  }

  return trendingTools.slice(0, 10);
}

function calculateRecentlyAddedTools(): Tool[] {
  const allTools: Tool[] = [];
  allCategories.forEach(category => {
    allTools.push(...category.tools);
  });

  const now = new Date();
  const recentThreshold = new Date(now.getTime() - (RECENT_DAYS * 24 * 60 * 60 * 1000));

  let recentTools = allTools
    .filter(tool => {
      if (!tool.addedDate) return false;
      const addedDate = new Date(tool.addedDate);
      return addedDate >= recentThreshold;
    })
    .sort((a, b) => {
      const aDate = new Date(a.addedDate || 0);
      const bDate = new Date(b.addedDate || 0);
      return bDate.getTime() - aDate.getTime();
    });

  if (recentTools.length === 0) {
    recentTools = allTools
      .filter(tool => tool.addedDate)
      .sort((a, b) => {
        const aDate = new Date(a.addedDate || 0);
        const bDate = new Date(b.addedDate || 0);
        return bDate.getTime() - aDate.getTime();
      })
      .slice(0, 10);
  }

  return recentTools.slice(0, 10);
}

function loadClickData() {
  try {
    const clicks = JSON.parse(localStorage.getItem(CLICKS_KEY) || '{}');
    
    for (const category of allCategories) {
      for (const tool of category.tools) {
        if (clicks[tool.url]) {
          tool.clickCount = clicks[tool.url].count;
          tool.lastClicked = clicks[tool.url].lastClicked;
        }
      }
    }
  } catch (error) {
    console.warn('Failed to load click data:', error);
  }
}

function assignRandomAddedDates() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  for (const category of allCategories) {
    for (const tool of category.tools) {
      if (!tool.addedDate) {
        const randomTime = thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime());
        tool.addedDate = new Date(randomTime).toISOString();
      }
    }
  }
}

function generateToolId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, '-');
}

function createToolCard(tool: Tool): HTMLElement {
  const card = document.createElement('a');
  card.className = 'group block';
  card.href = addTrackingParams(tool.url, 'collectiveai.tools', 'tool_link');
  card.target = '_blank';
  card.rel = 'noopener noreferrer';
  card.setAttribute('aria-label', `Visit ${tool.name}`);
  card.id = generateToolId(tool.name);
  
  card.addEventListener('click', () => {
    trackClick(tool.url, 'tool_click');
  });

  const isFavorite = favoriteToolNames.has(tool.name);
  
  card.innerHTML = `
    <div class="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full flex flex-col">
      <div class="flex items-start justify-between mb-3">
        <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 pr-8">
          ${tool.name}
        </h3>
        <button 
          class="absolute top-3 right-3 sm:top-4 sm:right-4 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 sm:p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          onclick="event.preventDefault(); toggleFavorite('${tool.name}')"
          aria-label="${isFavorite ? 'Remove from favorites' : 'Add to favorites'}"
        >
          <svg class="w-3 h-3 sm:w-4 sm:h-4 ${isFavorite ? 'text-yellow-500 fill-current' : 'text-gray-400'}" 
               fill="${isFavorite ? 'currentColor' : 'none'}" 
               stroke="currentColor" 
               viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
          </svg>
        </button>
      </div>
      <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-3 sm:mb-4 flex-grow">
        ${tool.description}
      </p>
      <div class="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
        ${tool.tags.map(tag => `
          <span class="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
            ${tag}
          </span>
        `).join('')}
      </div>
      <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-auto">
        <span class="flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
          Visit Tool
        </span>
        ${tool.clickCount ? `
          <span class="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-1.5 sm:px-2 py-1 rounded-full">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
            ${tool.clickCount}
          </span>
        ` : ''}
      </div>
    </div>
  `;
  
  return card;
}

function createSpecialToolCard(tool: Tool, badgeType: 'trending' | 'recent'): HTMLElement {
  const card = document.createElement('a');
  card.className = 'group block';
  card.href = addTrackingParams(tool.url, 'collectiveai.tools', 'tool_link');
  card.target = '_blank';
  card.rel = 'noopener noreferrer';
  card.setAttribute('aria-label', `Visit ${tool.name}`);
  card.id = generateToolId(tool.name);
  
  card.addEventListener('click', () => {
    trackClick(tool.url, 'tool_click');
  });

  const daysAgo = tool.addedDate ? Math.floor((Date.now() - new Date(tool.addedDate).getTime()) / (1000 * 60 * 60 * 24)) : 0;
  
  card.innerHTML = `
    <div class="group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden h-full flex flex-col">
      <div class="absolute top-3 right-3 sm:top-4 sm:right-4 z-10">
        <span class="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
          badgeType === 'trending' 
            ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-lg' 
            : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
        }">
          ${badgeType === 'trending' ? '🔥 Trending' : '✨ New'}
        </span>
      </div>
      <div class="pr-16 sm:pr-20 flex flex-col flex-grow">
        <h3 class="text-base sm:text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-2">
          ${tool.name}
        </h3>
        <p class="text-xs sm:text-sm text-gray-600 dark:text-gray-300 line-clamp-3 mb-3 sm:mb-4 flex-grow">
          ${tool.description}
        </p>
        <div class="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          ${tool.tags.map(tag => `
            <span class="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              ${tag}
            </span>
          `).join('')}
        </div>
        <div class="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-auto">
          <span class="flex items-center gap-1">
            <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
            Visit Tool
          </span>
          ${badgeType === 'trending' && tool.clickCount ? `
            <span class="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-1.5 sm:px-2 py-1 rounded-full">
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
              </svg>
              ${tool.clickCount}
            </span>
          ` : badgeType === 'recent' && tool.addedDate ? `
            <span class="text-gray-500 dark:text-gray-400 italic">
              ${daysAgo} days ago
            </span>
          ` : ''}
        </div>
      </div>
    </div>
  `;
  
  return card;
}

function createTrendingSection(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'mb-16';
  section.id = 'trending';
  
  section.innerHTML = `
    <div class="text-center mb-8 sm:mb-12">
      <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent mb-3 sm:mb-4 flex items-center justify-center gap-2 sm:gap-3">
        🔥 Trending Tools
      </h2>
      <p class="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400">
        Most popular tools this week (${TRENDING_DAYS} days)
      </p>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      ${trendingTools.map(tool => createSpecialToolCard(tool, 'trending').outerHTML).join('')}
    </div>
  `;
  
  return section;
}

function createRecentlyAddedSection(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'mb-16';
  section.id = 'recent';
  
  section.innerHTML = `
    <div class="text-center mb-8 sm:mb-12">
      <h2 class="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-cyan-500 to-blue-500 bg-clip-text text-transparent mb-3 sm:mb-4 flex items-center justify-center gap-2 sm:gap-3">
        ✨ Recently Added
      </h2>
      <p class="text-sm sm:text-base lg:text-lg text-gray-600 dark:text-gray-400">
        Latest tools added in the last ${RECENT_DAYS} days
      </p>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      ${recentlyAddedTools.map(tool => createSpecialToolCard(tool, 'recent').outerHTML).join('')}
    </div>
  `;
  
  return section;
}

function toggleFavorite(toolName: string) {
  if (favoriteToolNames.has(toolName)) {
    favoriteToolNames.delete(toolName);
  } else {
    favoriteToolNames.add(toolName);
  }
  
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favoriteToolNames)));
  renderApp();
}

function parseReadme(readmeText: string): Category[] {
  const categories: Category[] = [];
  const lines = readmeText.split('\n');
  let currentCategory: Category | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for category headers (## Category Name)
    if (line.startsWith('## ') && !line.includes('Table of Contents') && !line.includes('Back to Top')) {
      if (currentCategory) {
        categories.push(currentCategory);
      }
      
      const categoryName = line.replace('## ', '').trim();
      currentCategory = {
        name: categoryName,
        id: categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        tools: []
      };
    }
    
    // Check for tool entries (- [Tool Name](url) - description `#tag`)
    if (currentCategory && line.startsWith('- [')) {
      const match = line.match(/^- \[([^\]]+)\]\(([^)]+)\) - (.+?)(?:\s+`#([^`]+)`)?$/);
      if (match) {
        const [, name, url, description, tag] = match;
        const tags = tag ? [tag] : [];
        
        currentCategory.tools.push({
          name: name.trim(),
          url: url.trim(),
          description: description.trim(),
          tags
        });
      }
    }
  }
  
  if (currentCategory) {
    categories.push(currentCategory);
  }
  
  return categories;
}

function renderApp() {
  const root = document.getElementById('root');
  if (!root) return;

  // Load favorites
  try {
    const savedFavorites = localStorage.getItem(FAVORITES_KEY);
    if (savedFavorites) {
      favoriteToolNames = new Set(JSON.parse(savedFavorites));
    }
  } catch (error) {
    console.warn('Failed to load favorites:', error);
  }

  // Filtering logic
  const lowerCaseSearchTerm = searchTerm.toLowerCase();
  let totalToolsFound = 0;
  
  const categoriesToFilter = showOnlyFavorites
    ? [{ 
        name: 'Favorites', 
        id: 'favorites', 
        tools: allCategories.flatMap(c => c.tools).filter(t => favoriteToolNames.has(t.name))
      }]
    : selectedCategory 
      ? allCategories.filter(cat => cat.id === selectedCategory)
      : allCategories;

  const filteredCategories = categoriesToFilter.map(category => {
      const filteredTools = category.tools.filter(tool => {
        if (showOnlyFavorites && !favoriteToolNames.has(tool.name)) {
          return false;
        }

        const matchesSearch = lowerCaseSearchTerm === '' ||
          tool.name.toLowerCase().includes(lowerCaseSearchTerm) ||
          tool.description.toLowerCase().includes(lowerCaseSearchTerm);

        const matchesTags = showOnlyFavorites || activeTags.size === 0 ||
          tool.tags.some(tag => activeTags.has(tag));
          
        return matchesSearch && matchesTags;
      });
      totalToolsFound += filteredTools.length;
      return { ...category, tools: filteredTools };
    }).filter(category => category.tools.length > 0);

  // Render the app
  root.innerHTML = `
    <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
      <!-- Header -->
      <header class="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60">
        <div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <h1 class="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">Collective AI Tools</h1>
              <p class="hidden lg:block text-sm text-gray-600 dark:text-gray-400 flex-shrink-0">A curated selection of AI tools and resources</p>
            </div>
            <div class="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
              <!-- Mobile menu button -->
              <button 
                class="sm:hidden inline-flex items-center justify-center w-9 h-9 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                onclick="toggleMobileMenu()"
                title="Open menu"
                id="mobile-menu-btn"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              </button>
              
              <!-- Desktop buttons - hidden on mobile -->
              <div class="hidden sm:flex items-center space-x-2">
                <!-- Buy me a coffee button -->
                <a 
                  href="https://ko-fi.com/hanish" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="inline-flex items-center px-3 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg text-sm font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-sm hover:shadow-md"
                  title="Buy me a coffee"
                >
                  <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.5 3H6c-1.1 0-2 .9-2 2v5.71c0 3.83 2.95 7.18 6.78 7.29 3.96.12 7.22-3.06 7.22-7v-1h.5c1.38 0 2.5-1.12 2.5-2.5S19.88 3 18.5 3zM16 5v5.5c0 2.76-2.24 5-5 5s-5-2.24-5-5V5h10z"/>
                  </svg>
                  Coffee
                </a>
                
                <!-- Contribute button -->
                <a 
                  href="https://github.com/Hyraze/collective-ai-tools" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  title="Contribute on GitHub"
                >
                  <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  Contribute
                </a>
                
                <!-- Favorites button -->
                <button 
                  class="inline-flex items-center px-3 lg:px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onclick="toggleFavorites()"
                >
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
                  </svg>
                  ${showOnlyFavorites ? 'Show All' : 'Favorites'} (${favoriteToolNames.size})
                </button>
              </div>
              
              <!-- Theme toggle button -->
              <button 
                class="inline-flex items-center justify-center w-9 h-9 border border-gray-300 dark:border-gray-600 rounded-full text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 hover:scale-105 active:scale-95 transition-all duration-200 shadow-sm hover:shadow-md"
                onclick="toggleTheme()"
                title="Toggle dark/light mode"
                id="theme-toggle-btn"
              >
                <svg id="moon-icon" class="w-4 h-4 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                </svg>
                <svg id="sun-icon" class="w-4 h-4 hidden transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Mobile Sidebar -->
      <div id="mobile-sidebar" class="fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'} sm:hidden">
        <!-- Backdrop -->
        <div class="fixed inset-0 bg-black bg-opacity-50" onclick="toggleMobileMenu()"></div>
        
        <!-- Sidebar -->
        <div class="relative flex flex-col w-80 max-w-sm h-full bg-white dark:bg-gray-800 shadow-xl ml-auto">
          <!-- Header -->
          <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Menu</h2>
            <button 
              onclick="toggleMobileMenu()"
              class="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
          
          <!-- Menu Items -->
          <div class="flex-1 p-4 space-y-4">
            <!-- Buy me a coffee -->
            <a 
              href="https://ko-fi.com/hanish" 
              target="_blank" 
              rel="noopener noreferrer"
              class="flex items-center w-full px-4 py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-red-600 transition-all duration-200 shadow-sm"
              onclick="toggleMobileMenu()"
            >
              <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.5 3H6c-1.1 0-2 .9-2 2v5.71c0 3.83 2.95 7.18 6.78 7.29 3.96.12 7.22-3.06 7.22-7v-1h.5c1.38 0 2.5-1.12 2.5-2.5S19.88 3 18.5 3zM16 5v5.5c0 2.76-2.24 5-5 5s-5-2.24-5-5V5h10z"/>
              </svg>
              Buy me a coffee
            </a>
            
            <!-- Contribute -->
            <a 
              href="https://github.com/Hyraze/collective-ai-tools" 
              target="_blank" 
              rel="noopener noreferrer"
              class="flex items-center w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onclick="toggleMobileMenu()"
            >
              <svg class="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              Contribute on GitHub
            </a>
            
            <!-- Favorites -->
            <button 
              onclick="toggleFavorites(); toggleMobileMenu();"
              class="flex items-center w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
              </svg>
              ${showOnlyFavorites ? 'Show All Tools' : 'Show Favorites'} (${favoriteToolNames.size})
            </button>
            
            <!-- Theme Toggle -->
            <button 
              onclick="toggleTheme()"
              class="flex items-center w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <svg class="w-5 h-5 mr-3 dark:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
              </svg>
              <svg class="w-5 h-5 mr-3 hidden dark:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
              </svg>
              Toggle Theme
            </button>
          </div>
          
          <!-- Footer -->
          <div class="p-4 border-t border-gray-200 dark:border-gray-700">
            <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
              Collective AI Tools
            </p>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <main class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
        <!-- Search and Filters -->
        <div class="mb-12">
          <div class="flex flex-col sm:flex-row gap-3 mb-6">
            <div class="flex-1">
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg class="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                  </svg>
                </div>
                <input
                  type="search"
                  placeholder="Search for a tool..."
                  value="${searchTerm}"
                  oninput="updateSearchTerm(this.value)"
                  onkeyup="updateSearchTerm(this.value)"
                  class="block w-full pl-9 sm:pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base"
                  id="search-input"
                />
              </div>
            </div>
            <div class="flex gap-2">
              <div class="relative flex-1">
                <select 
                  onchange="filterByCategory(this.value)"
                  class="w-full px-3 py-2.5 sm:py-3 pr-8 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-sm sm:text-base appearance-none"
                  id="category-select"
                  value="${selectedCategory}"
                >
                  <option value="">All Categories</option>
                  ${allCategories.map(category => `
                    <option value="${category.id}" ${selectedCategory === category.id ? 'selected' : ''}>${category.name}</option>
                  `).join('')}
                </select>
                <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </div>
              </div>
              <button 
                onclick="clearFilters()" 
                class="inline-flex items-center justify-center px-3 py-2.5 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-xl text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors whitespace-nowrap"
              >
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                </svg>
                <span class="hidden sm:inline ml-1">Clear</span>
              </button>
            </div>
          </div>
          
          <!-- Tags -->
          <div class="flex flex-wrap gap-2 sm:gap-3 mb-6">
            ${Array.from(allDiscoveredTags).map(tag => `
              <button
                class="inline-flex items-center px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                  activeTags.has(tag) 
                    ? 'bg-blue-600 text-white shadow-lg' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }"
                onclick="toggleTag('${tag}')"
              >
                ${tag}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Special Sections -->
        ${!showOnlyFavorites && searchTerm === '' && activeTags.size === 0 ? `
          ${trendingTools.length > 0 ? createTrendingSection().outerHTML : ''}
          ${recentlyAddedTools.length > 0 ? createRecentlyAddedSection().outerHTML : ''}
        ` : ''}

        <!-- Tool Categories -->
        ${filteredCategories.length > 0 ? filteredCategories.map(category => `
          <section class="mb-16">
            <h2 class="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 sm:mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" id="${category.id}">
              ${category.name}
            </h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
              ${category.tools.map(tool => createToolCard(tool).outerHTML).join('')}
            </div>
          </section>
        `).join('') : `
          <div class="text-center py-20">
            <div class="text-8xl mb-6">🔍</div>
            <h3 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">No tools found</h3>
            <p class="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              ${showOnlyFavorites 
                ? "You haven't favorited any tools yet. Click the star on any tool to save it here!"
                : "No tools found matching your criteria. Try adjusting your search or filters."
              }
            </p>
            <button 
              onclick="clearFilters()"
              class="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              Clear All Filters
            </button>
          </div>
        `}
      </main>

      <!-- Footer -->
      <footer class="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 py-12">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p class="text-sm text-gray-600 dark:text-gray-400">
            Made with ❤️ by 
            <a href="${addTrackingParams('https://github.com/Hyraze/collective-ai-tools', 'collectiveai.tools', 'footer_link')}" 
               target="_blank" 
               rel="noopener noreferrer"
               class="text-blue-600 dark:text-blue-400 hover:underline font-medium">
              Collective AI Tools Community
            </a>
          </p>
        </div>
      </footer>
    </div>
  `;
}

function toggleTheme() {
  const body = document.body;
  const isDark = body.dataset.theme === 'dark';
  
  if (isDark) {
    body.dataset.theme = 'light';
    localStorage.setItem('theme', 'light');
  } else {
    body.dataset.theme = 'dark';
    localStorage.setItem('theme', 'dark');
  }
  
  // Update the theme toggle button icons
  updateThemeToggleIcon();
}

function updateThemeToggleIcon() {
  const moonIcon = document.getElementById('moon-icon');
  const sunIcon = document.getElementById('sun-icon');
  
  if (!moonIcon || !sunIcon) return;
  
  const isDark = document.body.dataset.theme === 'dark';
  
  if (isDark) {
    // Show sun icon in dark mode
    moonIcon.classList.add('hidden');
    sunIcon.classList.remove('hidden');
  } else {
    // Show moon icon in light mode
    moonIcon.classList.remove('hidden');
    sunIcon.classList.add('hidden');
  }
}

async function loadAndRenderApp() {
  const root = document.getElementById('root');
  if (!root) {
    console.error('Root element not found');
    return;
  }

  try {
    root.innerHTML = `
      <div class="fixed inset-0 bg-background flex items-center justify-center">
        <div class="text-center">
          <div class="loading-spinner mx-auto mb-4"></div>
          <h2 class="text-xl font-semibold mb-2">Loading AI tools...</h2>
          <p class="text-muted-foreground">Discovering the best AI tools for you</p>
        </div>
      </div>
    `;
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const response = await fetch('/README.md');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const readmeText = await response.text();
    if (!readmeText) {
      throw new Error('Empty response received');
    }
    
    allCategories = parseReadme(readmeText);
    if (allCategories.length === 0) {
      throw new Error('No valid categories found in README');
    }
    
    // Load click data and assign random dates
    loadClickData();
    assignRandomAddedDates();
    
    // Calculate trending and recently added tools
    trendingTools = calculateTrendingTools();
    recentlyAddedTools = calculateRecentlyAddedTools();
    
    // Extract all tags
    allDiscoveredTags.clear();
    allCategories.forEach(cat => 
      cat.tools.forEach(tool => 
        tool.tags.forEach(tag => allDiscoveredTags.add(tag))
      )
    );
    
    // Load theme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    document.body.dataset.theme = initialTheme;
    
    // Update theme toggle icon after a short delay to ensure DOM is ready
    setTimeout(() => {
      updateThemeToggleIcon();
    }, 100);
    
    // Add smooth transition
    root.style.opacity = '0';
    renderApp();
    root.style.transition = 'opacity 0.3s ease-in';
    root.style.opacity = '1';
  } catch (error) {
    console.error("Failed to load or parse README.md:", error);
    root.innerHTML = `
      <div class="min-h-screen bg-background flex items-center justify-center">
        <div class="text-center">
          <div class="text-6xl mb-4">⚠️</div>
          <h2 class="text-2xl font-bold mb-4">Failed to load tools</h2>
          <p class="text-muted-foreground mb-6">Something went wrong while loading the AI tools directory.</p>
          <Button onclick="location.reload()">Try Again</Button>
        </div>
      </div>
    `;
  }
}

// Make functions globally available immediately
(window as any).toggleFavorite = toggleFavorite;
(window as any).toggleTheme = toggleTheme;
(window as any).renderApp = renderApp;

// Create global functions for search and filter functionality
let searchTimeout: number | null = null;
let preserveInputFocus = false;
let inputCursorPosition = 0;

(window as any).updateSearchTerm = (value: string) => {
  searchTerm = value;
  
  // Store cursor position
  const searchInput = document.getElementById('search-input') as HTMLInputElement;
  if (searchInput) {
    inputCursorPosition = searchInput.selectionStart || 0;
    preserveInputFocus = true;
  }
  
  // Clear existing timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout);
  }
  
  // Debounce search to improve performance
  searchTimeout = window.setTimeout(() => {
    renderApp();
    
    // Restore focus and cursor position after re-render
    if (preserveInputFocus) {
      setTimeout(() => {
        const newSearchInput = document.getElementById('search-input') as HTMLInputElement;
        if (newSearchInput) {
          newSearchInput.focus();
          newSearchInput.setSelectionRange(inputCursorPosition, inputCursorPosition);
        }
        preserveInputFocus = false;
      }, 0);
    }
  }, 200); // 200ms debounce
};

(window as any).toggleTag = (tag: string) => {
  if (activeTags.has(tag)) {
    activeTags.delete(tag);
  } else {
    activeTags.add(tag);
  }
  renderApp();
};

(window as any).toggleFavorites = () => {
  showOnlyFavorites = !showOnlyFavorites;
  renderApp();
};

(window as any).filterByCategory = (categoryId: string) => {
  selectedCategory = categoryId;
  renderApp();
};

(window as any).toggleMobileMenu = () => {
  mobileMenuOpen = !mobileMenuOpen;
  renderApp();
};

(window as any).clearFilters = () => {
  // Clear search timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout);
    searchTimeout = null;
  }
  
  searchTerm = '';
  activeTags.clear();
  showOnlyFavorites = false;
  selectedCategory = '';
  mobileMenuOpen = false;
  renderApp();
};

// Initialize the app
document.addEventListener('DOMContentLoaded', loadAndRenderApp);
