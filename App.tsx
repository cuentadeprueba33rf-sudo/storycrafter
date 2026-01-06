
import React, { useState, useEffect, useCallback } from 'react';
import { loadData, saveData, generateId, AppData } from './utils/storage.ts';
import { Story, Folder, ViewMode, Genre, StoryStatus } from './types.ts';
import { ID_PREFIX } from './constants.ts';
import { Library } from './components/Library.tsx';
import { Editor } from './components/Editor.tsx';
import { Dashboard } from './components/Dashboard.tsx';
import { Icons } from './components/Icon.tsx';

function App() {
  const [data, setData] = useState<AppData>({ stories: [], folders: [] });
  const [view, setView] = useState<ViewMode>('HOME');
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize
  useEffect(() => {
    const loaded = loadData();
    setData(loaded);
    
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  // Save on change
  useEffect(() => {
    if (!isLoading) {
      saveData(data);
    }
  }, [data, isLoading]);

  // Theme effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Actions
  const handleCreateFolder = () => {
    const name = prompt("Nombre de la nueva carpeta:");
    if (!name || name.trim() === "") return;
    
    const newFolder: Folder = {
      id: generateId(ID_PREFIX.FOLDER),
      name: name.trim(),
      parentId: currentFolderId,
      createdAt: Date.now()
    };
    
    setData(prev => ({ ...prev, folders: [...prev.folders, newFolder] }));
  };

  const handleCreateStory = () => {
    const title = prompt("Título de la historia:") || "Sin Título";
    const newStory: Story = {
      id: generateId(ID_PREFIX.STORY),
      title: title.trim(),
      synopsis: '',
      genres: [],
      status: StoryStatus.Draft,
      folderId: currentFolderId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pages: [{
        id: generateId(ID_PREFIX.PAGE),
        title: 'I',
        content: '',
        order: 0
      }]
    };
    setData(prev => ({ ...prev, stories: [newStory, ...prev.stories] }));
    setActiveStoryId(newStory.id);
    setView('EDITOR');
  };

  const handleSaveStory = useCallback((updatedStory: Story) => {
    setData(prev => ({
      ...prev,
      stories: prev.stories.map(s => s.id === updatedStory.id ? updatedStory : s)
    }));
  }, []);

  const handleDeleteStory = (id: string) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar esta historia? Esta acción no se puede deshacer.")) return;
    setData(prev => ({
      ...prev,
      stories: prev.stories.filter(s => s.id !== id)
    }));
  };

  const handleDeleteFolder = (id: string) => {
    const folder = data.folders.find(f => f.id === id);
    if (!folder) return;

    if (!window.confirm(`¿Eliminar la carpeta "${folder.name}"? Las historias dentro se moverán a la raíz.`)) return;
    
    setData(prev => ({
      folders: prev.folders.filter(f => f.id !== id),
      stories: prev.stories.map(s => s.folderId === id ? { ...s, folderId: null } : s)
    }));
  };

  const handleMoveStory = (storyId: string, targetFolderId: string | null) => {
    if (targetFolderId && !data.folders.find(f => f.id === targetFolderId)) {
      alert("Carpeta destino no encontrada.");
      return;
    }
    setData(prev => ({
      ...prev,
      stories: prev.stories.map(s => s.id === storyId ? { ...s, folderId: targetFolderId } : s)
    }));
  };

  const handleShareStory = (storyId: string) => {
    const story = data.stories.find(s => s.id === storyId);
    if (!story) return;
    const mockUrl = `${window.location.origin}/?story=${story.id}`;
    navigator.clipboard.writeText(mockUrl).then(() => {
      alert("Enlace del proyecto copiado al portapapeles.");
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-black text-ink-900 dark:text-white transition-colors duration-700">
        <div className="flex flex-col items-center animate-in fade-in zoom-in duration-1000">
          <div className="mb-6 p-4 border border-ink-200 dark:border-ink-800 rounded-sm">
            <Icons.Pen size={48} strokeWidth={1} />
          </div>
          <h1 className="text-4xl font-serif font-medium tracking-tighter mb-2">StoryCraft</h1>
          <div className="w-12 h-[1px] bg-ink-300 dark:bg-ink-700 mb-8 overflow-hidden">
            <div className="h-full bg-ink-900 dark:bg-white animate-[loading_2s_ease-in-out_infinite]" style={{ width: '40%', transformOrigin: 'left' }}></div>
          </div>
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-ink-400">
            SAM VERCE STUDIO
          </div>
        </div>
        <style>{`
          @keyframes loading {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(300%); }
          }
        `}</style>
      </div>
    );
  }

  const activeStory = data.stories.find(s => s.id === activeStoryId);

  return (
    <div className="flex h-screen overflow-hidden bg-ink-50 dark:bg-black">
      {/* Sidebar - Visible in Studio mode */}
      {view !== 'HOME' && (
        <aside className="hidden lg:flex w-14 flex-col items-center py-6 bg-white dark:bg-black border-r border-ink-200 dark:border-ink-800 z-30">
          <div className="mb-8 p-2 text-ink-900 dark:text-white cursor-pointer hover:scale-110 transition-transform" onClick={() => setView('HOME')}>
            <Icons.Home size={20} />
          </div>
          <div className="flex-1 flex flex-col gap-6">
             <button 
               onClick={() => setView('LIBRARY')}
               className={`p-2 rounded-md transition-colors ${view === 'LIBRARY' ? 'text-ink-900 dark:text-white bg-ink-100 dark:bg-ink-900' : 'text-ink-400 hover:text-ink-900 dark:hover:text-white'}`}
               title="Librería"
             >
               <Icons.Grid size={20} />
             </button>
             <button 
               onClick={() => setDarkMode(!darkMode)}
               className="p-2 rounded-md text-ink-400 hover:text-ink-900 dark:hover:text-white transition-colors"
               title="Cambiar Tema"
             >
               {darkMode ? <Icons.Sun size={20} /> : <Icons.Moon size={20} />}
             </button>
          </div>
          <div className="mt-auto writing-vertical-lr text-[8px] font-mono uppercase tracking-widest text-ink-300 rotate-180 py-4">
            SAM VERCE
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col relative w-full animate-in fade-in duration-700">
        {view === 'HOME' && (
          <Dashboard 
            onEnterStudio={() => setView('LIBRARY')}
            darkMode={darkMode}
            onSetDarkMode={setDarkMode}
          />
        )}

        {view === 'LIBRARY' && (
          <>
            <div className="lg:hidden absolute top-7 right-5 z-30 flex gap-4">
               <button onClick={() => setView('HOME')} className="text-ink-400"><Icons.Home size={20} /></button>
               <button 
                 onClick={() => setDarkMode(!darkMode)}
                 className="p-2 text-ink-400 hover:text-ink-900 dark:hover:text-white"
               >
                  {darkMode ? <Icons.Sun size={20} /> : <Icons.Moon size={20} />}
               </button>
            </div>
            
            <Library
              stories={data.stories}
              folders={data.folders}
              currentFolderId={currentFolderId}
              onNavigateFolder={setCurrentFolderId}
              onCreateFolder={handleCreateFolder}
              onCreateStory={handleCreateStory}
              onOpenStory={(id) => { setActiveStoryId(id); setView('EDITOR'); }}
              onDeleteStory={handleDeleteStory}
              onDeleteFolder={handleDeleteFolder}
              onMoveStory={handleMoveStory}
              onShareStory={handleShareStory}
            />
          </>
        )}

        {view === 'EDITOR' && activeStory && (
          <Editor
            story={activeStory}
            onSave={handleSaveStory}
            onClose={() => setView('LIBRARY')}
            onShare={() => handleShareStory(activeStory.id)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
