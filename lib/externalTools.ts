/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

// Google Analytics type declaration
declare global {
  function gtag(...args: any[]): void;
}

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

const FAVORITES_KEY = 'favoriteTools';
const CLICKS_KEY = 'toolClicks';
const TRENDING_DAYS = 7;
const RECENT_DAYS = 30;

// --- HELPERS ---

/**
 * Adds UTM tracking parameters to URLs for analytics
 * @param url - The original URL to add tracking to
 * @param source - The source identifier (default: 'collectiveai.tools')
 * @param contentType - The type of content being linked (default: 'tool_link')
 * @returns The URL with UTM parameters added
 */
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

/**
 * Tracks user clicks for analytics and trending calculations
 * @param url - The URL that was clicked
 * @param type - The type of click event (default: 'tool_click')
 */
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

/**
 * Calculates trending tools based on click frequency and recency
 * @returns Array of trending tools sorted by popularity
 */
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

/**
 * Creates a DOM element for a tool card with proper styling and event handlers
 * @param tool - The tool object to create a card for
 * @returns HTML element representing the tool card
 */
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
    <div class="tool-card">
      <div class="tool-card-header">
        <h3 class="tool-name">
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
      <p class="tool-description">
        ${tool.description}
      </p>
      <div class="tool-footer">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <span class="tool-tag">
            ${tool.tags[0] || 'tool'}
          </span>
        </div>
        <div class="tool-link">
          <span>Visit Tool</span>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
        </div>
      </div>
      <div class="tool-date">
        <span class="flex items-center gap-1">
          <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
          Visit Tool
        </span>
        ${tool.clickCount ? `
          <span class="flex items-center gap-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 px-2 sm:px-3 py-1 rounded-full">
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

/**
 * Creates a special tool card for trending or recently added tools with badges
 * @param tool - The tool object to create a card for
 * @param badgeType - The type of badge to display ('trending' or 'recent')
 * @returns HTML element representing the special tool card
 */
function createSpecialToolCard(tool: Tool, badgeType: 'trending' | 'recent'): HTMLElement {
  const card = document.createElement('a');
  card.className = 'tool-card-link';
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
    <div class="tool-card">
      <div class="tool-card-header">
        <h3 class="tool-name">
          ${tool.name}
        </h3>
        <span class="special-badge ${badgeType}">
          ${badgeType === 'trending' ? '🔥 Trending' : '✨ New'}
        </span>
      </div>
      <p class="tool-description">
        ${tool.description}
      </p>
      <div class="tool-tags-container">
        ${tool.tags.map(tag => `
          <span class="tool-tag-badge">
            ${tag}
          </span>
        `).join('')}
      </div>
      <div class="tool-footer">
        <div class="tool-date">
          <span>${daysAgo} days ago</span>
        </div>
        <div class="tool-link">
          <span>Visit Tool</span>
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
          </svg>
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
    <div class="section-header">
      <h2 class="section-title">
        🔥 Trending Tools
      </h2>
      <p class="section-subtitle">
        Most popular tools this week (${TRENDING_DAYS} days)
      </p>
    </div>
    <div class="tools-grid">
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
    <div class="section-header">
      <h2 class="section-title">
        ✨ Recently Added
      </h2>
      <p class="section-subtitle">
        Latest tools added in the last ${RECENT_DAYS} days
      </p>
    </div>
    <div class="tools-grid">
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

/**
 * Parses the README.md file to extract tool categories and their tools
 * @param readmeText - The content of the README.md file
 * @returns Array of categories with their associated tools
 */
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
  const root = document.getElementById('external-tools-root');
  if (!root) {
    console.warn('external-tools-root element not found');
    return;
  }

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
    <!-- Main Content -->
    <main class="external-tools-content" style="max-width: 80rem; margin: 0 auto; padding: 1.5rem 0.75rem;">
      <!-- Search and Filters -->
      <div class="search-filters">
        <div class="search-row">
          <div class="search-container">
            <div class="search-wrapper">
              <div class="search-icon">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <input
                type="search"
                placeholder="Search for a tool..."
                value="${searchTerm}"
                oninput="updateSearchTerm(this.value)"
                onkeyup="updateSearchTerm(this.value)"
                class="search-input"
                id="search-input"
              />
            </div>
          </div>
          <div class="filter-controls">
            <div class="filter-group">
              <select 
                onchange="filterByCategory(this.value)"
                class="filter-select"
                id="category-select"
                value="${selectedCategory}"
              >
                <option value="">All Categories</option>
                ${allCategories.map(category => `
                  <option value="${category.id}" ${selectedCategory === category.id ? 'selected' : ''}>${category.name}</option>
                `).join('')}
              </select>
              <div class="filter-arrow">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </div>
            <button 
              onclick="clearFilters()" 
              class="clear-button"
            >
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
              <span class="clear-text">Clear</span>
            </button>
          </div>
        </div>
        
        <!-- Tags -->
        <div class="tag-filters">
          ${Array.from(allDiscoveredTags).map(tag => `
            <button
              class="tag-button ${activeTags.has(tag) ? 'active' : 'inactive'}"
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
        <section class="category-section">
          <h2 class="section-title" id="${category.id}">
            ${category.name}
          </h2>
          <div class="tools-grid">
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
  `;
}

// Make functions globally available
(window as any).toggleFavorite = toggleFavorite;
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
  renderApp();
};

/**
 * Initializes the external tools functionality and renders the interface
 * @param container - The DOM element where the external tools should be rendered
 * @returns Promise that resolves when initialization is complete
 */
export async function initializeExternalTools(container: HTMLElement) {
  try {
    // Start with empty container
    container.innerHTML = '';
    
    // Set up a loading indicator that only shows if data takes time to load
    const loadingTimeout = setTimeout(() => {
      if (container.innerHTML.trim() === '') {
        container.innerHTML = `
          <div class="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
            <div class="text-center">
              <div class="animate-spin rounded-full h-8 w-8 border-2 border-gray-300 dark:border-gray-600 border-t-blue-600 mx-auto mb-4"></div>
              <p class="text-gray-600 dark:text-gray-400">Loading external tools...</p>
            </div>
          </div>
        `;
      }
    }, 200);
    
    const response = await fetch('/README.md');
    clearTimeout(loadingTimeout);
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
    
    // Add smooth transition
    container.style.opacity = '0';
    
    // Ensure the container has the right ID for renderApp to find it
    container.id = 'external-tools-root';
    
    renderApp();
    
    // Check if renderApp actually rendered something
    if (container.innerHTML.trim() === '' || container.innerHTML.includes('Loading external tools...')) {
      // Fallback: render directly to container
      container.innerHTML = `
        <main class="external-tools-content max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-6 sm:py-8">
          <div class="text-center py-20">
            <h2 class="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">External Tools</h2>
            <p class="text-gray-600 dark:text-gray-400 mb-8">Loading external tools...</p>
            <div class="tools-grid">
              ${allCategories.map(category => `
                <div class="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                  <h3 class="text-lg font-semibold mb-2 text-gray-900 dark:text-white">${category.name}</h3>
                  <p class="text-sm text-gray-600 dark:text-gray-400">${category.tools.length} tools</p>
                </div>
              `).join('')}
            </div>
          </div>
        </main>
      `;
    }
    
    container.style.transition = 'opacity 0.3s ease-in';
    container.style.opacity = '1';
  } catch (error) {
    console.error("Failed to load or parse README.md:", error);
    container.innerHTML = `
      <div class="min-h-screen bg-background flex items-center justify-center">
        <div class="text-center">
          <div class="text-6xl mb-4">⚠️</div>
          <h2 class="text-2xl font-bold mb-4">Failed to load tools</h2>
          <p class="text-muted-foreground mb-6">Something went wrong while loading the AI tools directory.</p>
          <button onclick="location.reload()">Try Again</button>
        </div>
      </div>
    `;
  }
}
