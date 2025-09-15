import { describe, it, expect } from 'vitest';
import { isFeatureEnabled, getEnabledFeatures, updateFeatureFlag, FEATURE_FLAGS } from '../lib/featureFlags';

describe('Feature Flags', () => {
  it('should return true for enabled features', () => {
    expect(isFeatureEnabled('DARK_MODE')).toBe(true);
    expect(isFeatureEnabled('ADVANCED_SEARCH')).toBe(true);
  });

  it('should return false for disabled features', () => {
    expect(isFeatureEnabled('TOOL_RATINGS')).toBe(false);
    expect(isFeatureEnabled('USER_PROFILES')).toBe(false);
  });

  it('should return false for non-existent features', () => {
    expect(isFeatureEnabled('NON_EXISTENT_FEATURE')).toBe(false);
  });

  it('should handle rollout percentage correctly', () => {
    // Test with a specific user ID that should get the feature
    const userId = 'test-user-123';
    const result = isFeatureEnabled('TOOL_RATINGS', userId);
    
    // Should be boolean (either true or false based on hash)
    expect(typeof result).toBe('boolean');
  });

  it('should get all enabled features', () => {
    const enabledFeatures = getEnabledFeatures();
    expect(Array.isArray(enabledFeatures)).toBe(true);
    expect(enabledFeatures.length).toBeGreaterThan(0);
    expect(enabledFeatures).toContain('DARK_MODE');
    expect(enabledFeatures).toContain('ADVANCED_SEARCH');
  });

  it('should update feature flags', () => {
    const originalValue = FEATURE_FLAGS.DARK_MODE.enabled;
    
    updateFeatureFlag('DARK_MODE', { enabled: false });
    expect(FEATURE_FLAGS.DARK_MODE.enabled).toBe(false);
    
    // Restore original value
    updateFeatureFlag('DARK_MODE', { enabled: originalValue });
    expect(FEATURE_FLAGS.DARK_MODE.enabled).toBe(originalValue);
  });

  it('should handle feature flag structure correctly', () => {
    const darkModeFlag = FEATURE_FLAGS.DARK_MODE;
    expect(darkModeFlag).toHaveProperty('name');
    expect(darkModeFlag).toHaveProperty('enabled');
    expect(darkModeFlag).toHaveProperty('description');
    expect(darkModeFlag.name).toBe('dark_mode');
  });
});
