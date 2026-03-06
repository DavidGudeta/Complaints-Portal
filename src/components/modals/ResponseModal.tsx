import React, { useState } from 'react';
import { X, Send, Loader2, AlertCircle, MessageSquare } from 'lucide-react';

interface ResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  complaintId: number;
  userId: number;
}

export function ResponseModal({ isOpen, onClose, onSuccess, complaintId, userId }: ResponseModalProps) {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch('/api/internal/responses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          complaint_id: complaintId,
          user_id: userId,
          message
        })
      });

      if (!res.ok) throw new Error('Failed to send response');

      onSuccess(message);
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950/20 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl border border-zinc-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-zinc-50 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-zinc-950 rounded-xl flex items-center justify-center text-white shadow-lg shadow-zinc-200">
              <MessageSquare size={20} />
            </div>
            <h2 className="text-xl font-bold text-zinc-900 italic serif">Add Response</h2>
          </div>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-900 transition-colors">
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
            <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Your Message</label>
            <textarea 
              required
              rows={6}
              placeholder="Type your response to the taxpayer..."
              className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:ring-1 focus:ring-blue-500 outline-none transition-all resize-none"
              value={message}
              onChange={e => setMessage(e.target.value)}
            />
          </div>

          <div className="pt-6 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-zinc-50 text-zinc-600 rounded-2xl font-bold hover:bg-zinc-100 transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-4 bg-zinc-950 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-zinc-200"
            >
              {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <><Send size={20} /> Send Response</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
