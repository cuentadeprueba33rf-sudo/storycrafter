
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
  readOnly?: boolean; // Prop para modo lectura (Comunidad)
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
  const [story, setStory] = useState<Story>({ ...initialStory, characters: initialStory.characters || [] });
  const [activePageId, setActivePageId] = useState<string>(initialStory.pages[0]?.id || '');
  const [showInspector, setShowInspector] = useState(false);
  const [activeTab, setActiveTab] = useState<InspectorTab>('metas');
  const [zenMode, setZenMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const typewriterAudioRef = useRef<HTMLAudioElement>(null);
  
  const activePage = story.pages.find(p => p.id === activePageId);

  // Prevenir copiado y selección en modo lectura
  useEffect(() => {
    if (readOnly) {
      const handleCopy = (e: ClipboardEvent) => {
        e.preventDefault();
        alert("Protección de Autor: No se permite copiar contenido de la comunidad.");
      };
      const handleContextMenu = (e: MouseEvent) => e.preventDefault();
      
      document.addEventListener('copy', handleCopy);
      document.addEventListener('contextmenu', handleContextMenu);
      return () => {
        document.removeEventListener('copy', handleCopy);
        document.removeEventListener('contextmenu', handleContextMenu);
      };
    }
  }, [readOnly]);

  useEffect(() => {
    const handleKeyDown = () => {
      if (!readOnly && story.typewriterEnabled && typewriterAudioRef.current) {
        typewriterAudioRef.current.currentTime = 0;
        typewriterAudioRef.current.play().catch(() => {});
      }
    };
    const editor = editorRef.current;
    if (editor && !readOnly) editor.addEventListener('keydown', handleKeyDown);
    return () => editor?.removeEventListener('keydown', handleKeyDown);
  }, [story.typewriterEnabled, readOnly]);

  useEffect(() => {
    if (editorRef.current && activePage) {
      if (editorRef.current.innerHTML !== activePage.content) {
        editorRef.current.innerHTML = activePage.content || '<p><br></p>';
      }
    }
  }, [activePageId]);

  useEffect(() => {
    if (!isDirty || readOnly) return;
    const timer = setTimeout(() => {
      handleManualSave();
    }, 2000);
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

  const handleTogglePublish = () => {
    if (readOnly) return;
    if (!isUserLoggedIn) {
      alert("Debes iniciar sesión para publicar historias en el feed comunitario.");
      return;
    }
    const nextStatus = !story.isPublished;
    setStory(prev => ({ ...prev, isPublished: nextStatus }));
    setIsDirty(true);
  };

  const totalWords = story.pages.reduce((acc, p) => acc + countWords(p.content), 0);

  return (
    <div className={`flex flex-col h-full transition-colors duration-500 overflow-hidden relative ${theme === 'DARK' ? 'bg-black text-white' : theme === 'SEPIA' ? 'bg-[#f4ecd8] text-[#5d4037]' : 'bg-white text-ink-900'}`}>
      <audio ref={typewriterAudioRef} src="https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3" preload="auto" />

      {!zenMode && (
        <header className="flex items-center justify-between px-6 py-3 border-b border-black/5 z-[100] shrink-0 bg-inherit">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full"><Icons.Back size={18} /></button>
            <div className="flex flex-col">
              <h1 className="text-xs font-serif font-bold truncate max-w-[200px]">{story.title}</h1>
              <span className="text-[9px] font-mono uppercase tracking-widest opacity-40">
                {readOnly ? `Por ${story.authorName}` : `${totalWords} palabras`}
              </span>
            </div>
            {readOnly && (
              <span className="px-2 py-0.5 bg-amber-500 text-white text-[8px] font-black uppercase rounded-full">Lectura</span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {!readOnly && (
              <button 
                onClick={handleManualSave}
                className={`p-2.5 rounded-xl flex items-center gap-2 transition-all ${isDirty ? 'bg-ink-900 dark:bg-white text-white dark:text-black shadow-lg scale-105' : 'opacity-60'}`}
              >
                <Icons.Save size={18} />
                <span className="hidden md:inline text-[9px] font-black uppercase tracking-widest">{isSaving ? '...' : 'Guardar'}</span>
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
            <div className={`max-w-2xl mx-auto min-h-full flex flex-col ${readOnly ? 'select-none pointer-events-none' : ''}`} style={readOnly ? { userSelect: 'none', WebkitUserSelect: 'none' } : {}}>
              <input 
                className="w-full font-serif font-bold bg-transparent outline-none border-none focus:ring-0 p-0 text-3xl md:text-5xl mb-10"
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
                className="flex-1 w-full bg-transparent outline-none font-serif leading-[1.8] text-lg md:text-xl pb-64"
                data-placeholder={readOnly ? "" : "Escribe aquí tu manuscrito..."}
              />
            </div>
          </div>

          {!zenMode && (
            <div className="shrink-0 border-t border-black/5 px-4 pt-4 pb-10 flex items-center justify-center bg-inherit/90 backdrop-blur-md z-50">
              <div className="max-w-4xl w-full flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
                {story.pages.sort((a,b) => a.order - b.order).map((p, idx) => (
                  <button 
                    key={p.id} onClick={() => setActivePageId(p.id)}
                    className={`shrink-0 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activePageId === p.id ? 'bg-ink-900 dark:bg-white text-white dark:text-black shadow-xl' : 'bg-black/5'}`}
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
                  }} className="shrink-0 w-11 h-11 bg-amber-500 text-white rounded-xl flex items-center justify-center"><Icons.Plus size={18} /></button>
                )}
              </div>
            </div>
          )}
        </main>

        <aside className={`fixed lg:relative inset-y-0 right-0 z-[120] transition-all duration-500 ease-in-out ${showInspector ? 'w-full md:w-80 lg:w-96 translate-x-0' : 'w-0 translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden'} ${theme === 'DARK' ? 'bg-ink-950' : 'bg-white'} border-l border-black/5`}>
          <div className="flex flex-col h-full w-full">
            <div className="p-8 border-b border-black/5">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Info Historia</h2>
                <button onClick={() => setShowInspector(false)} className="p-2 hover:bg-black/5 rounded-full"><Icons.X size={18} /></button>
              </div>
              <div className="grid grid-cols-2 bg-black/5 p-1 rounded-xl">
                 <button onClick={() => setActiveTab('metas')} className={`py-2 flex items-center justify-center rounded-lg transition-all ${activeTab === 'metas' ? 'bg-white shadow-sm text-ink-900' : 'opacity-40 hover:opacity-100'}`}>
                    <Icons.Target size={14} />
                  </button>
                  <button onClick={() => setActiveTab('biblia')} className={`py-2 flex items-center justify-center rounded-lg transition-all ${activeTab === 'biblia' ? 'bg-white shadow-sm text-ink-900' : 'opacity-40 hover:opacity-100'}`}>
                    <Icons.Bible size={14} />
                  </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              {activeTab === 'metas' && (
                <div className="space-y-10 animate-in fade-in">
                  <div className="p-8 bg-black/5 rounded-[2.5rem] border border-black/5 space-y-6 text-center">
                    <div className="flex flex-col items-center gap-4">
                       <Icons.Globe size={32} className={story.isPublished ? 'text-amber-500' : 'opacity-20'} />
                       <h4 className="text-[10px] font-black uppercase tracking-widest">Información del Autor</h4>
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl font-serif italic font-bold">{story.authorName || 'Autor Desconocido'}</p>
                      <p className="text-[9px] font-mono opacity-40 uppercase tracking-widest">Firma Registrada</p>
                    </div>
                    {!readOnly && (
                       <button 
                       onClick={handleTogglePublish}
                       className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${story.isPublished ? 'bg-amber-500 text-white shadow-lg' : 'bg-ink-200 dark:bg-ink-800'}`}
                     >
                       {story.isPublished ? 'Obra Publicada ✓' : 'Publicar Ahora'}
                     </button>
                    )}
                  </div>

                  <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Estado de la Obra</label>
                    <div className="w-full p-5 bg-black/5 dark:bg-white/5 border-none rounded-2xl text-xs font-bold">
                       {story.status}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'biblia' && (
                <div className="space-y-8 animate-in fade-in">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Sinopsis</label>
                    <div className="w-full p-6 bg-black/5 dark:bg-white/5 border-none rounded-3xl text-xs font-serif italic leading-relaxed min-h-[200px]">
                      {story.synopsis || "No hay sinopsis disponible."}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};
