/**
 * @license
 * AGPL-3.0-or-later
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
  addedDate?: string; // ISO date string when tool was added
  clickCount?: number; // Number of times tool has been clicked
  lastClicked?: string; // ISO date string of last click
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
let scrollSpyObserver: IntersectionObserver | null = null;
let searchTimeout: number | null = null;
let trendingTools: Tool[] = [];
let recentlyAddedTools: Tool[] = [];

const FAVORITES_KEY = 'favoriteTools';
const CLICKS_KEY = 'toolClicks';
const SEARCH_DEBOUNCE_MS = 300;
const TRENDING_DAYS = 7; // Days to look back for trending calculation
const RECENT_DAYS = 30; // Days to consider for recently added

// --- HELPERS ---

/**
 * Adds UTM parameters and referrer tracking to external URLs
 */
function addTrackingParams(url: string, source: string = 'collectiveai.tools', contentType: string = 'tool_link'): string {
  try {
    const urlObj = new URL(url);
    
    // Add UTM parameters for analytics
    urlObj.searchParams.set('utm_source', source);
    urlObj.searchParams.set('utm_medium', 'referral');
    urlObj.searchParams.set('utm_campaign', 'ai_tools_directory');
    urlObj.searchParams.set('utm_content', contentType);
    
    // Add referrer parameter for some services
    urlObj.searchParams.set('ref', source);
    
    // Add additional tracking parameters
    urlObj.searchParams.set('source', source);
    urlObj.searchParams.set('referrer', 'collectiveai.tools');
    
    return urlObj.toString();
  } catch (error) {
    console.warn('Invalid URL for tracking:', url);
    return url;
  }
}

/**
 * Tracks click events for analytics and popularity
 */
function trackClick(url: string, type: string = 'tool_click') {
  // Google Analytics 4 event tracking
  if (typeof gtag !== 'undefined') {
    gtag('event', 'click', {
      event_category: 'outbound_link',
      event_label: url,
      value: type
    });
  }
  
  // Track clicks for trending calculation
  if (type === 'tool_click') {
    trackToolClick(url);
  }
  
  // Console log for debugging
  console.log(`Tracked click: ${type} -> ${url}`);
}

/**
 * Tracks tool clicks for trending calculation
 */
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
    
    // Update tool click count in memory
    updateToolClickCount(url, clicks[url].count);
  } catch (error) {
    console.warn('Failed to track tool click:', error);
  }
}

/**
 * Updates tool click count in memory
 */
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
 * Calculates trending tools based on recent clicks
 */
function calculateTrendingTools(): Tool[] {
  const allTools: Tool[] = [];
  allCategories.forEach(category => {
    allTools.push(...category.tools);
  });

  const now = new Date();
  const trendingThreshold = new Date(now.getTime() - (TRENDING_DAYS * 24 * 60 * 60 * 1000));

  // First try to get tools with recent clicks
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

  // If no recent clicks, show tools with any clicks (for initial engagement)
  if (trendingTools.length === 0) {
    trendingTools = allTools
      .filter(tool => (tool.clickCount || 0) > 0)
      .sort((a, b) => {
        const aClicks = a.clickCount || 0;
        const bClicks = b.clickCount || 0;
        return bClicks - aClicks;
      });
  }

  return trendingTools.slice(0, 10); // Top 10 trending tools
}

/**
 * Calculates recently added tools
 */
function calculateRecentlyAddedTools(): Tool[] {
  const allTools: Tool[] = [];
  allCategories.forEach(category => {
    allTools.push(...category.tools);
  });

  const now = new Date();
  const recentThreshold = new Date(now.getTime() - (RECENT_DAYS * 24 * 60 * 60 * 1000));

  // First try to get tools added within the recent threshold
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

  // If no recent tools, show the most recently added tools overall
  if (recentTools.length === 0) {
    recentTools = allTools
      .filter(tool => tool.addedDate)
      .sort((a, b) => {
        const aDate = new Date(a.addedDate || 0);
        const bDate = new Date(b.addedDate || 0);
        return bDate.getTime() - aDate.getTime();
      })
      .slice(0, 10); // Show top 10 most recent tools
  }

  return recentTools.slice(0, 10); // Top 10 recently added tools
}

/**
 * Loads click data from localStorage and updates tools
 */
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

/**
 * Assigns random added dates to tools for demonstration
 * In a real app, this would come from your database
 */
