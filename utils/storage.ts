
import { Story, Folder, Page, Genre, StoryStatus, CloudImage } from '../types';
import { STORAGE_KEY, ID_PREFIX } from '../constants';

export interface AppData {
  stories: Story[];
  folders: Folder[];
  cloudImages: CloudImage[];
}

const DEFAULT_DATA: AppData = {
  stories: [],
  folders: [],
  cloudImages: [],
};

export const loadData = (): AppData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_DATA,
      ...parsed
    };
  } catch (e) {
    return DEFAULT_DATA;
  }
};

export const saveData = (data: AppData) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {}
};

export const generateId = (prefix: string): string => {
  return `${prefix}${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const countWords = (text: string): number => {
  const cleanText = text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleanText) return 0;
  return cleanText.split(/\s+/).length;
};

export const formatDate = (timestamp: number): string => {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(timestamp));
};

export const formatSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
