import { NextRequest, NextResponse } from 'next/server';

const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === 'true';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'dev@bitz.is-a.dev';

// Paths that are always accessible during maintenance (admin needs to access dashboard)
const MAINTENANCE_ALLOWED_PATHS = ['/dashboard', '/dashboard/login', '/api/auth', '/api/git-push'];

export function isMaintenanceMode(): boolean {
  return MAINTENANCE_MODE;
}

export function checkMaintenanceBypass(request: NextRequest): boolean {
  // Check email bypass
  const email = request.nextUrl.searchParams.get('maintenance_email');
  if (email && email === ADMIN_EMAIL) {
    return true;
  }

  // Check allowed paths (always accessible during maintenance)
  const pathname = request.nextUrl.pathname;
  if (MAINTENANCE_ALLOWED_PATHS.some(path => pathname.startsWith(path))) {
    return true;
  }

  return false;
}

export function createMaintenanceResponse(request: NextRequest): NextResponse {
  const bypassUrl = `${request.nextUrl.origin}${request.nextUrl.pathname}?maintenance_email=${encodeURIComponent(ADMIN_EMAIL)}`;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="robots" content="noindex, nofollow">
  <title>Maintenance - bitz.is-a.dev</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #0d0d0d;
      color: #e8e8e8;
      padding: 2rem;
    }
    .container {
      max-width: 500px;
      text-align: center;
      padding: 3rem 2rem;
    }
    .icon {
      font-size: 4rem;
      margin-bottom: 1.5rem;
      opacity: 0.7;
    }
    h1 {
      font-size: 2rem;
      font-weight: 600;
      margin-bottom: 1rem;
      color: #fff;
    }
    p {
      font-size: 1.1rem;
      line-height: 1.6;
      color: #aaa;
      margin-bottom: 2rem;
    }
    .details {
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 8px;
      padding: 1.5rem;
      margin-top: 2rem;
      text-align: left;
      font-size: 0.85rem;
      color: #888;
    }
    .details strong { color: #ccc; }
    .bypass-link {
      display: inline-block;
      margin-top: 1.5rem;
      padding: 0.75rem 1.5rem;
      background: #fff;
      color: #0d0d0d;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      transition: opacity 0.2s;
    }
    .bypass-link:hover { opacity: 0.9; }
    @media (prefers-color-scheme: light) {
      body { background: #f8f8fa; color: #1a1a1a; }
      h1 { color: #1a1a1a; }
      p { color: #555; }
      .details { background: #f0f0f0; border-color: #ddd; color: #555; }
      .details strong { color: #333; }
      .bypass-link { background: #1a1a1a; color: #fff; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">🔧</div>
    <h1>Site Under Maintenance</h1>
    <p>We're making improvements. The portfolio will be back shortly.</p>
    <div class="details">
      <strong>Mode:</strong> Maintenance<br>
      <strong>Time:</strong> ${new Date().toISOString()}<br>
      <strong>Path:</strong> ${request.nextUrl.pathname}
    </div>
    <a href="${bypassUrl}" class="bypass-link">Bypass (Admin Only)</a>
  </div>
</body>
</html>
  `;

  return new NextResponse(html, {
    status: 503,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Retry-After': '3600',
      'X-Maintenance-Mode': 'true',
    },
  });
}

export function maintenanceMiddleware(request: NextRequest): NextResponse | null {
  if (!isMaintenanceMode()) {
    return null;
  }

  if (checkMaintenanceBypass(request)) {
    return null;
  }

  return createMaintenanceResponse(request);
}