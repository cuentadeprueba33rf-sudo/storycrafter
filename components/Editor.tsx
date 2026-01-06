
import React, { useState, useEffect, useRef } from 'react';
import { Story, Page, Genre, StoryStatus, EditorTheme } from '../types';
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

type InspectorTab = 'metas' | 'biblia' | 'detalles';

export const Editor: React.FC<EditorProps> = ({ 
  story: initialStory, 
  onSave, 
  onClose, 
  onShare, 
  theme,
  onChangeTheme
}) => {
  const [story, setStory] = useState<Story>(initialStory);
  const [activePageId, setActivePageId] = useState<string>(initialStory.pages[0]?.id || '');
  const [showInspector, setShowInspector] = useState(false);
  const [showChapterBar, setShowChapterBar] = useState(true);
  const [activeTab, setActiveTab] = useState<InspectorTab>('metas');
  const [zenMode, setZenMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  const editorRef = useRef<HTMLDivElement>(null);
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

  const handleAddPage = () => {
    const newPage: Page = {
      id: generateId(ID_PREFIX.PAGE),
      title: `Capítulo ${story.pages.length + 1}`,
      content: '<p><br></p>',
      order: story.pages.length
    };
    setIsDirty(true);
    setStory(prev => ({ ...prev, pages: [...prev.pages, newPage] }));
    setActivePageId(newPage.id);
  };

  const handleDeletePage = (id: string) => {
    if (story.pages.length <= 1) return;
    if (window.confirm("¿Eliminar este capítulo definitivamente?")) {
      const newPages = story.pages.filter(p => p.id !== id);
      setStory(prev => ({ ...prev, pages: newPages }));
      if (activePageId === id) setActivePageId(newPages[0].id);
      setIsDirty(true);
    }
  };

  const movePage = (index: number, direction: 'left' | 'right') => {
    const newPages = [...story.pages];
    const target = direction === 'left' ? index - 1 : index + 1;
    if (target < 0 || target >= newPages.length) return;
    [newPages[index], newPages[target]] = [newPages[target], newPages[index]];
    setStory(prev => ({ ...prev, pages: newPages }));
    setIsDirty(true);
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

  return (
    <div className={`flex flex-col h-full transition-all duration-700 overflow-hidden ${getThemeClasses()}`}>
      
      {/* HEADER: SIEMPRE DISPONIBLE */}
      {!zenMode && (
        <header className="flex items-center justify-between px-6 py-3 border-b border-black/5 z-[70] shrink-0 bg-inherit shadow-sm">
          <div className="flex items-center gap-4">
            <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors"><Icons.Back size={18} /></button>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-serif font-bold opacity-60 truncate max-w-[120px] md:max-w-[250px]">{story.title}</h1>
              <div className="w-1 h-1 bg-current opacity-20 rounded-full"></div>
              <span className="text-[10px] font-mono uppercase tracking-widest opacity-40">{totalWords} pal.</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex bg-black/5 dark:bg-white/5 p-1 rounded-xl mr-2">
              <button onClick={() => onChangeTheme('LIGHT')} className={`p-1.5 rounded-lg ${theme === 'LIGHT' ? 'bg-white shadow-sm text-ink-900' : 'text-ink-400'}`}><Icons.Sun size={14} /></button>
              <button onClick={() => onChangeTheme('SEPIA')} className={`p-1.5 rounded-lg ${theme === 'SEPIA' ? 'bg-[#5d4037] text-white shadow-sm' : 'text-ink-400'}`}><Icons.Sepia size={14} /></button>
              <button onClick={() => onChangeTheme('DARK')} className={`p-1.5 rounded-lg ${theme === 'DARK' ? 'bg-black text-white shadow-sm' : 'text-ink-400'}`}><Icons.Moon size={14} /></button>
            </div>
            
            <button onClick={() => setZenMode(true)} className="p-2 text-ink-400 hover:text-current transition-colors"><Icons.ZenOpen size={18} /></button>
            
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
              className={`ml-2 px-5 py-2 text-[9px] font-black uppercase tracking-widest rounded-full transition-all flex items-center gap-2 ${isDirty ? 'bg-ink-900 dark:bg-white text-white dark:text-black shadow-xl scale-105 active:scale-95' : 'opacity-30'}`}
            >
              {isSaving ? <Icons.Check size={14} className="animate-pulse" /> : <Icons.Save size={14} />}
              <span className="hidden xs:inline">{isSaving ? "Guardando" : (isDirty ? "Guardar" : "Ok")}</span>
            </button>
          </div>
        </header>
      )}

      {/* ÁREA DE TRABAJO PRINCIPAL */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* CONTENIDO CENTRAL (EDITOR) */}
        <main className={`flex-1 flex flex-col min-w-0 transition-all duration-500 bg-inherit relative z-10`}>
          <div className={`flex-1 overflow-y-auto custom-scrollbar transition-all duration-500 ${zenMode ? 'p-10 md:p-32' : 'p-6 md:p-12 lg:p-20'}`}>
            <div className="max-w-2xl mx-auto min-h-full flex flex-col">
              <div className="mb-12">
                <input 
                  className={`w-full font-serif font-bold bg-transparent outline-none border-none focus:ring-0 p-0 transition-all ${zenMode ? 'text-4xl md:text-6xl text-center' : 'text-3xl md:text-5xl text-left'}`}
                  value={activePage?.title || ''}
                  onChange={(e) => { setIsDirty(true); setStory(prev => ({ ...prev, pages: prev.pages.map(p => p.id === activePageId ? { ...p, title: e.target.value } : p) })); }}
                  placeholder="Título de la escena..."
                />
                <div className="h-[1px] w-full bg-current opacity-10 mt-6"></div>
              </div>
              
              <div
                ref={editorRef}
                contentEditable
                className={`flex-1 w-full bg-transparent outline-none font-serif leading-[1.8] min-h-[50vh] pb-64 selection:bg-ink-200 dark:selection:bg-ink-700 ${zenMode ? 'text-xl md:text-2xl text-justify' : 'text-lg md:text-xl'}`}
                onInput={handleInput}
                spellCheck={false}
                data-placeholder="Aquí nace tu historia..."
              />
            </div>
          </div>

          {/* MAPA DE CAPÍTULOS INFERIOR (FOOTER DOCK) */}
          {!zenMode && (
            <div className={`bg-inherit border-t border-black/5 transition-all duration-500 overflow-hidden shrink-0 z-50 ${showChapterBar ? 'h-32 md:h-28' : 'h-0'}`}>
              <div className="h-full flex flex-col">
                <div className="px-6 py-2 flex justify-between items-center border-b border-black/5 bg-black/[0.02] dark:bg-white/[0.02]">
                  <h3 className="text-[9px] font-black uppercase tracking-[0.2em] opacity-40">Mapa del Manuscrito</h3>
                  <div className="flex gap-4">
                    <button onClick={handleAddPage} className="text-[9px] font-black uppercase tracking-widest text-ink-900 dark:text-white flex items-center gap-1.5 hover:opacity-70 transition-opacity">
                      <Icons.Plus size={12} /> Nueva Sección
                    </button>
                    <button onClick={() => setShowChapterBar(false)} className="opacity-40 hover:opacity-100 transition-opacity"><Icons.ZenClose size={12} /></button>
                  </div>
                </div>
                <div className="flex-1 overflow-x-auto no-scrollbar flex items-center px-4 gap-3 py-3">
                  {story.pages.map((p, i) => (
                    <div 
                      key={p.id}
                      onClick={() => setActivePageId(p.id)}
                      className={`group relative shrink-0 w-40 md:w-48 p-3 rounded-xl border cursor-pointer transition-all duration-300 ${
                        activePageId === p.id 
                        ? 'bg-ink-900 dark:bg-white text-white dark:text-black border-transparent shadow-lg -translate-y-1' 
                        : 'bg-black/5 dark:bg-white/5 border-transparent hover:border-black/10'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[8px] font-mono opacity-40 uppercase">ORD {i + 1}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); movePage(i, 'left'); }} disabled={i === 0} className="p-0.5 hover:bg-black/10 rounded"><Icons.ChevronRight size={10} className="rotate-180" /></button>
                          <button onClick={(e) => { e.stopPropagation(); movePage(i, 'right'); }} disabled={i === story.pages.length - 1} className="p-0.5 hover:bg-black/10 rounded"><Icons.ChevronRight size={10} /></button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeletePage(p.id); }} className="p-0.5 hover:bg-red-500 hover:text-white rounded"><Icons.Delete size={10} /></button>
                        </div>
                      </div>
                      <h4 className="text-[11px] font-serif font-bold truncate">{p.title || "Sin título"}</h4>
                      <p className="text-[8px] mt-1 opacity-40 uppercase tracking-tighter">{countWords(p.content)} palabras</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* CONTROL DE APERTURA DEL MAPA (Si está cerrado) */}
          {!zenMode && !showChapterBar && (
            <button 
              onClick={() => setShowChapterBar(true)}
              className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-ink-900 dark:bg-white text-white dark:text-black px-4 py-2 rounded-full shadow-2xl z-50 text-[9px] font-black uppercase tracking-widest hover:scale-110 transition-all flex items-center gap-2"
            >
              <Icons.List size={14} /> Abrir Mapa
            </button>
          )}
        </main>

        {/* INSPECTOR LATERAL: DESPLAZA EL CONTENIDO */}
        {!zenMode && (
          <aside className={`
            shrink-0 border-l border-black/5 bg-inherit flex flex-col transition-all duration-500 ease-in-out z-[60]
            ${showInspector ? 'w-full md:w-80 lg:w-96' : 'w-0 border-none'}
            ${showInspector && window.innerWidth < 768 ? 'fixed inset-0 top-12 bottom-0 z-[100]' : 'relative'}
          `}>
            <div className="flex flex-col h-full overflow-hidden w-full md:w-80 lg:w-96">
              <div className="p-6 border-b border-black/5 bg-black/[0.02] dark:bg-white/[0.02]">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Inspector</h2>
                  <button onClick={() => setShowInspector(false)} className="p-2 hover:bg-black/5 rounded-full"><Icons.Back size={18} className="rotate-180" /></button>
                </div>
                <div className="flex bg-black/5 dark:bg-white/5 p-1 rounded-xl">
                  {(['metas', 'biblia', 'detalles'] as InspectorTab[]).map(tab => (
                    <button 
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === tab ? 'bg-white dark:bg-ink-800 shadow-sm text-ink-900 dark:text-white' : 'text-ink-400 opacity-60 hover:opacity-100'}`}
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
                      <label className="text-[10px] font-mono opacity-40 uppercase block mb-3">Objetivo de la Obra</label>
                      <div className="relative">
                        <input 
                          type="number"
                          className="w-full bg-black/5 dark:bg-white/5 border-none rounded-2xl p-4 text-sm font-bold outline-none ring-1 ring-black/5 focus:ring-current/20 transition-all"
                          value={story.wordCountGoal}
                          onChange={(e) => { setIsDirty(true); setStory(prev => ({ ...prev, wordCountGoal: parseInt(e.target.value) || 0 })); }}
                          placeholder="Ej: 50,000"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-mono opacity-30">PALABRAS</span>
                      </div>
                      <div className="mt-8 p-6 border border-black/5 bg-black/[0.01] rounded-3xl">
                        <div className="flex justify-between text-[10px] font-mono mb-2">
                          <span className="opacity-40 uppercase">Progreso Real</span>
                          <span className="font-bold">{progressPercent.toFixed(1)}%</span>
                        </div>
                        <div className="h-2.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                          <div className="h-full bg-ink-900 dark:bg-white transition-all duration-1000 shadow-[0_0_15px_rgba(0,0,0,0.1)]" style={{ width: `${progressPercent}%` }}></div>
                        </div>
                        <p className="text-[10px] opacity-40 mt-4 text-center font-mono">{totalWords.toLocaleString()} / {story.wordCountGoal.toLocaleString() || '∞'}</p>
                      </div>
                    </section>
                    
                    <section>
                      <label className="text-[10px] font-mono opacity-40 uppercase block mb-3">Producción</label>
                      <div className="grid grid-cols-1 gap-1.5">
                        {ALL_STATUSES.map(s => (
                          <button 
                            key={s} 
                            onClick={() => { setIsDirty(true); setStory(prev => ({ ...prev, status: s })); }}
                            className={`text-left px-5 py-3 text-[10px] font-bold rounded-xl transition-all border ${story.status === s ? 'bg-ink-900 dark:bg-white text-white dark:text-black border-transparent shadow-md' : 'border-transparent hover:bg-black/5 text-ink-400'}`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </section>
                  </div>
                )}

                {activeTab === 'biblia' && (
                  <div className="h-full flex flex-col animate-in fade-in slide-in-from-right-4 duration-300">
                    <label className="text-[10px] font-mono opacity-40 uppercase block mb-3">Notas de Construcción (Biblia)</label>
                    <textarea 
                      className="flex-1 w-full bg-black/5 dark:bg-white/5 border-none rounded-2xl p-6 text-sm font-serif leading-relaxed outline-none resize-none ring-1 ring-black/5 focus:ring-current/20 transition-all"
                      value={story.bible || ''}
                      onChange={(e) => { setIsDirty(true); setStory(prev => ({ ...prev, bible: e.target.value })); }}
                      placeholder="Registra personajes, lugares y reglas de tu universo..."
                    />
                  </div>
                )}

                {activeTab === 'detalles' && (
                  <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-300">
                    <section>
                      <label className="text-[10px] font-mono opacity-40 uppercase block mb-3">Sinopsis de Obra</label>
                      <textarea 
                        className="w-full h-56 bg-black/5 dark:bg-white/5 border-none rounded-2xl p-6 text-xs font-serif leading-relaxed outline-none resize-none ring-1 ring-black/5 focus:ring-current/20 transition-all"
                        value={story.synopsis}
                        onChange={(e) => { setIsDirty(true); setStory(prev => ({ ...prev, synopsis: e.target.value })); }}
                        placeholder="El núcleo de tu historia en pocas palabras..."
                      />
                    </section>
                    <section className="pt-4 space-y-3">
                      <button onClick={onShare} className="w-full py-4 bg-ink-900 dark:bg-white text-white dark:text-black rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-[1.02] shadow-xl">
                        <Icons.Share size={14} /> Compartir Borrador
                      </button>
                    {/* Fix: Changed </div> to </section> to match opening tag */}
                    </section>
                  </div>
                )}
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* FOOTER: SIEMPRE DISCRETO */}
      {!zenMode && (
        <footer className="px-6 py-2 border-t border-black/5 bg-inherit z-[70] text-[9px] font-mono flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4 opacity-40">
            <span className="flex items-center gap-1.5 uppercase tracking-widest"><Icons.Pen size={10} /> Escena: {countWords(activePage?.content || '')} pal.</span>
          </div>
          <div className="flex items-center gap-4">
            {isDirty && <span className="text-amber-500 font-black uppercase tracking-tighter">● Sincronización pendiente</span>}
            {!isDirty && <span className="opacity-20 uppercase font-black tracking-widest">Escritorio Local Seguro</span>}
          </div>
        </footer>
      )}

      {/* EXIT ZEN BUTTON (Floating) */}
      {zenMode && (
        <button 
          onClick={() => setZenMode(false)} 
          className="fixed bottom-8 right-8 z-[100] p-4 bg-ink-900 dark:bg-white text-white dark:text-black rounded-full shadow-2xl opacity-40 hover:opacity-100 transition-all hover:scale-110"
          title="Salir del Modo Zen"
        >
          <Icons.ZenClose size={24} />
        </button>
      )}
    </div>
  );
};
