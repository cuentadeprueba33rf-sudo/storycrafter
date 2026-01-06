
export enum Genre {
  Comedy = 'Comedia',
  Thriller = 'Thriller',
  Horror = 'Terror',
  Action = 'Acción',
  Romance = 'Romance',
  Drama = 'Drama',
  Fantasy = 'Fantasía',
  SciFi = 'Ciencia Ficción',
  BL = 'BL',
  GL = 'GL',
  Mystery = 'Misterio',
  Adventure = 'Aventura',
  Historical = 'Histórica',
}

export enum StoryStatus {
  Draft = 'Borrador',
  InProgress = 'En Progreso',
  Finished = 'Finalizado',
}

export interface Character {
  id: string;
  name: string;
  image: string; // Base64 data
  description: string;
}

export interface CloudImage {
  id: string;
  data: string;
  name: string;
  size: number;
  createdAt: number;
}

export interface Page {
  id: string;
  title: string;
  content: string;
  order: number;
}

export interface Story {
  id: string;
  title: string;
  synopsis: string;
  bible: string;
  wordCountGoal: number;
  genres: Genre[];
  status: StoryStatus;
  folderId: string | null;
  createdAt: number;
  updatedAt: number;
  pages: Page[];
  characters: Character[];
  soundtrackUrl?: string;
  soundtrackData?: string;
  soundtrackName?: string;
  typewriterEnabled?: boolean;
  sprintMinutes?: number;
  isPublished?: boolean;
  authorName?: string;
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: number;
}

export type ViewMode = 'HOME' | 'LIBRARY' | 'EDITOR' | 'CHARACTERS' | 'FEED' | 'ADMIN_USERS';

export type LibraryViewMode = 'LIST' | 'GRID';

export type EditorTheme = 'LIGHT' | 'DARK' | 'SEPIA';
