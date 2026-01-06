
import React, { useState, useEffect, useCallback } from 'react';
import { loadData, saveData, generateId, AppData } from './utils/storage';
import { Story, Folder, ViewMode, Genre, StoryStatus, EditorTheme } from './types';
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
  const [editorTheme, setEditorTheme] = useState<EditorTheme>('LIGHT');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loaded = loadData();
    setData(loaded);
    const timer = setTimeout(() => setIsLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading) saveData(data);
  }, [data, isLoading]);

  useEffect(() => {
    if (view === 'EDITOR' && editorTheme === 'DARK') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [view, editorTheme]);

  const handleCreateFolder = () => {
    const name = prompt("Nombre de la nueva carpeta:");
    if (!name?.trim()) return;
    const newFolder: Folder = { id: generateId(ID_PREFIX.FOLDER), name: name.trim(), parentId: currentFolderId, createdAt: Date.now() };
    setData(prev => ({ ...prev, folders: [...prev.folders, newFolder] }));
  };

  const handleCreateStory = () => {
    const title = prompt("Título de la historia:") || "Sin Título";
    const newStory: Story = {
      id: generateId(ID_PREFIX.STORY),
      title: title.trim(),
      synopsis: '',
      bible: '',
      wordCountGoal: 0,
      genres: [],
      status: StoryStatus.Draft,
      folderId: currentFolderId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pages: [{ id: generateId(ID_PREFIX.PAGE), title: 'I', content: '', order: 0 }]
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
    setData(prev => ({ ...prev, stories: prev.stories.filter(s => s.id !== id) }));
  };

  const handleDeleteFolder = (id: string) => {
    if (!window.confirm("¿Eliminar carpeta y desvincular historias?")) return;
    setData(prev => ({
      folders: prev.folders.filter(f => f.id !== id),
      stories: prev.stories.map(s => s.folderId === id ? { ...s, folderId: null } : s)
    }));
  };

  const handleMoveStory = (storyId: string, targetFolderId: string | null) => {
    setData(prev => ({ ...prev, stories: prev.stories.map(s => s.id === storyId ? { ...s, folderId: targetFolderId } : s) }));
  };

  const handleShareStory = (storyId: string) => {
    const story = data.stories.find(s => s.id === storyId);
    if (!story) return;
    navigator.clipboard.writeText(`${window.location.origin}/?story=${story.id}`).then(() => alert("Enlace copiado."));
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-ink-50 text-ink-900">
        <div className="flex flex-col items-center animate-pulse">
          <div className="mb-6 p-4 border border-ink-200 rounded-sm"><Icons.Pen size={48} strokeWidth={1} /></div>
          <h1 className="text-4xl font-serif font-medium tracking-tighter mb-2">StoryCraft</h1>
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-ink-400">Preparando tu escritorio...</div>
        </div>
      </div>
    );
  }

  const activeStory = data.stories.find(s => s.id === activeStoryId);

  return (
    <div className="flex h-screen overflow-hidden bg-ink-50">
      {view !== 'HOME' && view !== 'EDITOR' && (
        <aside className="hidden lg:flex w-16 flex-col items-center py-8 bg-white border-r border-ink-200 z-30">
          <div className="mb-10 p-2 text-ink-900 cursor-pointer hover:rotate-12 transition-transform" onClick={() => setView('HOME')}><Icons.Home size={22} /></div>
          <div className="flex-1 flex flex-col gap-8">
             <button onClick={() => setView('LIBRARY')} className={`p-2 rounded-xl transition-all ${view === 'LIBRARY' ? 'text-ink-900 bg-ink-100 shadow-inner' : 'text-ink-300'}`}><Icons.Grid size={22} /></button>
          </div>
          <div className="mt-auto writing-vertical-lr text-[8px] font-mono uppercase tracking-widest text-ink-300 rotate-180 py-4">STORYCRAFT PRO</div>
        </aside>
      )}

      <div className="flex-1 flex flex-col relative w-full overflow-hidden">
        {view === 'HOME' && <Dashboard onEnterStudio={() => setView('LIBRARY')} />}
        {view === 'LIBRARY' && (
          <Library
            stories={data.stories} folders={data.folders} currentFolderId={currentFolderId}
            onNavigateFolder={setCurrentFolderId} onCreateFolder={handleCreateFolder} onCreateStory={handleCreateStory}
            onOpenStory={(id) => { setActiveStoryId(id); setView('EDITOR'); }}
            onDeleteStory={handleDeleteStory} onDeleteFolder={handleDeleteFolder} onMoveStory={handleMoveStory} onShareStory={handleShareStory}
          />
        )}
        {view === 'EDITOR' && activeStory && (
          <Editor 
            story={activeStory} onSave={handleSaveStory} onClose={() => setView('LIBRARY')} 
            onShare={() => handleShareStory(activeStory.id)} theme={editorTheme} onChangeTheme={setEditorTheme}
          />
        )}
      </div>
    </div>
  );
}

export default App;
