export interface ContentSettings {
  useGoogleDrive: boolean;
  galleryFolderId?: string;
  writingsFolderId?: string;
}

export let contentSettings: ContentSettings = {
  useGoogleDrive: process.env.USE_GOOGLE_DRIVE === 'true',
  galleryFolderId: process.env.GOOGLE_DRIVE_GALLERY_FOLDER_ID,
  writingsFolderId: process.env.GOOGLE_DRIVE_WRITINGS_FOLDER_ID,
};

/**
 * Update content settings
 */
export function updateContentSettings(settings: Partial<ContentSettings>) {
  contentSettings = { ...contentSettings, ...settings };
}