function assignRandomAddedDates() {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  
  for (const category of allCategories) {
    for (const tool of category.tools) {
      if (!tool.addedDate) {
        // Assign random date within last 30 days
        const randomTime = thirtyDaysAgo.getTime() + Math.random() * (now.getTime() - thirtyDaysAgo.getTime());
        tool.addedDate = new Date(randomTime).toISOString();
      }
    }
  }
}

/**
 * Creates a tool card with trending/recent badge
 */
function createSpecialToolCard(tool: Tool, badgeType: 'trending' | 'recent'): HTMLElement {
  const card = document.createElement('a');
  card.className = 'card special-card';
  card.href = addTrackingParams(tool.url, 'collectiveai.tools', 'tool_link');
  card.target = '_blank';
  card.rel = 'noopener noreferrer';
  card.setAttribute('aria-label', `Visit ${tool.name}`);
  card.id = generateToolId(tool.name);
  
  // Add click tracking
  card.addEventListener('click', () => {
    trackClick(tool.url, 'tool_click');
  });

  const badge = document.createElement('div');
  badge.className = `tool-badge ${badgeType}`;
  badge.textContent = badgeType === 'trending' ? '🔥 Trending' : '✨ New';
  
  const title = document.createElement('h3');
  title.textContent = tool.name;
  title.className = 'tool-title';
  
  const description = document.createElement('p');
  description.textContent = tool.description;
  description.className = 'tool-description';
  
  const tags = document.createElement('div');
  tags.className = 'tool-tags';
  tool.tags.forEach(tag => {
    const tagElement = document.createElement('span');
    tagElement.textContent = tag;
    tagElement.className = 'tag';
    tags.appendChild(tagElement);
  });
  
  const metadata = document.createElement('div');
  metadata.className = 'tool-metadata';
  
  if (badgeType === 'trending' && tool.clickCount) {
    const clickCount = document.createElement('span');
    clickCount.className = 'click-count';
    clickCount.textContent = `${tool.clickCount} clicks`;
    metadata.appendChild(clickCount);
  }
  
  if (badgeType === 'recent' && tool.addedDate) {
    const addedDate = document.createElement('span');
    addedDate.className = 'added-date';
    const date = new Date(tool.addedDate);
    const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
    addedDate.textContent = `${daysAgo} days ago`;
    metadata.appendChild(addedDate);
  }
  
  card.appendChild(badge);
  card.appendChild(title);
  card.appendChild(description);
  card.appendChild(tags);
  card.appendChild(metadata);
  
  return card;
}

/**
 * Creates trending tools section
 */
function createTrendingSection(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'special-section trending-section';
  section.id = 'trending';
  
  const header = document.createElement('div');
  header.className = 'section-header';
  
  const title = document.createElement('h2');
  title.textContent = '🔥 Trending Tools';
  title.className = 'section-title';
  
  const subtitle = document.createElement('p');
  subtitle.textContent = `Most popular tools this week (${TRENDING_DAYS} days)`;
  subtitle.className = 'section-subtitle';
  
  header.appendChild(title);
  header.appendChild(subtitle);
  
  const toolsContainer = document.createElement('div');
  toolsContainer.className = 'tools-grid special-grid';
  
  if (trendingTools.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `
      <p>No trending tools yet. Start clicking on tools to see what's popular!</p>
    `;
    toolsContainer.appendChild(emptyState);
  } else {
    trendingTools.forEach(tool => {
      const card = createSpecialToolCard(tool, 'trending');
      toolsContainer.appendChild(card);
    });
  }
  
  section.appendChild(header);
  section.appendChild(toolsContainer);
  
  return section;
}

/**
 * Creates recently added tools section
 */
