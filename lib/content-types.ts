/**
 * Content types for Gallery and Writings
 * Frontmatter schema for markdown and image metadata
 */

export interface GalleryImage {
  filename: string;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  date: string;
  featured?: boolean;
  width?: number;
  height?: number;
  order?: number; // for manual ordering within tag/category
  url?: string; // public URL for externally hosted images (for example Google Drive)
  indexable?: boolean; // whether search engines should index this image
}

export interface WritingPost {
  slug: string;
  title: string;
  description?: string;
  category: string;
  tags: string[];
  date: string;
  published: boolean;
  featured?: boolean;
  readingTime?: string;
  content: string;
  order?: number; // for manual ordering within tag/category
}

export interface GalleryCategory {
  name: string;
  count: number;
  order?: number; // for manual category ordering
}

export interface WritingCategory {
  name: string;
  count: number;
  order?: number;
}

// Tag configuration for manual ordering
export interface TagConfig {
  name: string;
  displayName: string;
  description?: string;
  order: number; // global tag order
  color?: string; // optional color for UI
  icon?: string; // optional icon
}

// Content directories
export const CONTENT_DIRS = {
  gallery: 'content/gallery',
  writings: 'content/writings',
  publicGallery: 'public/gallery',
  publicWritings: 'public/writings',
  tags: 'content/tags', // tag configuration files
} as const;

// Allowed file types
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
export const ALLOWED_IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];
export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB