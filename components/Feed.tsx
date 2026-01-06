
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
    // Nota: Aquí se conectaría con una tabla de likes en Supabase en una implementación real
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
      {/* Header Social Estilo Premium */}
      <header className="px-8 py-8 md:px-20 border-b border-black/5 dark:border-white/5 bg-white/80 dark:bg-black/80 backdrop-blur-xl sticky top-0 z-50 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-6 w-full md:w-auto">
          <button onClick={onBack} className="p-3 bg-black/5 dark:bg-white/5 rounded-2xl hover:scale-110 transition-all text-ink-900 dark:text-white border border-black/5">
            <Icons.Back size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-serif font-black tracking-tighter text-ink-900 dark:text-white">Explorar Ecos</h1>
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-amber-500">Comunidad Global de Autores</p>
          </div>
        </div>
        
        <div className="relative w-full md:w-96 group">
           <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-300 group-focus-within:text-amber-500 transition-colors" size={14} />
           <input 
             type="text" 
             placeholder="Buscar historias o autores..."
             value={filter}
             onChange={(e) => setFilter(e.target.value)}
             className="w-full pl-12 pr-4 py-3.5 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 outline-none transition-all placeholder:opacity-30"
           />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 md:p-20 custom-scrollbar">
        <div className="max-w-4xl mx-auto space-y-12">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-40 gap-4 opacity-40">
              <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-[10px] font-black uppercase tracking-[0.4em]">Sintonizando Frecuencias...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-40 opacity-20">
              <Icons.Globe size={64} className="mx-auto mb-8" />
              <p className="text-2xl font-serif italic">El silencio domina el feed...</p>
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
                className={`group relative bg-white dark:bg-zinc-900/40 rounded-[2.5rem] border transition-all duration-500 overflow-hidden hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.15)] flex flex-col ${story.is_admin ? 'border-amber-500/20' : 'border-black/5 dark:border-white/5'}`}
              >
                {/* Cabecera del Autor (Estilo Instagram/Social) */}
                <div className="px-8 py-6 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-serif text-lg font-black shadow-lg ${story.is_admin ? 'bg-gradient-to-br from-amber-400 to-amber-600' : 'bg-ink-900 dark:bg-zinc-800'}`}>
                      {story.author_name?.[0] || 'A'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black uppercase tracking-widest text-ink-900 dark:text-white">
                          {story.author_name || 'Anónimo'}
                        </span>
                        {story.is_admin && <Icons.Check size={10} className="text-amber-500" strokeWidth={5} />}
                      </div>
                      <span className="text-[9px] font-mono opacity-40 uppercase tracking-widest">Publicado hace poco</span>
                    </div>
                  </div>
                  {isAdmin && (
                    <button onClick={(e) => { e.stopPropagation(); /* Logic for delete */ }} className="p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Icons.More size={18} />
                    </button>
                  )}
                </div>

                {/* Contenido de la Historia */}
                <div className="px-10 pb-4 space-y-4">
                  <h2 className="text-3xl md:text-4xl font-serif font-black italic leading-tight text-ink-900 dark:text-white group-hover:text-amber-500 transition-colors">
                    {story.title}
                  </h2>
                  <p className="text-base font-serif italic text-ink-500 dark:text-zinc-400 leading-relaxed line-clamp-3">
                    {story.synopsis || "Una historia que aguarda ser descubierta en la profundidad de la biblioteca comunitaria."}
                  </p>
                </div>

                {/* Footer Social (Interacciones) */}
                <div className="px-8 py-6 mt-4 border-t border-black/5 dark:border-white/5 bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <button 
                      onClick={(e) => toggleLike(e, story.id)}
                      className={`flex items-center gap-2 group/btn transition-all ${likedStories.has(story.id) ? 'text-red-500' : 'text-ink-400 hover:text-red-500'}`}
                    >
                      <div className={`p-2.5 rounded-xl transition-all ${likedStories.has(story.id) ? 'bg-red-500/10 scale-110' : 'bg-black/5 dark:bg-white/5'}`}>
                        <Icons.Heart size={18} fill={likedStories.has(story.id) ? "currentColor" : "none"} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">{likedStories.has(story.id) ? 1 : 0}</span>
                    </button>

                    <div className="flex items-center gap-2 text-ink-400">
                      <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5">
                        <Icons.Comment size={18} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">0</span>
                    </div>

                    <div className="flex items-center gap-2 text-ink-400 hover:text-amber-500 transition-colors">
                      <div className="p-2.5 rounded-xl bg-black/5 dark:bg-white/5">
                        <Icons.Share size={18} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="hidden sm:flex flex-col items-end">
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40">Lectura</span>
                      <span className="text-[10px] font-mono font-bold text-ink-900 dark:text-white">{calculateReadTime(story.content_json)}</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-ink-900 dark:bg-white text-white dark:text-black flex items-center justify-center group-hover:rotate-12 transition-transform shadow-lg">
                      <Icons.ChevronRight size={18} />
                    </div>
                  </div>
                </div>
              </article>
            ))
          )}
          
          <div className="py-20 text-center">
            <div className="inline-block p-4 rounded-full bg-black/5 dark:bg-white/5 border border-black/5">
               <Icons.Zap size={24} className="text-amber-500" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] mt-6 opacity-30">Has llegado al final de los ecos recientes</p>
          </div>
        </div>
      </div>
    </div>
  );
};
