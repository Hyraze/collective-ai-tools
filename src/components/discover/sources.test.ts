import { describe, it, expect } from 'vitest';
import { adaptTool, adaptMcp, adaptPrompt, adaptSkill, adaptRepo } from './sources';

describe('discover adapters', () => {
  it('adaptTool maps an AITool to an external DiscoverItem', () => {
    const item = adaptTool({
      _id: 't1', name: 'LangChain', description: 'LLM framework',
      url: 'https://langchain.com', tags: ['llm', 'agents'],
      category: { _id: 'c1', name: 'Developer', slug: 'developer' },
    } as any);
    expect(item).toEqual({
      id: 't1', type: 'tool', title: 'LangChain', subtitle: 'LLM framework',
      tags: ['llm', 'agents'], href: 'https://langchain.com', external: true, meta: 'Developer',
    });
  });

  it('adaptMcp uses the slug id for an internal href and stars meta', () => {
    const item = adaptMcp({ _id: 'x', id: 'github-mcp', name: 'GitHub MCP', description: 'Repo access', tags: ['git'], stars: 1200 } as any);
    expect(item.href).toBe('/mcp-catalog/github-mcp');
    expect(item.external).toBe(false);
    expect(item.meta).toBe('★ 1200');
    expect(item.type).toBe('mcp');
  });

  it('adaptPrompt falls back to truncated content when description is missing', () => {
    const item = adaptPrompt({ _id: 'p1', title: 'Summarize', content: 'x'.repeat(200), tags: [], source: 'fabric' } as any);
    expect(item.subtitle.length).toBe(120);
    expect(item.href).toBe('/prompts');
    expect(item.external).toBe(false);
  });

  it('adaptSkill links to the external repo', () => {
    const item = adaptSkill({ id: 's1', name: 'sec-kit', description: 'pentest', repo: 'https://github.com/x/sec', tags: ['security'], category: 'security' } as any);
    expect(item).toMatchObject({ id: 's1', type: 'skill', href: 'https://github.com/x/sec', external: true, meta: 'security' });
  });

  it('adaptRepo dedups on link, uses language tag, hides zero stars', () => {
    const item = adaptRepo({ title: 'auto-gpt', link: 'https://github.com/x/a', description: 'agent', isoDate: '', language: 'Python', stars: '0' } as any);
    expect(item).toMatchObject({ id: 'https://github.com/x/a', type: 'repo', href: 'https://github.com/x/a', external: true, tags: ['Python'] });
    expect(item.meta).toBeUndefined();
  });
});
