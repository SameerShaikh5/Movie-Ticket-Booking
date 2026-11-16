import React, { useState } from 'react';
import { X, Ticket, Mail, Lock, User, ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react';
import { loginUser, registerUser } from '../apis/user.apis.js';
import toast from 'react-hot-toast';


export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      let data;
      if (isSignUp) {
        // Call registration endpoint
        data = await registerUser({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
      } else {
        // Call login endpoint
        data = await loginUser({
          email: formData.email,
          password: formData.password,
        });
      }

      // Pass user data returned from backend (or fallback) to parent
      onLoginSuccess(
        data.data
      );

      // Clear form & close modal
      setFormData({ name: '', email: '', password: '' });
      onClose();
      toast.success('Logged In successfully')
    } catch (error) {
      // Catch backend error message or fallback
      setErrorMessage(error.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      
      {/* Modal Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 p-6 text-white text-center space-y-2 relative">
          <div className="w-10 h-10 rounded-xl bg-rose-600 mx-auto flex items-center justify-center shadow-lg shadow-rose-600/30">
            <Ticket className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-black tracking-tight">
            {isSignUp ? 'Join CineVault' : 'Welcome Back'}
          </h2>
          <p className="text-xs text-slate-400">
            {isSignUp
              ? 'Create an account to book tickets and manage reservations'
              : 'Sign in to access your digital E-Tickets and profile'}
          </p>
        </div>

        {/* Modal Form Body */}
        <div className="p-6 space-y-5">
          
          {/* Tab Toggle Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setErrorMessage(''); }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                !isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setErrorMessage(''); }}
              className={`flex-1 py-2 rounded-lg transition-all cursor-pointer ${
                isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'hover:text-slate-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name field (Only during Sign Up) */}
            {isSignUp && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    autoComplete="name"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
                  />
                </div>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700">Password</label>
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => alert('Password reset link sent to your email!')}
                    className="text-[11px] font-semibold text-rose-600 hover:underline cursor-pointer"
                  >
                    Forgot?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete={isSignUp ? 'new-password' : 'current-password'}
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2 text-xs text-slate-900 focus:outline-none focus:border-rose-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error Message Display */}
            {errorMessage && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-600 font-medium">
                {errorMessage}
              </div>
            )}

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 disabled:bg-rose-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                </>
              ) : (
                <>
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Footer Switch Prompt */}
          <div className="text-center pt-2 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setErrorMessage(''); }}
                className="font-bold text-rose-600 hover:underline cursor-pointer"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}