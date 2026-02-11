/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

const API_BASE_URL = '/api';

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface FilterOption {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
  count?: number; // Optional, if backend provides it later
}

export interface FiltersResponse {
  categories: FilterOption[];
  languages: FilterOption[];
  pricing: FilterOption[];
}

export interface MCPServer {
  _id: string;
  id: string; // The user-facing ID (slug-like)
  name: string;
  description: string;
  longDescription?: string;
  author: string;
  githubUrl?: string;
  url?: string;
  // Type can be 'MCP Server' or 'MCP Client'
  type: 'MCP Server' | 'MCP Client';
  // Populated fields
  category?: FilterOption;
  language?: FilterOption;
  tags: string[];
  rating?: number;
  downloads?: number;
  stars?: number;
  isOfficial?: boolean;
  addedDate?: string;
  lastUpdated?: string;
  location?: 'Local' | 'Remote';
  features?: string[];
  requirements?: string[];
  documentation?: string;
  license?: string;
}

export interface AITool {
  _id: string;
  name: string;
  description: string;
  url: string;
  website?: string;
  // Populated fields
  category?: FilterOption;
  pricing?: FilterOption[];
  tags: string[];
  addedDate?: string;
}

export interface APIResponse<T> {
  data: T[];
  pagination: Pagination;
}

/**
 * Fetch all available filters (Categories, Languages, Pricing)
 */
/**
 * Fetch with exponential backoff retry
 */
async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3, backoff = 1000): Promise<Response> {
  try {
    const res = await fetch(url, options);
    
    // Retry on 429 or 5xx errors
    if (res.status === 429 || res.status >= 500) {
      if (retries > 0) {
        // Parse Retry-After header if available (seconds)
        const retryAfter = res.headers.get('Retry-After');
        const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : backoff;
        
        console.warn(`Request failed with ${res.status}. Retrying in ${waitTime}ms... (${retries} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        return fetchWithRetry(url, options, retries - 1, backoff * 2);
      }
    }
    
    return res;
  } catch (err) {
    if (retries > 0) {
      console.warn(`Network error. Retrying in ${backoff}ms... (${retries} attempts left)`);
      await new Promise(resolve => setTimeout(resolve, backoff));
      return fetchWithRetry(url, options, retries - 1, backoff * 2);
    }
    throw err;
  }
}

/**
 * Fetch all available filters (Categories, Languages, Pricing)
 */
export async function fetchFilters(): Promise<FiltersResponse> {
  const res = await fetchWithRetry(`${API_BASE_URL}/filters`);
  if (!res.ok) throw new Error('Failed to fetch filters');
  return res.json();
}

/**
 * Fetch MCP Servers or Clients
 */
export async function fetchMCPServers(params: {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'server' | 'client';
  category?: string; // slug
  language?: string; // slug
  id?: string;       // exact id match
  sort?: string;     // 'newest' | 'oldest' | 'stars' | 'name'
}): Promise<APIResponse<MCPServer>> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page.toString());
  if (params.limit) query.set('limit', params.limit.toString());
  if (params.search) query.set('search', params.search);
  if (params.type) query.set('type', params.type);
  if (params.category) query.set('category', params.category);
  if (params.language) query.set('language', params.language);
  if (params.id) query.set('id', params.id);
  if (params.sort) query.set('sort', params.sort);

  const res = await fetchWithRetry(`${API_BASE_URL}/mcp?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch MCP data');
  return res.json();
}

/**
 * Fetch AI Tools
 */
export async function fetchAITools(params: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string; // slug
  pricing?: string; // slug
  sort?: string;
}): Promise<APIResponse<AITool>> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', params.page.toString());
  if (params.limit) query.set('limit', params.limit.toString());
  if (params.search) query.set('search', params.search);
  if (params.category) query.set('category', params.category);
  if (params.pricing) query.set('pricing', params.pricing);
  if (params.sort) query.set('sort', params.sort);

  const res = await fetchWithRetry(`${API_BASE_URL}/ai-tools?${query.toString()}`);
  if (!res.ok) throw new Error('Failed to fetch AI tools');
  return res.json();
}
