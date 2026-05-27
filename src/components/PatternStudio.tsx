/**
 * @license
 * MIT
 * Collective AI Tools (https://collectiveai.tools)
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { Copy, Check, BookOpen, Search, RefreshCw, Layers, BrainCircuit, Upload, FileText, Plus, Save, Trash2, X, Play, Settings, Globe, ArrowRightCircle, Menu, SquareTerminal } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { FabricService, FabricItem, STATIC_PATTERNS, FabricPattern } from '../lib/fabricPatterns';
import { CustomPatternService } from '../lib/customPatternService';
import { AnthropicService } from '../lib/anthropicPrompts';
import { LLMService, LLMProvider, PROVIDER_DEFAULTS } from '../lib/llmService';

const PatternStudio: React.FC = () => {
  const [patterns, setPatterns] = useState<FabricItem[]>([]);
  const [strategies, setStrategies] = useState<FabricItem[]>([]);
  const [customPatterns, setCustomPatterns] = useState<FabricPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter State
  const [filterSource, setFilterSource] = useState<'all' | 'fabric' | 'anthropic'>('all');
  
  const [activeItem, setActiveItem] = useState<FabricItem | null>(null);
  const [systemPrompt, setSystemPrompt] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);
  const [isError, setIsError] = useState(false);
  
  const [userInput, setUserInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Modal State
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [newPatternName, setNewPatternName] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  
  // Alert & Confirm State
  const [alertConfig, setAlertConfig] = useState<{ open: boolean, title: string, message: string, type: 'success' | 'error' | 'info' }>({ open: false, title: '', message: '', type: 'info' });
  const [confirmConfig, setConfirmConfig] = useState<{ open: boolean, title: string, message: string, onConfirm: () => void }>({ open: false, title: '', message: '', onConfirm: () => {} });
  
  // Execution State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [llmProvider, setLlmProvider] = useState<LLMProvider>('openai');
  const [baseUrl, setBaseUrl] = useState('');
  const [modelName, setModelName] = useState('');
  
  const [output, setOutput] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  
  // Mobile State
  const [mobileTab, setMobileTab] = useState<'sidebar' | 'input' | 'output'>('sidebar');

  const location = useLocation();

  // Initial Load & URL State Check
  useEffect(() => {
    loadLibrary();
    const config = LLMService.getConfig();
    setApiKey(config.apiKey);
    setLlmProvider(config.provider);
    setBaseUrl(config.baseUrl || '');
    setModelName(config.model || PROVIDER_DEFAULTS[config.provider].model || '');
    
    // Check for passed pattern from Community Prompts
    if (location.state && location.state.importPattern) {
        const p = location.state.importPattern;
        // Treat as a custom pattern for editing
        setActiveItem({
            name: p.title,
            path: 'imported', // dummy
            type: 'custom',
            url: ''
        } as FabricItem);
        setSystemPrompt(p.content);
        // If coming from prompts page, we might want to switch to mobile input view instantly
        setMobileTab('input');
    }
  }, []);

  const loadLibrary = async () => {
    setIsLoading(true);
    setIsError(false);
    
    // Load Everything
    try {
        const [pats, strats, anthropicPrompts] = await Promise.all([
          FabricService.getPatterns(),
          FabricService.getStrategies(),
          AnthropicService.getPrompts()
        ]);

        // Process Fabric
        if (pats.length === 0 && strats.length === 0) {
          setIsError(true);
          // Fallback
          setPatterns([
              ...STATIC_PATTERNS.map(p => ({ name: p.id, path: `data/patterns/${p.id}`, type: 'dir', url: '' } as FabricItem)),
              ...anthropicPrompts
          ]);
        } else {
          setPatterns([...pats, ...anthropicPrompts]);
          setStrategies(strats);
        }
    } catch (e) {
        console.error("Load failed", e);
        setIsError(true);
    }
    
    // Load Custom Patterns
    setCustomPatterns(CustomPatternService.getPatterns());
    
    setIsLoading(false);
  };
  
  // No filtered reload needed anymore
  /*
  useEffect(() => {
     loadLibrary();
  }, [librarySource]);
  */
  
  const saveSettings = () => {
    LLMService.saveConfig({
        provider: llmProvider,
        apiKey,
        baseUrl,
        model: modelName
    });
    setIsSettingsOpen(false);
  };
  
  const changeProvider = (p: LLMProvider) => {
      setLlmProvider(p);
      const defs = PROVIDER_DEFAULTS[p];
      if (defs.baseUrl !== undefined) setBaseUrl(defs.baseUrl);
      if (defs.model !== undefined) setModelName(defs.model);
  };

  const runPattern = async () => {
    if (!systemPrompt || !userInput || !apiKey) {
        if (!apiKey) setIsSettingsOpen(true);
        return;
    }
    
    setIsRunning(true);
    setShowOutput(true);
    setMobileTab('output'); // Switch to output on mobile
    setOutput('');
    
    try {
        await LLMService.streamCompletion(systemPrompt, userInput, (chunk) => {
            setOutput(prev => prev + chunk);
        });
    } catch (e: any) {
        setOutput(`Error: ${e.message}`);
    } finally {
        setIsRunning(false);
    }
  };
  
  const pipeOutput = () => {
      if (!output) return;
      setUserInput(output);
      setSystemPrompt(''); // Clear system prompt to signal we need a new pattern
      setActiveItem(null);
      setShowOutput(false);
      setMobileTab('input');
      // maybe scroll to top?
  };
  
  // Load Content on Selection
  const selectItem = async (item: FabricItem) => {
    setActiveItem(item);
    setLoadingContent(true);
    setSystemPrompt(''); // Clear prev
    if (window.innerWidth < 768) setMobileTab('input'); // Auto-switch on mobile
    
    let content = '';
    
    if (item.type === 'custom') {
        if (item.path.startsWith('anthropic_')) {
               content = AnthropicService.getPromptContent(item.path);
           } else {
               const p = customPatterns.find(p => p.id === item.name);
               if (p) {
                   content = p.systemPrompt;
               }
           }
    } else if (item.type === 'dir') { // Pattern
       content = await FabricService.getPatternContent(item.name);
    } else { // Strategy
       content = await FabricService.getStrategyContent(item.name);
    }
    
    // Fallback for static (if we are in error mode and using static fallback)
    if (!content && isError) {
        const staticPat = STATIC_PATTERNS.find(p => p.id === item.name);
        if (staticPat) content = staticPat.systemPrompt;
    }

    setSystemPrompt(content || '// Failed to load content.');
    setLoadingContent(false);
  };

  // Drag and Drop Handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    // Read files
    let combinedContent = userInput ? `${userInput  }\n\n` : '';
    
    for (const file of files) {
      if (file.type.startsWith('text/') || file.name.match(/\.(md|js|ts|tsx|jsx|json|py|html|css|txt)$/)) {
        try {
          const text = await file.text();
          combinedContent += `--- FILE: ${file.name} ---\n${text}\n\n`;
        } catch (err) {
          console.error('Failed to read file:', file.name, err);
        }
      } else {
        alert(`Skipped ${file.name}: Binary files not supported yet.`);
      }
    }

    setUserInput(combinedContent);
  }, [userInput]);
  

  
  const initSave = () => {
     if (!systemPrompt) return;
     setNewPatternName(activeItem?.type === 'custom' ? activeItem.name : "My New Pattern");
     setIsSaveModalOpen(true);
  };

  const confirmSavePattern = async () => {
    if (!newPatternName) return;
    
    // Save to DB
    try {
        const res = await fetch('/api/prompts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: newPatternName,
                content: systemPrompt,
                description: 'Created in Pattern Studio',
                tags: [] as string[],
                isPublic
            })
        });

        if (res.ok) {
            // Also save locally for immediate use/offline
            // In a real app we might refetch "My Patterns" from DB
            const id = newPatternName.toLowerCase().replace(/\s+/g, '_');
            const newPattern: FabricPattern = {
               id,
               title: newPatternName,
               description: isPublic ? 'Public user pattern' : 'Private user pattern',
               systemPrompt,
               userPromptTemplate: '',
               type: 'custom' 
            };
            
            CustomPatternService.savePattern(newPattern);
            setCustomPatterns(CustomPatternService.getPatterns());
            selectItem({ name: id, path: `custom/${  id}`, type: 'custom', url: '' } as any);
            setIsSaveModalOpen(false);
            setNewPatternName('');
            setIsPublic(false);
            setAlertConfig({ 
                open: true, 
                title: 'Success', 
                message: isPublic 
                    ? 'Pattern submitted! It will appear in the community feed after approval.' 
                    : 'Pattern saved to your personal library!', 
                type: 'success' 
            });
        } else {
            setAlertConfig({ open: true, title: 'Sync Warning', message: 'Failed to save to server, saved locally only.', type: 'error' });
            // Fallback logic could go here
        }
    } catch (e) {
        console.error("Save failed", e);
        // Fallback to local
        const id = newPatternName.toLowerCase().replace(/\s+/g, '_');
        const newPattern: FabricPattern = { id, title: newPatternName, description: 'Local (Offline)', systemPrompt, userPromptTemplate: '', type: 'custom' };
        CustomPatternService.savePattern(newPattern);
        setCustomPatterns(CustomPatternService.getPatterns());
        setIsSaveModalOpen(false);
        setAlertConfig({ open: true, title: 'Offline Mode', message: 'Network error. Pattern saved locally.', type: 'error' });
    }
  };
  
  const deleteCustomPattern = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConfirmConfig({
        open: true,
        title: 'Delete Pattern',
        message: 'Are you sure you want to delete this pattern? This cannot be undone.',
        onConfirm: () => {
            CustomPatternService.deletePattern(id);
            setCustomPatterns(CustomPatternService.getPatterns());
            if (activeItem?.name === id) {
                setActiveItem(null);
                setSystemPrompt('');
            }
            setConfirmConfig(prev => ({ ...prev, open: false }));
        }
    });
  };

  const createNew = () => {
      setActiveItem({ name: 'Untitled Pattern', path: 'new', type: 'custom', url: '' } as any);
      setSystemPrompt('');
      setUserInput('');
      setShowOutput(false);
  };

  // Auto-select first item if available
  useEffect(() => {
    if (!activeItem && patterns.length > 0) {
      // Don't auto select if we have custom ones? maybe just let user choose.
      // selectItem(patterns[0]); 
    }
  }, [patterns]);

  const finalPrompt = `${systemPrompt}\n\n${userInput}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(finalPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredPatterns = patterns.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;
      
      const isAnthropic = p.path.startsWith('anthropic_');
      if (filterSource === 'fabric') return !isAnthropic;
      if (filterSource === 'anthropic') return isAnthropic;
      return true;
  });
  
  const filteredStrategies = strategies.filter(s => {
      const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchSearch) return false;
      return filterSource !== 'anthropic'; // Strategies are fabric only for now
  });

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col md:flex-row">
      
      {/* MOBILE NAV (Top) */}
      <div className="md:hidden flex items-center justify-between p-2 border-b border-border bg-card">
         <div className="font-bold tracking-tight px-2 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-500" /> Prompt Studio
         </div>
         <div className="flex bg-secondary rounded p-1">
            <button onClick={() => setMobileTab('sidebar')} className={`p-1.5 rounded ${mobileTab === 'sidebar' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`} title="Patterns">
                <Menu className="w-4 h-4" />
            </button>
            <button onClick={() => setMobileTab('input')} className={`p-1.5 rounded ${mobileTab === 'input' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`} title="Input">
                <FileText className="w-4 h-4" />
            </button>
            <button onClick={() => setMobileTab('output')} className={`p-1.5 rounded ${mobileTab === 'output' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground'}`} title="Output/Run">
                <SquareTerminal className="w-4 h-4" />
            </button>
         </div>
      </div>

      {/* LEFT SIDEBAR */}
      <div className={`
          w-full md:w-80 border-r border-border bg-card flex-col h-[calc(100vh-50px)] md:h-screen sticky top-0
          ${mobileTab === 'sidebar' ? 'flex' : 'hidden md:flex'}
      `}>
        <div className="p-6 border-b border-border">
          <h1 className="text-xl font-bold text-foreground tracking-tight flex items-center justify-between">
             <span className="hidden md:block">Prompt Studio</span>
             <span className="md:hidden">Studio</span>
             <div className="flex gap-1">
                 <Button onClick={() => setIsSettingsOpen(true)} size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-foreground" title="Settings">
                    <Settings className="w-3.5 h-3.5" />
                 </Button>
                 <Button onClick={createNew} size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-foreground" title="New Pattern">
                    <Plus className="w-4 h-4" />
                 </Button>
             </div>
          </h1>
          
          
          <div className="flex bg-secondary p-1 rounded-lg mt-4 gap-1">
              {(['all', 'fabric', 'anthropic'] as const).map(f => (
                  <button 
                    key={f}
                    onClick={() => setFilterSource(f)}
                    className={`flex-1 text-[10px] uppercase tracking-wider font-bold py-1.5 rounded-md transition-colors ${filterSource === f ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                  >
                    {f}
                  </button>
              ))}
          </div>
          
          <div className="relative mt-4">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input 
              className="w-full bg-muted/30 border border-border rounded-md py-2 pl-9 pr-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary transition-all"
              placeholder="Search patterns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-border">
          {isLoading ? (
             <div className="p-8 text-center text-muted-foreground text-xs flex flex-col items-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Loading library...
             </div>
          ) : (
            <>
               {/* CUSTOM PATTERNS */}
               {customPatterns.length > 0 && (
                   <div className="mb-4">
                      <div className="px-3 py-2 text-[10px] font-bold text-yellow-500 uppercase tracking-widest flex items-center gap-2">
                        <Layers className="w-3 h-3" /> My Patterns ({customPatterns.length})
                      </div>
                      {customPatterns.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase())).map((item) => (
                        <button
                          key={item.id}
                          onClick={() => selectItem({ name: item.id, path: `custom/${item.id}`, type: 'custom', url: '' } as any)}
                          className={`
                            w-full text-left px-3 py-2 rounded-md mb-0.5 transition-all duration-150 flex items-center justify-between group
                            ${activeItem?.name === item.id 
                              ? 'bg-yellow-500/10 text-yellow-600 dark:text-yellow-200' 
                              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}
                          `}
                        >
                          <span className="font-mono text-xs truncate w-full">{item.title}</span>
                          <div className="flex items-center gap-2">
                            {activeItem?.name === item.id && <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />}
                            <Trash2 
                                onClick={(e) => deleteCustomPattern(e, item.id)}
                                className="w-3 h-3 text-gray-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" 
                            />
                          </div>
                        </button>
                      ))}
                   </div>
               )}

               {/* PATTERNS SECTION */}
               {filteredPatterns.length > 0 && (
                   <div className="mb-4">
                      <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                        <Layers className="w-3 h-3" /> Patterns ({filteredPatterns.length})
                      </div>
                      {filteredPatterns.map((item) => (
                        <button
                          key={item.path}
                          onClick={() => selectItem(item)}
                          className={`
                            w-full text-left px-3 py-2 rounded-md mb-0.5 transition-all duration-150 flex items-center justify-between group
                            ${activeItem?.path === item.path 
                              ? 'bg-primary/10 text-primary' 
                              : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}
                          `}
                        >
                          <span className="font-mono text-xs truncate w-full flex items-center gap-2">
                             {item.path.startsWith('anthropic_') && <span className="text-[9px] px-1 rounded bg-orange-900/40 text-orange-400 border border-orange-900/50">CLA.</span>}
                             {!item.path.startsWith('anthropic_') && <span className="text-[9px] px-1 rounded bg-blue-900/40 text-blue-400 border border-blue-900/50">FAB.</span>}
                             {item.name}
                          </span>
                          {activeItem?.path === item.path && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                        </button>
                      ))}
                   </div>
               )}

               {/* STRATEGIES SECTION */}
               {filteredStrategies.length > 0 && (
                   <div className="mb-4">
                      <div className="px-3 py-2 text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                         <BrainCircuit className="w-3 h-3" /> Strategies ({filteredStrategies.length})
                      </div>
                      {filteredStrategies.map((item) => (
                        <button
                          key={item.path}
                          onClick={() => selectItem(item)}
                          className={`
                             w-full text-left px-3 py-2 rounded-md mb-0.5 transition-all duration-150 flex items-center justify-between group
                             ${activeItem?.path === item.path 
                               ? 'bg-purple-500/10 text-purple-600 dark:text-purple-200' 
                               : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'}
                          `}
                        >
                          <span className="font-mono text-xs truncate w-full">{item.name.replace('.json','')}</span>
                          {activeItem?.path === item.path && <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />}
                        </button>
                      ))}
                   </div>
               )}
               
               {filteredPatterns.length === 0 && filteredStrategies.length === 0 && (
                  <div className="p-4 text-center text-xs text-gray-600">
                     No matches found.
                  </div>
               )}
            </>
          )}
        </div>
        
        {isError && (
          <div className="px-4 py-2 bg-destructive/10 border-t border-destructive/20 text-[10px] text-destructive text-center">
             GitHub Rate Limit Reached.<br/>Using offline backup.
          </div>
        )}

        <div className="p-3 border-t border-border text-[10px] text-muted-foreground font-mono text-center">
           POWERED BY GITHUB/DANIELMIESSLER
        </div>
      </div>

      {/* MAIN WORKBENCH */}
      <div className={`flex-1 flex flex-col h-[calc(100vh-50px)] md:h-screen overflow-hidden ${mobileTab === 'sidebar' ? 'hidden md:flex' : 'flex'}`}>
        
        {/* Header (Mobile) - Current Pattern */}
        <div className="md:hidden p-3 border-b border-border bg-card text-[10px] text-center text-muted-foreground">
           {activeItem ? activeItem.name : 'No pattern selected'}
        </div>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
             
             {/* INPUT COLUMN */}
             <div 
                className={`
                    flex-1 flex-col border-r border-border bg-background relative group transition-colors 
                    ${isDragging ? 'bg-primary/5' : ''}
                    ${mobileTab === 'input' ? 'flex' : 'hidden md:flex'}
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
             >
                <div className="p-3 border-b border-border flex items-center justify-between bg-muted/30">
                   <span className="text-xs font-mono font-medium text-muted-foreground flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-yellow-500"></div> INPUT_DATA
                   </span>
                   
                   {isDragging && (
                     <span className="text-xs text-blue-400 animate-pulse font-mono flex items-center gap-2">
                       <Upload className="w-3 h-3" /> DROP FILES HERE
                     </span>
                   )}
                </div>
                
                <div className="flex-1 relative">
                    <textarea 
                       className={`absolute inset-0 w-full h-full bg-transparent p-6 resize-none focus:outline-none font-mono text-sm text-foreground placeholder:text-muted-foreground/30 z-10 ${isDragging ? 'pointer-events-none' : ''}`}
                       placeholder="Paste your content here (article, code, email)... or dragging files directly."
                       value={userInput}
                       onChange={(e) => setUserInput(e.target.value)}
                       spellCheck={false}
                    />
                    
                    {/* Drag Overlay Helper */}
                    {!userInput && !isDragging && (
                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="text-gray-800 flex flex-col items-center gap-2">
                             <FileText className="w-12 h-12" />
                             <span className="text-xs font-mono">DROP FILES HERE</span>
                          </div>
                       </div>
                    )}
                    
                    {isDragging && (
                       <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-blue-500/5 z-0 border-2 border-blue-500/50 border-dashed m-4 rounded-lg">
                          <div className="text-blue-400 flex flex-col items-center gap-4">
                             <Upload className="w-12 h-12 animate-bounce" />
                             <span className="text-sm font-bold tracking-widest">RELEASE TO UPLOAD</span>
                          </div>
                       </div>
                    )}
                </div>
             </div>

             {/* OUTPUT COLUMN */}
              <div className={`flex-1 flex-col bg-background relative ${mobileTab === 'output' ? 'flex' : 'hidden md:flex'}`}>
                <div className="p-3 border-b border-border flex items-center justify-between bg-muted/30">
                   <span className="text-xs font-mono font-medium text-muted-foreground flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div> 
                      {loadingContent ? 'FETCHING...' : (activeItem ? `PROMPT: ${activeItem.name.toUpperCase()}` : 'SELECT_PATTERN')}
                      
                      {showOutput && (
                          <div className="ml-4 flex gap-2">
                             <button onClick={() => setShowOutput(false)} className="px-2 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground text-[10px]">Back</button>
                             <span className="text-green-500">OUTPUT</span>
                          </div>
                      )}
                   </span>
                   <div className="flex gap-2">
                       {showOutput && output && (
                           <Button 
                              onClick={pipeOutput}
                              size="sm"
                              className="h-7 text-xs gap-1 bg-secondary hover:bg-secondary/80 text-foreground border-none transition-all"
                              title="Use Output as Next Input"
                           >
                              <ArrowRightCircle className="w-3 h-3" /> <span className="hidden sm:inline">Pipe to Input</span>
                           </Button>
                       )}
                       <Button 
                          onClick={runPattern}
                          size="sm"
                          className={`h-7 text-xs gap-2 bg-green-600 hover:bg-green-500 text-white border-none shadow-sm transition-all`}
                          disabled={loadingContent || !systemPrompt || !userInput || isRunning}
                       >
                          {isRunning ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Play className="w-3 h-3 fill-current" />}
                          {isRunning ? 'RUNNING...' : 'RUN'}
                       </Button>
                       <Button 
                          onClick={copyToClipboard}
                          size="sm"
                          className={`h-7 text-xs gap-2 bg-primary hover:bg-primary/90 text-primary-foreground border-none shadow-sm transition-all`}
                          disabled={loadingContent || !systemPrompt}
                       >
                          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          {copied ? 'COPIED' : 'COPY'}
                       </Button>
                   </div>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 font-mono text-xs leading-relaxed text-muted-foreground">
                   {loadingContent ? (
                      <div className="h-full flex items-center justify-center text-gray-600 gap-2">
                          <RefreshCw className="w-4 h-4 animate-spin" /> Fetching raw content...
                      </div>
                   ) : showOutput ? (
                        <div className="h-full flex flex-col">
                            <div className="whitespace-pre-wrap text-emerald-600 dark:text-emerald-300 selection:bg-emerald-100 dark:selection:bg-emerald-900 leading-6">
                                {output || <span className="text-muted-foreground/30 animate-pulse">Waiting for stream...</span>}
                            </div>
                        </div>
                   ) : (
                       <>
                           {/* System Prompt Section */}
                                                      <div className="selection:bg-primary/20 selection:text-primary relative group/prompt">
                              <div className="flex items-center justify-between border-b border-border pb-2 mb-4">
                                  <span className="text-muted-foreground select-none text-[10px] tracking-widest uppercase">
                                     System Instructions
                                  </span>
                                  <Button 
                                    onClick={initSave}
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-5 text-[10px] text-muted-foreground hover:text-yellow-600 dark:hover:text-yellow-500 gap-1"
                                  >
                                    <Save className="w-3 h-3" /> Save to My Patterns
                                  </Button>
                              </div>
                              
                              <textarea 
                                  className="w-full bg-transparent resize-none focus:outline-none text-emerald-600 dark:text-emerald-500/90 h-[300px]"
                                  value={systemPrompt}
                                  onChange={(e) => setSystemPrompt(e.target.value)}
                                  placeholder="Enter system instructions here..."
                              />
                           </div>

                           {/* User Input Section */}
                           <div className="mt-8 pt-8 border-t border-border border-dashed">
                              <span className="text-muted-foreground block mb-4 select-none text-[10px] tracking-widest uppercase">
                                 User Context
                              </span>
                              <div className="whitespace-pre-wrap text-foreground">
                                 {userInput || <span className="text-muted-foreground/50 italic">// Waiting for input...</span>}
                              </div>
                           </div>
                       </>
                   )}
                </div>

                {/* Footer Info */}
                <div className="p-2 border-t border-border bg-muted/30 flex justify-center">
                   <div className="flex items-center text-[10px] text-muted-foreground">
                      <BookOpen className="w-3 h-3 mr-2" />
                      {activeItem?.name || 'Select a pattern'}
                   </div>
                </div>
             </div>
        </div>
      </div>

      {/* ALERT MODAL */}
      {alertConfig.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
           <div className="bg-card border border-border rounded-xl w-full max-w-sm p-6 shadow-2xl slide-in-from-bottom-2 animate-in fade-in duration-300">
              <h3 className={`text-lg font-bold mb-2 ${alertConfig.type === 'error' ? 'text-red-500' : 'text-green-500'}`}>
                  {alertConfig.title}
              </h3>
              <p className="text-muted-foreground mb-6">
                  {alertConfig.message}
              </p>
              <div className="flex justify-end">
                <Button onClick={() => setAlertConfig(prev => ({ ...prev, open: false }))}>
                    Okay
                </Button>
              </div>
           </div>
        </div>
      )}

      {/* CONFIRM MODAL */}
      {confirmConfig.open && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
           <div className="bg-card border border-border rounded-xl w-full max-w-sm p-6 shadow-2xl slide-in-from-bottom-2 animate-in fade-in duration-300">
              <h3 className="text-lg font-bold text-foreground mb-2">
                  {confirmConfig.title}
              </h3>
              <p className="text-muted-foreground mb-6">
                  {confirmConfig.message}
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="ghost" onClick={() => setConfirmConfig(prev => ({ ...prev, open: false }))}>
                    Cancel
                </Button>
                <Button variant="destructive" onClick={confirmConfig.onConfirm}>
                    Delete
                </Button>
              </div>
           </div>
        </div>
      )}

      {/* SAVE MODAL */}
      {isSaveModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-card border border-border rounded-xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-lg font-bold text-foreground">Save Pattern</h2>
                 <button onClick={() => setIsSaveModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              
              <div className="space-y-4">
                 <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Pattern Name</label>
                    <Input 
                       value={newPatternName}
                       onChange={(e) => setNewPatternName(e.target.value)}
                       className="bg-background border-border text-foreground"
                       placeholder="e.g. My Coding Helper"
                       autoFocus
                    />
                 </div>

                  <div className="flex items-start space-x-2 pt-2">
                     <input
                        type="checkbox"
                        id="isPublic"
                        checked={isPublic}
                        onChange={(e) => setIsPublic(e.target.checked)}
                        className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                     />
                     <div className="grid gap-1.5 leading-none">
                        <label
                           htmlFor="isPublic"
                           className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                           Make Public (Share with Community)
                        </label>
                        <p className="text-xs text-muted-foreground">
                           {isPublic ? (
                               <span className="text-amber-600 dark:text-amber-400 font-medium">
                                   Note: Public prompts require admin approval before appearing in the feed.
                               </span>
                           ) : (
                               "Allows other users to view and rate your prompt."
                           )}
                        </p>
                     </div>
                  </div>
                 
                 <div className="flex items-center justify-end gap-3 mt-6">
                    <Button variant="ghost" onClick={() => setIsSaveModalOpen(false)}>Cancel</Button>
                    <Button onClick={confirmSavePattern} className="bg-blue-600 hover:bg-blue-500 text-white">
                       Save Pattern
                    </Button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
           <div className="bg-card border border-border rounded-xl w-full max-w-md p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                 <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                    <Settings className="w-4 h-4" /> API Settings
                 </h2>
                 <button onClick={() => setIsSettingsOpen(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                 </button>
              </div>
              
              <div className="space-y-6">
                 <div className="p-3 bg-blue-900/20 text-blue-300 text-[10px] rounded border border-blue-900/50">
                    Keys are stored in your browser's LocalStorage and are never sent to our servers.
                 </div>

                 <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2 block">Provider</label>
                    <div className="grid grid-cols-3 gap-2">
                        {(['openai', 'anthropic', 'gemini', 'deepseek', 'ollama', 'custom'] as LLMProvider[]).map(p => (
                            <button 
                                key={p}
                                onClick={() => changeProvider(p)}
                                className={`py-2 text-xs rounded border transition-colors capitalize ${
                                    llmProvider === p 
                                    ? 'bg-primary/10 border-primary text-primary font-bold' 
                                    : 'bg-background border-border text-muted-foreground hover:border-muted-foreground/50'
                                }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                 </div>

                 {llmProvider === 'ollama' && (
                     <div className="p-3 bg-yellow-900/10 text-yellow-500 text-[10px] rounded border border-yellow-900/30 flex gap-2">
                        <Globe className="w-4 h-4 shrink-0" />
                        <div>
                           Ensure your Ollama server is running with <code>OLLAMA_ORIGINS="*"</code> to allow browser access.
                        </div>
                     </div>
                 )}

                 <div className="space-y-4">
                     <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">
                            {llmProvider === 'ollama' ? 'Server URL' : 'API Key'}
                        </label>
                        {llmProvider === 'ollama' ? (
                            <Input 
                               value={baseUrl}
                               onChange={(e) => setBaseUrl(e.target.value)}
                               className="bg-background border-border text-foreground font-mono text-xs"
                               placeholder="http://localhost:11434/v1"
                            />
                        ) : (
                            <Input 
                               value={apiKey}
                               onChange={(e) => setApiKey(e.target.value)}
                               type="password"
                               className="bg-background border-border text-foreground font-mono text-xs"
                               placeholder="sk-..."
                            />
                        )}
                     </div>
                     
                     {(llmProvider === 'deepseek' || llmProvider === 'custom') && (
                         <div>
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Base URL</label>
                            <Input 
                               value={baseUrl}
                               onChange={(e) => setBaseUrl(e.target.value)}
                               className="bg-background border-border text-foreground font-mono text-xs"
                               placeholder="https://api.deepseek.com"
                            />
                         </div>
                     )}
                     
                     <div>
                        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1 block">Model Name</label>
                        <Input 
                           value={modelName}
                           onChange={(e) => setModelName(e.target.value)}
                           className="bg-background border-border text-foreground font-mono text-xs"
                           placeholder="gpt-4o"
                        />
                     </div>
                 </div>
                 
                 <div className="flex items-center justify-end gap-3 mt-6">
                    <Button variant="ghost" onClick={() => setIsSettingsOpen(false)}>Cancel</Button>
                    <Button onClick={saveSettings} className="bg-blue-600 hover:bg-blue-500 text-white">
                       Save & Close
                    </Button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default PatternStudio;
