export interface Tool {
  _id?: string;
  name: string;
  url: string;
  description: string;
  tags: string[];
  category?: string;
  addedDate?: string;
  clickCount?: number;
  lastClicked?: string;
  views?: number;
  isFavorite?: boolean;
}

export interface Category {
  name: string;
  id: string; // slug
  tools: Tool[];
}

export interface Tag {
  name: string;
  count: number;
}
