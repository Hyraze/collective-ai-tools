import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function AdminUsers() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/admin/users')
            .then(res => res.json())
            .then(data => {
                setUsers(data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    if (loading) return <div>Loading users...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
            <div className="space-y-4">
                {users.map(user => (
                    <Card key={user._id}>
                        <CardContent className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <img src={user.avatar} className="w-10 h-10 rounded-full" alt="" />
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{user.name}</h3>
                                    <p className="text-sm text-gray-500">{user.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                                    {user.role}
                                </Badge>
                                <span className="text-sm text-gray-400">
                                    Joined: {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
