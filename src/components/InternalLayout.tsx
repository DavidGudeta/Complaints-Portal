import React, { useState, useRef, useEffect } from 'react';
import { Outlet, Navigate, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Search, User, Settings, Shield, Menu, X, Building2, Users, Tag, CheckCircle2 } from 'lucide-react';
import { NotificationBell } from './NotificationBell';
import { cn } from '../lib/utils';
import { UserRole } from '../types';

export function InternalLayout() {
  const { user, logout, isLoading } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-sky-50">
        <div className="w-12 h-12 border-4 border-sky-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex h-screen bg-sky-50 overflow-hidden relative">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        isCollapsed={isCollapsed}
      />
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-sky-950/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-sky-100 flex items-center justify-between px-4 md:px-8 shrink-0 relative z-50">
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <button 
              onClick={() => {
                if (window.innerWidth >= 1024) {
                  setIsCollapsed(!isCollapsed);
                } else {
                  setIsSidebarOpen(true);
                }
              }}
              className="p-2 text-sky-500 hover:bg-sky-50 rounded-lg transition-all"
            >
              <Menu size={20} />
            </button>
            
            <div className="relative w-full hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400" size={18} />
              <input 
                type="text" 
                placeholder="Search cases, taxpayers..." 
                className="w-full pl-10 pr-4 py-2 bg-sky-50 border-none rounded-lg text-sm focus:ring-1 focus:ring-sky-500 transition-all"
              />
            </div>

            {/* Mobile Search Toggle */}
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="sm:hidden p-2 text-sky-500 hover:bg-sky-50 rounded-lg transition-all"
            >
              <Search size={20} />
            </button>
          </div>

          {isSearchOpen && (
            <div className="absolute inset-x-0 top-16 bg-white border-b border-sky-100 p-4 z-40 sm:hidden animate-in slide-in-from-top duration-200">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-sky-400" size={18} />
                  <input 
                    autoFocus
                    type="text" 
                    placeholder="Search..." 
                    className="w-full pl-10 pr-4 py-2 bg-sky-50 border-none rounded-lg text-sm focus:ring-1 focus:ring-sky-500 transition-all"
                  />
                </div>
                <button 
                  onClick={() => setIsSearchOpen(false)}
                  className="p-2 text-sky-500 hover:bg-sky-50 rounded-lg transition-all"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          )}
          
          <div className="flex items-center gap-3 sm:gap-6">
            <NotificationBell />
            <div className="h-6 w-px bg-sky-100" />
            
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 p-1 rounded-full hover:bg-sky-50 transition-all"
              >
                <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center text-xs font-bold text-white shadow-lg shadow-sky-200">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-bold text-sky-900 leading-none">{user.name}</p>
                  <p className="text-[10px] text-sky-500 font-bold uppercase tracking-wider mt-1">{user.role.replace('_', ' ')}</p>
                </div>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-sky-100 shadow-xl shadow-sky-200/50 py-2 overflow-hidden">
                  <div className="px-4 py-3 border-b border-sky-50">
                    <p className="text-xs font-bold text-sky-400 uppercase tracking-widest mb-1">Signed in as</p>
                    <p className="text-sm font-bold text-sky-900 truncate">{user.email}</p>
                  </div>
                  
                  <div className="p-2">
                    <Link 
                      to="/profile" 
                      className="flex items-center gap-3 px-3 py-2 text-sm text-sky-600 hover:bg-sky-50 hover:text-sky-900 rounded-xl transition-all group"
                      onClick={() => setIsProfileOpen(false)}
                    >
                      <User size={18} className="text-sky-400 group-hover:text-sky-600" />
                      My Profile
                    </Link>

                    {user.role === UserRole.DIRECTOR && (
                      <>
                        <div className="h-px bg-sky-50 my-1 mx-2" />
                        <p className="px-3 py-1 text-[10px] font-bold text-sky-400 uppercase tracking-widest">System Settings</p>
                        <Link 
                          to="/settings/categories" 
                          className="flex items-center gap-3 px-3 py-2 text-sm text-sky-600 hover:bg-sky-50 hover:text-sky-900 rounded-xl transition-all group"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Tag size={18} className="text-sky-400 group-hover:text-sky-600" />
                          Complaint Categories
                        </Link>
                        <Link 
                          to="/settings/subcategories" 
                          className="flex items-center gap-3 px-3 py-2 text-sm text-sky-600 hover:bg-sky-50 hover:text-sky-900 rounded-xl transition-all group"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Tag size={18} className="text-sky-400 group-hover:text-sky-600" />
                          Subcategories
                        </Link>
                        <Link 
                          to="/settings/status" 
                          className="flex items-center gap-3 px-3 py-2 text-sm text-sky-600 hover:bg-sky-50 hover:text-sky-900 rounded-xl transition-all group"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <CheckCircle2 size={18} className="text-sky-400 group-hover:text-sky-600" />
                          System Statuses
                        </Link>
                      </>
                    )}

                    {user.role === UserRole.ADMIN && (
                      <>
                        <div className="h-px bg-sky-50 my-1 mx-2" />
                        <p className="px-3 py-1 text-[10px] font-bold text-sky-400 uppercase tracking-widest">Administration</p>
                        <Link 
                          to="/admin/users" 
                          className="flex items-center gap-3 px-3 py-2 text-sm text-sky-600 hover:bg-sky-50 hover:text-sky-900 rounded-xl transition-all group"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Users size={18} className="text-sky-400 group-hover:text-sky-600" />
                          User Management
                        </Link>
                        <Link 
                          to="/admin/roles" 
                          className="flex items-center gap-3 px-3 py-2 text-sm text-sky-600 hover:bg-sky-50 hover:text-sky-900 rounded-xl transition-all group"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Shield size={18} className="text-sky-400 group-hover:text-sky-600" />
                          Role Management
                        </Link>
                        <Link 
                          to="/admin/tax-centers" 
                          className="flex items-center gap-3 px-3 py-2 text-sm text-sky-600 hover:bg-sky-50 hover:text-sky-900 rounded-xl transition-all group"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <Building2 size={18} className="text-sky-400 group-hover:text-sky-600" />
                          Tax Centers
                        </Link>
                      </>
                    )}
                  </div>

                  <div className="p-2 border-t border-zinc-50">
                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-xl transition-all group"
                    >
                      <LogOut size={18} className="text-red-400 group-hover:text-red-600" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