function createRecentlyAddedSection(): HTMLElement {
  const section = document.createElement('section');
  section.className = 'special-section recent-section';
  section.id = 'recent';
  
  const header = document.createElement('div');
  header.className = 'section-header';
  
  const title = document.createElement('h2');
  title.textContent = '✨ Recently Added';
  title.className = 'section-title';
  
  const subtitle = document.createElement('p');
  subtitle.textContent = `Latest tools added in the last ${RECENT_DAYS} days`;
  subtitle.className = 'section-subtitle';
  
  header.appendChild(title);
  header.appendChild(subtitle);
  
  const toolsContainer = document.createElement('div');
  toolsContainer.className = 'tools-grid special-grid';
  
  if (recentlyAddedTools.length === 0) {
    const emptyState = document.createElement('div');
    emptyState.className = 'empty-state';
    emptyState.innerHTML = `
      <p>No recently added tools. Check back soon for new additions!</p>
    `;
    toolsContainer.appendChild(emptyState);
  } else {
    recentlyAddedTools.forEach(tool => {
      const card = createSpecialToolCard(tool, 'recent');
      toolsContainer.appendChild(card);
    });
  }
  
  section.appendChild(header);
  section.appendChild(toolsContainer);
  
  return section;
}

/**
 * Generates a consistent HSL color from a string.
 */
