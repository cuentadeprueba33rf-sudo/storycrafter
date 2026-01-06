
import React, { useState, useMemo } from 'react';
import { Folder, Story, LibraryViewMode, Genre, StoryStatus } from '../types';
import { Icons } from './Icon';
import { formatDate, countWords } from '../utils/storage';

interface LibraryProps {
  stories: Story[];
  folders: Folder[];
  currentFolderId: string | null;
  onNavigateFolder: (folderId: string | null) => void;
  onCreateFolder: () => void;
  onCreateStory: () => void;
  onOpenStory: (storyId: string) => void;
  onDeleteStory: (storyId: string) => void;
  onDeleteFolder: (folderId: string) => void;
  onMoveStory: (storyId: string, targetFolderId: string | null) => void;
  onShareStory: (storyId: string) => void;
  onBackHome: () => void;
}

const StatusBadge: React.FC<{ status: StoryStatus }> = ({ status }) => {
  const styles = {
    [StoryStatus.Draft]: 'bg-ink-100 text-ink-500 border-ink-200 dark:bg-ink-800/40 dark:text-ink-400 dark:border-ink-700/50',
    [StoryStatus.InProgress]: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800/50',
    [StoryStatus.Finished]: 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/50',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${styles[status]}`}>
      {status}
    </span>
  );
};

