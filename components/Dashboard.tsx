
import React, { useState } from 'react';
import { Icons } from './Icon';

interface DashboardProps {
  onEnterStudio: () => void;
  onSetDarkMode: (val: boolean) => void;
  darkMode: boolean;
}

type ModalType = 'docs' | 'usage' | 'updates' | 'no-ai' | null;

export const Dashboard: React.FC<DashboardProps> = ({ onEnterStudio, onSetDarkMode, darkMode }) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const sections = [
    {
      id: 'studio',
      title: 'Studio Creativo',
      description: 'Accede a tus proyectos y manuscritos con control absoluto.',
      icon: <Icons.Pen size={28} />,
      action: onEnterStudio,
      primary: true
    },
    {
      id: 'no-ai',
      title: 'Filosofía Zero-IA',
      description: 'Defendemos la imperfección humana. Sin algoritmos generativos.',
      icon: <Icons.NoAI size={28} />,
      tag: '100% Humano',
      action: () => setActiveModal('no-ai')
    },
    {
      id: 'docs',
      title: 'Documentación',
      description: 'Guía completa sobre la jerarquía y estructura del estudio.',
      icon: <Icons.Docs size={28} />,
      action: () => setActiveModal('docs')
    },
    {
      id: 'usage',
      title: 'Guía de Uso',
      description: 'Aprende atajos y optimiza tu flujo de trabajo editorial.',
      icon: <Icons.Terminal size={28} />,
      action: () => setActiveModal('usage')
    },
    {
      id: 'updates',
      title: 'Actualizaciones',
      description: 'v1.4.2 - Sistema de compartición y corrección de carpetas.',
      icon: <Icons.Alert size={28} />,
      notify: true,
      action: () => setActiveModal('updates')
    }
  ];

  const Modal = ({ title, children, onClose }: { title: string, children?: React.ReactNode, onClose: () => void }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white/90 dark:bg-ink-900/90 backdrop-blur-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-[3rem] shadow-2xl border border-white/20 dark:border-ink-700/30 animate-in zoom-in-95 duration-300">
        <div className="p-10">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-serif font-bold text-ink-900 dark:text-white">{title}</h2>
            <button onClick={onClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors">
              <Icons.Back size={20} className="rotate-90" />
            </button>
          </div>
          <div className="prose dark:prose-invert max-w-none text-ink-600 dark:text-ink-400 font-sans leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto bg-ink-50 dark:bg-black p-6 md:p-12 lg:p-20 relative overflow-hidden">
      {/* Background Decorative Elements for Glass Blur Effect */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-ink-200/40 dark:bg-ink-800/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[5%] right-[-10%] w-[50%] h-[50%] bg-ink-300/30 dark:bg-ink-900/30 rounded-full blur-[150px] pointer-events-none"></div>

      <div className="max-w-6xl mx-auto w-full flex flex-col h-full relative z-10">
        {/* Top Header Branding */}
        <header className="flex justify-between items-start mb-20 md:mb-32">
          <div className="animate-in slide-in-from-left duration-700">
            <h1 className="text-6xl md:text-8xl font-serif font-medium tracking-tighter text-ink-900 dark:text-white leading-none">
              StoryCraft
            </h1>
            <p className="mt-6 text-xs font-mono uppercase tracking-[0.6em] text-ink-400">
              EDITORIAL STUDIO / BY SAM VERCE
            </p>
          </div>
          <button 
            onClick={() => onSetDarkMode(!darkMode)}
            className="p-4 bg-white/40 dark:bg-ink-900/40 backdrop-blur-xl border border-white/20 dark:border-ink-800/30 rounded-[2rem] text-ink-500 hover:text-ink-900 dark:hover:text-white hover:shadow-xl transition-all active:scale-95"
          >
            {darkMode ? <Icons.Sun size={24} /> : <Icons.Moon size={24} />}
          </button>
        </header>

        {/* Hero Area / Intro */}
        <div className="mb-20 max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <p className="text-2xl md:text-3xl font-serif leading-tight text-ink-800 dark:text-ink-200">
            Escritura pura para autores que dominan su oficio. <span className="text-ink-400">Sin distracciones, sin interferencia algorítmica.</span>
          </p>
        </div>

        {/* Navigation Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
          {sections.map((sec) => (
            <button 
              key={sec.id}
              onClick={sec.action}
              className={`
                group relative p-10 text-left transition-all duration-500 rounded-[2.8rem] overflow-hidden
                ${sec.primary 
                  ? 'bg-ink-900/90 dark:bg-white/90 text-white dark:text-black backdrop-blur-2xl border border-white/10 dark:border-black/5 hover:shadow-2xl hover:-translate-y-2' 
                  : 'bg-white/40 dark:bg-ink-950/40 backdrop-blur-2xl border border-white/60 dark:border-ink-800/50 hover:border-ink-300 dark:hover:border-ink-600 hover:shadow-2xl hover:-translate-y-1'}
              `}
            >
              {/* Subtle inner glow for glass effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
              
              <div className={`relative z-10 mb-8 flex justify-between items-start ${sec.primary ? 'text-white dark:text-black' : 'text-ink-900 dark:text-white'}`}>
                <div className={`p-3 border rounded-2xl ${sec.primary ? 'border-white/20 dark:border-black/10' : 'border-ink-200 dark:border-ink-800'}`}>
                  {sec.icon}
                </div>
                {sec.tag && (
                  <span className="text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 border border-current rounded-full opacity-70">
                    {sec.tag}
                  </span>
                )}
                {sec.notify && (
                  <span className="relative flex h-3 w-3 mt-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-ink-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-ink-500"></span>
                  </span>
                )}
              </div>
              
              <h3 className={`relative z-10 text-2xl font-serif font-bold mb-3 ${sec.primary ? 'text-white dark:text-black' : 'text-ink-900 dark:text-white'}`}>
                {sec.title}
              </h3>
              <p className={`relative z-10 text-base leading-relaxed ${sec.primary ? 'text-ink-300 dark:text-ink-700' : 'text-ink-500'}`}>
                {sec.description}
              </p>

              {sec.primary && (
                <div className="relative z-10 mt-10 flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white dark:text-black opacity-60 group-hover:opacity-100 transition-opacity">
                  Comenzar sesión <Icons.ChevronRight size={14} />
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Branding Footer */}
        <footer className="mt-auto pt-16 border-t border-ink-200 dark:border-ink-800 flex flex-col md:flex-row justify-between items-center gap-8 pb-10">
          <div className="text-[10px] font-mono text-ink-400 uppercase tracking-[0.4em]">
            © 2024 SAM VERCE STUDIO. SINCRONIZACIÓN LOCAL ACTIVA.
          </div>
          <div className="flex gap-10 text-[10px] font-mono text-ink-300 dark:text-ink-700 uppercase tracking-widest">
            <span className="hover:text-ink-900 dark:hover:text-white cursor-pointer transition-colors">Privacidad</span>
            <span className="hover:text-ink-900 dark:hover:text-white cursor-pointer transition-colors">Editorial Labs</span>
            <span>v1.4.2 STABLE</span>
          </div>
        </footer>
      </div>

      {/* Modals Content */}
      {activeModal === 'docs' && (
        <Modal title="Documentación" onClose={() => setActiveModal(null)}>
          <div className="space-y-6">
            <section>
              <h4 className="text-ink-900 dark:text-white font-bold text-lg mb-2">Estructura de Manuscritos</h4>
              <p>StoryCraft utiliza un sistema jerárquico basado en Carpetas y Proyectos. Cada Proyecto se divide en Capítulos (Páginas), permitiendo una organización fluida de obras extensas.</p>
            </section>
            <section>
              <h4 className="text-ink-900 dark:text-white font-bold text-lg mb-2">Gestión de Metadatos</h4>
              <p>Cada historia contiene metadatos editables como Sinopsis, Géneros y Estado (Borrador, En Progreso, Finalizado). Estos se utilizan para filtrar y organizar tu librería profesionalmente.</p>
            </section>
            <section>
              <h4 className="text-ink-900 dark:text-white font-bold text-lg mb-2">Almacenamiento Local</h4>
              <p>Tus datos nunca salen de tu dispositivo. StoryCraft utiliza almacenamiento local persistente para garantizar que tu privacidad sea total y tus manuscritos sean solo tuyos.</p>
            </section>
          </div>
        </Modal>
      )}

      {activeModal === 'usage' && (
        <Modal title="Guía de Uso y Atajos" onClose={() => setActiveModal(null)}>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 border border-ink-100 dark:border-ink-800 rounded-2xl bg-black/5 dark:bg-white/5">
                <span className="text-xs font-mono text-ink-400 block mb-1">ACCION</span>
                <span className="text-ink-900 dark:text-white font-bold">Autoguardado</span>
              </div>
              <div className="p-4 border border-ink-100 dark:border-ink-800 rounded-2xl bg-black/5 dark:bg-white/5">
                <span className="text-xs font-mono text-ink-400 block mb-1">FRECUENCIA</span>
                <span className="text-ink-900 dark:text-white font-bold">Cada 1 segundo</span>
              </div>
            </div>
            <section>
              <h4 className="text-ink-900 dark:text-white font-bold text-lg mb-2">Atajos de Teclado</h4>
              <ul className="list-disc pl-5 space-y-2">
                <li><kbd className="px-2 py-1 bg-ink-100 dark:bg-ink-800 rounded">Esc</kbd> - Cerrar editor o modales.</li>
                <li><kbd className="px-2 py-1 bg-ink-100 dark:bg-ink-800 rounded">Ctrl + Shift + F</kbd> - Alternar modo oscuro/claro (en sistema).</li>
                <li>El sistema de navegación está optimizado para uso con mouse y trackpad para evitar errores de escritura accidental.</li>
              </ul>
            </section>
            <section>
              <h4 className="text-ink-900 dark:text-white font-bold text-lg mb-2">Contador de Palabras</h4>
              <p>El contador se actualiza en tiempo real tanto por capítulo como por proyecto total, permitiendo un seguimiento riguroso de tus metas de escritura diarias.</p>
            </section>
          </div>
        </Modal>
      )}

      {activeModal === 'updates' && (
        <Modal title="Actualizaciones y Notas" onClose={() => setActiveModal(null)}>
          <div className="space-y-8">
            <div className="relative pl-8 border-l-2 border-ink-900 dark:border-white">
              <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-ink-900 dark:bg-white"></span>
              <h4 className="text-ink-900 dark:text-white font-bold">Versión 1.4.2</h4>
              <span className="text-xs font-mono text-ink-400">MAY 2024</span>
              <ul className="mt-3 list-disc pl-5 space-y-1">
                <li>Añadido sistema de compartición de proyectos vía enlace directo.</li>
                <li>Rediseño de la interfaz del Dashboard con efecto glassmorphism.</li>
                <li>Optimización de los bordes redondeados y sombras dinámicas.</li>
              </ul>
            </div>
            <div className="relative pl-8 border-l-2 border-ink-200 dark:border-ink-800 opacity-60">
              <span className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-ink-200 dark:border-ink-800"></span>
              <h4 className="text-ink-900 dark:text-white font-bold">Versión 1.3.0</h4>
              <span className="text-xs font-mono text-ink-400">MAR 2024</span>
              <ul className="mt-3 list-disc pl-5 space-y-1">
                <li>Implementación de jerarquía de carpetas.</li>
                <li>Mejora en el rendimiento del editor con textos largos.</li>
              </ul>
            </div>
          </div>
        </Modal>
      )}

      {activeModal === 'no-ai' && (
        <Modal title="Manifiesto Humano" onClose={() => setActiveModal(null)}>
          <div className="space-y-6">
            <p className="text-xl font-serif italic text-ink-900 dark:text-white">"La literatura es el arte de la imperfección deliberada."</p>
            <p>En un mundo saturado de contenido generado por máquinas, StoryCraft Studio se posiciona como un refugio. Creemos que la IA diluye la voz del autor y homogeniza la creatividad.</p>
            <p className="font-bold text-ink-900 dark:text-white">Nuestro compromiso:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Cero sugerencias de texto automáticas.</li>
              <li>Sin resúmenes generados por algoritmos.</li>
              <li>Privacidad absoluta: Tus datos no se usan para entrenar modelos.</li>
              <li>Interfaz neutral que prioriza el pensamiento profundo sobre la rapidez artificial.</li>
            </ul>
            <p>Aquí, cada palabra es tuya. Cada error es un rastro de tu humanidad.</p>
          </div>
        </Modal>
      )}
    </div>
  );
};