function stringToHslColor(str: string, s: number, l: number): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, ${s}%, ${l}%)`;
}

/**
 * Determines if text should be black or white over a given HSL background color.
 */
function getTextColorForBg(hslBg: string): 'black' | 'white' {
    const [h, s, l] = hslBg.match(/\d+/g)!.map(Number);
    const s_norm = s / 100;
    const l_norm = l / 100;
    const c = (1 - Math.abs(2 * l_norm - 1)) * s_norm;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l_norm - c / 2;
    let r = 0, g = 0, b = 0;
    if (h >= 0 && h < 60) { [r,g,b] = [c,x,0]; }
    else if (h >= 60 && h < 120) { [r,g,b] = [x,c,0]; }
    else if (h >= 120 && h < 180) { [r,g,b] = [0,c,x]; }
    else if (h >= 180 && h < 240) { [r,g,b] = [0,x,c]; }
    else if (h >= 240 && h < 300) { [r,g,b] = [x,0,c]; }
    else if (h >= 300 && h < 360) { [r,g,b] = [c,0,x]; }

    const r_final = Math.round((r + m) * 255);
    const g_final = Math.round((g + m) * 255);
    const b_final = Math.round((b + m) * 255);
    
    const luminance = (0.299 * r_final + 0.587 * g_final + 0.114 * b_final) / 255;
    return luminance > 0.5 ? 'black' : 'white';
}

/**
 * Returns a style object with background and text color for a given tag.
 */
function generateTagStyle(tag: string): { backgroundColor: string; color: string } {
    const backgroundColor = stringToHslColor(tag, 65, 50);
    const color = getTextColorForBg(backgroundColor);
    return { backgroundColor, color };
}


// --- FAVORITES LOGIC ---
function loadFavorites() {
    const storedFavorites = localStorage.getItem(FAVORITES_KEY);
    if (storedFavorites) {
        favoriteToolNames = new Set(JSON.parse(storedFavorites));
    }
}

function saveFavorites() {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(Array.from(favoriteToolNames)));
}

function toggleFavorite(toolName: string) {
    if (favoriteToolNames.has(toolName)) {
        favoriteToolNames.delete(toolName);
    } else {
        favoriteToolNames.add(toolName);
    }
    saveFavorites();
    renderApp();
}


// --- PARSING LOGIC ---
function parseReadme(markdown: string): Category[] {
  if (!markdown || typeof markdown !== 'string') {
    console.warn('Invalid markdown input provided to parseReadme');
    return [];
  }

  const categories: Category[] = [];
  const sections = markdown.split('\n## ');

  for (const section of sections.slice(1)) { // Skip intro
    const lines = section.split('\n');
    const categoryName = lines[0]?.trim();

    if (!categoryName || ['Table of Contents', 'Pricing', 'License', 'Contributors'].includes(categoryName)) {
      continue;
    }

    const tools: Tool[] = [];
    const toolRegex = /^-? ?\[(.+?)\]\((.+?)\) - (.*)/;

    for (const line of lines) {
      const match = line.trim().match(toolRegex);

      if (match) {
        const name = match[1]?.trim();
        const url = match[2]?.trim();
        let description = match[3]?.trim();
        
        // Validate required fields
        if (!name || !url || !description) {
          console.warn('Skipping invalid tool entry:', { name, url, description });
          continue;
        }

        // Validate URL format
        try {
          new URL(url);
        } catch {
          console.warn('Invalid URL for tool:', name, url);
          continue;
        }
        
        const allTags = line.match(/#\w+/g) || [];

        // Clean description by removing tags
        allTags.forEach(tag => {
            description = description.replace(new RegExp('`' + tag + '`', 'g'), '').trim();
        });

        tools.push({ name, url, description, tags: allTags });
      }
    }

    if (tools.length > 0) {
      categories.push({
        name: categoryName,
        id: categoryName.toLowerCase().replace(/\s+/g, '-'),
        tools,
      });
    }
  }
  return categories;
}

function generateToolId(name: string): string {
    return `tool-${name.toLowerCase().replace(/[^a-z0-9]/g, '-').substring(0, 50)}`;
}

// --- DOM CREATION & RENDERING ---
function createToolCard(tool: Tool): HTMLElement {
  const card = document.createElement('a');
  card.className = 'card';
  card.href = addTrackingParams(tool.url, 'collectiveai.tools', 'tool_link');
  card.target = '_blank';
  card.rel = 'noopener noreferrer';
  card.setAttribute('aria-label', `Visit ${tool.name}`);
  card.id = generateToolId(tool.name);
  
  // Add click tracking
  card.addEventListener('click', () => {
    trackClick(tool.url, 'tool_click');
  });

  const favButton = document.createElement('button');
  favButton.className = 'favorite-btn';
  favButton.innerHTML = '&#9733;'; // Star character
  favButton.setAttribute('aria-label', 'Toggle favorite');
  if (favoriteToolNames.has(tool.name)) {
      favButton.classList.add('favorited');
  }
  favButton.onclick = (e) => {
      e.preventDefault(); // Prevent link navigation
      e.stopPropagation(); // Prevent event bubbling to the card
      toggleFavorite(tool.name);
  };
  card.appendChild(favButton);

  const name = document.createElement('h3');
  name.textContent = tool.name;

  const description = document.createElement('p');
  description.textContent = tool.description;

  const tagsContainer = document.createElement('div');
  tagsContainer.className = 'tags';

  tool.tags.forEach(tagString => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    const style = generateTagStyle(tagString);
    Object.assign(tag.style, {
        backgroundColor: style.backgroundColor,
        color: style.color
    });
    tag.textContent = tagString;
    tagsContainer.appendChild(tag);
  });

  card.append(name, description, tagsContainer);
  return card;
}

function renderApp() {
  const root = document.getElementById('root');
  if (!root) return;

  // --- FILTERING ---
  const lowerCaseSearchTerm = searchTerm.toLowerCase();
  let totalToolsFound = 0;
  
  const categoriesToFilter = showOnlyFavorites
    ? [{ 
        name: 'Favorites', 
        id: 'favorites', 
        tools: allCategories.flatMap(c => c.tools).filter(t => favoriteToolNames.has(t.name))
      }]
    : allCategories;

  const filteredCategories = categoriesToFilter.map(category => {
      const filteredTools = category.tools.filter(tool => {
        // Early return for performance
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
  
  // --- Clear previous content ---
  root.innerHTML = '';
  
  // --- Sidebar ---
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar';
  
  const sidebarHeader = document.createElement('h2');
  sidebarHeader.className = 'sidebar-header';
  sidebarHeader.textContent = 'Categories';
  
  const categoryList = document.createElement('ul');
  categoryList.className = 'category-list';
  
  const sidebarOverlay = document.createElement('div');
  sidebarOverlay.className = 'sidebar-overlay';

  const closeSidebar = () => {
    document.body.classList.remove('sidebar-open');
    document.querySelector('.mobile-menu-toggle')?.setAttribute('aria-expanded', 'false');
  };

  if (favoriteToolNames.size > 0) {
      const li = document.createElement('li');
      li.className = 'favorites-link';
      const a = document.createElement('a');
      a.href = '#favorites';
      a.textContent = '⭐ Favorites';
      a.onclick = (e) => {
        e.preventDefault();
        showOnlyFavorites = true;
        activeTags.clear();
        document.querySelector('.main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
        renderApp();
        closeSidebar();
      };
      
      const countSpan = document.createElement('span');
      countSpan.className = 'category-count';
      countSpan.textContent = String(favoriteToolNames.size);
      a.appendChild(countSpan);
      
      li.appendChild(a);
      categoryList.appendChild(li);

      const separator = document.createElement('hr');
      separator.className = 'sidebar-separator';
      categoryList.appendChild(separator);
  }

  allCategories.forEach(cat => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = `#${cat.id}`;
      a.textContent = cat.name;
      a.onclick = (e) => {
        e.preventDefault();
        if (showOnlyFavorites) {
            showOnlyFavorites = false;
            // A small delay to allow the DOM to re-render before scrolling
            setTimeout(() => {
                document.getElementById(cat.id)?.scrollIntoView({behavior: 'smooth'});
            }, 50);
            renderApp();
        } else {
            document.getElementById(cat.id)?.scrollIntoView({behavior: 'smooth'});
        }
        closeSidebar();
      };
      
      const countSpan = document.createElement('span');
      countSpan.className = 'category-count';
      countSpan.textContent = String(cat.tools.length);
      a.appendChild(countSpan);
      
      li.appendChild(a);
      categoryList.appendChild(li);
  });

  sidebar.append(sidebarHeader, categoryList);
  sidebarOverlay.onclick = closeSidebar;

  const sidebarToggleDesktop = document.createElement('button');
  sidebarToggleDesktop.className = 'sidebar-toggle-desktop';
  sidebarToggleDesktop.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>`;
  sidebarToggleDesktop.setAttribute('aria-label', 'Toggle sidebar');
  sidebarToggleDesktop.onclick = () => {
    document.body.classList.toggle('sidebar-collapsed');
  };

  // --- Main Content ---
  const mainContent = document.createElement('main');
  mainContent.className = 'main-content';

  const appHeader = document.createElement('header');
  appHeader.className = 'app-header';
  
    // Mobile Menu Toggle
  const menuToggle = document.createElement('button');
  menuToggle.className = 'mobile-menu-toggle';
  menuToggle.innerHTML = '&#9776;'; // Hamburger icon
  menuToggle.setAttribute('aria-label', 'Toggle navigation');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.onclick = () => {
      const isOpen = document.body.classList.toggle('sidebar-open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
  };

  const headerTitle = document.createElement('div');
  headerTitle.className = 'app-header-title';
  headerTitle.innerHTML = `<h1>Collective AI Tools</h1><p>A curated selection of AI tools and resources.</p>`;
  
  const headerActions = document.createElement('div');
  headerActions.className = 'app-header-actions';
  
  const surpriseButton = document.createElement('button');
  surpriseButton.className = 'surprise-btn';
  surpriseButton.setAttribute('aria-label', 'Surprise me with a random tool');
  surpriseButton.innerHTML = `✨<span>Surprise Me</span>`;
  surpriseButton.onclick = () => {
    const allTools = allCategories.flatMap(c => c.tools);
    if (allTools.length === 0) return;
    
    const randomTool = allTools[Math.floor(Math.random() * allTools.length)];
    const toolId = generateToolId(randomTool.name);

    if (showOnlyFavorites) {
        showOnlyFavorites = false;
        renderApp();
        setTimeout(() => {
            const toolCard = document.getElementById(toolId);
            if(toolCard) {
                toolCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                toolCard.classList.add('highlight');
                setTimeout(() => toolCard.classList.remove('highlight'), 2000);
            }
        }, 100);
    } else {
        const toolCard = document.getElementById(toolId);
        if (toolCard) {
            toolCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
            toolCard.classList.add('highlight');
            setTimeout(() => toolCard.classList.remove('highlight'), 2000);
        }
    }
  };
  
  const bmacButton = document.createElement('a');
  bmacButton.href = addTrackingParams("https://www.buymeacoffee.com/hanishrao", 'collectiveai.tools', 'donation_link');
  bmacButton.target = "_blank";
  bmacButton.rel = "noopener noreferrer";
  bmacButton.className = "bmac-btn";
  bmacButton.setAttribute('aria-label', 'Buy Me A Coffee');
  
  // Add click tracking
  bmacButton.addEventListener('click', () => {
    trackClick("https://www.buymeacoffee.com/hanishrao", 'donation_click');
  });
  bmacButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24" fill="#000000"><path d="M20.3,5.2c-0.2-0.3-0.5-0.5-0.8-0.5H6.2C5.6,4.7,5.1,5,4.8,5.5L2,11.3c-0.1,0.2-0.2,0.5-0.2,0.7v1.2c0,1,0.8,1.8,1.8,1.8h0.2c-0.1-0.3-0.1-0.5-0.1-0.8c0-1.5,1.2-2.7,2.7-2.7h10.3c1.5,0,2.7,1.2,2.7,2.7c0,0.3,0,0.5-0.1,0.8h0.2c1,0,1.8-0.8,1.8-1.8v-1.2c0-0.2-0.1-0.5-0.2-0.7L20.3,5.2z"></path><path d="M18.7,14H7.6c-0.9,0-1.6,0.7-1.6,1.6v2.9c0,0.9,0.7,1.6,1.6,1.6h11.1c0.9,0,1.6-0.7,1.6-1.6v-2.9C20.3,14.7,19.6,14,18.7,14z"></path></svg><span>Buy me a coffee</span>`;
  
  const contributeButton = document.createElement('a');
  contributeButton.href = addTrackingParams("https://github.com/Hyraze/collective-ai-tools", 'collectiveai.tools', 'github_link');
  contributeButton.target = "_blank";
  contributeButton.rel = "noopener noreferrer";
  contributeButton.className = "contribute-btn";
  contributeButton.setAttribute('aria-label', 'Contribute on GitHub');
  
  // Add click tracking
  contributeButton.addEventListener('click', () => {
    trackClick("https://github.com/Hyraze/collective-ai-tools", 'github_click');
  });
  contributeButton.innerHTML = `<svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.91 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg><span>Contribute on GitHub</span>`;

  const themeToggle = document.createElement('button');
  themeToggle.id = 'theme-toggle';
  themeToggle.setAttribute('aria-label', 'Toggle theme');
  const themeIcon = document.createElement('span');
  themeIcon.className = 'icon';
  themeToggle.appendChild(themeIcon);

  headerActions.append(surpriseButton, bmacButton, contributeButton, themeToggle);
  appHeader.append(menuToggle, headerTitle, headerActions);


  const filtersContainer = document.createElement('div');
  filtersContainer.className = 'filters-container';

  const searchInput = document.createElement('input');
  searchInput.type = 'search';
  searchInput.className = 'search-bar';
  searchInput.placeholder = 'Search for a tool (or press Ctrl+K)...';
  searchInput.value = searchTerm;
  searchInput.setAttribute('aria-label', 'Search tools by name or description');
  searchInput.setAttribute('role', 'searchbox');
  searchInput.oninput = (e) => {
    const value = (e.target as HTMLInputElement).value;
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Debounce search to improve performance
    searchTimeout = window.setTimeout(() => {
      searchTerm = value;
      renderApp();
    }, SEARCH_DEBOUNCE_MS);
  };

  const tagFilters = document.createElement('div');
  tagFilters.className = 'tag-filters';

  if (favoriteToolNames.size > 0) {
      const button = document.createElement('button');
      button.className = 'tag-filter favorites';
      button.textContent = '⭐ Favorites';
      button.setAttribute('aria-pressed', String(showOnlyFavorites));
      if (showOnlyFavorites) {
          button.classList.add('active');
      }
      button.onclick = () => {
          showOnlyFavorites = !showOnlyFavorites;
          activeTags.clear();
          renderApp();
      };
      tagFilters.appendChild(button);
  }

  const sortedTags = Array.from(allDiscoveredTags).sort();
  sortedTags.forEach(tag => {
    const button = document.createElement('button');
    button.className = 'tag-filter';
    button.textContent = tag;
    button.setAttribute('aria-pressed', activeTags.has(tag) ? 'true' : 'false');
    
    if (activeTags.has(tag)) {
      button.classList.add('active');
      const style = generateTagStyle(tag);
      Object.assign(button.style, {
          backgroundColor: style.backgroundColor,
          borderColor: style.backgroundColor,
          color: style.color
      });
    }

    button.onclick = () => {
      showOnlyFavorites = false;
      if (activeTags.has(tag)) {
        activeTags.delete(tag);
      } else {
        activeTags.add(tag);
      }
      renderApp();
    };
    tagFilters.appendChild(button);
  });
  
  const resultsSummary = document.createElement('div');
  resultsSummary.className = 'results-summary';
  
  filtersContainer.append(searchInput, tagFilters, resultsSummary);
  
  const toolListSection = document.createElement('section');
  toolListSection.className = 'tool-list';

  // Add special sections only when not filtering and when there's data
  if (!showOnlyFavorites && searchTerm === '' && activeTags.size === 0) {
    // Add trending tools section only if there are trending tools
    if (trendingTools.length > 0) {
      const trendingSection = createTrendingSection();
      toolListSection.appendChild(trendingSection);
    }
    
    // Add recently added tools section only if there are recent tools
    if (recentlyAddedTools.length > 0) {
      const recentSection = createRecentlyAddedSection();
      toolListSection.appendChild(recentSection);
    }
  }

  if (filteredCategories.length > 0) {
    const categoryCount = showOnlyFavorites ? 1 : filteredCategories.length;
    const categoryText = categoryCount === 1 ? 'category' : 'categories';
    resultsSummary.textContent = `Showing ${totalToolsFound} tools in ${categoryCount} ${categoryText}.`;

    filteredCategories.forEach(category => {
      const categorySection = document.createElement('div');
      categorySection.className = 'category-section';
      categorySection.id = category.id;

      const categoryTitle = document.createElement('h2');
      categoryTitle.textContent = category.name;
      
      const cardGrid = document.createElement('div');
      cardGrid.className = 'card-grid';
      category.tools.forEach(tool => cardGrid.appendChild(createToolCard(tool)));

      categorySection.append(categoryTitle, cardGrid);
      toolListSection.appendChild(categorySection);
    });
  } else {
    resultsSummary.textContent = '';
    const message = showOnlyFavorites 
        ? "You haven't favorited any tools yet. Click the star on any tool to save it here!"
        : "No tools found matching your criteria.";
    toolListSection.innerHTML = `<div class="no-results"><p>${message}</p></div>`;
  }
  
  const footer = document.createElement('footer');
  footer.className = 'app-footer';
  const footerText = document.createElement('span');
  footerText.innerHTML = `Made with ❤️ by <a href="${addTrackingParams('https://github.com/Hyraze/collective-ai-tools', 'collectiveai.tools', 'footer_link')}" target="_blank" rel="noopener noreferrer">Collective AI Tools Community</a>`;
  
  const contributeHelpLink = document.createElement('a');
  contributeHelpLink.href = '#';
  contributeHelpLink.textContent = 'How to Contribute';
  contributeHelpLink.className = 'contribute-help-link';
  contributeHelpLink.onclick = (e) => {
      e.preventDefault();
      showContributeModal();
  };
  
  footer.append(footerText, ' | ', contributeHelpLink);

  mainContent.append(appHeader, filtersContainer, toolListSection, footer);

  root.append(sidebar, mainContent, sidebarToggleDesktop);
  document.body.append(sidebarOverlay); // Append overlay to body

  // Attach listeners to dynamically created elements
  setupThemeToggle(themeToggle, themeIcon);
  setupScrollSpy();
}


