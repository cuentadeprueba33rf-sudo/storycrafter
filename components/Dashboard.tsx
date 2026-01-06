
import React, { useState } from 'react';
import { Icons } from './Icon';

interface DashboardProps {
  onEnterStudio: () => void;
}

type ModalType = 'docs' | 'usage' | 'updates' | 'no-ai' | null;

export const Dashboard: React.FC<DashboardProps> = ({ onEnterStudio }) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const sections = [
    {
      id: 'studio',
      title: 'Studio',
      description: 'Gestión de manuscritos.',
      icon: <Icons.Pen size={16} />,
      action: onEnterStudio,
      primary: true
    },
    {
      id: 'no-ai',
      title: 'Human-First',
      description: 'Escritura orgánica.',
      icon: <Icons.NoAI size={16} />,
      action: () => setActiveModal('no-ai')
    },
    {
      id: 'docs',
      title: 'Estructura',
      description: 'Jerarquía del taller.',
      icon: <Icons.Docs size={16} />,
      action: () => setActiveModal('docs')
    },
    {
      id: 'usage',
      title: 'Atajos',
      description: 'Flujo de trabajo.',
      icon: <Icons.Terminal size={16} />,
      action: () => setActiveModal('usage')
    },
    {
      id: 'updates',
      title: 'v1.4.2',
      description: 'Estable.',
      icon: <Icons.Alert size={16} />,
      notify: true,
      action: () => setActiveModal('updates')
    }
  ];

  const Modal = ({ title, children, onClose }: { title: string, children?: React.ReactNode, onClose: () => void }) => (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-ink-950/20 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white/95 dark:bg-ink-900/95 backdrop-blur-2xl w-full max-w-xl rounded-[2.5rem] shadow-2xl border border-black/5 animate-in zoom-in-95 duration-300 overflow-hidden">
        <div className="p-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-serif font-bold text-ink-900 dark:text-white">{title}</h2>
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
              <Icons.ZenClose size={20} />
            </button>
          </div>
          <div className="prose dark:prose-invert max-w-none text-ink-600 dark:text-ink-400 text-sm leading-relaxed font-serif">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-ink-50 dark:bg-black p-6 md:p-16 lg:p-24 relative overflow-hidden custom-scrollbar">
      {/* Sutil gradiente de profundidad */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(0,0,0,0.02),transparent)] pointer-events-none"></div>
      
      <div className="max-w-6xl mx-auto w-full flex flex-col min-h-full relative z-10">
        
        {/* Branding de Lujo */}
        <header className="mb-20 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="flex items-center gap-4 mb-6">
            <span className="text-[9px] font-mono uppercase tracking-[0.6em] text-ink-400">Artesanía Literaria</span>
            <div className="flex-1 h-[1px] bg-ink-900 dark:bg-white opacity-5"></div>
          </div>
          <h1 className="text-6xl md:text-8xl font-serif font-medium tracking-tighter text-ink-900 dark:text-white leading-none">
            Story<span className="italic font-light opacity-60">Craft</span>
          </h1>
        </header>

        {/* Manifiesto Refinado */}
        <div className="mb-24 max-w-xl animate-in fade-in slide-in-from-left duration-1000 delay-100">
          <p className="text-xl md:text-2xl font-serif leading-relaxed text-ink-800 dark:text-ink-200">
            Escritura pura para autores que dominan su oficio. 
            <span className="block mt-4 text-ink-400 font-sans text-[10px] uppercase tracking-[0.3em] font-black opacity-50">
              Sin distracciones • Sin algoritmos
            </span>
          </p>
        </div>

        {/* Consola de Herramientas (Cards Micro) */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[8px] font-black uppercase tracking-[0.4em] text-ink-400">Módulos de Control</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {sections.map((sec) => (
              <button 
                key={sec.id}
                onClick={sec.action}
                className={`
                  group relative p-4 text-left transition-all duration-500 rounded-2xl border flex flex-col justify-between h-36
                  ${sec.primary 
                    ? 'bg-ink-950 dark:bg-white text-white dark:text-black border-transparent shadow-lg hover:shadow-2xl hover:-translate-y-1' 
                    : 'bg-white/50 dark:bg-ink-900/20 backdrop-blur-sm border-black/[0.03] dark:border-white/[0.03] hover:border-black/10 dark:hover:border-white/10 hover:-translate-y-0.5'}
                `}
              >
                <div className="flex justify-between items-start">
                  <div className={`p-1.5 rounded-lg border ${sec.primary ? 'border-white/10 dark:border-black/5' : 'border-black/5 dark:border-white/5 bg-black/[0.01]'}`}>
                    {sec.icon}
                  </div>
                  {sec.notify && (
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]"></span>
                  )}
                </div>
                
                <div>
                  <h3 className="text-[11px] font-bold mb-0.5 tracking-tight uppercase">
                    {sec.title}
                  </h3>
                  <p className={`text-[8px] leading-tight opacity-40 font-medium`}>
                    {sec.description}
                  </p>
                </div>
              </button>
            ))}

            {/* Slots de Expansión (Look ultra-ligero) */}
            {[1, 2].map((i) => (
              <div key={i} className="p-4 rounded-2xl border border-dashed border-black/[0.05] dark:border-white/[0.05] flex flex-col items-center justify-center opacity-10 grayscale">
                 <Icons.Plus size={12} />
              </div>
            ))}
          </div>
        </div>

        {/* SECCIÓN DE FUTURAS EXTENSIONES (Studio Layers) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-t border-black/5 dark:border-white/5 animate-in fade-in duration-1000 delay-500">
          <div className="col-span-1 md:col-span-2 space-y-8">
            <h3 className="text-[8px] font-black uppercase tracking-[0.4em] text-ink-300">Próximas Capas del Studio</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              <div className="group cursor-help">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-ink-300 opacity-20 group-hover:opacity-100 transition-opacity"></div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-ink-900 dark:text-white">World Builder</h4>
                </div>
                <p className="text-[10px] text-ink-400 font-serif leading-relaxed italic pr-8">
                  Módulo de cartografía léxica y genealogía de personajes. Integración modular en v1.5.
                </p>
              </div>
              <div className="group cursor-help">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-ink-300 opacity-20 group-hover:opacity-100 transition-opacity"></div>
                  <h4 className="text-[10px] font-bold uppercase tracking-widest text-ink-900 dark:text-white">Timeline Lab</h4>
                </div>
                <p className="text-[10px] text-ink-400 font-serif leading-relaxed italic pr-8">
                  Cronologías no lineales con visualización de hilos narrativos. Desarrollo activo.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:items-end justify-end gap-6 border-l md:border-l-0 md:border-t-0 border-black/5 pl-6 md:pl-0">
             <div className="flex flex-col md:items-end gap-1">
               <span className="text-[8px] font-mono text-ink-300 uppercase tracking-[0.2em]">Estado del Kernel</span>
               <span className="text-[9px] font-black text-ink-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                 <span className="w-1 h-1 rounded-full bg-green-500"></span> 
                 v1.4.2 ESTABLE
               </span>
             </div>
             <div className="flex gap-4 text-[8px] font-mono text-ink-200 uppercase tracking-widest">
              <span className="hover:text-ink-900 dark:hover:text-white cursor-pointer transition-colors">Lab</span>
              <span className="hover:text-ink-900 dark:hover:text-white cursor-pointer transition-colors">Docs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modales con Refinamiento Visual */}
      {activeModal === 'docs' && (
        <Modal title="Sistema de Studio" onClose={() => setActiveModal(null)}>
          <div className="space-y-6">
            <p className="text-sm">StoryCraft utiliza un paradigma de <strong>Celdas de Escritura</strong>. Cada proyecto es un ecosistema modular diseñado para la longevidad digital.</p>
            <p className="text-xs opacity-60">La arquitectura actual permite la gestión de manuscritos complejos mediante una jerarquía plana pero escalable.</p>
          </div>
        </Modal>
      )}

      {activeModal === 'usage' && (
        <Modal title="Manual de Operaciones" onClose={() => setActiveModal(null)}>
          <div className="space-y-6">
            <div className="p-4 border border-black/5 rounded-2xl bg-black/[0.01]">
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-3">Modo Zen</h4>
              <p className="text-xs">Altamente recomendado para primeras versiones. Pulsa el icono de expansión para entrar en el estado de flujo absoluto.</p>
            </div>
            <div className="p-4 border border-black/5 rounded-2xl bg-black/[0.01]">
              <h4 className="text-[10px] font-black uppercase tracking-widest mb-3">Sync Local</h4>
              <p className="text-xs">Tus datos nunca abandonan este navegador. El guardado es instantáneo y persistente mediante el motor de base de datos local.</p>
            </div>
          </div>
        </Modal>
      )}

      {activeModal === 'no-ai' && (
        <Modal title="Manifiesto Humano" onClose={() => setActiveModal(null)}>
          <div className="space-y-8 text-center py-4">
            <p className="text-2xl font-serif italic text-ink-900 dark:text-white leading-snug">
              "La literatura es la última trinchera de la subjetividad humana."
            </p>
            <p className="text-xs uppercase tracking-[0.2em] opacity-50">
              StoryCraft Studio rechaza cualquier forma de asistencia algorítmica.<br/>Protegemos tu voz original.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};
