import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Wrench, 
  Database, 
  Briefcase, 
  Users, 
  ArrowRight, 
  Sparkles,
  Code,
  Clock,
  MessageSquare,
  ImageIcon,
  Zap,
  Mail,
  Video,
  PenTool,
  Music,
  Palette,
  Scale,
  GraduationCap,
  TrendingUp,
  BarChart3,
  Brain,
  Workflow,
  Shield,
  Map,
  Terminal,
  Library,
  BookOpen,
  Star,
} from 'lucide-react';

interface TechItem {
  _id: string;
  name: string;
  description: string;
  url?: string;
  addedDate?: string;
  category?: { name: string };
}

import SEO from './SEO';
import { generateWebsiteStructuredData } from '@/lib/seoUtils';

export default function LandingPage() {
  const navigate = useNavigate();
  const [latestTools, setLatestTools] = useState<TechItem[]>([]);
  const [latestMCP, setLatestMCP] = useState<TechItem[]>([]);
  const [popularTools, setPopularTools] = useState<TechItem[]>([]);
  const [popularMCP, setPopularMCP] = useState<TechItem[]>([]);
  const [popularPrompts, setPopularPrompts] = useState<any[]>([]);
  const [trendingResources, setTrendingResources] = useState<any[]>([]);
  const [email, setEmail] = useState('');
  const [subStatus, setSubStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [subMessage, setSubMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubStatus('loading');
    
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setSubStatus('success');
        setSubMessage(data.message || 'Thanks for subscribing!');
        setEmail('');
      } else {
        setSubStatus('error');
        setSubMessage(data.error || 'Something went wrong.');
      }
    } catch (error) {
      console.error(error);
      setSubStatus('error');
      setSubMessage('Failed to connect. Please try again.');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [toolsRes, mcpRes, popToolsRes, popMcpRes, promptsRes, trendingRes] = await Promise.all([
          fetch('/api/ai-tools?limit=5&sort=newest'),
          fetch('/api/mcp?limit=5&sort=newest'),
          fetch('/api/ai-tools?limit=5&sort=popular'),
          fetch('/api/mcp?limit=5&sort=popular'),
          fetch('/api/prompts?limit=5&sort=rating'),
          fetch('/api/trending-repos')
        ]);
        
        const toolsData = await toolsRes.json();
        const mcpData = await mcpRes.json();
        const popToolsData = await popToolsRes.json();
        const popMcpData = await popMcpRes.json();
        const promptsData = await promptsRes.json();
        const trendingData = await trendingRes.json();
        
        if (toolsData.data) setLatestTools(toolsData.data);
        if (mcpData.data) setLatestMCP(mcpData.data);
        if (popToolsData.data) setPopularTools(popToolsData.data);
        if (popMcpData.data) setPopularMCP(popMcpData.data);
        if (promptsData.prompts) setPopularPrompts(promptsData.prompts);
        if (trendingData.data) setTrendingResources(trendingData.data);

      } catch (error) {
        console.error('Failed to fetch resources:', error);
      }
    };
    
    fetchData();
  }, []);

  const features = [
    {
      title: "AI Tools Directory",
      description: "Discover thousands of curated AI applications and resources.",
      icon: Wrench,
      path: "/tools",
      color: "from-blue-600 to-cyan-500",
      textColor: "text-blue-600 dark:text-blue-400",
      bgFrom: "from-blue-500/5",
      bgTo: "to-cyan-500/5",
      border: "group-hover:border-blue-500/50",
      delay: "delay-100",
      className: "md:col-span-2 md:row-span-2"
    },
    {
      title: "MCP Catalog",
      description: "Access official and community Model Context Protocol servers.",
      icon: Database,
      path: "/mcp-catalog",
      color: "from-emerald-500 to-teal-500",
      textColor: "text-emerald-600 dark:text-emerald-400",
      bgFrom: "from-emerald-500/5",
      bgTo: "to-teal-500/5",
      border: "group-hover:border-emerald-500/50",
      delay: "delay-200",
      className: "md:col-span-1 md:row-span-2"
    },
    {
      title: "Workspace",
      description: "Powerful built-in productivity suite.",
      icon: Briefcase,
      path: "/built-in-tools",
      color: "from-orange-500 to-amber-500",
      textColor: "text-orange-600 dark:text-orange-400",
      bgFrom: "from-orange-500/5",
      bgTo: "to-amber-500/5",
      border: "group-hover:border-orange-500/50",
      delay: "delay-300",
      className: "md:col-span-1"
    },
    {
        title: "Prompt Studio",
        description: "Craft, refine, and manage effective prompts.",
        icon: Terminal,
        path: "/prompt-studio",
        color: "from-rose-500 to-red-500",
        textColor: "text-rose-600 dark:text-rose-400",
        bgFrom: "from-rose-500/5",
        bgTo: "to-red-500/5",
        border: "group-hover:border-rose-500/50",
        delay: "delay-400",
        className: "md:col-span-1"
    },
    {
      title: "Job Board",
      description: "Find your next career opportunity.",
      icon: Users,
      path: "/job-board",
      color: "from-purple-500 to-pink-500",
      textColor: "text-purple-600 dark:text-purple-400",
      bgFrom: "from-purple-500/5",
      bgTo: "to-pink-500/5",
      border: "group-hover:border-purple-500/50",
      delay: "delay-500",
      className: "md:col-span-1"
    },
    {
      title: "Interactive Roadmap",
      description: "Step-by-step AI learning paths.",
      icon: Map,
      path: "/roadmap",
      color: "from-indigo-500 to-violet-500",
      textColor: "text-indigo-600 dark:text-indigo-400",
      bgFrom: "from-indigo-500/5",
      bgTo: "to-violet-500/5",
      border: "group-hover:border-indigo-500/50",
      delay: "delay-600",
      className: "md:col-span-1"
    },
    {
        title: "Prompt Library",
        description: "Verified prompts gallery for various use cases.",
        icon: Library,
        path: "/prompts", 
        color: "from-cyan-500 to-blue-500",
        textColor: "text-cyan-600 dark:text-cyan-400",
        bgFrom: "from-cyan-500/5",
        bgTo: "to-blue-500/5",
        border: "group-hover:border-cyan-500/50",
        delay: "delay-700",
        className: "md:col-span-1"
    },
    {
        title: "Resources",
        description: "Documentation, guides, and tutorials.",
        icon: BookOpen,
        path: "/trending",
        color: "from-lime-500 to-green-500",
        textColor: "text-lime-600 dark:text-lime-400",
        bgFrom: "from-lime-500/5",
        bgTo: "to-green-500/5",
        border: "group-hover:border-lime-500/50",
        delay: "delay-800",
        className: "md:col-span-1"
    }
  ];

  const categories = [
    { name: "Chat Models", slug: "chatbots", icon: MessageSquare, color: "text-pink-500 bg-pink-100 dark:bg-pink-900/20" },
    { name: "Code Assistants", slug: "developer-tools", icon: Code, color: "text-blue-500 bg-blue-100 dark:bg-blue-900/20" },
    { name: "Image Generation", slug: "image-generator", icon: ImageIcon, color: "text-purple-500 bg-purple-100 dark:bg-purple-900/20" },
    { name: "Video Creation", slug: "video", icon: Video, color: "text-orange-500 bg-orange-100 dark:bg-orange-900/20" },
    { name: "Productivity", slug: "productivity", icon: Zap, color: "text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20" },
    { name: "Writing & Copy", slug: "writing", icon: PenTool, color: "text-emerald-500 bg-emerald-100 dark:bg-emerald-900/20" },
    { name: "Audio & Music", slug: "audio", icon: Music, color: "text-red-500 bg-red-100 dark:bg-red-900/20" },
    { name: "Marketing & SEO", slug: "marketing", icon: BarChart3, color: "text-cyan-500 bg-cyan-100 dark:bg-cyan-900/20" },
    { name: "Design & Art", slug: "design", icon: Palette, color: "text-indigo-500 bg-indigo-100 dark:bg-indigo-900/20" },
    { name: "Legal & Compliance", slug: "legal", icon: Scale, color: "text-amber-500 bg-amber-100 dark:bg-amber-900/20" },
    { name: "Education", slug: "education", icon: GraduationCap, color: "text-lime-500 bg-lime-100 dark:bg-lime-900/20" },
    { name: "Sales & CRM", slug: "sales", icon: TrendingUp, color: "text-rose-500 bg-rose-100 dark:bg-rose-900/20" },
  ];

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const renderListItem = (item: any, type: 'tool' | 'mcp' | 'prompt' | 'resource') => {
    const title = item.name || item.title;
    const desc = item.description;
    const link = item.url || item.link; // standard url vs trending link
    
    // Determine icon and color
    let Icon = Wrench;
    let colorClass = 'bg-gradient-to-br from-blue-500 to-cyan-500 text-white';
    
    if (type === 'mcp') {
        Icon = Database;
        colorClass = 'bg-gradient-to-br from-emerald-500 to-teal-500 text-white';
    } else if (type === 'prompt') {
        Icon = Terminal;
        colorClass = 'bg-gradient-to-br from-rose-500 to-red-500 text-white';
    } else if (type === 'resource') {
        Icon = BookOpen;
        colorClass = 'bg-gradient-to-br from-lime-500 to-green-500 text-white';
    }

    const handleClick = () => {
        if (type === 'tool') window.open(link, '_blank');
        else if (type === 'mcp') navigate(`/mcp-catalog?id=${item._id}`);
        else if (type === 'prompt') navigate(`/prompts`); // ideally link to specific prompt
        else if (type === 'resource') window.open(link, '_blank');
    };

    return (
    <div 
      key={item._id || item.link || title}
      onClick={handleClick}
      className="group relative flex items-center gap-4 p-4 pr-12 rounded-2xl bg-white/40 dark:bg-white/5 border border-gray-200 dark:border-white/5 hover:bg-white dark:hover:bg-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-all duration-300 cursor-pointer hover:-translate-y-0.5 hover:shadow-lg min-h-[5.5rem]"
    >
      <div className={`flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center shadow-sm ${colorClass}`}>
        <Icon className="h-5 w-5" />
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate mb-0.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {title}
        </h4>
        
        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mb-2">
          {desc}
        </p>

        <div className="flex items-center gap-2 text-[10px] font-medium text-gray-400 dark:text-gray-500">
           {type === 'tool' || type === 'mcp' ? (
               <>
                {item.category && (
                    <span className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                        {item.category.name}
                    </span>
                )}
                <span>•</span>
                <span>{item.addedDate ? formatTimeAgo(item.addedDate) : 'Recently'}</span>
               </>
           ) : type === 'prompt' ? (
               <>
                 <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-3 w-3 fill-current" />
                    <span>{item.rating || 0}</span>
                 </div>
                 <span>•</span>
                 <span>{item.downloads || 0} used</span>
               </>
           ) : (
               <>
                 <div className="flex items-center gap-1 text-amber-500">
                    <Star className="h-3 w-3 fill-current" />
                    <span>{item.stars || 0}</span>
                 </div>
                 <span>•</span>
                 <span className="px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 uppercase tracking-wide">
                    {item.language || 'Code'}
                 </span>
               </>
           )}
        </div>
      </div>
      
      <div className="absolute top-1/2 -translate-y-1/2 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
        <ArrowRight className="h-4 w-4 text-gray-400 dark:text-gray-300" />
      </div>
    </div>
  )};

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0A0A0A] text-gray-900 dark:text-gray-100 transition-colors duration-300 selection:bg-blue-500/30">
      <SEO 
        title="Collective AI Tools - The Ultimate Ecosystem for AI Builders"
        description="Discover thousands of curated AI applications, access official MCP servers, and build advanced agents with our built-in productivity suite."
        structuredData={generateWebsiteStructuredData()}
      />
      
      {/* Background Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-500/20 rounded-[100%] blur-[100px] opacity-30 animate-pulse dark:bg-blue-600/10" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] opacity-30" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
        
        {/* Hero Section */}
        <div className="text-center mb-20 animate-fade-in-up relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 dark:bg-white/5 backdrop-blur-md border border-gray-200 dark:border-white/10 mb-6 shadow-sm hover:scale-105 transition-transform cursor-default">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wide">
              The Ultimate Ecosystem for AI Builders
            </span>
          </div>
          
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter mb-6 leading-[1.1]">
            <span className="bg-clip-text text-transparent bg-gradient-to-br from-gray-900 via-gray-700 to-gray-800 dark:from-white dark:via-gray-100 dark:to-gray-400">
              Collective
            </span>{' '}
            <span className="relative inline-block">
                <span className="absolute -inset-1 blur-2xl bg-blue-500/30 rounded-full" />
                <span className="relative bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-violet-600 to-indigo-600 dark:from-blue-400 dark:via-violet-400 dark:to-indigo-400">
                AI Tools
                </span>
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-500 dark:text-gray-400 leading-relaxed mb-10 font-medium">
            A unified platform to explore tools, connect agents via MCP, and accelerate your productivity.
          </p>

          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3">
             <button 
                onClick={() => navigate('/tools')}
                className="group relative px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-bold text-base hover:-translate-y-0.5 transition-all shadow-[0_10px_20px_-10px_rgba(0,0,0,0.5)] dark:shadow-[0_10px_20px_-10px_rgba(255,255,255,0.3)] flex items-center justify-center gap-2 overflow-hidden"
             >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                <span className="relative">Get Started</span>
                <ArrowRight className="relative h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
             </button>
             <button 
                onClick={() => window.open('https://github.com/Hyraze/collective-ai-tools', '_blank')}
                className="px-6 py-3 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white rounded-xl font-bold text-base hover:bg-gray-50 dark:hover:bg-white/10 transition-all hover:border-gray-300 dark:hover:border-white/20 flex items-center justify-center gap-2 backdrop-blur-sm"
             >
                <Code className="h-4 w-4" />
                Star on GitHub
             </button>
          </div>
        </div>

      {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 lg:gap-6 relative z-10 mb-24 auto-rows-[minmax(180px,auto)]">
          {features.map((feature) => (
            <div
              key={feature.title}
              onClick={() => navigate(feature.path)}
              className={`group relative overflow-hidden rounded-3xl border border-gray-200 dark:border-white/10 bg-white/80 dark:bg-gray-900/40 backdrop-blur-xl p-6 hover:shadow-xl transition-all duration-500 cursor-pointer ${feature.border} hover:-translate-y-1 ${feature.delay} ${feature.className || ''}`}
            >
              {/* Internal Gradient Mesh & Overlays */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.bgFrom} ${feature.bgTo} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              {/* Grid Pattern Overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-700 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:20px_20px]" />
              
              {/* Dynamic Gradient Blob */}
              <div className={`absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 dark:group-hover:opacity-20 blur-[60px] transition-all duration-700 group-hover:scale-125`} />
                            
              {/* Noise Texture */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-overlay brightness-100 contrast-150" />
              
              {/* Background Icon Watermark */}
              <div className={`absolute -bottom-4 -right-4 opacity-0 group-hover:opacity-[0.07] transition-all duration-700 transform rotate-12 group-hover:rotate-0 scale-[2.5] pointer-events-none`}>
                  <feature.icon className={`h-32 w-32 ${feature.textColor}`} />
              </div>

              <div className="relative flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex-1">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-white/5 dark:to-white/5 border border-gray-100 dark:border-white/10 mb-4 shadow-sm group-hover:scale-105 transition-transform duration-500`}>
                    <feature.icon className={`h-6 w-6 ${feature.textColor} stroke-[1.5]`} />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight">
                    {feature.title}
                  </h3>
                  
                  <p className="text-gray-500 dark:text-gray-400 text-base leading-relaxed">
                    {feature.description}
                  </p>
                </div>

                <div className="self-end md:self-start flex h-8 w-8 rounded-full border border-gray-200 dark:border-white/10 items-center justify-center group-hover:bg-gray-900 group-hover:text-white dark:group-hover:bg-white dark:group-hover:text-black transition-all duration-300 opacity-50 group-hover:opacity-100 rotate-45 group-hover:rotate-0">
                    <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>

      {/* Discovery Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10 mb-20">
            
            {/* Trending AI Tools */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2 px-1">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Trending AI Tools</h3>
                </div>
                <div className="space-y-3">
                    {latestTools.length > 0 ? (
                        latestTools.slice(0, 5).map((tool: TechItem) => renderListItem(tool, 'tool'))
                    ) : (
                        [1,2,3,4,5].map(i => (
                            <div key={i} className="h-16 rounded-2xl bg-gray-100 dark:bg-white/5 animate-pulse" />
                        ))
                    )}
                </div>
            </div>

            {/* Newest MCP Resources */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2 px-1">
                    <Sparkles className="h-5 w-5 text-emerald-500" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Newest MCP Resources</h3>
                </div>
                <div className="space-y-3">
                    {latestMCP.length > 0 ? (
                        latestMCP.slice(0, 5).map((res: TechItem) => renderListItem(res, 'mcp'))
                    ) : (
                        [1,2,3,4,5].map(i => (
                            <div key={i} className="h-16 rounded-2xl bg-gray-100 dark:bg-white/5 animate-pulse" />
                        ))
                    )}
                </div>
            </div>
        </div>

        {/* Dedicated AI Workspace Section */}
        <div className="mb-32 relative z-10">
            <div className="flex items-center justify-between mb-10 px-1">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-600/10 rounded-2xl text-purple-600">
                        <Brain className="h-7 w-7" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">AI Workspace</h2>
                        <p className="text-gray-500 dark:text-gray-400 font-medium">Native tools for automation, analysis, and generation.</p>
                    </div>
                </div>
                <Link 
                    to="/built-in-tools" 
                    className="hidden sm:flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-bold hover:opacity-90 transition-all group"
                >
                    View All Tools <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                    {
                        id: 'agent-builder',
                        name: 'Agent Builder MCP',
                        description: 'Create sophisticated AI agents with Model Context Protocol (MCP) for advanced reasoning.',
                        icon: Brain,
                        color: 'text-blue-500',
                        bgColor: 'bg-blue-500/10'
                    },
                    {
                        id: 'n8n-builder',
                        name: 'n8n Workflow Builder',
                        description: 'Generate advanced n8n workflows with AI-powered automation and logic flows.',
                        icon: Zap,
                        color: 'text-amber-500',
                        bgColor: 'bg-amber-500/10'
                    },
                    {
                        id: 'multi-model-orchestrator',
                        name: 'Multi-Model Orchestrator',
                        description: 'Intelligently route queries to the best AI models and compare responses.',
                        icon: BarChart3,
                        color: 'text-purple-500',
                        bgColor: 'bg-purple-500/10'
                    },
                    {
                        id: 'visual-workflow-builder',
                        name: 'Visual AI Workflow Builder',
                        description: 'Design complex AI sequences with a visual drag-and-drop interface.',
                        icon: Workflow,
                        color: 'text-blue-600',
                        bgColor: 'bg-blue-600/10'
                    },
                    {
                        id: 'realtime-data-fusion',
                        name: 'Real-time Data Fusion',
                        description: 'Bridge multiple data streams with AI-powered synthesis and analysis.',
                        icon: Database,
                        color: 'text-emerald-500',
                        bgColor: 'bg-emerald-500/10'
                    },
                    {
                        id: 'ai-ethics-bias-lab',
                        name: 'AI Ethics & Bias Lab',
                        description: 'Critically analyze and mitigate algorithmic bias at every stage of development.',
                        icon: Shield,
                        color: 'text-red-500',
                        bgColor: 'bg-red-500/10'
                    }
                ].map((tool) => (
                        <div 
                            key={tool.id}
                            onClick={() => navigate(`/built-in-tools/${tool.id}`)}
                            className="group relative overflow-hidden rounded-2xl border border-gray-100 dark:border-white/5 bg-white/50 dark:bg-white/5 backdrop-blur-xl p-3.5 cursor-pointer hover:shadow-xl transition-all duration-300 hover:bg-white dark:hover:bg-white/10 flex items-center gap-4"
                        >
                            <div className={`flex-shrink-0 h-12 w-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-50 to-white dark:from-white/5 dark:to-white/10 border border-gray-100 dark:border-white/10 ${tool.color} group-hover:scale-110 transition-transform duration-500 shadow-sm`}>
                                <tool.icon className="h-6 w-6" />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-0.5">
                                    <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                        {tool.name}
                                    </h3>
                                </div>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-tight mb-1.5 line-clamp-1">
                                    {tool.description}
                                </p>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-md bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                                        Built-in
                                    </span>
                                    <span className="text-[9px] text-gray-300 dark:text-gray-600">•</span>
                                    <span className="text-[9px] text-gray-400 dark:text-gray-500 font-medium tracking-tight">
                                        Optimized
                                    </span>
                                </div>
                            </div>

                            <ArrowRight className="h-3.5 w-3.5 text-gray-200 dark:text-white/10 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-all transform group-hover:translate-x-1" />
                        </div>
                ))}
            </div>
            
            <div className="mt-8 sm:hidden">
                <Link 
                    to="/built-in-tools" 
                    className="flex items-center justify-center gap-2 px-5 py-4 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-black text-sm font-bold hover:opacity-90 transition-all"
                >
                    View All Tools <ArrowRight className="h-4 w-4" />
                </Link>
            </div>
        </div>

        {/* Popular Resources Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10 mb-32">
            
            {/* Popular AI Tools */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2 px-1">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Popular AI Tools</h3>
                </div>
                <div className="space-y-3">
                    {popularTools.length > 0 ? (
                        popularTools.slice(0, 5).map((tool: TechItem) => renderListItem(tool, 'tool'))
                    ) : (
                        [1,2,3,4,5].map(i => (
                            <div key={i} className="h-20 rounded-2xl bg-gray-100 dark:bg-white/5 animate-pulse" />
                        ))
                    )}
                </div>
            </div>

            {/* Popular MCP Resources */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 mb-2 px-1">
                    <Zap className="h-5 w-5 text-amber-500" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">Trending MCP Tools</h3>
                </div>
                <div className="space-y-3">
                    {popularMCP.length > 0 ? (
                        popularMCP.slice(0, 5).map((res: TechItem) => renderListItem(res, 'mcp'))
                    ) : (
                        [1,2,3,4,5].map(i => (
                            <div key={i} className="h-20 rounded-2xl bg-gray-100 dark:bg-white/5 animate-pulse" />
                        ))
                    )}
                </div>
            </div>
        </div>

        {/* Popular Prompts & Resources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10 mb-32">
            
            {/* Popular Prompts */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-2">
                        <Terminal className="h-5 w-5 text-rose-500" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Popular Prompts</h3>
                    </div>
                    <Link to="/prompts" className="text-xs font-semibold text-gray-500 hover:text-rose-500 dark:hover:text-rose-400 transition-colors">View All</Link>
                </div>
                <div className="space-y-3">
                    {popularPrompts.length > 0 ? (
                        popularPrompts.slice(0, 5).map((prompt: any) => renderListItem(prompt, 'prompt'))
                    ) : (
                        [1,2,3,4,5].map(i => (
                            <div key={i} className="h-20 rounded-2xl bg-gray-100 dark:bg-white/5 animate-pulse" />
                        ))
                    )}
                </div>
            </div>

            {/* Trending Resources */}
            <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between mb-2 px-1">
                    <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-lime-500" />
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Popular Resources</h3>
                    </div>
                    <span className="text-xs font-semibold text-gray-500">Daily Trending</span>
                </div>
                <div className="space-y-3">
                    {trendingResources.length > 0 ? (
                        trendingResources.slice(0, 5).map((res: any) => renderListItem(res, 'resource'))
                    ) : (
                        [1,2,3,4,5].map(i => (
                            <div key={i} className="h-20 rounded-2xl bg-gray-100 dark:bg-white/5 animate-pulse" />
                        ))
                    )}
                </div>
            </div>
        </div>

        <div className="mb-32 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">Explore Categories</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">Detailed collections for every use case.</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <div 
                key={cat.slug}
                onClick={() => navigate(`/tools?category=${cat.slug}`)}
                className="group flex flex-col items-center justify-center p-6 rounded-3xl bg-white/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 hover:bg-white dark:hover:bg-white/10 hover:border-gray-200 dark:hover:border-white/20 transition-all duration-300 cursor-pointer hover:-translate-y-1 hover:shadow-xl"
              >
                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-3 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-sm ${cat.color}`}>
                  <cat.icon className="h-6 w-6" />
                </div>
                <span className="font-bold text-gray-900 dark:text-white text-sm text-center">{cat.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Contributors Wall Section */}
        <div className="mb-32 relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 tracking-tight">Meet the Builders</h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">The community driving the AI open-source revolution.</p>
          </div>
          
          <div className="flex justify-center">
            <div className="relative p-8 rounded-3xl bg-white/50 dark:bg-white/5 border border-gray-100 dark:border-white/5 backdrop-blur-sm overflow-hidden group">
              {/* Background Decoration */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              
              <img 
                src="https://contrib.rocks/image?repo=Hyraze/collective-ai-tools" 
                alt="Contributors"
                className="relative block rounded-xl shadow-sm dark:brightness-90 dark:contrast-110"
              />
            </div>
          </div>
        </div>

        <div className="relative z-10 mb-20">
          <div className="relative overflow-hidden rounded-3xl bg-blue-600/5 dark:bg-white/5 border border-blue-100 dark:border-white/10 p-8 md:p-12 text-center">
            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 dark:bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10 max-w-2xl mx-auto">
              <div className="inline-flex items-center justify-center p-3 rounded-xl bg-blue-600/10 dark:bg-white/10 mb-6 text-blue-600 dark:text-white">
                <Mail className="h-6 w-6" />
              </div>
              
              <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                Join the Collective
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
                Join 10,000+ builders. Get the latest AI tools, MCP servers, and tutorials delivered to your inbox weekly.
              </p>
              
              <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={handleSubscribe}>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email" 
                  required
                  className="flex-1 px-5 py-3.5 rounded-xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all disabled:opacity-50 shadow-sm"
                  disabled={subStatus === 'loading' || subStatus === 'success'}
                />
                <button 
                  disabled={subStatus === 'loading' || subStatus === 'success'}
                  className={`px-6 py-3.5 rounded-xl font-bold transition-all shadow-lg flex items-center justify-center min-w-[120px] ${
                    subStatus === 'success' 
                      ? 'bg-emerald-500 text-white cursor-default' 
                      : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 hover:shadow-xl hover:-translate-y-0.5'
                  }`}
                >
                  {subStatus === 'loading' ? <div className="h-5 w-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin" /> : 
                   subStatus === 'success' ? 'Subscribed!' : 'Subscribe'}
                </button>
              </form>
              
              {subMessage && (
                  <p className={`mt-4 text-sm font-medium animate-fade-in ${subStatus === 'error' ? 'text-red-400' : 'text-emerald-400'}`}>
                      {subMessage}
                  </p>
              )}
              
              {!subMessage && <p className="mt-4 text-xs text-gray-500">No spam, unsubscribe at any time.</p>}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 text-center border-y border-gray-200 dark:border-gray-800 py-12">
            {[
                { label: "AI Tools", value: "2,500+" },
                { label: "MCP Servers", value: "5,000+" },
                { label: "Contributors", value: "120+" },
                { label: "Daily Users", value: "10k+" }
            ].map((stat) => (
                <div key={stat.label}>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">{stat.label}</div>
                </div>
            ))}
        </div>

      </div>
    </div>
  );
}
