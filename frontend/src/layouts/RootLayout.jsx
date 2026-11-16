import React, { useState } from 'react';
import { Outlet } from 'react-router';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';

export default function RootLayout() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    // Changed h-full to min-h-screen to guarantee full viewport height coverage
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900 selection:bg-rose-500 selection:text-white">
      {/* Global Light Navbar */}
      <Navbar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

      {/* Main Content Area - flex-1 pushes footer down */}
      <main className="flex-1 w-full">
        <Outlet context={{ searchQuery, setSearchQuery }} />
      </main>

      {/* Global Footer */}
      <Footer />
    </div>
  );
}