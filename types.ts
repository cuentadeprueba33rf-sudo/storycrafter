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
  genres: Genre[];
  status: StoryStatus;
  folderId: string | null; // null means root
  createdAt: number;
  updatedAt: number;
  pages: Page[];
}

export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  createdAt: number;
}

export type ViewMode = 'HOME' | 'LIBRARY' | 'EDITOR';

export type LibraryViewMode = 'LIST' | 'GRID';