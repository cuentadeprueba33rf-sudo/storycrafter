
import React, { useState, useRef } from 'react';
import { Icons } from './Icon';
import { CloudImage } from '../types';
import { formatSize, generateId } from '../utils/storage';
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
  cloudImages,
  onUpdateCloud,
  session,
  onAuthOpen,
  onLogout,
  isAdmin
}) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sections = [
    { id: 'studio', title: 'Studio', description: 'Manuscritos', icon: <Icons.Pen size={14} />, action: onEnterStudio, primary: true },
    { id: 'explore', title: 'Explorar', description: 'Comunidad', icon: <Icons.Globe size={14} />, action: onEnterExplore, primary: true },
    { id: 'cloud', title: 'La Nube', description: 'Bóveda Visual', icon: <Icons.Cloud size={14} />, action: () => setActiveModal('cloud') },
    { id: 'credits', title: 'Admin Mode', description: isAdmin ? 'Activado' : 'V3.1.0', icon: <Icons.Zap size={14} />, action: () => {} }
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-ink-50 dark:bg-black p-8 md:p-20 lg:p-32 relative overflow-hidden custom-scrollbar">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-ink-200/10 dark:bg-white/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="absolute top-10 right-10 flex items-center gap-4 z-50">
        {session ? (
          <div className="flex items-center gap-4 bg-white/50 dark:bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl border border-black/5">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-black uppercase tracking-widest text-ink-900 dark:text-white">
                  {session.user.user_metadata.display_name}
                </span>
                {isAdmin && (
                  <div className="bg-amber-500 text-white rounded-full p-0.5" title="Verificado">
                    <Icons.Check size={8} strokeWidth={4} />
                  </div>
                )}
              </div>
              <button onClick={onLogout} className="text-[8px] font-black uppercase text-red-500 tracking-widest opacity-60 hover:opacity-100">Cerrar Sesión</button>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-serif font-bold italic shadow-lg ${isAdmin ? 'bg-amber-600' : 'bg-ink-900 dark:bg-ink-800'}`}>
              {session.user.user_metadata.display_name?.[0]}
            </div>
          </div>
        ) : (
          <button 
            onClick={onAuthOpen}
            className="flex items-center gap-3 bg-ink-900 dark:bg-white text-white dark:text-black px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all"
          >
            <Icons.UserPlus size={16} /> Entrar
          </button>
        )}
      </div>

      <div className="max-w-5xl mx-auto w-full flex flex-col min-h-full relative z-10">
        <header className="mb-16 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex items-center gap-6 mb-8">
            <div className="h-[1px] w-12 bg-ink-900 dark:bg-white"></div>
            <span className="text-[8px] font-black uppercase tracking-[0.8em] text-ink-400">Atelier Literario Global</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-serif font-light tracking-tighter text-ink-900 dark:text-white leading-none">
            Story<span className="opacity-30">Craft</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-20">
          {sections.map((sec) => (
            <button 
              key={sec.id} onClick={sec.action}
              className={`group p-6 text-left transition-all duration-500 rounded-3xl border flex flex-col gap-6 ${sec.primary ? 'bg-ink-950 dark:bg-white text-white dark:text-black shadow-2xl hover:scale-105' : 'bg-white/50 dark:bg-white/5 border-black/5'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${sec.primary ? 'border-white/10' : 'border-black/5'}`}>{sec.icon}</div>
              <div>
                <h3 className="text-[11px] font-black uppercase tracking-widest">{sec.title}</h3>
                <p className="text-[9px] font-serif italic opacity-40">{sec.description}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-auto p-10 bg-white/50 dark:bg-white/5 rounded-[3rem] border border-black/5">
           <div className="flex flex-col md:flex-row gap-10 items-center">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center text-amber-500"><Icons.Globe size={32} /></div>
              <div className="flex-1 text-center md:text-left">
                 <h4 className="text-[10px] font-black uppercase tracking-[0.3em] mb-2">Comunidad en Tiempo Real</h4>
                 <p className="text-sm font-serif italic text-ink-400">Publica tus obras, recibe ecos de otros autores y construye un legado compartido.</p>
              </div>
              {!session && (
                <button onClick={onAuthOpen} className="px-10 py-4 bg-ink-900 dark:bg-white text-white dark:text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl">Registrar Firma</button>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};
