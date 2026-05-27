import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, Wrench, ExternalLink } from 'lucide-react';

export default function AdminResources() {
    const [resources, setResources] = useState<{ tools: any[], servers: any[] }>({ tools: [], servers: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/resources')
            .then(res => res.json())
            .then(data => {
                setResources(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading resources...</div>;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">MCP Servers ({resources.servers.length})</h2>
                <div className="space-y-4">
                    {resources.servers.map(server => (
                        <ResourceCard key={server._id} item={server} type="mcp" />
                    ))}
                </div>
            </div>
            
            <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">AI Tools ({resources.tools.length})</h2>
                <div className="space-y-4">
                    {resources.tools.map(tool => (
                        <ResourceCard key={tool._id} item={tool} type="tool" />
                    ))}
                </div>
            </div>
        </div>
    );
}

function ResourceCard({ item, type }: { item: any, type: 'mcp' | 'tool' }) {
    return (
        <Card>
            <CardContent className="p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <Badge variant={type === 'mcp' ? 'default' : 'secondary'} className="flex items-center gap-1 w-fit">
                            {type === 'mcp' ? <Code className="h-3 w-3" /> : <Wrench className="h-3 w-3" />}
                            {type === 'mcp' ? 'MCP' : 'Tool'}
                        </Badge>
                        <h3 className="font-bold text-gray-900 dark:text-white">{item.name}</h3>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-1">{item.description}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">
                        <ExternalLink className="h-4 w-4" />
                    </a>
                    {/* Add Edit/Delete buttons here later */}
                </div>
            </CardContent>
        </Card>
    );
}
