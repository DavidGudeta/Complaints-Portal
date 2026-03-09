import React, { useState, useEffect } from 'react';
import { 
  Users, 
  FileText, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  ClipboardList,
  Target,
  Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAuth } from '../contexts/AuthContext';
import { cn } from '../lib/utils';
import { UserRole } from '../types';

export function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    closed: 0
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (user?.tax_center_id) params.append('taxCenterId', user.tax_center_id.toString());
    if (user?.role) params.append('role', user.role);
    
    fetch(`/api/stats?${params.toString()}`).then(res => res.json()).then(setStats);
  }, [user]);

  const getCards = () => {
    const baseCards = [
      { title: 'Total Complaints', value: stats.total, icon: <FileText size={24} />, color: 'bg-sky-600', trend: '+12%', up: true },
      { title: 'Pending Review', value: stats.pending, icon: <Clock size={24} />, color: 'bg-amber-500', trend: '-5%', up: false },
      { title: 'In Progress', value: stats.in_progress, icon: <TrendingUp size={24} />, color: 'bg-sky-500', trend: '+8%', up: true },
      { title: 'Resolved Cases', value: stats.closed, icon: <CheckCircle2 size={24} />, color: 'bg-sky-700', trend: '+15%', up: true },
    ];

    if (user?.role === UserRole.OFFICER) {
      return [
        { title: 'My Total Cases', value: stats.total, icon: <ClipboardList size={24} />, color: 'bg-sky-600', trend: 'Active', up: true },
        { title: 'My Pending', value: stats.pending, icon: <Clock size={24} />, color: 'bg-amber-500', trend: 'Priority', up: false },
        { title: 'My Resolved', value: stats.closed, icon: <CheckCircle2 size={24} />, color: 'bg-sky-700', trend: '+2', up: true },
        { title: 'Success Rate', value: '94%', icon: <Target size={24} />, color: 'bg-emerald-500', trend: '+2%', up: true },
      ];
    }

    if (user?.role === UserRole.TEAM_LEADER) {
      return [
        { title: 'Team Total', value: stats.total, icon: <Users size={24} />, color: 'bg-sky-600', trend: 'Center', up: true },
        { title: 'Unassigned', value: stats.pending, icon: <AlertCircle size={24} />, color: 'bg-red-500', trend: 'Action Required', up: false },
        { title: 'Team Resolved', value: stats.closed, icon: <CheckCircle2 size={24} />, color: 'bg-sky-700', trend: '+10%', up: true },
        { title: 'Efficiency', value: '88%', icon: <Zap size={24} />, color: 'bg-sky-500', trend: '+5%', up: true },
      ];
    }

    return baseCards;
  };

  const cards = getCards();

  return (
    <div className="bg-white rounded-[2.5rem] border border-sky-100 shadow-sm p-8 md:p-12 min-h-full">
      <div className="space-y-12">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-bold text-sky-900 tracking-tight italic serif">Welcome back, {user?.name.split(' ')[0]}</h1>
            <p className="text-sky-500 mt-2 text-lg">
              {user?.role === UserRole.DIRECTOR && "Global overview of the Ministry's complaints portal."}
              {user?.role === UserRole.TEAM_LEADER && `Overview for ${user.tax_center_name || 'your tax center'}.`}
              {user?.role === UserRole.OFFICER && "Your personal workload and performance metrics."}
            </p>
          </div>
          {user?.tax_center_name && (
            <div className="px-4 py-2 bg-sky-50 rounded-xl text-xs font-bold text-sky-600 uppercase tracking-widest border border-sky-100">
              {user.tax_center_name}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {cards.map((card, i) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-sky-50 p-6 rounded-3xl border border-sky-100 hover:border-sky-200 hover:shadow-md transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={cn("p-3 rounded-2xl text-white shadow-lg", card.color)}>
                  {card.icon}
                </div>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full",
                  card.up ? "bg-sky-100 text-sky-600" : "bg-red-100 text-red-600"
                )}>
                  {card.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {card.trend}
                </div>
              </div>
              <p className="text-sky-500 text-sm font-medium mb-1">{card.title}</p>
              <p className="text-3xl font-bold text-sky-900 tracking-tight">{card.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-sky-50 rounded-3xl border border-sky-100 p-8">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-bold text-sky-900">
                {user?.role === UserRole.OFFICER ? "My Recent Tasks" : "Recent Activity"}
              </h2>
              <button className="text-sm font-bold text-sky-600 hover:text-sky-700">View All</button>
            </div>
            
            <div className="space-y-6">
              {[1, 2, 3, 4].map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white hover:shadow-sm transition-all cursor-pointer group border border-transparent hover:border-sky-100">
                  <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-sky-400 group-hover:bg-sky-50 transition-all border border-sky-100">
                    <AlertCircle size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-sky-900 truncate">
                      {user?.role === UserRole.OFFICER ? "Update required for CMP-X82J91" : "New complaint submitted: CMP-X82J91"}
                    </p>
                    <p className="text-xs text-sky-500">Tax Assessment issue by John Doe</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-bold text-sky-900">2m ago</p>
                    <span className="text-[10px] px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full font-bold uppercase tracking-wider">Pending</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-sky-600 rounded-3xl p-8 text-white shadow-xl shadow-sky-200">
            <h2 className="text-xl font-bold mb-6">
              {user?.role === UserRole.OFFICER ? "Personal Performance" : "Performance Overview"}
            </h2>
            <div className="space-y-8">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-sky-100">Response Rate</span>
                  <span className="font-bold">92%</span>
                </div>
                <div className="h-2 bg-sky-500 rounded-full overflow-hidden">
                  <div className="h-full bg-white w-[92%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-sky-100">Resolution Speed</span>
                  <span className="font-bold">4.2 days</span>
                </div>
                <div className="h-2 bg-sky-500 rounded-full overflow-hidden">
                  <div className="h-full bg-sky-200 w-[75%]" />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-sky-100">User Satisfaction</span>
                  <span className="font-bold">4.8/5</span>
                </div>
                <div className="h-2 bg-sky-500 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400 w-[96%]" />
                </div>
              </div>
            </div>

            <div className="mt-12 p-6 bg-sky-700 rounded-2xl border border-sky-500">
              <p className="text-xs font-bold text-sky-200 uppercase tracking-widest mb-2">
                {user?.role === UserRole.OFFICER ? "Current Status" : "System Status"}
              </p>
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                {user?.role === UserRole.OFFICER ? "Available for Assignments" : "All Systems Operational"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
