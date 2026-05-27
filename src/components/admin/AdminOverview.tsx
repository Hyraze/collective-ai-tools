import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Users, FileText, Code, Wrench } from 'lucide-react';

interface Stats {
  users: number;
  submissions: number;
  tools: number;
  servers: number;
  recentSubmissions: any[];
}

export default function AdminOverview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Todo: Fetch actual stats
  useEffect(() => {
    async function fetchStats() {
        try {
            const res = await fetch('/api/admin/stats');
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error('Failed to fetch stats', error);
        } finally {
            setLoading(false);
        }
    }
    
    fetchStats();
  }, []);

  if (loading) return <div>Loading stats...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          title="Total Users" 
          value={stats?.users || 0} 
          icon={Users} 
          color="blue" 
        />
        <StatsCard 
          title="Pending Submissions" 
          value={stats?.submissions || 0} 
          icon={FileText} 
          color="yellow" 
        />
        <StatsCard 
          title="Active Tools" 
          value={stats?.tools || 0} 
          icon={Wrench} 
          color="green" 
        />
        <StatsCard 
          title="MCP Servers" 
          value={stats?.servers || 0} 
          icon={Code} 
          color="purple" 
        />
      </div>

      {/* Recent Activity or Charts could go here */}
    </div>
  );
}

function StatsCard({ title, value, icon: Icon, color }: any) {
    const colorClasses: any = {
        blue: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
        yellow: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400",
        green: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400",
        purple: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    };

    return (
        <Card>
            <CardContent className="p-6 flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{title}</p>
                    <h3 className="text-3xl font-bold text-gray-900 dark:text-white">{value}</h3>
                </div>
                <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </CardContent>
        </Card>
    );
}
