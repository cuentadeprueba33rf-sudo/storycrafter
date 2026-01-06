
import React, { useState, useEffect, useRef } from 'react';
import { Story, Page, Character, Genre, StoryStatus, EditorTheme } from '../types';
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
}

type InspectorTab = 'metas' | 'biblia' | 'casting' | 'detalles';

export const Editor: React.FC<EditorProps> = ({ 
  story: initialStory, 
  onSave, 
  onClose, 
  onShare, 
  theme,
  onChangeTheme
}) => {
  const [story, setStory] = useState<Story>({ ...initialStory, characters: initialStory.characters || [] });
  const [activePageId, setActivePageId] = useState<string>(initialStory.pages[0]?.id || '');
  const [showInspector, setShowInspector] = useState(false);
  const [showChapterBar, setShowChapterBar] = useState(true);
  const [activeTab, setActiveTab] = useState<InspectorTab>('metas');
  const [zenMode, setZenMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
    }, 10000);
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

  const handleManualSave = () => {
    setIsSaving(true);
    onSave(story);
    setTimeout(() => {
      setIsSaving(false);
      setIsDirty(false);
    }, 600);
  };

  const handleAddCharacter = () => {
    fileInputRef.current?.click();
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

  const handleAddPage = () => {
    const newPage: Page = {
      id: generateId(ID_PREFIX.PAGE),
      title: `Nueva Escena`,
      content: '<p><br></p>',
      order: story.pages.length
    };
    setIsDirty(true);
    setStory(prev => ({ ...prev, pages: [...prev.pages, newPage] }));
    setActivePageId(newPage.id);
  };

  const totalWords = story.pages.reduce((acc, p) => acc + countWords(p.content), 0);
  const progressPercent = story.wordCountGoal > 0 ? Math.min(100, (totalWords / story.wordCountGoal) * 100) : 0;

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
            <div className="hidden sm:flex bg-black/5 dark:bg-white/5 p-1 rounded-xl mr-2">
              <button onClick={() => onChangeTheme('LIGHT')} className={`p-1.5 rounded-lg ${theme === 'LIGHT' ? 'bg-white shadow-sm text-ink-900' : 'text-ink-400'}`}><Icons.Sun size={14} /></button>
              <button onClick={() => onChangeTheme('SEPIA')} className={`p-1.5 rounded-lg ${theme === 'SEPIA' ? 'bg-[#5d4037] text-white shadow-sm' : 'text-ink-400'}`}><Icons.Sepia size={14} /></button>
              <button onClick={() => onChangeTheme('DARK')} className={`p-1.5 rounded-lg ${theme === 'DARK' ? 'bg-black text-white shadow-sm' : 'text-ink-400'}`}><Icons.Moon size={14} /></button>
            </div>
            
            <button 
              onClick={() => setShowInspector(!showInspector)} 
              className={`p-2 rounded-lg flex items-center gap-2 transition-all ${showInspector ? 'bg-ink-900 dark:bg-white text-white dark:text-black shadow-lg' : 'hover:bg-black/5 text-ink-400'}`}
            >
              <Icons.Target size={18} />
              <span className="hidden md:inline text-[10px] font-black uppercase tracking-widest">Inspector</span>
            </button>

            <button 
              onClick={handleManualSave}
              disabled={isSaving}
              className={`ml-2 px-5 py-2 text-[9px] font-black uppercase tracking-widest rounded-full transition-all flex items-center gap-2 ${isDirty ? 'bg-ink-900 dark:bg-white text-white dark:text-black shadow-lg' : 'opacity-30'}`}
            >
              {isSaving ? <Icons.Check size={14} className="animate-pulse" /> : <Icons.Save size={14} />}
              <span className="hidden xs:inline">{isSaving ? "Guardando" : "Guardar"}</span>
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
                <div className="h-[2px] w-12 bg-current opacity-10 mt-6"></div>
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

          {!zenMode && (
            <div className={`shrink-0 border-t border-black/5 transition-all duration-300 overflow-hidden ${getPanelBg()} ${showChapterBar ? 'h-36' : 'h-0'}`}>
              <div className="h-full flex flex-col">
                <div className="px-6 py-2 flex justify-between items-center border-b border-black/5">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Estructura del Manuscrito</span>
                  <div className="flex items-center gap-4">
                    <button onClick={handleAddPage} className="text-[9px] font-black uppercase tracking-widest flex items-center gap-1.5 hover:opacity-60 transition-opacity">
                      <Icons.Plus size={12} /> Nueva Escena
                    </button>
                    <button onClick={() => setShowChapterBar(false)} className="opacity-40 hover:opacity-100"><Icons.ZenClose size={14} /></button>
                  </div>
                </div>
                <div className="flex-1 overflow-x-auto no-scrollbar flex items-center px-4 gap-3 py-4">
                  {story.pages.map((p, i) => (
                    <div 
                      key={p.id}
                      onClick={() => setActivePageId(p.id)}
                      className={`group relative shrink-0 w-44 p-3 rounded-2xl border transition-all duration-300 cursor-pointer ${
                        activePageId === p.id 
                        ? 'bg-ink-900 dark:bg-white text-white dark:text-black border-transparent shadow-xl -translate-y-1' 
                        : 'bg-black/[0.03] dark:bg-white/[0.03] border-transparent hover:border-black/10'
                      }`}
                    >
                      <h4 className="text-[11px] font-serif font-bold truncate">{p.title || "Sin título"}</h4>
                      <p className="text-[8px] mt-1 opacity-40 uppercase tracking-tighter">{countWords(p.content)} palabras</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>

        {!zenMode && (
          <aside className={`
            fixed lg:relative inset-y-0 right-0 z-[120] transition-all duration-500 ease-in-out shadow-2xl lg:shadow-none
            ${showInspector ? 'w-full md:w-80 lg:w-96 translate-x-0' : 'w-0 translate-x-full lg:translate-x-0 lg:w-0 overflow-hidden border-none'}
            ${getPanelBg()} border-l border-black/5
          `}>
            <div className="flex flex-col h-full w-full md:w-80 lg:w-96 overflow-hidden">
              <div className="p-6 border-b border-black/5 bg-black/[0.02] dark:bg-white/[0.02]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Inspector</h2>
                  <button onClick={() => setShowInspector(false)} className="p-2 hover:bg-black/5 rounded-full"><Icons.Back size={18} className="rotate-180" /></button>
                </div>
                <div className="grid grid-cols-4 bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                  {(['metas', 'biblia', 'casting', 'detalles'] as InspectorTab[]).map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`py-2 text-[8px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === tab ? 'bg-white dark:bg-ink-800 shadow-sm text-ink-900 dark:text-white' : 'text-ink-400 opacity-60 hover:opacity-100'}`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {activeTab === 'metas' && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                    <section>
                      <label className="text-[10px] font-mono opacity-40 uppercase block mb-3">Objetivo</label>
                      <div className="relative">
                        <input 
                          type="number"
                          className="w-full bg-black/5 dark:bg-white/5 border-none rounded-2xl p-4 text-sm font-bold outline-none"
                          value={story.wordCountGoal}
                          onChange={(e) => { setIsDirty(true); setStory(prev => ({ ...prev, wordCountGoal: parseInt(e.target.value) || 0 })); }}
                        />
                      </div>
                      <div className="mt-8 p-6 border border-black/5 rounded-3xl bg-white/5">
                        <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-ink-900 dark:bg-white transition-all duration-1000" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                        <p className="text-[10px] opacity-40 mt-4 text-center font-mono">{totalWords.toLocaleString()} / {story.wordCountGoal.toLocaleString() || '∞'}</p>
                      </div>
                    </section>
                  </div>
                )}

                {activeTab === 'biblia' && (
                  <textarea 
                    className="h-full w-full bg-black/5 dark:bg-white/5 border-none rounded-2xl p-6 text-xs font-serif leading-relaxed outline-none resize-none"
                    value={story.bible || ''}
                    onChange={(e) => { setIsDirty(true); setStory(prev => ({ ...prev, bible: e.target.value })); }}
                    placeholder="Notas de mundo..."
                  />
                )}

                {activeTab === 'casting' && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-mono opacity-40 uppercase">Reparto de la Obra</label>
                      <button 
                        onClick={handleAddCharacter}
                        className="p-2 bg-ink-900 dark:bg-white text-white dark:text-black rounded-full hover:scale-110 transition-transform"
                      >
                        <Icons.UserPlus size={14} />
                      </button>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {story.characters?.map(char => (
                        <div key={char.id} className="group relative flex items-center gap-4 p-3 bg-black/[0.02] dark:bg-white/[0.02] rounded-2xl border border-black/5">
                          <div className="w-12 h-12 rounded-full overflow-hidden border border-black/10 shrink-0">
                            <img src={char.image} alt={char.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest truncate">{char.name}</h4>
                            <p className="text-[8px] opacity-40 truncate">Personaje secundario</p>
                          </div>
                          <button 
                            onClick={() => handleDeleteCharacter(char.id)}
                            className="p-2 opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50 rounded-full transition-all"
                          >
                            <Icons.Delete size={12} />
                          </button>
                        </div>
                      ))}
                      {(!story.characters || story.characters.length === 0) && (
                        <div className="py-12 border border-dashed border-black/10 rounded-3xl flex flex-col items-center justify-center opacity-30">
                          <Icons.Characters size={24} className="mb-2" />
                          <p className="text-[9px] uppercase tracking-widest">Sin personajes aún</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {activeTab === 'detalles' && (
                   <section className="pt-4">
                      <button onClick={onShare} className="w-full py-4 bg-ink-900 dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-xl">
                        <Icons.Share size={14} /> Compartir Borrador
                      </button>
                    </section>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>

      {!zenMode && (
        <footer className="px-6 py-2 border-t border-black/5 bg-inherit z-[110] text-[9px] font-mono flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4 opacity-40">
            <span className="flex items-center gap-1.5 uppercase tracking-widest"><Icons.Pen size={10} /> Escena actual: {countWords(activePage?.content || '')}</span>
          </div>
          <div className="flex items-center gap-4">
            {isDirty && <span className="text-amber-500 font-black uppercase tracking-tighter">● Guardando...</span>}
          </div>
        </footer>
      )}
    </div>
  );
};
