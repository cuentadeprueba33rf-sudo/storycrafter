
import React, { useState, useEffect, useCallback } from 'react';
import { loadData, saveData, generateId, AppData } from './utils/storage';
import { Story, Folder, ViewMode, Genre, StoryStatus } from './types';
import { ID_PREFIX } from './constants';
import { Library } from './components/Library';
import { Editor } from './components/Editor';
import { Dashboard } from './components/Dashboard';
import { Icons } from './components/Icon';

function App() {
  const [data, setData] = useState<AppData>({ stories: [], folders: [] });
  const [view, setView] = useState<ViewMode>('HOME');
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loaded = loadData();
    setData(loaded);
    
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveData(data);
    }
  }, [data, isLoading]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

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
    if (!window.confirm("¿Eliminar esta historia?")) return;
    setData(prev => ({
      ...prev,
      stories: prev.stories.filter(s => s.id !== id)
    }));
  };

  const handleDeleteFolder = (id: string) => {
    const folder = data.folders.find(f => f.id === id);
    if (!folder) return;
    if (!window.confirm(`¿Eliminar carpeta "${folder.name}"?`)) return;
    setData(prev => ({
      folders: prev.folders.filter(f => f.id !== id),
      stories: prev.stories.map(s => s.folderId === id ? { ...s, folderId: null } : s)
    }));
  };

  const handleMoveStory = (storyId: string, targetFolderId: string | null) => {
    setData(prev => ({
      ...prev,
      stories: prev.stories.map(s => s.id === storyId ? { ...s, folderId: targetFolderId } : s)
    }));
  };

  const handleShareStory = (storyId: string) => {
    const story = data.stories.find(s => s.id === storyId);
    if (!story) return;
    const url = `${window.location.origin}/?story=${story.id}`;
    navigator.clipboard.writeText(url).then(() => alert("Enlace copiado."));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white dark:bg-black text-ink-900 dark:text-white">
        <div className="flex flex-col items-center animate-pulse">
          <div className="mb-6 p-4 border border-ink-200 dark:border-ink-800 rounded-sm">
            <Icons.Pen size={48} strokeWidth={1} />
          </div>
          <h1 className="text-4xl font-serif font-medium tracking-tighter mb-2">StoryCraft</h1>
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-ink-400">Cargando Estudio...</div>
        </div>
      </div>
    );
  }

  const activeStory = data.stories.find(s => s.id === activeStoryId);

  return (
    <div className="flex h-screen overflow-hidden bg-ink-50 dark:bg-black">
      {view !== 'HOME' && (
        <aside className="hidden lg:flex w-14 flex-col items-center py-6 bg-white dark:bg-black border-r border-ink-200 dark:border-ink-800 z-30">
          <div className="mb-8 p-2 text-ink-900 dark:text-white cursor-pointer hover:scale-110" onClick={() => setView('HOME')}>
            <Icons.Home size={20} />
          </div>
          <div className="flex-1 flex flex-col gap-6">
             <button onClick={() => setView('LIBRARY')} className={`p-2 rounded-md ${view === 'LIBRARY' ? 'text-ink-900 dark:text-white bg-ink-100 dark:bg-ink-900' : 'text-ink-400'}`}>
               <Icons.Grid size={20} />
             </button>
             <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-ink-400 hover:text-ink-900 dark:hover:text-white">
               {darkMode ? <Icons.Sun size={20} /> : <Icons.Moon size={20} />}
             </button>
          </div>
        </aside>
      )}

      <div className="flex-1 flex flex-col relative w-full overflow-hidden">
        {view === 'HOME' && (
          <Dashboard onEnterStudio={() => setView('LIBRARY')} darkMode={darkMode} onSetDarkMode={setDarkMode} />
        )}

        {view === 'LIBRARY' && (
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
        )}

        {view === 'EDITOR' && activeStory && (
          <Editor story={activeStory} onSave={handleSaveStory} onClose={() => setView('LIBRARY')} onShare={() => handleShareStory(activeStory.id)} />
        )}
      </div>
    </div>
  );
}

export default App;
