import React from 'react';
import { 
  Shield, 
  UserCheck, 
  Users, 
  FileText, 
  CheckCircle2, 
  Settings,
  BarChart3,
  ShieldCheck,
  Lock,
  Eye
} from 'lucide-react';
import { UserRole } from '../../types';
import { cn } from '../../lib/utils';

interface RoleDefinition {
  role: UserRole;
  description: string;
  permissions: string[];
  color: string;
  icon: React.ReactNode;
}

const ROLES: RoleDefinition[] = [
  {
    role: UserRole.ADMIN,
    description: "System administrator with full access to configuration and user management.",
    permissions: [
      "Manage Users & Staff Accounts",
      "Configure Tax Centers",
      "Manage Complaint Categories",
      "System Settings & Logs",
      "Full Data Access"
    ],
    color: "purple",
    icon: <ShieldCheck size={24} />
  },
  {
    role: UserRole.DIRECTOR,
    description: "High-level oversight of all complaints and performance metrics across the Ministry.",
    permissions: [
      "View All Complaints (Ministry-wide)",
      "Assign/Reassign Any Case",
      "Approve Resolutions",
      "Access All Reports",
      "Edit Case Details"
    ],
    color: "blue",
    icon: <Shield size={24} />
  },
  {
    role: UserRole.TEAM_LEADER,
    description: "Manages a specific Tax Center and its assigned officers.",
    permissions: [
      "Manage Center Complaints",
      "Assign Cases to Officers",
      "Review Assessments",
      "Approve Case Closures",
      "Center Performance Reports"
    ],
    color: "emerald",
    icon: <UserCheck size={24} />
  },
  {
    role: UserRole.OFFICER,
    description: "Frontline investigator responsible for processing assigned cases.",
    permissions: [
      "View Assigned Cases",
      "Submit Assessments",
      "Respond to Taxpayers",
      "Update Case Progress",
      "Personal Performance Stats"
    ],
    color: "zinc",
    icon: <Users size={24} />
  }
];

export function RoleManagement() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 tracking-tight italic serif">Role Management</h1>
        <p className="text-zinc-500">View system roles and their associated permissions.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {ROLES.map((r) => (
          <div key={r.role} className="bg-white rounded-3xl border border-zinc-100 shadow-sm overflow-hidden flex flex-col">
            <div className={cn(
              "p-8 flex items-center gap-4",
              r.color === 'purple' ? "bg-purple-50 text-purple-600" :
              r.color === 'blue' ? "bg-blue-50 text-blue-600" :
              r.color === 'emerald' ? "bg-emerald-50 text-emerald-600" :
              "bg-zinc-50 text-zinc-600"
            )}>
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm">
                {r.icon}
              </div>
              <div>
                <h2 className="text-xl font-bold italic serif">{r.role.replace('_', ' ')}</h2>
                <p className={cn(
                  "text-xs font-bold uppercase tracking-widest opacity-70",
                  r.color === 'purple' ? "text-purple-500" :
                  r.color === 'blue' ? "text-blue-500" :
                  r.color === 'emerald' ? "text-emerald-500" :
                  "text-zinc-500"
                )}>System Role</p>
              </div>
            </div>

            <div className="p-8 flex-1 flex flex-col">
              <p className="text-zinc-600 text-sm leading-relaxed mb-8">
                {r.description}
              </p>

              <div className="space-y-4 flex-1">
                <h3 className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Key Permissions</h3>
                <div className="space-y-2">
                  {r.permissions.map((p, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm text-zinc-600">
                      <CheckCircle2 size={16} className={cn(
                        r.color === 'purple' ? "text-purple-500" :
                        r.color === 'blue' ? "text-blue-500" :
                        r.color === 'emerald' ? "text-emerald-500" :
                        "text-zinc-500"
                      )} />
                      {p}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-zinc-50 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-zinc-400">
                  <Lock size={14} />
                  Immutable Role
                </div>
                <button className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
                  <Eye size={14} /> View Detailed Schema
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-zinc-950 rounded-3xl p-12 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <ShieldCheck className="text-blue-500 mb-6" size={48} />
          <h2 className="text-3xl font-bold italic serif mb-4">Security & Access Control</h2>
          <p className="text-zinc-400 leading-relaxed mb-8">
            The TaxGuard portal uses a strict Role-Based Access Control (RBAC) system. 
            Permissions are enforced both at the UI level (hiding menus) and at the API level (data filtering). 
            System roles are currently static to ensure organizational integrity.
          </p>
          <div className="flex gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex-1">
              <p className="text-2xl font-bold mb-1">4</p>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Active Roles</p>
            </div>
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex-1">
              <p className="text-2xl font-bold mb-1">20+</p>
              <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest">Permission Points</p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-600/10 to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
