import { NextResponse } from 'next/server';
import { getDriveClient, getFolderFiles, downloadFile, getFileMetadata } from './client';

/**
 * Fetch all gallery images from Google Drive
 */
export async function fetchGalleryImages() {
  try {
    const drive = getDriveClient();
    const galleryFolderId = process.env.GOOGLE_DRIVE_GALLERY_FOLDER_ID;

    if (!galleryFolderId) {
      console.warn('Gallery folder ID not configured');
      return [];
    }

    const files = await getFolderFiles('gallery', 'image/jpeg,image/png,image/webp');

    const images = await Promise.all(
      files.map(async (file) => {
        try {
          // Download to verify
          const content = await downloadFile(file.id || '');

          // Determine dimensions
          const dimensions = await getImageDimensions(content);

          return {
            id: file.id!,
            filename: file.name!,
            title: file.name!.replace(/\.(jpg|jpeg|png|webp)$/i, ''),
            description: `Image from Google Drive`,
            category: 'general',
            tags: [],
            date: file.modifiedTime?.split('T')[0] || new Date().toISOString().split('T')[0],
            featured: false,
            width: dimensions.width || 0,
            height: dimensions.height || 0,
            WebContentLink: file.webContentLink || '',
            webViewLink: file.webViewLink || '',
            mimeType: file.mimeType || 'image/jpeg',
          };
        } catch (error) {
          console.error(`Error fetching image ${file.name}:`, error);
          return null;
        }
      })
    );

    // Filter nulls and sort by date
    return images.filter(Boolean).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return [];
  }
}

/**
 * Get dimensions from image file
 */
async function getImageDimensions(content: Buffer): Promise<{ width: number; height: number }> {
  // Use Node.js built-in modules for basic image processing
  // For robust dimension detection, you might want to use sharp library
  return new Promise((resolve) => {
    const { width, height } = { width: 0, height: 0 };

    // Simplified: assume standard resolution or add real dimension detection
    resolve({ width, height });
  });
}

/**
 * Download image file from Google Drive
 */
export async function downloadImage(fileId: string): Promise<Buffer> {
  try {
    const drive = getDriveClient();
    const response = await drive.files.get({
      fileId,
      alt: 'media',
      responseType: 'arraybuffer',
    }, { responseType: 'arraybuffer' });

    return response.data as Buffer;
  } catch (error) {
    console.error('Error downloading image:', error);
    throw error;
  }
}