import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { LandingPage } from './pages/LandingPage';
import { SubmitComplaint } from './pages/SubmitComplaint';
import { TrackComplaint } from './pages/TrackComplaint';
import { ContactPage } from './pages/ContactPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { Login } from './pages/Login';
import { InternalLayout } from './components/InternalLayout';
import { Dashboard } from './pages/Dashboard';
import { ComplaintList } from './components/ComplaintList';
import { ComplaintStatus } from './types';

import { ComplaintDetail } from './pages/ComplaintDetail';
import { Profile } from './pages/Profile';
import { UserManagement } from './pages/admin/UserManagement';
import { RoleManagement } from './pages/admin/RoleManagement';
import { TaxCenterManagement } from './pages/admin/TaxCenterManagement';
import { UserRole } from './types';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-50">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  const { user: currentUser } = useAuth();
  
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/submit" element={<SubmitComplaint />} />
      <Route path="/track" element={<TrackComplaint />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/feedback" element={<FeedbackPage />} />
      <Route path="/login" element={<Login />} />

      {/* Internal Routes */}
      <Route element={<InternalLayout />}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/cases/detail/:id" element={<ComplaintDetail />} />
        
        {/* Director Routes */}
        <Route path="/cases/all" element={
          <RoleGuard allowedRoles={[UserRole.DIRECTOR, UserRole.ADMIN]}>
            <ComplaintList title="All Complaints" isAllComplaints={true} />
          </RoleGuard>
        } />
        <Route path="/cases/assessment" element={
          <RoleGuard allowedRoles={[UserRole.DIRECTOR, UserRole.TEAM_LEADER]}>
            <ComplaintList title="Assessment Management" status={ComplaintStatus.ASSESSED} />
          </RoleGuard>
        } />
        <Route path="/cases/response" element={
          <RoleGuard allowedRoles={[UserRole.DIRECTOR, UserRole.TEAM_LEADER]}>
            <ComplaintList title="Response Management" status={ComplaintStatus.RESPONDED} />
          </RoleGuard>
        } />
        
        <Route path="/manage/assigned" element={
          <RoleGuard allowedRoles={[UserRole.DIRECTOR, UserRole.TEAM_LEADER, UserRole.OFFICER]}>
            <ComplaintList title="Assigned Complaints" status={ComplaintStatus.ASSIGNED} />
          </RoleGuard>
        } />
        <Route path="/manage/unassigned" element={
          <RoleGuard allowedRoles={[UserRole.DIRECTOR, UserRole.TEAM_LEADER]}>
            <ComplaintList title="Unassigned Complaints" status={ComplaintStatus.PENDING} />
          </RoleGuard>
        } />
        <Route path="/manage/closed" element={
          <RoleGuard allowedRoles={[UserRole.DIRECTOR, UserRole.TEAM_LEADER, UserRole.OFFICER]}>
            <ComplaintList title="Closed Complaints" status={ComplaintStatus.CLOSED} />
          </RoleGuard>
        } />
        <Route path="/manage/reopened" element={
          <RoleGuard allowedRoles={[UserRole.DIRECTOR, UserRole.TEAM_LEADER]}>
            <ComplaintList title="Reopened Complaints" status={ComplaintStatus.REOPENED} />
          </RoleGuard>
        } />

        {/* Team Leader Specific Routes */}
        <Route path="/cases/complaints" element={
          <RoleGuard allowedRoles={[UserRole.TEAM_LEADER]}>
            <ComplaintList title="Complaints Queue" />
          </RoleGuard>
        } />
        <Route path="/cases/approval" element={
          <RoleGuard allowedRoles={[UserRole.TEAM_LEADER, UserRole.DIRECTOR]}>
            <ComplaintList title="Approval Management" status={ComplaintStatus.APPROVED} />
          </RoleGuard>
        } />
        <Route path="/manage/assign" element={
          <RoleGuard allowedRoles={[UserRole.TEAM_LEADER, UserRole.DIRECTOR]}>
            <ComplaintList title="Assign Complaints" status={ComplaintStatus.PENDING} />
          </RoleGuard>
        } />

        {/* Officer Specific Routes */}
        <Route path="/cases/my" element={
          <RoleGuard allowedRoles={[UserRole.OFFICER]}>
            <ComplaintList title="My Assigned Cases" userId={currentUser?.id} />
          </RoleGuard>
        } />
        <Route path="/cases/my-assessment" element={
          <RoleGuard allowedRoles={[UserRole.OFFICER]}>
            <ComplaintList title="My Assessments" status={ComplaintStatus.ASSESSED} userId={currentUser?.id} />
          </RoleGuard>
        } />
        <Route path="/cases/my-response" element={
          <RoleGuard allowedRoles={[UserRole.OFFICER]}>
            <ComplaintList title="My Responses" status={ComplaintStatus.RESPONDED} userId={currentUser?.id} />
          </RoleGuard>
        } />
        <Route path="/cases/approved-list" element={
          <RoleGuard allowedRoles={[UserRole.OFFICER]}>
            <ComplaintList title="Approved Cases" status={ComplaintStatus.APPROVED} userId={currentUser?.id} />
          </RoleGuard>
        } />

        {/* Admin Routes */}
        <Route path="/admin/users" element={
          <RoleGuard allowedRoles={[UserRole.ADMIN]}>
            <UserManagement />
          </RoleGuard>
        } />
        <Route path="/admin/roles" element={
          <RoleGuard allowedRoles={[UserRole.ADMIN]}>
            <RoleManagement />
          </RoleGuard>
        } />
        <Route path="/admin/tax-centers" element={
          <RoleGuard allowedRoles={[UserRole.ADMIN]}>
            <TaxCenterManagement />
          </RoleGuard>
        } />
        <Route path="/admin" element={<Navigate to="/admin/users" replace />} />

        {/* Shared Reports & Settings */}
        <Route path="/reports/*" element={<div className="p-8 text-center text-zinc-400">Reports module coming soon...</div>} />
        <Route path="/settings/*" element={<div className="p-8 text-center text-zinc-400">Settings module coming soon...</div>} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <Router>
          <AppRoutes />
        </Router>
      </NotificationProvider>
    </AuthProvider>
  );
}
