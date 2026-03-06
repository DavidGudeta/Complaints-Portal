import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, FileText, Search, ArrowRight, CheckCircle2, MessageSquare, Shield, Zap } from 'lucide-react';
import { motion } from 'motion/react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="h-20 border-b border-zinc-100 flex items-center justify-between px-8 md:px-16 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2 text-zinc-950 font-bold text-2xl tracking-tight">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <ShieldCheck size={24} />
          </div>
          Complaints portal
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-zinc-500">
          <Link to="/contact" className="hover:text-zinc-950 transition-colors">Contact</Link>
          <Link to="/feedback" className="hover:text-zinc-950 transition-colors">Feedback</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="py-24 px-8 md:px-16 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
              <Zap size={14} /> Ethiopian Ministry of Revenues
            </div>
            <h1 className="text-6xl md:text-7xl font-bold text-zinc-900 tracking-tighter mb-8 leading-[0.9] italic serif">
              Tax payer <br />
              <span className="text-blue-600">complaints portal.</span>
            </h1>
            <p className="text-xl text-zinc-500 mb-12 leading-relaxed max-w-lg">
              Providing a transparent, efficient, and secure platform for taxpayers to voice their concerns and track resolutions in real-time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                to="/submit" 
                className="px-10 py-5 bg-zinc-950 text-white rounded-2xl font-bold text-lg hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 shadow-2xl shadow-zinc-200 group"
              >
                File a Complaint <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link 
                to="/track" 
                className="px-10 py-5 bg-white text-zinc-900 border-2 border-zinc-100 rounded-2xl font-bold text-lg hover:bg-zinc-50 transition-all flex items-center justify-center gap-2"
              >
                Track Progress
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square bg-zinc-50 rounded-[4rem] overflow-hidden border border-zinc-100 shadow-2xl shadow-zinc-200/50">
              <img 
                src="https://picsum.photos/seed/ethiopia/1200/1200" 
                alt="Ethiopian Ministry of Revenues" 
                className="w-full h-full object-cover opacity-80 mix-blend-multiply grayscale"
                referrerPolicy="no-referrer"
              />
            </div>
            
            {/* Floating Stats Card */}
            <div className="absolute -bottom-8 -left-8 bg-white p-8 rounded-3xl shadow-2xl shadow-zinc-200 border border-zinc-100 max-w-xs">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center">
                  <CheckCircle2 size={24} />
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-900 leading-none">98.4%</p>
                  <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Resolution Rate</p>
                </div>
              </div>
              <p className="text-sm text-zinc-500 leading-relaxed">
                Our dedicated team ensures every complaint is addressed within 48 business hours.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-zinc-50 px-8 md:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-zinc-900 tracking-tight italic serif mb-4">Built for Transparency</h2>
            <p className="text-zinc-500 max-w-2xl mx-auto">We've designed this portal to be the bridge between taxpayers and tax authorities, ensuring every voice is heard and every issue resolved.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Easy Submission', desc: 'Step-by-step wizard to guide you through the complaint process with document support.', icon: <FileText className="text-blue-600" size={32} /> },
              { title: 'Real-time Tracking', desc: 'Use your unique tracking code to see exactly where your case stands in our workflow.', icon: <Search className="text-blue-500" size={32} /> },
              { title: 'Direct Feedback', desc: 'Communicate directly with assigned officers and provide feedback on resolutions.', icon: <MessageSquare className="text-amber-500" size={32} /> },
            ].map((f, i) => (
              <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-zinc-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
                <div className="w-16 h-16 bg-zinc-50 rounded-2xl flex items-center justify-center mb-8">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-zinc-900 mb-4">{f.title}</h3>
                <p className="text-zinc-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-zinc-100 px-8 md:px-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 text-zinc-950 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white">
              <ShieldCheck size={20} />
            </div>
            Complaints portal
          </div>
          <p className="text-sm text-zinc-400">© 2026 Ethiopian Ministry of Revenues. All rights reserved.</p>
          <div className="flex items-center gap-6 text-sm font-bold text-zinc-500">
            <Link to="#" className="hover:text-zinc-950">Privacy Policy</Link>
            <Link to="#" className="hover:text-zinc-950">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
