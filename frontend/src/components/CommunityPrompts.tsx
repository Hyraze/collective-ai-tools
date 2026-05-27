
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Heart, 
  Copy, 
  Check, 
  Search, 
  Users,
  Sparkles,
  Terminal,
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from './ui/card';
import { Input } from './ui/input';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

interface Prompt {
  _id: string;
  title: string;
  description?: string;
  content: string;
  tags: string[];
  userId?: {
    _id: string;
    name: string;
  };
  source: 'user' | 'fabric' | 'anthropic';
  rating: number;
  votes: { userId: string, value: number }[];
  createdAt: string;
}

interface CommunityPromptsProps {
  showHeader?: boolean;
}

const CommunityPrompts: React.FC<CommunityPromptsProps> = ({ showHeader = true }) => {
  const { user } = useAuth();
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [copyId, setCopyId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'user' | 'fabric' | 'anthropic'>('all');

  useEffect(() => {
    fetchPrompts();
  }, [search]); 

  const fetchPrompts = async () => {
    try {
      setLoading(true);
      const query = new URLSearchParams({ 
        limit: '50', // Fetch more for better grid
        sort: 'rating'
      });
      if (search) query.append('search', search);

      const res = await fetch(`/api/prompts?${query.toString()}`);
      const data = await res.json();
      if (data.prompts) setPrompts(data.prompts);
    } catch (err) {
      console.error('Failed to fetch prompts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (id: string, value: 1 | -1) => {
    if (!user) {
        // Simple shake animation cue or toast could go here
        return; 
    }
    
    // Optimistic update
    setPrompts(prev => prev.map(p => {
        if (p._id === id) {
            return { ...p, rating: p.rating + value };
        }
        return p;
    }));

    try {
      const res = await fetch(`/api/prompts/${id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }) 
      });
      
      const updatedPrompt = await res.json();
      setPrompts(prev => prev.map(p => p._id === id ? updatedPrompt : p));
    } catch (err) {
      console.error('Vote failed:', err);
      fetchPrompts(); // Revert
    }
  };

  const copyPrompt = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopyId(id);
    setTimeout(() => setCopyId(null), 2000);
  };

  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const navigate = useNavigate();

  const handleOpenInStudio = (prompt: Prompt) => {
      navigate('/prompt-studio', { state: { importPattern: prompt } });
  };

  const filteredPrompts = activeFilter === 'all' 
    ? prompts 
    : prompts.filter(p => p.source === activeFilter);

  return (
    <section className="min-h-screen bg-gray-50/50 dark:bg-gray-900/50 relative">
      <div className={cn("relative overflow-hidden", showHeader ? "py-20 lg:py-32" : "pb-12 pt-0")}>
        {/* ... Hero Section code remains ... */}
        <div className="absolute inset-0 bg-grid-slate-200/50 dark:bg-grid-slate-800/20 [mask-image:linear-gradient(0deg,transparent,black)] pointer-events-none" />
        {showHeader && (
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <Badge variant="outline" className="mb-6 px-4 py-1.5 rounded-full text-sm border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-900 dark:bg-blue-900/30 dark:text-blue-300">
             <Sparkles className="w-3.5 h-3.5 mr-2 inline-block" />
             Explore Community Wisdom
          </Badge>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 dark:from-white dark:via-blue-200 dark:to-white mb-6">
            Discover the Best AI Prompts
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-10 leading-relaxed">
            A curated collection of high-quality prompts from the community, Fabric, and Anthropic. 
            Vote for your favorites and supercharge your workflow.
          </p>
        </div>
        )}

          {/* Search & Filter Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-200" />
                <div className="relative flex items-center bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-2">
                    <Search className="ml-4 h-5 w-5 text-gray-400" />
                    <Input 
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-lg py-6 placeholder:text-gray-400"
                        placeholder="Search for 'coding', 'copywriting', 'analysis'..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                    <div className="hidden sm:flex border-l border-gray-200 dark:border-gray-700 pl-2 gap-1">
                         {(['all', 'user', 'fabric', 'anthropic'] as const).map((filter) => (
                             <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={cn(
                                    "px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all",
                                    activeFilter === filter 
                                        ? "bg-gray-900 text-white dark:bg-white dark:text-gray-900" 
                                        : "text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                                )}
                             >
                                {filter}
                             </button>
                         ))}
                    </div>
                </div>
            </div>
          </div>
      </div>

      {/* Grid Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {loading ? (
             <div className="text-center py-20 animate-pulse text-gray-500">Loading prompts...</div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPrompts.map(prompt => (
                    <Card 
                        key={prompt._id} 
                        className="group flex flex-col h-full bg-white dark:bg-gray-800/40 backdrop-blur-sm border-gray-200 dark:border-gray-700/50 hover:border-blue-500/30 dark:hover:border-blue-400/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
                        onClick={() => setSelectedPrompt(prompt)}
                    >
                        <CardHeader className="pb-3">
                            <div className="flex justify-between items-start gap-3">
                                <div className="flex-1 min-w-0">
                                   <div className="flex items-center gap-2 mb-2">
                                       <Badge 
                                         variant="outline" 
                                         className={cn(
                                            "text-[10px] px-2 py-0.5 h-5 capitalize border-0",
                                            prompt.source === 'fabric' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                                            prompt.source === 'anthropic' ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
                                            "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                         )}
                                       >
                                           {prompt.source}
                                       </Badge>
                                       <span className="text-xs text-gray-400 flex items-center truncate">
                                          <Users className="w-3 h-3 mr-1" />
                                          {prompt.userId ? prompt.userId.name : 'System'}
                                       </span>
                                   </div>
                                   <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100 line-clamp-1 leading-tight group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" title={prompt.title}>
                                       {prompt.title}
                                   </h3>
                                </div>
                            </div>
                        </CardHeader>
                        
                        <CardContent className="flex-1 pb-3">
                             <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4 min-h-[60px] leading-relaxed">
                                {prompt.description || prompt.content}
                             </p>
                            
                            <div className="flex flex-wrap gap-1.5 mt-auto">
                                {prompt.tags.slice(0,3).map(tag => (
                                    <span key={tag} className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-medium bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                                        #{tag}
                                    </span>
                                ))}
                            </div>
                        </CardContent>
    
                        <CardFooter className="pt-3 border-t border-gray-100 dark:border-gray-700/50 flex items-center justify-between p-4 bg-gray-50/30 dark:bg-gray-900/20">
                            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className={cn(
                                        "h-8 px-2 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors",
                                        prompt.rating > 0 ? "text-red-500" : "text-gray-400"
                                    )}
                                    onClick={() => handleVote(prompt._id, 1)}
                                >
                                    <Heart className={cn("w-4 h-4 mr-1.5", prompt.rating > 0 && "fill-current")} />
                                    <span className="font-semibold text-xs">{prompt.rating}</span>
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        )}
      </div>

       {/* Detail Modal */}
       {selectedPrompt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" onClick={() => setSelectedPrompt(null)}>
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" />
              <div 
                className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
              >
                  {/* Modal Header */}
                  <div className="flex items-start justify-between p-6 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                      <div>
                          <div className="flex items-center gap-2 mb-2">
                             <Badge variant="outline" className="capitalize">{selectedPrompt.source}</Badge>
                             <span className="text-xs text-gray-500 flex items-center">
                                by {selectedPrompt.userId?.name || 'System'}
                             </span>
                          </div>
                          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedPrompt.title}</h2>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => setSelectedPrompt(null)}>
                           <span className="sr-only">Close</span>
                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                      </Button>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6 overflow-y-auto custom-scrollbar">
                      {selectedPrompt.description && (
                          <div className="mb-6">
                              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wider">Description</h4>
                              <p className="text-gray-600 dark:text-gray-300">{selectedPrompt.description}</p>
                          </div>
                      )}

                      <div className="mb-6">
                           <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 uppercase tracking-wider">Prompt Content</h4>
                           <div className="bg-gray-50 dark:bg-gray-950 p-4 rounded-lg font-mono text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap border border-gray-200 dark:border-gray-800">
                               {selectedPrompt.content}
                           </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                          {selectedPrompt.tags.map(tag => (
                              <Badge key={tag} variant="secondary">#{tag}</Badge>
                          ))}
                      </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50 flex flex-col sm:flex-row gap-3 justify-end">
                      <Button variant="outline" onClick={() => copyPrompt(selectedPrompt.content, selectedPrompt._id)}>
                          {copyId === selectedPrompt._id ? (
                                <>
                                    <Check className="w-4 h-4 mr-2 text-green-500" />
                                    Copied
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy to Clipboard
                                </>
                            )}
                      </Button>
                      <Button onClick={() => handleOpenInStudio(selectedPrompt)} className="bg-blue-600 hover:bg-blue-700 text-white">
                          <Terminal className="w-4 h-4 mr-2" />
                          Open in Prompt Studio
                      </Button>
                  </div>
              </div>
          </div>
       )}

    </section>
  );
};

export default CommunityPrompts;
