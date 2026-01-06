
import React, { useState, useEffect } from 'react';
import { Story, Page, Genre, StoryStatus } from '../types';
import { Icons } from './Icon';
import { ALL_GENRES, ALL_STATUSES } from '../constants';
import { countWords } from '../utils/storage';

interface EditorProps {
  story: Story;
  onSave: (story: Story) => void;
  onClose: () => void;
  onShare: () => void;
}

export const Editor: React.FC<EditorProps> = ({ story: initialStory, onSave, onClose, onShare }) => {
  const [story, setStory] = useState<Story>(initialStory);
  const [activePageId, setActivePageId] = useState<string>(initialStory.pages[0]?.id || '');

  const activePage = story.pages.find(p => p.id === activePageId);

  useEffect(() => {
    const timer = setTimeout(() => onSave(story), 1000);
    return () => clearTimeout(timer);
  }, [story, onSave]);

  const handleUpdateContent = (content: string) => {
    setStory(prev => ({
      ...prev,
      updatedAt: Date.now(),
      pages: prev.pages.map(p => p.id === activePageId ? { ...p, content } : p)
    }));
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-black">
      <header className="flex items-center justify-between px-4 py-2 border-b border-ink-200 dark:border-ink-800">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2"><Icons.Back size={18} /></button>
          <h1 className="font-serif font-bold text-sm truncate max-w-[200px]">{story.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onShare} className="p-2 text-ink-500"><Icons.Share size={18} /></button>
          <button onClick={() => onSave(story)} className="px-4 py-1.5 bg-ink-900 dark:bg-white text-white dark:text-black text-xs font-bold uppercase tracking-widest rounded-sm">Guardar</button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 border-r border-ink-200 dark:border-ink-800 overflow-y-auto p-4 hidden md:block">
          <p className="text-[10px] font-mono uppercase text-ink-400 mb-4 tracking-widest">Capítulos</p>
          {story.pages.map((p, i) => (
            <div key={p.id} onClick={() => setActivePageId(p.id)} className={`p-3 cursor-pointer text-sm mb-1 rounded ${activePageId === p.id ? 'bg-ink-100 dark:bg-ink-900 font-bold' : 'text-ink-500'}`}>
              {i + 1}. {p.title}
            </div>
          ))}
        </aside>

        <main className="flex-1 p-8 md:p-12 overflow-y-auto">
          <div className="max-w-2xl mx-auto h-full flex flex-col">
            <input 
              className="text-3xl md:text-4xl font-serif font-bold bg-transparent outline-none mb-8"
              value={activePage?.title || ''}
              onChange={(e) => setStory(prev => ({ ...prev, pages: prev.pages.map(p => p.id === activePageId ? { ...p, title: e.target.value } : p) }))}
            />
            <textarea
              className="flex-1 w-full bg-transparent outline-none resize-none font-serif text-lg leading-relaxed text-ink-800 dark:text-ink-200"
              placeholder="Empieza a escribir..."
              value={activePage?.content || ''}
              onChange={(e) => handleUpdateContent(e.target.value)}
            />
          </div>
        </main>
      </div>
    </div>
  );
};