// --- UI Enhancements ---

/**
 * Sets up an IntersectionObserver to highlight the current category in the sidebar as the user scrolls.
 */
function setupScrollSpy() {
    // Disconnect any existing observer
    if (scrollSpyObserver) {
        scrollSpyObserver.disconnect();
    }

    const sections = document.querySelectorAll('.category-section');
    if (sections.length === 0) {
        document.querySelector('.category-list a.active')?.classList.remove('active');
        return;
    }

    const observerOptions = {
        root: null, // observes intersections in the viewport
        rootMargin: `-120px 0px -60% 0px`, // A horizontal "line" at the top of the viewport
        threshold: 0,
    };

    let lastActiveId: string | null = null;

    scrollSpyObserver = new IntersectionObserver((entries) => {
        let visibleSections: { id: string; top: number }[] = [];
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                visibleSections.push({
                    id: entry.target.id,
                    top: entry.boundingClientRect.top,
                });
            }
        });

        if (visibleSections.length > 0) {
            // Find the section that is closest to the top of the viewport
            visibleSections.sort((a, b) => a.top - b.top);
            const newActiveId = visibleSections[0].id;

            if (newActiveId !== lastActiveId) {
                // Remove active class from the previously active link
                if (lastActiveId) {
                    document.querySelector(`.category-list a[href="#${lastActiveId}"]`)?.classList.remove('active');
                }
                
                // Add active class to the new active link
                const newActiveLink = document.querySelector(`.category-list a[href="#${newActiveId}"]`);
                newActiveLink?.classList.add('active');

                lastActiveId = newActiveId;
            }
        }
    }, observerOptions);

    sections.forEach(section => scrollSpyObserver!.observe(section));
}

