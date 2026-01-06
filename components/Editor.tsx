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

type InspectorTab = 'gestion' | 'biblia';

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
  const [activeTab, setActiveTab] = useState<InspectorTab>('gestion');
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
        alert("Protección de Autor: Este manuscrito está protegido y no puede ser copiado.");
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

  // Auto-guardado silencioso para el contenido del editor
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

  const finalizePublication = (asAnonymous: boolean) => {
    const finalAuthorName = asAnonymous ? "Anónimo" : (initialStory.authorName || "Escritor");
    const updatedStory = { ...story, isPublished: true, authorName: finalAuthorName };
    setStory(updatedStory);
    onSave(updatedStory);
    setShowPublishModal(false);
    setIsDirty(false);
    alert(`¡Obra lanzada a la comunidad como ${finalAuthorName}!`);
  };

  const handleUnpublish = () => {
    if (confirm("¿Quieres retirar esta historia de la comunidad? Seguirá estando disponible solo para ti en tu Studio.")) {
      const updatedStory = { ...story, isPublished: false };
      setStory(updatedStory);
      onSave(updatedStory);
      alert("Historia retirada del feed público.");
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

      {/* Modal de Publicación Inicial */}
      {showPublishModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-ink-950/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-zinc-900 w-full max-w-sm rounded-[3rem] p-10 shadow-2xl border border-black/5 flex flex-col items-center text-center space-y-8">
            <div className="w-20 h-20 bg-amber-500/10 text-amber-500 rounded-full flex items-center justify-center">
              <Icons.Publish size={40} />
            </div>
            <div>
              <h3 className="text-2xl font-serif font-bold dark:text-white">Protocolo de Firma</h3>
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] opacity-40 mt-3">Publicación en Comunidad</p>
            </div>
            <div className="w-full space-y-4">
              <button 
                onClick={() => finalizePublication(false)}
                className="w-full py-5 bg-ink-900 dark:bg-white text-white dark:text-black rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl"
              >
                Como {initialStory.authorName || "Mi Firma"}
              </button>
              <button 
                onClick={() => finalizePublication(true)}
                className="w-full py-5 bg-black/5 dark:bg-white/5 text-ink-900 dark:text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black/10 transition-all border border-black/5"
              >
                Anónimo
              </button>
              <button 
                onClick={() => setShowPublishModal(false)}
                className="w-full py-3 text-[9px] font-black uppercase tracking-widest opacity-30 hover:opacity-100 transition-opacity"
              >
                Cancelar
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
                <span className="text-xs font-serif font-bold truncate max-w-[200px]">{story.title}</span>
                {story.isPublished && <Icons.Check size={10} className="text-amber-500" strokeWidth={4} />}
              </div>
              <span className="text-[9px] font-mono uppercase tracking-widest opacity-40">
                {readOnly ? `Leyendo a: ${story.authorName}` : `${totalWords} palabras`}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {!readOnly && (
              <div className="flex items-center gap-2">
                 {isDirty && <span className="text-[8px] font-black uppercase tracking-widest text-amber-500 animate-pulse hidden md:block">Cambios sin guardar</span>}
                 <button 
                  onClick={handleManualSave}
                  className={`p-2.5 rounded-xl flex items-center gap-2 transition-all ${isDirty ? 'bg-ink-900 dark:bg-white text-white dark:text-black shadow-lg scale-105' : 'opacity-30'}`}
                >
                  <Icons.Save size={18} />
                  <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">{isSaving ? 'Fijando...' : 'Sincronizar'}</span>
                </button>
              </div>
            )}
            <button 
              onClick={() => setShowInspector(!showInspector)} 
              className={`p-2.5 rounded-xl transition-all ${showInspector ? 'bg-amber-500 text-white shadow-lg' : 'hover:bg-black/5'}`}
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
                placeholder="Escena..."
              />
              <div
                ref={editorRef} 
                contentEditable={!readOnly} 
                onInput={handleInput} 
                spellCheck={false}
                className="flex-1 w-full bg-transparent outline-none font-serif leading-[2] text-lg md:text-xl pb-64 whitespace-pre-wrap"
                data-placeholder={readOnly ? "" : "El papel espera tu historia..."}
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
                  }} className="shrink-0 w-12 h-12 bg-amber-500 text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"><Icons.Plus size={20} /></button>
                )}
              </div>
            </div>
          )}
        </main>

        <aside className={`fixed lg:relative inset-y-0 right-0 z-[120] transition-all duration-500 ease-in-out ${showInspector ? 'w-full md:w-80 lg:w-96 translate-x-0' : 'w-0 translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden'} ${theme === 'DARK' ? 'bg-ink-950' : 'bg-white'} border-l border-black/5 shadow-2xl`}>
          <div className="flex flex-col h-full w-full">
            <div className="p-8 border-b border-black/5 flex justify-between items-center bg-black/[0.02]">
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-ink-500">Gestión de Obra</h2>
              <button onClick={() => setShowInspector(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors"><Icons.X size={18} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-12">
              {/* Card de Estado Público y Botón de Actualizar */}
              <div className="p-8 bg-black/5 dark:bg-white/5 rounded-[2.5rem] border border-black/5 space-y-6 text-center">
                <div className="flex flex-col items-center gap-4">
                   <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-colors ${story.isPublished ? 'bg-amber-500 text-white' : 'bg-ink-100 dark:bg-ink-800 text-ink-400'}`}>
                      <Icons.Globe size={28} />
                   </div>
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-serif italic font-bold">
                    {story.isPublished ? (story.authorName === "Anónimo" ? "Firma Anónima" : story.authorName) : "Borrador Privado"}
                  </p>
                  <p className="text-[9px] font-mono opacity-40 uppercase tracking-widest">Estado en Comunidad</p>
                </div>
                {!readOnly && (
                  <div className="space-y-3 pt-4">
                    {/* Botón Maestro de Guardado / Actualización */}
                    <button 
                      onClick={() => {
                        if (!isUserLoggedIn) return alert("Inicia sesión para usar el feed.");
                        if (story.isPublished) {
                          handleManualSave();
                          alert("¡Obra actualizada en el feed comunitario!");
                        } else {
                          setShowPublishModal(true);
                        }
                      }}
                      className={`w-full py-5 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl transition-all hover:scale-[1.03] active:scale-95 flex items-center justify-center gap-3 ${story.isPublished ? 'bg-amber-500 text-white' : 'bg-ink-900 dark:bg-white text-white dark:text-black'}`}
                    >
                      {/* Fixed: Use Icons.Reset instead of Icons.RotateCcw as defined in components/Icon.tsx */}
                      {story.isPublished ? <Icons.Reset size={16} /> : <Icons.Plus size={16} />}
                      {story.isPublished ? 'Actualizar en Comunidad' : 'Publicar Ahora'}
                    </button>
                    
                    {story.isPublished && (
                      <button 
                        onClick={handleUnpublish}
                        className="w-full py-4 bg-red-500/10 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all border border-red-500/10"
                      >
                        Retirar de Comunidad
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Título de la Obra Editable */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Título del Manuscrito</label>
                  {!readOnly && <Icons.Edit size={12} className="opacity-20" />}
                </div>
                <input 
                  type="text"
                  value={story.title}
                  readOnly={readOnly}
                  onChange={(e) => {
                    if (readOnly) return;
                    setStory(prev => ({ ...prev, title: e.target.value }));
                    setIsDirty(true);
                  }}
                  className="w-full p-5 bg-black/5 dark:bg-white/5 border-none rounded-2xl text-sm font-serif font-bold outline-none focus:ring-2 focus:ring-amber-500/30 transition-all"
                  placeholder="Sin título..."
                />
              </div>

              {/* Sinopsis Editable */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Sinopsis del Libro</label>
                  {!readOnly && <Icons.Edit size={12} className="opacity-20" />}
                </div>
                <textarea 
                  value={story.synopsis}
                  readOnly={readOnly}
                  onChange={(e) => {
                    if (readOnly) return;
                    setStory(prev => ({ ...prev, synopsis: e.target.value }));
                    setIsDirty(true);
                  }}
                  className="w-full p-6 bg-black/5 dark:bg-white/5 border-none rounded-3xl text-xs font-serif italic leading-relaxed min-h-[180px] outline-none resize-none focus:ring-2 focus:ring-amber-500/30 transition-all"
                  placeholder="¿De qué trata este legado?..."
                />
              </div>

              {/* Selección de Géneros */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Géneros Sugeridos</label>
                <div className="flex flex-wrap gap-2">
                  {ALL_GENRES.map(genre => (
                    <button
                      key={genre}
                      onClick={() => toggleGenre(genre as Genre)}
                      disabled={readOnly}
                      className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-tighter transition-all border ${story.genres.includes(genre as Genre) ? 'bg-ink-900 dark:bg-white text-white dark:text-black border-transparent' : 'bg-black/5 border-black/5 opacity-40 hover:opacity-100'}`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-12 border-t border-black/5 flex flex-col gap-2">
                 <div className="flex justify-between items-center opacity-30">
                   <span className="text-[9px] font-black uppercase tracking-widest">Creado el</span>
                   <span className="text-[10px] font-mono">{new Date(story.createdAt).toLocaleDateString()}</span>
                 </div>
                 <div className="flex justify-between items-center opacity-30">
                   <span className="text-[9px] font-black uppercase tracking-widest">Última Firma</span>
                   <span className="text-[10px] font-mono">{new Date(story.updatedAt).toLocaleTimeString()}</span>
                 </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};