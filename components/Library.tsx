
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
}

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
  onShareStory
}) => {
  const [viewMode, setViewMode] = useState<LibraryViewMode>('GRID');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGenre, setFilterGenre] = useState<string>('');
  
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
      const matchesGenre = filterGenre ? s.genres.includes(filterGenre as Genre) : true;
      return inCurrentFolder && matchesSearch && matchesGenre;
    });
  }, [stories, currentFolderId, searchQuery, filterGenre]);

  return (
    <div className="flex flex-col h-full">
      <div className="px-8 py-6 bg-white dark:bg-black border-b border-ink-200 dark:border-ink-800 sticky top-0 z-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
             {currentFolderId && (
              <button onClick={() => onNavigateFolder(currentFolder?.parentId || null)} className="p-1.5 border border-ink-200 dark:border-ink-800 rounded">
                <Icons.UpLevel size={16} />
              </button>
            )}
            <div>
              <h1 className="text-3xl font-serif font-medium">{currentFolder ? currentFolder.name : 'Estudio'}</h1>
              <p className="text-xs text-ink-500 font-mono mt-1 uppercase tracking-widest">{filteredStories.length} Manuscritos</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
             <div className="relative">
               <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" size={14} />
               <input 
                 type="text" 
                 placeholder="Buscar..." 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="pl-9 pr-3 py-2 bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-md text-sm outline-none"
               />
             </div>
             <button onClick={() => setViewMode(viewMode === 'GRID' ? 'LIST' : 'GRID')} className="p-2 border border-ink-200 dark:border-ink-800 rounded">
               {viewMode === 'GRID' ? <Icons.List size={18} /> : <Icons.Grid size={18} />}
             </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 pb-32">
        {filteredFolders.length > 0 && (
          <div className="mb-10">
            <h2 className="text-xs font-bold text-ink-400 mb-4 uppercase tracking-widest">Carpetas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredFolders.map(folder => (
                <div key={folder.id} onClick={() => onNavigateFolder(folder.id)} className="group relative p-5 h-32 border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 rounded-sm cursor-pointer hover:border-ink-400">
                  <Icons.Folder size={28} strokeWidth={1} />
                  <span className="mt-4 block text-sm font-medium truncate">{folder.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); }} className="absolute top-2 right-2 p-1 text-ink-300 hover:text-red-500 opacity-0 group-hover:opacity-100">
                    <Icons.Delete size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-xs font-bold text-ink-400 mb-4 uppercase tracking-widest">Historias</h2>
        <div className={viewMode === 'GRID' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" : "flex flex-col divide-y divide-ink-200 dark:divide-ink-800"}>
          {filteredStories.map(story => (
            <div key={story.id} onClick={() => onOpenStory(story.id)} className={`group cursor-pointer ${viewMode === 'GRID' ? 'p-6 bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-sm h-48 flex flex-col justify-between' : 'py-4 flex items-center justify-between hover:bg-ink-100 dark:hover:bg-ink-900 px-2'}`}>
              <div>
                <h3 className="font-serif text-lg font-medium">{story.title}</h3>
                <p className="text-xs text-ink-500 font-mono mt-1 uppercase">{formatDate(story.updatedAt)} • {story.status}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={(e) => { e.stopPropagation(); onShareStory(story.id); }} className="p-1.5 text-ink-400 hover:text-ink-900"><Icons.Share size={14} /></button>
                <button onClick={(e) => { e.stopPropagation(); onDeleteStory(story.id); }} className="p-1.5 text-ink-400 hover:text-red-500"><Icons.Delete size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-8 right-8 flex flex-col gap-4">
        <button onClick={onCreateFolder} className="w-12 h-12 bg-white dark:bg-ink-900 border border-ink-300 dark:border-ink-700 rounded-full flex items-center justify-center shadow-lg"><Icons.FolderPlus size={20} /></button>
        <button onClick={onCreateStory} className="w-14 h-14 bg-ink-900 dark:bg-white text-white dark:text-black rounded-full flex items-center justify-center shadow-xl"><Icons.Plus size={24} /></button>
      </div>
    </div>
  );
};