function setupThemeToggle(toggleElement: HTMLElement, iconElement: HTMLElement) {
    const applyTheme = (theme: 'light' | 'dark') => {
        document.body.dataset.theme = theme;
        iconElement.textContent = theme === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('theme', theme);
    };

    toggleElement.onclick = () => {
        const newTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
        applyTheme(newTheme);
    };

    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    applyTheme(initialTheme as 'light' | 'dark');
}

function setupBackToTopButton() {
    const backToTopButton = document.createElement('button');
    backToTopButton.id = 'back-to-top';
    backToTopButton.innerHTML = '&#8679;';
    backToTopButton.setAttribute('aria-label', 'Back to top');
    
    window.onscroll = () => {
        if (document.body.scrollTop > 300 || document.documentElement.scrollTop > 300) {
            backToTopButton.classList.add('visible');
        } else {
            backToTopButton.classList.remove('visible');
        }
    };

    backToTopButton.onclick = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    document.body.appendChild(backToTopButton);
}

function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Focus search with Ctrl/Cmd + K
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault();
            const searchInput = document.querySelector('.search-bar') as HTMLInputElement | null;
            searchInput?.focus();
        }
        
        // Escape key to clear search
        if (e.key === 'Escape') {
            const searchInput = document.querySelector('.search-bar') as HTMLInputElement | null;
            if (searchInput && document.activeElement === searchInput) {
                searchInput.value = '';
                searchTerm = '';
                renderApp();
            }
        }
        
        // Enter key on tag filters
        if (e.key === 'Enter' && e.target instanceof HTMLElement) {
            if (e.target.classList.contains('tag-filter')) {
                e.target.click();
            }
        }
    });
}

