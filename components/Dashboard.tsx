
import React, { useState } from 'react';
import { Icons } from './Icon';

interface DashboardProps {
  onEnterStudio: () => void;
  onEnterCharacters: () => void;
}

type ModalType = 'docs' | 'usage' | 'updates' | 'no-ai' | 'credits' | null;

export const Dashboard: React.FC<DashboardProps> = ({ onEnterStudio, onEnterCharacters }) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

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
      id: 'characters',
      title: 'Casting',
      description: 'Personajes',
      icon: <Icons.Characters size={14} />,
      action: onEnterCharacters,
      primary: false
    },
    {
      id: 'no-ai',
      title: 'Human-First',
      description: 'Sin Algoritmos',
      icon: <Icons.NoAI size={14} />,
      action: () => setActiveModal('no-ai')
    },
    {
      id: 'credits',
      title: 'Créditos',
      description: 'Creadores',
      icon: <Icons.Book size={14} />,
      action: () => setActiveModal('credits')
    },
    {
      id: 'docs',
      title: 'Sistema',
      description: 'Estructura',
      icon: <Icons.Docs size={14} />,
      action: () => setActiveModal('docs')
    },
    {
      id: 'usage',
      title: 'Comandos',
      description: 'Productividad',
      icon: <Icons.Terminal size={14} />,
      action: () => setActiveModal('usage')
    },
    {
      id: 'updates',
      title: 'v1.5.0',
      description: 'Casting Up',
      icon: <Icons.Alert size={14} />,
      notify: true,
      action: () => setActiveModal('updates')
    }
  ];

  const Modal = ({ title, children, onClose }: { title: string, children?: React.ReactNode, onClose: () => void }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-ink-950/40 backdrop-blur-md animate-in fade-in duration-500">
      <div className="bg-white/95 dark:bg-ink-950/95 backdrop-blur-3xl w-full max-w-lg rounded-[3rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] border border-black/5 animate-in zoom-in-95 duration-500 overflow-hidden">
        <div className="p-12">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-xl font-serif font-bold text-ink-900 dark:text-white tracking-tight">{title}</h2>
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
              <Icons.ZenClose size={18} />
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
            <span className="text-[8px] font-black uppercase tracking-[0.8em] text-ink-400">Atelier Literario</span>
          </div>
          <h1 className="text-7xl md:text-9xl font-serif font-light tracking-tighter text-ink-900 dark:text-white leading-none">
            Story<span className="opacity-30">Craft</span>
          </h1>
        </header>

        <div className="mb-20 max-lg animate-in fade-in slide-in-from-left duration-1000 delay-100">
          <p className="text-lg md:text-xl font-serif leading-relaxed text-ink-800 dark:text-ink-300">
            Escritura pura para autores que dominan su oficio. 
            <span className="block mt-6 text-ink-400 font-sans text-[9px] uppercase tracking-[0.4em] font-black opacity-40">
              Absencia de Algoritmo • Presencia de Autor
            </span>
          </p>
        </div>

        <div className="mb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2">
            {sections.map((sec) => (
              <button 
                key={sec.id}
                onClick={sec.action}
                className={`
                  group relative px-4 py-3 text-left transition-all duration-700 rounded-xl border flex items-center gap-4
                  ${sec.primary 
                    ? 'bg-ink-950 dark:bg-white text-white dark:text-black border-transparent shadow-md hover:shadow-xl hover:scale-[1.02]' 
                    : 'bg-white/40 dark:bg-ink-900/10 border-black/[0.04] dark:border-white/[0.04] hover:bg-white dark:hover:bg-ink-900/30 hover:border-black/10 dark:hover:border-white/10'}
                `}
              >
                <div className={`shrink-0 p-1.5 rounded-lg border ${sec.primary ? 'border-white/10 dark:border-black/5' : 'border-black/5 dark:border-white/5 opacity-40'}`}>
                  {sec.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="text-[10px] font-black mb-0 tracking-widest uppercase truncate">
                    {sec.title}
                  </h3>
                  <p className={`text-[8px] font-serif italic opacity-40 truncate`}>
                    {sec.description}
                  </p>
                </div>

                {sec.notify && (
                  <span className="h-1 w-1 rounded-full bg-amber-500 animate-pulse"></span>
                )}
              </button>
            ))}

            <div className="px-4 py-3 rounded-xl border border-dashed border-black/[0.05] dark:border-white/[0.05] flex items-center justify-center opacity-10 grayscale">
                 <Icons.Plus size={12} />
            </div>
          </div>
        </div>

        <div className="mt-auto pt-16 border-t border-black/5 dark:border-white/5 animate-in fade-in duration-1000 delay-300">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
            <div className="flex-1 space-y-6">
              <h3 className="text-[8px] font-black uppercase tracking-[0.5em] text-ink-300">Arquitectura del Studio</h3>
              <div className="flex flex-wrap gap-x-12 gap-y-6">
                <div className="group">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-ink-900 dark:text-white mb-2 flex items-center gap-2">
                    <Icons.Check size={10} className="text-green-500" /> Character Lab
                  </h4>
                  <p className="text-[9px] text-ink-400 font-serif leading-relaxed italic max-w-[180px]">
                    Visualización y gestión de casting literario. **Activo en v1.5**.
                  </p>
                </div>
                <div className="group">
                  <h4 className="text-[9px] font-black uppercase tracking-widest text-ink-900 dark:text-white mb-2 flex items-center gap-2">
                    <Icons.Plus size={10} className="opacity-20" /> Chronos Lab
                  </h4>
                  <p className="text-[9px] text-ink-400 font-serif leading-relaxed italic max-w-[180px]">
                    Visualización de hilos narrativos no lineales.
                  </p>
                </div>
              </div>
            </div>

            <div className="shrink-0 flex flex-col items-end gap-6">
              <div className="text-right">
                <div className="text-[7px] font-mono text-ink-300 uppercase tracking-[0.4em] mb-1">Motor del Studio</div>
                <div className="text-[9px] font-black text-ink-900 dark:text-white uppercase tracking-[0.2em] flex items-center justify-end gap-2">
                  v1.5.0 <span className="text-green-500">●</span>
                </div>
              </div>
              <div className="flex gap-6 text-[8px] font-mono text-ink-300 uppercase tracking-widest">
                <span className="hover:text-ink-900 dark:hover:text-white cursor-pointer transition-colors">Repositorio</span>
                <span className="hover:text-ink-900 dark:hover:text-white cursor-pointer transition-colors">Legal</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {activeModal === 'docs' && (
        <Modal title="Filosofía del Sistema" onClose={() => setActiveModal(null)}>
          <div className="space-y-8">
            <p>StoryCraft Studio opera bajo un paradigma de <strong>Escritura de Precisión</strong>. No es una herramienta de edición masiva, sino un espacio de concentración absoluta.</p>
            <p className="opacity-60 italic">Cada píxel está diseñado para no competir con tu imaginación.</p>
          </div>
        </Modal>
      )}

      {activeModal === 'usage' && (
        <Modal title="Instrucciones de Vuelo" onClose={() => setActiveModal(null)}>
          <div className="grid grid-cols-2 gap-8">
            <div className="space-y-2">
              <h4 className="text-[9px] font-black uppercase tracking-widest">Estado Zen</h4>
              <p className="text-[10px] opacity-60">F11 para inmersión total en el navegador junto con nuestro modo de expansión interna.</p>
            </div>
            <div className="space-y-2">
              <h4 className="text-[9px] font-black uppercase tracking-widest">Persistencia</h4>
              <p className="text-[10px] opacity-60">Guardado asíncrono en disco local. Tus datos son propiedad privada de tu hardware.</p>
            </div>
          </div>
        </Modal>
      )}

      {activeModal === 'no-ai' && (
        <Modal title="Manifiesto Humano" onClose={() => setActiveModal(null)}>
          <div className="space-y-10 py-6 text-center">
            <p className="text-3xl font-serif italic text-ink-950 dark:text-white leading-tight">
              "La palabra es el único territorio donde la máquina no puede entrar sin permiso."
            </p>
            <div className="h-[1px] w-8 bg-ink-200 mx-auto"></div>
            <p className="text-[10px] uppercase tracking-[0.3em] font-black opacity-40 leading-relaxed">
              En StoryCraft Studio, prohibimos el uso de modelos generativos.<br/>Abogamos por la belleza de la errata humana.
            </p>
          </div>
        </Modal>
      )}

      {activeModal === 'credits' && (
        <Modal title="Créditos del Studio" onClose={() => setActiveModal(null)}>
          <div className="space-y-12 py-8 text-center">
            <div className="space-y-6">
              <p className="text-[10px] uppercase tracking-[0.5em] font-black opacity-30 mb-8">Concepto y Desarrollo</p>
              <div className="space-y-4">
                <p className="text-4xl font-serif italic text-ink-950 dark:text-white tracking-tighter">SAM VERCE</p>
                <div className="h-[1px] w-4 bg-ink-200 mx-auto opacity-30"></div>
                <p className="text-4xl font-serif italic text-ink-950 dark:text-white tracking-tighter">SAMUEL CASSERES</p>
                <div className="h-[1px] w-4 bg-ink-200 mx-auto opacity-30"></div>
                <p className="text-4xl font-serif italic text-ink-950 dark:text-white tracking-tighter">NADIA CAROLINA</p>
              </div>
            </div>
            <div className="pt-10">
              <p className="text-[8px] font-mono text-ink-400 uppercase tracking-widest italic leading-relaxed">
                Hecho con la convicción de que<br/>la tecnología debe servir a la pluma.
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
