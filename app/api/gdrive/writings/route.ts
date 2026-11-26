import { NextRequest, NextResponse } from 'next/server';
import { getDriveClient, getFolderFiles, downloadFile, getFileMetadata } from '@/lib/gdrive/client';

/**
 * GET /api/gdrive/writings
 * Fetch all writings from Google Drive writings folder
 * Returns markdown content with frontmatter
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folderPath = 'writings';

    const drive = getDriveClient();

    // Get files from Google Drive (markdown files)
    const files = await getFolderFiles(folderPath, 'text/markdown');

    // Process each document
    const writings = await Promise.all(
      files.map(async (file) => {
        try {
          // Get metadata
          const metadata = await getFileMetadata(file.id || '');

          // Download file content
          const content = await downloadFile(file.id || '');

          // Parse frontmatter and content
          const parsed = parseMarkdownFrontmatter(content.toString('utf-8'), file.name);

          return {
            id: file.id || '',
            filename: file.name || '',
            mimeType: file.mimeType || '',
            createdTime: file.createdTime || '',
            modifiedTime: file.modifiedTime || '',
            webContentLink: file.webContentLink || '',
            webViewLink: file.webViewLink || '',
            downloaded: true,
            error: null,
            ...parsed,
          };
        } catch (error) {
          console.error(`Error processing writing ${file.name}:`, error);
          return {
            id: file.id || '',
            filename: file.name || '',
            mimeType: file.mimeType || '',
            createdTime: file.createdTime || '',
            modifiedTime: file.modifiedTime || '',
            webContentLink: file.webContentLink || '',
            webViewLink: file.webViewLink || '',
            downloaded: false,
            error: (error as Error).message,
          };
        }
      })
    );

    // Parse frontmatter for each document
    const successfulWritings = writings.map(writing => ({
      ...writing,
      ...parseMarkdownFrontmatter(writing.filename, ''), // Use filename as fallback
    }));

    return NextResponse.json({
      success: true,
      count: successfulWritings.length,
      writings: successfulWritings,
    });
  } catch (error) {
    console.error('Error fetching writings from Google Drive:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

/**
 * Parse YAML frontmatter from markdown
 */
function parseMarkdownFrontmatter(markdown: string, filename: string) {
  // Simple frontmatter parser for ---yaml--- or processed by gray-matter in build
  let rawFrontmatter: any = {};

  // Try to extract frontmatter
  const frontmatterRegex = /^---\n(.*?)\n---/s;
  const match = markdown.match(frontmatterRegex);

  if (match) {
    const frontmatterText = match[1];
    // Parse as JSON (preferred) or attempt YAML parsing
    try {
      rawFrontmatter = JSON.parse(frontmatterText);
    } catch {
      // If not JSON, try simple key-value parsing
      const lines = frontmatterText.split('\n');
      for (const line of lines) {
        const colonIdx = line.indexOf(':');
        if (colonIdx > 0) {
          const key = line.substring(0, colonIdx).trim();
          const value = line.substring(colonIdx + 1).trim();
          rawFrontmatter[key] = value;
        }
      }
    }

    // Remove frontmatter from content
    const content = markdown.replace(frontmatterRegex, '').trim();

    return {
      ...rawFrontmatter,
      content,
      slug: filename ? filename.replace(/\.md$/, '') : '',
      title: rawFrontmatter.title || rawFrontmatter.slug || filename.replace(/\.md$/, ''),
      description: rawFrontmatter.description || '',
      category: rawFrontmatter.category || 'general',
      tags: rawFrontmatter.tags || [],
      date: rawFrontmatter.date || new Date().toISOString().split('T')[0],
      published: rawFrontmatter.published !== false,
    };
  }

  // No frontmatter found - return minimal object
  return {
    content: markdown,
    slug: filename ? filename.replace(/\.md$/, '') : '',
    title: filename ? filename.replace(/\.md$/, '') : '',
    description: '',
    category: 'general',
    tags: [],
    date: new Date().toISOString().split('T')[0],
    published: true,
  };
}