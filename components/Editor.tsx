
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
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  
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

  // Guardado automático silencioso
  useEffect(() => {
    const timer = setTimeout(() => onSave(story), 5000);
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
      setSaveMessage("Guardado con éxito");
      setTimeout(() => setSaveMessage(null), 3000);
    }, 800);
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
  };

  const handleDeletePage = (id: string) => {
    if (story.pages.length <= 1) return;
    if (!window.confirm("¿Eliminar este capítulo?")) return;
    
    const newPages = story.pages.filter(p => p.id !== id);
    setStory(prev => ({ ...prev, pages: newPages }));
    if (activePageId === id) {
      setActivePageId(newPages[0].id);
    }
  };

  const toggleGenre = (genre: Genre) => {
    setStory(prev => {
      const genres = prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre];
      return { ...prev, genres };
    });
  };

  const wordCount = activePage ? countWords(editorRef.current?.innerText || '') : 0;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black transition-colors duration-500 overflow-hidden">
      {/* Notificación de guardado */}
      {saveMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-6 py-2 bg-ink-900 dark:bg-white text-white dark:text-black text-xs font-bold rounded-full shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
          {saveMessage}
        </div>
      )}

      <header className="flex items-center justify-between px-6 py-3 border-b border-ink-200 dark:border-ink-800 bg-white dark:bg-black z-30 shadow-sm">
        <div className="flex items-center gap-6">
          <button onClick={onClose} className="p-2 -ml-2 text-ink-600 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-900 rounded-full transition-colors">
            <Icons.Back size={20} />
          </button>
          <div>
            <input 
              className="font-serif font-bold text-base bg-transparent outline-none text-ink-900 dark:text-white border-none p-0 focus:ring-0 w-auto min-w-[100px]"
              value={story.title}
              onChange={(e) => setStory(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Título de la Obra"
            />
            <div className="flex items-center gap-2 mt-0.5">
               <span className="text-[9px] font-mono text-ink-400 uppercase tracking-widest">{story.status}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
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

          <div className="h-6 w-[1px] bg-ink-200 dark:bg-ink-800 mx-2"></div>

          <button onClick={handleManualSave} disabled={isSaving} className="px-5 py-2 bg-ink-900 dark:bg-white text-white dark:text-black text-[10px] font-black uppercase tracking-widest rounded-full transition-all hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2">
            {isSaving ? <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <Icons.Save size={14} />}
            {isSaving ? "Guardando" : "Guardar"}
          </button>
        </div>
      </header>

      {/* Toolbar Editorial */}
      <div className="flex items-center justify-center gap-1 px-4 py-2 bg-ink-50 dark:bg-ink-950 border-b border-ink-200 dark:border-ink-800 overflow-x-auto no-scrollbar">
        <button onClick={() => execCommand('bold')} className="p-2 hover:bg-ink-200 dark:hover:bg-ink-800 rounded text-ink-700 dark:text-ink-300" title="Negrita"><b>B</b></button>
        <button onClick={() => execCommand('italic')} className="p-2 hover:bg-ink-200 dark:hover:bg-ink-800 rounded text-ink-700 dark:text-ink-300" title="Cursiva"><i>I</i></button>
        <button onClick={() => execCommand('underline')} className="p-2 hover:bg-ink-200 dark:hover:bg-ink-800 rounded text-ink-700 dark:text-ink-300" title="Subrayado"><u>U</u></button>
        <div className="w-[1px] h-4 bg-ink-200 dark:bg-ink-800 mx-1"></div>
        <button onClick={() => execCommand('justifyLeft')} className="p-2 hover:bg-ink-200 dark:hover:bg-ink-800 rounded text-ink-700 dark:text-ink-300"><Icons.List size={14} /></button>
        <button onClick={() => execCommand('justifyCenter')} className="p-2 hover:bg-ink-200 dark:hover:bg-ink-800 rounded text-ink-700 dark:text-ink-300" style={{ transform: 'rotate(90deg)' }}><Icons.More size={14} /></button>
        <div className="w-[1px] h-4 bg-ink-200 dark:bg-ink-800 mx-1"></div>
        <button onClick={() => execCommand('insertUnorderedList')} className="p-2 hover:bg-ink-200 dark:hover:bg-ink-800 rounded text-ink-700 dark:text-ink-300"><Icons.Grid size={14} /></button>
        <div className="w-[1px] h-4 bg-ink-200 dark:bg-ink-800 mx-1"></div>
        {/* Fixed reference to non-existent Icons.Trash2 by using Icons.Delete */}
        <button onClick={() => execCommand('removeFormat')} className="p-2 hover:bg-ink-200 dark:hover:bg-ink-800 rounded text-ink-400"><Icons.Delete size={14} /></button>
      </div>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Sidebar Izquierdo: Capítulos */}
        <aside className="w-72 border-r border-ink-200 dark:border-ink-800 overflow-y-auto p-6 hidden md:flex flex-col bg-white dark:bg-black transition-all">
          <div className="flex items-center justify-between mb-6">
            <p className="text-[10px] font-mono uppercase text-ink-400 tracking-widest">Estructura</p>
            <button onClick={handleAddPage} className="p-1 hover:bg-ink-100 dark:hover:bg-ink-900 rounded text-ink-900 dark:text-white">
              <Icons.Plus size={16} />
            </button>
          </div>
          <div className="space-y-1">
            {story.pages.map((p, i) => (
              <div 
                key={p.id} 
                onClick={() => setActivePageId(p.id)} 
                className={`group flex items-center justify-between p-3 cursor-pointer text-sm rounded-lg transition-all ${
                  activePageId === p.id 
                  ? 'bg-ink-900 dark:bg-white text-white dark:text-black font-bold shadow-md' 
                  : 'text-ink-500 hover:bg-ink-50 dark:hover:bg-ink-900 hover:text-ink-900 dark:hover:text-white'
                }`}
              >
                <span className="truncate flex-1">{i + 1}. {p.title}</span>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeletePage(p.id); }}
                  className={`p-1 opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white rounded transition-all ${activePageId === p.id ? 'text-white dark:text-black' : ''}`}
                >
                  <Icons.Delete size={12} />
                </button>
              </div>
            ))}
          </div>
        </aside>

        {/* Área Principal de Edición */}
        <main className="flex-1 p-8 md:p-16 lg:p-24 overflow-y-auto custom-scrollbar bg-white dark:bg-black relative">
          <div className="max-w-3xl mx-auto h-full flex flex-col">
            <input 
              className="text-4xl md:text-6xl font-serif font-bold bg-transparent outline-none mb-12 text-ink-900 dark:text-white tracking-tight border-none focus:ring-0 p-0 placeholder-ink-100 dark:placeholder-ink-900"
              value={activePage?.title || ''}
              onChange={(e) => setStory(prev => ({ ...prev, pages: prev.pages.map(p => p.id === activePageId ? { ...p, title: e.target.value } : p) }))}
              placeholder="Capítulo I..."
            />
            <div
              ref={editorRef}
              contentEditable
              className="flex-1 w-full bg-transparent outline-none font-serif text-xl md:text-2xl leading-[1.8] text-ink-800 dark:text-ink-300 min-h-[50vh]"
              onInput={handleInput}
              spellCheck={false}
              data-placeholder="Escribe tu manuscrito aquí..."
            />
          </div>
        </main>

        {/* Sidebar Derecho: Metadatos (Condicional) */}
        {showMeta && (
          <aside className="w-80 border-l border-ink-200 dark:border-ink-800 overflow-y-auto p-8 bg-ink-50 dark:bg-black animate-in slide-in-from-right duration-300 shadow-2xl z-20">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-sm font-bold uppercase tracking-widest">Información</h3>
              <button onClick={() => setShowMeta(false)} className="p-1 hover:bg-ink-200 dark:hover:bg-ink-800 rounded"><Icons.Back size={16} className="rotate-180" /></button>
            </div>

            <div className="space-y-8">
              <section>
                <label className="text-[10px] font-mono text-ink-400 uppercase tracking-widest block mb-3">Estado</label>
                <div className="grid grid-cols-1 gap-2">
                  {ALL_STATUSES.map(status => (
                    <button 
                      key={status}
                      onClick={() => setStory(prev => ({ ...prev, status }))}
                      className={`px-4 py-2 text-xs text-left rounded-md border transition-all ${story.status === status ? 'bg-ink-900 dark:bg-white text-white dark:text-black border-transparent' : 'bg-white dark:bg-ink-900 border-ink-200 dark:border-ink-800 hover:border-ink-400'}`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </section>

              <section>
                <label className="text-[10px] font-mono text-ink-400 uppercase tracking-widest block mb-3">Sinopsis</label>
                <textarea 
                  className="w-full h-32 p-4 text-sm bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-lg outline-none focus:border-ink-500 dark:focus:border-white transition-all resize-none"
                  value={story.synopsis}
                  onChange={(e) => setStory(prev => ({ ...prev, synopsis: e.target.value }))}
                  placeholder="De qué trata esta historia..."
                />
              </section>

              <section>
                <label className="text-[10px] font-mono text-ink-400 uppercase tracking-widest block mb-3">Géneros</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_GENRES.map(genre => (
                    <button 
                      key={genre}
                      onClick={() => toggleGenre(genre)}
                      className={`px-3 py-1.5 text-[10px] rounded-full border transition-all ${story.genres.includes(genre) ? 'bg-ink-900 dark:bg-white text-white dark:text-black border-transparent' : 'bg-white dark:bg-ink-900 border-ink-200 dark:border-ink-800 hover:border-ink-400'}`}
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
      
      <footer className="px-6 py-2.5 border-t border-ink-100 dark:border-ink-800 bg-white dark:bg-black text-[10px] font-mono text-ink-400 flex justify-between items-center z-30">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5"><Icons.Pen size={12} /> {wordCount} PALABRAS</span>
          <span className="flex items-center gap-1.5"><Icons.Book size={12} /> {readingTime} MIN. LECTURA</span>
        </div>
        <div className="flex items-center gap-4">
           <span className="opacity-50 uppercase tracking-tighter">Sincronización Local Activa</span>
           <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </footer>
    </div>
  );
};
