
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
      
      {/* Dynamic Atmospheric Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[150vw] h-[150vh] bg-gradient-to-br from-amber-500/[0.04] via-transparent to-blue-500/[0.02] blur-[80px] md:blur-[150px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      {/* Architectural Top Bar - Rediseñada para accesibilidad móvil */}
      <nav className="relative z-[100] flex items-center justify-between px-6 py-6 md:px-10 md:py-10 shrink-0">
        <div className="flex items-center gap-4 group cursor-default">
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 md:gap-3">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-amber-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-white/90">StoryCraft</span>
            </div>
            <span className="text-[7px] md:text-[8px] font-mono uppercase tracking-[0.3em] md:tracking-[0.4em] text-white/20 mt-1">Institutional Elite</span>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-8">
          {session ? (
            <div className="flex items-center gap-3 md:gap-5 bg-white/[0.03] md:bg-transparent border border-white/5 md:border-none p-1 md:p-0 rounded-full">
              <div className="hidden sm:flex flex-col items-end pr-2 border-r border-white/5">
                <div className="flex items-center gap-1.5">
                  {isAdmin && <Icons.Check size={8} className="text-amber-500" strokeWidth={4} />}
                  <span className="text-[9px] font-black uppercase tracking-widest text-white/80">
                    {session.user.user_metadata.display_name}
                  </span>
                </div>
                <span className="text-[7px] font-mono uppercase opacity-20 tracking-tighter">Autor Verificado</span>
              </div>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={onLogout}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-red-500/10 bg-red-500/5 flex items-center justify-center text-red-500/40 hover:text-red-500 hover:bg-red-500/10 active:scale-90 transition-all shadow-xl group/logout"
                  title="Cerrar Sesión"
                >
                  <Icons.Logout size={16} className="group-hover/logout:rotate-12 transition-transform md:w-5 md:h-5" />
                </button>
                
                <button 
                  onClick={onEnterStudio}
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full border border-white/5 bg-white/[0.05] flex items-center justify-center text-white cursor-pointer active:scale-90 md:hover:scale-110 transition-all shadow-2xl"
                  title="Mi Estudio"
                >
                  <Icons.Pen size={16} className="md:w-5 md:h-5" />
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={onAuthOpen}
              className="px-6 py-3 rounded-full border border-white/10 bg-white/[0.02] text-[9px] font-black uppercase tracking-[0.4em] active:bg-white active:text-black transition-all shadow-lg"
            >
              Acceso
            </button>
          )}
        </div>
      </nav>

      {/* Main Composition - Mobile Flow */}
      <div className="relative flex-1 px-6 pb-24 md:px-10 md:pb-10 overflow-y-auto no-scrollbar flex flex-col">
        <div className="max-w-[1600px] mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-center lg:items-stretch">
          
          {/* Hero Column - The Statement */}
          <div className="lg:col-span-7 flex flex-col justify-center py-12 lg:py-0 relative">
            <div className="space-y-8 md:space-y-14 animate-elite text-center lg:text-left">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-md">
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.5em] text-amber-500/80">Human Intelligence Only</span>
              </div>
              
              <div className="relative">
                <h1 className="text-6xl sm:text-8xl md:text-[11rem] font-serif italic font-light tracking-[-0.04em] leading-[0.9] lg:leading-[0.8] text-white">
                  Escribe tu <br/> 
                  <span className="font-sans not-italic font-black tracking-[-0.07em] md:tracking-[-0.08em] text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/20">
                    LEGADO
                  </span>
                </h1>
                <div className="absolute -left-4 lg:-left-10 top-1/2 -translate-y-1/2 w-[1px] h-20 lg:h-40 bg-gradient-to-b from-transparent via-amber-500/50 to-transparent hidden sm:block"></div>
              </div>

              <p className="text-base md:text-2xl font-serif font-light italic text-white/40 max-w-xl leading-relaxed mx-auto lg:mx-0">
                "La palabra escrita es el único silencio que nunca termina." — El portal profesional para el creador contemporáneo.
              </p>

              {/* Status Info Row */}
              <div className="flex items-center justify-center lg:justify-start gap-10 md:gap-16 pt-6 md:pt-10">
                <div className="flex flex-col gap-2">
                  <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] text-white/20">System Time</span>
                  <span className="text-lg md:text-2xl font-mono font-light tracking-tighter text-amber-500/80">{formatTime(time).split(':').slice(0,2).join(':')}</span>
                </div>
                <div className="h-8 md:h-12 w-[1px] bg-white/5"></div>
                <div className="flex flex-col gap-2">
                  <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] text-white/20">Authors</span>
                  <span className="text-lg md:text-2xl font-mono font-light tracking-tighter text-white/60">1,250+ Nodes</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Column - The Interface */}
          <div className="lg:col-span-5 flex flex-col gap-6 md:gap-10 justify-center pb-16 lg:pb-0">
            
            {/* Studio Plate */}
            <div 
              onClick={onEnterStudio}
              className="group relative h-auto min-h-[200px] md:h-[340px] rounded-[2.5rem] md:rounded-[4rem] bg-white/[0.02] border border-white/[0.06] backdrop-blur-3xl overflow-hidden cursor-pointer transition-all duration-700 active:scale-[0.97] md:hover:bg-white/[0.04] md:hover:-translate-y-3 flex flex-col justify-between p-10 md:p-14"
            >
              <div className="absolute top-0 right-0 p-10 md:p-14 opacity-[0.02] md:group-hover:opacity-[0.08] transition-opacity duration-1000">
                <Icons.Pen className="w-32 h-32 md:w-[280px] md:h-[280px]" strokeWidth={0.5} />
              </div>
              
              <div className="flex justify-between items-start relative z-10">
                <div className="w-12 h-12 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-white text-black flex items-center justify-center shadow-[0_20px_50px_rgba(255,255,255,0.1)]">
                  <Icons.Pen size={24} className="md:w-8 md:h-8" />
                </div>
                <div className="flex flex-col items-end opacity-20 hidden xs:flex">
                  <span className="text-[7px] md:text-[9px] font-mono">SC-PRIVATE</span>
                  <span className="text-[7px] md:text-[9px] font-mono">NODE_921</span>
                </div>
              </div>

              <div className="relative z-10 mt-10 lg:mt-0">
                <h3 className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.5em] text-amber-500 mb-3 md:mb-5">The Private Studio</h3>
                <h2 className="text-4xl md:text-6xl font-serif font-light italic text-white tracking-tight">Acceder a <br className="hidden sm:block"/>mi Obra</h2>
              </div>
            </div>

            {/* Explore Plate */}
            <div 
              onClick={onEnterExplore}
              className="group relative h-auto min-h-[200px] md:h-[340px] rounded-[2.5rem] md:rounded-[4rem] bg-gradient-to-br from-amber-500/[0.03] to-transparent border border-amber-500/10 backdrop-blur-3xl overflow-hidden cursor-pointer transition-all duration-700 active:scale-[0.97] md:hover:border-amber-500/40 md:hover:-translate-y-3 flex flex-col justify-between p-10 md:p-14"
            >
              <div className="absolute top-0 right-0 p-10 md:p-14 opacity-[0.02] md:group-hover:opacity-[0.08] transition-opacity duration-1000">
                <Icons.Globe className="w-32 h-32 md:w-[280px] md:h-[280px]" strokeWidth={0.5} />
              </div>

              <div className="flex justify-between items-start relative z-10">
                <div className="w-12 h-12 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] border border-white/10 bg-white/[0.03] text-white flex items-center justify-center shadow-2xl">
                  <Icons.Globe size={24} className="md:w-8 md:h-8" />
                </div>
                <Icons.ChevronRight size={24} className="opacity-20 md:w-8 md:h-8 group-hover:translate-x-2 transition-transform duration-500" />
              </div>

              <div className="relative z-10 mt-10 lg:mt-0">
                <h3 className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.5em] text-white/30 mb-3 md:mb-5">Universal Feed</h3>
                <h2 className="text-4xl md:text-6xl font-serif font-light italic text-white tracking-tight">Explorar <br className="hidden sm:block"/>el Mundo</h2>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Floating Meta Bar - Responsive Positioning */}
      <div className="fixed bottom-6 md:bottom-10 left-6 right-6 md:left-12 md:right-12 flex flex-col sm:flex-row justify-between items-center z-[100] gap-5 pointer-events-none">
        <div className="flex items-center gap-5 md:gap-10 pointer-events-auto">
          {isAdmin && (
            <button 
              onClick={onEnterAdmin}
              className="px-6 py-2.5 md:px-8 md:py-3 rounded-full bg-amber-500 text-black text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_15px_30px_rgba(245,158,11,0.3)] active:scale-95 transition-transform"
            >
              System Admin
            </button>
          )}
          <div className="flex items-center gap-4 text-[7px] md:text-[8px] font-mono text-white/20 uppercase tracking-[0.4em]">
            <span className="hidden xs:block">Secure Cloud Sync</span>
            <div className="w-1 h-1 bg-white/10 rounded-full hidden xs:block"></div>
            <span>Verified Human</span>
          </div>
        </div>

        <div className="flex gap-4 pointer-events-auto">
          <div className="p-3 md:p-4 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-md text-white/30 active:text-white transition-colors cursor-pointer hover:bg-white/5">
            <Icons.Settings size={14} className="md:w-[18px] md:h-[18px]" />
          </div>
          <div className="p-3 md:p-4 rounded-full border border-white/5 bg-white/[0.02] backdrop-blur-md text-white/30 active:text-white transition-colors cursor-pointer hover:bg-white/5">
            <Icons.Docs size={14} className="md:w-[18px] md:h-[18px]" />
          </div>
        </div>
      </div>
    </div>
  );
};
