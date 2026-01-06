
import React, { useState, useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Icons } from './Icon';
import { Story, StoryStatus } from '../types';

interface FeedProps {
  onBack: () => void;
  onReadStory: (story: Story) => void;
  supabase: SupabaseClient;
  isAdmin: boolean;
}

export const Feed: React.FC<FeedProps> = ({ onBack, onReadStory, supabase, isAdmin }) => {
  const [stories, setStories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchStories = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('public_stories')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error("Error al cargar feed:", error);
      } else if (data) {
        setStories(data);
      }
    } catch (e) {
      console.error("Error de conexión:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeletePost = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("¿Estás seguro de eliminar esta publicación de la comunidad?")) return;
    
    try {
      const { error } = await supabase
        .from('public_stories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert("Publicación eliminada correctamente.");
      fetchStories();
    } catch (err) {
      alert("Error al eliminar la publicación.");
      console.error(err);
    }
  };

  useEffect(() => {
    fetchStories();

    const channel = supabase
      .channel('feed-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'public_stories' },
        () => {
          fetchStories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = stories.filter(s => 
    s.title?.toLowerCase().includes(filter.toLowerCase()) || 
    s.synopsis?.toLowerCase().includes(filter.toLowerCase()) ||
    s.author_name?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-ink-50 dark:bg-black overflow-hidden">
      <header className="px-8 py-10 md:px-20 md:py-16 bg-white dark:bg-black border-b border-black/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-3 bg-black/5 dark:bg-white/5 rounded-2xl hover:scale-105 transition-transform text-ink-600 dark:text-ink-300">
            <Icons.Back size={20} />
          </button>
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-ink-900 dark:text-white tracking-tight">Comunidad</h1>
            <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-ink-400 mt-2">Relatos de otros autores en tiempo real</p>
          </div>
        </div>
        
        <div className="relative w-full md:w-80">
           <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" size={14} />
           <input 
             type="text" 
             placeholder="Buscar en la bóveda..."
             value={filter}
             onChange={(e) => setFilter(e.target.value)}
             className="w-full pl-11 pr-4 py-3 bg-black/5 dark:bg-white/5 border border-black/5 rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all"
           />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 md:p-20 custom-scrollbar bg-ink-50/50 dark:bg-zinc-950/50">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <Icons.Zap size={32} className="animate-pulse mb-4 text-amber-500" />
            <p className="text-[10px] font-black uppercase tracking-widest">Sincronizando feed global...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 opacity-30">
            <Icons.Globe size={48} className="mx-auto mb-6 text-ink-200" />
            <p className="text-lg font-serif italic">Todavía no hay ecos en la distancia...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filtered.map(story => (
              <div 
                key={story.id} 
                onClick={() => {
                   let pages = [];
                   try {
                     pages = typeof story.content_json === 'string' 
                       ? JSON.parse(story.content_json) 
                       : story.content_json || [];
                   } catch(e) { pages = []; }

                   const mappedStory: Story = {
                     id: story.id,
                     title: story.title,
                     synopsis: story.synopsis || '',
                     bible: '',
                     wordCountGoal: 0,
                     genres: story.genres || [],
                     status: story.status || StoryStatus.Draft,
                     folderId: 'temp_feed',
                     createdAt: new Date(story.updated_at).getTime(),
                     updatedAt: new Date(story.updated_at).getTime(),
                     pages: pages,
                     characters: [],
                     authorName: story.author_name
                   };
                   onReadStory(mappedStory);
                }}
                className={`group relative bg-white dark:bg-ink-900 p-10 rounded-[3rem] border shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-700 cursor-pointer overflow-hidden flex flex-col ${story.is_admin ? 'border-amber-500/30' : 'border-black/5'}`}
              >
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-1000"></div>
                
                <div className="relative z-10 flex-1 space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${story.is_admin ? 'bg-amber-500 animate-bounce' : 'bg-ink-400 animate-pulse'}`}></div>
                      <span className={`text-[9px] font-black uppercase tracking-[0.2em] flex items-center gap-1.5 ${story.is_admin ? 'text-amber-600' : 'text-ink-500'}`}>
                        {story.author_name || 'Anónimo'}
                        {story.is_admin && (
                           <div className="bg-amber-500 text-white rounded-full p-0.5 shadow-sm">
                             <Icons.Check size={6} strokeWidth={5} />
                           </div>
                        )}
                      </span>
                    </div>
                    {isAdmin && (
                      <button 
                        onClick={(e) => handleDeletePost(e, story.id)}
                        className="p-2 text-red-500 bg-red-50 dark:bg-red-950/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                        title="Eliminar publicación (Moderación)"
                      >
                        <Icons.Delete size={14} />
                      </button>
                    )}
                  </div>
                  <h3 className="text-2xl font-serif font-bold leading-tight line-clamp-2 text-ink-900 dark:text-white">{story.title}</h3>
                  <p className="text-xs font-serif italic text-ink-400 line-clamp-4 leading-relaxed opacity-80">
                    {story.synopsis || "Un misterio por descubrir..."}
                  </p>
                </div>
                
                <div className="relative z-10 mt-10 pt-6 border-t border-black/5 flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {story.genres?.slice(0, 1).map((g: string) => (
                      <span key={g} className="px-2 py-1 bg-black/5 dark:bg-white/5 rounded-md text-[8px] font-mono uppercase tracking-widest opacity-60">{g}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 opacity-20 group-hover:opacity-100 transition-opacity">
                    <span className="text-[8px] font-black uppercase tracking-widest">Leer</span>
                    <Icons.ChevronRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
