import { FabricPattern } from './fabricPatterns';

const STORAGE_KEY = 'FABRIC_CUSTOM_PATTERNS';

export const CustomPatternService = {
  getPatterns(): FabricPattern[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (e) {
      console.error('Failed to load custom patterns', e);
      return [];
    }
  },

  savePattern(pattern: FabricPattern): void {
    const patterns = this.getPatterns();
    const existingIndex = patterns.findIndex(p => p.id === pattern.id);
    
    if (existingIndex >= 0) {
      patterns[existingIndex] = pattern;
    } else {
      patterns.push(pattern);
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns));
  },

  deletePattern(id: string): void {
    const patterns = this.getPatterns().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns));
  }
};
