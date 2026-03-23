export interface User {
  id: string;
  name: string;
  email: string;
  storageUsed: number;
  storageLimit: number;
}

export interface FileItem {
  _id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  folder: string | null;
  isStarred: boolean;
  isTrashed: boolean;
  uniqueId: string;
  shareToken: string | null;
  downloadCount: number;
  createdAt: string;
}

export interface FolderItem {
  _id: string;
  name: string;
  parent: string | null;
  isStarred: boolean;
  isTrashed: boolean;
  createdAt: string;
}