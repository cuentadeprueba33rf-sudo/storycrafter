
import React, { useState, useEffect, useRef } from 'react';
import { Story, Page, Genre, StoryStatus, EditorTheme } from '../types';
import { Icons } from './Icon';
import { ALL_GENRES, ALL_STATUSES, ID_PREFIX } from '../constants';
import { countWords, generateId } from '../utils/storage';

interface EditorProps {
  story: Story;
  onSave: (story: Story) => void;
  onClose: () => void;
  onShare: () => void;
  theme: EditorTheme;
  onChangeTheme: (theme: EditorTheme) => void;
}

export const Editor: React.FC<EditorProps> = ({ 
  story: initialStory, 
  onSave, 
  onClose, 
  onShare, 
  theme,
  onChangeTheme
}) => {
  const [story, setStory] = useState<Story>(initialStory);
  const [activePageId, setActivePageId] = useState<string>(initialStory.pages[0]?.id || '');
  const [showMeta, setShowMeta] = useState(false);
  const [showBible, setShowBible] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [zenMode, setZenMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string>(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  
  const editorRef = useRef<HTMLDivElement>(null);
  const activePage = story.pages.find(p => p.id === activePageId);

  useEffect(() => {
    if (editorRef.current && activePage) {
      if (editorRef.current.innerHTML !== activePage.content) {
        editorRef.current.innerHTML = activePage.content || '<p><br></p>';
      }
    }
  }, [activePageId]);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
        return '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;
    const timer = setTimeout(() => {
      onSave(story);
      setIsDirty(false);
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 15000);
    return () => clearTimeout(timer);
  }, [story, onSave, isDirty]);

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    handleInput();
  };

  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      setIsDirty(true);
      setStory(prev => ({
        ...prev,
        updatedAt: Date.now(),
        pages: prev.pages.map(p => p.id === activePageId ? { ...p, content } : p)
      }));
    }
  };

  const handleManualSave = () => {
    setIsSaving(true);
    onSave(story);
    setTimeout(() => {
      setIsSaving(false);
      setIsDirty(false);
      setSaveMessage("Sincronizado");
      setLastSaved(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setTimeout(() => setSaveMessage(null), 2000);
    }, 600);
  };

  const handleAddPage = () => {
    const newPage: Page = {
      id: generateId(ID_PREFIX.PAGE),
      title: `Nuevo Capítulo`,
      content: '<p><br></p>',
      order: story.pages.length
    };
    setIsDirty(true);
    setStory(prev => ({ ...prev, pages: [...prev.pages, newPage] }));
    setActivePageId(newPage.id);
  };

  const handleDeletePage = (id: string) => {
    if (story.pages.length <= 1) return;
    if (window.confirm("¿Eliminar este capítulo definitivamente?")) {
      const newPages = story.pages.filter(p => p.id !== id);
      setStory(prev => ({ ...prev, pages: newPages }));
      if (activePageId === id) setActivePageId(newPages[0].id);
      setIsDirty(true);
    }
  };

  const movePage = (index: number, direction: 'up' | 'down') => {
    const newPages = [...story.pages];
    const target = direction === 'up' ? index - 1 : index + 1;
    if (target < 0 || target >= newPages.length) return;
    [newPages[index], newPages[target]] = [newPages[target], newPages[index]];
    setStory(prev => ({ ...prev, pages: newPages }));
    setIsDirty(true);
  };

  const handleSafeClose = () => {
    if (isDirty) {
      if (window.confirm("Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const totalWords = story.pages.reduce((acc, p) => acc + countWords(p.content), 0);
  const progressPercent = story.wordCountGoal > 0 ? Math.min(100, (totalWords / story.wordCountGoal) * 100) : 0;

  const getThemeClasses = () => {
    switch(theme) {
      case 'DARK': return 'bg-black text-ink-100 dark';
      case 'SEPIA': return 'bg-[#f4ecd8] text-[#5d4037]';
      default: return 'bg-white text-ink-900';
    }
  };

  return (
    <div className={`flex flex-col h-full transition-colors duration-700 overflow-hidden ${getThemeClasses()}`}>
      {/* Barra de Progreso de Meta de Escritura */}
      {!zenMode && story.wordCountGoal > 0 && (
        <div className="h-1 w-full bg-black/5 dark:bg-white/5 relative z-50 overflow-hidden">
          <div 
            className="h-full bg-ink-900 dark:bg-white transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(0,0,0,0.2)]" 
            style={{ width: `${progressPercent}%` }}
          ></div>
        </div>
      )}

      {/* Toast de Guardado */}
      {saveMessage && !zenMode && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[100] px-4 py-1.5 bg-ink-900 dark:bg-white text-white dark:text-black text-[9px] font-black uppercase tracking-widest rounded-full shadow-2xl animate-in fade-in slide-in-from-top-2">
          <Icons.Check size={10} className="inline mr-2" /> {saveMessage}
        </div>
      )}

      {!zenMode && (
        <header className="flex items-center justify-between px-3 md:px-6 py-2 md:py-3 border-b border-black/5 z-30 shadow-sm transition-opacity duration-500">
          <div className="flex items-center gap-1.5 md:gap-4">
            <button onClick={handleSafeClose} className="p-2 -ml-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"><Icons.Back size={18} /></button>
            <button onClick={() => setShowChapters(!showChapters)} className="md:hidden p-2 bg-black/5 dark:bg-white/5 rounded-lg flex items-center gap-2">
              <Icons.List size={16} />
              <span className="text-[10px] font-bold">MAPA</span>
            </button>
            <div className="hidden sm:block">
              <input 
                className="font-serif font-bold text-sm bg-transparent outline-none border-none p-0 focus:ring-0 w-auto max-w-[150px]"
                value={story.title}
                onChange={(e) => { setIsDirty(true); setStory(prev => ({ ...prev, title: e.target.value })); }}
              />
            </div>
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl mr-2">
              <button onClick={() => onChangeTheme('LIGHT')} className={`p-1.5 rounded-lg transition-all ${theme === 'LIGHT' ? 'bg-white shadow-sm text-ink-900' : 'text-ink-400'}`}><Icons.Sun size={14} /></button>
              <button onClick={() => onChangeTheme('SEPIA')} className={`p-1.5 rounded-lg transition-all ${theme === 'SEPIA' ? 'bg-[#5d4037] text-white shadow-sm' : 'text-ink-400'}`}><Icons.Sepia size={14} /></button>
              <button onClick={() => onChangeTheme('DARK')} className={`p-1.5 rounded-lg transition-all ${theme === 'DARK' ? 'bg-black text-white shadow-sm' : 'text-ink-400'}`}><Icons.Moon size={14} /></button>
            </div>
            
            <button onClick={() => setZenMode(true)} title="Modo Zen" className="p-2 text-ink-400 hover:text-current transition-colors"><Icons.ZenOpen size={18} /></button>
            <button onClick={() => setShowBible(!showBible)} title="Biblia del Proyecto" className={`p-2 rounded-md transition-colors ${showBible ? 'bg-black/10' : 'text-ink-400'}`}><Icons.Bible size={18} /></button>
            <button onClick={() => setShowMeta(!showMeta)} className={`p-2 rounded-md transition-colors ${showMeta ? 'bg-black/10' : 'text-ink-400'}`}><Icons.Docs size={18} /></button>

            <div className="w-[1px] h-6 bg-black/5 dark:bg-white/5 mx-2"></div>

            <button 
              onClick={handleManualSave} 
              disabled={isSaving} 
              className={`px-3 md:px-5 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-full transition-all flex items-center gap-2 ${isDirty ? 'bg-ink-900 dark:bg-white text-white dark:text-black shadow-lg hover:scale-105 active:scale-95' : 'opacity-40 cursor-default'}`}
            >
              <Icons.Save size={14} />
              <span className="hidden min-[450px]:inline">{isSaving ? "Guardando" : (isDirty ? "Guardar" : "Guardado")}</span>
            </button>
          </div>
        </header>
      )}

      {zenMode && (
        <button 
          onClick={() => setZenMode(false)} 
          className="fixed top-6 right-6 z-[100] p-3 bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 rounded-full opacity-0 hover:opacity-100 transition-opacity"
          title="Salir de Modo Zen"
        >
          <Icons.ZenClose size={20} />
        </button>
      )}

      {/* Area del Editor y Mapas */}
      <div className="flex flex-1 overflow-hidden relative">
        {/* Gestor de Mapa del Manuscrito (Sidebar Izquierda) */}
        {!zenMode && (
          <aside className={`
            fixed inset-0 z-40 bg-inherit md:relative md:translate-x-0 md:w-80 lg:w-96 border-r border-black/5 flex flex-col transition-transform duration-300
            ${showChapters ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}>
            <div className="p-6 border-b border-black/5">
               <div className="flex justify-between items-center mb-6">
                 <div>
                   <h2 className="text-xs font-black uppercase tracking-[0.2em] opacity-40">Mapa del Manuscrito</h2>
                   <p className="text-[10px] font-mono mt-1 opacity-30">{story.pages.length} SECCIONES</p>
                 </div>
                 <button onClick={() => setShowChapters(false)} className="md:hidden p-2"><Icons.Back size={18} /></button>
               </div>
               <button 
                onClick={handleAddPage} 
                className="w-full py-3 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-xl border border-dashed border-black/10 dark:border-white/10 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all"
               >
                 <Icons.Plus size={14} /> Nuevo Capítulo
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {story.pages.map((p, i) => (
                <div 
                  key={p.id} 
                  onClick={() => setActivePageId(p.id)}
                  className={`group relative p-4 cursor-pointer rounded-2xl border transition-all duration-300 ${
                    activePageId === p.id 
                    ? 'bg-ink-900 dark:bg-white text-white dark:text-black border-transparent shadow-xl scale-[1.02]' 
                    : 'bg-black/5 dark:bg-white/5 border-transparent hover:border-black/10'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className={`text-[9px] font-mono uppercase tracking-tighter ${activePageId === p.id ? 'opacity-60' : 'opacity-40'}`}>
                      CAPÍTULO {i + 1}
                    </span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); movePage(i, 'up'); }} className="p-1 hover:bg-black/10 rounded" disabled={i === 0}>
                        <Icons.ChevronRight size={10} className="-rotate-90" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); movePage(i, 'down'); }} className="p-1 hover:bg-black/10 rounded" disabled={i === story.pages.length - 1}>
                        <Icons.ChevronRight size={10} className="rotate-90" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeletePage(p.id); }} className="p-1 hover:bg-red-500 hover:text-white rounded" disabled={story.pages.length <= 1}>
                        <Icons.Delete size={10} />
                      </button>
                    </div>
                  </div>
                  <h4 className="text-sm font-serif font-bold leading-tight line-clamp-2">
                    {p.title || "Sin título"}
                  </h4>
                  <div className={`mt-3 pt-3 border-t text-[9px] font-mono flex justify-between ${activePageId === p.id ? 'border-white/10' : 'border-black/5'}`}>
                    <span className="opacity-60 uppercase">{countWords(p.content)} Palabras</span>
                    {activePageId === p.id && <span className="animate-pulse">● EDITANDO</span>}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-6 border-t border-black/5 bg-black/5 dark:bg-white/5">
               <div className="flex justify-between items-center text-[10px] font-mono opacity-50">
                 <span className="uppercase">Progreso Obra</span>
                 <span>{totalWords} / {story.wordCountGoal || '∞'}</span>
               </div>
            </div>
          </aside>
        )}

        {/* Lienzo de Escritura */}
        <main className={`flex-1 overflow-y-auto custom-scrollbar transition-all duration-1000 ${zenMode ? 'p-10 md:p-32' : 'p-6 md:p-12 lg:p-20'}`}>
          <div className="max-w-2xl mx-auto flex flex-col min-h-full">
            <div className="mb-12 group">
              <span className="text-[10px] font-mono uppercase tracking-[0.5em] opacity-30 mb-2 block">Título del Capítulo</span>
              <input 
                className={`w-full font-serif font-bold bg-transparent outline-none border-none focus:ring-0 p-0 transition-all ${zenMode ? 'text-4xl md:text-6xl text-center' : 'text-3xl md:text-5xl text-left'}`}
                value={activePage?.title || ''}
                onChange={(e) => { setIsDirty(true); setStory(prev => ({ ...prev, pages: prev.pages.map(p => p.id === activePageId ? { ...p, title: e.target.value } : p) })); }}
                placeholder="Nombra tu capítulo..."
              />
              <div className="h-[1px] w-full bg-black/5 dark:bg-white/5 mt-4 group-focus-within:bg-current transition-colors"></div>
            </div>
            
            <div
              ref={editorRef}
              contentEditable
              className={`flex-1 w-full bg-transparent outline-none font-serif leading-[1.8] min-h-[50vh] pb-64 selection:bg-ink-200 dark:selection:bg-ink-700 ${zenMode ? 'text-xl md:text-2xl text-justify' : 'text-lg md:text-xl'}`}
              onInput={handleInput}
              spellCheck={false}
              data-placeholder="El silencio precede a la gran obra. Empieza a escribir aquí..."
            />
          </div>
        </main>

        {/* Sidebars Auxiliares (Biblia / Meta) */}
        {showBible && !zenMode && (
          <aside className="fixed inset-y-0 right-0 w-80 z-50 md:relative border-l border-black/5 flex flex-col bg-inherit shadow-2xl animate-in slide-in-from-right">
            <div className="p-6 border-b border-black/5 flex justify-between items-center">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Biblia del Proyecto</h3>
              <button onClick={() => setShowBible(false)} className="p-2"><Icons.Back size={16} className="rotate-180" /></button>
            </div>
            <div className="p-6 flex-1 overflow-hidden flex flex-col">
              <p className="text-[10px] opacity-40 mb-4 font-mono leading-relaxed">Usa este espacio para mantener coherencia en personajes, lugares y cronología.</p>
              <textarea 
                className="flex-1 w-full bg-black/5 dark:bg-white/5 p-4 rounded-2xl outline-none resize-none font-serif text-sm leading-relaxed border-none focus:ring-1 focus:ring-current/20"
                placeholder="Escribe tus notas aquí..."
                value={story.bible || ''}
                onChange={(e) => { setIsDirty(true); setStory(prev => ({ ...prev, bible: e.target.value })); }}
              />
            </div>
          </aside>
        )}

        {showMeta && !zenMode && (
          <aside className="fixed inset-y-0 right-0 w-80 z-50 md:relative border-l border-black/5 overflow-y-auto p-8 bg-inherit shadow-2xl animate-in slide-in-from-right">
            <div className="flex justify-between mb-10">
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Atributos de Obra</h3>
              <button onClick={() => setShowMeta(false)}><Icons.Back size={16} className="rotate-180" /></button>
            </div>
            
            <div className="space-y-10">
              <section>
                <label className="text-[10px] font-mono opacity-50 uppercase block mb-3">Objetivo de Palabras</label>
                <div className="relative group">
                  <Icons.Target size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity" />
                  <input 
                    type="number"
                    className="bg-black/5 dark:bg-white/5 border-none rounded-xl pl-10 pr-4 py-3 w-full text-xs font-bold outline-none focus:ring-1 focus:ring-current/20"
                    value={story.wordCountGoal}
                    onChange={(e) => { setIsDirty(true); setStory(prev => ({ ...prev, wordCountGoal: parseInt(e.target.value) || 0 })); }}
                    placeholder="Ej: 50000"
                  />
                </div>
              </section>

              <section>
                <label className="text-[10px] font-mono opacity-50 uppercase block mb-3">Estado de Producción</label>
                <div className="grid grid-cols-1 gap-2">
                  {ALL_STATUSES.map(status => (
                    <button 
                      key={status} 
                      onClick={() => { setIsDirty(true); setStory(prev => ({ ...prev, status })); }}
                      className={`text-left px-4 py-3 text-[10px] font-bold rounded-xl transition-all border ${
                        story.status === status 
                        ? 'bg-ink-900 dark:bg-white text-white dark:text-black border-transparent shadow-lg' 
                        : 'border-black/10 hover:border-black/30'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <label className="text-[10px] font-mono opacity-50 uppercase block mb-3">Sinopsis / Pitch</label>
                <textarea 
                  className="w-full h-40 p-4 text-xs font-serif leading-relaxed bg-black/5 dark:bg-white/5 rounded-2xl outline-none resize-none border-none focus:ring-1 focus:ring-current/20"
                  value={story.synopsis}
                  onChange={(e) => { setIsDirty(true); setStory(prev => ({ ...prev, synopsis: e.target.value })); }}
                  placeholder="De qué trata esta historia..."
                />
              </section>
            </div>
          </aside>
        )}
      </div>

      {!zenMode && (
        <footer className="px-6 py-3 border-t border-black/5 text-[9px] font-mono flex justify-between items-center z-30 transition-colors">
          <div className="flex items-center gap-8">
            <span className="flex items-center gap-1.5 opacity-60 uppercase tracking-widest"><Icons.Pen size={10} /> {totalWords} PALABRAS</span>
            {story.wordCountGoal > 0 && (
               <div className="flex items-center gap-3">
                 <span className="opacity-60 uppercase">AVANCE:</span>
                 <span className="font-bold">{progressPercent.toFixed(1)}%</span>
               </div>
            )}
          </div>
          <div className="flex items-center gap-6">
             {isDirty ? (
               <span className="text-amber-500 animate-pulse font-black uppercase tracking-tighter">● CAMBIOS SIN GUARDAR</span>
             ) : (
               <span className="text-green-500 font-black uppercase tracking-tighter opacity-50">✓ GUARDADO LOCAL</span>
             )}
             <span className="opacity-30 font-black">STORYCRAFT v1.5</span>
          </div>
        </footer>
      )}
    </div>
  );
};
