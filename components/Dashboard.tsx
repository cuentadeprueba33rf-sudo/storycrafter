
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
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050505] text-[#e5e5e5] selection:bg-amber-500/30 overflow-x-hidden relative font-sans">
      
      {/* Dynamic Atmospheric Background - Optimizado para rendimiento móvil */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[150vw] h-[150vh] bg-gradient-to-br from-amber-500/[0.04] via-transparent to-blue-500/[0.02] blur-[80px] md:blur-[150px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      {/* Architectural Top Bar - Adaptativa */}
      <nav className="relative z-[100] flex items-center justify-between px-6 py-8 md:px-10 md:py-10 shrink-0">
        <div className="flex items-center gap-4 md:gap-6 group cursor-default">
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 md:gap-3">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-amber-500 rounded-full animate-pulse"></span>
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-white/90">StoryCraft</span>
            </div>
            <span className="text-[6px] md:text-[7px] font-mono uppercase tracking-[0.3em] md:tracking-[0.4em] text-white/20 mt-1">v3.5 Mobile-Ready</span>
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-10">
          <div className="hidden lg:flex items-center gap-8 text-[9px] font-black uppercase tracking-[0.3em] text-white/40">
            <span className="hover:text-amber-500 transition-colors cursor-pointer">Archive</span>
            <span className="hover:text-amber-500 transition-colors cursor-pointer">Legacy</span>
          </div>

          {session ? (
            <div className="flex items-center gap-4 md:gap-6">
              <div className="flex flex-col items-end">
                <div className="flex items-center gap-1.5 md:gap-2">
                  {isAdmin && <Icons.Check size={8} className="text-amber-500 md:w-[10px]" strokeWidth={4} />}
                  <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-white/80 max-w-[80px] md:max-w-none truncate">
                    {session.user.user_metadata.display_name}
                  </span>
                </div>
                <button onClick={onLogout} className="text-[6px] md:text-[7px] font-mono uppercase tracking-widest text-white/20">Sign Out</button>
              </div>
              <div 
                onClick={onEnterStudio}
                className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/5 bg-white/[0.03] flex items-center justify-center cursor-pointer active:scale-90 md:hover:scale-110 transition-all shadow-2xl"
              >
                <Icons.Pen size={14} className="md:w-4" />
              </div>
            </div>
          ) : (
            <button 
              onClick={onAuthOpen}
              className="px-5 py-2.5 md:px-8 md:py-3 rounded-full border border-white/10 text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] active:bg-white active:text-black transition-all"
            >
              Auth
            </button>
          )}
        </div>
      </nav>

      {/* Main Composition - Mobile Flow */}
      <div className="relative flex-1 px-6 pb-20 md:px-10 md:pb-10 overflow-y-auto no-scrollbar flex flex-col">
        <div className="max-w-[1600px] mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-center lg:items-stretch">
          
          {/* Hero Column - The Statement */}
          <div className="lg:col-span-7 flex flex-col justify-center py-10 lg:py-0 relative">
            <div className="space-y-6 md:space-y-12 animate-elite text-center lg:text-left">
              <div className="inline-flex items-center gap-3 px-4 py-1.5 md:px-5 md:py-2 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-md">
                <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.4em] md:tracking-[0.5em] text-amber-500/80">Human Intelligence Only</span>
              </div>
              
              <div className="relative">
                <h1 className="text-5xl sm:text-7xl md:text-[11rem] font-serif italic font-light tracking-[-0.04em] leading-[0.9] lg:leading-[0.8] text-white">
                  Escribe tu <br/> 
                  <span className="font-sans not-italic font-black tracking-[-0.06em] md:tracking-[-0.08em] text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/20">
                    LEGADO
                  </span>
                </h1>
                <div className="absolute -left-4 lg:-left-8 top-1/2 -translate-y-1/2 w-[1px] h-16 lg:h-32 bg-gradient-to-b from-transparent via-amber-500/50 to-transparent hidden sm:block"></div>
              </div>

              <p className="text-sm md:text-2xl font-serif font-light italic text-white/40 max-w-xl leading-relaxed mx-auto lg:mx-0">
                "La palabra escrita es el único silencio que nunca termina." — Un espacio sagrado para el autor.
              </p>

              {/* Status Info Row */}
              <div className="flex items-center justify-center lg:justify-start gap-8 md:gap-12 pt-4 md:pt-8">
                <div className="flex flex-col gap-1 md:gap-2">
                  <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.4em] text-white/20">System Time</span>
                  <span className="text-sm md:text-xl font-mono font-light tracking-tighter text-amber-500/80">{formatTime(time).split(':').slice(0,2).join(':')}</span>
                </div>
                <div className="h-6 md:h-8 w-[1px] bg-white/5"></div>
                <div className="flex flex-col gap-1 md:gap-2">
                  <span className="text-[7px] md:text-[8px] font-black uppercase tracking-[0.4em] text-white/20">Active Nodes</span>
                  <span className="text-sm md:text-xl font-mono font-light tracking-tighter text-white/60">1.2K+ Authors</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Column - The Interface - Bento Mobile Adaptation */}
          <div className="lg:col-span-5 flex flex-col gap-6 md:gap-8 justify-center pb-12 lg:pb-0">
            
            {/* Studio Plate */}
            <div 
              onClick={onEnterStudio}
              className="group relative h-auto min-h-[180px] md:h-[320px] rounded-[2rem] md:rounded-[3rem] bg-white/[0.02] border border-white/[0.06] backdrop-blur-3xl overflow-hidden cursor-pointer transition-all duration-700 active:scale-95 md:hover:bg-white/[0.04] md:hover:-translate-y-2 flex flex-col justify-between p-8 md:p-12"
            >
              <div className="absolute top-0 right-0 p-8 md:p-12 opacity-[0.02] md:group-hover:opacity-[0.05] transition-opacity duration-1000">
                <Icons.Pen className="w-32 h-32 md:w-[280px] md:h-[280px]" strokeWidth={0.5} />
              </div>
              
              <div className="flex justify-between items-start relative z-10">
                <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white text-black flex items-center justify-center shadow-2xl">
                  <Icons.Pen size={18} className="md:w-6" />
                </div>
                <div className="flex flex-col items-end opacity-20 hidden xs:flex">
                  <span className="text-[6px] md:text-[8px] font-mono">WORKSPACE</span>
                  <span className="text-[6px] md:text-[8px] font-mono">#SC-2025</span>
                </div>
              </div>

              <div className="relative z-10 mt-6 lg:mt-0">
                <h3 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-amber-500 mb-2 md:mb-4">The Private Studio</h3>
                <h2 className="text-3xl md:text-5xl font-serif font-light italic text-white tracking-tight">Acceder a <br className="hidden sm:block"/>mi Obra</h2>
              </div>
            </div>

            {/* Explore Plate */}
            <div 
              onClick={onEnterExplore}
              className="group relative h-auto min-h-[180px] md:h-[320px] rounded-[2rem] md:rounded-[3rem] bg-gradient-to-br from-amber-500/[0.03] to-transparent border border-amber-500/10 backdrop-blur-3xl overflow-hidden cursor-pointer transition-all duration-700 active:scale-95 md:hover:border-amber-500/30 md:hover:-translate-y-2 flex flex-col justify-between p-8 md:p-12"
            >
              <div className="absolute top-0 right-0 p-8 md:p-12 opacity-[0.02] md:group-hover:opacity-[0.05] transition-opacity duration-1000">
                <Icons.Globe className="w-32 h-32 md:w-[280px] md:h-[280px]" strokeWidth={0.5} />
              </div>

              <div className="flex justify-between items-start relative z-10">
                <div className="w-10 h-10 md:w-16 md:h-16 rounded-xl md:rounded-2xl border border-white/10 bg-white/[0.03] text-white flex items-center justify-center shadow-2xl">
                  <Icons.Globe size={18} className="md:w-6" />
                </div>
                <Icons.ChevronRight size={18} className="opacity-20 md:w-6" />
              </div>

              <div className="relative z-10 mt-6 lg:mt-0">
                <h3 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.5em] text-white/30 mb-2 md:mb-4">Universal Feed</h3>
                <h2 className="text-3xl md:text-5xl font-serif font-light italic text-white tracking-tight">Explorar <br className="hidden sm:block"/>el Mundo</h2>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Floating Meta Bar - Responsive Positioning */}
      <div className="fixed bottom-6 md:bottom-10 left-6 right-6 md:left-10 md:right-10 flex flex-col sm:flex-row justify-between items-center z-[100] gap-4 pointer-events-none">
        <div className="flex items-center gap-4 md:gap-8 pointer-events-auto">
          {isAdmin && (
            <button 
              onClick={onEnterAdmin}
              className="px-5 py-2 md:px-6 md:py-2.5 rounded-full bg-amber-500 text-black text-[8px] md:text-[9px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] shadow-xl active:scale-95 transition-transform"
            >
              Admin
            </button>
          )}
          <div className="flex items-center gap-3 text-[6px] md:text-[7px] font-mono text-white/20 uppercase tracking-[0.3em] md:tracking-[0.4em]">
            <span className="hidden xs:block">Secure Cloud</span>
            <div className="w-1 h-1 bg-white/10 rounded-full hidden xs:block"></div>
            <span>No AI Policy</span>
          </div>
        </div>

        <div className="flex gap-3 pointer-events-auto">
          <div className="p-2.5 md:p-3 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-md text-white/30 active:text-white transition-colors cursor-pointer">
            <Icons.Settings size={12} className="md:w-[14px]" />
          </div>
          <div className="p-2.5 md:p-3 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-md text-white/30 active:text-white transition-colors cursor-pointer">
            <Icons.Docs size={12} className="md:w-[14px]" />
          </div>
        </div>
      </div>
    </div>
  );
};
