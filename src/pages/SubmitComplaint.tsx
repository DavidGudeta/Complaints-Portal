import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Upload, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ComplaintCategory } from '../types';
import { cn } from '../lib/utils';

export function SubmitComplaint() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<ComplaintCategory[]>([]);
  const [taxCenters, setTaxCenters] = useState<any[]>([]);
  const [trackingCode, setTrackingCode] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    tin: '',
    name: '',
    email: '',
    phone: '',
    subject: '',
    category_id: '',
    tax_center_id: '',
    description: '',
    files: [] as File[]
  });

  useEffect(() => {
    fetch('/api/categories').then(res => res.json()).then(setCategories);
    fetch('/api/tax-centers').then(res => res.json()).then(setTaxCenters);
  }, []);

  const handleTinSearch = async () => {
    if (!formData.tin) return;
    setIsSearching(true);
    // Simulate TIN search
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        name: 'John Doe Taxpayer',
        email: 'john.doe@example.com',
        phone: '+1234567890'
      }));
      setIsSearching(false);
      setStep(1);
    }, 1000);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/complaints', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      setTrackingCode(data.tracking_code);
      setStep(4);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = [
    { title: 'TIN Verification', icon: <Search size={20} /> },
    { title: 'Complainant Info', icon: <User size={20} /> },
    { title: 'Complaint Case', icon: <FileText size={20} /> },
    { title: 'Additional Info', icon: <Upload size={20} /> }
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col items-center py-12 px-4">
      <div className="max-w-3xl w-full">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-zinc-400 hover:text-zinc-900 transition-colors">
            <ArrowLeft size={16} /> Back to Home
          </Link>
        </div>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-zinc-900 tracking-tight mb-2 italic serif">Submit a Complaint</h1>
          <p className="text-zinc-500">Please follow the steps below to file your complaint with the portal.</p>
        </div>

        {/* Wizard Progress */}
        <div className="flex justify-between mb-12 relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-200 -translate-y-1/2 z-0" />
          {steps.map((s, i) => (
            <div key={i} className="relative z-10 flex flex-col items-center">
              <div className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300",
                step >= i ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white text-zinc-400 border-2 border-zinc-200"
              )}>
                {step > i ? <CheckCircle2 size={20} /> : s.icon}
              </div>
              <span className={cn(
                "text-xs font-semibold mt-2 transition-colors",
                step >= i ? "text-blue-600" : "text-zinc-400"
              )}>{s.title}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-zinc-200/50 border border-zinc-100 overflow-hidden">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 md:p-12"
              >
                <div className="max-w-md mx-auto text-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6">
                    <Search size={32} />
                  </div>
                  <h2 className="text-2xl font-bold text-zinc-900 mb-4">Verify Taxpayer Identification</h2>
                  <p className="text-zinc-500 mb-8">Enter your Taxpayer Identification Number (TIN) to begin the complaint process.</p>
                  
                  <div className="relative mb-6">
                    <input
                      type="text"
                      placeholder="Enter TIN (e.g. 123-456-789)"
                      className="w-full px-6 py-4 bg-zinc-50 border-2 border-zinc-100 rounded-2xl focus:border-blue-600 focus:ring-0 transition-all text-lg font-mono tracking-wider"
                      value={formData.tin}
                      onChange={e => setFormData({ ...formData, tin: e.target.value })}
                    />
                  </div>
                  
                  <button
                    onClick={handleTinSearch}
                    disabled={!formData.tin || isSearching}
                    className="w-full bg-zinc-950 text-white py-4 rounded-2xl font-bold text-lg hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isSearching ? <Loader2 className="animate-spin" /> : 'Verify & Continue'}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 md:p-12"
              >
                <h2 className="text-2xl font-bold text-zinc-900 mb-8">Complainant Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                      <input
                        type="text"
                        className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-blue-600 focus:ring-0 transition-all"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                      <input
                        type="email"
                        className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-blue-600 focus:ring-0 transition-all"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
                      <input
                        type="tel"
                        className="w-full pl-12 pr-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-blue-600 focus:ring-0 transition-all"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="mt-12 flex justify-between">
                  <button onClick={() => setStep(0)} className="px-8 py-3 text-zinc-500 font-bold hover:text-zinc-900 transition-colors flex items-center gap-2">
                    <ChevronLeft size={20} /> Back
                  </button>
                  <button onClick={() => setStep(2)} className="px-8 py-3 bg-zinc-950 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all flex items-center gap-2">
                    Continue <ChevronRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 md:p-12"
              >
                <h2 className="text-2xl font-bold text-zinc-900 mb-8">Complaint Case Details</h2>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Subject</label>
                    <input
                      type="text"
                      placeholder="Brief summary of the issue"
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-blue-600 focus:ring-0 transition-all"
                      value={formData.subject}
                      onChange={e => setFormData({ ...formData, subject: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Category</label>
                    <select
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-blue-600 focus:ring-0 transition-all"
                      value={formData.category_id}
                      onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                    >
                      <option value="">Select a category</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Tax Center</label>
                    <select
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-blue-600 focus:ring-0 transition-all"
                      value={formData.tax_center_id}
                      onChange={e => setFormData({ ...formData, tax_center_id: e.target.value })}
                    >
                      <option value="">Select your tax center</option>
                      {taxCenters.map(tc => (
                        <option key={tc.id} value={tc.id}>{tc.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Detailed Description</label>
                    <textarea
                      rows={5}
                      placeholder="Provide as much detail as possible..."
                      className="w-full px-4 py-3 bg-zinc-50 border border-zinc-200 rounded-xl focus:border-blue-600 focus:ring-0 transition-all resize-none"
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                </div>
                <div className="mt-12 flex justify-between">
                  <button onClick={() => setStep(1)} className="px-8 py-3 text-zinc-500 font-bold hover:text-zinc-900 transition-colors flex items-center gap-2">
                    <ChevronLeft size={20} /> Back
                  </button>
                  <button onClick={() => setStep(3)} className="px-8 py-3 bg-zinc-950 text-white rounded-xl font-bold hover:bg-zinc-800 transition-all flex items-center gap-2">
                    Continue <ChevronRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 md:p-12"
              >
                <h2 className="text-2xl font-bold text-zinc-900 mb-8">Additional Info & Uploads</h2>
                <div className="space-y-8">
                  <div className="border-2 border-dashed border-zinc-200 rounded-3xl p-12 text-center hover:border-blue-600 transition-colors cursor-pointer group">
                    <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center text-zinc-400 mx-auto mb-4 group-hover:text-blue-600 group-hover:bg-blue-50 transition-all">
                      <Upload size={32} />
                    </div>
                    <p className="text-zinc-900 font-bold mb-1">Click to upload or drag and drop</p>
                    <p className="text-zinc-500 text-sm">PDF, JPG, PNG (Max 5MB per file)</p>
                  </div>

                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex gap-4">
                    <AlertCircle className="text-blue-600 shrink-0" size={24} />
                    <div>
                      <p className="text-blue-900 font-bold text-sm mb-1">Important Note</p>
                      <p className="text-blue-700 text-sm leading-relaxed">
                        By submitting this complaint, you certify that the information provided is accurate and truthful. 
                        The Ministry takes all complaints seriously and will investigate thoroughly.
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-12 flex justify-between">
                  <button onClick={() => setStep(2)} className="px-8 py-3 text-zinc-500 font-bold hover:text-zinc-900 transition-colors flex items-center gap-2">
                    <ChevronLeft size={20} /> Back
                  </button>
                  <button 
                    onClick={handleSubmit} 
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg shadow-blue-200"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" /> : 'Submit Complaint'}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-8 md:p-12 text-center"
              >
                <div className="w-20 h-20 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-200">
                  <CheckCircle2 size={40} />
                </div>
                <h2 className="text-3xl font-bold text-zinc-900 mb-4">Submission Successful!</h2>
                <p className="text-zinc-500 mb-8 max-w-md mx-auto">
                  Your complaint has been received and assigned a unique tracking code. 
                  Please save this code to track the progress of your case.
                </p>
                
                <div className="bg-zinc-50 border-2 border-zinc-100 rounded-3xl p-8 mb-12 inline-block">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Your Tracking Code</p>
                  <p className="text-4xl font-mono font-bold text-zinc-900 tracking-wider">{trackingCode}</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button 
                    onClick={() => navigate(`/track?code=${trackingCode}`)}
                    className="px-8 py-4 bg-zinc-950 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-all"
                  >
                    Track Progress Now
                  </button>
                  <button 
                    onClick={() => navigate('/')}
                    className="px-8 py-4 bg-white text-zinc-900 border border-zinc-200 rounded-2xl font-bold hover:bg-zinc-50 transition-all"
                  >
                    Return Home
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
