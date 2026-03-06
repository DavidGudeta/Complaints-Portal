import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  User, 
  Clock, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Send, 
  MessageSquare,
  History,
  ShieldCheck,
  UserPlus,
  Edit2,
  Save,
  X
} from 'lucide-react';
import { Complaint, ComplaintResponse, ComplaintStatus, User as UserType, UserRole } from '../types';
import { formatDate, cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { AssessmentModal } from '../components/modals/AssessmentModal';
import { ResponseModal } from '../components/modals/ResponseModal';

export function ComplaintDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [complaint, setComplaint] = useState<(Complaint & { responses: ComplaintResponse[] }) | null>(null);
  const [officers, setOfficers] = useState<UserType[]>([]);
  const [isAssessmentModalOpen, setIsAssessmentModalOpen] = useState(false);
  const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    subject: '',
    description: '',
    tin: '',
    name: '',
    email: '',
    phone: ''
  });

  useEffect(() => {
    fetchComplaint();
    fetchOfficers();
  }, [id]);

  const fetchComplaint = async () => {
    const res = await fetch(`/api/complaints/track/${id}`);
    const data = await res.json();
    setComplaint(data);
    setEditData({
      subject: data.subject,
      description: data.description,
      tin: data.tin,
      name: data.name,
      email: data.email,
      phone: data.phone
    });
  };

  const fetchOfficers = () => {
    fetch('/api/admin/users').then(res => res.json()).then(data => {
      setOfficers(data.filter((u: UserType) => u.role === UserRole.OFFICER));
    });
  };

  const handleStatusUpdate = async (status: ComplaintStatus) => {
    await fetch(`/api/internal/complaints/${complaint?.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    fetchComplaint();
  };

  const handleAssign = async (officerId: number) => {
    await fetch(`/api/internal/complaints/${complaint?.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ assigned_to: officerId, status: ComplaintStatus.ASSIGNED })
    });
    fetchComplaint();
  };

  const handleSaveEdit = async () => {
    await fetch(`/api/internal/complaints/${complaint?.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editData)
    });
    setIsEditing(false);
    fetchComplaint();
  };

  if (!complaint) return null;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 bg-white border border-zinc-200 rounded-xl text-zinc-400 hover:text-zinc-900 transition-all"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight italic serif">Case {complaint.tracking_code}</h1>
            <span className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full text-xs font-bold border border-zinc-200">
              {complaint.status}
            </span>
            {(user?.role === UserRole.DIRECTOR || user?.role === UserRole.TEAM_LEADER) && !isEditing && (
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setIsEditing(true);
                }}
                className="flex items-center gap-2 px-3 py-1 bg-white border border-zinc-200 rounded-lg text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-all ml-4"
              >
                <Edit2 size={14} /> Edit Case
              </button>
            )}
            {isEditing && (
              <div className="flex items-center gap-2 ml-4">
                <button 
                  onClick={handleSaveEdit}
                  className="flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-all"
                >
                  <Save size={14} /> Save
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 px-3 py-1 bg-white border border-zinc-200 rounded-lg text-xs font-bold text-zinc-600 hover:bg-zinc-50 transition-all"
                >
                  <X size={14} /> Cancel
                </button>
              </div>
            )}
          </div>
          <p className="text-zinc-500">Submitted by {complaint.name} on {formatDate(complaint.created_at)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Complaint Content */}
          <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold text-zinc-900">Complaint Details</h2>
            </div>
            <div className="space-y-6">
              <div>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Subject</h3>
                {isEditing ? (
                  <input 
                    type="text"
                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all font-bold text-zinc-900"
                    value={editData.subject}
                    onChange={e => setEditData({ ...editData, subject: e.target.value })}
                  />
                ) : (
                  <p className="text-lg font-bold text-zinc-900">{complaint.subject}</p>
                )}
              </div>
              <div>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Description</h3>
                {isEditing ? (
                  <textarea 
                    rows={5}
                    className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all text-zinc-600 resize-none"
                    value={editData.description}
                    onChange={e => setEditData({ ...editData, description: e.target.value })}
                  />
                ) : (
                  <p className="text-zinc-600 leading-relaxed bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                    {complaint.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Response History */}
          <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm">
            <div className="flex items-center gap-3 mb-8">
              <History className="text-blue-600" size={24} />
              <h2 className="text-xl font-bold text-zinc-900">Internal & Public Responses</h2>
            </div>
            <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-100">
              {complaint.responses.map((res) => (
                <div key={res.id} className="relative pl-12">
                  <div className="absolute left-0 top-0 w-8 h-8 rounded-full bg-white border-2 border-blue-600 flex items-center justify-center z-10">
                    <User size={16} className="text-blue-600" />
                  </div>
                  <div className="bg-zinc-50 rounded-2xl p-6 border border-zinc-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-zinc-900">{res.user_name}</span>
                      <span className="text-xs text-zinc-400">{formatDate(res.created_at)}</span>
                    </div>
                    <p className="text-zinc-600 text-sm leading-relaxed">{res.message}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 pt-8 border-t border-zinc-100 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Case Communication</h3>
                <p className="text-xs text-zinc-500">Add responses or assessments to this case.</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsResponseModalOpen(true)}
                  className="px-6 py-3 bg-zinc-950 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all flex items-center gap-2 shadow-lg shadow-zinc-200"
                >
                  <MessageSquare size={18} /> Add Response
                </button>
                {user?.role !== UserRole.DIRECTOR && (
                  <button 
                    onClick={() => setIsAssessmentModalOpen(true)}
                    className="px-6 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition-all flex items-center gap-2 shadow-lg shadow-amber-200"
                  >
                    <ShieldCheck size={18} /> Add Assessment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {/* Actions Panel */}
          <div className="bg-zinc-950 rounded-3xl p-8 text-white shadow-xl shadow-zinc-200">
            <h2 className="text-lg font-bold mb-6">Case Actions</h2>
            <div className="space-y-4">
              {(user?.role === UserRole.DIRECTOR || user?.role === UserRole.TEAM_LEADER) && (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Assign to Officer</p>
                  <select
                    onChange={(e) => handleAssign(parseInt(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
                    value={complaint.assigned_to || ""}
                  >
                    <option value="" disabled>Select Officer...</option>
                    {officers.map(off => (
                      <option key={off.id} value={off.id}>{off.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="pt-6 border-t border-zinc-800 space-y-4">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Quick Status Update</p>
                <div className="grid grid-cols-2 gap-2">
                  <button 
                    onClick={() => handleStatusUpdate(ComplaintStatus.IN_PROGRESS)}
                    disabled={user?.role === UserRole.DIRECTOR}
                    className="px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg text-xs font-bold hover:bg-blue-600/30 transition-all disabled:opacity-50"
                  >
                    In Progress
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(ComplaintStatus.ASSESSED)}
                    disabled={user?.role === UserRole.DIRECTOR}
                    className="px-4 py-2 bg-amber-600/20 text-amber-400 border border-amber-600/30 rounded-lg text-xs font-bold hover:bg-amber-600/30 transition-all disabled:opacity-50"
                  >
                    Assessed
                  </button>
                  {(user?.role === UserRole.DIRECTOR || user?.role === UserRole.TEAM_LEADER) && (
                    <button 
                      onClick={() => handleStatusUpdate(ComplaintStatus.APPROVED)}
                      className="px-4 py-2 bg-blue-600/20 text-blue-400 border border-blue-600/30 rounded-lg text-xs font-bold hover:bg-blue-600/30 transition-all"
                    >
                      Approved
                    </button>
                  )}
                  {(user?.role === UserRole.DIRECTOR || user?.role === UserRole.TEAM_LEADER) && (
                    <button 
                      onClick={() => handleStatusUpdate(ComplaintStatus.CLOSED)}
                      className="px-4 py-2 bg-zinc-800 text-zinc-400 border border-zinc-700 rounded-lg text-xs font-bold hover:bg-zinc-700 transition-all"
                    >
                      Close Case
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Taxpayer Info */}
          <div className="bg-white rounded-3xl p-8 border border-zinc-100 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-900 mb-6">Taxpayer Info</h2>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400">
                  <User size={24} />
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <div className="space-y-2">
                      <input 
                        type="text"
                        className="w-full px-3 py-1 text-sm bg-zinc-50 border border-zinc-200 rounded-lg"
                        value={editData.name}
                        onChange={e => setEditData({ ...editData, name: e.target.value })}
                      />
                      <input 
                        type="text"
                        className="w-full px-3 py-1 text-xs bg-zinc-50 border border-zinc-200 rounded-lg font-mono"
                        value={editData.tin}
                        onChange={e => setEditData({ ...editData, tin: e.target.value })}
                      />
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-bold text-zinc-900">{complaint.name}</p>
                      <p className="text-xs text-zinc-500">TIN: {complaint.tin}</p>
                    </>
                  )}
                </div>
              </div>
              <div className="space-y-3 pt-6 border-t border-zinc-50">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Email</span>
                  {isEditing ? (
                    <input 
                      type="email"
                      className="px-3 py-1 bg-zinc-50 border border-zinc-200 rounded-lg text-right"
                      value={editData.email}
                      onChange={e => setEditData({ ...editData, email: e.target.value })}
                    />
                  ) : (
                    <span className="text-zinc-900 font-medium">{complaint.email}</span>
                  )}
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Phone</span>
                  {isEditing ? (
                    <input 
                      type="tel"
                      className="px-3 py-1 bg-zinc-50 border border-zinc-200 rounded-lg text-right"
                      value={editData.phone}
                      onChange={e => setEditData({ ...editData, phone: e.target.value })}
                    />
                  ) : (
                    <span className="text-zinc-900 font-medium">{complaint.phone}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AssessmentModal 
        isOpen={isAssessmentModalOpen} 
        onClose={() => setIsAssessmentModalOpen(false)} 
        onSuccess={() => fetchComplaint()} 
        complaintId={complaint.id}
        userId={user!.id}
      />

      <ResponseModal 
        isOpen={isResponseModalOpen} 
        onClose={() => setIsResponseModalOpen(false)} 
        onSuccess={() => fetchComplaint()} 
        complaintId={complaint.id}
        userId={user!.id}
      />
    </div>
  );
}
