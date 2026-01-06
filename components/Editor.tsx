import React, { useState, useEffect } from 'react';
import { Story, Page, Genre, StoryStatus } from '../types';
import { Icons } from './Icon';
import { ALL_GENRES, ALL_STATUSES } from '../constants';
import { countWords } from '../utils/storage';

interface EditorProps {
  story: Story;
  onSave: (story: Story) => void;
  onClose: () => void;
  onShare: () => void;
}

export const Editor: React.FC<EditorProps> = ({ story: initialStory, onSave, onClose, onShare }) => {
  const [story, setStory] = useState<Story>(initialStory);
  const [activePageId, setActivePageId] = useState<string>(
    initialStory.pages.length > 0 ? initialStory.pages[0].id : ''
  );
  const [showMetadata, setShowMetadata] = useState(false);
  const [showPageList, setShowPageList] = useState(true);

  const activePage = story.pages.find(p => p.id === activePageId);

  // Auto-save effect
  useEffect(() => {
    const timer = setTimeout(() => {
      onSave(story);
    }, 1000);
    return () => clearTimeout(timer);
  }, [story, onSave]);

  const handleUpdatePageContent = (content: string) => {
    if (!activePage) return;
    setStory(prev => ({
      ...prev,
      updatedAt: Date.now(),
      pages: prev.pages.map(p => p.id === activePageId ? { ...p, content } : p)
    }));
  };

  const handleUpdatePageTitle = (title: string) => {
     if (!activePage) return;
     setStory(prev => ({
      ...prev,
      updatedAt: Date.now(),
      pages: prev.pages.map(p => p.id === activePageId ? { ...p, title } : p)
    }));
  };

  const handleAddPage = () => {
    const newPage: Page = {
      id: `page_${Date.now()}`,
      title: `Capítulo ${story.pages.length + 1}`,
      content: '',
      order: story.pages.length
    };
    setStory(prev => ({
      ...prev,
      pages: [...prev.pages, newPage]
    }));
    setActivePageId(newPage.id);
  };

  const handleDeletePage = (pageId: string) => {
    if (story.pages.length <= 1) {
      alert("No puedes borrar la última página.");
      return;
    }
    if (!window.confirm("¿Estás seguro de eliminar este capítulo?")) return;

    setStory(prev => {
      const newPages = prev.pages.filter(p => p.id !== pageId);
      return { ...prev, pages: newPages };
    });
    
    if (activePageId === pageId) {
      setActivePageId(story.pages.find(p => p.id !== pageId)?.id || '');
    }
  };

  const handleGenreToggle = (genre: Genre) => {
    setStory(prev => {
      const genres = prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre];
      return { ...prev, genres };
    });
  };

  const totalWords = story.pages.reduce((acc, p) => acc + countWords(p.content), 0);
  const pageWords = activePage ? countWords(activePage.content) : 0;

  return (
    <div className="flex flex-col h-screen bg-ink-50 dark:bg-black">
      {/* Top Bar Minimalista */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-ink-200 dark:border-ink-800 bg-white dark:bg-black z-20">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-ink-100 dark:hover:bg-ink-900 rounded-md text-ink-600 dark:text-ink-400 transition-colors">
            <Icons.Back size={18} />
          </button>
          <div className="h-6 w-px bg-ink-200 dark:bg-ink-800 mx-1"></div>
          <div className="flex flex-col">
            <h1 className="text-sm font-semibold font-serif text-ink-900 dark:text-ink-100 max-w-[200px] truncate">
              {story.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button 
            onClick={onShare}
            className="p-2 rounded-md text-ink-500 hover:text-ink-900 dark:hover:text-ink-100 hover:bg-ink-100 dark:hover:bg-ink-900 transition-colors"
            title="Compartir enlace"
          >
            <Icons.Share size={18} />
          </button>
          <button 
            onClick={() => setShowPageList(!showPageList)}
            className={`p-2 rounded-md text-ink-500 hover:text-ink-900 dark:hover:text-ink-100 transition-colors ${showPageList ? 'bg-ink-100 dark:bg-ink-900 text-ink-900' : 'hover:bg-ink-100 dark:hover:bg-ink-900'}`}
            title="Índice"
          >
            <Icons.List size={18} />
          </button>
          <button 
            onClick={() => setShowMetadata(true)}
            className="p-2 rounded-md text-ink-500 hover:text-ink-900 dark:hover:text-ink-100 hover:bg-ink-100 dark:hover:bg-ink-900 transition-colors"
            title="Configuración del proyecto"
          >
            <Icons.Settings size={18} />
          </button>
          <div className="w-px h-6 bg-ink-200 dark:bg-ink-800 mx-1"></div>
          <button onClick={() => onSave(story)} className="ml-2 px-4 py-1.5 bg-ink-900 dark:bg-ink-100 text-white dark:text-black text-xs font-medium uppercase tracking-wider rounded-sm hover:opacity-90 active:scale-95 transition-all">
            Guardar
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        
        {/* Sidebar (Indice) */}
        <aside className={`
          absolute md:relative z-10 h-full w-72 bg-ink-50 dark:bg-black border-r border-ink-200 dark:border-ink-800 flex flex-col transform transition-all duration-300 ease-in-out
          ${showPageList ? 'translate-x-0 w-72' : '-translate-x-full w-0 md:translate-x-0 md:w-0 overflow-hidden opacity-0 md:opacity-100'}
        `}>
          <div className="p-4 flex justify-between items-center border-b border-ink-100 dark:border-ink-900">
            <span className="text-xs font-bold text-ink-400 uppercase tracking-widest">Capítulos</span>
            <button onClick={handleAddPage} className="p-1 hover:bg-ink-200 dark:hover:bg-ink-800 rounded text-ink-600 dark:text-ink-400 transition-colors">
              <Icons.Plus size={16} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {story.pages.map((page, idx) => (
              <div 
                key={page.id}
                onClick={() => { setActivePageId(page.id); if(window.innerWidth < 768) setShowPageList(false); }}
                className={`group flex items-center justify-between p-3 rounded-sm cursor-pointer text-sm border-l-2 transition-all ${
                  activePageId === page.id 
                    ? 'bg-white dark:bg-ink-900 border-ink-900 dark:border-ink-100 text-ink-900 dark:text-white font-medium shadow-subtle' 
                    : 'border-transparent text-ink-500 hover:bg-ink-100 dark:hover:bg-ink-900 hover:text-ink-700'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <span className="text-[10px] font-mono text-ink-400 w-4">{idx + 1}.</span>
                  <span className="truncate">{page.title}</span>
                </div>
                {activePageId === page.id && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleDeletePage(page.id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-ink-400 hover:text-red-600 transition-all"
                  >
                    <Icons.Delete size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-ink-200 dark:border-ink-800 text-center">
             <p className="text-[10px] font-mono text-ink-400 uppercase">Total: {totalWords} palabras</p>
          </div>
        </aside>

        {/* Main Editor Area */}
        <main className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-black relative">
          {activePage ? (
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="max-w-3xl mx-auto px-8 py-12 min-h-full">
                <input 
                  type="text"
                  value={activePage.title}
                  onChange={(e) => handleUpdatePageTitle(e.target.value)}
                  className="w-full text-3xl md:text-4xl font-serif font-bold bg-transparent border-none focus:ring-0 placeholder-ink-300 text-ink-900 dark:text-ink-100 p-0 mb-8 tracking-tight"
                  placeholder="Título del capítulo..."
                />

                <textarea
                  value={activePage.content}
                  onChange={(e) => handleUpdatePageContent(e.target.value)}
                  className="w-full h-[calc(100vh-250px)] resize-none text-lg md:text-xl leading-relaxed bg-transparent border-none focus:ring-0 text-ink-800 dark:text-ink-300 font-serif placeholder-ink-300 dark:placeholder-ink-800 outline-none"
                  placeholder="Empieza a escribir..."
                  spellCheck={false}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-ink-300">
              <p className="font-serif italic">Selecciona un capítulo</p>
            </div>
          )}
          
          {/* Footer minimalista */}
          <div className="absolute bottom-0 right-0 bg-white/80 dark:bg-black/80 backdrop-blur-sm px-4 py-2 border-tl border-ink-100 dark:border-ink-800 text-xs font-mono text-ink-400">
             {pageWords} palabras
          </div>
        </main>
      </div>

      {/* Metadata Modal */}
      {showMetadata && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/20 dark:bg-white/10 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white dark:bg-black border border-ink-200 dark:border-ink-800 shadow-2xl w-full max-w-lg animate-in zoom-in-95 duration-300">
            <div className="p-6">
              <div className="flex justify-between items-center mb-8 border-b border-ink-100 dark:border-ink-900 pb-4">
                <h2 className="text-lg font-serif font-bold text-ink-900 dark:text-white">Metadatos del Proyecto</h2>
                <button onClick={() => setShowMetadata(false)} className="text-ink-400 hover:text-ink-900 dark:hover:text-white">
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-ink-500 uppercase tracking-widest">Título</label>
                  <input 
                    type="text" 
                    value={story.title}
                    onChange={(e) => setStory({...story, title: e.target.value})}
                    className="w-full py-2 border-b border-ink-300 dark:border-ink-700 bg-transparent text-ink-900 dark:text-ink-100 focus:border-black dark:focus:border-white focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1">
                   <label className="text-xs font-bold text-ink-500 uppercase tracking-widest">Sinopsis</label>
                   <textarea 
                    value={story.synopsis}
                    onChange={(e) => setStory({...story, synopsis: e.target.value})}
                    rows={3}
                    className="w-full p-3 border border-ink-200 dark:border-ink-800 bg-ink-50 dark:bg-ink-900 text-ink-900 dark:text-ink-100 text-sm focus:outline-none focus:border-ink-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-ink-500 uppercase tracking-widest">Estado</label>
                  <div className="flex gap-2">
                    {ALL_STATUSES.map(status => (
                      <button
                        key={status}
                        onClick={() => setStory({...story, status: status as StoryStatus})}
                        className={`px-3 py-1 text-xs border transition-colors ${
                          story.status === status
                            ? 'bg-ink-900 text-white dark:bg-white dark:text-black border-ink-900 dark:border-white'
                            : 'border-ink-200 dark:border-ink-800 text-ink-500 hover:border-ink-400'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-ink-500 uppercase tracking-widest">Géneros</label>
                  <div className="flex flex-wrap gap-2">
                    {ALL_GENRES.map(genre => (
                      <button
                        key={genre}
                        onClick={() => handleGenreToggle(genre as Genre)}
                        className={`px-2 py-1 text-[10px] uppercase tracking-wider border transition-colors ${
                          story.genres.includes(genre as Genre)
                            ? 'bg-ink-200 dark:bg-ink-800 border-ink-400 text-ink-900 dark:text-white'
                            : 'border-ink-200 dark:border-ink-800 text-ink-400 hover:border-ink-400'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 bg-ink-50 dark:bg-ink-950 flex justify-end">
              <button 
                onClick={() => setShowMetadata(false)}
                className="px-6 py-2 bg-ink-900 dark:bg-white text-white dark:text-black text-sm font-medium uppercase tracking-wider hover:opacity-90 transition-opacity"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};