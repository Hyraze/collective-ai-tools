/**
 * Feature flag system for easy feature toggling and A/B testing
 */

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description: string;
  rolloutPercentage?: number;
  targetUsers?: string[];
}

export const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  // UI/UX Features
  DARK_MODE: {
    name: 'dark_mode',
    enabled: true,
    description: 'Enable dark mode toggle'
  },
  
  ADVANCED_SEARCH: {
    name: 'advanced_search',
    enabled: true,
    description: 'Enable advanced search filters'
  },
  
  TOOL_RATINGS: {
    name: 'tool_ratings',
    enabled: false,
    description: 'Enable tool rating system',
    rolloutPercentage: 50
  },
  
  USER_PROFILES: {
    name: 'user_profiles',
    enabled: false,
    description: 'Enable user profile system'
  },
  
  // Performance Features
  VIRTUAL_SCROLLING: {
    name: 'virtual_scrolling',
    enabled: true,
    description: 'Enable virtual scrolling for large lists'
  },
  
  LAZY_LOADING: {
    name: 'lazy_loading',
    enabled: true,
    description: 'Enable lazy loading of images'
  },
  
  // Analytics Features
  CLICK_TRACKING: {
    name: 'click_tracking',
    enabled: true,
    description: 'Enable click tracking analytics'
  },
  
  USER_ANALYTICS: {
    name: 'user_analytics',
    enabled: false,
    description: 'Enable detailed user analytics'
  }
};

export function isFeatureEnabled(flagName: string, userId?: string): boolean {
  const flag = FEATURE_FLAGS[flagName];
  
  if (!flag) {
    console.warn(`Feature flag '${flagName}' not found`);
    return false;
  }
  
  if (!flag.enabled) {
    return false;
  }
  
  // Check rollout percentage
  if (flag.rolloutPercentage && userId) {
    const hash = simpleHash(userId + flagName);
    return (hash % 100) < flag.rolloutPercentage;
  }
  
  // Check target users
  if (flag.targetUsers && userId) {
    return flag.targetUsers.includes(userId);
  }
  
  return flag.enabled;
}

function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

export function getEnabledFeatures(): string[] {
  return Object.keys(FEATURE_FLAGS).filter(flagName => 
    isFeatureEnabled(flagName)
  );
}

export function updateFeatureFlag(flagName: string, updates: Partial<FeatureFlag>): void {
  if (FEATURE_FLAGS[flagName]) {
    Object.assign(FEATURE_FLAGS[flagName], updates);
  }
}
