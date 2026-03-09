import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  Users, 
  BarChart3, 
  ChevronDown, 
  ChevronRight,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2,
  UserCog,
  ShieldCheck,
  PanelLeftClose,
  PanelLeftOpen,
  Tag,
  X
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { UserRole } from '../types';
import { cn } from '../lib/utils';

interface NavItem {
  title: string;
  icon: React.ReactNode;
  href?: string;
  children?: { title: string; href: string }[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed: boolean;
}

export function Sidebar({ isOpen, onClose, isCollapsed }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [openMenus, setOpenMenus] = useState<string[]>(['Cases', 'Manage', 'Reports', 'Settings', 'User Management']);

  if (!user) return null;

  const toggleMenu = (title: string) => {
    setOpenMenus(prev => 
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const getNavItems = (): NavItem[] => {
    const base: NavItem[] = [
      { title: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/dashboard' }
    ];

    switch (user.role) {
      case UserRole.DIRECTOR:
        return [
          ...base,
          {
            title: 'Cases',
            icon: <FileText size={20} />,
            children: [
              { title: 'All Complaints', href: '/cases/all' },
              { title: 'All Assessment', href: '/cases/assessment' },
              { title: 'All Response', href: '/cases/response' },
            ]
          },
          {
            title: 'Manage',
            icon: <ClipboardList size={20} />,
            children: [
              { title: 'Assigned Complaints', href: '/manage/assigned' },
              { title: 'Unassigned Complaints', href: '/manage/unassigned' },
              { title: 'Closed Complaints', href: '/manage/closed' },
              { title: 'Reopened Complaints', href: '/manage/reopened' },
            ]
          },
          {
            title: 'Reports',
            icon: <BarChart3 size={20} />,
            children: [
              { title: 'Complaints Reports', href: '/reports/complaints' },
              { title: 'Assessment Reports', href: '/reports/assessment' },
              { title: 'Performance Reports', href: '/reports/performance' },
              { title: 'Feedback Reports', href: '/reports/feedback' },
            ]
          },
          {
            title: 'Settings',
            icon: <Settings size={20} />,
            children: [
              { title: 'Complaints Status', href: '/settings/status' },
              { title: 'Complaints Category', href: '/settings/categories' },
              { title: 'Complaints Sub Category', href: '/settings/subcategories' },
            ]
          }
        ];

      case UserRole.TEAM_LEADER:
        return [
          ...base,
          {
            title: 'Cases',
            icon: <FileText size={20} />,
            children: [
              { title: 'Complaints', href: '/cases/complaints' },
              { title: 'Assessment', href: '/cases/assessment' },
              { title: 'Response', href: '/cases/response' },
              { title: 'Approval', href: '/cases/approval' },
            ]
          },
          {
            title: 'Manage',
            icon: <ClipboardList size={20} />,
            children: [
              { title: 'Assign Complaints', href: '/manage/assign' },
              { title: 'Unassigned Complaints', href: '/manage/unassigned' },
              { title: 'Closed Complaints', href: '/manage/closed' },
            ]
          },
          {
            title: 'Reports',
            icon: <BarChart3 size={20} />,
            children: [
              { title: 'Complaints Reports', href: '/reports/complaints' },
              { title: 'Assessment Reports', href: '/reports/assessment' },
              { title: 'Performance Reports', href: '/reports/performance' },
              { title: 'Feedback Reports', href: '/reports/feedback' },
            ]
          }
        ];

      case UserRole.OFFICER:
        return [
          ...base,
          {
            title: 'Cases',
            icon: <FileText size={20} />,
            children: [
              { title: 'My Complaints', href: '/cases/my' },
              { title: 'My Assessment', href: '/cases/my-assessment' },
              { title: 'My Response', href: '/cases/my-response' },
              { title: 'Approved', href: '/cases/approved-list' },
            ]
          },
          {
            title: 'Manage',
            icon: <ClipboardList size={20} />,
            children: [
              { title: 'Assigned Complaints', href: '/manage/assigned' },
              { title: 'Closed Complaints', href: '/manage/closed' },
            ]
          },
          {
            title: 'Reports',
            icon: <BarChart3 size={20} />,
            children: [
              { title: 'Assessment Reports', href: '/reports/assessment' },
              { title: 'Performance Reports', href: '/reports/performance' },
              { title: 'Feedback Reports', href: '/reports/feedback' },
            ]
          }
        ];

      case UserRole.ADMIN:
        return [
          ...base,
          { title: 'User Management', icon: <Users size={20} />, href: '/admin/users' },
          { title: 'Role Management', icon: <ShieldCheck size={20} />, href: '/admin/roles' },
          { title: 'Tax Center Management', icon: <Building2 size={20} />, href: '/admin/tax-centers' }
        ];

      default:
        return base;
    }
  };

  const navItems = getNavItems();

  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-50 lg:relative lg:flex flex-col bg-sky-600 text-sky-100 h-screen border-r border-sky-500 transition-all duration-300 ease-in-out",
      isCollapsed ? "w-20" : "w-64",
      isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
    )}>
      <div className={cn(
        "p-6 border-b border-sky-500 flex items-center justify-between",
        isCollapsed ? "px-4" : "px-6"
      )}>
        <Link to="/" className="flex items-center gap-2 text-white font-bold text-xl tracking-tight overflow-hidden whitespace-nowrap">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center p-1.5 shrink-0 shadow-sm">
            <img 
              src="https://revenue.gov.et/wp-content/uploads/2021/08/cropped-LOGO-1-192x192.png" 
              alt="Ministry of Revenues Logo" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
          {!isCollapsed && <span>Complaints portal</span>}
        </Link>
        <button 
          onClick={onClose}
          className="lg:hidden p-2 text-sky-200 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
        {navItems.map((item) => (
          <div key={item.title}>
            {item.children ? (
              <div className="space-y-1">
                <button
                  onClick={() => toggleMenu(item.title)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-sky-500 hover:text-white transition-all group",
                    isCollapsed && "justify-center px-0"
                  )}
                  title={isCollapsed ? item.title : undefined}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn("transition-transform", isCollapsed && "scale-110")}>
                      {item.icon}
                    </div>
                    {!isCollapsed && <span className="text-sm font-medium">{item.title}</span>}
                  </div>
                  {!isCollapsed && (
                    <div className="transition-transform duration-200">
                      {openMenus.includes(item.title) ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </div>
                  )}
                </button>
                {openMenus.includes(item.title) && !isCollapsed && (
                  <div className="ml-9 space-y-1">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        to={child.href}
                        onClick={() => {
                          if (window.innerWidth < 1024) onClose();
                        }}
                        className={cn(
                          "block px-3 py-1.5 text-sm rounded-lg transition-colors",
                          location.pathname === child.href 
                            ? "bg-sky-500 text-white font-medium" 
                            : "hover:text-white"
                        )}
                      >
                        {child.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                to={item.href!}
                onClick={() => {
                  if (window.innerWidth < 1024) onClose();
                }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl transition-all group",
                  isCollapsed && "justify-center px-0",
                  location.pathname === item.href 
                    ? "bg-sky-500 text-white" 
                    : "hover:bg-sky-500 hover:text-white"
                )}
                title={isCollapsed ? item.title : undefined}
              >
                <div className={cn("transition-transform", isCollapsed && "scale-110")}>
                  {item.icon}
                </div>
                {!isCollapsed && <span className="text-sm font-medium">{item.title}</span>}
              </Link>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
