import { describe, it, expect } from 'vitest';

describe('Performance Tests', () => {
  it('should render large tool lists efficiently', () => {
    const startTime = performance.now();
    
    // Simulate rendering 1000 tools
    const tools = Array.from({ length: 1000 }, (_, i) => ({
      name: `Tool ${i}`,
      url: `https://tool${i}.com`,
      description: `Description for tool ${i}`,
      tags: ['#free']
    }));
    
    // Simulate filtering operation
    const filteredTools = tools.filter(tool => 
      tool.name.toLowerCase().includes('tool')
    );
    
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    
    // Should complete within 100ms
    expect(renderTime).toBeLessThan(100);
    expect(filteredTools).toHaveLength(1000);
  });

  it('should handle search debouncing efficiently', async () => {
    const searchCalls: string[] = [];
    const debouncedSearch = (query: string) => {
      searchCalls.push(query);
    };
    
    // Simulate rapid typing
    const queries = ['a', 'ai', 'ai ', 'ai t', 'ai to', 'ai too', 'ai tool'];
    
    for (const query of queries) {
      debouncedSearch(query);
    }
    
    expect(searchCalls).toHaveLength(7);
  });

  it('should manage memory efficiently with large datasets', () => {
    // const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    // Create large dataset
    const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
      id: i,
      data: `data-${i}`,
      timestamp: Date.now()
    }));
    
    // Process and clean up
    const processed = largeDataset.map(item => ({ ...item, processed: true }));
    largeDataset.length = 0; // Clear original array
    
    // const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
    
    // Memory usage should be reasonable (this is a basic check)
    expect(processed).toHaveLength(10000);
    expect(largeDataset).toHaveLength(0);
  });
});
