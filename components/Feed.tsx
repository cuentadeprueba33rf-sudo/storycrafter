
import React, { useState, useEffect } from 'react';
import { SupabaseClient } from '@supabase/supabase-js';
import { Icons } from './Icon';
import { Story, StoryStatus } from '../types';

interface FeedProps {
  onBack: () => void;
  onReadStory: (story: Story) => void;
  supabase: SupabaseClient;
}

export const Feed: React.FC<FeedProps> = ({ onBack, onReadStory, supabase }) => {
  const [stories, setStories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const fetchStories = async () => {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('public_stories')
      .select('*')
      .order('updated_at', { ascending: false });

    if (!error && data) {
      setStories(data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchStories();

    // Suscripción Real-time
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'public_stories' },
        (payload) => {
          fetchStories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = stories.filter(s => 
    s.title.toLowerCase().includes(filter.toLowerCase()) || 
    s.synopsis?.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-ink-50 dark:bg-black overflow-hidden">
      <header className="px-8 py-10 md:px-20 md:py-16 bg-white dark:bg-black border-b border-black/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="flex items-center gap-6">
          <button onClick={onBack} className="p-3 bg-black/5 dark:bg-white/5 rounded-2xl hover:scale-105 transition-transform">
            <Icons.Back size={20} />
          </button>
          <div>
            <h1 className="text-4xl md:text-5xl font-serif font-bold text-ink-900 dark:text-white tracking-tight">Explorar</h1>
            <p className="text-[10px] font-mono uppercase tracking-[0.4em] text-ink-400 mt-2">La Bóveda Comunitaria • {stories.length} Obras</p>
          </div>
        </div>
        
        <div className="relative w-full md:w-80">
           <Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-300" size={14} />
           <input 
             type="text" 
             placeholder="Buscar historias..."
             value={filter}
             onChange={(e) => setFilter(e.target.value)}
             className="w-full pl-11 pr-4 py-3 bg-black/5 dark:bg-white/5 border-none rounded-2xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
           />
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-8 md:p-20 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-30">
            <Icons.Zap size={32} className="animate-pulse mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest">Sincronizando el feed...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 opacity-30">
            <Icons.Globe size={48} className="mx-auto mb-6" />
            <p className="text-lg font-serif italic">El horizonte está vacío por ahora...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filtered.map(story => (
              <div 
                key={story.id} 
                onClick={() => {
                   const mappedStory: Story = {
                     id: story.id,
                     title: story.title,
                     synopsis: story.synopsis,
                     bible: '',
                     wordCountGoal: 0,
                     genres: story.genres || [],
                     status: story.status || StoryStatus.Draft,
                     folderId: null,
                     createdAt: new Date(story.updated_at).getTime(),
                     updatedAt: new Date(story.updated_at).getTime(),
                     pages: JSON.parse(story.content_json || '[]'),
                     characters: [],
                     authorName: story.author_name
                   };
                   onReadStory(mappedStory);
                }}
                className="group relative bg-white dark:bg-ink-900 p-8 rounded-[2.5rem] border border-black/5 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col"
              >
                <div className="absolute top-0 right-0 p-8">
                  <Icons.Eye size={16} className="text-ink-200 group-hover:text-amber-500 transition-colors" />
                </div>
                
                <div className="flex-1 space-y-4">
                  <span className="text-[8px] font-black uppercase tracking-widest text-amber-500">{story.author_name || 'Anónimo'}</span>
                  <h3 className="text-2xl font-serif font-bold leading-tight line-clamp-2">{story.title}</h3>
                  <p className="text-xs font-serif italic text-ink-400 line-clamp-3 leading-relaxed">
                    {story.synopsis || "Sin sinopsis disponible..."}
                  </p>
                </div>
                
                <div className="mt-8 pt-6 border-t border-black/5 flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {story.genres?.slice(0, 2).map((g: string) => (
                      <span key={g} className="text-[8px] font-mono uppercase tracking-widest opacity-40">{g}</span>
                    ))}
                  </div>
                  <Icons.Publish size={12} className="opacity-20" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
