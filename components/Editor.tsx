
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

type InspectorTab = 'metas' | 'biblia' | 'casting' | 'musica' | 'sprint';

const ORACLE_CARDS = [
  "Abandona el instrumento normal.",
  "Haz una lista de todo lo que podrías hacer y haz lo último.",
  "La repetición es una forma de cambio.",
  "Mira muy de cerca los detalles más vergonzosos y amplifícalos.",
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
  const [showCloudPicker, setShowCloudPicker] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Sprint State
  const [sprintTime, setSprintTime] = useState(0);
  const [isSprintActive, setIsSprintActive] = useState(false);
  const [oracleMessage, setOracleMessage] = useState<string | null>(null);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const typewriterAudioRef = useRef<HTMLAudioElement>(null);
  
  const activePage = story.pages.find(p => p.id === activePageId);

  // Typewriter Sound Logic
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

  // Sprint Timer Logic
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

  // Fix: implement togglePlay function for soundtrack
  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
    }
  };

  // Fix: implement audio upload handler
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

  const getThemeClasses = () => {
    switch(theme) {
      case 'DARK': return 'bg-black text-ink-100 dark';
      case 'SEPIA': return 'bg-[#f4ecd8] text-[#5d4037]';
      default: return 'bg-white text-ink-900';
    }
  };

  return (
    <div className={`flex flex-col h-full transition-colors duration-500 overflow-hidden relative ${getThemeClasses()}`}>
      
      {/* Typewriter sound source */}
      <audio ref={typewriterAudioRef} src="https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3" preload="auto" />

      {/* Fix: add hidden file input for audio upload */}
      <input 
        type="file" 
        ref={audioInputRef} 
        className="hidden" 
        accept="audio/*" 
        onChange={handleAudioUpload} 
      />

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
            {isSprintActive && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-500/10 rounded-full border border-red-500/20 mr-2">
                 <Icons.Timer size={12} className="text-red-500 animate-pulse" />
                 <span className="text-[10px] font-mono text-red-500 font-bold">{formatSprintTime(sprintTime)}</span>
              </div>
            )}
            
            <button 
              onClick={() => setShowInspector(!showInspector)} 
              className={`p-2 rounded-lg flex items-center gap-2 transition-all ${showInspector ? 'bg-ink-900 dark:bg-white text-white dark:text-black shadow-lg' : 'hover:bg-black/5 text-ink-400'}`}
            >
              {/* Fix: Icons.Sparkles -> Icons.Magic */}
              <Icons.Magic size={18} />
              <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">Herramientas</span>
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
                  placeholder="Título..."
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

        <aside className={`fixed lg:relative inset-y-0 right-0 z-[120] transition-all duration-500 ease-in-out ${showInspector ? 'w-full md:w-80 lg:w-96 translate-x-0' : 'w-0 translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden border-none'} bg-white dark:bg-ink-950 border-l border-black/5 shadow-2xl`}>
          <div className="flex flex-col h-full w-full overflow-hidden">
            <div className="p-6 border-b border-black/5">
              <div className="grid grid-cols-5 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                {(['metas', 'biblia', 'casting', 'musica', 'sprint'] as InspectorTab[]).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`py-2 flex items-center justify-center rounded-lg transition-all ${activeTab === tab ? 'bg-white dark:bg-ink-800 shadow-sm' : 'opacity-40'}`}>
                    {tab === 'musica' && <Icons.Music size={14} />}
                    {tab === 'sprint' && <Icons.Zap size={14} />}
                    {/* Fix: Icons.Users -> Icons.Characters */}
                    {tab === 'casting' && <Icons.Characters size={14} />}
                    {tab === 'biblia' && <Icons.Bible size={14} />}
                    {tab === 'metas' && <Icons.Target size={14} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {activeTab === 'sprint' && (
                <div className="space-y-10 animate-in fade-in duration-500">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2"><Icons.Timer size={14} /> Sprint de Escritura</label>
                    <div className="grid grid-cols-3 gap-2">
                       {[15, 25, 45].map(m => (
                         <button 
                           key={m} 
                           onClick={() => startSprint(m)}
                           disabled={isSprintActive}
                           className="py-3 px-2 bg-black/5 dark:bg-white/5 rounded-xl text-[10px] font-bold hover:bg-red-500 hover:text-white transition-all disabled:opacity-20"
                         >
                           {m} Min
                         </button>
                       ))}
                    </div>
                    {isSprintActive && (
                      <button 
                        onClick={() => setIsSprintActive(false)}
                        className="w-full py-3 bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400 rounded-xl text-[10px] font-black uppercase tracking-widest"
                      >
                        Detener Foco
                      </button>
                    )}
                  </div>

                  <div className="space-y-4 pt-8 border-t border-black/5">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2"><Icons.Keyboard size={14} /> Experiencia Táctil</label>
                    <button 
                      onClick={toggleTypewriter}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${story.typewriterEnabled ? 'border-amber-500 bg-amber-500/5 text-amber-600' : 'border-black/5 bg-black/5 opacity-40'}`}
                    >
                       <span className="text-[10px] font-black uppercase tracking-widest">Máquina de Escribir</span>
                       {/* Fix: Icons.ZapOff -> Icons.NoAI */}
                       {story.typewriterEnabled ? <Icons.Volume size={14} /> : <Icons.NoAI size={14} />}
                    </button>
                  </div>

                  <div className="space-y-4 pt-8 border-t border-black/5">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2"><Icons.Magic size={14} /> Oráculo Creativo</label>
                    <div className="p-6 bg-ink-900 dark:bg-white rounded-[2rem] text-center space-y-4 shadow-xl">
                      {oracleMessage ? (
                        <p className="text-[11px] font-serif italic text-white dark:text-black leading-relaxed animate-in zoom-in-95">"{oracleMessage}"</p>
                      ) : (
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/40 dark:text-black/40">¿Atascado?</p>
                      )}
                      <button 
                        onClick={getOracleAdvice}
                        className="px-6 py-2 bg-white dark:bg-black text-black dark:text-white rounded-full text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-transform"
                      >
                        Robar Carta
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'musica' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40 flex items-center gap-2"><Icons.Disc size={14} /> Atmósfera Local</label>
                    {!story.soundtrackData ? (
                      <button onClick={() => audioInputRef.current?.click()} className="w-full flex items-center justify-center gap-3 px-6 py-8 border-2 border-dashed border-black/10 rounded-[2rem] opacity-40"><Icons.Upload size={20} /></button>
                    ) : (
                      <div className="p-6 bg-ink-900 dark:bg-white rounded-[2rem] shadow-xl text-center space-y-4">
                        <Icons.Music size={24} className="mx-auto text-white dark:text-black" />
                        <button onClick={togglePlay} className="w-12 h-12 bg-white dark:bg-black text-black dark:text-white rounded-full mx-auto flex items-center justify-center shadow-lg">
                           {isPlaying ? <Icons.Pause size={20} fill="currentColor" /> : <Icons.Play size={20} fill="currentColor" className="ml-1" />}
                        </button>
                      </div>
                    )}
                    <audio ref={audioRef} src={story.soundtrackData} loop onPlay={() => setIsPlaying(true)} onPause={() => setIsPlaying(false)} />
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