function createContributeModal() {
    const modal = document.createElement('div');
    modal.id = 'contribute-modal';
    modal.className = 'modal-container';
    modal.style.display = 'none';
    modal.innerHTML = `
        <div class="modal-overlay"></div>
        <div class="modal-content">
            <button class="modal-close-btn" aria-label="Close dialog">&times;</button>
            <h2>How to Contribute</h2>
            <p>This project is open-source and thrives on community contributions!</p>
            <p>To add a tool, fix a bug, or suggest a feature, please check out our detailed contribution guide on GitHub. It has everything you need to get started, from forking the repo to submitting a pull request.</p>
            <a href="${addTrackingParams('https://github.com/Hyraze/collective-ai-tools/blob/main/CONTRIBUTING.md', 'collectiveai.tools', 'modal_link')}" class="contribute-btn" target="_blank" rel="noopener noreferrer">View Contribution Guide</a>
        </div>
    `;
    
    document.body.appendChild(modal);

    const closeModal = () => modal.style.display = 'none';
    modal.querySelector('.modal-overlay')?.addEventListener('click', closeModal);
    modal.querySelector('.modal-close-btn')?.addEventListener('click', closeModal);
}

function showContributeModal() {
    const modal = document.getElementById('contribute-modal');
    if (modal) {
        modal.style.display = 'flex';
    }
}

