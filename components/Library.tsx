
import React, { useState, useMemo } from 'react';
import { Folder, Story, LibraryViewMode, Genre, StoryStatus } from '../types.ts';
import { Icons } from './Icon.tsx';
import { formatDate, countWords } from '../utils/storage.ts';

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
    <div className="flex flex-col h-full bg-ink-50 dark:bg-black">
      {/* Header Minimalista */}
      <div className="px-8 py-6 bg-white dark:bg-black border-b border-ink-200 dark:border-ink-800 sticky top-0 z-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-3">
             {currentFolderId && (
              <button 
                onClick={() => onNavigateFolder(currentFolder?.parentId || null)}
                className="p-1.5 rounded border border-ink-200 dark:border-ink-800 hover:bg-ink-100 dark:hover:bg-ink-900 text-ink-600 dark:text-ink-400 transition-colors"
                title="Subir nivel"
              >
                <Icons.UpLevel size={16} />
              </button>
            )}
            <div>
              <h1 className="text-3xl font-serif font-medium text-ink-900 dark:text-white tracking-tight">
                {currentFolder ? currentFolder.name : 'Estudio'}
              </h1>
              <p className="text-xs text-ink-500 font-mono mt-1 uppercase tracking-widest">
                {filteredStories.length} Proyectos {currentFolder ? 'en esta carpeta' : ''}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
             <div className="relative flex-1 md:w-64">
               <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ink-400" size={14} />
               <input 
                 type="text"
                 placeholder="Buscar historias..."
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 className="w-full pl-9 pr-3 py-2 bg-ink-50 dark:bg-ink-900 border border-ink-200 dark:border-ink-800 rounded-md text-sm focus:outline-none focus:border-ink-400 dark:focus:border-ink-600 text-ink-900 dark:text-ink-100 transition-colors"
               />
             </div>
             <button 
              onClick={() => setViewMode(viewMode === 'GRID' ? 'LIST' : 'GRID')}
              className="p-2 border border-ink-200 dark:border-ink-800 rounded-md hover:bg-ink-100 dark:hover:bg-ink-900 text-ink-600 dark:text-ink-400 transition-colors"
              title={viewMode === 'GRID' ? "Vista Lista" : "Vista Cuadrícula"}
            >
              {viewMode === 'GRID' ? <Icons.List size={18} /> : <Icons.Grid size={18} />}
            </button>
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
           <button 
             onClick={() => setFilterGenre('')}
             className={`px-3 py-1 text-xs uppercase tracking-wider font-medium border rounded-md transition-colors ${
               filterGenre === '' 
               ? 'bg-ink-900 text-white dark:bg-white dark:text-black border-ink-900 dark:border-white' 
               : 'bg-transparent text-ink-500 border-transparent hover:border-ink-200 dark:hover:border-ink-800'
             }`}
           >
             Todo
           </button>
           {Object.values(Genre).map(g => (
             <button
               key={g}
               onClick={() => setFilterGenre(g)}
               className={`px-3 py-1 text-xs uppercase tracking-wider font-medium border rounded-md whitespace-nowrap transition-colors ${
                 filterGenre === g 
                 ? 'bg-ink-900 text-white dark:bg-white dark:text-black border-ink-900 dark:border-white' 
                 : 'bg-transparent text-ink-500 border-transparent hover:border-ink-200 dark:hover:border-ink-800'
               }`}
             >
               {g}
             </button>
           ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 relative pb-20">
        
        {filteredStories.length === 0 && filteredFolders.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 border border-dashed border-ink-200 dark:border-ink-800 rounded-lg">
             <div className="p-4 rounded-full bg-ink-100 dark:bg-ink-900 mb-4 text-ink-400">
               <Icons.Pen size={32} strokeWidth={1} />
             </div>
             <p className="text-ink-500 font-serif text-lg">El lienzo está vacío.</p>
             <p className="text-sm text-ink-400 mt-2">Crea una carpeta o comienza una nueva historia.</p>
          </div>
        )}

        {filteredFolders.length > 0 && (
          <div className="mb-10 animate-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-xs font-bold text-ink-400 mb-4 uppercase tracking-widest pl-1">Carpetas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredFolders.map(folder => (
                <div 
                  key={folder.id}
                  onClick={() => onNavigateFolder(folder.id)}
                  className="group relative flex flex-col justify-between p-5 h-32 border border-ink-200 dark:border-ink-800 bg-white dark:bg-ink-900 hover:border-ink-400 dark:hover:border-ink-600 rounded-sm cursor-pointer transition-all duration-200"
                >
                  <div className="text-ink-800 dark:text-ink-200">
                    <Icons.Folder size={28} strokeWidth={1} />
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-medium text-ink-900 dark:text-ink-100 truncate w-full pr-4">
                      {folder.name}
                    </span>
                  </div>
                  <button 
                    onClick={(e) => { e.stopPropagation(); onDeleteFolder(folder.id); }}
                    className="absolute top-2 right-2 p-1.5 text-ink-300 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all"
                    title="Eliminar carpeta"
                  >
                    <Icons.Delete size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {filteredStories.length > 0 && (
           <div className="animate-in slide-in-from-bottom-4 duration-700">
             <h2 className="text-xs font-bold text-ink-400 mb-4 uppercase tracking-widest pl-1">Manuscritos</h2>
             <div className={viewMode === 'GRID' 
               ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" 
               : "flex flex-col gap-0 border-t border-ink-200 dark:border-ink-800"
             }>
               {filteredStories.map(story => {
                 const wordCount = story.pages.reduce((acc, p) => acc + countWords(p.content), 0);
                 
                 if (viewMode === 'LIST') {
                    return (
                      <div 
                        key={story.id}
                        onClick={() => onOpenStory(story.id)}
                        className="group flex items-center justify-between py-4 border-b border-ink-200 dark:border-ink-800 hover:bg-ink-50 dark:hover:bg-ink-900 px-4 cursor-pointer transition-colors"
                      >
                         <div className="flex items-center gap-6 flex-1">
                           <div className="w-8 h-10 border border-ink-300 dark:border-ink-700 bg-white dark:bg-ink-950 flex items-center justify-center shadow-sm">
                              <span className="text-[10px] font-serif text-ink-400">Aa</span>
                           </div>
                           <div className="flex-1">
                              <h3 className="text-base font-medium text-ink-900 dark:text-white font-serif">{story.title}</h3>
                              <div className="flex items-center gap-2 text-xs text-ink-500 mt-1">
                                <span className={`w-2 h-2 rounded-full ${
                                  story.status === StoryStatus.Finished ? 'bg-ink-800 dark:bg-ink-200' : 
                                  story.status === StoryStatus.InProgress ? 'bg-ink-400' : 'border border-ink-400'
                                }`}></span>
                                <span className="uppercase tracking-wide">{story.status}</span>
                                <span className="text-ink-300">•</span>
                                <span>{formatDate(story.updatedAt)}</span>
                              </div>
                           </div>
                         </div>
                         <div className="flex items-center gap-4">
                            <span className="text-xs font-mono text-ink-400 w-24 text-right">{wordCount} pal.</span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => { e.stopPropagation(); onShareStory(story.id); }}
                                className="p-1.5 text-ink-400 hover:text-ink-900 dark:hover:text-white"
                                title="Compartir enlace"
                              >
                                <Icons.Share size={14} />
                              </button>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const folderIdInput = window.prompt("Mover a ID de Carpeta (vacío para raíz):", "");
                                  if (folderIdInput !== null) onMoveStory(story.id, folderIdInput.trim() === "" ? null : folderIdInput.trim());
                                }}
                                className="p-1.5 text-ink-400 hover:text-ink-900 dark:hover:text-white"
                                title="Mover carpeta"
                              >
                                <Icons.Move size={14} />
                              </button>
                              <button 
                                onClick={(e) => { e.stopPropagation(); onDeleteStory(story.id); }}
                                className="p-1.5 text-ink-400 hover:text-red-600"
                                title="Eliminar historia"
                              >
                                <Icons.Delete size={14} />
                              </button>
                            </div>
                         </div>
                      </div>
                    );
                 }

                 return (
                   <div 
                    key={story.id}
                    onClick={() => onOpenStory(story.id)}
                    className="group bg-white dark:bg-ink-900 border border-ink-200 dark:border-ink-800 hover:border-ink-400 dark:hover:border-ink-600 hover:shadow-card transition-all cursor-pointer rounded-sm flex flex-col h-[280px] animate-in zoom-in-95 duration-300"
                   >
                      <div className="flex-1 p-6 flex flex-col relative">
                        <div className={`absolute top-0 left-0 w-full h-1 ${
                           story.status === StoryStatus.Finished ? 'bg-ink-900 dark:bg-white' : 
                           story.status === StoryStatus.InProgress ? 'bg-ink-400' : 'bg-transparent'
                        }`}></div>

                        <div className="mb-4">
                          <h3 className="text-xl font-serif font-medium text-ink-900 dark:text-ink-100 line-clamp-2 leading-tight">
                            {story.title}
                          </h3>
                          <div className="flex gap-1 mt-3 flex-wrap">
                            {story.genres.slice(0, 2).map(g => (
                              <span key={g} className="px-2 py-0.5 text-[10px] uppercase tracking-wider border border-ink-200 dark:border-ink-700 text-ink-500">
                                {g}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="mt-auto pt-4 border-t border-ink-100 dark:border-ink-800 flex justify-between items-end">
                          <div className="text-xs text-ink-400 font-mono">
                            <p>EDITADO: {formatDate(story.updatedAt)}</p>
                            <p className="mt-1">{wordCount} PALABRAS</p>
                          </div>
                        </div>

                        {/* Hover Actions */}
                        <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                           <button 
                             onClick={(e) => { e.stopPropagation(); onShareStory(story.id); }}
                             className="p-1.5 bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 hover:text-ink-900 dark:hover:text-white rounded-sm shadow-sm"
                             title="Copiar enlace"
                           >
                            <Icons.Share size={14} />
                          </button>
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               const fId = window.prompt("ID de la carpeta destino (deja vacío para raíz):", "");
                               if (fId !== null) onMoveStory(story.id, fId.trim() === "" ? null : fId.trim());
                             }}
                             className="p-1.5 bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 hover:text-ink-900 dark:hover:text-white rounded-sm shadow-sm"
                             title="Mover"
                           >
                            <Icons.Move size={14} />
                          </button>
                           <button 
                             onClick={(e) => {
                               e.stopPropagation();
                               onDeleteStory(story.id);
                             }}
                             className="p-1.5 bg-white dark:bg-ink-800 border border-ink-200 dark:border-ink-700 hover:border-red-500 hover:text-red-500 rounded-sm shadow-sm"
                             title="Eliminar"
                           >
                            <Icons.Delete size={14} />
                          </button>
                        </div>
                      </div>
                   </div>
                 );
               })}
             </div>
           </div>
        )}

        {/* Persistent Branding Footer */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[9px] font-mono text-ink-300 dark:text-ink-700 uppercase tracking-[0.4em] pointer-events-none">
          Created by SAM VERCE
        </div>
      </div>

      {/* Acciones flotantes minimalistas */}
      <div className="fixed bottom-8 right-8 flex flex-col gap-4 z-40">
        <button 
          onClick={onCreateFolder}
          className="group flex items-center justify-center w-12 h-12 bg-white dark:bg-ink-900 text-ink-900 dark:text-ink-100 border border-ink-300 dark:border-ink-600 rounded-full shadow-lg hover:scale-105 active:scale-95 transition-all"
          title="Nueva Carpeta"
        >
          <Icons.FolderPlus size={20} />
        </button>
        <button 
          onClick={onCreateStory}
          className="group flex items-center justify-center w-14 h-14 bg-ink-900 dark:bg-ink-100 text-white dark:text-black rounded-full shadow-xl hover:scale-105 active:scale-95 transition-all"
          title="Nueva Historia"
        >
          <Icons.Plus size={24} />
        </button>
      </div>
    </div>
  );
};
