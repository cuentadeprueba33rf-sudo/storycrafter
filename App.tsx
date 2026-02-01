
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

const supabaseUrl = 'https://your-project.supabase.co'; 
const supabaseKey = 'your-anon-key';
const supabase = createClient(supabaseUrl, supabaseKey);

function App() {
  const [data, setData] = useState<AppData>({ stories: [], folders: [], cloudImages: [] });
  const [view, setView] = useState<ViewMode>('HOME');
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [communityStory, setCommunityStory] = useState<Story | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [editorTheme, setEditorTheme] = useState<EditorTheme>('LIGHT');
  const [isStudioDarkMode, setIsStudioDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const loaded = loadData();
    setData(loaded);
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      saveData(data);
    }
  }, [data, isLoading]);

  useEffect(() => {
    if (isStudioDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('bg-black');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('bg-black');
    }
  }, [isStudioDarkMode]);

  const handleUpdateCloud = (cloudImages: CloudImage[]) => {
    setData(prev => ({ ...prev, cloudImages }));
  };

  const handleCreateStory = () => {
    const title = prompt("Título del nuevo manuscrito:") || "Manuscrito Sin Título";
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
      pages: [{ id: generateId(ID_PREFIX.PAGE), title: 'Capítulo I', content: '', order: 0 }],
      characters: [],
      isPublished: false,
      authorName: "Autor Local"
    };
    setData(prev => ({ ...prev, stories: [newStory, ...prev.stories] }));
    setActiveStoryId(newStory.id);
    setCommunityStory(null);
    setView('EDITOR');
  };

  const handleSaveStory = useCallback(async (updatedStory: Story) => {
    setData(prev => ({
      ...prev,
      stories: prev.stories.map(s => s.id === updatedStory.id ? updatedStory : s)
    }));

    if (updatedStory.isPublished) {
      try {
        await supabase
          .from('public_stories')
          .upsert({
            id: updatedStory.id,
            title: updatedStory.title,
            synopsis: updatedStory.synopsis,
            author_name: updatedStory.authorName,
            content_json: JSON.stringify(updatedStory.pages),
            updated_at: new Date().toISOString()
          });
      } catch (e) {
        console.error("Error de sincronización con comunidad:", e);
      }
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-white text-ink-900">
        <div className="flex flex-col items-center animate-pulse">
          <div className="mb-8 p-8 border border-black/5 rounded-[2.5rem] bg-black/[0.02]">
            <Icons.Pen size={40} strokeWidth={1} className="text-amber-500" />
          </div>
          <h1 className="text-2xl font-serif italic tracking-widest mb-3 text-ink-900">StoryCraft</h1>
          <div className="text-[8px] font-mono uppercase tracking-[0.5em] text-ink-300">Conectando con la Comunidad</div>
        </div>
      </div>
    );
  }

  const activeStory = communityStory || data.stories.find(s => s.id === activeStoryId);

  return (
    <div className={`flex h-screen overflow-hidden transition-colors duration-500 ${isStudioDarkMode ? 'bg-black' : 'bg-white'}`}>
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
            onNavigateFolder={setCurrentFolderId} 
            onCreateFolder={() => {
              const name = prompt("Nombre de la carpeta:");
              if (!name) return;
              setData(prev => ({ ...prev, folders: [...prev.folders, { id: generateId(ID_PREFIX.FOLDER), name, parentId: currentFolderId, createdAt: Date.now() }] }));
            }} 
            onCreateStory={handleCreateStory}
            onOpenStory={(id) => { 
              setActiveStoryId(id); 
              setCommunityStory(null); 
              setView('EDITOR'); 
            }}
            onDeleteStory={(id) => {
              if(confirm("¿Borrar definitivamente este manuscrito? Se eliminará del local y del servidor global.")) {
                setData(prev => ({ ...prev, stories: prev.stories.filter(s => s.id !== id) }));
                supabase.from('public_stories').delete().eq('id', id);
              }
            }}
            onDeleteFolder={(id) => {
              if(confirm("¿Borrar carpeta?")) {
                setData(prev => ({ 
                  ...prev, 
                  folders: prev.folders.filter(f => f.id !== id),
                  stories: prev.stories.map(s => s.folderId === id ? { ...s, folderId: null } : s)
                }));
              }
            }}
            onMoveStory={(sid, fid) => setData(prev => ({ ...prev, stories: prev.stories.map(s => s.id === sid ? { ...s, folderId: fid } : s) }))}
            onShareStory={(id) => {
              navigator.clipboard.writeText(`${window.location.origin}?story=${id}`);
              alert("Enlace de obra copiado.");
            }}
            onBackHome={() => setView('HOME')}
            isDarkMode={isStudioDarkMode}
            onToggleDarkMode={() => setIsStudioDarkMode(!isStudioDarkMode)}
            onEnterFeed={() => setView('FEED')}
          />
        )}
        {view === 'FEED' && (
          <Feed 
            supabase={supabase}
            isAdmin={false}
            onBack={() => setView('HOME')}
            onReadStory={(story) => {
              setCommunityStory(story);
              setView('EDITOR');
            }}
          />
        )}
        {view === 'EDITOR' && activeStory && (
          <Editor 
            story={activeStory} onSave={handleSaveStory} 
            onClose={() => {
              setCommunityStory(null);
              setView(communityStory ? 'FEED' : 'LIBRARY');
            }} 
            onShare={() => alert("Compartir activado.")} 
            theme={editorTheme} 
            onChangeTheme={setEditorTheme}
            cloudImages={data.cloudImages}
            isUserLoggedIn={true}
            readOnly={!!communityStory}
            isDarkMode={isStudioDarkMode}
            onToggleDarkMode={() => setIsStudioDarkMode(!isStudioDarkMode)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
