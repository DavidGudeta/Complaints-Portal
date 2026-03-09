import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Search, 
  Calendar, 
  User, 
  ArrowRight,
  Filter,
  Download,
  Shield
} from 'lucide-react';
import { ComplaintResponse } from '../types';
import { formatDate, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface ResponseListProps {
  title: string;
}

export function ResponseList({ title }: ResponseListProps) {
  const navigate = useNavigate();
  const [responses, setResponses] = useState<ComplaintResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchResponses();
  }, []);

  const fetchResponses = async () => {
    try {
      const res = await fetch('/api/internal/complaints/responses');
      const data = await res.json();
      setResponses(data);
    } catch (error) {
      console.error('Failed to fetch responses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredResponses = responses.filter(r => {
    const searchLower = searchTerm.toLowerCase();
    return (
      r.tracking_code?.toLowerCase().includes(searchLower) ||
      r.complainant_name?.toLowerCase().includes(searchLower) ||
      r.user_name.toLowerCase().includes(searchLower) ||
      r.message.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="bg-white rounded-[2.5rem] border border-sky-100 shadow-sm p-8 md:p-12 min-h-full">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-sky-900 tracking-tight italic serif">{title}</h1>
            <p className="text-sky-500 mt-2">Manage and review all case responses and communications.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-sky-50 border border-sky-200 rounded-xl text-sm font-bold text-sky-600 hover:bg-sky-100 transition-all">
              <Filter size={16} /> Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-sky-600 text-white rounded-xl text-sm font-bold hover:bg-sky-700 transition-all shadow-lg shadow-sky-100">
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        <div className="bg-sky-50 rounded-3xl border border-sky-100 overflow-hidden">
          <div className="p-6 border-b border-sky-200 bg-sky-100/50">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400" size={18} />
              <input 
                type="text" 
                placeholder="Search responses..." 
                className="w-full pl-10 pr-4 py-2 bg-white border border-sky-200 rounded-xl text-sm focus:ring-1 focus:ring-sky-500 transition-all outline-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-sky-100/50 border-b border-sky-200">
                  <th className="px-6 py-4 text-[10px] font-bold text-sky-400 uppercase tracking-widest">Case ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-sky-400 uppercase tracking-widest">Sender</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-sky-400 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-sky-400 uppercase tracking-widest">Message</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-sky-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-sky-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-200">
                {isLoading ? (
                  [1, 2, 3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={6} className="px-6 py-8">
                        <div className="h-4 bg-sky-200 rounded w-full" />
                      </td>
                    </tr>
                  ))
                ) : filteredResponses.length > 0 ? (
                  filteredResponses.map((r, i) => (
                    <motion.tr 
                      key={r.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => navigate(`/cases/detail/${r.tracking_code}`)}
                      className="hover:bg-white transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-5 font-mono font-bold text-sky-900">{r.tracking_code}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center text-[10px] font-bold text-sky-600">
                            {r.user_name.charAt(0)}
                          </div>
                          <span className="text-xs font-medium text-sky-700">{r.user_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-[10px] font-bold text-sky-400 uppercase tracking-wider bg-sky-100 px-1.5 py-0.5 rounded">
                          {r.user_role}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-xs text-sky-500 max-w-md truncate italic">{r.message}</td>
                      <td className="px-6 py-5 text-xs text-sky-900">{formatDate(r.created_at)}</td>
                      <td className="px-6 py-5 text-right">
                        <button className="p-2 text-sky-400 hover:text-sky-900 hover:bg-sky-100 rounded-lg transition-all">
                          <ArrowRight size={16} />
                        </button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-20 text-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-sky-300 border border-sky-100">
                        <MessageSquare size={32} />
                      </div>
                      <p className="text-sky-400 font-medium">No responses found.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
