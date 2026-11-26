import * as fs from 'fs';
import * as path from 'path';

const TOKEN_DIR = path.join(process.cwd(), '.drive');
export const TOKEN_DIR_ABSOLUTE = TOKEN_DIR;

function ensureTokenDir() {
  if (!fs.existsSync(TOKEN_DIR)) {
    fs.mkdirSync(TOKEN_DIR, { recursive: true });
  }
}

/**
 * Load drive token from local storage
 * Note: In production, you may want to use a database or secrets manager instead
 */
export function getDriveToken(): { access_token: string; refresh_token?: string; expiry?: number } | null {
  ensureTokenDir();

  const tokenPath = path.join(TOKEN_DIR, 'token.json');
  if (!fs.existsSync(tokenPath)) {
    return null;
  }

  try {
    const tokenContent = fs.readFileSync(tokenPath, 'utf-8');
    const token = JSON.parse(tokenContent);

    // Check if token is expired
    if (token.expiry && Date.now() > token.expiry) {
      console.log('Drive token expired');
      return null;
    }

    console.log('Drive token loaded');
    return token;
  } catch (error) {
    console.error('Error loading drive token:', error);
    return null;
  }
}

/**
 * Save drive token to local storage
 */
export function saveDriveToken(token: { access_token: string; refresh_token?: string; expiry?: number }) {
  ensureTokenDir();

  const tokenPath = path.join(TOKEN_DIR, 'token.json');
  fs.writeFileSync(tokenPath, JSON.stringify(token, null, 2), 'utf-8');
  console.log('Drive token saved');
}

/**
 * Check if token exists and is valid
 */
export function hasValidDriveToken(): boolean {
  const token = getDriveToken();
  return !!token && (!token.expiry || Date.now() < token.expiry);
}

/**
 * Clear cached drive token
 */
export function clearDriveToken() {
  ensureTokenDir();
  const tokenPath = path.join(TOKEN_DIR, 'token.json');
  if (fs.existsSync(tokenPath)) {
    fs.unlinkSync(tokenPath);
    console.log('Drive token cleared');
  }
}