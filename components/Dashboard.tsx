
import React, { useState } from 'react';
import { Icons } from './Icon';
import { CloudImage } from '../types';
import { Session } from '@supabase/supabase-js';

interface DashboardProps {
  onEnterStudio: () => void;
  onEnterExplore: () => void;
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
      subtitle: 'Espacio de creación privada',
      description: 'Donde las ideas se convierten en manuscritos eternos.',
      icon: <Icons.Pen size={28} />, 
      action: onEnterStudio,
      accent: 'bg-ink-900 dark:bg-white text-white dark:text-black'
    },
    { 
      id: 'explore', 
      title: 'Explorar', 
      subtitle: 'El pulso de la comunidad',
      description: 'Descubre los ecos literarios de otros autores globales.',
      icon: <Icons.Globe size={28} />, 
      action: onEnterExplore,
      accent: 'bg-white dark:bg-ink-900 text-ink-900 dark:text-white border border-black/5 dark:border-white/10'
    }
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-ink-50 dark:bg-black relative select-none">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-[160px]"></div>
        <div className="absolute bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-ink-400/5 rounded-full blur-[140px]"></div>
      </div>

      {/* Navigation Header */}
      <nav className="relative z-50 flex items-center justify-between px-8 md:px-16 py-8">
        <div className="flex items-center gap-4 group cursor-default">
          <div className="w-10 h-10 bg-ink-900 dark:bg-white text-white dark:text-black flex items-center justify-center rounded-xl shadow-lg transform group-hover:rotate-12 transition-transform duration-500">
            <Icons.Book size={20} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-serif font-black tracking-tighter leading-none">StoryCraft</span>
            <span className="text-[8px] font-mono uppercase tracking-[0.4em] opacity-40 mt-1">Professional Workspace</span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {session ? (
            <div className="flex items-center gap-5 pl-5 border-l border-black/10 dark:border-white/10">
              <div className="text-right hidden sm:block">
                <div className="flex items-center gap-1.5 justify-end">
                  {isAdmin && <Icons.Check size={10} className="text-amber-500" strokeWidth={4} />}
                  <span className="text-[10px] font-black uppercase tracking-widest">{session.user.user_metadata.display_name}</span>
                </div>
                <button onClick={onLogout} className="text-[9px] font-mono uppercase text-red-500 opacity-50 hover:opacity-100 transition-opacity">Desconectar</button>
              </div>
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-serif text-lg font-bold shadow-xl border border-white/20 ${isAdmin ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-white' : 'bg-ink-900 dark:bg-zinc-800 text-white'}`}>
                {session.user.user_metadata.display_name?.[0]}
              </div>
            </div>
          ) : (
            <button 
              onClick={onAuthOpen}
              className="px-6 py-2.5 bg-ink-900 dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              Firmar Entrada
            </button>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 md:px-16 max-w-7xl mx-auto w-full">
        
        {/* Hero Section */}
        <header className="text-center mb-16 md:mb-24 space-y-6 max-w-3xl animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-ink-500 dark:text-ink-400">V3.5.0 Professional Edition</span>
          </div>
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-serif font-black tracking-tighter text-ink-900 dark:text-white leading-[0.85] italic">
            Escribe tu <br className="hidden md:block"/> <span className="text-amber-500">Legado.</span>
          </h1>
          <p className="text-lg md:text-xl font-serif text-ink-500 dark:text-ink-400 max-w-xl mx-auto leading-relaxed">
            La plataforma definitiva para el autor contemporáneo. Sin distracciones, sin algoritmos, solo el peso de tus palabras.
          </p>
        </header>

        {/* Action Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mb-24">
          {mainActions.map((action) => (
            <button 
              key={action.id}
              onClick={action.action}
              onMouseEnter={() => setHoveredSection(action.id)}
              onMouseLeave={() => setHoveredSection(null)}
              className={`relative group p-10 rounded-[3rem] text-left transition-all duration-700 flex flex-col justify-between min-h-[340px] overflow-hidden ${action.accent} ${hoveredSection && hoveredSection !== action.id ? 'scale-95 opacity-50 grayscale' : 'scale-100 shadow-2xl'}`}
            >
              {/* Card Background Pattern */}
              <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:scale-150 transition-transform duration-1000">
                {action.icon}
              </div>
              
              <div className="relative z-10 flex flex-col gap-2">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${action.id === 'studio' ? 'bg-white/10' : 'bg-black/5'}`}>
                  {action.icon}
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 opacity-60">{action.subtitle}</h3>
                <h2 className="text-5xl font-serif font-black italic">{action.title}</h2>
              </div>

              <div className="relative z-10 flex items-end justify-between">
                <p className="text-xs font-serif italic max-w-[200px] leading-relaxed opacity-70">
                  {action.description}
                </p>
                <div className={`p-4 rounded-full transition-all duration-500 group-hover:rotate-45 ${action.id === 'studio' ? 'bg-white/20' : 'bg-black/10'}`}>
                  <Icons.ChevronRight size={24} />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Bottom Utility Bar */}
        <div className="w-full flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-ink-300 dark:text-zinc-700 border-t border-black/5 dark:border-white/5 pt-10 pb-16">
          <div className="flex items-center gap-3">
            <Icons.Cloud size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">Almacenamiento Local Seguro</span>
          </div>
          <div className="flex items-center gap-3">
            <Icons.NoAI size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">100% Humano - Zero AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Icons.Zap size={14} />
            <span className="text-[9px] font-black uppercase tracking-widest">Latencia Zero</span>
          </div>
        </div>
      </div>
    </div>
  );
};
