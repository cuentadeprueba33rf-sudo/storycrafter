
import React, { useState, useEffect, useRef } from 'react';
import { Story, Page, Genre, StoryStatus } from '../types';
import { Icons } from './Icon';
import { ALL_GENRES, ALL_STATUSES, ID_PREFIX } from '../constants';
import { countWords, generateId } from '../utils/storage';

interface EditorProps {
  story: Story;
  onSave: (story: Story) => void;
  onClose: () => void;
  onShare: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Editor: React.FC<EditorProps> = ({ 
  story: initialStory, 
  onSave, 
  onClose, 
  onShare, 
  darkMode, 
  onToggleDarkMode 
}) => {
  const [story, setStory] = useState<Story>(initialStory);
  const [activePageId, setActivePageId] = useState<string>(initialStory.pages[0]?.id || '');
  const [showMeta, setShowMeta] = useState(false);
  const [showChapters, setShowChapters] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false); // Seguimiento de cambios sin guardar
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string>(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  
  const editorRef = useRef<HTMLDivElement>(null);
  const activePage = story.pages.find(p => p.id === activePageId);

  // Sincronizar contenido cuando cambia la página activa
  useEffect(() => {
    if (editorRef.current && activePage) {
      if (editorRef.current.innerHTML !== activePage.content) {
        editorRef.current.innerHTML = activePage.content || '<p><br></p>';
      }
    }
  }, [activePageId]);

  // Manejador para prevenir el refresco o cierre de pestaña
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ''; // Requerido por la mayoría de navegadores para mostrar el prompt
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  // Auto-guardado cada 15 segundos si hay cambios
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
      title: `Capítulo ${story.pages.length + 1}`,
      content: '<p><br></p>',
      order: story.pages.length
    };
    setIsDirty(true);
    setStory(prev => ({
      ...prev,
      pages: [...prev.pages, newPage]
    }));
    setActivePageId(newPage.id);
    if (window.innerWidth < 768) setShowChapters(false);
  };

  const handleDeletePage = (id: string) => {
    if (story.pages.length <= 1) {
      alert("La obra debe contener al menos una sección.");
      return;
    }
    if (!window.confirm("¿Eliminar sección permanentemente?")) return;
    
    setIsDirty(true);
    const newPages = story.pages.filter(p => p.id !== id);
    setStory(prev => ({ ...prev, pages: newPages }));
    if (activePageId === id) {
      setActivePageId(newPages[0].id);
    }
  };

  const movePage = (index: number, direction: 'up' | 'down') => {
    const newPages = [...story.pages];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newPages.length) return;
    
    [newPages[index], newPages[targetIndex]] = [newPages[targetIndex], newPages[index]];
    setIsDirty(true);
    setStory(prev => ({ ...prev, pages: newPages }));
  };

  const toggleGenre = (genre: Genre) => {
    setIsDirty(true);
    setStory(prev => {
      const genres = prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre];
      return { ...prev, genres };
    });
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

  const currentWordCount = activePage ? countWords(editorRef.current?.innerText || '') : 0;
  const totalWordCount = story.pages.reduce((acc, p) => acc + countWords(p.content), 0);
  const readingTime = Math.ceil(totalWordCount / 200);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black transition-colors duration-500 overflow-hidden">
      {/* Toast de Guardado Minimalista */}
      {saveMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[60] px-4 py-1.5 bg-ink-900 dark:bg-white text-white dark:text-black text-[9px] font-black uppercase tracking-widest rounded-full shadow-xl animate-in fade-in slide-in-from-top-2 duration-300 flex items-center gap-2">
          <Icons.Check size={10} /> {saveMessage}
        </div>
      )}

      <header className="flex items-center justify-between px-3 md:px-6 py-2 md:py-3 border-b border-ink-200 dark:border-ink-800 bg-white dark:bg-black z-30 shadow-sm">
        <div className="flex items-center gap-1.5 md:gap-4">
          <button onClick={handleSafeClose} className="p-2 -ml-1 text-ink-600 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-900 rounded-full transition-colors">
            <Icons.Back size={18} />
          </button>
          
          <button 
            onClick={() => setShowChapters(!showChapters)} 
            className="md:hidden p-2 text-ink-900 dark:text-white bg-ink-100 dark:bg-ink-900 rounded-lg flex items-center"
          >
            <Icons.List size={16} />
          </button>

          <div className="hidden sm:block">
            <input 
              className="font-serif font-bold text-sm md:text-base bg-transparent outline-none text-ink-900 dark:text-white border-none p-0 focus:ring-0 w-auto min-w-[80px] max-w-[150px] md:max-w-xs"
              value={story.title}
              onChange={(e) => {
                setIsDirty(true);
                setStory(prev => ({ ...prev, title: e.target.value }));
              }}
              placeholder="Título..."
            />
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <button 
            onClick={onToggleDarkMode} 
            className="p-2 text-ink-500 hover:text-ink-900 dark:hover:text-white rounded-md"
          >
            {darkMode ? <Icons.Sun size={18} /> : <Icons.Moon size={18} />}
          </button>
          
          <button 
            onClick={() => setShowMeta(!showMeta)} 
            className={`p-2 rounded-md transition-colors ${showMeta ? 'bg-ink-100 dark:bg-ink-900 text-ink-900 dark:text-white' : 'text-ink-500'}`}
          >
            <Icons.Docs size={18} />
          </button>

          <div className="h-5 w-[1px] bg-ink-200 dark:bg-ink-800 mx-1"></div>

          <button 
            onClick={handleManualSave} 
            disabled={isSaving} 
            className={`px-3 md:px-5 py-1.5 md:py-2 text-[9px] md:text-[10px] font-black uppercase tracking-widest rounded-full transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2 shadow-md ${
              isDirty 
              ? 'bg-ink-900 dark:bg-white text-white dark:text-black' 
              : 'bg-ink-100 dark:bg-ink-800 text-ink-400 dark:text-ink-500'
            }`}
          >
            {isSaving ? (
              <div className="w-3 h-3 border-2 border-white/30 border-t-white dark:border-black/30 dark:border-t-black rounded-full animate-spin"></div>
            ) : (
              <Icons.Save size={14} />
            )}
            <span className="hidden min-[450px]:inline">{isSaving ? "Guardando" : (isDirty ? "Guardar" : "Guardado")}</span>
          </button>
        </div>
      </header>

      {/* Toolbar Editorial */}
      <div className="flex items-center justify-start md:justify-center gap-0.5 md:gap-1 px-4 py-1.5 bg-ink-50 dark:bg-ink-950 border-b border-ink-200 dark:border-ink-800 overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-0.5 pr-4 border-r border-ink-200 dark:border-ink-800 md:border-none md:pr-0">
          <button onClick={() => execCommand('bold')} className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center hover:bg-ink-200 dark:hover:bg-ink-800 rounded text-ink-700 dark:text-ink-300 transition-colors"><b>B</b></button>
          <button onClick={() => execCommand('italic')} className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center hover:bg-ink-200 dark:hover:bg-ink-800 rounded text-ink-700 dark:text-ink-300 transition-colors"><i>I</i></button>
          <button onClick={() => execCommand('underline')} className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center hover:bg-ink-200 dark:hover:bg-ink-800 rounded text-ink-700 dark:text-ink-300 transition-colors"><u>U</u></button>
        </div>
        <div className="flex items-center gap-0.5 px-2">
          <button onClick={() => execCommand('justifyLeft')} className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center hover:bg-ink-200 dark:hover:bg-ink-800 rounded text-ink-700 dark:text-ink-300 transition-colors"><Icons.List size={14} /></button>
          <button onClick={() => execCommand('justifyCenter')} className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center hover:bg-ink-200 dark:hover:bg-ink-800 rounded text-ink-700 dark:text-ink-300 transition-colors" style={{ transform: 'rotate(90deg)' }}><Icons.More size={14} /></button>
          <button onClick={() => execCommand('insertUnorderedList')} className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center hover:bg-ink-200 dark:hover:bg-ink-800 rounded text-ink-700 dark:text-ink-300 transition-colors"><Icons.Grid size={14} /></button>
        </div>
        <button onClick={() => execCommand('removeFormat')} className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center hover:bg-ink-200 dark:hover:bg-ink-800 rounded text-ink-400 transition-colors" title="Limpiar"><Icons.Delete size={14} /></button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Móvil/Desktop: Capítulos */}
        <aside className={`
          fixed inset-0 z-40 bg-white dark:bg-black md:relative md:translate-x-0 md:inset-auto md:w-72 lg:w-80 border-r border-ink-200 dark:border-ink-800 flex flex-col transition-transform duration-300
          ${showChapters ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="flex items-center justify-between p-5 border-b border-ink-100 dark:border-ink-900">
            <div>
              <p className="text-[10px] font-mono uppercase text-ink-400 tracking-widest">Capítulos</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleAddPage} className="p-2 bg-ink-900 dark:bg-white text-white dark:text-black rounded-lg">
                <Icons.Plus size={14} />
              </button>
              <button onClick={() => setShowChapters(false)} className="md:hidden p-2 text-ink-400">
                <Icons.Back size={18} />
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {story.pages.map((p, i) => (
              <div 
                key={p.id} 
                onClick={() => { setActivePageId(p.id); if(window.innerWidth < 768) setShowChapters(false); }} 
                className={`group relative p-3.5 cursor-pointer rounded-xl transition-all border ${
                  activePageId === p.id 
                  ? 'bg-ink-900 dark:bg-white border-transparent shadow-lg' 
                  : 'bg-white dark:bg-ink-950 border-ink-100 dark:border-ink-900 hover:border-ink-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[9px] font-mono uppercase tracking-tighter ${activePageId === p.id ? 'text-white/40 dark:text-black/40' : 'text-ink-400'}`}>
                    Sección {i + 1}
                  </span>
                  <div className="flex items-center gap-1 md:opacity-0 md:group-hover:opacity-100">
                    <button onClick={(e) => { e.stopPropagation(); movePage(i, 'up'); }} className={`p-1 rounded ${activePageId === p.id ? 'text-white dark:text-black' : 'text-ink-300'}`} disabled={i === 0}>
                      <Icons.ChevronRight size={12} className="-rotate-90" />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); movePage(i, 'down'); }} className={`p-1 rounded ${activePageId === p.id ? 'text-white dark:text-black' : 'text-ink-300'}`} disabled={i === story.pages.length - 1}>
                      <Icons.ChevronRight size={12} className="rotate-90" />
                    </button>
                  </div>
                </div>
                <h4 className={`text-sm font-serif font-bold truncate ${activePageId === p.id ? 'text-white dark:text-black' : 'text-ink-900 dark:text-white'}`}>
                  {p.title}
                </h4>
                <div className="mt-2 flex items-center justify-between">
                  <span className={`text-[8px] font-mono ${activePageId === p.id ? 'text-white/60 dark:text-black/60' : 'text-ink-400'}`}>
                    {countWords(p.content)} Palabras
                  </span>
                  <button onClick={(e) => { e.stopPropagation(); handleDeletePage(p.id); }} className={`p-1 rounded transition-colors ${activePageId === p.id ? 'hover:bg-red-500 text-white/50 dark:text-black/50 hover:text-white' : 'text-ink-200 hover:text-red-500'}`}>
                    <Icons.Delete size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 bg-ink-50 dark:bg-ink-950 border-t border-ink-100 dark:border-ink-900 mt-auto">
             <div className="flex justify-between items-center">
               <div className="text-[10px] font-mono text-ink-400">TOTAL: <span className="font-bold text-ink-900 dark:text-white">{totalWordCount}</span></div>
               <div className="text-[10px] font-mono text-ink-400">TIEMPO: <span className="font-bold text-ink-900 dark:text-white">{readingTime}m</span></div>
             </div>
          </div>
        </aside>

        {/* Editor Principal */}
        <main className="flex-1 p-5 md:p-12 lg:p-20 overflow-y-auto custom-scrollbar bg-white dark:bg-black">
          <div className="max-w-3xl mx-auto flex flex-col min-h-full">
            <input 
              className="text-3xl md:text-5xl lg:text-6xl font-serif font-bold bg-transparent outline-none mb-8 md:mb-12 text-ink-900 dark:text-white tracking-tight border-none focus:ring-0 p-0 placeholder-ink-100 dark:placeholder-ink-900"
              value={activePage?.title || ''}
              onChange={(e) => {
                setIsDirty(true);
                setStory(prev => ({ ...prev, pages: prev.pages.map(p => p.id === activePageId ? { ...p, title: e.target.value } : p) }));
              }}
              placeholder="Capítulo..."
            />
            <div
              ref={editorRef}
              contentEditable
              className="flex-1 w-full bg-transparent outline-none font-serif text-lg md:text-xl lg:text-2xl leading-[1.8] text-ink-800 dark:text-ink-300 min-h-[50vh] pb-32"
              onInput={handleInput}
              spellCheck={false}
              data-placeholder="Tu historia comienza aquí..."
            />
          </div>
        </main>

        {/* Sidebar Metadatos */}
        {showMeta && (
          <aside className="fixed inset-y-0 right-0 w-72 md:w-80 z-50 md:relative border-l border-ink-200 dark:border-ink-800 overflow-y-auto p-6 md:p-8 bg-ink-50 dark:bg-black shadow-2xl animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xs font-black uppercase tracking-widest">Atributos</h3>
              <button onClick={() => setShowMeta(false)} className="p-2 hover:bg-ink-200 dark:hover:bg-ink-800 rounded-full"><Icons.Back size={18} className="rotate-180" /></button>
            </div>
            <div className="space-y-10">
              <section>
                <label className="text-[10px] font-mono text-ink-400 uppercase block mb-3">Estado</label>
                <div className="space-y-1.5">
                  {ALL_STATUSES.map(status => (
                    <button key={status} onClick={() => { setIsDirty(true); setStory(prev => ({ ...prev, status })); }} className={`w-full px-4 py-2.5 text-xs text-left rounded-xl border transition-all flex items-center justify-between ${story.status === status ? 'bg-ink-900 dark:bg-white text-white dark:text-black border-transparent shadow-md' : 'bg-white dark:bg-ink-900 border-ink-200 dark:border-ink-800'}`}>
                      {status} {story.status === status && <Icons.Check size={10} />}
                    </button>
                  ))}
                </div>
              </section>
              <section>
                <label className="text-[10px] font-mono text-ink-400 uppercase block mb-3">Sinopsis</label>
                <textarea 
                  className="w-full h-32 p-4 text-xs font-serif leading-relaxed bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-2xl outline-none resize-none" 
                  value={story.synopsis} 
                  onChange={(e) => {
                    setIsDirty(true);
                    setStory(prev => ({ ...prev, synopsis: e.target.value }));
                  }} 
                  placeholder="Resumen..." 
                />
              </section>
              <section>
                <label className="text-[10px] font-mono text-ink-400 uppercase block mb-3">Géneros</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_GENRES.map(genre => (
                    <button 
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={`px-2.5 py-1.5 text-[9px] rounded-lg border transition-all ${story.genres.includes(genre) ? 'bg-ink-900 dark:bg-white text-white dark:text-black border-transparent shadow-md' : 'bg-white dark:bg-ink-900 border-ink-200 dark:border-ink-800'}`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </section>
            </div>
          </aside>
        )}
      </div>
      
      <footer className="px-4 py-2 md:py-3 border-t border-ink-100 dark:border-ink-800 bg-white dark:bg-black text-[9px] md:text-[10px] font-mono text-ink-400 flex justify-between items-center z-30">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1"><Icons.Pen size={10} /> {currentWordCount} PALABRAS</span>
          <span className="hidden sm:inline opacity-60">SINC: {lastSaved}</span>
          {isDirty && <span className="text-amber-500 font-bold animate-pulse">● CAMBIOS SIN GUARDAR</span>}
        </div>
        <div className="flex items-center gap-2">
           <span className="opacity-40 uppercase tracking-tighter hidden xs:inline">Cifrado Local</span>
           <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)]"></div>
        </div>
      </footer>
    </div>
  );
};
