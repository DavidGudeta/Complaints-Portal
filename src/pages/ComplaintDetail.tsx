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
    phone: '',
    mrc_code: '',
    ref_no: '',
    enterprise_address: '',
    customer_address: ''
  });

  const fetchComplaint = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/internal/complaints/${id}`);
      const data = await res.json();
      setComplaint(data);
      setEditData({
        subject: data.COMPLAINTS_TITLE,
        description: data.COMPLAIN_DETAILS,
        tin: data.TIN,
        name: data.COMPLAINANT_NAME,
        email: data.COMPLAINANT_EMAIL || '',
        phone: data.COMPLAINANT_PHONE,
        mrc_code: data.MACHINE_CODE || '',
        ref_no: data.REFERENCE_NO || '',
        enterprise_address: data.ENTERPRISE_ADDRESS || '',
        customer_address: data.CUSTOMER_ADDRESS || ''
      });
    } catch (error) {
      console.error('Failed to fetch complaint:', error);
    }
  };

  const fetchOfficers = async () => {
    try {
      const res = await fetch('/api/admin/users?role=OFFICER');
      const data = await res.json();
      setOfficers(data);
    } catch (error) {
      console.error('Failed to fetch officers:', error);
    }
  };

  useEffect(() => {
    fetchComplaint();
    if (user?.role === UserRole.DIRECTOR || user?.role === UserRole.TEAM_LEADER) {
      fetchOfficers();
    }
  }, [id, user]);

  const handleStatusUpdate = async (status: ComplaintStatus) => {
    if (!id) return;
    try {
      const res = await fetch(`/api/internal/complaints/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchComplaint();
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleAssign = async (officerId: string) => {
    if (!id) return;
    const officer = officers.find(o => o.id === officerId);
    try {
      const res = await fetch(`/api/internal/complaints/${id}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          officerId,
          officerName: officer?.name || 'Unknown Officer'
        })
      });
      if (res.ok) {
        fetchComplaint();
      }
    } catch (error) {
      console.error('Failed to assign officer:', error);
    }
  };

  const handleSaveEdit = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/internal/complaints/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          COMPLAINTS_TITLE: editData.subject,
          COMPLAIN_DETAILS: editData.description,
          TIN: editData.tin,
          COMPLAINANT_NAME: editData.name,
          COMPLAINANT_EMAIL: editData.email,
          COMPLAINANT_PHONE: editData.phone,
          MACHINE_CODE: editData.mrc_code,
          REFERENCE_NO: editData.ref_no,
          ENTERPRISE_ADDRESS: editData.enterprise_address,
          CUSTOMER_ADDRESS: editData.customer_address
        })
      });
      if (res.ok) {
        setIsEditing(false);
        fetchComplaint();
      }
    } catch (error) {
      console.error('Failed to save edits:', error);
    }
  };

  if (!complaint) return null;

  return (
    <div className="bg-white rounded-[2.5rem] border border-zinc-100 shadow-sm p-8 md:p-12 min-h-full">
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
            <h1 className="text-3xl font-bold text-zinc-900 tracking-tight italic serif">Case {complaint.COMPLAINT_CODE}</h1>
            <span className="px-3 py-1 bg-zinc-100 text-zinc-600 rounded-full text-xs font-bold border border-zinc-200">
              {complaint.CASE_STATUS}
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
          <p className="text-zinc-500">Submitted by {complaint.COMPLAINANT_NAME} on {formatDate(complaint.APPLIED_DATE)}</p>
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
                  <p className="text-lg font-bold text-zinc-900">{complaint.COMPLAINTS_TITLE}</p>
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
                    {complaint.COMPLAIN_DETAILS}
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-zinc-50">
                <div>
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Category</h3>
                  <p className="text-sm font-bold text-zinc-900">{complaint.category_name}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Subcategory</h3>
                  <p className="text-sm font-bold text-zinc-900">{complaint.subcategory_name || '-'}</p>
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">MRC Code</h3>
                  {isEditing ? (
                    <input 
                      type="text"
                      className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all text-sm"
                      value={editData.mrc_code}
                      onChange={e => setEditData({ ...editData, mrc_code: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-bold text-zinc-900">{complaint.MACHINE_CODE || '-'}</p>
                  )}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Reference Number</h3>
                  {isEditing ? (
                    <input 
                      type="text"
                      className="w-full px-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all text-sm"
                      value={editData.ref_no}
                      onChange={e => setEditData({ ...editData, ref_no: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm font-bold text-zinc-900">{complaint.REFERENCE_NO || '-'}</p>
                  )}
                </div>
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
                    onChange={(e) => handleAssign(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
                    value={complaint.assigned_id || ""}
                  >
                    <option value="" disabled>Select Officer...</option>
                    {officers.map(off => (
                      <option key={off.uid || off.id} value={off.uid || off.id}>{off.displayName || off.name}</option>
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
                      <p className="text-sm font-bold text-zinc-900">{complaint.COMPLAINANT_NAME}</p>
                      <p className="text-xs text-zinc-500">TIN: {complaint.TIN}</p>
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
                    <span className="text-zinc-900 font-medium">{complaint.COMPLAINANT_EMAIL}</span>
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
                    <span className="text-zinc-900 font-medium">{complaint.COMPLAINANT_PHONE}</span>
                  )}
                </div>
                <div className="pt-4 border-t border-zinc-50">
                  <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Address</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-500">Enterprise Address</span>
                      {isEditing ? (
                        <input 
                          type="text"
                          className="px-3 py-1 bg-zinc-50 border border-zinc-200 rounded-lg text-right text-xs"
                          value={editData.enterprise_address}
                          onChange={e => setEditData({ ...editData, enterprise_address: e.target.value })}
                        />
                      ) : (
                        <span className="text-zinc-900">{complaint.ENTERPRISE_ADDRESS || '-'}</span>
                      )}
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-500">Customer Address</span>
                      {isEditing ? (
                        <input 
                          type="text"
                          className="px-3 py-1 bg-zinc-50 border border-zinc-200 rounded-lg text-right text-xs"
                          value={editData.customer_address}
                          onChange={e => setEditData({ ...editData, customer_address: e.target.value })}
                        />
                      ) : (
                        <span className="text-zinc-900">{complaint.CUSTOMER_ADDRESS || '-'}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AssessmentModal 
        isOpen={isAssessmentModalOpen} 
        onClose={() => setIsAssessmentModalOpen(false)} 
        onSuccess={() => {}} 
        complaintId={complaint.COMPLAINTS_ID}
        userId={user!.id}
      />

      <ResponseModal 
        isOpen={isResponseModalOpen} 
        onClose={() => setIsResponseModalOpen(false)} 
        onSuccess={() => {}} 
        complaintId={complaint.COMPLAINTS_ID}
        userId={user!.id}
      />
      </div>
    </div>
  );
}
