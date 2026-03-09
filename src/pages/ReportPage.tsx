import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  Download, 
  Filter, 
  Calendar,
  Search,
  FileText,
  TrendingUp,
  PieChart,
  Loader2
} from 'lucide-react';
import { cn } from '../lib/utils';

interface ReportPageProps {
  title: string;
  type: 'complaints' | 'assessment' | 'performance' | 'feedback';
}

export function ReportPage({ title, type }: ReportPageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setIsLoading(true);
    if (type === 'performance') {
      fetch('/api/admin/users/performance')
        .then(res => res.json())
        .then(stats => {
          setData(stats.map((s: any) => ({
            id: s.id,
            date: 'N/A',
            metric: s.name,
            role: s.role,
            center: s.tax_center_name,
            complaint_count: s.complaint_count,
            value: ((Math.random() * 20 + 75).toFixed(1) + '%'), // Keep some mock metrics for variety
            status: s.complaint_count > 5 ? 'High Load' : 'Optimal',
            trend: Math.random() > 0.5 ? 'up' : 'down'
          })));
          setIsLoading(false);
        })
        .catch(err => {
          console.error(err);
          setIsLoading(false);
        });
    } else {
      // Simulate loading report data for other types
      const timer = setTimeout(() => {
        const mockData = Array.from({ length: 10 }).map((_, i) => ({
          id: i + 1,
          date: new Date(Date.now() - i * 86400000).toLocaleDateString(),
          metric: type === 'complaints' ? 'Total Complaints' : 
                  type === 'assessment' ? 'Avg Assessment Time' : 'Satisfaction Score',
          value: type === 'complaints' ? Math.floor(Math.random() * 50) + 10 :
                 type === 'assessment' ? (Math.random() * 5 + 2).toFixed(1) + ' days' :
                 (Math.random() * 2 + 3).toFixed(1) + '/5',
          status: Math.random() > 0.3 ? 'On Track' : 'Needs Attention',
          trend: Math.random() > 0.5 ? 'up' : 'down'
        }));
        setData(mockData);
        setIsLoading(false);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [type]);

  const filteredData = data.filter(item => {
    const searchLower = searchTerm.toLowerCase();
    if (type === 'performance') {
      return (
        item.metric?.toLowerCase().includes(searchLower) ||
        item.role?.toLowerCase().includes(searchLower) ||
        item.center?.toLowerCase().includes(searchLower)
      );
    }
    return (
      item.metric?.toLowerCase().includes(searchLower) ||
      item.date?.toLowerCase().includes(searchLower) ||
      item.status?.toLowerCase().includes(searchLower) ||
      item.value?.toString().toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="bg-white rounded-[2.5rem] border border-sky-100 shadow-sm p-8 md:p-12 min-h-full">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-sky-900 tracking-tight italic serif">{title}</h1>
            <p className="text-sky-500 mt-2">Detailed analytical view of {type} metrics and trends.</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-sky-50 border border-sky-200 rounded-xl text-sm font-bold text-sky-600 hover:bg-sky-100 transition-all">
              <Filter size={18} /> Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-200">
              <Download size={18} /> Export PDF
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-sky-50 p-6 rounded-3xl border border-sky-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-sky-100 rounded-xl flex items-center justify-center text-sky-600">
                <TrendingUp size={20} />
              </div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">+12% vs last month</span>
            </div>
            <p className="text-xs font-bold text-sky-400 uppercase tracking-widest">Growth Rate</p>
            <p className="text-2xl font-bold text-sky-900 mt-1">Positive Trend</p>
          </div>
          <div className="bg-sky-50 p-6 rounded-3xl border border-sky-100">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                <PieChart size={20} />
              </div>
              <span className="text-[10px] font-bold text-sky-400 bg-sky-100 px-2 py-1 rounded-lg">Stable</span>
            </div>
            <p className="text-xs font-bold text-sky-400 uppercase tracking-widest">Distribution</p>
            <p className="text-2xl font-bold text-sky-900 mt-1">Balanced Load</p>
          </div>
          <div className="bg-sky-600 p-6 rounded-3xl text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white">
                <BarChart3 size={20} />
              </div>
              <span className="text-[10px] font-bold text-sky-100 bg-sky-500/20 px-2 py-1 rounded-lg">Live Data</span>
            </div>
            <p className="text-xs font-bold text-sky-100 uppercase tracking-widest">Current Status</p>
            <p className="text-2xl font-bold mt-1 text-white">Optimal Performance</p>
          </div>
        </div>

        <div className="bg-sky-50 rounded-3xl border border-sky-100 overflow-hidden">
          <div className="p-6 border-b border-sky-200 bg-sky-100/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400" size={18} />
              <input 
                type="text" 
                placeholder="Search report entries..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-sky-200 rounded-xl text-sm focus:ring-1 focus:ring-sky-500 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-sky-500">
              <Calendar size={16} />
              <span>Last 30 Days</span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-sky-100/50 text-sky-400 text-[10px] font-bold uppercase tracking-widest border-b border-sky-200">
                  <th className="px-6 py-4">{type === 'performance' ? 'User ID' : 'Report ID'}</th>
                  <th className="px-6 py-4">{type === 'performance' ? 'User Name' : 'Date'}</th>
                  <th className="px-6 py-4">{type === 'performance' ? 'Role / Center' : 'Metric Category'}</th>
                  {type === 'performance' && <th className="px-6 py-4">Complaints Count</th>}
                  <th className="px-6 py-4">{type === 'performance' ? 'Resolution Rate' : 'Value'}</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Trend</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-sky-600 mx-auto" />
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={type === 'performance' ? 7 : 6} className="px-6 py-12 text-center text-sky-400">
                      No report entries found matching your search.
                    </td>
                  </tr>
                ) : filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-white transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-sky-400" />
                        <span className="text-sm font-bold text-sky-900">
                          {type === 'performance' ? `USR-${item.id.toString().padStart(4, '0')}` : `REP-${item.id.toString().padStart(4, '0')}`}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-sky-600">{type === 'performance' ? item.metric : item.date}</td>
                    <td className="px-6 py-4 text-sm text-sky-600 font-medium">
                      {type === 'performance' ? (
                        <div className="flex flex-col">
                          <span>{item.role}</span>
                          <span className="text-[10px] text-sky-400">{item.center}</span>
                        </div>
                      ) : item.metric}
                    </td>
                    {type === 'performance' && (
                      <td className="px-6 py-4 text-sm font-bold text-sky-600">
                        {item.complaint_count}
                      </td>
                    )}
                    <td className="px-6 py-4 text-sm font-bold text-sky-900">{item.value}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border",
                        item.status === 'On Track' ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"
                      )}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className={cn(
                        "inline-flex items-center gap-1 text-xs font-bold",
                        item.trend === 'up' ? "text-emerald-600" : "text-red-600"
                      )}>
                        {item.trend === 'up' ? '↑' : '↓'}
                        {item.trend === 'up' ? 'Improving' : 'Declining'}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
