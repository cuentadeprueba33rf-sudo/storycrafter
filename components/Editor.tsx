
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
}

type InspectorTab = 'metas' | 'biblia' | 'casting' | 'musica' | 'sprint';

const ORACLE_CARDS = [
  "Abandona el instrumento normal.",
  "Haz una lista de todo lo que podrías hacer y haz lo último.",
  "La repetición es una forma de cambio.",
  "Mira muy de cerca los detalles más vergonozosos y amplifícalos.",
  "¿Qué no harías?",
  "Enfatiza las repeticiones.",
  "Pregúntale a tu cuerpo.",
  "No construyas muros; haz puentes.",
  "Silencia una de las voces.",
  "Destruye lo más importante.",
  "Usa una idea vieja.",
  "¿Cómo lo haría un niño?",
  "Mira el orden en el que haces las cosas.",
  "Acepta el consejo de alguien que no sea de confianza."
];

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
  const [isSaving, setIsSaving] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Character form state
  const [newCharName, setNewCharName] = useState('');
  const [newCharPortrait, setNewCharPortrait] = useState<string | null>(null);
  
  // Sprint State
  const [sprintTime, setSprintTime] = useState(0);
  const [isSprintActive, setIsSprintActive] = useState(false);
  const [oracleMessage, setOracleMessage] = useState<string | null>(null);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const charPortraitInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const typewriterAudioRef = useRef<HTMLAudioElement>(null);
  
  const activePage = story.pages.find(p => p.id === activePageId);

  useEffect(() => {
    const handleKeyDown = () => {
      if (story.typewriterEnabled && typewriterAudioRef.current) {
        typewriterAudioRef.current.currentTime = 0;
        typewriterAudioRef.current.play().catch(() => {});
      }
    };
    const editor = editorRef.current;
    if (editor) editor.addEventListener('keydown', handleKeyDown);
    return () => editor?.removeEventListener('keydown', handleKeyDown);
  }, [story.typewriterEnabled]);

  useEffect(() => {
    let interval: any;
    if (isSprintActive && sprintTime > 0) {
      interval = setInterval(() => {
        setSprintTime(t => {
          if (t <= 1) {
            setIsSprintActive(false);
            alert("¡Sprint finalizado! Has honrado tus minutos de tinta.");
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isSprintActive, sprintTime]);

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
      handleManualSave();
    }, 2000);
    return () => clearTimeout(timer);
  }, [story, isDirty]);

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
    setIsDirty(false);
    setTimeout(() => setIsSaving(false), 800);
  };

  const handleTogglePublish = () => {
    const nextStatus = !story.isPublished;
    if (nextStatus) {
      if (!confirm("¿Publicar esta historia en el Feed de la comunidad? Otros autores podrán leerla.")) return;
    }
    setStory(prev => ({ ...prev, isPublished: nextStatus }));
    setIsDirty(true);
  };

  const handleCreatePage = () => {
    const newPage: Page = {
      id: generateId(ID_PREFIX.PAGE),
      title: `Escena ${story.pages.length + 1}`,
      content: '<p><br></p>',
      order: story.pages.length
    };
    setStory(prev => ({
      ...prev,
      pages: [...prev.pages, newPage]
    }));
    setActivePageId(newPage.id);
    setIsDirty(true);
  };

  const handleAddCharacter = () => {
    if (!newCharName.trim()) return;
    const newChar: Character = {
      id: generateId('char_'),
      name: newCharName.trim(),
      image: newCharPortrait || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop',
      description: ''
    };
    setStory(prev => ({
      ...prev,
      characters: [...(prev.characters || []), newChar]
    }));
    setNewCharName('');
    setNewCharPortrait(null);
    setIsDirty(true);
  };

  const handlePortraitUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setNewCharPortrait(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCharacter = (id: string) => {
    if (!window.confirm("¿Retirar a este actor del reparto?")) return;
    setStory(prev => ({
      ...prev,
      characters: prev.characters.filter(c => c.id !== id)
    }));
    setIsDirty(true);
  };

  const startSprint = (minutes: number) => {
    setSprintTime(minutes * 60);
    setIsSprintActive(true);
  };

  const getOracleAdvice = () => {
    const random = ORACLE_CARDS[Math.floor(Math.random() * ORACLE_CARDS.length)];
    setOracleMessage(random);
  };

  const toggleTypewriter = () => {
    setStory(prev => ({ ...prev, typewriterEnabled: !prev.typewriterEnabled }));
    setIsDirty(true);
  };

  const formatSprintTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setStory(prev => ({
        ...prev,
        soundtrackData: reader.result as string,
        soundtrackName: file.name
      }));
      setIsDirty(true);
    };
    reader.readAsDataURL(file);
  };

  const totalWords = story.pages.reduce((acc, p) => acc + countWords(p.content), 0);
  const progressPercent = story.wordCountGoal > 0 ? Math.min(100, Math.floor((totalWords / story.wordCountGoal) * 100)) : 0;

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
      
      {/* SFX Sources */}
      <audio ref={typewriterAudioRef} src="https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3" preload="auto" />
      <input type="file" ref={audioInputRef} className="hidden" accept="audio/*" onChange={handleAudioUpload} />
      <input type="file" ref={charPortraitInputRef} className="hidden" accept="image/*" onChange={handlePortraitUpload} />

      {showInspector && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-[110] lg:hidden animate-in fade-in duration-300"
          onClick={() => setShowInspector(false)}
        />
      )}

      {!zenMode && (
        <header className="flex items-center justify-between px-6 py-3 border-b border-black/5 z-[100] shrink-0 bg-inherit">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors"><Icons.Back size={18} /></button>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-xs font-serif font-bold truncate max-w-[120px] md:max-w-[300px]">{story.title}</h1>
                {isSaving ? (
                  <span className="text-[8px] font-black uppercase text-amber-500 animate-pulse">Guardando...</span>
                ) : (
                  <Icons.Check size={10} className="text-green-500 opacity-40" />
                )}
              </div>
              <span className="text-[9px] font-mono uppercase tracking-widest opacity-40">{totalWords} palabras</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 md:gap-3">
            {isSprintActive && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 rounded-full border border-red-500/20 mr-2">
                 <Icons.Timer size={12} className="text-red-500 animate-pulse" />
                 <span className="text-[10px] font-mono text-red-500 font-bold">{formatSprintTime(sprintTime)}</span>
              </div>
            )}

            <button 
              onClick={handleManualSave}
              className={`p-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 ${isDirty ? 'bg-ink-900 dark:bg-white text-white dark:text-black shadow-lg scale-105' : 'hover:bg-black/5 text-ink-400 opacity-60'}`}
              title="Guardar Manuscrito"
            >
              <Icons.Save size={18} />
              <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">{isDirty ? 'Guardar' : 'Guardado'}</span>
            </button>
            
            <button 
              onClick={() => setShowInspector(!showInspector)} 
              className={`p-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 ${showInspector ? 'bg-amber-500 text-white shadow-lg scale-105' : 'hover:bg-black/5 text-ink-400'}`}
              title={showInspector ? "Cerrar Panel" : "Herramientas de Escritura"}
            >
              <Icons.Magic size={18} />
              <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">Panel</span>
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
                data-placeholder="Tu historia comienza con una sola palabra..."
              />
            </div>
          </div>

          {!zenMode && (
            <div className="shrink-0 border-t border-black/5 px-4 pt-4 pb-12 md:pb-8 flex items-center justify-center bg-inherit/90 backdrop-blur-md z-50">
              <div className="max-w-4xl w-full flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
                {story.pages.sort((a,b) => a.order - b.order).map((p, idx) => (
                  <button 
                    key={p.id}
                    onClick={() => setActivePageId(p.id)}
                    className={`
                      shrink-0 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                      ${activePageId === p.id 
                        ? 'bg-ink-900 dark:bg-white text-white dark:text-black shadow-xl scale-105' 
                        : 'bg-black/5 hover:bg-black/10 text-ink-400 border border-transparent'}
                    `}
                  >
                    <span className="opacity-40 mr-2">{idx + 1}.</span>
                    {p.title || 'Escena'}
                  </button>
                ))}
                <button 
                  onClick={handleCreatePage}
                  className="shrink-0 w-11 h-11 flex items-center justify-center bg-amber-500 text-white rounded-xl hover:scale-110 active:scale-95 transition-all shadow-lg"
                  title="Añadir Escena"
                >
                  <Icons.Plus size={18} />
                </button>
              </div>
            </div>
          )}
        </main>

        <aside className={`fixed lg:relative inset-y-0 right-0 z-[120] transition-all duration-500 ease-in-out ${showInspector ? 'w-full md:w-80 lg:w-96 translate-x-0 shadow-2xl' : 'w-0 translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden border-none'} ${getPanelBg()} border-l border-black/5`}>
          <div className="flex flex-col h-full w-full overflow-hidden">
            <div className="p-6 border-b border-black/5">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Herramientas</h2>
                <button onClick={() => setShowInspector(false)} className="p-2.5 bg-black/5 dark:bg-white/5 hover:bg-red-500 hover:text-white rounded-xl transition-all"><Icons.X size={18} /></button>
              </div>
              <div className="grid grid-cols-5 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                {(['metas', 'biblia', 'casting', 'musica', 'sprint'] as InspectorTab[]).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`py-2 flex items-center justify-center rounded-lg transition-all ${activeTab === tab ? 'bg-white dark:bg-ink-800 shadow-sm text-ink-900 dark:text-white' : 'text-ink-400 opacity-40 hover:opacity-100'}`}>
                    {tab === 'musica' && <Icons.Music size={14} />}
                    {tab === 'sprint' && <Icons.Zap size={14} />}
                    {tab === 'casting' && <Icons.Characters size={14} />}
                    {tab === 'biblia' && <Icons.Bible size={14} />}
                    {tab === 'metas' && <Icons.Target size={14} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {activeTab === 'metas' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Estado de la Obra</label>
                    <select 
                      className="w-full p-4 bg-black/5 dark:bg-white/5 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                      value={story.status}
                      onChange={(e) => { setIsDirty(true); setStory(prev => ({ ...prev, status: e.target.value as StoryStatus })); }}
                    >
                      {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>

                  {/* NUEVA SECCIÓN DE PUBLICACIÓN SOCIAL */}
                  <div className="p-6 bg-black/5 dark:bg-white/5 rounded-[2rem] border border-black/5 space-y-4">
                    <div className="flex items-center gap-3">
                       <Icons.Globe size={16} className={story.isPublished ? 'text-amber-500' : 'text-ink-400'} />
                       <h4 className="text-[10px] font-black uppercase tracking-widest">Publicación Social</h4>
                    </div>
                    <p className="text-[9px] font-serif italic opacity-60 leading-relaxed">
                      Al publicar, tu obra aparecerá en el feed global para que otros autores la lean en tiempo real.
                    </p>
                    <button 
                      onClick={handleTogglePublish}
                      className={`w-full py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${story.isPublished ? 'bg-amber-500 text-white shadow-lg' : 'bg-ink-200 dark:bg-ink-800 text-ink-500'}`}
                    >
                      {story.isPublished ? 'Publicado ✓' : 'Publicar en la Nube'}
                    </button>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Meta de Palabras</label>
                    <input 
                      type="number" 
                      className="w-full p-4 bg-black/5 dark:bg-white/5 border-none rounded-2xl text-xs font-mono font-bold focus:ring-2 focus:ring-amber-500 outline-none"
                      value={story.wordCountGoal}
                      onChange={(e) => { setIsDirty(true); setStory(prev => ({ ...prev, wordCountGoal: parseInt(e.target.value) || 0 })); }}
                    />
                    <div className="p-6 bg-black/5 dark:bg-white/5 rounded-3xl space-y-4">
                       <div className="flex justify-between items-end">
                         <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Avance</span>
                         <span className="text-lg font-serif italic font-bold">{progressPercent}%</span>
                       </div>
                       <div className="h-2 w-full bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                       </div>
                       <p className="text-[9px] font-mono text-center opacity-40">{totalWords} / {story.wordCountGoal} escritas</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'biblia' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2"><Icons.File size={14} /> Sinopsis Central</label>
                    <textarea 
                      className="w-full p-5 bg-black/5 dark:bg-white/5 border-none rounded-3xl text-xs font-serif italic leading-relaxed focus:ring-2 focus:ring-amber-500 outline-none min-h-[180px] resize-none"
                      placeholder="Escribe el alma de tu historia..."
                      value={story.synopsis}
                      onChange={(e) => { setIsDirty(true); setStory(prev => ({ ...prev, synopsis: e.target.value })); }}
                    ></textarea>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2"><Icons.Bible size={14} /> Notas de Mundo (Lore)</label>
                    <textarea 
                      className="w-full p-5 bg-black/5 dark:bg-white/5 border-none rounded-3xl text-xs font-mono leading-relaxed focus:ring-2 focus:ring-amber-500 outline-none min-h-[300px] resize-none"
                      placeholder="Detalla reglas, geografía, mitos..."
                      value={story.bible}
                      onChange={(e) => { setIsDirty(true); setStory(prev => ({ ...prev, bible: e.target.value })); }}
                    ></textarea>
                  </div>
                </div>
              )}

              {activeTab === 'casting' && (
                <div className="space-y-6 animate-in fade-in duration-500">
                   <div className="space-y-4">
                      <label className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2"><Icons.Characters size={14} /> Nuevo Actor</label>
                      <div className="p-4 bg-black/5 dark:bg-white/5 rounded-3xl space-y-4">
                        <div className="flex items-center gap-4">
                          <button 
                            onClick={() => charPortraitInputRef.current?.click()}
                            className="shrink-0 w-16 h-16 bg-black/10 dark:bg-white/10 rounded-2xl flex items-center justify-center overflow-hidden border-2 border-dashed border-black/5"
                          >
                            {newCharPortrait ? (
                              <img src={newCharPortrait} className="w-full h-full object-cover" />
                            ) : (
                              <Icons.Image size={24} className="opacity-20" />
                            )}
                          </button>
                          <input 
                            className="flex-1 bg-transparent border-none focus:ring-0 text-[10px] font-black uppercase tracking-widest"
                            placeholder="Nombre..."
                            value={newCharName}
                            onChange={(e) => setNewCharName(e.target.value)}
                          />
                        </div>
                        <button 
                          onClick={handleAddCharacter}
                          disabled={!newCharName.trim()}
                          className="w-full py-3 bg-ink-900 dark:bg-white text-white dark:text-black rounded-xl text-[9px] font-black uppercase tracking-widest"
                        >
                          Añadir
                        </button>
                      </div>
                   </div>
                   
                   <div className="space-y-3 pt-6 border-t border-black/5">
                     {story.characters?.map(char => (
                        <div key={char.id} className="group relative flex items-center gap-4 p-4 bg-black/5 dark:bg-white/5 rounded-2xl">
                          <img src={char.image} className="w-14 h-14 rounded-2xl object-cover" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-widest truncate">{char.name}</span>
                          </div>
                          <button 
                            onClick={() => handleRemoveCharacter(char.id)}
                            className="absolute top-2 right-2 p-1.5 opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all"
                          >
                            <Icons.Delete size={14} />
                          </button>
                        </div>
                     ))}
                   </div>
                </div>
              )}

              {activeTab === 'sprint' && (
                <div className="space-y-10 animate-in fade-in duration-500">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2"><Icons.Timer size={14} /> Sprint</label>
                    <div className="grid grid-cols-3 gap-2">
                       {[15, 25, 45].map(m => (
                         <button key={m} onClick={() => startSprint(m)} disabled={isSprintActive} className="py-3 px-2 bg-black/5 dark:bg-white/5 rounded-xl text-[10px] font-bold hover:bg-amber-500 hover:text-white transition-all disabled:opacity-20">{m} Min</button>
                       ))}
                    </div>
                  </div>

                  <div className="space-y-4 pt-8 border-t border-black/5">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2"><Icons.Magic size={14} /> Oráculo</label>
                    <div className="p-6 bg-ink-900 dark:bg-white rounded-[2rem] text-center space-y-4 shadow-xl">
                      {oracleMessage ? <p className="text-[11px] font-serif italic text-white dark:text-black">"{oracleMessage}"</p> : <p className="text-[9px] font-black uppercase tracking-widest text-white/40 dark:text-black/40">Inspiración...</p>}
                      <button onClick={getOracleAdvice} className="px-6 py-2 bg-white dark:bg-black text-black dark:text-white rounded-full text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-transform">Robar Carta</button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'musica' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2"><Icons.Disc size={14} /> Atmósfera</label>
                    {!story.soundtrackData ? (
                      <button onClick={() => audioInputRef.current?.click()} className="w-full flex items-center justify-center gap-3 px-6 py-12 border-2 border-dashed border-black/10 rounded-[2.5rem] opacity-40 hover:opacity-60 transition-opacity flex-col">
                        <Icons.Upload size={24} />
                        <span className="text-[9px] font-black uppercase tracking-widest">Subir MP3</span>
                      </button>
                    ) : (
                      <div className="p-8 bg-ink-900 dark:bg-white rounded-[2.5rem] shadow-2xl text-center space-y-6">
                        <Icons.Music size={32} className="mx-auto text-white dark:text-black" />
                        <button onClick={togglePlay} className="w-16 h-16 bg-white dark:bg-black text-black dark:text-white rounded-full mx-auto flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all">
                           {isPlaying ? <Icons.Pause size={24} fill="currentColor" /> : <Icons.Play size={24} fill="currentColor" className="ml-1" />}
                        </button>
                        <button onClick={() => setStory(prev => ({ ...prev, soundtrackData: undefined }))} className="text-[8px] font-black uppercase tracking-widest text-red-500 opacity-60">Eliminar</button>
                      </div>
                    )}
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
