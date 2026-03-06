import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  Clock, 
  MessageSquare, 
  FileText, 
  History, 
  ChevronRight,
  Loader2,
  AlertCircle,
  Send,
  CheckCircle2,
  User,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Complaint, ComplaintResponse, ComplaintStatus } from '../types';
import { formatDate, cn } from '../lib/utils';

export function TrackComplaint() {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [isSearching, setIsSearching] = useState(false);
  const [complaint, setComplaint] = useState<(Complaint & { responses: ComplaintResponse[] }) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!code) return;
    
    setIsSearching(true);
    setError(null);
    try {
      const response = await fetch(`/api/complaints/track/${code}`);
      if (response.ok) {
        const data = await response.json();
        setComplaint(data);
      } else {
        setError('Tracking code not found. Please check and try again.');
        setComplaint(null);
      }
    } catch (err) {
      setError('An error occurred. Please try again later.');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('code')) {
      handleSearch();
    }
  }, []);

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case ComplaintStatus.PENDING: return 'bg-amber-100 text-amber-700 border-amber-200';
      case ComplaintStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700 border-blue-200';
      case ComplaintStatus.CLOSED: return 'bg-zinc-100 text-zinc-700 border-zinc-200';
      case ComplaintStatus.APPROVED: return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-zinc-100 text-zinc-700 border-zinc-200';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-zinc-900 transition-colors">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-zinc-900 tracking-tight mb-2 italic serif">Track Your Complaint</h1>
          <p className="text-zinc-500">Enter your unique tracking code to view the status and history of your case.</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-blue-600 transition-colors">
              <Search size={24} />
            </div>
            <input
              type="text"
              placeholder="Enter Tracking Code (e.g. CMP-XXXXXX)"
              className="w-full pl-16 pr-40 py-5 bg-white border-2 border-zinc-100 rounded-3xl shadow-xl shadow-zinc-200/50 focus:border-blue-600 focus:ring-0 transition-all text-xl font-mono tracking-wider"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
            />
            <button
              type="submit"
              disabled={!code || isSearching}
              className="absolute right-3 top-3 bottom-3 px-8 bg-zinc-950 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {isSearching ? <Loader2 className="animate-spin" size={20} /> : 'Track Case'}
            </button>
          </form>
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-4 rounded-2xl border border-red-100"
            >
              <AlertCircle size={20} />
              <span className="text-sm font-medium">{error}</span>
            </motion.div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {complaint && (
            <motion.div
              key="complaint-details"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-1 lg:grid-cols-3 gap-8"
            >
              {/* Left Column: Status & Details */}
              <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-lg shadow-zinc-200/50">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-zinc-900">Case Status</h2>
                    <span className={cn("px-3 py-1 rounded-full text-xs font-bold border", getStatusColor(complaint.status))}>
                      {complaint.status}
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-zinc-500">
                      <Clock size={18} />
                      <span className="text-sm">Submitted on {formatDate(complaint.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-3 text-zinc-500">
                      <FileText size={18} />
                      <span className="text-sm">{complaint.category_name}</span>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-zinc-50">
                    <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-widest mb-4">Description</h3>
                    <p className="text-zinc-600 text-sm leading-relaxed">
                      {complaint.description}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-200">
                  <h3 className="text-lg font-bold mb-2">Need Help?</h3>
                  <p className="text-blue-100 text-sm mb-6">Our support team is available 24/7 to assist you with your case.</p>
                  <button className="w-full py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-colors">
                    Contact Support
                  </button>
                </div>
              </div>

              {/* Right Column: Timeline & Feedback */}
              <div className="lg:col-span-2 space-y-8">
                <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-lg shadow-zinc-200/50">
                  <div className="flex items-center gap-3 mb-8">
                    <History className="text-blue-600" size={24} />
                    <h2 className="text-xl font-bold text-zinc-900">Response History</h2>
                  </div>

                  <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-100">
                    {complaint.responses.length > 0 ? (
                      complaint.responses.map((res, i) => (
                        <div key={res.id} className="relative pl-12">
                          <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center z-10">
                            <User size={16} className="text-blue-600" />
                          </div>
                          <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-zinc-900">{res.user_name}</span>
                              <span className="text-xs text-zinc-400">{formatDate(res.created_at)}</span>
                            </div>
                            <p className="text-zinc-600 text-sm leading-relaxed mb-4">{res.message}</p>
                            <div className="flex items-center gap-2">
                              <span className="px-2 py-0.5 bg-zinc-200 text-zinc-600 rounded text-[10px] font-bold uppercase tracking-wider">
                                {res.user_role.replace('_', ' ')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-300">
                          <MessageSquare size={32} />
                        </div>
                        <p className="text-zinc-400 font-medium">No responses yet. We'll notify you when an officer updates your case.</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Feedback Feature */}
                <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-lg shadow-zinc-200/50">
                  <h2 className="text-xl font-bold text-zinc-900 mb-6">Follow-up or Feedback</h2>
                  <div className="relative">
                    <textarea
                      rows={4}
                      placeholder="Type your message here..."
                      className="w-full p-6 bg-zinc-50 border border-zinc-200 rounded-2xl focus:border-blue-600 focus:ring-0 transition-all resize-none"
                      value={feedback}
                      onChange={e => setFeedback(e.target.value)}
                    />
                    <button 
                      disabled={!feedback}
                      className="absolute right-4 bottom-4 p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 shadow-lg shadow-blue-200"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                  <p className="mt-4 text-xs text-zinc-400">
                    Your message will be sent directly to the officer assigned to your case.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
