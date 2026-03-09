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
  ArrowLeft,
  Upload,
  File
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Complaint, ComplaintResponse, ComplaintStatus } from '../types';
import { formatDate, cn } from '../lib/utils';

export function TrackComplaint() {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState(searchParams.get('code') || '');
  const [isSearching, setIsSearching] = useState(false);
  const [complaint, setComplaint] = useState<(Complaint & { responses: ComplaintResponse[], attachments: any[] }) | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);

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

  const handleFeedbackSubmit = async () => {
    if (!feedback || !complaint) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/complaints/track/feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracking_code: complaint.tracking_code,
          message: feedback
        })
      });

      if (response.ok) {
        setFeedback('');
        // Refresh complaint data to show the new response
        handleSearch();
      } else {
        alert('Failed to send feedback. Please try again.');
      }
    } catch (err) {
      alert('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = async () => {
    if (selectedFiles.length === 0 || !complaint) return;

    setIsUploading(true);
    const formData = new FormData();
    selectedFiles.forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`/api/complaints/track/${complaint.tracking_code}/attachments`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setSelectedFiles([]);
        alert('Documents uploaded successfully!');
        handleSearch();
      } else {
        alert('Failed to upload documents. Please try again.');
      }
    } catch (err) {
      alert('An error occurred during upload.');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (searchParams.get('code')) {
      handleSearch();
    }
  }, []);

  const getStatusStep = (status: ComplaintStatus) => {
    switch (status) {
      case ComplaintStatus.PENDING: return 1;
      case ComplaintStatus.ASSIGNED: return 2;
      case ComplaintStatus.IN_PROGRESS:
      case ComplaintStatus.ASSESSED:
      case ComplaintStatus.RESPONDED: return 3;
      case ComplaintStatus.APPROVED:
      case ComplaintStatus.CLOSED: return 4;
      default: return 1;
    }
  };

  const getStatusColor = (status: ComplaintStatus) => {
    switch (status) {
      case ComplaintStatus.PENDING: return 'bg-amber-100 text-amber-700 border-amber-200';
      case ComplaintStatus.IN_PROGRESS: return 'bg-sky-100 text-sky-700 border-sky-200';
      case ComplaintStatus.CLOSED: return 'bg-sky-50 text-sky-700 border-sky-100';
      case ComplaintStatus.APPROVED: return 'bg-sky-100 text-sky-700 border-sky-200';
      default: return 'bg-sky-50 text-sky-700 border-sky-100';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-sky-400 hover:text-sky-900 transition-colors">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-sky-900 tracking-tight mb-2 italic serif">Track Your Complaint</h1>
          <p className="text-sky-500">Enter your unique tracking code to view the status and history of your case.</p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-12">
          <form onSubmit={handleSearch} className="relative group">
            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-sky-400 group-focus-within:text-sky-600 transition-colors">
              <Search size={24} />
            </div>
            <input
              type="text"
              placeholder="Enter Tracking Code (e.g. CMP-XXXXXX)"
              className="w-full pl-16 pr-40 py-5 bg-white border-2 border-sky-100 rounded-3xl shadow-xl shadow-sky-200/50 focus:border-sky-600 focus:ring-0 transition-all text-xl font-mono tracking-wider"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
            />
            <button
              type="submit"
              disabled={!code || isSearching}
              className="absolute right-3 top-3 bottom-3 px-8 bg-sky-600 text-white rounded-2xl font-bold hover:bg-sky-700 transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-sky-100"
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
              className="space-y-8"
            >
              {/* 1. Complaints Status Panel */}
              <div className="bg-white rounded-3xl p-8 border border-sky-100 shadow-lg shadow-sky-200/50">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center">
                    <CheckCircle2 size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-sky-900">1. Complaint Status</h2>
                </div>

                <div className="flex justify-between mb-8 relative px-4">
                  <div className="absolute top-1/2 left-0 w-full h-1 bg-sky-100 -translate-y-1/2 z-0" />
                  <div 
                    className="absolute top-1/2 left-0 h-1 bg-sky-600 -translate-y-1/2 z-0 transition-all duration-1000" 
                    style={{ width: `${((getStatusStep(complaint.status) - 1) / 3) * 100}%` }}
                  />
                  {[
                    { label: 'Submitted', icon: <FileText size={20} /> },
                    { label: 'Assigned', icon: <User size={20} /> },
                    { label: 'In Review', icon: <Clock size={20} /> },
                    { label: 'Resolved', icon: <CheckCircle2 size={20} /> }
                  ].map((s, i) => (
                    <div key={i} className="relative z-10 flex flex-col items-center">
                      <div className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500",
                        getStatusStep(complaint.status) > i 
                          ? "bg-sky-600 text-white shadow-lg shadow-sky-200" 
                          : getStatusStep(complaint.status) === i + 1
                            ? "bg-sky-600 text-white shadow-lg shadow-sky-200"
                            : "bg-white text-sky-300 border-2 border-sky-100"
                      )}>
                        {s.icon}
                      </div>
                      <span className={cn(
                        "text-xs font-bold mt-3 uppercase tracking-widest",
                        getStatusStep(complaint.status) >= i + 1 ? "text-sky-600" : "text-sky-400"
                      )}>{s.label}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-4 pt-4 border-t border-sky-50">
                  <span className="text-sm text-sky-500">Current Status:</span>
                  <span className={cn("px-4 py-1.5 rounded-full text-sm font-bold border", getStatusColor(complaint.status))}>
                    {complaint.status}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* 2. Complaints Details Panel */}
                <div className="bg-white rounded-3xl p-8 border border-sky-100 shadow-lg shadow-sky-200/50">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-sky-50 text-sky-900 rounded-xl flex items-center justify-center">
                      <FileText size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-sky-900">2. Complaint Details</h2>
                  </div>

                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100">
                        <p className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mb-1">Tracking Code</p>
                        <p className="text-sky-900 font-mono font-bold">{complaint.tracking_code}</p>
                      </div>
                      <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100">
                        <p className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mb-1">TIN Number</p>
                        <p className="text-sky-900 font-bold">{complaint.tin}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100">
                      <p className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mb-1">Category</p>
                      <p className="text-sky-900 font-bold">{complaint.category_name}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-sky-900 mb-2">Subject</h3>
                      <p className="text-sky-600 bg-sky-50 p-4 rounded-2xl border border-sky-100">{complaint.subject}</p>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-sky-900 mb-2">Description</h3>
                      <div className="text-sky-600 text-sm leading-relaxed bg-sky-50 p-6 rounded-2xl border border-sky-100">
                        {complaint.description}
                      </div>
                    </div>

                    {complaint.attachments && complaint.attachments.length > 0 && (
                      <div>
                        <h3 className="text-sm font-bold text-sky-900 mb-3">Initial Attachments</h3>
                        <div className="grid grid-cols-1 gap-2">
                          {complaint.attachments.map((file, i) => (
                            <a 
                              key={i} 
                              href={file.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 bg-white rounded-xl border border-sky-100 hover:border-sky-600 transition-all group"
                            >
                              <File size={16} className="text-sky-400 group-hover:text-sky-600" />
                              <span className="text-xs font-medium text-sky-600 group-hover:text-sky-600 truncate">{file.filename}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 3. Response Details Panel */}
                <div className="bg-white rounded-3xl p-8 border border-sky-100 shadow-lg shadow-sky-200/50 flex flex-col">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                      <MessageSquare size={24} />
                    </div>
                    <h2 className="text-xl font-bold text-sky-900">3. Response Details</h2>
                  </div>

                  <div className="flex-1 space-y-6 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
                    {complaint.responses.length > 0 ? (
                      complaint.responses.map((res, i) => (
                        <div key={res.id} className="relative pl-8 before:absolute before:left-0 before:top-4 before:bottom-0 before:w-0.5 before:bg-sky-100 last:before:hidden">
                          <div className="absolute left-[-4px] top-3 w-2.5 h-2.5 rounded-full bg-sky-600 border-2 border-white z-10" />
                          <div className="bg-sky-50 rounded-2xl p-5 border border-sky-100">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sky-900 text-sm">{res.user_name}</span>
                                <span className="px-1.5 py-0.5 bg-sky-200 text-sky-600 rounded text-[8px] font-bold uppercase tracking-wider">
                                  {res.user_role.replace('_', ' ')}
                                </span>
                              </div>
                              <span className="text-[10px] text-sky-400">{formatDate(res.created_at)}</span>
                            </div>
                            <p className="text-sky-600 text-xs leading-relaxed">{res.message}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 bg-sky-50 rounded-3xl border border-dashed border-sky-200">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-sky-300">
                          <MessageSquare size={24} />
                        </div>
                        <p className="text-sky-400 text-sm">No responses yet.</p>
                      </div>
                    )}
                  </div>

                  <div className="mt-8 pt-8 border-t border-sky-50">
                    <h3 className="text-sm font-bold text-sky-900 mb-4">Send Follow-up Message</h3>
                    <div className="relative">
                      <textarea
                        rows={3}
                        placeholder="Type your message here..."
                        className="w-full p-4 bg-sky-50 border border-sky-200 rounded-2xl focus:border-sky-600 focus:ring-0 transition-all resize-none text-sm"
                        value={feedback}
                        onChange={e => setFeedback(e.target.value)}
                      />
                      <button 
                        onClick={handleFeedbackSubmit}
                        disabled={!feedback || isSubmitting}
                        className="absolute right-3 bottom-3 p-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-all disabled:opacity-50 shadow-lg shadow-sky-200"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Additional Documents Upload Panel */}
              <div className="bg-white rounded-3xl p-8 border border-sky-100 shadow-lg shadow-sky-200/50">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <Upload size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-sky-900">4. Additional Documents Upload</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="border-2 border-dashed border-sky-200 rounded-3xl p-12 text-center hover:border-sky-600 transition-colors cursor-pointer relative bg-sky-50/50">
                    <input 
                      type="file" 
                      multiple 
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        if (e.target.files) {
                          setSelectedFiles(Array.from(e.target.files));
                        }
                      }}
                    />
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-white text-sky-600 rounded-2xl shadow-sm flex items-center justify-center mb-4">
                        <Upload size={32} />
                      </div>
                      <p className="text-sky-900 font-bold text-lg">Click or drag files to upload</p>
                      <p className="text-sky-500 text-sm mt-2">Support for PDF, JPG, PNG (Max 5MB per file)</p>
                    </div>
                  </div>

                  <div className="flex flex-col">
                    {selectedFiles.length > 0 ? (
                      <div className="flex-1 space-y-3">
                        <h3 className="text-sm font-bold text-sky-400 uppercase tracking-widest mb-2">Selected Files ({selectedFiles.length})</h3>
                        <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                          {selectedFiles.map((file, i) => (
                            <div key={i} className="flex items-center justify-between p-4 bg-sky-50 rounded-2xl border border-sky-100">
                              <div className="flex items-center gap-3 truncate">
                                <File size={18} className="text-sky-400 shrink-0" />
                                <div className="truncate">
                                  <p className="text-sm font-bold text-sky-900 truncate">{file.name}</p>
                                  <p className="text-[10px] text-sky-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                </div>
                              </div>
                              <button 
                                onClick={() => setSelectedFiles(prev => prev.filter((_, idx) => idx !== i))}
                                className="p-2 text-sky-400 hover:text-red-600 transition-colors"
                              >
                                <AlertCircle size={18} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <button 
                          onClick={handleFileUpload}
                          disabled={isUploading}
                          className="w-full mt-4 py-4 bg-sky-600 text-white rounded-2xl font-bold hover:bg-sky-700 transition-all shadow-xl shadow-sky-200 flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                          {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
                          {isUploading ? 'Uploading...' : 'Confirm & Upload Documents'}
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-sky-50 rounded-3xl border border-sky-100">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mb-4 text-sky-200">
                          <FileText size={24} />
                        </div>
                        <p className="text-sky-400 text-sm">No files selected yet.</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
