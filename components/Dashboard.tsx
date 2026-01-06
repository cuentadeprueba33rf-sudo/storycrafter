
import React, { useState } from 'react';
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
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);

  const mainActions = [
    { 
      id: 'studio', 
      title: 'Studio', 
      subtitle: 'Creación privada',
      description: 'Tus ideas convertidas en manuscritos.',
      icon: <Icons.Pen size={28} />, 
      action: onEnterStudio,
      accent: 'bg-ink-900 dark:bg-white text-white dark:text-black'
    },
    { 
      id: 'explore', 
      title: 'Explorar', 
      subtitle: 'Comunidad',
      description: 'Ecos literarios de otros autores.',
      icon: <Icons.Globe size={28} />, 
      action: onEnterExplore,
      accent: 'bg-white dark:bg-zinc-900 text-ink-900 dark:text-white border border-black/5 dark:border-white/10'
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-ink-50 dark:bg-black relative select-none overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-10%] w-[300px] md:w-[800px] h-[300px] md:h-[800px] bg-amber-500/5 rounded-full blur-[80px] md:blur-[160px]"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[250px] md:w-[600px] h-[250px] md:h-[600px] bg-ink-400/5 rounded-full blur-[70px] md:blur-[140px]"></div>
      </div>

      {/* Navigation Header */}
      <nav className="relative z-50 flex items-center justify-between px-6 md:px-16 py-6 md:py-8 shrink-0">
        <div className="flex items-center gap-3 group cursor-default">
          <div className="w-9 h-9 md:w-10 md:h-10 bg-ink-900 dark:bg-white text-white dark:text-black flex items-center justify-center rounded-xl shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
            <Icons.Book size={18} />
          </div>
          <div className="flex flex-col">
            <span className="text-lg md:text-xl font-serif font-black tracking-tighter leading-none">StoryCraft</span>
            <span className="text-[7px] md:text-[8px] font-mono uppercase tracking-[0.4em] opacity-40 mt-1">Professional</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-3 md:gap-5 pl-4 border-l border-black/10 dark:border-white/10">
              {isAdmin && onEnterAdmin && (
                <button 
                  onClick={onEnterAdmin}
                  className="p-2.5 bg-amber-500/10 text-amber-500 rounded-xl hover:bg-amber-500/20 transition-all group"
                  title="Panel de Administración"
                >
                  <Icons.Settings size={18} className="group-hover:rotate-90 transition-transform duration-500" />
                </button>
              )}
              <div className="text-right hidden xs:block">
                <div className="flex items-center gap-1.5 justify-end">
                  {isAdmin && <Icons.Check size={10} className="text-amber-500" strokeWidth={4} />}
                  <span className="text-[9px] font-black uppercase tracking-widest truncate max-w-[120px]">
                    {session.user.user_metadata.display_name}
                  </span>
                </div>
                <button onClick={onLogout} className="text-[8px] font-mono uppercase text-red-500 opacity-50 hover:opacity-100 transition-opacity">Salir del Studio</button>
              </div>
              <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl md:rounded-2xl flex items-center justify-center font-serif text-sm md:text-lg font-bold shadow-xl border border-white/20 ${isAdmin ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' : 'bg-ink-900 dark:bg-zinc-800 text-white'}`}>
                {session.user.user_metadata.display_name?.[0]}
              </div>
            </div>
          ) : (
            <button 
              onClick={onAuthOpen}
              className="px-4 py-2 md:px-6 md:py-2.5 bg-ink-900 dark:bg-white text-white dark:text-black rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              Entrar
            </button>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="relative flex-1 overflow-y-auto no-scrollbar pt-4 pb-20">
        <div className="flex flex-col items-center justify-center px-6 md:px-16 max-w-7xl mx-auto w-full min-h-full">
          
          <header className="text-center mb-12 md:mb-24 space-y-4 md:space-y-6 max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-3 px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 backdrop-blur-md">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] text-ink-500 dark:text-ink-400">V3.5.0 Professional</span>
            </div>
            <h1 className="text-5xl xs:text-6xl md:text-8xl lg:text-9xl font-serif font-black tracking-tighter text-ink-900 dark:text-white leading-[0.9] italic">
              Escribe tu <br/> <span className="text-amber-500">Legado.</span>
            </h1>
            <p className="text-base md:text-xl font-serif text-ink-500 dark:text-ink-400 max-w-md md:max-xl mx-auto leading-relaxed">
              La plataforma definitiva para el autor moderno. Sin distracciones, solo el peso de tus palabras.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 w-full max-w-5xl mb-12 md:mb-24">
            {mainActions.map((action) => (
              <button 
                key={action.id}
                onClick={action.action}
                onMouseEnter={() => setHoveredSection(action.id)}
                onMouseLeave={() => setHoveredSection(null)}
                className={`relative group p-6 sm:p-8 md:p-10 rounded-[2rem] md:rounded-[3rem] text-left transition-all duration-700 flex flex-col justify-between min-h-[220px] sm:min-h-[280px] md:min-h-[340px] overflow-hidden ${action.accent} ${hoveredSection && hoveredSection !== action.id ? 'md:scale-95 md:opacity-50 md:grayscale' : 'scale-100 shadow-2xl'}`}
              >
                <div className="absolute top-0 right-0 p-8 md:p-12 opacity-5 group-hover:scale-150 transition-transform duration-1000 hidden xs:block">
                  {action.icon}
                </div>
                
                <div className="relative z-10 flex flex-col gap-1 md:gap-2">
                  <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center mb-4 md:mb-6 shadow-inner ${action.id === 'studio' ? 'bg-white/10' : 'bg-black/5'}`}>
                    {React.cloneElement(action.icon as React.ReactElement, { size: 22 })}
                  </div>
                  <h3 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] mb-1 md:mb-2 opacity-60">{action.subtitle}</h3>
                  <h2 className="text-3xl md:text-5xl font-serif font-black italic">{action.title}</h2>
                </div>

                <div className="relative z-10 flex items-end justify-between">
                  <p className="text-[10px] md:text-xs font-serif italic max-w-[140px] md:max-w-[200px] leading-relaxed opacity-70">
                    {action.description}
                  </p>
                  <div className={`p-3 md:p-4 rounded-full transition-all duration-500 group-hover:rotate-45 ${action.id === 'studio' ? 'bg-white/20' : 'bg-black/10'}`}>
                    <Icons.ChevronRight size={18} className="md:w-6 md:h-6" />
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="w-full flex flex-wrap items-center justify-center gap-x-8 md:gap-x-12 gap-y-4 text-ink-300 dark:text-zinc-700 border-t border-black/5 dark:border-white/5 pt-8 md:pt-10 pb-4">
            <div className="flex items-center gap-2">
              <Icons.Cloud size={12} />
              <span className="text-[8px] font-black uppercase tracking-widest">Safe Cloud</span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.NoAI size={12} />
              <span className="text-[8px] font-black uppercase tracking-widest">100% Human</span>
            </div>
            <div className="flex items-center gap-2">
              <Icons.Zap size={12} />
              <span className="text-[8px] font-black uppercase tracking-widest">Fast Sync</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
