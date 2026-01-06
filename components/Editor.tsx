
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
}

type InspectorTab = 'metas' | 'biblia' | 'casting' | 'musica' | 'sprint';

export const Editor: React.FC<EditorProps> = ({ 
  story: initialStory, 
  onSave, 
  onClose, 
  onShare, 
  theme,
  onChangeTheme,
  cloudImages,
  isUserLoggedIn,
  readOnly = false
}) => {
  const [story, setStory] = useState<Story>({ 
    ...initialStory, 
    characters: initialStory.characters || [],
    genres: initialStory.genres || []
  });
  const [activePageId, setActivePageId] = useState<string>(initialStory.pages[0]?.id || '');
  const [showInspector, setShowInspector] = useState(false);
  const [activeTab, setActiveTab] = useState<InspectorTab>('metas');
  const [zenMode, setZenMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const typewriterAudioRef = useRef<HTMLAudioElement>(null);
  
  const activePage = story.pages.find(p => p.id === activePageId);

  // Protección contra copia y robo en modo lectura
  useEffect(() => {
    if (readOnly) {
      const preventDefault = (e: Event) => e.preventDefault();
      const handleCopy = (e: ClipboardEvent) => {
        e.preventDefault();
        alert("Protección de Autor: Este manuscrito está bajo derechos reservados y no puede ser copiado.");
      };
      
      document.addEventListener('copy', handleCopy);
      document.addEventListener('contextmenu', preventDefault);
      document.addEventListener('selectstart', preventDefault);
      
      return () => {
        document.removeEventListener('copy', handleCopy);
        document.removeEventListener('contextmenu', preventDefault);
        document.removeEventListener('selectstart', preventDefault);
      };
    }
  }, [readOnly]);

  useEffect(() => {
    if (editorRef.current && activePage) {
      if (editorRef.current.innerHTML !== activePage.content) {
        editorRef.current.innerHTML = activePage.content || '<p><br></p>';
      }
    }
  }, [activePageId]);

  useEffect(() => {
    if (!isDirty || readOnly) return;
    const timer = setTimeout(() => handleManualSave(), 2000);
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

  const finalizePublication = (asAnonymous: boolean) => {
    // Obtenemos el nombre real guardado en metadatos si no es anónimo
    // Si asAnonymous es true, usamos "Anónimo"
    // El nombre real viene del estado inicial o de la sesión (manejado en App.tsx)
    const finalAuthorName = asAnonymous ? "Anónimo" : (initialStory.authorName || "Escritor");
    const updatedStory = { ...story, isPublished: true, authorName: finalAuthorName };
    setStory(updatedStory);
    onSave(updatedStory);
    setShowPublishModal(false);
    setIsDirty(false);
    alert(`¡Obra lanzada a la comunidad como ${finalAuthorName}!`);
  };

  const handleUnpublish = () => {
    if (confirm("¿Quieres retirar esta historia de la comunidad? Seguirá estando disponible solo para ti.")) {
      const updatedStory = { ...story, isPublished: false };
      setStory(updatedStory);
      onSave(updatedStory);
      alert("Historia desvinculada del feed público.");
    }
  };

  const toggleGenre = (genre: Genre) => {
    if (readOnly) return;
    const newGenres = story.genres.includes(genre)
      ? story.genres.filter(g => g !== genre)
      : [...story.genres, genre];
    
    setStory(prev => ({ ...prev, genres: newGenres }));
    setIsDirty(true);
  };

  const totalWords = story.pages.reduce((acc, p) => acc + countWords(p.content), 0);

  return (
    <div className={`flex flex-col h-full transition-colors duration-500 overflow-hidden relative ${theme === 'DARK' ? 'bg-black text-white' : theme === 'SEPIA' ? 'bg-[#f4ecd8] text-[#5d4037]' : 'bg-white text-ink-900'}`}>
      <audio ref={typewriterAudioRef} src="https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3" preload="auto" />

      {/* Protocolo de Firma (Modal) */}
      {showPublishModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-ink-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[3rem] p-10 shadow-2xl border border-black/5 flex flex-col items-center text-center space-y-8">
            <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center animate-pulse">
              <Icons.Publish size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-serif font-bold dark:text-white">Firma tu Manuscrito</h3>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 mt-3">Elige tu identidad pública</p>
            </div>
            <div className="w-full space-y-4">
              <button 
                onClick={() => finalizePublication(false)}
                className="w-full py-5 bg-ink-900 dark:bg-white text-white dark:text-black rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
              >
                Como {initialStory.authorName || "Mi Firma Real"}
              </button>
              <button 
                onClick={() => finalizePublication(true)}
                className="w-full py-5 bg-black/5 dark:bg-white/5 text-ink-900 dark:text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black/10 transition-all border border-black/5"
              >
                Firma Anónima
              </button>
              <button 
                onClick={() => setShowPublishModal(false)}
                className="w-full py-3 text-[9px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity"
              >
                Regresar al Studio
              </button>
            </div>
          </div>
        </div>
      )}

      {!zenMode && (
        <header className="flex items-center justify-between px-6 py-4 border-b border-black/5 z-[100] shrink-0 bg-inherit backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors"><Icons.Back size={18} /></button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xs font-serif font-bold truncate max-w-[250px]">{story.title}</span>
                {story.isPublished && <Icons.Globe size={10} className="text-amber-500" />}
              </div>
              <span className="text-[9px] font-mono uppercase tracking-widest opacity-40">
                {readOnly ? `Autor: ${story.authorName}` : `${totalWords} palabras registradas`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!readOnly && (
              <button 
                onClick={handleManualSave}
                className={`p-2.5 rounded-xl flex items-center gap-2 transition-all ${isDirty ? 'bg-ink-900 dark:bg-white text-white dark:text-black shadow-lg scale-105' : 'opacity-30'}`}
              >
                <Icons.Save size={18} />
                <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">{isSaving ? 'Fijando...' : 'Sincronizar'}</span>
              </button>
            )}
            <button 
              onClick={() => setShowInspector(!showInspector)} 
              className={`p-2.5 rounded-xl transition-all ${showInspector ? 'bg-amber-500 text-white' : 'hover:bg-black/5'}`}
            >
              <Icons.Magic size={18} />
            </button>
          </div>
        </header>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 flex flex-col min-w-0 relative bg-inherit z-10">
          <div className={`flex-1 overflow-y-auto custom-scrollbar transition-all duration-500 ${zenMode ? 'p-10 md:p-32' : 'p-6 md:p-20'}`}>
            <div className={`max-w-2xl mx-auto min-h-full flex flex-col ${readOnly ? 'select-none pointer-events-none' : ''}`}>
              <input 
                className="w-full font-serif font-bold bg-transparent outline-none border-none focus:ring-0 p-0 text-3xl md:text-5xl mb-12 tracking-tighter"
                value={activePage?.title || ''}
                readOnly={readOnly}
                onChange={(e) => { 
                  if (readOnly) return;
                  setIsDirty(true); 
                  setStory(prev => ({ ...prev, pages: prev.pages.map(p => p.id === activePageId ? { ...p, title: e.target.value } : p) })); 
                }}
                placeholder="Título de Escena..."
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

          {!zenMode && (
            <div className="shrink-0 border-t border-black/5 px-4 pt-4 pb-12 flex items-center justify-center bg-inherit/90 backdrop-blur-md z-50">
              <div className="max-w-4xl w-full flex items-center gap-4 overflow-x-auto no-scrollbar py-2 px-4">
                {story.pages.sort((a,b) => a.order - b.order).map((p, idx) => (
                  <button 
                    key={p.id} onClick={() => setActivePageId(p.id)}
                    className={`shrink-0 px-5 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${activePageId === p.id ? 'bg-ink-900 dark:bg-white text-white dark:text-black shadow-xl scale-110' : 'bg-black/5 hover:bg-black/10'}`}
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
                  }} className="shrink-0 w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg hover:rotate-90 transition-transform"><Icons.Plus size={20} /></button>
                )}
              </div>
            </div>
          )}
        </main>

        <aside className={`fixed lg:relative inset-y-0 right-0 z-[120] transition-all duration-500 ease-in-out ${showInspector ? 'w-full md:w-80 lg:w-96 translate-x-0' : 'w-0 translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden'} ${theme === 'DARK' ? 'bg-ink-950' : 'bg-white'} border-l border-black/5 shadow-2xl`}>
          <div className="flex flex-col h-full w-full">
            <div className="p-8 border-b border-black/5 flex justify-between items-center">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Gestión de Obra</h2>
              <button onClick={() => setShowInspector(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors"><Icons.X size={18} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-12">
              {/* Sección de Identidad y Publicación */}
              <div className="p-8 bg-black/5 dark:bg-white/5 rounded-[2.5rem] border border-black/5 space-y-6 text-center">
                <div className="flex flex-col items-center gap-4">
                   <Icons.Globe size={32} className={story.isPublished ? 'text-amber-500' : 'opacity-20'} />
                   <h4 className="text-[10px] font-black uppercase tracking-widest">Protocolo Comunitario</h4>
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-serif italic font-bold">
                    {story.isPublished ? (story.authorName === "Anónimo" ? "Identidad Oculta" : story.authorName) : "Borrador Privado"}
                  </p>
                  <p className="text-[9px] font-mono opacity-40 uppercase tracking-widest">Visibilidad en Ecos</p>
                </div>
                {!readOnly && (
                  <div className="space-y-3">
                    {!story.isPublished ? (
                      <button 
                        onClick={() => {
                          if (!isUserLoggedIn) return alert("Inicia sesión para compartir tu obra.");
                          setShowPublishModal(true);
                        }}
                        className="w-full py-5 bg-amber-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
                      >
                        Publicar en Comunidad
                      </button>
                    ) : (
                      <button 
                        onClick={handleUnpublish}
                        className="w-full py-5 bg-red-500/10 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all border border-red-500/10"
                      >
                        Retirar del Feed
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Título de la Obra */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Nombre del Manuscrito</label>
                <input 
                  type="text"
                  value={story.title}
                  readOnly={readOnly}
                  onChange={(e) => {
                    if (readOnly) return;
                    setStory(prev => ({ ...prev, title: e.target.value }));
                    setIsDirty(true);
                  }}
                  className="w-full p-5 bg-black/5 dark:bg-white/5 border-none rounded-2xl text-sm font-serif font-bold outline-none focus:ring-2 focus:ring-amber-500/30"
                  placeholder="Sin título..."
                />
              </div>

              {/* Sinopsis */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Sinopsis General</label>
                <textarea 
                  value={story.synopsis}
                  readOnly={readOnly}
                  onChange={(e) => {
                    if (readOnly) return;
                    setStory(prev => ({ ...prev, synopsis: e.target.value }));
                    setIsDirty(true);
                  }}
                  className="w-full p-6 bg-black/5 dark:bg-white/5 border-none rounded-3xl text-xs font-serif italic leading-relaxed min-h-[180px] outline-none resize-none focus:ring-2 focus:ring-amber-500/30"
                  placeholder="Describe el alma de tu historia..."
                />
              </div>

              {/* Géneros Literarios */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Géneros Literarios</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_GENRES.map(genre => (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre as Genre)}
                      disabled={readOnly}
                      className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-tighter transition-all border ${story.genres.includes(genre as Genre) ? 'bg-ink-900 dark:bg-white text-white dark:text-black border-transparent' : 'bg-black/5 border-black/5 opacity-40'}`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-12 border-t border-black/5">
                 <div className="flex justify-between items-center opacity-30">
                   <span className="text-[9px] font-black uppercase tracking-widest">Registro Original</span>
                   <span className="text-[10px] font-mono">{new Date(story.createdAt).toLocaleDateString()}</span>
                 </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
