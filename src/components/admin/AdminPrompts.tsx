import { useState, useEffect } from 'react';
import { Check, X, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

import { STATIC_PATTERNS } from '../../lib/fabricPatterns';
import { ANTHROPIC_PROMPTS } from '../../lib/anthropicPrompts';

interface Prompt {
  _id: string;
  title: string;
  description: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  userId: { name: string; email: string };
  createdAt: string;
}

const AdminPrompts = () => {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingPrompts();
  }, []);

  const [syncing, setSyncing] = useState(false);

  const fetchPendingPrompts = async () => {
    try {
      // We rely on the modified GET /api/prompts logic that lets admins filter
      const res = await fetch('/api/prompts?status=pending&limit=50');
      const data = await res.json();
      if (data.prompts) setPrompts(data.prompts);
    } catch (error) {
      console.error('Failed to fetch prompts', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async () => {
    const confirmSync = window.confirm("This will sync ALL static prompts from Fabric and Anthropic to the database. Continue?");
    if (!confirmSync) return;

    setSyncing(true);
    try {
        const payload = [
            ...STATIC_PATTERNS.map(p => ({
                title: p.title,
                content: p.systemPrompt,
                description: p.description,
                source: 'fabric',
                tags: ['fabric', 'ai', 'system'],
                rating: 0
            })),
            ...ANTHROPIC_PROMPTS.map(p => ({
                title: p.title,
                content: p.systemPrompt,
                description: p.description,
                source: 'anthropic',
                tags: ['anthropic', 'claude'],
                rating: 0
            }))
        ];

        const res = await fetch('/api/prompts/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompts: payload })
        });

        const data = await res.json();
        alert(data.message || 'Sync successful');
    } catch (err) {
        console.error("Sync failed", err);
        alert('Sync failed check console');
    } finally {
        setSyncing(false);
    }
  };

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/prompts/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (res.ok) {
        setPrompts(prev => prev.filter(p => p._id !== id));
      }
    } catch (error) {
      console.error('Update failed', error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-card p-6 rounded-lg border shadow-sm">
        <div>
            <h2 className="text-2xl font-bold tracking-tight">Prompt Moderation</h2>
            <p className="text-muted-foreground text-sm">Review pending submissions or sync ecosystem prompts.</p>
        </div>
        <div className="flex gap-4">
             <Button variant="outline" onClick={handleSync} disabled={syncing}>
                <RefreshCw className={`w-4 h-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Syncing...' : 'Sync Ecosystem'}
             </Button>
             <Badge variant="secondary" className="px-3 py-1 h-9 text-md">
                Pending: {prompts.length}
             </Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {prompts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-lg">
                No pending prompts to review.
            </div>
        ) : (
            prompts.map(prompt => (
            <Card key={prompt._id}>
                <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div>
                    <CardTitle className="text-lg">{prompt.title}</CardTitle>
                    <div className="text-sm text-muted-foreground mt-1">
                        by {prompt.userId?.name} ({prompt.userId?.email})
                    </div>
                </div>
                <Badge variant="outline">{prompt.status}</Badge>
                </CardHeader>
                <CardContent>
                <div className="bg-muted p-3 rounded-md text-sm font-mono whitespace-pre-wrap max-h-40 overflow-y-auto mb-4">
                    {prompt.content}
                </div>
                <div className="flex justify-end gap-2">
                    <Button 
                        size="sm" 
                        variant="destructive"
                        onClick={() => updateStatus(prompt._id, 'rejected')}
                    >
                    <X className="w-4 h-4 mr-1" /> Reject
                    </Button>
                    <Button 
                        size="sm" 
                        className="bg-green-600 hover:bg-green-700"
                        onClick={() => updateStatus(prompt._id, 'approved')}
                    >
                    <Check className="w-4 h-4 mr-1" /> Approve
                    </Button>
                </div>
                </CardContent>
            </Card>
            ))
        )}
      </div>
    </div>
  );
};

export default AdminPrompts;