export const Library: React.FC<LibraryProps> = ({
  stories,
  folders,
  currentFolderId,
  onNavigateFolder,
  onCreateFolder,
  onCreateStory,
  onOpenStory,
  onDeleteStory,
  onDeleteFolder,
  onMoveStory,
  onShareStory,
  onBackHome
}) => {
  const [viewMode, setViewMode] = useState<LibraryViewMode>('GRID');
  const [searchQuery, setSearchQuery] = useState('');
  
  const currentFolder = folders.find(f => f.id === currentFolderId);

  const filteredFolders = useMemo(() => {
    return folders.filter(f => f.parentId === currentFolderId && 
      f.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [folders, currentFolderId, searchQuery]);

  const filteredStories = useMemo(() => {
    return stories.filter(s => {
      const inCurrentFolder = s.folderId === currentFolderId;
      const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase());
      return inCurrentFolder && matchesSearch;
    });
  }, [stories, currentFolderId, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-ink-50 dark:bg-black/95">
      <div className="px-6 md:px-12 py-8 bg-white dark:bg-black border-b border-ink-200 dark:border-ink-800 sticky top-0 z-20 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBackHome} 
              className="p-2.5 bg-ink-900 dark:bg-white text-white dark:text-black rounded-xl hover:scale-110 transition-all shadow-lg group relative"
              title="Volver al Inicio"
            >
              <Icons.Home size={18} />
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-white text-[8px] font-black uppercase rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Inicio</div>
            </button>

             {currentFolderId && (
              <button 
                onClick={() => onNavigateFolder(currentFolder?.parentId || null)} 
                className="p-2.5 bg-ink-100 dark:bg-ink-900 text-ink-600 dark:text-ink-400 rounded-xl hover:scale-110 transition-transform border border-black/5"
                title="Subir Nivel"
              >
                <Icons.UpLevel size={18} />
              </button>
            )}
            
            <div className="ml-2">
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-ink-900 dark:text-white tracking-tight leading-none">
                {currentFolder ? currentFolder.name : 'Mi Biblioteca'}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <p className="text-[10px] text-ink-400 font-mono uppercase tracking-[0.2em]">{filteredStories.length} Manuscritos</p>
                <div className="w-1.5 h-1.5 bg-amber-500 rounded-full"></div>
                <p className="text-[10px] text-ink-400 font-mono uppercase tracking-[0.2em]">{filteredFolders.length} Carpetas</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
             <div className="relative flex-1 md:flex-none">
               <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" size={14} />
               <input 
                 type="text" 
                 placeholder="Buscar obra..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full md:w-64 pl-9 pr-4 py-2.5 bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-amber-500 transition-all"
               />
             </div>
             <button 
                onClick={() => setViewMode(viewMode === 'GRID' ? 'LIST' : 'GRID')} 
                className="p-2.5 bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-xl text-ink-600 dark:text-ink-400 hover:text-ink-900 dark:hover:text-white transition-colors"
             >
               {viewMode === 'GRID' ? <Icons.List size={20} /> : <Icons.Grid size={20} />}
             </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-12 pb-32 custom-scrollbar">
        {filteredFolders.length > 0 && (
          <div className="mb-12">
            <h2 className="text-[10px] font-black text-ink-400 mb-6 uppercase tracking-[0.3em]">Carpetas de Proyecto</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
              {filteredFolders.map(folder => (
                <div 
                  key={folder.id} 
                  onClick={() => onNavigateFolder(folder.id)} 
                  className="group relative p-5 bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-2xl cursor-pointer hover:border-ink-400 dark:hover:border-ink-600 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center"
                >
                  <div className="mb-4 p-3 bg-ink-50 dark:bg-black rounded-xl text-ink-400 group-hover:text-ink-900 dark:group-hover:text-white transition-colors">
                    <Icons.Folder size={24} strokeWidth={1.5} />
                  </div>
                  <span className="text-xs font-bold truncate w-full px-2">{folder.name}</span>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); }} 
                    className="absolute top-3 right-3 p-1.5 text-ink-200 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Icons.Delete size={12} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-[10px] font-black text-ink-400 mb-6 uppercase tracking-[0.3em]">Manuscritos Recientes</h2>
        
        {filteredStories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-ink-200 dark:border-ink-800 rounded-[3rem]">
            <Icons.Book size={48} className="text-ink-200 mb-4" />
            <p className="text-ink-400 font-serif italic text-lg text-center">No hay historias en esta sección.<br/><span className="text-sm font-sans not-italic font-bold text-ink-900 dark:text-white mt-2 inline-block">Crea tu primera obra maestra hoy.</span></p>
          </div>
        ) : (
          <div className={viewMode === 'GRID' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col gap-3"}>
            {filteredStories.map(story => {
              const words = story.pages.reduce((acc, p) => acc + countWords(p.content), 0);
              
              if (viewMode === 'GRID') {
                return (
                  <div 
                    key={story.id} 
                    onClick={() => onOpenStory(story.id)} 
                    className="group relative p-8 bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-[2.5rem] flex flex-col justify-between h-72 hover:-translate-y-1 hover:shadow-2xl hover:border-ink-900 dark:hover:border-white transition-all duration-500 overflow-hidden"
                  >
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-ink-50 dark:bg-black rounded-full opacity-50 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    
                    <div className="relative z-10">
                      <div className="flex justify-between items-start mb-6">
                        <StatusBadge status={story.status} />
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={(e) => { e.stopPropagation(); onShareStory(story.id); }} className="p-2 hover:bg-ink-100 dark:hover:bg-black rounded-full transition-colors"><Icons.Share size={14} /></button>
                          <button onClick={(e) => { e.stopPropagation(); onDeleteStory(story.id); }} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-ink-400 hover:text-red-500 rounded-full transition-colors"><Icons.Delete size={14} /></button>
                        </div>
                      </div>
                      <h3 className="font-serif text-2xl font-bold leading-tight text-ink-900 dark:text-white group-hover:text-ink-950 dark:group-hover:text-white mb-2 line-clamp-2">
                        {story.title}
                      </h3>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {story.genres.slice(0, 2).map(g => (
                          <span key={g} className="text-[8px] font-mono text-ink-400 uppercase tracking-widest">{g}</span>
                        ))}
                      </div>
                    </div>

                    <div className="relative z-10 flex items-end justify-between border-t border-ink-100 dark:border-ink-800/50 pt-5 mt-auto">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-mono text-ink-400 uppercase tracking-widest mb-1">Último cambio</span>
                        <span className="text-[10px] font-bold text-ink-700 dark:text-ink-400 uppercase">{formatDate(story.updatedAt)}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-ink-50 dark:bg-black rounded-xl">
                        <Icons.Pen size={10} className="text-ink-400" />
                        <span className="text-[10px] font-black text-ink-900 dark:text-white">{words}</span>
                      </div>
                    </div>
                  </div>
                );
              } else {
                return (
                  <div 
                    key={story.id} 
                    onClick={() => onOpenStory(story.id)} 
                    className="group flex items-center justify-between p-5 bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-2xl hover:border-ink-900 dark:hover:border-white transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-center gap-6 overflow-hidden">
                      <div className="hidden sm:flex p-3 bg-ink-50 dark:bg-black rounded-xl text-ink-400">
                        <Icons.File size={20} strokeWidth={1.5} />
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="font-serif text-lg font-bold text-ink-900 dark:text-white truncate">{story.title}</h3>
                        <div className="flex items-center gap-3 mt-1 overflow-hidden">
                          <StatusBadge status={story.status} />
                          <span className="text-[10px] font-mono text-ink-400 uppercase tracking-widest whitespace-nowrap">{formatDate(story.updatedAt)}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 ml-4">
                      <button onClick={(e) => { e.stopPropagation(); onShareStory(story.id); }} className="p-2 text-ink-400 hover:text-ink-900 dark:hover:text-white transition-colors"><Icons.Share size={16} /></button>
                      <button onClick={(e) => { e.stopPropagation(); onDeleteStory(story.id); }} className="p-2 text-ink-400 hover:text-red-500 transition-colors"><Icons.Delete size={16} /></button>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>

      <div className="fixed bottom-10 right-10 flex flex-col gap-4 z-40">
        <button 
          onClick={onCreateFolder} 
          className="group w-14 h-14 bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-[1.5rem] flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
          title="Nueva Carpeta"
        >
          <Icons.FolderPlus size={22} />
        </button>
        <button 
          onClick={onCreateStory} 
          className="group w-16 h-16 bg-ink-900 dark:bg-white text-white dark:text-black rounded-[1.8rem] flex items-center justify-center shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:scale-110 active:scale-95 transition-all"
          title="Nuevo Manuscrito"
        >
          <Icons.Plus size={28} />
        </button>
      </div>
    </div>
  );
};
