import React, { useState, useEffect } from 'react';
import { 
  NavLink, 
  Outlet, 
  useLocation, 
  Link, 
  matchPath 
} from 'react-router';
import { 
  Film, Monitor, AlertTriangle, TrendingUp, 
  LogOut, Ticket, Menu, X, ChevronLeft 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

export default function AdminLayout() {
  const location = useLocation();
  const { user, isCheckingAuth } = useAuth();

  // Initialize sidebar open on large screens (>= 1024px), closed on small/tablets
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  // Optional: Handle window resize listeners to auto-adjust layout if needed
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsSidebarOpen(true);
      } else {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Show loading spinner while checking authentication state
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  // Show Unauthorized Error View if user is not logged in or not an ADMIN
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 bg-rose-600/20 border border-rose-500/30 rounded-2xl flex items-center justify-center text-rose-500 mb-4 shadow-lg">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black tracking-tight mb-2">Access Unauthorized</h1>
        <p className="text-slate-400 text-sm max-w-md mb-6">
          You do not have the required administrative privileges to access the CineVault Ops Console.
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

  const navItems = [
    { path: 'analytics', label: 'Dashboard & Analytics', icon: TrendingUp },
    { path: 'shows', label: 'Showtimes & Scheduling', icon: Film },
    { path: 'screens', label: 'Screen Configurations', icon: Monitor },
  ];

  const getCurrentTitle = () => {
    const currentItem = navItems.find((item) => 
      matchPath({ path: `/admin/${item.path}`, end: true }, location.pathname) ||
      (location.pathname === '/admin' && item.path === 'analytics')
    );
    return currentItem ? currentItem.label : 'Dashboard & Analytics';
  };

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 1024) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans text-slate-900 relative overflow-x-hidden">
      
      {/* Backdrop Overlay for mobile/tablet when sidebar is open */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden transition-opacity"
        />
      )}

      {/* 1. Sidebar Navigation */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 bg-slate-900 text-white w-72 shrink-0 transition-all duration-300 ease-in-out flex flex-col justify-between border-r border-slate-800 shadow-2xl lg:shadow-none ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:-ml-72'
      }`}>
        
        {/* Top Brand & Header Section */}
        <div className="p-6 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-600/30 ring-2 ring-rose-500/20">
                <Ticket className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-base font-black tracking-tight text-white block leading-none">
                  Cine<span className="text-rose-500">Vault</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1 block">Ops Console</span>
              </div>
            </div>

            {/* Mobile/Tablet Close Button */}
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 px-3 pb-2">Management</div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeSidebarOnMobile}
                  className={({ isActive }) =>
                    `w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-bold transition-all cursor-pointer group ${
                      isActive
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/25 ring-1 ring-rose-500/30'
                        : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                    }`
                  }
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span className="truncate">{item.label}</span>
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/50 backdrop-blur-sm">
          <Link 
            to="/"
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-xl transition-all shadow-xs cursor-pointer group"
          >
            <LogOut className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" /> 
            <span>Exit to Public App</span>
          </Link>
        </div>
      </aside>

      {/* 2. Main Workspace Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50">
        
        {/* Workspace Topbar */}
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer flex items-center justify-center"
              title="Toggle Sidebar"
            >
              <Menu className="w-4 h-4" />
            </button>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 capitalize truncate">
              {getCurrentTitle()}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs text-slate-600 font-medium">
                Logged in as <strong className="text-slate-900 font-bold">Theater SuperAdmin</strong>
              </span>
            </div>
          </div>
        </header>

        {/* Dynamic Nested Route Content Outlet */}
        <main className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>

      </div>
    </div>
  );
}