export type DiscoverType = 'tool' | 'mcp' | 'prompt' | 'skill' | 'repo';

export interface DiscoverItem {
  id: string;
  type: DiscoverType;
  title: string;
  subtitle: string;
  tags: string[];
  href: string;
  external: boolean;
  meta?: string;
  verified?: boolean;
}

export type GroupStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error';

export interface DiscoverGroup {
  type: DiscoverType;
  label: string;
  seeAllHref: string;
  items: DiscoverItem[];
  status: GroupStatus;
}
