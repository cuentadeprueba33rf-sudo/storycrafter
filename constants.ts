import { Genre, StoryStatus } from './types';

export const ALL_GENRES = Object.values(Genre);
export const ALL_STATUSES = Object.values(StoryStatus);

export const STORAGE_KEY = 'storycraft_data_v1';
export const PREF_KEY = 'storycraft_pref_v1';

export const ID_PREFIX = {
  STORY: 'story_',
  FOLDER: 'folder_',
  PAGE: 'page_',
};