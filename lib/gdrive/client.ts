import { google, drive_v3 } from 'googleapis';
import { getDriveToken, saveDriveToken } from '@/lib/gdrive/token';

const FOLDER_ID_MAP: Record<string, string> = {
  gallery: process.env.GOOGLE_DRIVE_GALLERY_FOLDER_ID || '',
  writings: process.env.GOOGLE_DRIVE_WRITINGS_FOLDER_ID || '',
};

let driveOAuth2Client: any = null;
let driveClient: drive_v3.Drive | null = null;
let tokenLoaded = false;

/**
 * Initialize Google Drive OAuth2 client
 */
export function getDriveClient() {
  if (tokenLoaded && driveClient) {
    return driveClient;
  }

  const token = getDriveToken();
  if (!token) {
    throw new Error('Drive token not found. Please authorize access via dashboard or API.');
  }

  const CLIENT_ID = process.env.GOOGLE_DRIVE_CLIENT_ID || '';
  const CLIENT_SECRET = process.env.GOOGLE_DRIVE_CLIENT_SECRET || '';

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('GOOGLE_DRIVE_CLIENT_ID and GOOGLE_DRIVE_CLIENT_SECRET environment variables are required');
  }

  driveOAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, `${process.env.NEXTAUTH_URL}/api/gdrive/callback`);
  driveOAuth2Client.setCredentials({ access_token: token.access_token, refresh_token: token.refresh_token });

  // Check if token needs refresh and update
  if (token.expiry && Date.now() > token.expiry) {
    driveOAuth2Client.on('tokens', (newTokens: any) => {
      if (newTokens.refresh_token) {
        saveDriveToken({ ...token, refresh_token: newTokens.refresh_token, access_token: newTokens.access_token, expiry: Date.now() + (newTokens.expiry || 3600000) });
      } else {
        saveDriveToken({ ...token, access_token: newTokens.access_token, expiry: Date.now() + (newTokens.expiry || 3600000) });
      }
    });
  }

  driveClient = google.drive({ version: 'v3', auth: driveOAuth2Client });
  tokenLoaded = true;

  return driveClient;
}

/**
 * Get files in a general Google Drive folder
 */
export async function getFolderFiles(folderPath: string, mimeTypeFilter?: string) {
  try {
    const drive = getDriveClient();
    const folderId = FOLDER_ID_MAP[folderPath];

    if (!folderId) {
      throw new Error(`Folder ID not configured for: ${folderPath}`);
    }

    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType != 'application/vnd.google-apps.folder'`,
      fields: 'files(id, name, mimeType, createdTime, modifiedTime, webContentLink, webViewLink)',
      orderBy: 'modifiedTime desc',
    });

    const files = response.data.files || [];
    console.log(`Found ${files.length} files in ${folderPath} folder`);

    // Filter by MIME type(s) if specified
    let filteredFiles = files;
    if (mimeTypeFilter) {
      filteredFiles = files.filter(f => mimeTypeFilter.split(',').some(mime => f.mimeType?.includes(mime)));
    }

    return filteredFiles;
  } catch (error) {
    console.error(`Error fetching ${folderPath}:`, error);
    return [];
  }
}

/**
 * Download file content from Google Drive
 */
export async function downloadFile(fileId: string) {
  try {
    const drive = getDriveClient();
    const response = await drive.files.get({
      fileId,
      alt: 'media',
    });

    return response.data as unknown as Buffer;
  } catch (error) {
    console.error(`Error downloading file ${fileId}:`, error);
    throw error;
  }
}

/**
 * Get file metadata from Google Drive
 */
export async function getFileMetadata(fileId: string) {
  try {
    const drive = getDriveClient();
    const response = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, createdTime, modifiedTime',
    });

    return response.data;
  } catch (error) {
    console.error(`Error getting metadata for ${fileId}:`, error);
    throw error;
  }
}