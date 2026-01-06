
import React, { useState, useEffect } from 'react';
import { Icons } from './Icon';
import { CloudImage } from '../types';
import { Session } from '@supabase/supabase-js';

interface DashboardProps {
  onEnterStudio: () => void;
  onEnterExplore: () => void;
  onEnterAdmin?: () => void;
  cloudImages: CloudImage[];
  onUpdateCloud: (images: CloudImage[]) => void;
  session: Session | null;
  onAuthOpen: () => void;
  onLogout: () => void;
  isAdmin?: boolean;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onEnterStudio, 
  onEnterExplore,
  onEnterAdmin,
  session,
  onAuthOpen,
  onLogout,
  isAdmin
}) => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050505] text-[#e5e5e5] selection:bg-amber-500/30 overflow-hidden relative font-sans">
      
      {/* Dynamic Atmospheric Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-25%] left-[-15%] w-[120vw] h-[120vh] bg-gradient-to-br from-amber-500/[0.04] via-transparent to-blue-500/[0.02] blur-[150px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      {/* Architectural Top Bar */}
      <nav className="relative z-[100] flex items-center justify-between px-10 py-10 shrink-0">
        <div className="flex items-center gap-6 group cursor-default">
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/90">StoryCraft</span>
            </div>
            <span className="text-[7px] font-mono uppercase tracking-[0.4em] text-white/20 mt-1">Institutional v3.5</span>
          </div>
        </div>

        <div className="flex items-center gap-10">
          <div className="hidden lg:flex items-center gap-8 text-[9px] font-black uppercase tracking-[0.3em] text-white/40">
            <span className="hover:text-amber-500 transition-colors cursor-pointer">Manifesto</span>
            <span className="hover:text-amber-500 transition-colors cursor-pointer">Archive</span>
            <span className="hover:text-amber-500 transition-colors cursor-pointer">Legacy</span>
          </div>
          
          <div className="h-4 w-[1px] bg-white/10 hidden lg:block"></div>

          {session ? (
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-2">
                  {isAdmin && <Icons.Check size={10} className="text-amber-500" strokeWidth={4} />}
                  <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/80">
                    {session.user.user_metadata.display_name}
                  </span>
                </div>
                <button onClick={onLogout} className="text-[7px] font-mono uppercase tracking-widest text-white/20 hover:text-red-500 transition-colors">Sign Out</button>
              </div>
              <div 
                onClick={onEnterStudio}
                className="w-12 h-12 rounded-full border border-white/5 bg-white/[0.03] flex items-center justify-center cursor-pointer hover:bg-white hover:text-black transition-all duration-700 hover:scale-110 active:scale-95 shadow-2xl"
              >
                <Icons.Pen size={16} />
              </div>
            </div>
          ) : (
            <button 
              onClick={onAuthOpen}
              className="px-8 py-3 rounded-full border border-white/10 text-[9px] font-black uppercase tracking-[0.4em] hover:bg-white hover:text-black transition-all duration-500"
            >
              Authorization
            </button>
          )}
        </div>
      </nav>

      {/* Main Composition */}
      <div className="relative flex-1 px-10 pb-10 overflow-hidden flex flex-col">
        <div className="max-w-[1600px] mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Hero Column - The Statement */}
          <div className="lg:col-span-7 flex flex-col justify-center relative">
            <div className="space-y-12 animate-elite">
              <div className="inline-flex items-center gap-4 px-5 py-2 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-md">
                <span className="text-[8px] font-black uppercase tracking-[0.5em] text-amber-500/80">Human Intelligence Only</span>
              </div>
              
              <div className="relative">
                <h1 className="text-7xl md:text-[11rem] font-serif italic font-light tracking-[-0.04em] leading-[0.8] text-white mix-blend-difference">
                  Escribe tu <br/> 
                  <span className="font-sans not-italic font-black tracking-[-0.08em] text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/20">
                    LEGADO
                  </span>
                </h1>
                <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-[1px] h-32 bg-gradient-to-b from-transparent via-amber-500/50 to-transparent"></div>
              </div>

              <p className="text-lg md:text-2xl font-serif font-light italic text-white/40 max-w-xl leading-relaxed">
                "La palabra escrita es el único silencio que nunca termina." — Un espacio sagrado para el autor que busca la excelencia.
              </p>

              <div className="flex items-center gap-12 pt-8">
                <div className="flex flex-col gap-2">
                  <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">System Time</span>
                  <span className="text-xl font-mono font-light tracking-tighter text-amber-500/80">{formatTime(time)}</span>
                </div>
                <div className="h-8 w-[1px] bg-white/5"></div>
                <div className="flex flex-col gap-2">
                  <span className="text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Active Nodes</span>
                  <span className="text-xl font-mono font-light tracking-tighter text-white/60">1,024 Authors</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Column - The Interface */}
          <div className="lg:col-span-5 flex flex-col gap-8 justify-center">
            
            {/* Studio Plate */}
            <div 
              onClick={onEnterStudio}
              className="group relative h-[320px] rounded-[3rem] bg-white/[0.02] border border-white/[0.06] backdrop-blur-3xl overflow-hidden cursor-pointer transition-all duration-700 hover:bg-white/[0.04] hover:-translate-y-2 hover:shadow-[0_40px_80px_rgba(0,0,0,0.5)] flex flex-col justify-between p-12"
            >
              <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-1000">
                <Icons.Pen size={280} strokeWidth={0.5} />
              </div>
              
              <div className="flex justify-between items-start relative z-10">
                <div className="w-16 h-16 rounded-2xl bg-white text-black flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-700">
                  <Icons.Pen size={24} />
                </div>
                <div className="flex flex-col items-end opacity-20">
                  <span className="text-[8px] font-mono">WORKSPACE_ID</span>
                  <span className="text-[8px] font-mono">#SC-2025-01</span>
                </div>
              </div>

              <div className="relative z-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500 mb-4">The Private Studio</h3>
                <h2 className="text-5xl font-serif font-light italic text-white tracking-tight">Acceder a <br/>mi Obra</h2>
              </div>
            </div>

            {/* Explore Plate */}
            <div 
              onClick={onEnterExplore}
              className="group relative h-[320px] rounded-[3rem] bg-gradient-to-br from-amber-500/[0.03] to-transparent border border-amber-500/10 backdrop-blur-3xl overflow-hidden cursor-pointer transition-all duration-700 hover:border-amber-500/30 hover:-translate-y-2 hover:shadow-[0_40px_80px_rgba(245,158,11,0.05)] flex flex-col justify-between p-12"
            >
              <div className="absolute top-0 right-0 p-12 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity duration-1000">
                <Icons.Globe size={280} strokeWidth={0.5} />
              </div>

              <div className="flex justify-between items-start relative z-10">
                <div className="w-16 h-16 rounded-2xl border border-white/10 bg-white/[0.03] text-white flex items-center justify-center shadow-2xl group-hover:scale-110 transition-transform duration-700">
                  <Icons.Globe size={24} />
                </div>
                <Icons.ChevronRight size={24} className="opacity-20 group-hover:translate-x-2 group-hover:text-amber-500 transition-all duration-700" />
              </div>

              <div className="relative z-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/30 mb-4">Universal Feed</h3>
                <h2 className="text-5xl font-serif font-light italic text-white tracking-tight">Explorar <br/>el Mundo</h2>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Floating Meta Bar */}
      <div className="fixed bottom-10 left-10 right-10 flex justify-between items-center z-[100] px-6 pointer-events-none">
        <div className="flex items-center gap-8 pointer-events-auto">
          {isAdmin && (
            <button 
              onClick={onEnterAdmin}
              className="px-6 py-2.5 rounded-full bg-amber-500 text-black text-[9px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-all shadow-xl"
            >
              System Admin
            </button>
          )}
          <div className="flex items-center gap-4 text-[7px] font-mono text-white/20 uppercase tracking-[0.4em]">
            <span>Secured By Cloud</span>
            <div className="w-1 h-1 bg-white/10 rounded-full"></div>
            <span>No AI Policy</span>
          </div>
        </div>

        <div className="flex gap-4 pointer-events-auto">
          <div className="p-3 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-md text-white/30 hover:text-white transition-colors cursor-pointer">
            <Icons.Settings size={14} />
          </div>
          <div className="p-3 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-md text-white/30 hover:text-white transition-colors cursor-pointer">
            {/* // Fixed: Use Icons.Docs instead of Icons.Info as defined in components/Icon.tsx */}
            <Icons.Docs size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};
