
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
  cloudImages,
  isUserLoggedIn
}) => {
  const [story, setStory] = useState<Story>({ ...initialStory, characters: initialStory.characters || [] });
  const [activePageId, setActivePageId] = useState<string>(initialStory.pages[0]?.id || '');
  const [showInspector, setShowInspector] = useState(false);
  const [activeTab, setActiveTab] = useState<InspectorTab>('metas');
  const [zenMode, setZenMode] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [newCharName, setNewCharName] = useState('');
  const [newCharPortrait, setNewCharPortrait] = useState<string | null>(null);
  
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
            alert("¡Sprint finalizado!");
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
    if (!isUserLoggedIn) {
      alert("Debes iniciar sesión para publicar historias en el feed comunitario.");
      return;
    }
    const nextStatus = !story.isPublished;
    setStory(prev => ({ ...prev, isPublished: nextStatus }));
    setIsDirty(true);
  };

  const totalWords = story.pages.reduce((acc, p) => acc + countWords(p.content), 0);
  const progressPercent = story.wordCountGoal > 0 ? Math.min(100, Math.floor((totalWords / story.wordCountGoal) * 100)) : 0;

  return (
    <div className={`flex flex-col h-full transition-colors duration-500 overflow-hidden relative ${theme === 'DARK' ? 'bg-black text-white' : theme === 'SEPIA' ? 'bg-[#f4ecd8] text-[#5d4037]' : 'bg-white text-ink-900'}`}>
      <audio ref={typewriterAudioRef} src="https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3" preload="auto" />
      <input type="file" ref={audioInputRef} className="hidden" accept="audio/*" />

      {!zenMode && (
        <header className="flex items-center justify-between px-6 py-3 border-b border-black/5 z-[100] shrink-0 bg-inherit">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full"><Icons.Back size={18} /></button>
            <div className="flex flex-col">
              <h1 className="text-xs font-serif font-bold truncate max-w-[200px]">{story.title}</h1>
              <span className="text-[9px] font-mono uppercase tracking-widest opacity-40">{totalWords} palabras</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={handleManualSave}
              className={`p-2.5 rounded-xl flex items-center gap-2 transition-all ${isDirty ? 'bg-ink-900 dark:bg-white text-white dark:text-black shadow-lg scale-105' : 'opacity-60'}`}
            >
              <Icons.Save size={18} />
              <span className="hidden md:inline text-[9px] font-black uppercase tracking-widest">{isSaving ? '...' : 'Guardar'}</span>
            </button>
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
            <div className="max-w-2xl mx-auto min-h-full flex flex-col">
              <input 
                className="w-full font-serif font-bold bg-transparent outline-none border-none focus:ring-0 p-0 text-3xl md:text-5xl mb-10"
                value={activePage?.title || ''}
                onChange={(e) => { setIsDirty(true); setStory(prev => ({ ...prev, pages: prev.pages.map(p => p.id === activePageId ? { ...p, title: e.target.value } : p) })); }}
                placeholder="Escena..."
              />
              <div
                ref={editorRef} contentEditable onInput={handleInput} spellCheck={false}
                className="flex-1 w-full bg-transparent outline-none font-serif leading-[1.8] text-lg md:text-xl pb-64"
                data-placeholder="Escribe aquí tu manuscrito..."
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
                <button onClick={() => {
                  const newPage = { id: generateId(ID_PREFIX.PAGE), title: `Escena ${story.pages.length + 1}`, content: '', order: story.pages.length };
                  setStory(prev => ({ ...prev, pages: [...prev.pages, newPage] }));
                  setActivePageId(newPage.id);
                  setIsDirty(true);
                }} className="shrink-0 w-11 h-11 bg-amber-500 text-white rounded-xl flex items-center justify-center"><Icons.Plus size={18} /></button>
              </div>
            </div>
          )}
        </main>

        <aside className={`fixed lg:relative inset-y-0 right-0 z-[120] transition-all duration-500 ease-in-out ${showInspector ? 'w-full md:w-80 lg:w-96 translate-x-0' : 'w-0 translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden'} ${theme === 'DARK' ? 'bg-ink-950' : 'bg-white'} border-l border-black/5`}>
          <div className="flex flex-col h-full w-full">
            <div className="p-8 border-b border-black/5">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Herramientas</h2>
                <button onClick={() => setShowInspector(false)} className="p-2 hover:bg-black/5 rounded-full"><Icons.X size={18} /></button>
              </div>
              <div className="grid grid-cols-5 bg-black/5 p-1 rounded-xl">
                {(['metas', 'biblia', 'casting', 'musica', 'sprint'] as InspectorTab[]).map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} className={`py-2 flex items-center justify-center rounded-lg transition-all ${activeTab === tab ? 'bg-white shadow-sm text-ink-900' : 'opacity-40 hover:opacity-100'}`}>
                    {tab === 'metas' && <Icons.Target size={14} />}
                    {tab === 'biblia' && <Icons.Bible size={14} />}
                    {tab === 'casting' && <Icons.Characters size={14} />}
                    {tab === 'musica' && <Icons.Disc size={14} />}
                    {tab === 'sprint' && <Icons.Zap size={14} />}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
              {activeTab === 'metas' && (
                <div className="space-y-10 animate-in fade-in">
                  <div className="p-8 bg-black/5 rounded-[2.5rem] border border-black/5 space-y-6">
                    <div className="flex items-center gap-4">
                       <Icons.Globe size={20} className={story.isPublished ? 'text-amber-500' : 'opacity-20'} />
                       <h4 className="text-[10px] font-black uppercase tracking-widest">Feed de Comunidad</h4>
                    </div>
                    <p className="text-[10px] font-serif italic opacity-60 leading-relaxed">Solo autores con registro de firma pueden publicar en la red global.</p>
                    <button 
                      onClick={handleTogglePublish}
                      className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${story.isPublished ? 'bg-amber-500 text-white shadow-lg' : 'bg-ink-200 dark:bg-ink-800'}`}
                    >
                      {story.isPublished ? 'Obra Publicada ✓' : 'Publicar Ahora'}
                    </button>
                  </div>

                  <div className="space-y-6">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Estado de la Obra</label>
                    <select 
                      className="w-full p-5 bg-black/5 dark:bg-white/5 border-none rounded-2xl text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none appearance-none"
                      value={story.status}
                      onChange={(e) => { setIsDirty(true); setStory(prev => ({ ...prev, status: e.target.value as StoryStatus })); }}
                    >
                      {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'biblia' && (
                <div className="space-y-8 animate-in fade-in">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black uppercase tracking-widest opacity-40">Sinopsis del Alma</label>
                    <textarea 
                      className="w-full p-6 bg-black/5 dark:bg-white/5 border-none rounded-3xl text-xs font-serif italic leading-relaxed focus:ring-2 focus:ring-amber-500 outline-none min-h-[200px] resize-none"
                      value={story.synopsis}
                      onChange={(e) => { setIsDirty(true); setStory(prev => ({ ...prev, synopsis: e.target.value })); }}
                    />
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
