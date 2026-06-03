import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { Loader2, Puzzle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const AGENTS = [
  'Claude Code', 'OpenCode', 'Cursor', 'Copilot', 'GPT',
  'Hermes Agent', 'Windsurf', 'Kiro', 'Gemini CLI', 'Codex',
  'Copilot CLI', 'Standalone',
];

const CATEGORIES = [
  { value: 'coding', label: 'Coding' },
  { value: 'security', label: 'Security' },
  { value: 'design', label: 'Design' },
  { value: 'automation', label: 'Automation' },
  { value: 'productivity', label: 'Productivity' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'performance', label: 'Performance' },
];

export default function SubmitSkill() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [form, setForm] = useState({
    name: '',
    description: '',
    author: '',
    repo: '',
    installCommand: '',
    tags: '',
  });
  const [category, setCategory] = useState('coding');
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!user) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <Puzzle className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Sign in to Submit</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">You need an account to submit a new agent skill.</p>
        <button
          onClick={() => navigate('/login', { state: { from: location.pathname } })}
          className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  const toggleAgent = (agent: string) => {
    setSelectedAgents((prev) =>
      prev.includes(agent) ? prev.filter((a) => a !== agent) : [...prev, agent],
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (selectedAgents.length === 0) {
      setError('Select at least one compatible agent.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('/api/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          description: form.description,
          author: form.author,
          repo: form.repo,
          installCommand: form.installCommand,
          category,
          compatibleAgents: selectedAgents,
          tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Submission failed');
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="inline-flex p-4 rounded-full bg-violet-100 dark:bg-violet-500/20 mb-6">
            <Puzzle className="h-10 w-10 text-violet-600 dark:text-violet-400" />
          </div>
          <h2 className="text-2xl font-bold mb-3 text-gray-900 dark:text-white">Skill Submitted!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-2">
            Your skill <strong>{form.name}</strong> has been submitted for review.
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-8">
            It will appear on the Skills Marketplace once approved by our team.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setSuccess(false);
                setForm({ name: '', description: '', author: '', repo: '', installCommand: '', tags: '' });
                setSelectedAgents([]);
                setCategory('coding');
              }}
              className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors text-sm"
            >
              Submit Another
            </button>
            <Link
              to="/skills"
              className="px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-sm"
            >
              Browse Skills
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link
          to="/skills"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Skills
        </Link>

        <div className="bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-500/10">
              <Puzzle className="h-5 w-5 text-violet-600 dark:text-violet-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Submit a Skill</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Share an agent skill with the community
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Skill Name *</label>
              <input
                type="text"
                required
                maxLength={120}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Tailwind CSS Patterns"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description *</label>
              <textarea
                required
                minLength={10}
                maxLength={1000}
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="What does this skill do? Which tasks does it help with?"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Author *</label>
                <input
                  type="text"
                  required
                  maxLength={120}
                  value={form.author}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  placeholder="Your name or org"
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Category *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Repository URL *</label>
              <input
                type="url"
                required
                value={form.repo}
                onChange={(e) => setForm({ ...form, repo: e.target.value })}
                placeholder="https://github.com/username/repo"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Install Command *</label>
              <input
                type="text"
                required
                maxLength={500}
                value={form.installCommand}
                onChange={(e) => setForm({ ...form, installCommand: e.target.value })}
                placeholder="e.g. git clone https://github.com/user/repo.git ~/.claude/skills/"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Compatible Agents *</label>
              <div className="flex flex-wrap gap-2">
                {AGENTS.map((agent) => (
                  <button
                    type="button"
                    key={agent}
                    onClick={() => toggleAgent(agent)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                      selectedAgents.includes(agent)
                        ? 'bg-violet-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {agent}
                  </button>
                ))}
              </div>
              {selectedAgents.length === 0 && (
                <p className="text-xs text-gray-400 mt-1">Select at least one</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Tags</label>
              <input
                type="text"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
                placeholder="typescript, testing, debugging (comma-separated)"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-violet-600 text-white rounded-xl font-semibold text-sm hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                'Submit Skill'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
