
import React, { useState, useEffect, useRef } from 'react';
import { Story, Page, Character, Genre, StoryStatus, EditorTheme, CloudImage } from '../types';
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
  cloudImages: CloudImage[];
  isUserLoggedIn: boolean;
  readOnly?: boolean;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Editor: React.FC<EditorProps> = ({ 
  story: initialStory, 
  onSave, 
  onClose, 
  onShare, 
  theme,
  onChangeTheme,
  cloudImages,
  isUserLoggedIn,
  readOnly = false,
  isDarkMode,
  onToggleDarkMode
}) => {
  const [story, setStory] = useState<Story>({ 
    ...initialStory, 
    characters: initialStory.characters || [],
    genres: initialStory.genres || []
  });
  const [activePageId, setActivePageId] = useState<string>(initialStory.pages[0]?.id || '');
  const [showInspector, setShowInspector] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  // Fix: Added missing zenMode state to manage distraction-free writing environment
  const [zenMode, setZenMode] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  
  const activePage = story.pages.find(p => p.id === activePageId);

  // SEGURIDAD: Prevenir refresco accidental o cierre de pestaña
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty && !readOnly) {
        const message = "¡Cuidado! Tienes cambios en tu historia que aún no han sido sincronizados.";
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty, readOnly]);

  useEffect(() => {
    if (editorRef.current && activePage) {
      if (editorRef.current.innerHTML !== activePage.content) {
        editorRef.current.innerHTML = activePage.content || '<p><br></p>';
      }
    }
  }, [activePageId]);

  // Auto-guardado silencioso
  useEffect(() => {
    if (!isDirty || readOnly) return;
    const timer = setTimeout(() => handleManualSave(), 5000);
    return () => clearTimeout(timer);
  }, [story, isDirty, readOnly]);

  const handleInput = () => {
    if (readOnly) return;
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
    if (readOnly) return;
    setIsSaving(true);
    onSave(story);
    setIsDirty(false);
    setTimeout(() => setIsSaving(false), 800);
  };

  const handleSafeClose = () => {
    if (isDirty && !readOnly) {
      if (confirm("Hay cambios sin sincronizar. ¿Deseas abandonar el estudio?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  const finalizePublication = (asAnonymous: boolean) => {
    let finalAuthorName = "Anónimo";
    if (!asAnonymous) {
      const name = prompt("Introduce tu Firma de Autor para el Feed Comunitario:", story.authorName || "");
      if (!name) return;
      finalAuthorName = name;
    }
    
    const updatedStory = { ...story, isPublished: true, authorName: finalAuthorName };
    setStory(updatedStory);
    onSave(updatedStory);
    setShowPublishModal(false);
    setIsDirty(false);
    alert(`¡Tu obra ya está en el Feed Comunitario como ${finalAuthorName}!`);
  };

  const handleUnpublish = () => {
    if (confirm("¿Quieres retirar esta historia de la comunidad global?")) {
      const updatedStory = { ...story, isPublished: false };
      setStory(updatedStory);
      onSave(updatedStory);
      alert("Historia retirada del servidor.");
    }
  };

  const totalWords = story.pages.reduce((acc, p) => acc + countWords(p.content), 0);

  const getPaperStyles = () => {
    if (isDarkMode) return 'bg-black text-white border border-white/10 shadow-[0_0_50px_rgba(255,255,255,0.02)]';
    if (theme === 'SEPIA') return 'bg-[#f4ecd8] text-[#5d4037]';
    return 'bg-white text-ink-900 shadow-sm';
  };

  return (
    <div className={`flex flex-col h-full transition-colors duration-500 overflow-hidden relative ${isDarkMode ? 'bg-black text-white' : 'bg-white text-ink-900'}`}>
      
      {/* Modal de Publicación */}
      {showPublishModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[3rem] p-10 shadow-2xl border border-black/5 dark:border-white/5 flex flex-col items-center text-center space-y-8">
            <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center">
              <Icons.Publish size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-serif font-bold dark:text-white">Firma de Comunidad</h3>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 mt-3 dark:text-white">Publicación en Servidor</p>
            </div>
            <div className="w-full space-y-4">
              <button 
                onClick={() => finalizePublication(false)}
                className="w-full py-5 bg-ink-900 dark:bg-white text-white dark:text-black rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
              >
                Firmar con mi Nombre
              </button>
              <button 
                onClick={() => finalizePublication(true)}
                className="w-full py-5 bg-black/5 dark:bg-white/5 text-ink-900 dark:text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black/10 transition-all border border-black/5"
              >
                Publicar Anónimo
              </button>
              <button 
                onClick={() => setShowPublishModal(false)}
                className="w-full py-3 text-[9px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity dark:text-white"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fix: Handled missing zenMode variable to allow conditional rendering of the header */}
      {!zenMode && (
        <header className={`flex items-center justify-between px-6 py-4 border-b z-[100] shrink-0 transition-colors duration-500 ${isDarkMode ? 'bg-black border-white/5' : 'bg-white border-black/5'}`}>
          <div className="flex items-center gap-4">
            <button onClick={handleSafeClose} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"><Icons.Back size={18} /></button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-serif font-bold truncate max-w-[200px]">{story.title}</span>
                {story.isPublished && <Icons.Globe size={10} className="text-amber-500" />}
              </div>
              <span className="text-[9px] font-mono uppercase tracking-widest opacity-40">
                {readOnly ? `Leyendo a: ${story.authorName}` : `${totalWords} palabras`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!readOnly && (
              <div className="flex items-center gap-2">
                 <button 
                  onClick={onToggleDarkMode} 
                  className={`p-2.5 rounded-xl transition-all ${isDarkMode ? 'bg-amber-500 text-white shadow-lg' : 'bg-black/5 text-ink-400'}`}
                >
                  {isDarkMode ? <Icons.Sun size={18} /> : <Icons.Moon size={18} />}
                </button>
                 {isDirty && <span className="text-[8px] font-black uppercase tracking-widest text-amber-500 animate-pulse hidden md:block">Sin Sincronizar</span>}
                 <button 
                  onClick={handleManualSave}
                  className={`p-2.5 rounded-xl flex items-center gap-2 transition-all ${isDirty ? 'bg-ink-900 dark:bg-white text-white dark:text-black shadow-lg scale-105' : 'bg-black/5 text-ink-400 opacity-30'}`}
                >
                  <Icons.Save size={18} />
                  <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">{isSaving ? '...' : 'Sincronizar'}</span>
                </button>
              </div>
            )}
            {/* Added Zen Mode toggle button */}
            <button 
              onClick={() => setZenMode(true)} 
              className="p-2.5 bg-black/5 dark:bg-white/5 text-ink-400 rounded-xl hover:text-amber-500 transition-colors"
              title="Activar Modo Zen"
            >
              <Icons.ZenOpen size={18} />
            </button>
            <button 
              onClick={() => setShowInspector(!showInspector)} 
              className={`p-2.5 rounded-xl transition-all ${showInspector ? 'bg-amber-500 text-white shadow-lg' : 'bg-black/5 text-ink-400'}`}
            >
              <Icons.Magic size={18} />
            </button>
          </div>
        </header>
      )}

      <div className={`flex-1 flex overflow-hidden relative transition-colors duration-500 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
        <main className="flex-1 flex flex-col min-w-0 relative z-10">
          <div className={`flex-1 overflow-y-auto custom-scrollbar transition-all duration-500 p-6 md:p-20`}>
            {/* El Papel de Escritura */}
            <div className={`max-w-2xl mx-auto min-h-full flex flex-col p-10 md:p-16 rounded-[2rem] transition-all duration-500 ${getPaperStyles()} ${readOnly ? 'select-none pointer-events-none' : ''}`}>
              <input 
                className="w-full font-serif font-bold bg-transparent outline-none border-none focus:ring-0 p-0 text-3xl md:text-5xl mb-12 tracking-tighter placeholder:opacity-10"
                value={activePage?.title || ''}
                readOnly={readOnly}
                onChange={(e) => { 
                  if (readOnly) return;
                  setIsDirty(true); 
                  setStory(prev => ({ ...prev, pages: prev.pages.map(p => p.id === activePageId ? { ...p, title: e.target.value } : p) })); 
                }}
                placeholder="Escena..."
              />
              <div
                ref={editorRef} 
                contentEditable={!readOnly} 
                onInput={handleInput} 
                spellCheck={false}
                className="flex-1 w-full bg-transparent outline-none font-serif leading-[2] text-lg md:text-xl pb-64 whitespace-pre-wrap"
                data-placeholder={readOnly ? "" : "Escribe tu legado aquí..."}
              />
            </div>
          </div>

          <div className={`shrink-0 border-t px-4 pt-4 pb-12 flex items-center justify-center transition-colors duration-500 z-50 ${isDarkMode ? 'bg-black border-white/5' : 'bg-white border-black/5'}`}>
            <div className="max-w-4xl w-full flex items-center gap-4 overflow-x-auto no-scrollbar py-2 px-4">
              {/* Added exit Zen Mode button in footer for accessibility when header is hidden */}
              {zenMode && (
                <button 
                  onClick={() => setZenMode(false)} 
                  className="shrink-0 p-3 bg-amber-500 text-white rounded-2xl shadow-lg hover:scale-110 active:scale-95 transition-all mr-2"
                  title="Salir Modo Zen"
                >
                  <Icons.ZenClose size={20} />
                </button>
              )}
              {story.pages.sort((a,b) => a.order - b.order).map((p, idx) => (
                <button 
                  key={p.id} onClick={() => {
                     if (isDirty && activePageId !== p.id) handleManualSave();
                     setActivePageId(p.id);
                  }}
                  className={`shrink-0 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activePageId === p.id ? 'bg-ink-900 dark:bg-white text-white dark:text-black shadow-xl scale-110' : 'bg-black/5 dark:bg-white/5 hover:bg-black/10'}`}
                >
                  {idx + 1}. {p.title || 'Escena'}
                </button>
              ))}
              {!readOnly && (
                <button onClick={() => {
                  const newPage = { id: generateId(ID_PREFIX.PAGE), title: `Escena ${story.pages.length + 1}`, content: '', order: story.pages.length };
                  setStory(prev => ({ ...prev, pages: [...prev.pages, newPage] }));
                  setActivePageId(newPage.id);
                  setIsDirty(true);
                }} className="shrink-0 w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"><Icons.Plus size={20} /></button>
              )}
            </div>
          </div>
        </main>

        {/* Inspector de Obra */}
        <aside className={`fixed lg:relative inset-y-0 right-0 z-[120] transition-all duration-500 ease-in-out ${showInspector ? 'w-full md:w-80 lg:w-96 translate-x-0' : 'w-0 translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden'} border-l shadow-2xl ${isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-black/5'}`}>
          <div className="flex flex-col h-full w-full">
            <div className="p-8 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-black/[0.02] dark:bg-white/[0.02]">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-ink-500">Gestión de Obra</h2>
              <button onClick={() => setShowInspector(false)} className="p-2 hover:bg-black/5 dark:hover:bg-white/5 rounded-full transition-colors"><Icons.X size={18} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-12">
              <div className="p-8 bg-black/5 dark:bg-white/5 rounded-[2.5rem] border border-black/5 dark:border-white/5 space-y-6 text-center">
                <div className="flex flex-col items-center gap-4">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${story.isPublished ? 'bg-amber-500 text-white' : 'bg-ink-100 dark:bg-ink-800 text-ink-400'}`}>
                      <Icons.Globe size={28} />
                   </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-serif italic font-bold">
                    {story.isPublished ? story.authorName : "Borrador Local"}
                  </p>
                  <p className="text-[9px] font-mono opacity-40 uppercase tracking-widest">Sincronización de Comunidad</p>
                </div>
                {!readOnly && (
                  <div className="space-y-3 pt-4">
                    <button 
                      onClick={() => {
                        if (story.isPublished) {
                          handleManualSave();
                          alert("¡Versión actualizada en el servidor!");
                        } else {
                          setShowPublishModal(true);
                        }
                      }}
                      className={`w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-3 ${story.isPublished ? 'bg-amber-500 text-white' : 'bg-ink-900 dark:bg-white text-white dark:text-black'}`}
                    >
                      {story.isPublished ? <Icons.Reset size={16} /> : <Icons.Publish size={16} />}
                      {story.isPublished ? 'Actualizar Servidor' : 'Publicar Obra'}
                    </button>
                    {story.isPublished && (
                      <button onClick={handleUnpublish} className="w-full py-4 bg-red-500/10 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all border border-red-500/10">Retirar de Comunidad</button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
