import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings, Lock, X, Info } from 'lucide-react';
import { type APIConfig } from '@/lib/browserApiService';
import { LLMService } from '@/lib/llmService';

interface AIConfigPanelProps {
  config: APIConfig;
  setConfig: (config: APIConfig) => void;
  className?: string;
  title?: string;
  description?: string;
  onClose?: () => void;
}

export const AIConfigPanel: React.FC<AIConfigPanelProps> = ({ 
  config, 
  setConfig, 
  className = "",
  title = "API Settings",
  description = "Configure the AI model and settings",
  onClose
}) => {
  const [localConfig, setLocalConfig] = useState<APIConfig>({ ...config });

  // Sync prop config to local state on open/mount, AND Load Global Keys if missing
  useEffect(() => {
    const globalConfig = LLMService.getConfig();
    
    setLocalConfig(() => ({
        ...config,
        // If prop doesn't have a key, try global
        apiKey: config.apiKey || globalConfig.apiKey || '',
        // Merge global keys with any local keys
         
        keys: {
            ...globalConfig.keys,
            ...config.keys
        } as any
    }));
  }, [config]);

  const handleSave = () => {
    setConfig(localConfig);
    
    // Persist to Global Storage for convenience
    const globalConfig = LLMService.getConfig();
    LLMService.saveConfig({
        ...globalConfig,
        apiKey: localConfig.apiKey || globalConfig.apiKey, // Update global defaults
        model: localConfig.model,
        keys: localConfig.keys // Save the advanced keys
    });

    if (onClose) onClose();
  };

  const handleProviderSelect = (provider: string) => {
    // Default models for quick selection
    const defaults: Record<string, string> = {
      'openai': 'gpt-5.1',
      'anthropic': 'claude-4.5-sonnet-20251101',
      'gemini': 'gemini-2.5-pro',
      'deepseek': 'deepseek-chat-v3',
      'ollama': 'llama4',
      'custom': ''
    };

    setLocalConfig(prev => ({
      ...prev,
      model: defaults[provider.toLowerCase()] || prev.model,
      // Only switch to custom if we are explicitly selecting 'custom' provider
      useCustomApi: provider === 'custom' ? true : prev.useCustomApi
    }));
  };

  // Determine active provider from model name if possible, or naive check
  // This is purely for UI highlighting
  const getActiveProvider = () => {
    const m = (localConfig.model || '').toLowerCase();
    if (m.includes('gpt')) return 'openai';
    if (m.includes('claude')) return 'anthropic';
    if (m.includes('gemini')) return 'gemini';
    if (m.includes('deepseek')) return 'deepseek';
    if (m.includes('llama') || m.includes('mistral')) return 'ollama';
    return 'custom';
  };
  
  const activeProvider = getActiveProvider();
  
  const providers = [
      { id: 'openai', label: 'OpenAI' },
      { id: 'anthropic', label: 'Anthropic' },
      { id: 'gemini', label: 'Gemini' },
      { id: 'deepseek', label: 'Deepseek' },
      { id: 'ollama', label: 'Ollama' },
      { id: 'custom', label: 'Custom' }
  ];

  const content = (
    <div className={`space-y-6 text-gray-800 dark:text-gray-100`}>
        
        {/* Info Box */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg p-3 flex gap-3">
             <Info className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
             <p className="text-xs text-blue-800 dark:text-blue-200/80 leading-relaxed">
                Keys are stored in your browser's LocalStorage and are never sent to our servers.
             </p>
        </div>

        {/* Provider Grid */}
        <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Provider</label>
            <div className="grid grid-cols-3 gap-2">
                {providers.map(p => (
                    <button
                        key={p.id}
                        onClick={() => handleProviderSelect(p.id)}
                        className={`px-3 py-2 rounded-lg text-sm font-medium border transition-all ${
                            activeProvider === p.id 
                            ? 'bg-blue-50 dark:bg-blue-600/10 border-blue-500 text-blue-600 dark:text-blue-400 ring-1 ring-blue-500'
                            : 'bg-white dark:bg-[#1a1d24] border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600 hover:text-gray-800 dark:hover:text-gray-200'
                        }`}
                    >
                        {p.label}
                    </button>
                ))}
            </div>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                   <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Primary API Key</label>
                   <span className="text-xs text-blue-500 cursor-pointer hover:underline" onClick={() => setLocalConfig({...localConfig, showAdvanced: !localConfig.showAdvanced})}>
                     {localConfig.showAdvanced ? 'Hide Provider Keys' : 'Manage Provider Keys'}
                   </span>
                </div>
                <div className="relative">
                    <input
                        type="password"
                        value={localConfig.apiKey || ''}
                        onChange={(e) => setLocalConfig({...localConfig, apiKey: e.target.value})}
                        className="w-full bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500/50 transition-colors"
                        placeholder="sk-..."
                    />
                    <Lock className="absolute right-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
                <p className="text-xs text-gray-500">Used as default fallback for all providers.</p>
            </div>

            {/* Advanced Keys */}
            {localConfig.showAdvanced && (
                <div className="p-4 bg-gray-50 dark:bg-gray-800/30 rounded-lg space-y-3 border border-gray-100 dark:border-gray-800">
                    <h4 className="text-xs font-semibold text-gray-700 dark:text-gray-300">Provider-Specific Keys</h4>
                    
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">OpenAI Key</label>
                        <input
                            type="password"
                            value={localConfig.keys?.openai || ''}
                            onChange={(e) => setLocalConfig({
                                ...localConfig, 
                                keys: { ...localConfig.keys, openai: e.target.value }
                            })}
                            className="w-full bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-800 rounded px-3 py-1.5 text-xs"
                            placeholder="Starts with sk-"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Anthropic Key</label>
                        <input
                            type="password"
                            value={localConfig.keys?.anthropic || ''}
                            onChange={(e) => setLocalConfig({
                                ...localConfig, 
                                keys: { ...localConfig.keys, anthropic: e.target.value }
                            })}
                            className="w-full bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-800 rounded px-3 py-1.5 text-xs"
                            placeholder="Starts with sk-ant-"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Gemini Key</label>
                        <input
                            type="password"
                            value={localConfig.keys?.gemini || ''}
                            onChange={(e) => setLocalConfig({
                                ...localConfig, 
                                keys: { ...localConfig.keys, gemini: e.target.value }
                            })}
                            className="w-full bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-800 rounded px-3 py-1.5 text-xs"
                            placeholder="Starts with AIza..."
                        />
                    </div>
                </div>
            )}

            <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Model Name</label>
                <input
                    type="text"
                    value={localConfig.model || ''}
                    onChange={(e) => setLocalConfig({...localConfig, model: e.target.value})}
                    className="w-full bg-white dark:bg-[#1a1d24] border border-gray-200 dark:border-gray-800 rounded-lg px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 focus:outline-none focus:border-blue-500/50 transition-colors"
                    placeholder="e.g. gpt-4o"
                />
            </div>
        </div>

        {/* Footer Actions (if modal) */}
        {onClose && (
            <div className="flex items-center justify-end gap-3 pt-2">
                <button 
                    onClick={onClose}
                    className="text-sm font-medium text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-lg shadow-blue-900/20"
                >
                    Save & Close
                </button>
            </div>
        )}
    </div>
  );

  // If using in modal mode (onClose present)
  if (onClose) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className={`bg-white dark:bg-[#0f1117] border border-gray-200 dark:border-gray-800 rounded-xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 ${className}`}>
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800/50">
                    <div className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{title}</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors">
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="p-6">
                    {content}
                </div>
            </div>
        </div>
    );
  }

  // Fallback / Inline Mode (renders as Card)
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
        </div>
      </CardHeader>
      <CardContent>
          {content}
          
          {/* Inline Save Button if not modal */}
          <div className="flex justify-end mt-4">
               <button
                    onClick={handleSave}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                    Save Changes
                </button>
          </div>
      </CardContent>
    </Card>
  );
};
