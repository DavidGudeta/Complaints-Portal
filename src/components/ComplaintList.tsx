import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  MoreVertical, 
  User, 
  Calendar,
  ArrowRight,
  Filter,
  Download,
  Trash2,
  ClipboardCheck
} from 'lucide-react';
import { Complaint, ComplaintStatus, User as UserType, UserRole } from '../types';
import { formatDate, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { AssessmentModal } from './modals/AssessmentModal';
import { useComplaints } from '../hooks/useComplaints';

interface ComplaintListProps {
  title: string;
  status?: ComplaintStatus;
  role?: string;
  userId?: number;
  isAllComplaints?: boolean;
}

export function ComplaintList({ title, status, role, userId, isAllComplaints }: ComplaintListProps) {
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const { complaints, isLoading, fetchComplaints, deleteComplaint, assignComplaint } = useComplaints({ status, role, userId });
  const [officers, setOfficers] = useState<UserType[]>([]);
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [selectedComplaintId, setSelectedComplaintId] = useState<number | null>(null);

  useEffect(() => {
    if (currentUser?.role === UserRole.TEAM_LEADER || currentUser?.role === UserRole.DIRECTOR) {
      fetchOfficers();
    }
  }, [currentUser]);

  const fetchOfficers = () => {
    fetch('/api/admin/users')
      .then(res => res.json())
      .then(data => {
        setOfficers(data.filter((u: UserType) => u.role === UserRole.OFFICER));
      });
  };

  const handleAssign = async (complaintId: number, officerId: string) => {
    if (!officerId) return;
    setAssigningId(complaintId);
    await assignComplaint(complaintId, parseInt(officerId));
    setAssigningId(null);
  };

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
    <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-8 md:p-12 min-h-full">
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 tracking-tight italic serif">{title}</h1>
            <p className="text-zinc-500 mt-2">Manage and review taxpayer complaints in this category.</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-bold text-zinc-600 hover:bg-zinc-100 transition-all">
              <Filter size={16} /> Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-950 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition-all">
              <Download size={16} /> Export
            </button>
          </div>
        </div>

        <div className="bg-zinc-50 rounded-3xl border border-zinc-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-100/50 border-b border-zinc-200">
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Case ID</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Taxpayer</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Subject</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Assigned To</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest">Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-zinc-400 uppercase tracking-widest text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {isLoading ? (
                  [1, 2, 3].map(i => (
                    <tr key={i} className="animate-pulse">
                      <td colSpan={7} className="px-6 py-8">
                        <div className="h-4 bg-zinc-200 rounded w-full" />
                      </td>
                    </tr>
                  ))
                ) : complaints.length > 0 ? (
                  complaints.map((c, i) => (
                      <motion.tr 
                        key={c.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        onClick={() => navigate(`/cases/detail/${c.tracking_code}`)}
                        className="hover:bg-white transition-colors group cursor-pointer"
                      >
                      <td className="px-6 py-5">
                        <span className="font-mono font-bold text-zinc-900">{c.tracking_code}</span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-white border border-zinc-100 flex items-center justify-center text-xs font-bold text-zinc-500">
                            {c.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-zinc-900">{c.name}</p>
                            <p className="text-xs text-zinc-500">{c.tin}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-sm text-zinc-600 line-clamp-1">{c.subject}</p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-1">{c.category_name}</p>
                      </td>
                      <td className="px-6 py-5">
                        <span className={cn("px-2 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider", getStatusColor(c.status))}>
                          {c.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {(currentUser?.role === UserRole.TEAM_LEADER || currentUser?.role === UserRole.DIRECTOR) ? (
                          <div className="relative">
                            <select
                              disabled={assigningId === c.id}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleAssign(c.id, e.target.value);
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs bg-white border border-zinc-200 rounded-lg px-2 py-1 focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer disabled:opacity-50 w-full max-w-[140px]"
                              value={c.assigned_to || ""}
                            >
                              <option value="" disabled>Assign to...</option>
                              {officers.map(off => (
                                <option key={off.id} value={off.id}>{off.name}</option>
                              ))}
                            </select>
                          </div>
                        ) : c.assigned_name ? (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-600">
                              {c.assigned_name.charAt(0)}
                            </div>
                            <span className="text-sm text-zinc-600">{c.assigned_name}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-zinc-400 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 text-zinc-500">
                          <Calendar size={14} />
                          <span className="text-xs">{formatDate(c.created_at).split(',')[0]}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {(currentUser?.role === UserRole.TEAM_LEADER || currentUser?.role === UserRole.OFFICER) && 
                           (c.status === ComplaintStatus.ASSIGNED || c.status === ComplaintStatus.IN_PROGRESS) && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedComplaintId(c.id);
                                setIsAssessmentModalOpen(true);
                              }}
                              className="p-2 text-zinc-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                              title="Add Assessment"
                            >
                              <ClipboardCheck size={18} />
                            </button>
                          )}
                          {(currentUser?.role === UserRole.DIRECTOR || currentUser?.role === UserRole.TEAM_LEADER) && (
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteComplaint(c.id);
                              }}
                              className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                          <Link 
                            to={`/cases/detail/${c.tracking_code}`}
                            className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-white rounded-lg transition-all inline-block"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ArrowRight size={18} />
                          </Link>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-20 text-center">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-zinc-300 border border-zinc-100">
                        <FileText size={32} />
                      </div>
                      <p className="text-zinc-400 font-medium">No complaints found in this category.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <AssessmentModal 
          isOpen={isAssessmentModalOpen} 
          onClose={() => setIsAssessmentModalOpen(false)} 
          onSuccess={fetchComplaints} 
          complaintId={selectedComplaintId!}
          userId={currentUser!.id}
        />
      </div>
    </div>
  );
}
