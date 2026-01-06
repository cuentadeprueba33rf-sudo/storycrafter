
import React, { useState, useEffect, useCallback } from 'react';
import { createClient, Session } from '@supabase/supabase-js';
import { loadData, saveData, generateId, AppData } from './utils/storage';
import { Story, Folder, ViewMode, Genre, StoryStatus, EditorTheme, CloudImage } from './types';
import { ID_PREFIX } from './constants';
import { Library } from './components/Library';
import { Editor } from './components/Editor';
import { Dashboard } from './components/Dashboard';
import { Feed } from './components/Feed';
import { Auth } from './components/Auth';
import { Icons } from './components/Icon';

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
  const [session, setSession] = useState<Session | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  useEffect(() => {
    // Escuchar cambios de sesión
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    const loaded = loadData();
    setData(loaded);
    const timer = setTimeout(() => setIsLoading(false), 1500);
    
    return () => subscription.unsubscribe();
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

  const getDisplayName = () => {
    return session?.user?.user_metadata?.display_name || "Autor Anónimo";
  };

  const handleUpdateCloud = (cloudImages: CloudImage[]) => {
    setData(prev => ({ ...prev, cloudImages }));
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
      authorName: getDisplayName()
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

    if (updatedStory.isPublished && session) {
      try {
        const payload = {
          id: updatedStory.id,
          title: updatedStory.title,
          synopsis: updatedStory.synopsis,
          author_name: getDisplayName(),
          genres: updatedStory.genres,
          status: updatedStory.status,
          content_json: updatedStory.pages,
          updated_at: new Date().toISOString(),
          user_id: session.user.id
        };

        const { error } = await supabase
          .from('public_stories')
          .upsert(payload, { onConflict: 'id' });

        if (error) console.error("Error Supabase:", error);
      } catch (e) {
        console.error("Error de red Supabase:", e);
      }
    }
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('HOME');
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-ink-50 dark:bg-black text-ink-900 dark:text-white">
        <div className="flex flex-col items-center animate-pulse">
          <div className="mb-6 p-4 border border-ink-200 dark:border-ink-800 rounded-sm"><Icons.Pen size={48} strokeWidth={1} /></div>
          <h1 className="text-4xl font-serif font-medium tracking-tighter mb-2">StoryCraft</h1>
          <div className="text-[10px] font-mono uppercase tracking-[0.3em] text-ink-400">Inspiración Manual...</div>
        </div>
      </div>
    );
  }

  const activeStory = data.stories.find(s => s.id === activeStoryId);

  return (
    <div className="flex h-screen overflow-hidden bg-ink-50 dark:bg-black">
      {showAuth && <Auth supabase={supabase} onClose={() => setShowAuth(false)} />}
      
      <div className="flex-1 flex flex-col relative w-full overflow-hidden">
        {view === 'HOME' && (
          <Dashboard 
            onEnterStudio={() => setView('LIBRARY')} 
            onEnterExplore={() => setView('FEED')}
            cloudImages={data.cloudImages}
            onUpdateCloud={handleUpdateCloud}
            session={session}
            onAuthOpen={() => setShowAuth(true)}
            onLogout={handleLogout}
          />
        )}
        {view === 'LIBRARY' && (
          <Library
            stories={data.stories} folders={data.folders} currentFolderId={currentFolderId}
            onNavigateFolder={setCurrentFolderId} 
            onCreateFolder={() => {
              const name = prompt("Nombre:");
              if (!name) return;
              setData(prev => ({ ...prev, folders: [...prev.folders, { id: generateId(ID_PREFIX.FOLDER), name, parentId: currentFolderId, createdAt: Date.now() }] }));
            }} 
            onCreateStory={handleCreateStory}
            onOpenStory={(id) => { setActiveStoryId(id); setView('EDITOR'); }}
            onDeleteStory={(id) => setData(prev => ({ ...prev, stories: prev.stories.filter(s => s.id !== id) }))}
            onDeleteFolder={(id) => setData(prev => ({ ...prev, folders: prev.folders.filter(f => f.id !== id) }))}
            onMoveStory={(sid, fid) => setData(prev => ({ ...prev, stories: prev.stories.map(s => s.id === sid ? { ...s, folderId: fid } : s) }))}
            onShareStory={(id) => alert("Enlace compartido")}
            onOpenFeed={() => setView('FEED')}
          />
        )}
        {view === 'FEED' && (
          <Feed 
            onBack={() => setView('HOME')}
            onReadStory={(story) => {
              setActiveStoryId(story.id);
              setView('EDITOR');
            }}
            supabase={supabase}
          />
        )}
        {view === 'EDITOR' && activeStory && (
          <Editor 
            story={activeStory} onSave={handleSaveStory} onClose={() => setView('LIBRARY')} 
            onShare={() => alert("Compartido")} theme={editorTheme} onChangeTheme={setEditorTheme}
            cloudImages={data.cloudImages}
            isUserLoggedIn={!!session}
          />
        )}
      </div>
    </div>
  );
}

export default App;
