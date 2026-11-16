import React from 'react';
import { Ticket, Send } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 w-full mt-auto relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-600 flex items-center justify-center">
              <Ticket className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-white">
              Cine<span className="text-rose-500">Vault</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Your premium single-theater destination for IMAX, 4DX blockbusters, and seamless ticketing.
          </p>
        </div>
        
        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Quick Links</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li><a href="#" className="hover:text-rose-400 transition-colors">Now Showing</a></li>
            <li><a href="#" className="hover:text-rose-400 transition-colors">IMAX & 4DX Experiences</a></li>
            <li><a href="#" className="hover:text-rose-400 transition-colors">Upcoming Releases</a></li>
            <li><a href="#" className="hover:text-rose-400 transition-colors">Private Screenings</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Support</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li><a href="#" className="hover:text-rose-400 transition-colors">Help Center</a></li>
            <li><a href="#" className="hover:text-rose-400 transition-colors">Cancellation Policy</a></li>
            <li><a href="#" className="hover:text-rose-400 transition-colors">Privacy & Terms</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Stay Updated</h4>
          <p className="text-xs text-slate-400 mb-3">Get trailer drops and priority booking alerts.</p>
          <div className="flex gap-2">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 w-full"
            />
            <button className="bg-rose-600 hover:bg-rose-500 text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition-all shrink-0 cursor-pointer flex items-center justify-center">
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
        &copy; 2026 CineVault Cinemas
      </div>
    </footer>
  )
}