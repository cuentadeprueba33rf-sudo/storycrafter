
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
}

type ModalType = 'cloud' | 'updates' | 'no-ai' | 'credits' | null;

export const Dashboard: React.FC<DashboardProps> = ({ 
  onEnterStudio, 
  onEnterExplore,
  cloudImages,
  onUpdateCloud,
  session,
  onAuthOpen,
  onLogout
}) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSlots = 9; 
  const currentCount = cloudImages.length;
  const storagePercentage = (currentCount / maxSlots) * 100;

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const availableSlots = maxSlots - cloudImages.length;
    if (availableSlots <= 0) return;
    const filesToUpload = Array.from(files).slice(0, availableSlots);
    filesToUpload.forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdateCloud([...cloudImages, {
          id: generateId('cloud_'),
          data: reader.result as string,
          name: file.name,
          size: file.size,
          createdAt: Date.now()
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const sections = [
    { id: 'studio', title: 'Studio', description: 'Manuscritos', icon: <Icons.Pen size={14} />, action: onEnterStudio, primary: true },
    { id: 'explore', title: 'Explorar', description: 'Comunidad', icon: <Icons.Globe size={14} />, action: onEnterExplore, primary: true },
    { id: 'cloud', title: 'La Nube', description: 'Bóveda Visual', icon: <Icons.Cloud size={14} />, action: () => setActiveModal('cloud') },
    { id: 'credits', title: 'V3.0.1', description: 'Autenticación', icon: <Icons.Zap size={14} />, action: () => setActiveModal('updates') }
  ];

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-ink-50 dark:bg-black p-8 md:p-20 lg:p-32 relative overflow-hidden custom-scrollbar">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-ink-200/10 dark:bg-white/5 rounded-full blur-[120px] pointer-events-none"></div>
      
      {/* User Header */}
      <div className="absolute top-10 right-10 flex items-center gap-4 z-50">
        {session ? (
          <div className="flex items-center gap-4 bg-white/50 dark:bg-white/5 backdrop-blur-md px-6 py-3 rounded-2xl border border-black/5">
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black uppercase tracking-widest text-ink-900 dark:text-white">{session.user.user_metadata.display_name}</span>
              <button onClick={onLogout} className="text-[8px] font-black uppercase text-red-500 tracking-widest opacity-60 hover:opacity-100">Cerrar Sesión</button>
            </div>
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-white font-serif font-bold italic shadow-lg">
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

      {activeModal === 'cloud' && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-ink-950/40 backdrop-blur-md">
           <div className="bg-white dark:bg-ink-950 w-full max-w-4xl rounded-[3rem] p-12 overflow-hidden shadow-2xl border border-black/5">
              <div className="flex justify-between items-center mb-10">
                <h2 className="text-xl font-serif font-bold">La Bóveda Visual</h2>
                <button onClick={() => setActiveModal(null)} className="p-2 hover:bg-black/5 rounded-full"><Icons.X size={20} /></button>
              </div>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                 {cloudImages.map(img => (
                   <div key={img.id} className="aspect-square rounded-2xl overflow-hidden relative group">
                      <img src={img.data} className="w-full h-full object-cover" />
                      <button onClick={() => onUpdateCloud(cloudImages.filter(i => i.id !== img.id))} className="absolute inset-0 bg-red-500/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"><Icons.Delete size={20} /></button>
                   </div>
                 ))}
                 {currentCount < 9 && (
                   <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-2xl border-2 border-dashed border-black/5 flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity"><Icons.Plus size={24} /></button>
                 )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleUpload} />
           </div>
        </div>
      )}
    </div>
  );
};
