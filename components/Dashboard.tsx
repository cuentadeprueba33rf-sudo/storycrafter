
import React, { useState, useEffect } from 'react';
import { Icons } from './Icon';
import { CloudImage } from '../types';

interface DashboardProps {
  onEnterStudio: () => void;
  onEnterExplore: () => void;
  cloudImages: CloudImage[];
  onUpdateCloud: (images: CloudImage[]) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ 
  onEnterStudio, 
  onEnterExplore,
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
    <div className="flex-1 flex flex-col h-full bg-white text-ink-900 selection:bg-amber-500/10 overflow-x-hidden relative font-sans">
      
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[150vw] h-[150vh] bg-gradient-to-br from-amber-500/[0.03] via-transparent to-blue-500/[0.01] blur-[80px] md:blur-[150px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.02] mix-blend-overlay"></div>
      </div>

      {/* Top Bar Simplified */}
      <nav className="relative z-[100] flex items-center justify-between px-6 py-6 md:px-10 md:py-10 shrink-0">
        <div className="flex items-center gap-4 group cursor-default">
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-2 md:gap-3">
              <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-amber-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] md:tracking-[0.6em] text-ink-900">StoryCraft</span>
            </div>
            <span className="text-[7px] md:text-[8px] font-mono uppercase tracking-[0.3em] md:tracking-[0.4em] text-ink-300 mt-1">Estudio de Autor Local</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <button 
              onClick={onEnterStudio}
              className="px-6 py-3 rounded-full bg-ink-900 text-white text-[9px] font-black uppercase tracking-[0.4em] active:scale-95 transition-all shadow-xl"
            >
              Entrar al Studio
            </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative flex-1 px-6 pb-24 md:px-10 md:pb-10 overflow-y-auto no-scrollbar flex flex-col">
        <div className="max-w-[1600px] mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10 items-center lg:items-stretch">
          
          <div className="lg:col-span-7 flex flex-col justify-center py-12 lg:py-0 relative">
            <div className="space-y-8 md:space-y-14 animate-elite text-center lg:text-left">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-black/5 bg-black/[0.01] backdrop-blur-md">
                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.5em] text-amber-500/80">Privacidad Total Garantizada</span>
              </div>
              
              <div className="relative">
                <h1 className="text-6xl sm:text-8xl md:text-[11rem] font-serif italic font-light tracking-[-0.04em] leading-[0.9] lg:leading-[0.8] text-ink-900">
                  Escribe tu <br/> 
                  <span className="font-sans not-italic font-black tracking-[-0.07em] md:tracking-[-0.08em] text-transparent bg-clip-text bg-gradient-to-r from-ink-900 via-ink-900 to-ink-900/40">
                    LEGADO
                  </span>
                </h1>
              </div>

              <p className="text-base md:text-2xl font-serif font-light italic text-ink-400 max-w-xl leading-relaxed mx-auto lg:mx-0">
                Tu estudio personal fuera de línea. Sin cuentas, sin rastreo, solo tú y tu obra.
              </p>

              <div className="flex items-center justify-center lg:justify-start gap-10 md:gap-16 pt-6 md:pt-10">
                <div className="flex flex-col gap-2">
                  <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] text-ink-200">Hora Local</span>
                  <span className="text-lg md:text-2xl font-mono font-light tracking-tighter text-amber-500/80">{formatTime(time).split(':').slice(0,2).join(':')}</span>
                </div>
                <div className="h-8 md:h-12 w-[1px] bg-black/5"></div>
                <div className="flex flex-col gap-2">
                  <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.4em] text-ink-200">Modo</span>
                  <span className="text-lg md:text-2xl font-mono font-light tracking-tighter text-ink-400">100% Local</span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 flex flex-col gap-6 md:gap-10 justify-center pb-16 lg:pb-0">
            <div 
              onClick={onEnterStudio}
              className="group relative h-auto min-h-[300px] md:h-full rounded-[2.5rem] md:rounded-[4rem] bg-ink-100/30 border border-black/[0.04] backdrop-blur-3xl overflow-hidden cursor-pointer transition-all duration-700 active:scale-[0.97] md:hover:bg-white md:hover:shadow-2xl md:hover:-translate-y-3 flex flex-col justify-between p-10 md:p-14"
            >
              <div className="absolute top-0 right-0 p-10 md:p-14 opacity-[0.03] md:group-hover:opacity-[0.08] transition-opacity duration-1000">
                <Icons.Pen className="w-32 h-32 md:w-[280px] md:h-[280px]" strokeWidth={0.5} />
              </div>
              
              <div className="flex justify-between items-start relative z-10">
                <div className="w-12 h-12 md:w-20 md:h-20 rounded-2xl md:rounded-[2rem] bg-ink-900 text-white flex items-center justify-center shadow-xl">
                  <Icons.Pen size={24} />
                </div>
              </div>

              <div className="relative z-10 mt-10 lg:mt-0">
                <h3 className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.5em] text-amber-600 mb-3 md:mb-5">Private Archive</h3>
                <h2 className="text-4xl md:text-6xl font-serif font-light italic text-ink-900 tracking-tight">Acceder al <br/>Manuscrito</h2>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 md:bottom-10 left-6 right-6 md:left-12 md:right-12 flex flex-col sm:flex-row justify-between items-center z-[100] gap-5 pointer-events-none">
        <div className="flex items-center gap-4 text-[7px] md:text-[8px] font-mono text-ink-200 uppercase tracking-[0.4em]">
          <span>Offline Encryption</span>
          <div className="w-1 h-1 bg-ink-100 rounded-full"></div>
          <span>No Cloud Sync</span>
        </div>

        <div className="flex gap-4 pointer-events-auto">
          <div className="p-3 md:p-4 rounded-full border border-black/5 bg-white backdrop-blur-md text-ink-300 active:text-ink-900 transition-colors cursor-pointer hover:shadow-xl">
            <Icons.Settings size={14} />
          </div>
        </div>
      </div>
    </div>
  );
};
