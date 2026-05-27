import { useEffect, useState } from 'react';
import AdminDataTable from '../AdminDataTable';

export default function AdminLanguages() {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [params, setParams] = useState({ page: 1, search: '', sortBy: 'name', order: 'asc' });

  useEffect(() => {
    fetchData();
  }, [params]);

  async function fetchData() {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: params.page.toString(),
        limit: '10',
        search: params.search,
        sortBy: params.sortBy,
        order: params.order
      });
      const res = await fetch(`/api/admin/languages?${query}`);
      const result = await res.json();
      setData(result.data);
      setPagination(result.pagination);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  const columns = [
    { key: 'name', label: 'Name', sortable: true },
    { key: 'slug', label: 'Slug', sortable: true },
    { key: 'icon', label: 'Icon' }
  ];

  return (
    <AdminDataTable
      title="Languages"
      columns={columns}
      data={data}
      pagination={pagination}
      isLoading={loading}
      onPageChange={(p) => setParams(prev => ({ ...prev, page: p }))}
      onSearch={(q) => setParams(prev => ({ ...prev, search: q, page: 1 }))}
      onSort={(key) => setParams(prev => ({ ...prev, sortBy: key, order: prev.order === 'asc' ? 'desc' : 'asc' }))}
      onAdd={() => alert('Add functionality coming next!')}
    />
  );
}
