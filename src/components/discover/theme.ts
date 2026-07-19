import type { DiscoverType } from './types';

export interface TypeAccent {
  text: string;
  dot: string;
  ring: string;
  glow: string;
  chip: string;
  bar: string;
}

export const TYPE_ACCENT: Record<DiscoverType, TypeAccent> = {
  tool: {
    text: 'text-blue-600 dark:text-blue-400',
    dot: 'bg-blue-500',
    ring: 'hover:border-blue-500/40',
    glow: 'hover:shadow-blue-500/20',
    chip: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 ring-blue-500/20',
    bar: 'from-blue-500 to-cyan-400',
  },
  mcp: {
    text: 'text-emerald-600 dark:text-emerald-400',
    dot: 'bg-emerald-500',
    ring: 'hover:border-emerald-500/40',
    glow: 'hover:shadow-emerald-500/20',
    chip: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 ring-emerald-500/20',
    bar: 'from-emerald-500 to-teal-400',
  },
  prompt: {
    text: 'text-rose-600 dark:text-rose-400',
    dot: 'bg-rose-500',
    ring: 'hover:border-rose-500/40',
    glow: 'hover:shadow-rose-500/20',
    chip: 'bg-rose-500/10 text-rose-700 dark:text-rose-300 ring-rose-500/20',
    bar: 'from-rose-500 to-pink-400',
  },
  skill: {
    text: 'text-violet-600 dark:text-violet-400',
    dot: 'bg-violet-500',
    ring: 'hover:border-violet-500/40',
    glow: 'hover:shadow-violet-500/20',
    chip: 'bg-violet-500/10 text-violet-700 dark:text-violet-300 ring-violet-500/20',
    bar: 'from-violet-500 to-fuchsia-400',
  },
  repo: {
    text: 'text-amber-600 dark:text-amber-400',
    dot: 'bg-amber-500',
    ring: 'hover:border-amber-500/40',
    glow: 'hover:shadow-amber-500/20',
    chip: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 ring-amber-500/20',
    bar: 'from-amber-500 to-orange-400',
  },
};
