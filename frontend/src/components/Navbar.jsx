import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Ticket, Search, User, ShieldCheck, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import AuthModal from './AuthModal'; // Adjust path if needed

export default function Navbar({ searchQuery, setSearchQuery }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, setUser, isCheckingAuth } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* Brand Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-rose-600 flex items-center justify-center shadow-md shadow-rose-600/20">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              Cine<span className="text-rose-600">Vault</span>
            </span>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md relative mx-4">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search movies, events, formats..."
              className="w-full bg-slate-100/80 border border-slate-200 rounded-full pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-rose-500 focus:bg-white transition-all shadow-inner"
            />
          </div>

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-3">
            {isCheckingAuth ? (
              <div className="w-28 h-8 bg-slate-200/70 rounded-xl animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2">
                {/* CONDITIONAL ADMIN DASHBOARD BUTTON */}
                {user.role === 'ADMIN' && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl transition-all border border-rose-200 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Console</span>
                  </button>
                )}

                <button
                  onClick={() => navigate('/profile')}
                  className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer border border-slate-200"
                >
                  <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-[10px] font-black">
                    {user.name?.charAt(0)}
                  </div>
                  <span>{user.name}</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
              >
                <User className="w-3.5 h-3.5 text-rose-400" />
                <span>Sign In / Sign Up</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-slate-200 px-4 py-4 space-y-2">
            {isCheckingAuth ? (
              <div className="w-full h-9 bg-slate-200/70 rounded-xl animate-pulse" />
            ) : user ? (
              <>
                {user.role === 'ADMIN' && (
                  <button
                    onClick={() => {
                      navigate('/admin');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-rose-50 text-rose-700 font-bold text-xs rounded-xl border border-rose-200"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Console</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    navigate('/profile');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 text-slate-900 font-bold text-xs rounded-xl border border-slate-200"
                >
                  <span>My Profile ({user.name})</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  setIsAuthModalOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 text-white font-semibold text-xs rounded-xl shadow-sm"
              >
                <User className="w-3.5 h-3.5 text-rose-400" />
                <span>Sign In / Sign Up</span>
              </button>
            )}
          </div>
        )}
      </header>

      {/* Render Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(userData) => setUser(userData)}
      />
    </>
  );
}