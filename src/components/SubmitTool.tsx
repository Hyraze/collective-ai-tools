import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Loader2, Plus, Code, Wrench, Terminal } from 'lucide-react';

export default function SubmitTool() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // UI States
  const [activeTab, setActiveTab] = useState<'mcp' | 'tool'>('mcp');
  const [mcpSubtype, setMcpSubtype] = useState<'server' | 'client'>('server');
  
  const [data, setData] = useState({
    name: '',
    description: '',
    url: '', // Website or Repo URL
    category: '',
    pricing: '',
    tags: '',
    location: 'Remote' // Default for MCP queries
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Sign in to Submit</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">You need an account to submit new tools or servers.</p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Determine the API submission type
    let finalType = 'tool';
    if (activeTab === 'mcp') {
        finalType = mcpSubtype === 'server' ? 'mcp' : 'client';
    }

    try {
        const submissionData = {
            ...data,
            tags: data.tags.split(',').map(t => t.trim()).filter(Boolean)
        };

        const res = await fetch('/api/submissions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                type: finalType,
                data: submissionData
            })
        });

        if (!res.ok) {
            throw new Error('Submission failed');
        }

        setSuccess(true);
        setData({ name: '', description: '', url: '', category: '', pricing: '', tags: '', location: 'Remote' });
    } catch (err) {
        setError('Failed to submit. Please try again.');
        console.error(err);
    } finally {
        setLoading(false);
    }
  };

  if (success) {
    return (
        <div className="max-w-2xl mx-auto py-16 px-4 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                <Plus className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Submission Received!</h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
                Thank you for contributing. Your submission is under review and will be listed once approved.
            </p>
            <button
                onClick={() => setSuccess(false)}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
                Submit Another
            </button>
        </div>
    );
  }

  // Helper properties for conditional rendering
  const isMcpServer = activeTab === 'mcp' && mcpSubtype === 'server';
  const isMcpClient = activeTab === 'mcp' && mcpSubtype === 'client';
  const isTool = activeTab === 'tool';

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Submit a Resource</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Share a new AI tool or MCP resource with the community.
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button
                onClick={() => setActiveTab('mcp')}
                className={`flex-1 py-4 text-center font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'mcp' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
                <Code className="h-5 w-5" />
                MCP Resource
            </button>
            <button
                onClick={() => setActiveTab('tool')}
                className={`flex-1 py-4 text-center font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'tool' ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
            >
                <Wrench className="h-5 w-5" />
                AI Tool
            </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
                    {error}
                </div>
            )}

            {/* MCP Subtype Selection */}
            {activeTab === 'mcp' && (
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Resource Type</label>
                    <div className="bg-gray-50 dark:bg-gray-900/50 p-1 rounded-lg inline-flex relative w-full border border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={() => setMcpSubtype('server')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${mcpSubtype === 'server' ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            <Code className="h-4 w-4" />
                            MCP Server
                        </button>
                        <button
                            type="button"
                            onClick={() => setMcpSubtype('client')}
                            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${mcpSubtype === 'client' ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-gray-200 dark:ring-gray-700' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
                        >
                            <Terminal className="h-4 w-4" />
                            MCP Client
                        </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        {mcpSubtype === 'server' 
                            ? 'A server that provides context or capabilities to an AI model.' 
                            : 'An application (like Claude Desktop) that connects to MCP servers.'}
                    </p>
                </div>
            )}

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                <input
                    type="text"
                    required
                    value={data.name}
                    onChange={(e) => setData({...data, name: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder={`e.g. ${isMcpServer ? 'PostgreSQL MCP Server' : isMcpClient ? 'Claude Desktop' : 'ChatGPT'}`}
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                    required
                    value={data.description}
                    onChange={(e) => setData({...data, description: e.target.value})}
                    rows={4}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Briefly describe what it does..."
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {isMcpServer ? 'Repository URL' : isMcpClient ? 'Download/Repo URL' : 'Website URL'}
                </label>
                <input
                    type="url"
                    required
                    value={data.url}
                    onChange={(e) => setData({...data, url: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="https://..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <select
                        required
                        value={data.category}
                        onChange={(e) => setData({...data, category: e.target.value})}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Select a category</option>
                        {isMcpServer ? (
                            <>
                                <option value="Database">Database</option>
                                <option value="Cloud">Cloud Service</option>
                                <option value="Productivity">Productivity</option>
                                <option value="Development">Development</option>
                            </>
                        ) : isMcpClient ? (
                            <>
                                <option value="Desktop">Desktop App</option>
                                <option value="CLI">CLI</option>
                                <option value="Extension">IDE Extension</option>
                                <option value="Mobile">Mobile App</option>
                            </>
                        ) : (
                            <>
                                <option value="Chat">Chat</option>
                                <option value="Image">Image Generation</option>
                                <option value="Video">Video</option>
                                <option value="Audio">Audio</option>
                                <option value="Productivity">Productivity</option>
                                <option value="Development">Development</option>
                            </>
                        )}
                        <option value="Other">Other</option>
                    </select>
                </div>

                {activeTab === 'mcp' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Location</label>
                         <select
                            required
                            value={data.location}
                            onChange={(e) => setData({...data, location: e.target.value})}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="Remote">Remote</option>
                            <option value="Local">Local</option>
                        </select>
                    </div>
                )}

                {isTool && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pricing</label>
                         <select
                            required
                            value={data.pricing}
                            onChange={(e) => setData({...data, pricing: e.target.value})}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">Select pricing</option>
                            <option value="Free">Free</option>
                            <option value="Freemium">Freemium</option>
                            <option value="Paid">Paid</option>
                            <option value="Trial">Free Trial</option>
                        </select>
                    </div>
                )}
            </div>

            <div className="">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
                <input
                    type="text"
                    value={data.tags}
                    onChange={(e) => setData({...data, tags: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                    placeholder="Comma separated tags (e.g. free, open source)"
                />
            </div>

            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Submit Resource'}
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}
