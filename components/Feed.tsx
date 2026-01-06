
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
  const [likedStories, setLikedStories] = useState<Set<string>>(new Set());

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

  useEffect(() => {
    fetchStories();
    const channel = supabase
      .channel('feed-updates')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'public_stories' }, () => fetchStories())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const toggleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newLiked = new Set(likedStories);
    if (newLiked.has(id)) newLiked.delete(id);
    else newLiked.add(id);
    setLikedStories(newLiked);
  };

  const calculateReadTime = (pages: any) => {
    let content = "";
    try {
      const parsed = typeof pages === 'string' ? JSON.parse(pages) : pages;
      content = parsed.map((p: any) => p.content).join(" ");
    } catch (e) { content = ""; }
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
    return minutes < 1 ? '1 min' : `${minutes} min`;
  };

  const filtered = stories.filter(s => 
    s.title?.toLowerCase().includes(filter.toLowerCase()) || 
    s.author_name?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-ink-50 dark:bg-black overflow-hidden font-sans">
      {/* Header Social Estilo Premium - Responsive */}
      <header className="px-6 py-6 md:px-20 border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-black/80 backdrop-blur-xl sticky top-0 z-50 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6">
        <div className="flex items-center gap-4 md:gap-6 w-full md:w-auto">
          <button onClick={onBack} className="p-2.5 bg-black/5 dark:bg-white/5 rounded-xl hover:scale-110 transition-all text-ink-900 dark:text-white border border-black/5">
            <Icons.Back size={18} />
          </button>
          <div>
            <h1 className="text-xl md:text-2xl font-serif font-black tracking-tighter text-ink-900 dark:text-white leading-none">Explorar Ecos</h1>
            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-amber-500 mt-1">Comunidad Global</p>
          </div>
        </div>
        
        <div className="relative w-full md:w-96 group">
           <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-300 group-focus-within:text-amber-500 transition-colors" size={14} />
           <input 
             type="text" 
             placeholder="Buscar historias..."
             value={filter}
             onChange={(e) => setFilter(e.target.value)}
             className="w-full pl-11 pr-4 py-3 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl md:rounded-2xl text-xs md:text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder:opacity-30"
           />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 md:p-20 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-6 md:space-y-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-40">
              <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[9px] font-black uppercase tracking-[0.4em]">Sintonizando...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-40 opacity-20">
              <Icons.Globe size={48} className="mx-auto mb-6" />
              <p className="text-xl font-serif italic">El silencio domina el feed...</p>
            </div>
          ) : (
            filtered.map(story => (
              <article 
                key={story.id}
                onClick={() => {
                   let pages = [];
                   try { pages = typeof story.content_json === 'string' ? JSON.parse(story.content_json) : story.content_json || []; } catch(e) { pages = []; }
                   onReadStory({
                     ...story,
                     pages: pages,
                     authorName: story.author_name,
                     createdAt: new Date(story.updated_at).getTime()
                   });
                }}
                className={`group relative bg-white dark:bg-zinc-900/40 rounded-[1.5rem] md:rounded-[2.5rem] border transition-all duration-500 overflow-hidden hover:shadow-xl flex flex-col ${story.is_admin ? 'border-amber-500/20' : 'border-black/5 dark:border-white/5'}`}
              >
                {/* Cabecera del Autor */}
                <div className="px-6 py-4 md:px-8 md:py-6 flex items-center justify-between">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className={`w-9 h-9 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center text-white font-serif text-sm md:text-lg font-black shadow-lg ${story.is_admin ? 'bg-gradient-to-br from-amber-400 to-amber-600' : 'bg-ink-900 dark:bg-zinc-800'}`}>
                      {story.author_name?.[0] || 'A'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-ink-900 dark:text-white">
                          {story.author_name || 'Anónimo'}
                        </span>
                        {story.is_admin && <Icons.Check size={10} className="text-amber-500" strokeWidth={5} />}
                      </div>
                      <span className="text-[8px] font-mono opacity-40 uppercase tracking-widest">Hace poco</span>
                    </div>
                  </div>
                </div>

                {/* Contenido */}
                <div className="px-6 md:px-10 pb-2 space-y-2 md:space-y-4">
                  <h2 className="text-xl md:text-4xl font-serif font-black italic leading-tight text-ink-900 dark:text-white group-hover:text-amber-500 transition-colors">
                    {story.title}
                  </h2>
                  <p className="text-xs md:text-base font-serif italic text-ink-500 dark:text-zinc-400 leading-relaxed line-clamp-2 md:line-clamp-3">
                    {story.synopsis || "Una historia que aguarda ser descubierta en la profundidad de la biblioteca comunitaria."}
                  </p>
                </div>

                {/* Footer Interacciones */}
                <div className="px-6 py-4 md:px-8 md:py-6 mt-2 border-t border-black/5 dark:border-white/5 bg-black/[0.01] dark:bg-white/[0.01] flex items-center justify-between">
                  <div className="flex items-center gap-4 md:gap-6">
                    <button 
                      onClick={(e) => toggleLike(e, story.id)}
                      className={`flex items-center gap-2 group/btn transition-all ${likedStories.has(story.id) ? 'text-red-500' : 'text-ink-400 hover:text-red-500'}`}
                    >
                      <div className={`p-2 rounded-lg md:p-2.5 md:rounded-xl transition-all ${likedStories.has(story.id) ? 'bg-red-500/10 scale-110' : 'bg-black/5 dark:bg-white/5'}`}>
                        <Icons.Heart size={16} fill={likedStories.has(story.id) ? "currentColor" : "none"} className="md:w-[18px] md:h-[18px]" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest">{likedStories.has(story.id) ? 1 : 0}</span>
                    </button>

                    <div className="flex items-center gap-2 text-ink-400">
                      <div className="p-2 rounded-lg md:p-2.5 md:rounded-xl bg-black/5 dark:bg-white/5">
                        <Icons.Comment size={16} className="md:w-[18px] md:h-[18px]" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest">0</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="hidden xs:flex flex-col items-end">
                      <span className="text-[7px] font-black uppercase tracking-[0.2em] opacity-40">LECTURA</span>
                      <span className="text-[9px] font-mono font-bold text-ink-900 dark:text-white">{calculateReadTime(story.content_json)}</span>
                    </div>
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-ink-900 dark:bg-white text-white dark:text-black flex items-center justify-center shadow-lg">
                      <Icons.ChevronRight size={16} />
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
