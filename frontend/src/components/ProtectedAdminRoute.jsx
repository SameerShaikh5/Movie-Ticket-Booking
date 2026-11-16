import React from 'react';
import { Navigate, Outlet, Link } from 'react-router';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedAdminRoute() {
  const { user, isCheckingAuth } = useAuth();

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  // Redirect unauthenticated guests straight to home
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Block regular logged-in users who do not have ADMIN role
  if (user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-rose-600/20 border border-rose-500/30 rounded-2xl flex items-center justify-center text-rose-500 mb-4 shadow-lg">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black tracking-tight mb-2">Restricted Area</h1>
        <p className="text-slate-400 text-sm max-w-md mb-6">
          Your account does not have administrator privileges to access the CineVault Ops Console.
        </p>
        <Link
          to="/"
          className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-rose-600/30"
        >
          Return to Public App
        </Link>
      </div>
    );
  }

  return <Outlet />;
}