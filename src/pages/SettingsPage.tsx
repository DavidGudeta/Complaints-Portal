import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Plus, 
  Edit2, 
  Trash2, 
  Search,
  X,
  Save,
  Loader2,
  AlertCircle,
  Tag,
  Activity
} from 'lucide-react';
import { cn } from '../lib/utils';

interface SettingsPageProps {
  title: string;
  type: 'categories' | 'subcategories' | 'status';
}

export function SettingsPage({ title, type }: SettingsPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]); // For subcategory parent selection
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    description: '', 
    color: '#3b82f6',
    parent_id: '' 
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (type === 'status') {
        const statuses = [
          { id: 'PENDING', name: 'PENDING', description: 'Initial state of a complaint', color: '#f59e0b' },
          { id: 'ASSIGNED', name: 'ASSIGNED', description: 'Complaint assigned to an officer', color: '#3b82f6' },
          { id: 'IN_PROGRESS', name: 'IN_PROGRESS', description: 'Officer is working on the case', color: '#8b5cf6' },
          { id: 'RESOLVED', name: 'RESOLVED', description: 'Case has been resolved', color: '#10b981' },
          { id: 'CLOSED', name: 'CLOSED', description: 'Case is officially closed', color: '#6b7280' },
        ];
        setData(statuses);
      } else {
        const endpoint = type === 'categories' ? '/api/admin/categories' : '/api/admin/subcategories';
        const res = await fetch(endpoint);
        const result = await res.json();
        setData(result);

        if (type === 'subcategories') {
          const catRes = await fetch('/api/admin/categories');
          const catResult = await catRes.json();
          setCategories(catResult);
        }
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [type]);

  const handleOpenModal = (item: any = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name || '',
        description: item.description || '',
        color: item.color || '#3b82f6',
        parent_id: item.parent_id || ''
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: '',
        description: '',
        color: '#3b82f6',
        parent_id: ''
      });
    }
    setIsModalOpen(true);
    setError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      color: '#3b82f6',
      parent_id: ''
    });
    setError(null);
  };

  const handleSave = async () => {
    if (!formData.name) {
      setError('Name is required');
      return;
    }
    if (type === 'subcategories' && !formData.parent_id) {
      setError('Parent category is required');
      return;
    }

    setIsSaving(true);
    setError(null);
    try {
      const endpoint = type === 'subcategories' ? '/api/admin/subcategories' : '/api/admin/categories';
      const method = editingItem ? 'PATCH' : 'POST';
      const url = editingItem ? `${endpoint}/${editingItem.id}` : endpoint;

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          ...(type === 'subcategories' && { 
            category_name: categories.find(c => c.id === formData.parent_id)?.name || ''
          })
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchData();
      } else {
        const errData = await res.json();
        setError(errData.message || 'Failed to save');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      const endpoint = type === 'subcategories' ? '/api/admin/subcategories' : '/api/admin/categories';
      const res = await fetch(`${endpoint}/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchData();
      } else {
        const errData = await res.json();
        alert(errData.message || 'Failed to delete');
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filteredData = data.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.name?.toLowerCase().includes(searchLower) ||
      item.description?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="bg-white rounded-[2.5rem] border border-sky-100 shadow-sm p-8 md:p-12 min-h-full">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-sky-900 tracking-tight italic serif">{title}</h1>
            <p className="text-sky-500 mt-2">Configure and manage system {type} definitions.</p>
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-2 px-6 py-3 bg-sky-600 text-white rounded-2xl font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-200"
          >
            <Plus size={20} /> Add New {type === 'categories' ? 'Category' : 'Status'}
          </button>
        </div>

        <div className="bg-sky-50 rounded-3xl border border-sky-100 overflow-hidden">
          <div className="p-6 border-b border-sky-200 bg-sky-100/50">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400" size={18} />
              <input 
                type="text" 
                placeholder={`Search ${type}...`} 
                className="w-full pl-10 pr-4 py-2 bg-white border border-sky-200 rounded-xl text-sm focus:ring-1 focus:ring-sky-500 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-sky-100/50 text-sky-400 text-[10px] font-bold uppercase tracking-widest border-b border-sky-200">
                  <th className="px-6 py-4">Name</th>
                  {type === 'categories' && <th className="px-6 py-4">Subcategories</th>}
                  {type === 'subcategories' && <th className="px-6 py-4">Category</th>}
                  <th className="px-6 py-4">Description</th>
                  <th className="px-6 py-4">Visual Tag</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={type === 'subcategories' || type === 'categories' ? 5 : 4} className="px-6 py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-sky-600 mx-auto" />
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={type === 'subcategories' || type === 'categories' ? 5 : 4} className="px-6 py-12 text-center text-sky-400">
                      No {type} found matching your search.
                    </td>
                  </tr>
                ) : filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-white transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white border border-sky-100 flex items-center justify-center shadow-sm">
                          {type === 'categories' || type === 'subcategories' ? <Tag size={18} className="text-sky-600" /> : <Activity size={18} className="text-sky-600" />}
                        </div>
                        <p className="text-sm font-bold text-sky-900">{item.name}</p>
                      </div>
                    </td>
                    {type === 'categories' && (
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-sky-50 text-sky-600 rounded-lg text-xs font-bold">
                          {item.subcategory_count || 0} Subcategories
                        </span>
                      </td>
                    )}
                    {type === 'subcategories' && (
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-sky-100 text-sky-600 rounded-lg text-xs font-medium">
                          {item.category_name}
                        </span>
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm text-sky-600 max-w-xs truncate">
                      {item.description || 'No description provided.'}
                    </td>
                    <td className="px-6 py-4">
                      <span 
                        className="px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border"
                        style={{ 
                          backgroundColor: `${item.color}10`, 
                          color: item.color, 
                          borderColor: `${item.color}30` 
                        }}
                      >
                        {item.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(item)}
                          className="p-2 text-sky-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-all"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-sky-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Placeholder */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-sky-950/20 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-sky-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-sky-50 flex items-center justify-between bg-sky-50/50">
              <h2 className="text-xl font-bold text-sky-900 italic serif">
                {editingItem ? `Edit ${type === 'categories' ? 'Category' : type === 'subcategories' ? 'Subcategory' : 'Status'}` : `Add New ${type === 'categories' ? 'Category' : type === 'subcategories' ? 'Subcategory' : 'Status'}`}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-sky-400 hover:text-sky-900 transition-colors">
                <X size={20} />
              </button>
            </div>
            <div className="p-8 space-y-6">
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm">
                  <AlertCircle size={18} />
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-sky-500 uppercase tracking-widest">Name</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 bg-sky-50 border border-sky-200 rounded-xl focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter name"
                />
              </div>

              {type === 'subcategories' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold text-sky-500 uppercase tracking-widest">Parent Category</label>
                  <select 
                    className="w-full px-4 py-3 bg-sky-50 border border-sky-200 rounded-xl focus:ring-1 focus:ring-sky-500 outline-none transition-all"
                    value={formData.parent_id}
                    onChange={e => setFormData({ ...formData, parent_id: e.target.value })}
                  >
                    <option value="">Select a category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold text-sky-500 uppercase tracking-widest">Description</label>
                <textarea 
                  className="w-full px-4 py-3 bg-sky-50 border border-sky-200 rounded-xl focus:ring-1 focus:ring-sky-500 outline-none transition-all h-24 resize-none"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter description (optional)"
                />
              </div>

              <div className="flex gap-3 pt-6">
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 bg-sky-50 text-sky-600 rounded-2xl font-bold hover:bg-sky-100 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex-1 py-4 bg-sky-600 text-white rounded-2xl font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-200 flex items-center justify-center gap-2"
                >
                  {isSaving && <Loader2 size={18} className="animate-spin" />}
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
