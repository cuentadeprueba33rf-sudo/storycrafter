
import { Story, Folder, Page, Genre, StoryStatus } from '../types';
import { STORAGE_KEY, ID_PREFIX } from '../constants';

export interface AppData {
  stories: Story[];
  folders: Folder[];
}

const DEFAULT_DATA: AppData = {
  stories: [],
  folders: [],
};

export const loadData = (): AppData => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_DATA;
    return JSON.parse(raw);
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
  // Eliminar etiquetas HTML para contar solo texto real
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
