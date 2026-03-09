import React, { useState, useEffect } from 'react';
import { 
  ClipboardCheck, 
  Search, 
  Calendar, 
  User, 
  ArrowRight,
  Filter,
  Download,
  Hash
} from 'lucide-react';
import { Assessment } from '../types';
import { formatDate, cn } from '../lib/utils';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';

interface AssessmentListProps {
  title: string;
}

export function AssessmentList({ title }: AssessmentListProps) {
  const navigate = useNavigate();
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      const res = await fetch('/api/internal/complaints/assessments');
      const data = await res.json();
      setAssessments(data);
    } catch (error) {
      console.error('Failed to fetch assessments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAssessments = assessments.filter(a => {
    const searchLower = searchTerm.toLowerCase();
    return (
      a.tracking_code.toLowerCase().includes(searchLower) ||
      a.complainant_name.toLowerCase().includes(searchLower) ||
      a.assessor_name.toLowerCase().includes(searchLower) ||
      a.findings.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="bg-white rounded-[2.5rem] border border-sky-100 shadow-sm p-8 md:p-12 min-h-full">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-sky-900 tracking-tight italic serif">{title}</h1>
            <p className="text-sky-500 mt-2">Review all assessment findings and recommendations.</p>
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
                placeholder="Search assessments..." 
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
                  <th className="px-6 py-4 text-[10px] font-bold text-sky-400 uppercase tracking-widest">Complainant</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-sky-400 uppercase tracking-widest">Assessor</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-sky-400 uppercase tracking-widest">Findings</th>
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
                ) : filteredAssessments.length > 0 ? (
                  filteredAssessments.map((a, i) => (
                    <motion.tr 
                      key={a.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => navigate(`/cases/detail/${a.tracking_code}`)}
                      className="hover:bg-white transition-colors group cursor-pointer"
                    >
                      <td className="px-6 py-5 font-mono font-bold text-sky-900">{a.tracking_code}</td>
                      <td className="px-6 py-5 text-sm font-bold text-sky-900">{a.complainant_name}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center text-[10px] font-bold text-sky-600">
                            {a.assessor_name.charAt(0)}
                          </div>
                          <span className="text-xs font-medium text-sky-700">{a.assessor_name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-xs text-sky-500 max-w-md truncate italic">{a.findings}</td>
                      <td className="px-6 py-5 text-xs text-sky-900">{formatDate(a.created_at)}</td>
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
                        <ClipboardCheck size={32} />
                      </div>
                      <p className="text-sky-400 font-medium">No assessments found.</p>
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
