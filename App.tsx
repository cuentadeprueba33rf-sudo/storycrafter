
import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@supabase/supabase-js';
import { loadData, saveData, generateId, AppData } from './utils/storage';
import { Story, Folder, ViewMode, Genre, StoryStatus, EditorTheme, CloudImage } from './types';
import { ID_PREFIX } from './constants';
import { Library } from './components/Library';
import { Editor } from './components/Editor';
import { Dashboard } from './components/Dashboard';
import { Feed } from './components/Feed';
import { Icons } from './components/Icon';

// Configuración de Supabase proporcionada
const supabase = createClient(
  "https://hnhhklgfirvlrvivnzva.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuaGhrbGdmaXJ2bHJ2aXZuenZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MjQ2NTcsImV4cCI6MjA4MzMwMDY1N30.bhtmLRhKX0uzHEaFnui71Gvt89eXncA3lpzEfHUoxS4"
);

function App() {
  const [data, setData] = useState<AppData>({ stories: [], folders: [], cloudImages: [] });
  const [view, setView] = useState<ViewMode>('HOME');
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [editorTheme, setEditorTheme] = useState<EditorTheme>('LIGHT');
  const [isLoading, setIsLoading] = useState(true);

  // Generar un nombre de autor local si no existe
  const getAuthorName = useCallback(() => {
    let name = localStorage.getItem('storycraft_author_name');
    if (!name) {
      name = `Autor Errante #${Math.floor(Math.random() * 999)}`;
      localStorage.setItem('storycraft_author_name', name);
    }
    return name;
  }, []);

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
    } else if (view !== 'EDITOR' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
       document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [view, editorTheme]);

  const handleUpdateCloud = (cloudImages: CloudImage[]) => {
    setData(prev => ({ ...prev, cloudImages }));
  };

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
      pages: [{ id: generateId(ID_PREFIX.PAGE), title: 'I', content: '', order: 0 }],
      characters: [],
      isPublished: false,
      authorName: getAuthorName()
    };
    setData(prev => ({ ...prev, stories: [newStory, ...prev.stories] }));
    setActiveStoryId(newStory.id);
    setView('EDITOR');
  };

  const handleSaveStory = useCallback(async (updatedStory: Story) => {
    setData(prev => ({
      ...prev,
      stories: prev.stories.map(s => s.id === updatedStory.id ? updatedStory : s)
    }));

    // Si la historia está marcada como publicada, la enviamos a Supabase
    if (updatedStory.isPublished) {
      try {
        const { error } = await supabase
          .from('public_stories')
          .upsert({
            id: updatedStory.id,
            title: updatedStory.title,
            synopsis: updatedStory.synopsis,
            author_name: updatedStory.authorName || getAuthorName(),
            genres: updatedStory.genres,
            status: updatedStory.status,
            content_json: JSON.stringify(updatedStory.pages),
            updated_at: new Date().toISOString()
          });
        if (error) console.error("Error al publicar en Supabase:", error);
      } catch (e) {
        console.error("Fallo de red Supabase:", e);
      }
    }
  }, [getAuthorName]);

  const handleDeleteStory = (id: string) => {
    if (!window.confirm("¿Eliminar esta historia?")) return;
    setData(prev => ({ ...prev, stories: prev.stories.filter(s => s.id !== id) }));
  };

  const handleDeleteFolder = (id: string) => {
    if (!window.confirm("¿Eliminar carpeta y desvincular historias?")) return;
    setData(prev => ({
      ...prev,
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
      <div className="flex flex-col items-center justify-center h-screen bg-ink-50 dark:bg-black text-ink-900 dark:text-white">
        <div className="flex flex-col items-center animate-pulse">
          <div className="mb-6 p-4 border border-ink-200 dark:border-ink-800 rounded-sm"><Icons.Pen size={48} strokeWidth={1} /></div>
          <h1 className="text-4xl font-serif font-medium tracking-tighter mb-2">StoryCraft</h1>
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-ink-400">Sincronizando con el Universo...</div>
        </div>
      </div>
    );
  }

  const activeStory = data.stories.find(s => s.id === activeStoryId);

  return (
    <div className="flex h-screen overflow-hidden bg-ink-50 dark:bg-black">
      <div className="flex-1 flex flex-col relative w-full overflow-hidden">
        {view === 'HOME' && (
          <Dashboard 
            onEnterStudio={() => setView('LIBRARY')} 
            onEnterExplore={() => setView('FEED')}
            cloudImages={data.cloudImages}
            onUpdateCloud={handleUpdateCloud}
          />
        )}
        {view === 'LIBRARY' && (
          <Library
            stories={data.stories} folders={data.folders} currentFolderId={currentFolderId}
            onNavigateFolder={setCurrentFolderId} onCreateFolder={handleCreateFolder} onCreateStory={handleCreateStory}
            onOpenStory={(id) => { setActiveStoryId(id); setView('EDITOR'); }}
            onDeleteStory={handleDeleteStory} onDeleteFolder={handleDeleteFolder} onMoveStory={handleMoveStory} onShareStory={handleShareStory}
            onOpenFeed={() => setView('FEED')}
          />
        )}
        {view === 'FEED' && (
          <Feed 
            onBack={() => setView('HOME')}
            onReadStory={(story) => {
              // Creamos una copia local temporal para leerla si no la tenemos
              const exists = data.stories.find(s => s.id === story.id);
              if (!exists) {
                const tempStory: Story = {
                  ...story,
                  folderId: 'temp_read',
                };
                // Solo permitimos lectura, no guardamos permanentemente a menos que el usuario lo pida
              }
              setActiveStoryId(story.id);
              setView('EDITOR');
            }}
            supabase={supabase}
          />
        )}
        {view === 'EDITOR' && activeStory && (
          <Editor 
            story={activeStory} onSave={handleSaveStory} onClose={() => setView('LIBRARY')} 
            onShare={() => handleShareStory(activeStory.id)} theme={editorTheme} onChangeTheme={setEditorTheme}
            cloudImages={data.cloudImages}
          />
        )}
      </div>
    </div>
  );
}

export default App;
