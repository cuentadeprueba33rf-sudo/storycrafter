
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
  const [showChapters, setShowChapters] = useState(false); // Para móvil
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string>(new Date().toLocaleTimeString());
  
  const editorRef = useRef<HTMLDivElement>(null);
  const activePage = story.pages.find(p => p.id === activePageId);

  useEffect(() => {
    if (editorRef.current && activePage) {
      if (editorRef.current.innerHTML !== activePage.content) {
        editorRef.current.innerHTML = activePage.content || '<p><br></p>';
      }
    }
  }, [activePageId]);

  // Auto-guardado cada 10 segundos si hay cambios
  useEffect(() => {
    const timer = setTimeout(() => {
      onSave(story);
      setLastSaved(new Date().toLocaleTimeString());
    }, 10000);
    return () => clearTimeout(timer);
  }, [story, onSave]);

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    handleInput();
  };

  const handleInput = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
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
      setSaveMessage("Cambios sincronizados");
      setLastSaved(new Date().toLocaleTimeString());
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
    setStory(prev => ({
      ...prev,
      pages: [...prev.pages, newPage]
    }));
    setActivePageId(newPage.id);
    if (window.innerWidth < 768) setShowChapters(false);
  };

  const handleDeletePage = (id: string) => {
    if (story.pages.length <= 1) {
      alert("Una historia debe tener al menos un capítulo.");
      return;
    }
    if (!window.confirm("¿Eliminar este capítulo permanentemente?")) return;
    
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
    setStory(prev => ({ ...prev, pages: newPages }));
  };

  const toggleGenre = (genre: Genre) => {
    setStory(prev => {
      const genres = prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre];
      return { ...prev, genres };
    });
  };

  const currentWordCount = activePage ? countWords(editorRef.current?.innerText || '') : 0;
  const totalWordCount = story.pages.reduce((acc, p) => acc + countWords(p.content), 0);
  const readingTime = Math.ceil(totalWordCount / 200);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black transition-colors duration-500 overflow-hidden">
      {/* Toast de Guardado */}
      {saveMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] px-5 py-2 bg-ink-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest rounded-full shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300 flex items-center gap-2">
          <Icons.Check size={12} /> {saveMessage}
        </div>
      )}

      <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-ink-200 dark:border-ink-800 bg-white dark:bg-black z-30 shadow-sm">
        <div className="flex items-center gap-2 md:gap-6">
          <button onClick={onClose} className="p-2 -ml-2 text-ink-600 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-900 rounded-full transition-colors">
            <Icons.Back size={20} />
          </button>
          
          <button 
            onClick={() => setShowChapters(!showChapters)} 
            className="md:hidden p-2 text-ink-900 dark:text-white bg-ink-100 dark:bg-ink-900 rounded-lg"
          >
            <Icons.List size={18} />
          </button>

          <div className="hidden sm:block">
            <input 
              className="font-serif font-bold text-base bg-transparent outline-none text-ink-900 dark:text-white border-none p-0 focus:ring-0 w-auto min-w-[100px]"
              value={story.title}
              onChange={(e) => setStory(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Título de la Obra"
            />
          </div>
        </div>

        <div className="flex items-center gap-1 md:gap-3">
          <button 
            onClick={onToggleDarkMode} 
            className="p-2 text-ink-500 hover:text-ink-900 dark:hover:text-white rounded-md"
            title="Modo Nocturno"
          >
            {darkMode ? <Icons.Sun size={18} /> : <Icons.Moon size={18} />}
          </button>
          
          <button 
            onClick={() => setShowMeta(!showMeta)} 
            className={`p-2 rounded-md transition-colors ${showMeta ? 'bg-ink-100 dark:bg-ink-900 text-ink-900 dark:text-white' : 'text-ink-500'}`}
            title="Información de la Obra"
          >
            <Icons.Docs size={18} />
          </button>

          <div className="h-6 w-[1px] bg-ink-200 dark:bg-ink-800 mx-1 md:mx-2"></div>

          <button 
            onClick={handleManualSave} 
            disabled={isSaving} 
            className="px-4 md:px-5 py-2 bg-ink-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest rounded-full transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {isSaving ? (
              <div className="w-3 h-3 border-2 border-white/30 border-t-white dark:border-black/30 dark:border-t-black rounded-full animate-spin"></div>
            ) : (
              <Icons.Save size={14} />
            )}
            <span className="hidden xs:inline">{isSaving ? "Guardando" : "Guardar"}</span>
          </button>
        </div>
      </header>

      {/* Toolbar Editorial Refinada */}
      <div className="flex items-center justify-center gap-0.5 md:gap-1 px-4 py-2 bg-ink-50 dark:bg-ink-950 border-b border-ink-200 dark:border-ink-800 overflow-x-auto no-scrollbar">
        <button onClick={() => execCommand('bold')} className="w-9 h-9 flex items-center justify-center hover:bg-ink-200 dark:hover:bg-ink-800 rounded text-ink-700 dark:text-ink-300 transition-colors" title="Negrita"><b>B</b></button>
        <button onClick={() => execCommand('italic')} className="w-9 h-9 flex items-center justify-center hover:bg-ink-200 dark:hover:bg-ink-800 rounded text-ink-700 dark:text-ink-300 transition-colors" title="Cursiva"><i>I</i></button>
        <button onClick={() => execCommand('underline')} className="w-9 h-9 flex items-center justify-center hover:bg-ink-200 dark:hover:bg-ink-800 rounded text-ink-700 dark:text-ink-300 transition-colors" title="Subrayado"><u>U</u></button>
        <div className="w-[1px] h-4 bg-ink-200 dark:bg-ink-800 mx-1"></div>
        <button onClick={() => execCommand('justifyLeft')} className="w-9 h-9 flex items-center justify-center hover:bg-ink-200 dark:hover:bg-ink-800 rounded text-ink-700 dark:text-ink-300 transition-colors"><Icons.List size={14} /></button>
        <button onClick={() => execCommand('justifyCenter')} className="w-9 h-9 flex items-center justify-center hover:bg-ink-200 dark:hover:bg-ink-800 rounded text-ink-700 dark:text-ink-300 transition-colors" style={{ transform: 'rotate(90deg)' }}><Icons.More size={14} /></button>
        <div className="w-[1px] h-4 bg-ink-200 dark:bg-ink-800 mx-1"></div>
        <button onClick={() => execCommand('insertUnorderedList')} className="w-9 h-9 flex items-center justify-center hover:bg-ink-200 dark:hover:bg-ink-800 rounded text-ink-700 dark:text-ink-300 transition-colors"><Icons.Grid size={14} /></button>
        <button onClick={() => execCommand('removeFormat')} className="w-9 h-9 flex items-center justify-center hover:bg-ink-200 dark:hover:bg-ink-800 rounded text-ink-400 transition-colors" title="Limpiar Formato"><Icons.Delete size={14} /></button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Pro: Gestor de Capítulos */}
        <aside className={`
          fixed inset-0 z-40 bg-white dark:bg-black md:relative md:translate-x-0 md:inset-auto md:w-80 border-r border-ink-200 dark:border-ink-800 flex flex-col transition-transform duration-300
          ${showChapters ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="flex items-center justify-between p-6 border-b border-ink-100 dark:border-ink-900">
            <div>
              <p className="text-[10px] font-mono uppercase text-ink-400 tracking-[0.2em]">Gestor de Capítulos</p>
              <p className="text-[9px] font-mono text-ink-300 mt-1 uppercase">{story.pages.length} SECCIONES TOTALES</p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleAddPage} className="p-2 bg-ink-900 dark:bg-white text-white dark:text-black rounded-lg hover:scale-105 transition-transform">
                <Icons.Plus size={16} />
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
                className={`group relative p-4 cursor-pointer rounded-xl transition-all border ${
                  activePageId === p.id 
                  ? 'bg-ink-900 dark:bg-white border-transparent shadow-xl' 
                  : 'bg-white dark:bg-ink-950 border-ink-100 dark:border-ink-900 hover:border-ink-300 dark:hover:border-ink-700 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-mono uppercase tracking-widest ${activePageId === p.id ? 'text-white/50 dark:text-black/50' : 'text-ink-400'}`}>
                    Capítulo {i + 1}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); movePage(i, 'up'); }}
                      className={`p-1 rounded hover:bg-black/10 dark:hover:bg-black/10 ${activePageId === p.id ? 'text-white dark:text-black' : 'text-ink-400'}`}
                      disabled={i === 0}
                    >
                      <Icons.ChevronRight size={14} className="-rotate-90" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); movePage(i, 'down'); }}
                      className={`p-1 rounded hover:bg-black/10 dark:hover:bg-black/10 ${activePageId === p.id ? 'text-white dark:text-black' : 'text-ink-400'}`}
                      disabled={i === story.pages.length - 1}
                    >
                      <Icons.ChevronRight size={14} className="rotate-90" />
                    </button>
                  </div>
                </div>

                <h4 className={`text-sm font-serif font-bold truncate mb-3 ${activePageId === p.id ? 'text-white dark:text-black' : 'text-ink-900 dark:text-white'}`}>
                  {p.title}
                </h4>

                <div className="flex items-center justify-between">
                  <span className={`text-[9px] font-mono uppercase ${activePageId === p.id ? 'text-white/60 dark:text-black/60' : 'text-ink-400'}`}>
                    {countWords(p.content)} Palabras
                  </span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeletePage(p.id); }}
                    className={`p-1.5 opacity-0 group-hover:opacity-100 rounded-md transition-all ${
                      activePageId === p.id 
                      ? 'hover:bg-red-500 text-white dark:text-black' 
                      : 'hover:bg-red-50 dark:hover:bg-red-900/20 text-ink-300 hover:text-red-500'
                    }`}
                  >
                    <Icons.Delete size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-6 bg-ink-50 dark:bg-ink-950 border-t border-ink-100 dark:border-ink-900">
             <div className="flex justify-between items-end">
               <div>
                  <p className="text-[10px] font-mono text-ink-400 uppercase tracking-widest">Global</p>
                  <p className="text-xl font-serif font-bold text-ink-900 dark:text-white">{totalWordCount}</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] font-mono text-ink-400 uppercase tracking-widest">Lectura</p>
                  <p className="text-sm font-serif font-medium text-ink-700 dark:text-ink-300">{readingTime} min</p>
               </div>
             </div>
          </div>
        </aside>

        {/* Área Principal de Edición */}
        <main className="flex-1 p-6 md:p-12 lg:p-20 overflow-y-auto custom-scrollbar bg-white dark:bg-black relative selection:bg-ink-200 dark:selection:bg-ink-800">
          <div className="max-w-3xl mx-auto h-full flex flex-col">
            <input 
              className="text-4xl md:text-6xl font-serif font-bold bg-transparent outline-none mb-10 text-ink-900 dark:text-white tracking-tight border-none focus:ring-0 p-0 placeholder-ink-100 dark:placeholder-ink-900"
              value={activePage?.title || ''}
              onChange={(e) => setStory(prev => ({ ...prev, pages: prev.pages.map(p => p.id === activePageId ? { ...p, title: e.target.value } : p) }))}
              placeholder="Nombre del Capítulo..."
            />
            <div
              ref={editorRef}
              contentEditable
              className="flex-1 w-full bg-transparent outline-none font-serif text-xl md:text-2xl leading-[1.8] text-ink-800 dark:text-ink-300 min-h-[60vh] pb-32"
              onInput={handleInput}
              spellCheck={false}
              data-placeholder="Comienza tu viaje literario aquí..."
            />
          </div>
        </main>

        {/* Sidebar Derecho: Metadatos */}
        {showMeta && (
          <aside className="fixed inset-y-0 right-0 w-80 z-50 md:relative border-l border-ink-200 dark:border-ink-800 overflow-y-auto p-8 bg-ink-50 dark:bg-black animate-in slide-in-from-right duration-300 shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-black uppercase tracking-[0.3em]">Propiedades</h3>
              <button onClick={() => setShowMeta(false)} className="p-2 hover:bg-ink-200 dark:hover:bg-ink-800 rounded-full transition-colors"><Icons.Back size={18} className="rotate-180" /></button>
            </div>

            <div className="space-y-10">
              <section>
                <label className="text-[10px] font-mono text-ink-400 uppercase tracking-widest block mb-4">Estado del Proyecto</label>
                <div className="space-y-2">
                  {ALL_STATUSES.map(status => (
                    <button 
                      key={status}
                      onClick={() => setStory(prev => ({ ...prev, status }))}
                      className={`w-full px-4 py-3 text-xs text-left rounded-xl border transition-all flex items-center justify-between ${story.status === status ? 'bg-ink-900 dark:bg-white text-white dark:text-black border-transparent shadow-lg' : 'bg-white dark:bg-ink-900 border-ink-200 dark:border-ink-800 hover:border-ink-400'}`}
                    >
                      {status}
                      {story.status === status && <Icons.Check size={12} />}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <label className="text-[10px] font-mono text-ink-400 uppercase tracking-widest block mb-4">Sinopsis Editorial</label>
                <textarea 
                  className="w-full h-40 p-5 text-sm font-serif leading-relaxed bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-2xl outline-none focus:ring-2 focus:ring-ink-900 dark:focus:ring-white transition-all resize-none shadow-inner"
                  value={story.synopsis}
                  onChange={(e) => setStory(prev => ({ ...prev, synopsis: e.target.value }))}
                  placeholder="Escribe un breve resumen de la trama..."
                />
              </section>

              <section>
                <label className="text-[10px] font-mono text-ink-400 uppercase tracking-widest block mb-4">Etiquetas de Género</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_GENRES.map(genre => (
                    <button 
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={`px-3 py-2 text-[10px] rounded-lg border font-mono transition-all ${story.genres.includes(genre) ? 'bg-ink-900 dark:bg-white text-white dark:text-black border-transparent shadow-md' : 'bg-white dark:bg-ink-900 border-ink-200 dark:border-ink-800 hover:border-ink-400'}`}
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
      
      <footer className="px-6 py-3 border-t border-ink-100 dark:border-ink-800 bg-white dark:bg-black text-[10px] font-mono text-ink-400 flex justify-between items-center z-30">
        <div className="flex items-center gap-8">
          <span className="flex items-center gap-2 bg-ink-50 dark:bg-ink-950 px-3 py-1 rounded-full"><Icons.Pen size={12} className="text-ink-900 dark:text-white" /> {currentWordCount} PALABRAS EN ESTE CAPÍTULO</span>
          <span className="hidden md:flex items-center gap-2 opacity-60"><Icons.Save size={12} /> ÚLTIMO GUARDADO: {lastSaved}</span>
        </div>
        <div className="flex items-center gap-4">
           <span className="opacity-50 uppercase tracking-tighter hidden sm:inline">Sincronización Local Activa</span>
           <div className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
        </div>
      </footer>
    </div>
  );
};
