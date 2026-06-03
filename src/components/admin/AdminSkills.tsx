import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { CheckCircle, XCircle, ExternalLink, Loader2, Puzzle, Tag, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SkillSubmission {
  _id: string;
  name: string;
  description: string;
  author: string;
  repo: string;
  stars: number;
  installCommand: string;
  compatibleAgents: string[];
  category: string;
  tags: string[];
  submittedBy: {
    name: string;
    email: string;
  } | null;
  status: string;
  createdAt: string;
}

const categoryColors: Record<string, string> = {
  coding: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300',
  security: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300',
  design: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300',
  automation: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
  productivity: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
  infrastructure: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300',
  performance: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-300',
};

export default function AdminSkills() {
  const [submissions, setSubmissions] = useState<SkillSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  async function fetchSubmissions() {
    try {
      const res = await fetch('/api/admin/skills');
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (err) {
      console.error('Failed to fetch skill submissions', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleApprove(id: string) {
    setProcessingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/skills/${id}/approve`, { method: 'POST' });
      if (res.ok) {
        setSubmissions((prev) => prev.filter((s) => s._id !== id));
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Failed to approve (${res.status})`);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setProcessingId(null);
    }
  }

  async function handleReject(id: string) {
    setProcessingId(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/skills/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setSubmissions((prev) => prev.filter((s) => s._id !== id));
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.error || `Failed to reject (${res.status})`);
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setProcessingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Puzzle className="h-6 w-6 text-violet-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Skill Submissions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Review and approve agent skills submitted by the community
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {submissions.length === 0 ? (
        <Card className="p-12 text-center">
          <Puzzle className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No pending submissions</h3>
          <p className="text-gray-500 dark:text-gray-400">All caught up! New skill submissions will appear here.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => (
            <Card key={s._id} className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                      {s.name}
                    </h3>
                    <Badge variant="outline" className={`text-xs ${categoryColors[s.category] || ''}`}>
                      {s.category}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    by {s.author}
                    {s.submittedBy && (
                      <span className="ml-2 text-xs">
                        (submitted by {s.submittedBy.name})
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <Star className="h-4 w-4 text-amber-500" />
                  <span>{s.stars.toLocaleString()}</span>
                </div>
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                {s.description}
              </p>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {s.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-[10px] font-medium"
                  >
                    <Tag className="h-2.5 w-2.5 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {s.compatibleAgents.map((agent) => (
                  <span
                    key={agent}
                    className="inline-flex items-center px-2 py-0.5 rounded-full bg-violet-50 dark:bg-violet-500/10 text-violet-700 dark:text-violet-300 text-[10px] font-medium"
                  >
                    {agent}
                  </span>
                ))}
              </div>

              <code className="block text-xs font-mono bg-gray-50 dark:bg-gray-800 p-2 rounded-lg text-gray-600 dark:text-gray-400 mb-4 truncate">
                {s.installCommand}
              </code>

              <div className="flex items-center justify-between">
                <a
                  href={s.repo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  {s.repo.replace('https://github.com/', '')}
                </a>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleReject(s._id)}
                    disabled={processingId === s._id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10"
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    Reject
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleApprove(s._id)}
                    disabled={processingId === s._id}
                  >
                    {processingId === s._id ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4 mr-1" />
                    )}
                    Approve
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