// --- PWA Service Worker ---
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                })
                .catch(err => {
                    console.log('ServiceWorker registration failed: ', err);
                });
        });
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
            <div class="loading-container">
                <div class="loading-spinner"></div>
                <p class="loading-message">Loading AI tools...</p>
                <p class="loading-subtitle">Discovering the best AI tools for you</p>
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
        
        // Load click data and assign random dates for demonstration
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
        
        // Add a smooth transition when content loads
        root.style.opacity = '0';
        renderApp();
        root.style.transition = 'opacity 0.3s ease-in';
        root.style.opacity = '1';
    } catch (error) {
        console.error("Failed to load or parse README.md:", error);
        root.innerHTML = `
            <div class="error-container">
                <h2>Oops! Something went wrong</h2>
                <p class="error-message">Failed to load tools. Please try again later.</p>
                <button onclick="location.reload()" class="retry-btn">Retry</button>
            </div>
        `;
    }
}

// --- Initial Load ---
document.addEventListener('DOMContentLoaded', () => {
    loadFavorites();
    loadAndRenderApp();
    setupBackToTopButton();
    setupKeyboardShortcuts();
    registerServiceWorker();
    createContributeModal();
});

// --- Cleanup on page unload ---
window.addEventListener('beforeunload', () => {
    if (scrollSpyObserver) {
        scrollSpyObserver.disconnect();
    }
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
});                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      