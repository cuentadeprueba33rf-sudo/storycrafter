
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
import { AdminPanel } from './components/AdminPanel';
import { Icons } from './components/Icon';

const supabase = createClient(
  "https://hnhhklgfirvlrvivnzva.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhuaGhrbGdmaXJ2bHJ2aXZuenZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3MjQ2NTcsImV4cCI6MjA4MzMwMDY1N30.bhtmLRhKX0uzHEaFnui71Gvt89eXncA3lpzEfHUoxS4"
);

const ADMIN_EMAIL = "samuelcasseresbx@gmail.com";

function App() {
  const [data, setData] = useState<AppData>({ stories: [], folders: [], cloudImages: [] });
  const [view, setView] = useState<ViewMode>('HOME');
  const [activeStoryId, setActiveStoryId] = useState<string | null>(null);
  const [communityStory, setCommunityStory] = useState<Story | null>(null);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [editorTheme, setEditorTheme] = useState<EditorTheme>('LIGHT');
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [showAuth, setShowAuth] = useState(false);

  const isAdmin = session?.user?.email === ADMIN_EMAIL;

  // 1. Escuchar cambios de autenticación
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // 2. Reaccionar al cambio de sesión: CARGAR DATOS ESPECÍFICOS
  useEffect(() => {
    setIsLoading(true);
    const userId = session?.user?.id;
    
    // Al cambiar de usuario o cerrar sesión:
    // - Cargamos los datos del nuevo usuario (o del invitado)
    // - Reseteamos la vista activa si cerramos sesión para evitar fugas de datos
    const loaded = loadData(userId);
    setData(loaded);
    
    if (!userId) {
      setView('HOME');
      setActiveStoryId(null);
      setCommunityStory(null);
    }

    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, [session]);

  // 3. Guardar datos solo cuando el estado de datos o la sesión cambian
  useEffect(() => {
    if (!isLoading) {
      saveData(data, session?.user?.id);
    }
  }, [data, isLoading, session]);

  // 4. Modo oscuro basado en contexto
  useEffect(() => {
    if ((view === 'EDITOR' && editorTheme === 'DARK') || view === 'ADMIN_USERS') {
      document.documentElement.classList.add('dark');
    } else if (view !== 'EDITOR' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
       document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [view, editorTheme]);

  const getDisplayName = () => {
    return session?.user?.user_metadata?.display_name || session?.user?.email?.split('@')[0] || "Invitado";
  };

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
      authorName: getDisplayName()
    };
    setData(prev => ({ ...prev, stories: [newStory, ...prev.stories] }));
    setActiveStoryId(newStory.id);
    setCommunityStory(null);
    setView('EDITOR');
  };

  const handleSaveStory = useCallback(async (updatedStory: Story) => {
    if (communityStory && updatedStory.id === communityStory.id) {
       setCommunityStory(updatedStory);
       return; 
    }

    setData(prev => ({
      ...prev,
      stories: prev.stories.map(s => s.id === updatedStory.id ? updatedStory : s)
    }));

    if (session) {
      if (updatedStory.isPublished) {
        try {
          const payload = {
            id: updatedStory.id,
            title: updatedStory.title,
            synopsis: updatedStory.synopsis,
            author_name: updatedStory.authorName,
            genres: updatedStory.genres,
            status: updatedStory.status,
            content_json: updatedStory.pages,
            updated_at: new Date().toISOString(),
            user_id: session.user.id,
            is_admin: isAdmin
          };
          await supabase.from('public_stories').upsert(payload, { onConflict: 'id' });
        } catch (e) {
          console.error("Error sincronizando con comunidad:", e);
        }
      } else {
        try {
          await supabase.from('public_stories').delete().eq('id', updatedStory.id);
        } catch (e) {}
      }
    }
  }, [session, isAdmin, communityStory]);

  const handleLogout = async () => {
    if(confirm("¿Seguro que deseas cerrar tu sesión de autor? Tus obras locales se guardarán de forma segura en este dispositivo.")) {
      await supabase.auth.signOut();
      // El useEffect de session se encargará del resto (limpiar datos y redirigir)
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#050505] text-white">
        <div className="flex flex-col items-center animate-pulse">
          <div className="mb-8 p-8 border border-white/5 rounded-[2.5rem] bg-white/[0.02]">
            <Icons.Pen size={40} strokeWidth={1} className="text-amber-500" />
          </div>
          <h1 className="text-2xl font-serif italic tracking-widest mb-3">Sincronizando Archivos</h1>
          <div className="text-[8px] font-mono uppercase tracking-[0.5em] text-white/20">Accediendo a la Bóveda del Autor</div>
        </div>
      </div>
    );
  }

  const activeStory = communityStory || data.stories.find(s => s.id === activeStoryId);

  return (
    <div className="flex h-screen overflow-hidden bg-[#050505]">
      {showAuth && <Auth supabase={supabase} onClose={() => setShowAuth(false)} />}
      
      <div className="flex-1 flex flex-col relative w-full overflow-hidden">
        {view === 'HOME' && (
          <Dashboard 
            onEnterStudio={() => setView('LIBRARY')} 
            onEnterExplore={() => setView('FEED')}
            onEnterAdmin={() => setView('ADMIN_USERS')}
            cloudImages={data.cloudImages}
            onUpdateCloud={handleUpdateCloud}
            session={session}
            onAuthOpen={() => setShowAuth(true)}
            onLogout={handleLogout}
            isAdmin={isAdmin}
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
              if(confirm("¿Borrar definitivamente este manuscrito?")) {
                setData(prev => ({ ...prev, stories: prev.stories.filter(s => s.id !== id) }));
                supabase.from('public_stories').delete().eq('id', id).then(() => {});
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
              alert("Enlace copiado.");
            }}
            onBackHome={() => setView('HOME')}
          />
        )}
        {view === 'FEED' && (
          <Feed 
            onBack={() => setView('HOME')}
            onReadStory={(story) => {
              setCommunityStory(story);
              setActiveStoryId(story.id);
              setView('EDITOR');
            }}
            supabase={supabase}
            isAdmin={isAdmin}
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
            isUserLoggedIn={!!session}
            readOnly={!!communityStory}
          />
        )}
        {view === 'ADMIN_USERS' && isAdmin && (
          <AdminPanel 
            supabase={supabase} 
            onBack={() => setView('HOME')} 
          />
        )}
      </div>
    </div>
  );
}

export default App;
