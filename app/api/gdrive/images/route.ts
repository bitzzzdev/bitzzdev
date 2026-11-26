import { NextRequest, NextResponse } from 'next/server';
import { getDriveClient, getFolderFiles, downloadFile, getFileMetadata } from '@/lib/gdrive/client';

/**
 * GET /api/gdrive/images
 * Fetch all images from Google Drive gallery folder
 * Optional query param: ?mimeType=image/jpeg,image/png
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const allowedMimeTypes = searchParams.get('mimeType')?.split(',') || ['image/jpeg', 'image/png', 'image/webp'];
    const folderPath = 'gallery';

    const drive = getDriveClient();

    // Get files from Google Drive
    const files = await getFolderFiles(folderPath, allowedMimeTypes.join(','));

    // Build image list with status
    const images = await Promise.all(
      files.map(async (file) => {
        try {
          const [metadata] = await Promise.all([
            getFileMetadata(file.id || ''),
            downloadFile(file.id || ''), // Try to download to verify accessibility
          ]);

          return {
            id: file.id || '',
            filename: file.name || '',
            mimeType: file.mimeType || '',
            createdTime: file.createdTime || '',
            modifiedTime: file.modifiedTime || '',
            WebContentLink: file.webContentLink || '',
            webViewLink: file.webViewLink || '',
            downloaded: true,
            error: null,
          };
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          return {
            id: file.id || '',
            filename: file.name || '',
            mimeType: file.mimeType || '',
            createdTime: file.createdTime || '',
            modifiedTime: file.modifiedTime || '',
            WebContentLink: file.webContentLink || '',
            webViewLink: file.webViewLink || '',
            downloaded: false,
            error: (error as Error).message,
          };
        }
      })
    );

    // Return only successfully downloaded images
    const successfulImages = images.filter(img => img.downloaded);

    return NextResponse.json({
      success: true,
      count: successfulImages.length,
      images: successfulImages,
    });
  } catch (error) {
    console.error('Error fetching images from Google Drive:', error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}