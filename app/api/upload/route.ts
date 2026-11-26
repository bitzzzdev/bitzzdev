import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { saveGalleryImage, saveWritingPost, getTagConfig, upsertTagConfig, ALLOWED_IMAGE_EXTS, MAX_FILE_SIZE } from '@/lib/content';
import { calculateReadingTime } from '@/lib/content';
import path from 'path';
import fs from 'fs';
import { CONTENT_DIRS } from '@/lib/content-types';

// Use Vercel Blob in production, local filesystem in development
const IS_PRODUCTION = process.env.NODE_ENV === 'production' && process.env.VERCEL;

async function saveFileToStorage(filename: string, buffer: Buffer): Promise<string> {
  if (IS_PRODUCTION) {
    const { put } = await import('@vercel/blob');
    const blob = await put(filename, buffer, {
      access: 'public',
      addRandomSuffix: false,
    });
    return blob.url;
  } else {
    const filepath = path.join(CONTENT_DIRS.publicGallery, filename);
    fs.writeFileSync(filepath, buffer);
    return `/gallery/${filename}`;
  }
}

async function deleteFileFromStorage(filename: string): Promise<void> {
  if (IS_PRODUCTION) {
    const { del } = await import('@vercel/blob');
    // For Vercel Blob, we'd need the full URL or blob path
    // This is a simplified version - in practice you'd store the blob URL in metadata
    console.log('Would delete from Vercel Blob:', filename);
  } else {
    const filepath = path.join(CONTENT_DIRS.publicGallery, filename);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // On Vercel production, filesystem is read-only
    // Uploads should be done locally, then pushed via git
    if (IS_PRODUCTION) {
      return NextResponse.json({ 
        error: 'Upload not available on production. Use local development server for uploads, then push via Dashboard > Git Push.' 
      }, { status: 503 });
    }

    const formData = await request.formData();
    const type = formData.get('type') as string;

    if (type === 'gallery') {
      return handleGalleryUpload(formData);
    } else if (type === 'writing') {
      return handleWritingUpload(formData);
    } else if (type === 'tag') {
      return handleTagUpload(formData);
    } else if (type === 'reorder') {
      return handleReorder(formData);
    }

    return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleGalleryUpload(formData: FormData) {
  const file = formData.get('file') as File;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;
  const tags = JSON.parse(formData.get('tags') as string || '[]');
  const date = formData.get('date') as string || new Date().toISOString();

  if (!file || !title || !category) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Validate file type
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_IMAGE_EXTS.includes(ext)) {
    return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File too large' }, { status: 400 });
  }

  // Generate safe filename
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filename = `${timestamp}_${safeName}`;

  // Save file to storage (Vercel Blob in production, local in dev)
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileUrl = await saveFileToStorage(filename, buffer);

  // Save metadata
  const metadata = {
    filename,
    title,
    description,
    category,
    tags,
    date,
    featured: false,
    order: 0,
  };

  saveGalleryImage(metadata);

  // Ensure tags exist in config
  const existingTags = getTagConfig();
  for (const tag of tags) {
    if (!existingTags.find(t => t.name === tag)) {
      upsertTagConfig({
        name: tag,
        displayName: tag,
        order: existingTags.length,
      });
    }
  }

  return NextResponse.json({ success: true, filename, url: fileUrl });
}

async function handleWritingUpload(formData: FormData) {
  const slug = formData.get('slug') as string;
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const category = formData.get('category') as string;
  const tags = JSON.parse(formData.get('tags') as string || '[]');
  const date = formData.get('date') as string || new Date().toISOString();
  const published = formData.get('published') === 'true';
  const content = formData.get('content') as string;

  if (!slug || !title || !category || !content) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Validate slug
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: 'Invalid slug (use lowercase, numbers, hyphens only)' }, { status: 400 });
  }

  const readingTime = calculateReadingTime(content);

  const post = {
    slug,
    title,
    description,
    category,
    tags,
    date,
    published,
    featured: false,
    readingTime,
    content,
    order: 0,
  };

  saveWritingPost(post);

  // Ensure tags exist in config
  const existingTags = getTagConfig();
  for (const tag of tags) {
    if (!existingTags.find(t => t.name === tag)) {
      upsertTagConfig({
        name: tag,
        displayName: tag,
        order: existingTags.length,
      });
    }
  }

  return NextResponse.json({ success: true, slug });
}

async function handleTagUpload(formData: FormData) {
  const action = formData.get('action') as string;
  const name = formData.get('name') as string;
  const displayName = formData.get('displayName') as string;
  const description = formData.get('description') as string;
  const color = formData.get('color') as string;
  const icon = formData.get('icon') as string;
  const order = parseInt(formData.get('order') as string || '0');

  if (!name) {
    return NextResponse.json({ error: 'Tag name required' }, { status: 400 });
  }

  if (action === 'delete') {
    // Delete tag from config
    const tags = getTagConfig().filter(t => t.name !== name);
    fs.writeFileSync(path.join(CONTENT_DIRS.tags, 'tags.json'), JSON.stringify(tags, null, 2));
    return NextResponse.json({ success: true });
  }

  if (action === 'reorder') {
    const items = JSON.parse(formData.get('items') as string || '[]');
    const tagConfigs = getTagConfig();
    const tagMap = new Map(tagConfigs.map(t => [t.name, t]));
    const reordered = items.map((tagName: string, index: number) => {
      const tag = tagMap.get(tagName);
      if (tag) {
        return { ...tag, order: index };
      }
      return null;
    }).filter(Boolean) as typeof tagConfigs;
    
    const existingNames = new Set(items);
    for (const tag of tagConfigs) {
      if (!existingNames.has(tag.name)) {
        reordered.push({ ...tag, order: reordered.length });
      }
    }
    
    fs.writeFileSync(path.join(CONTENT_DIRS.tags, 'tags.json'), JSON.stringify(reordered, null, 2));
    return NextResponse.json({ success: true });
  }

  upsertTagConfig({
    name,
    displayName: displayName || name,
    description,
    color,
    icon,
    order,
  });

  return NextResponse.json({ success: true });
}

async function handleReorder(formData: FormData) {
  const items = JSON.parse(formData.get('items') as string || '[]');
  const contentType = formData.get('contentType') as string; // 'gallery' or 'writing'

  if (contentType === 'gallery') {
    const { bulkUpdateGalleryImageOrders } = await import('@/lib/content');
    bulkUpdateGalleryImageOrders(items);
  } else if (contentType === 'writing') {
    const { bulkUpdateWritingPostOrders } = await import('@/lib/content');
    bulkUpdateWritingPostOrders(items);
  } else {
    return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}