
import React, { useState, useRef } from 'react';
import { Icons } from './Icon';
import { CloudImage } from '../types';
import { formatSize, generateId } from '../utils/storage';

interface DashboardProps {
  onEnterStudio: () => void;
  onEnterExplore: () => void;
  cloudImages: CloudImage[];
  onUpdateCloud: (images: CloudImage[]) => void;
}

type ModalType = 'docs' | 'usage' | 'updates' | 'no-ai' | 'credits' | 'cloud' | null;

export const Dashboard: React.FC<DashboardProps> = ({ 
  onEnterStudio, 
  onEnterExplore,
  cloudImages,
  onUpdateCloud
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
    if (availableSlots <= 0) {
      alert("La Nube ha alcanzado su límite de 9 retratos maestros.");
      return;
    }

    const filesToUpload = Array.from(files).slice(0, availableSlots);
    let newBatch: CloudImage[] = [];
    let processedCount = 0;

    filesToUpload.forEach((file: File) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newImg: CloudImage = {
          id: generateId('cloud_'),
          data: reader.result as string,
          name: file.name,
          size: file.size,
          createdAt: Date.now()
        };
        newBatch.push(newImg);
        processedCount++;
        
        if (processedCount === filesToUpload.length) {
          onUpdateCloud([...cloudImages, ...newBatch]);
        }
      };
      reader.readAsDataURL(file);
    });
    
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteCloudImg = (id: string) => {
    onUpdateCloud(cloudImages.filter(img => img.id !== id));
  };

  const sections = [
    {
      id: 'studio',
      title: 'Studio',
      description: 'Manuscritos',
      icon: <Icons.Pen size={14} />,
      action: onEnterStudio,
      primary: true
    },
    {
      id: 'explore',
      title: 'Explorar',
      description: 'Comunidad Real-time',
      icon: <Icons.Globe size={14} />,
      action: onEnterExplore,
      primary: true
    },
    {
      id: 'cloud',
      title: 'La Nube',
      description: 'Bóveda Visual',
      icon: <Icons.Cloud size={14} />,
      action: () => setActiveModal('cloud'),
      primary: false,
      extra: `${currentCount} / 9 Fotos`
    },
    {
      id: 'no-ai',
      title: 'Human-First',
      description: '100% Auténtico',
      icon: <Icons.NoAI size={14} />,
      action: () => setActiveModal('no-ai')
    },
    {
      id: 'credits',
      title: 'Créditos',
      description: 'Mentes Creativas',
      icon: <Icons.Book size={14} />,
      action: () => setActiveModal('credits')
    },
    {
      id: 'updates',
      title: 'v3.0.0',
      description: 'Modo Social',
      icon: <Icons.Zap size={14} />,
      notify: true,
      action: () => setActiveModal('updates')
    }
  ];

  const Modal = ({ title, children, onClose, wide = false }: { title: string, children?: React.ReactNode, onClose: () => void, wide?: boolean }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-ink-950/40 backdrop-blur-md animate-in fade-in duration-500">
      <div className={`bg-white/95 dark:bg-ink-950/95 backdrop-blur-3xl w-full ${wide ? 'max-w-4xl' : 'max-w-lg'} rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] border border-black/5 animate-in zoom-in-95 duration-500 overflow-hidden`}>
        <div className="p-8 md:p-12">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-xl font-serif font-bold text-ink-900 dark:text-white tracking-tight">{title}</h2>
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
              <Icons.X size={18} />
            </button>
          </div>
          <div className="prose dark:prose-invert max-w-none text-ink-600 dark:text-ink-400 text-xs leading-relaxed font-serif">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-ink-50 dark:bg-black p-8 md:p-20 lg:p-32 relative overflow-hidden custom-scrollbar">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-ink-200/10 dark:bg-white/5 rounded-full blur-[120px] pointer-events-none"></div>
      
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

        <div className="mb-20 animate-in fade-in slide-in-from-left duration-1000 delay-100">
          <p className="text-lg md:text-xl font-serif leading-relaxed text-ink-800 dark:text-ink-300 max-w-2xl">
            Ahora en tiempo real con Supabase. 
            <span className="block mt-6 text-ink-400 font-sans text-[9px] uppercase tracking-[0.4em] font-black opacity-40">
              Publica • Lee • Inspira • Sin IA
            </span>
          </p>
        </div>

        <div className="mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {sections.map((sec) => (
              <button 
                key={sec.id}
                onClick={sec.action}
                className={`
                  group relative px-4 py-5 text-left transition-all duration-700 rounded-2xl border flex items-center gap-4
                  ${sec.primary 
                    ? 'bg-ink-950 dark:bg-white text-white dark:text-black border-transparent shadow-xl hover:scale-[1.02]' 
                    : 'bg-white/40 dark:bg-ink-900/10 border-black/[0.04] dark:border-white/[0.04] hover:bg-white dark:hover:bg-ink-900/30 hover:border-black/10 dark:hover:border-white/10'}
                `}
              >
                <div className={`shrink-0 p-2 rounded-xl border ${sec.primary ? 'border-white/10 dark:border-black/5' : 'border-black/5 dark:border-white/5 opacity-40'}`}>
                  {sec.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-[11px] font-black mb-0 tracking-widest uppercase truncate">
                    {sec.title}
                  </h3>
                  <p className={`text-[9px] font-serif italic opacity-40 truncate`}>
                    {sec.extra || sec.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-auto pt-16 border-t border-black/5 dark:border-white/5">
           <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
            <div className="flex-1 space-y-6">
              <h3 className="text-[8px] font-black uppercase tracking-[0.5em] text-ink-300">Conectividad Supabase</h3>
              <div className="flex flex-wrap gap-x-12 gap-y-6">
                <div className="group">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-ink-900 dark:text-white mb-2 flex items-center gap-2">
                    <Icons.Globe size={10} className="text-amber-500" /> Historias Públicas
                  </h4>
                  <p className="text-[9px] text-ink-400 font-serif leading-relaxed italic max-w-[180px]">
                    Comparte tu arte con el mundo en tiempo real. Tu seudónimo es tu única huella.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeModal === 'cloud' && (
        <Modal title="La Nube - 9 Retratos Maestros" onClose={() => setActiveModal(null)} wide>
          <div className="flex flex-col gap-8">
            <div className="flex flex-col md:flex-row justify-between items-center p-6 bg-black/5 dark:bg-white/5 rounded-3xl gap-6">
               <div className="space-y-2 flex-1 w-full">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2">
                    <span>Casting Visual</span>
                    <span>{currentCount} / {maxSlots} Fotos</span>
                  </div>
                  <div className="h-2 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${currentCount >= maxSlots ? 'bg-amber-500' : 'bg-ink-900 dark:bg-white'}`} 
                      style={{ width: `${Math.min(100, Math.max(1, storagePercentage))}%` }}
                    ></div>
                  </div>
               </div>
               <button 
                 onClick={() => fileInputRef.current?.click()}
                 disabled={currentCount >= maxSlots}
                 className={`px-6 py-3 rounded-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg transition-all ${currentCount >= maxSlots ? 'bg-ink-200 text-ink-400 cursor-not-allowed' : 'bg-ink-900 dark:bg-white text-white dark:text-black hover:scale-105 active:scale-95'}`}
               >
                 <Icons.Upload size={14} /> {currentCount >= maxSlots ? 'Galería Llena' : 'Subir Foto'}
               </button>
               <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleUpload} />
            </div>

            <div className="grid grid-cols-3 gap-6">
              {cloudImages.map(img => (
                <div key={img.id} className="group relative aspect-square bg-black/5 dark:bg-white/5 rounded-3xl overflow-hidden border border-black/5 shadow-sm">
                  <img src={img.data} alt={img.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-5">
                    <p className="text-[10px] text-white font-mono truncate mb-2">{img.name}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] text-white/60 uppercase tracking-widest">{formatSize(img.size)}</span>
                      <button 
                        onClick={() => handleDeleteCloudImg(img.id)}
                        className="p-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors shadow-lg"
                      >
                        <Icons.Delete size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {Array.from({ length: Math.max(0, maxSlots - currentCount) }).map((_, i) => (
                <div key={`empty-${i}`} className="aspect-square border-2 border-dashed border-black/5 dark:border-white/5 rounded-3xl flex items-center justify-center opacity-20">
                  <span className="text-[10px] font-black opacity-10">Slot {currentCount + i + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}

      {activeModal === 'updates' && (
        <Modal title="Novedades v3.0.0" onClose={() => setActiveModal(null)}>
           <div className="space-y-6 py-4">
            <div className="flex gap-4">
              <div className="h-2 w-2 bg-amber-500 rounded-full mt-1.5 shrink-0"></div>
              <p><strong className="uppercase tracking-widest text-[10px]">Supabase Real-time</strong>: Ahora puedes publicar tus historias para que otros las lean. Tu seudónimo se genera automáticamente para tu tranquilidad.</p>
            </div>
            <div className="flex gap-4">
              <div className="h-2 w-2 bg-ink-900 dark:bg-white rounded-full mt-1.5 shrink-0"></div>
              <p><strong className="uppercase tracking-widest text-[10px]">Feed Comunitario</strong>: Explora lo que otros están escribiendo en tiempo real. Inspiración mutua sin algoritmos intrusivos.</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
