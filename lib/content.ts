import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { GalleryImage, WritingPost, CONTENT_DIRS, GalleryCategory, WritingCategory, TagConfig, ALLOWED_IMAGE_EXTS, MAX_FILE_SIZE } from './content-types';

// Re-export constants for API routes
export { ALLOWED_IMAGE_EXTS, MAX_FILE_SIZE, CONTENT_DIRS } from './content-types';

// Ensure content directories exist
function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

ensureDir(CONTENT_DIRS.gallery);
ensureDir(CONTENT_DIRS.writings);
ensureDir(CONTENT_DIRS.publicGallery);
ensureDir(CONTENT_DIRS.publicWritings);
ensureDir(CONTENT_DIRS.tags);

/**
 * Tag configuration file path
 */
const TAGS_CONFIG_FILE = path.join(CONTENT_DIRS.tags, 'tags.json');

/**
 * Read tag configuration
 */
export function getTagConfig(): TagConfig[] {
  if (!fs.existsSync(TAGS_CONFIG_FILE)) {
    return [];
  }
  try {
    const content = fs.readFileSync(TAGS_CONFIG_FILE, 'utf-8');
    return JSON.parse(content) as TagConfig[];
  } catch {
    return [];
  }
}

/**
 * Save tag configuration
 */
export function saveTagConfig(tags: TagConfig[]): void {
  fs.writeFileSync(TAGS_CONFIG_FILE, JSON.stringify(tags, null, 2));
}

/**
 * Get all tags sorted by order
 */
export function getSortedTags(): TagConfig[] {
  return getTagConfig().sort((a, b) => a.order - b.order);
}

/**
 * Get tag config by name
 */
export function getTagConfigByName(name: string): TagConfig | undefined {
  return getTagConfig().find(t => t.name === name);
}

/**
 * Create or update a tag
 */
export function upsertTagConfig(tag: TagConfig): void {
  const tags = getTagConfig();
  const existingIndex = tags.findIndex(t => t.name === tag.name);
  if (existingIndex >= 0) {
    tags[existingIndex] = tag;
  } else {
    tags.push(tag);
  }
  saveTagConfig(tags);
}

/**
 * Delete a tag
 */
export function deleteTagConfig(name: string): void {
  const tags = getTagConfig().filter(t => t.name !== name);
  saveTagConfig(tags);
}

/**
 * Reorder tags
 */
export function reorderTags(tagNames: string[]): void {
  const tags = getTagConfig();
  const tagMap = new Map(tags.map(t => [t.name, t]));
  const reordered = tagNames.map((name, index) => {
    const tag = tagMap.get(name);
    if (tag) {
      return { ...tag, order: index };
    }
    return null;
  }).filter(Boolean) as TagConfig[];
  
  // Add any tags not in the reorder list (at the end)
  const existingNames = new Set(tagNames);
  for (const tag of tags) {
    if (!existingNames.has(tag.name)) {
      reordered.push({ ...tag, order: reordered.length });
    }
  }
  saveTagConfig(reordered);
}

/**
 * Read all gallery images with metadata
 */
export function getGalleryImages(): GalleryImage[] {
  const galleryDir = CONTENT_DIRS.gallery;
  if (!fs.existsSync(galleryDir)) return [];

  const files = fs.readdirSync(galleryDir).filter(f => f.endsWith('.json'));
  const images: GalleryImage[] = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(galleryDir, file), 'utf-8');
      const metadata = JSON.parse(content) as GalleryImage;
      const imagePath = path.join(CONTENT_DIRS.publicGallery, metadata.filename);
      if (fs.existsSync(imagePath)) {
        images.push(metadata);
      }
    } catch {
      // Skip invalid files
    }
  }

  return images.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999) || new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get gallery images by tag
 */
export function getGalleryImagesByTag(tag: string): GalleryImage[] {
  if (tag === 'all') return getGalleryImages();
  return getGalleryImages().filter(img => img.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase()));
}

/**
 * Get gallery images by category
 */
export function getGalleryImagesByCategory(category: string): GalleryImage[] {
  if (category === 'all') return getGalleryImages();
  return getGalleryImages().filter(img => img.category.toLowerCase() === category.toLowerCase());
}

/**
 * Get all gallery categories with counts
 */
export function getGalleryCategories(): GalleryCategory[] {
  const images = getGalleryImages();
  const categoryMap = new Map<string, { count: number; order: number }>();

  for (const img of images) {
    const cat = img.category.toLowerCase();
    const existing = categoryMap.get(cat);
    categoryMap.set(cat, { 
      count: (existing?.count || 0) + 1, 
      order: existing?.order ?? 0 
    });
  }

  return Array.from(categoryMap.entries())
    .map(([name, { count, order }]) => ({ name, count, order }))
    .sort((a, b) => a.order - b.order || b.count - a.count);
}

/**
 * Get a single gallery image by filename
 */
export function getGalleryImage(filename: string): GalleryImage | null {
  const metadataPath = path.join(CONTENT_DIRS.gallery, `${path.parse(filename).name}.json`);
  if (!fs.existsSync(metadataPath)) return null;

  try {
    const content = fs.readFileSync(metadataPath, 'utf-8');
    return JSON.parse(content) as GalleryImage;
  } catch {
    return null;
  }
}

/**
 * Read all writing posts
 */
