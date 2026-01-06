
import React, { useState, useEffect, useRef } from 'react';
import { Story, Page, Character, Genre, StoryStatus, EditorTheme, CloudImage } from '../types';
import { Icons } from './Icon';
import { ALL_GENRES, ALL_STATUSES, ID_PREFIX } from '../constants';
import { countWords, generateId, formatSize } from '../utils/storage';

interface EditorProps {
  story: Story;
  onSave: (story: Story) => void;
  onClose: () => void;
  onShare: () => void;
  theme: EditorTheme;
  onChangeTheme: (theme: EditorTheme) => void;
  cloudImages: CloudImage[];
}

type InspectorTab = 'metas' | 'biblia' | 'casting' | 'musica';

export const Editor: React.FC<EditorProps> = ({ 
  story: initialStory, 
  onSave, 
  onClose, 
  onShare, 
  theme,
  onChangeTheme,
  cloudImages
}) => {
  const [story, setStory] = useState<Story>({ ...initialStory, characters: initialStory.characters || [] });
  const [activePageId, setActivePageId] = useState<string>(initialStory.pages[0]?.id || '');
  const [showInspector, setShowInspector] = useState(false);
  const [activeTab, setActiveTab] = useState<InspectorTab>('metas');
  const [zenMode, setZenMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showCloudPicker, setShowCloudPicker] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  
  const activePage = story.pages.find(p => p.id === activePageId);

  useEffect(() => {
    if (editorRef.current && activePage) {
      if (editorRef.current.innerHTML !== activePage.content) {
        editorRef.current.innerHTML = activePage.content || '<p><br></p>';
      }
    }
  }, [activePageId]);

  useEffect(() => {
    if (!isDirty) return;
    const timer = setTimeout(() => {
      onSave(story);
      setIsDirty(false);
    }, 5000);
    return () => clearTimeout(timer);
  }, [story, onSave, isDirty]);

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

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 15 * 1024 * 1024) {
      alert("El archivo es demasiado grande (Máximo 15MB). El Atelier requiere archivos ligeros.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setIsDirty(true);
      setStory(prev => ({
        ...prev,
        soundtrackData: reader.result as string,
        soundtrackName: file.name
      }));
    };
    reader.readAsDataURL(file);
  };

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(e => console.error("Error al reproducir audio:", e));
    }
    setIsPlaying(!isPlaying);
  };

  const handleRemoveAudio = () => {
    if (window.confirm("¿Eliminar atmósfera sonora?")) {
      setIsDirty(true);
      setStory(prev => ({ ...prev, soundtrackData: undefined, soundtrackName: undefined }));
      setIsPlaying(false);
    }
  };

  const processCastingInText = () => {
    if (!editorRef.current || !story.characters || story.characters.length === 0) return;
    const paragraphs = editorRef.current.querySelectorAll('p');
    paragraphs.forEach(p => {
      const existingBadges = p.querySelectorAll('.char-mention-badge');
      existingBadges.forEach(b => b.remove());
      const textContent = p.innerText;
      const mentionedChars = story.characters.filter(char => {
        if (!char.name || char.name.length < 2) return false;
        const regex = new RegExp(`\\b${char.name}\\b`, 'gi');
        return regex.test(textContent);
      });
      if (mentionedChars.length > 0) {
        [...mentionedChars].reverse().forEach(char => {
          const img = document.createElement('img');
          img.src = char.image;
          img.className = 'char-mention-badge';
          img.title = char.name;
          img.setAttribute('contenteditable', 'false');
          p.prepend(img);
        });
      }
    });
    handleInput();
  };

  const handleImportFromCloud = (img: CloudImage) => {
    const name = prompt("Nombre del personaje:", img.name.split('.')[0]);
    if (!name) return;
    const newChar: Character = {
      id: generateId('char_'),
      name: name,
      image: img.data,
      description: ""
    };
    setStory(prev => ({
      ...prev,
      characters: [...(prev.characters || []), newChar]
    }));
    setIsDirty(true);
    setShowCloudPicker(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const name = prompt("Nombre del personaje:");
      if (!name) return;
      const newChar: Character = {
        id: generateId('char_'),
        name: name,
        image: reader.result as string,
        description: ""
      };
      setStory(prev => ({
        ...prev,
        characters: [...(prev.characters || []), newChar]
      }));
      setIsDirty(true);
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteCharacter = (id: string) => {
    setStory(prev => ({
      ...prev,
      characters: prev.characters.filter(c => c.id !== id)
    }));
    setIsDirty(true);
  };

  const totalWords = story.pages.reduce((acc, p) => acc + countWords(p.content), 0);

  const getThemeClasses = () => {
    switch(theme) {
      case 'DARK': return 'bg-black text-ink-100 dark';
      case 'SEPIA': return 'bg-[#f4ecd8] text-[#5d4037]';
      default: return 'bg-white text-ink-900';
    }
  };

  const getPanelBg = () => {
    switch(theme) {
      case 'DARK': return 'bg-ink-950';
      case 'SEPIA': return 'bg-[#ebe3cf]';
      default: return 'bg-white';
    }
  };

  return (
    <div className={`flex flex-col h-full transition-colors duration-500 overflow-hidden relative ${getThemeClasses()}`}>
      
      {showCloudPicker && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-ink-950/40 backdrop-blur-md">
          <div className="bg-white/95 dark:bg-ink-950/95 backdrop-blur-3xl w-full max-w-2xl rounded-[3rem] shadow-2xl border border-black/5 overflow-hidden">
            <div className="p-10">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-xl font-serif font-bold">Importar de La Nube</h2>
                <button onClick={() => setShowCloudPicker(false)} className="p-2 hover:bg-black/5 rounded-full"><Icons.X size={18} /></button>
              </div>
              <div className="grid grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                {cloudImages.map(img => (
                  <button 
                    key={img.id} 
                    onClick={() => handleImportFromCloud(img)}
                    className="group relative aspect-square bg-black/5 rounded-2xl overflow-hidden hover:scale-105 transition-transform"
                  >
                    <img src={img.data} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center">
                      <Icons.Plus className="text-white" size={24} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {!zenMode && (
        <header className="flex items-center justify-between px-6 py-3 border-b border-black/5 z-[100] shrink-0 bg-inherit">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors"><Icons.Back size={18} /></button>
            <div className="flex flex-col">
              <h1 className="text-xs font-serif font-bold truncate max-w-[150px] md:max-w-[300px]">{story.title}</h1>
              <span className="text-[9px] font-mono uppercase tracking-widest opacity-40">{totalWords} palabras totales</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {story.soundtrackData && (
               <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border border-amber-500/20 ${isPlaying ? 'animate-pulse bg-amber-500/10' : 'bg-black/5'}`}>
                  <Icons.Music size={12} className="text-amber-600 dark:text-amber-400" />
                  <span className="text-[8px] font-black uppercase text-amber-600 dark:text-amber-400 tracking-tighter truncate max-w-[80px]">
                    {isPlaying ? 'En Aire' : 'Silencio'}
                  </span>
               </div>
            )}
            
            <button 
              onClick={processCastingInText}
              className="p-2 text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20 rounded-lg transition-all flex items-center gap-2 group"
              title="Sincronizar Reparto"
            >
              <Icons.Magic size={18} />
              <span className="hidden lg:inline text-[9px] font-black uppercase tracking-[0.2em]">Casting</span>
            </button>

            <button 
              onClick={() => setShowInspector(!showInspector)} 
              className={`p-2 rounded-lg flex items-center gap-2 transition-all ${showInspector ? 'bg-ink-900 dark:bg-white text-white dark:text-black shadow-lg' : 'hover:bg-black/5 text-ink-400'}`}
            >
              <Icons.Target size={18} />
              <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">Inspiración</span>
            </button>
          </div>
        </header>
      )}

      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 flex flex-col min-w-0 relative bg-inherit z-10">
          <div className={`flex-1 overflow-y-auto custom-scrollbar transition-all duration-500 ${zenMode ? 'p-10 md:p-32' : 'p-6 md:p-12 lg:p-20'}`}>
            <div className="max-w-2xl mx-auto min-h-full flex flex-col">
              <div className="mb-10">
                <input 
                  className={`w-full font-serif font-bold bg-transparent outline-none border-none focus:ring-0 p-0 transition-all ${zenMode ? 'text-4xl md:text-6xl text-center' : 'text-3xl md:text-5xl text-left'}`}
                  value={activePage?.title || ''}
                  onChange={(e) => { setIsDirty(true); setStory(prev => ({ ...prev, pages: prev.pages.map(p => p.id === activePageId ? { ...p, title: e.target.value } : p) })); }}
                  placeholder="Título de la escena..."
                />
              </div>
              
              <div
                ref={editorRef}
                contentEditable
                className={`flex-1 w-full bg-transparent outline-none font-serif leading-[1.8] min-h-[50vh] pb-64 selection:bg-ink-200 dark:selection:bg-ink-700 ${zenMode ? 'text-xl md:text-2xl text-justify' : 'text-lg md:text-xl'}`}
                onInput={handleInput}
                spellCheck={false}
                data-placeholder="Escribe aquí tu próxima obra maestra..."
              />
            </div>
          </div>
        </main>

        <aside className={`fixed lg:relative inset-y-0 right-0 z-[120] transition-all duration-500 ease-in-out ${showInspector ? 'w-full md:w-80 lg:w-96 translate-x-0' : 'w-0 translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden border-none'} ${getPanelBg()} border-l border-black/5 shadow-2xl`}>
          <div className="flex flex-col h-full w-full overflow-hidden">
            <div className="p-6 border-b border-black/5">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Módulo de Inspiración</h2>
                <button onClick={() => setShowInspector(false)} className="p-2 hover:bg-black/5 rounded-full"><Icons.X size={18} /></button>
              </div>
              <div className="grid grid-cols-4 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                {(['metas', 'biblia', 'casting', 'musica'] as InspectorTab[]).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`py-2 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === tab ? 'bg-white dark:bg-ink-800 shadow-sm text-ink-900 dark:text-white' : 'text-ink-400 opacity-60'}`}>
                    {tab === 'musica' ? <Icons.Music size={12} className="mx-auto" /> : tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {activeTab === 'musica' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2">
                      <Icons.Disc size={14} className={isPlaying ? 'animate-spin-slow' : ''} /> Atmósfera Local
                    </label>
                    {!story.soundtrackData ? (
                      <div className="flex flex-col gap-4">
                        <button 
                          onClick={() => audioInputRef.current?.click()}
                          className="w-full flex items-center justify-center gap-3 px-6 py-8 border-2 border-dashed border-black/10 dark:border-white/10 rounded-[2rem] hover:bg-black/[0.02] transition-colors group"
                        >
                          <Icons.Upload size={20} className="text-ink-300 group-hover:scale-110 transition-transform" />
                          <span className="text-[9px] font-black uppercase tracking-widest opacity-40">Subir .MP3 / .WAV</span>
                        </button>
                        <p className="text-[8px] text-ink-400 font-serif italic text-center px-4">
                          Máximo 15MB. El audio se almacenará de forma privada en tu navegador.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="p-6 bg-ink-900 dark:bg-white rounded-[2rem] shadow-xl relative overflow-hidden group">
                           <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 to-transparent opacity-50"></div>
                           <div className="relative z-10 flex flex-col items-center text-center gap-4">
                              <div className="p-4 bg-white/10 dark:bg-black/10 rounded-full">
                                <Icons.Music size={24} className="text-white dark:text-black" />
                              </div>
                              <div className="w-full">
                                <p className="text-[10px] font-black text-white dark:text-black uppercase tracking-widest line-clamp-1 mb-1">
                                  {story.soundtrackName || 'Atmósfera Cargada'}
                                </p>
                                <p className="text-[8px] font-serif italic text-white/40 dark:text-black/40">
                                  Audio Local Privado
                                </p>
                              </div>
                              <div className="flex gap-4 items-center">
                                <button 
                                  onClick={togglePlay}
                                  className="w-12 h-12 bg-white dark:bg-black text-black dark:text-white rounded-full flex items-center justify-center hover:scale-110 active:scale-95 transition-all shadow-lg"
                                >
                                  {isPlaying ? <Icons.Pause size={20} fill="currentColor" /> : <Icons.Play size={20} fill="currentColor" className="ml-1" />}
                                </button>
                                <button 
                                  onClick={handleRemoveAudio}
                                  className="p-2 text-white/40 hover:text-red-400 transition-colors"
                                  title="Eliminar Audio"
                                >
                                  <Icons.Delete size={16} />
                                </button>
                              </div>
                           </div>
                        </div>
                        <audio 
                          ref={audioRef} 
                          src={story.soundtrackData} 
                          loop 
                          onPlay={() => setIsPlaying(true)}
                          onPause={() => setIsPlaying(false)}
                        />
                      </div>
                    )}
                    <input type="file" ref={audioInputRef} className="hidden" accept="audio/*" onChange={handleAudioUpload} />
                  </div>
                </div>
              )}

              {activeTab === 'casting' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-mono opacity-40 uppercase tracking-widest">Actores del Relato</label>
                    <div className="flex gap-2">
                      <button onClick={() => setShowCloudPicker(true)} className="p-2 bg-amber-500 text-white rounded-full hover:scale-110 transition-transform shadow-lg" title="Importar de La Nube"><Icons.Cloud size={14} /></button>
                      <button onClick={() => fileInputRef.current?.click()} className="p-2 bg-ink-900 dark:bg-white text-white dark:text-black rounded-full hover:scale-110 transition-transform shadow-lg" title="Subir Local"><Icons.Plus size={14} /></button>
                    </div>
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {story.characters?.map(char => (
                      <div key={char.id} className="group relative flex items-center gap-4 p-4 bg-black/[0.02] rounded-3xl border border-black/5 hover:border-amber-500/30 transition-all">
                        <img src={char.image} className="w-14 h-14 rounded-full object-cover border-2 border-white dark:border-ink-800 shadow-sm" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[10px] font-black uppercase truncate tracking-widest">{char.name}</h4>
                          <p className="text-[8px] text-ink-400 font-serif italic truncate">Presente en el manuscrito</p>
                        </div>
                        <button onClick={() => handleDeleteCharacter(char.id)} className="p-2 text-ink-200 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"><Icons.Delete size={14} /></button>
                      </div>
                    ))}
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
