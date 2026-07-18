import type { AITool, MCPServer } from '@/lib/api';
import type { DiscoverItem, DiscoverType } from './types';

interface McpRaw extends MCPServer {}
interface PromptRaw { _id: string; title: string; description?: string; content: string; tags?: string[]; source?: string }
interface SkillRaw { id: string; name: string; description: string; repo: string; tags?: string[]; category?: string; stars?: number }
interface RepoRaw { title: string; link: string; description: string; language?: string; stars?: string }

export function adaptTool(t: AITool): DiscoverItem {
  return { id: t._id, type: 'tool', title: t.name, subtitle: t.description, tags: t.tags ?? [], href: t.url, external: true, meta: t.category?.name };
}

export function adaptMcp(m: McpRaw): DiscoverItem {
  const slug = m.id ?? m._id;
  return { id: slug, type: 'mcp', title: m.name, subtitle: m.description, tags: m.tags ?? [], href: `/mcp-catalog/${slug}`, external: false, meta: m.stars ? `★ ${m.stars}` : undefined };
}

export function adaptPrompt(p: PromptRaw): DiscoverItem {
  return { id: p._id, type: 'prompt', title: p.title, subtitle: p.description ?? p.content.slice(0, 120), tags: p.tags ?? [], href: '/prompts', external: false, meta: p.source };
}

export function adaptSkill(s: SkillRaw): DiscoverItem {
  return { id: s.id, type: 'skill', title: s.name, subtitle: s.description, tags: s.tags ?? [], href: s.repo, external: true, meta: s.category };
}

export function adaptRepo(r: RepoRaw): DiscoverItem {
  return { id: r.link, type: 'repo', title: r.title, subtitle: r.description, tags: r.language && r.language !== 'Unknown' ? [r.language] : [], href: r.link, external: true, meta: r.stars && r.stars !== '0' ? `★ ${r.stars}` : undefined };
}

async function getJson(url: string, signal: AbortSignal): Promise<any> {
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

const SEARCH_LIMIT = 5;
const BROWSE_LIMIT = 12;
const enc = encodeURIComponent;

export interface Source {
  type: DiscoverType;
  label: string;
  seeAllHref: string;
  searchItems(query: string, signal: AbortSignal): Promise<DiscoverItem[]>;
  browseItems(signal: AbortSignal): Promise<DiscoverItem[]>;
}

export const SOURCES: Source[] = [
  {
    type: 'tool', label: 'Tools', seeAllHref: '/tools',
    async searchItems(q, signal) {
      const j = await getJson(`/api/ai-tools?limit=${SEARCH_LIMIT}&search=${enc(q)}`, signal);
      return (j.data ?? []).map(adaptTool);
    },
    async browseItems(signal) {
      const j = await getJson(`/api/ai-tools?limit=${BROWSE_LIMIT}&sort=trending`, signal);
      return (j.data ?? []).map(adaptTool);
    },
  },
  {
    type: 'mcp', label: 'MCP Servers', seeAllHref: '/mcp-catalog',
    async searchItems(q, signal) {
      const j = await getJson(`/api/mcp?limit=${SEARCH_LIMIT}&search=${enc(q)}`, signal);
      return (j.data ?? []).map(adaptMcp);
    },
    async browseItems(signal) {
      const j = await getJson(`/api/mcp?limit=${BROWSE_LIMIT}&sort=popular`, signal);
      return (j.data ?? []).map(adaptMcp);
    },
  },
  {
    type: 'prompt', label: 'Prompts', seeAllHref: '/prompts',
    async searchItems(q, signal) {
      const j = await getJson(`/api/prompts?limit=${SEARCH_LIMIT}&search=${enc(q)}`, signal);
      return (j.prompts ?? []).map(adaptPrompt);
    },
    async browseItems(signal) {
      const j = await getJson(`/api/prompts?limit=${BROWSE_LIMIT}&sort=newest`, signal);
      return (j.prompts ?? []).map(adaptPrompt);
    },
  },
  {
    type: 'skill', label: 'Skills', seeAllHref: '/skills',
    async searchItems(q, signal) {
      const j = await getJson(`/api/skills?q=${enc(q)}`, signal);
      return (j.data ?? []).slice(0, SEARCH_LIMIT).map(adaptSkill);
    },
    async browseItems(signal) {
      const j = await getJson('/api/skills', signal);
      return (j.data ?? []).slice(0, BROWSE_LIMIT).map(adaptSkill);
    },
  },
  {
    type: 'repo', label: 'Trending Repos', seeAllHref: '/trending',
    async searchItems(q, signal) {
      const j = await getJson('/api/trending-repos', signal);
      const ql = q.toLowerCase();
      return (j.data ?? []).map(adaptRepo)
        .filter((i: DiscoverItem) => i.title.toLowerCase().includes(ql) || i.subtitle.toLowerCase().includes(ql))
        .slice(0, SEARCH_LIMIT);
    },
    async browseItems(signal) {
      const j = await getJson('/api/trending-repos', signal);
      return (j.data ?? []).map(adaptRepo).slice(0, BROWSE_LIMIT);
    },
  },
];