export function getWritingPosts(publishedOnly = true): WritingPost[] {
  const writingsDir = CONTENT_DIRS.writings;
  if (!fs.existsSync(writingsDir)) return [];

  const files = fs.readdirSync(writingsDir).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
  const posts: WritingPost[] = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(writingsDir, file), 'utf-8');
      const { data, content: markdownContent } = matter(content);
      const slug = path.parse(file).name;

      const post: WritingPost = {
        slug,
        title: data.title || slug,
        description: data.description,
        category: data.category || 'general',
        tags: data.tags || [],
        date: data.date || new Date().toISOString(),
        published: data.published !== false,
        featured: data.featured,
        readingTime: data.readingTime,
        content: markdownContent,
        order: data.order,
      };

      if (!publishedOnly || post.published) {
        posts.push(post);
      }
    } catch {
      // Skip invalid files
    }
  }

  return posts.sort((a, b) => (a.order ?? 9999) - (b.order ?? 9999) || new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get writing posts by tag
 */
export function getWritingPostsByTag(tag: string, publishedOnly = true): WritingPost[] {
  if (tag === 'all') return getWritingPosts(publishedOnly);
  return getWritingPosts(publishedOnly).filter(p => p.tags.map(t => t.toLowerCase()).includes(tag.toLowerCase()));
}

/**
 * Get writing posts by category
 */
export function getWritingPostsByCategory(category: string, publishedOnly = true): WritingPost[] {
  if (category === 'all') return getWritingPosts(publishedOnly);
  return getWritingPosts(publishedOnly).filter(p => p.category.toLowerCase() === category.toLowerCase());
}

/**
 * Get all writing categories with counts
 */
export function getWritingCategories(publishedOnly = true): WritingCategory[] {
  const posts = getWritingPosts(publishedOnly);
  const categoryMap = new Map<string, { count: number; order: number }>();

  for (const post of posts) {
    const cat = post.category.toLowerCase();
    const existing = categoryMap.get(cat);
    categoryMap.set(cat, { 
      count: (existing?.count || 0) + 1, 
      order: existing?.order ?? 0 
    });
  }

  return Array.from(categoryMap.entries())
    .map(([name, { count, order }]) => ({ name, count, order }))
    .sort((a, b) => a.order - b.order || b.count - a.count);
}

/**
 * Get a single writing post by slug
 */
export function getWritingPost(slug: string): WritingPost | null {
  const filePath = path.join(CONTENT_DIRS.writings, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    const mdxPath = path.join(CONTENT_DIRS.writings, `${slug}.mdx`);
    if (!fs.existsSync(mdxPath)) return null;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const { data, content: markdownContent } = matter(content);

    return {
      slug,
      title: data.title || slug,
      description: data.description,
      category: data.category || 'general',
      tags: data.tags || [],
      date: data.date || new Date().toISOString(),
      published: data.published !== false,
      featured: data.featured,
      readingTime: data.readingTime,
      content: markdownContent,
      order: data.order,
    };
  } catch {
    return null;
  }
}

/**
 * Save gallery image metadata
 */
export function saveGalleryImage(metadata: GalleryImage): void {
  const metadataPath = path.join(CONTENT_DIRS.gallery, `${path.parse(metadata.filename).name}.json`);
  fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));
}

/**
 * Save writing post
 */
export function saveWritingPost(post: WritingPost): void {
  const filePath = path.join(CONTENT_DIRS.writings, `${post.slug}.md`);
  const frontmatter = {
    title: post.title,
    description: post.description,
    category: post.category,
    tags: post.tags,
    date: post.date,
    published: post.published,
    featured: post.featured,
    readingTime: post.readingTime,
    order: post.order,
  };

  const content = matter.stringify(post.content, frontmatter);
  fs.writeFileSync(filePath, content);
}

/**
 * Delete gallery image and metadata
 */
export function deleteGalleryImage(filename: string): void {
  const metadataPath = path.join(CONTENT_DIRS.gallery, `${path.parse(filename).name}.json`);
  const imagePath = path.join(CONTENT_DIRS.publicGallery, filename);

  if (fs.existsSync(metadataPath)) fs.unlinkSync(metadataPath);
  if (fs.existsSync(imagePath)) fs.unlinkSync(imagePath);
}

/**
 * Delete writing post
 */
export function deleteWritingPost(slug: string): void {
  const mdPath = path.join(CONTENT_DIRS.writings, `${slug}.md`);
  const mdxPath = path.join(CONTENT_DIRS.writings, `${slug}.mdx`);

  if (fs.existsSync(mdPath)) fs.unlinkSync(mdPath);
  if (fs.existsSync(mdxPath)) fs.unlinkSync(mdxPath);
}

/**
 * Calculate reading time from markdown content
 */
export function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

/**
 * Update order for gallery images
 */
export function updateGalleryImageOrder(filename: string, order: number): void {
  const metadata = getGalleryImage(filename);
  if (metadata) {
    metadata.order = order;
    saveGalleryImage(metadata);
  }
}

/**
 * Update order for writing posts
 */
export function updateWritingPostOrder(slug: string, order: number): void {
  const post = getWritingPost(slug);
  if (post) {
    post.order = order;
    saveWritingPost(post);
  }
}

/**
 * Bulk update gallery image orders
 */
export function bulkUpdateGalleryImageOrders(updates: { filename: string; order: number }[]): void {
  for (const { filename, order } of updates) {
    updateGalleryImageOrder(filename, order);
  }
}

/**
 * Bulk update writing post orders
 */
export function bulkUpdateWritingPostOrders(updates: { slug: string; order: number }[]): void {
  for (const { slug, order } of updates) {
    updateWritingPostOrder(slug, order);
  }
}