import React, { useState } from 'react';
import { X, Save, Loader2, AlertCircle, ClipboardCheck } from 'lucide-react';
import { ComplaintStatus } from '../../types';

interface AssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  complaintId: number;
  userId: number;
}

export function AssessmentModal({ isOpen, onClose, onSuccess, complaintId, userId }: AssessmentModalProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // 1. Add the assessment to assessments table
      const res = await fetch('/api/internal/complaints/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaint_id: complaintId,
          user_id: userId,
          findings: message,
          recommendation: '' // Optional recommendation field
        })
      });

      if (!res.ok) throw new Error('Failed to save assessment');

      onSuccess(message);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-sky-950/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-sky-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-sky-50 flex items-center justify-between bg-sky-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
              <ClipboardCheck size={20} />
            </div>
            <h2 className="text-xl font-bold text-sky-900 italic serif">Add Assessment</h2>
          </div>
          <button onClick={onClose} className="p-2 text-sky-400 hover:text-sky-900 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex gap-3 text-red-600 text-sm font-medium">
              <AlertCircle size={20} className="shrink-0" />
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold text-sky-500 uppercase tracking-widest">Assessment Findings</label>
            <textarea 
              required
              rows={6}
              placeholder="Provide detailed findings of your assessment..."
              className="w-full px-4 py-3 bg-sky-50 border border-sky-200 rounded-xl focus:ring-1 focus:ring-sky-500 outline-none transition-all resize-none"
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
            <p className="text-[10px] text-sky-400 font-medium italic">This assessment will be recorded in the case history and the status will be updated to 'ASSESSED'.</p>
          </div>

          <div className="pt-6 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-sky-50 text-sky-600 rounded-2xl font-bold hover:bg-sky-100 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-4 bg-amber-600 text-white rounded-2xl font-bold hover:bg-amber-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-200"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Save size={20} /> Submit Assessment</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
