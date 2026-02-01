
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
      
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[150vw] h-[150vh] bg-gradient-to-br from-amber-500/[0.04] via-transparent to-blue-500/[0.02] blur-[150px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      {/* Top Bar Navigation */}
      <nav className="relative z-[100] flex items-center justify-between px-6 py-6 md:px-12 md:py-10 shrink-0">
        <div className="flex items-center gap-4 group cursor-default">
          <div className="flex flex-col items-start">
            <div className="flex items-center gap-3">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-black uppercase tracking-[0.6em] text-ink-900">StoryCraft</span>
            </div>
            <span className="text-[8px] font-mono uppercase tracking-[0.4em] text-ink-300 mt-1">Institutional Creative Studio</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
           <button 
              onClick={onEnterExplore}
              className="px-6 py-3 rounded-full bg-black/5 text-ink-600 text-[9px] font-black uppercase tracking-[0.4em] hover:bg-black/10 transition-all flex items-center gap-3"
            >
              <Icons.Globe size={14} />
              Explorar Comunidad
            </button>
           <button 
              onClick={onEnterStudio}
              className="px-8 py-3 rounded-full bg-ink-900 text-white text-[9px] font-black uppercase tracking-[0.4em] active:scale-95 transition-all shadow-xl hover:shadow-amber-500/10"
            >
              Ir al Studio
            </button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative flex-1 px-6 pb-24 md:px-12 md:pb-12 overflow-y-auto no-scrollbar flex flex-col">
        <div className="max-w-[1600px] mx-auto w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center lg:items-stretch">
          
          {/* Left Side: Hero Text */}
          <div className="lg:col-span-6 flex flex-col justify-center py-12 lg:py-0 relative">
            <div className="space-y-10 md:space-y-14 animate-elite text-center lg:text-left">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full border border-black/5 bg-white/50 backdrop-blur-md">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                <span className="text-[9px] font-black uppercase tracking-[0.5em] text-ink-400">Servidor de Comunidad En Línea</span>
              </div>
              
              <div className="relative">
                <h1 className="text-7xl sm:text-8xl md:text-[10rem] font-serif italic font-light tracking-[-0.04em] leading-[0.85] text-ink-900">
                  Escribe tu <br/> 
                  <span className="font-sans not-italic font-black tracking-[-0.07em] text-transparent bg-clip-text bg-gradient-to-r from-ink-900 to-amber-600/60">
                    LEGADO
                  </span>
                </h1>
              </div>

              <p className="text-lg md:text-2xl font-serif font-light italic text-ink-400 max-w-xl leading-relaxed mx-auto lg:mx-0">
                Un estudio de escritura manual conectado a una galería global de autores independientes. Sin cuentas, solo talento.
              </p>

              <div className="flex items-center justify-center lg:justify-start gap-12 pt-6">
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-ink-200">Reloj de Autor</span>
                  <span className="text-2xl font-mono font-light tracking-tighter text-amber-500">{formatTime(time).split(':').slice(0,2).join(':')}</span>
                </div>
                <div className="h-10 w-[1px] bg-black/5"></div>
                <div className="flex flex-col gap-2">
                  <span className="text-[9px] font-black uppercase tracking-[0.4em] text-ink-200">Publicaciones</span>
                  <span className="text-2xl font-mono font-light tracking-tighter text-ink-400">Globales</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Navigation Cards */}
          <div className="lg:col-span-6 flex flex-col md:flex-row gap-6 md:gap-8 justify-center items-stretch py-12">
            
            {/* Studio Card */}
            <div 
              onClick={onEnterStudio}
              className="group relative flex-1 min-h-[400px] rounded-[3rem] bg-ink-900 text-white overflow-hidden cursor-pointer transition-all duration-700 hover:scale-[1.02] hover:shadow-[0_40px_80px_rgba(0,0,0,0.15)] flex flex-col justify-between p-12"
            >
              <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity duration-1000 rotate-12">
                <Icons.Pen size={180} strokeWidth={0.5} />
              </div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-[1.5rem] bg-white text-black flex items-center justify-center shadow-2xl mb-8 group-hover:scale-110 transition-transform">
                  <Icons.Pen size={28} />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-amber-500 mb-2">My Archive</h3>
                <h2 className="text-4xl md:text-5xl font-serif italic font-bold leading-tight">Acceder al <br/>Studio</h2>
              </div>

              <div className="relative z-10 flex items-center gap-3">
                 <span className="text-[9px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">Abrir mis borradores</span>
                 <Icons.ChevronRight size={14} className="group-hover:translate-x-2 transition-transform" />
              </div>
            </div>

            {/* Community Card */}
            <div 
              onClick={onEnterExplore}
              className="group relative flex-1 min-h-[400px] rounded-[3rem] bg-white border border-black/5 overflow-hidden cursor-pointer transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl flex flex-col justify-between p-12"
            >
              <div className="absolute top-0 right-0 p-12 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-1000 -rotate-12">
                <Icons.Globe size={180} strokeWidth={0.5} />
              </div>
              
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-[1.5rem] bg-amber-500 text-white flex items-center justify-center shadow-xl mb-8 group-hover:scale-110 transition-transform">
                  <Icons.Globe size={28} />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-ink-300 mb-2">Global Feed</h3>
                <h2 className="text-4xl md:text-5xl font-serif italic font-bold leading-tight text-ink-900">Explorar <br/>Comunidad</h2>
              </div>

              <div className="relative z-10 flex items-center gap-3 text-ink-400">
                 <span className="text-[9px] font-black uppercase tracking-widest opacity-40 group-hover:opacity-100 transition-opacity">Leer obras publicadas</span>
                 <Icons.ChevronRight size={14} className="group-hover:translate-x-2 transition-transform" />
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="fixed bottom-10 left-12 right-12 hidden md:flex justify-between items-center z-[100] pointer-events-none">
        <div className="flex items-center gap-4 text-[8px] font-mono text-ink-200 uppercase tracking-[0.4em]">
          <span>© 2025 StoryCraft Digital</span>
          <div className="w-1 h-1 bg-ink-100 rounded-full"></div>
          <span>Escritura 100% Humana</span>
        </div>
      </div>
    </div>
  );
};
