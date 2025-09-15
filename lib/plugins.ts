/**
 * Plugin architecture for easy feature extensions
 */

export interface Plugin {
  name: string;
  version: string;
  description: string;
  initialize: () => void;
  destroy?: () => void;
  dependencies?: string[];
}

export interface ToolPlugin extends Plugin {
  type: 'tool';
  processTool: (tool: any) => any;
  validateTool: (tool: any) => boolean;
}

export interface UIPlugin extends Plugin {
  type: 'ui';
  render: (container: HTMLElement) => void;
  onToolClick?: (tool: any) => void;
  onSearch?: (query: string) => void;
}

export interface AnalyticsPlugin extends Plugin {
  type: 'analytics';
  track: (event: string, data: any) => void;
  identify?: (userId: string, traits: any) => void;
}

export type AnyPlugin = ToolPlugin | UIPlugin | AnalyticsPlugin;

class PluginManager {
  private plugins: Map<string, AnyPlugin> = new Map();
  private initialized = false;

  register(plugin: AnyPlugin): void {
    if (this.plugins.has(plugin.name)) {
      console.warn(`Plugin '${plugin.name}' is already registered`);
      return;
    }

    // Check dependencies
    if (plugin.dependencies) {
      const missingDeps = plugin.dependencies.filter(dep => !this.plugins.has(dep));
      if (missingDeps.length > 0) {
        throw new Error(`Plugin '${plugin.name}' missing dependencies: ${missingDeps.join(', ')}`);
      }
    }

    this.plugins.set(plugin.name, plugin);
    console.log(`Plugin '${plugin.name}' registered`);
  }

  unregister(pluginName: string): void {
    const plugin = this.plugins.get(pluginName);
    if (plugin) {
      if (plugin.destroy) {
        plugin.destroy();
      }
      this.plugins.delete(pluginName);
      console.log(`Plugin '${pluginName}' unregistered`);
    }
  }

  initialize(): void {
    if (this.initialized) {
      return;
    }

    // Initialize plugins in dependency order
    const sortedPlugins = this.getSortedPlugins();
    
    for (const plugin of sortedPlugins) {
      try {
        plugin.initialize();
        console.log(`Plugin '${plugin.name}' initialized`);
      } catch (error) {
        console.error(`Failed to initialize plugin '${plugin.name}':`, error);
      }
    }

    this.initialized = true;
  }

  getPlugin<T extends AnyPlugin>(name: string): T | undefined {
    return this.plugins.get(name) as T;
  }

  getPluginsByType<T extends AnyPlugin>(type: string): T[] {
    return Array.from(this.plugins.values())
      .filter(plugin => plugin.type === type) as T[];
  }

  private getSortedPlugins(): AnyPlugin[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const result: AnyPlugin[] = [];

    const visit = (pluginName: string) => {
      if (visiting.has(pluginName)) {
        throw new Error(`Circular dependency detected involving '${pluginName}'`);
      }
      if (visited.has(pluginName)) {
        return;
      }

      visiting.add(pluginName);
      const plugin = this.plugins.get(pluginName);
      
      if (plugin?.dependencies) {
        for (const dep of plugin.dependencies) {
          visit(dep);
        }
      }

      visiting.delete(pluginName);
      visited.add(pluginName);
      
      if (plugin) {
        result.push(plugin);
      }
    };

    for (const pluginName of this.plugins.keys()) {
      visit(pluginName);
    }

    return result;
  }
}

// Global plugin manager instance
export const pluginManager = new PluginManager();

// Built-in plugins
export const builtInPlugins = {
  // Tool validation plugin
  toolValidator: {
    name: 'tool-validator',
    version: '1.0.0',
    description: 'Validates tool data structure',
    type: 'tool' as const,
    initialize: () => console.log('Tool validator initialized'),
    processTool: (tool: any) => {
      // Add validation logic here
      return tool;
    },
    validateTool: (tool: any) => {
      return tool && tool.name && tool.url && tool.description;
    }
  } as ToolPlugin,

  // Click tracking plugin
  clickTracker: {
    name: 'click-tracker',
    version: '1.0.0',
    description: 'Tracks user clicks for analytics',
    type: 'analytics' as const,
    initialize: () => console.log('Click tracker initialized'),
    track: (event: string, data: any) => {
      console.log(`Analytics event: ${event}`, data);
      // Send to analytics service
    }
  } as AnalyticsPlugin
};
