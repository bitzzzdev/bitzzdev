import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === 'true';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'dev@bitz.is-a.dev';
const JWT_SECRET = process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || 'your-secret-key-change-in-production';

// Only login and auth endpoints are accessible during maintenance without bypass
// Dashboard requires the email+password bypass to be entered first
const MAINTENANCE_ALLOWED_PATHS = ['/dashboard/login', '/api/auth', '/api/git-push', '/api/maintenance/bypass'];

export function isMaintenanceMode(): boolean {
  return MAINTENANCE_MODE;
}

function verifyMaintenanceBypassToken(token: string): boolean {
  try {
    const [payloadB64, signature] = token.split('.');
    if (!payloadB64 || !signature) return false;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(payloadB64)
      .digest('hex');
    
    if (signature !== expectedSignature) return false;

    // Decode and check expiry
    const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf-8'));
    if (!payload.email || payload.email !== ADMIN_EMAIL) return false;
    if (!payload.exp || Date.now() > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}

export function checkMaintenanceBypass(request: NextRequest): boolean {
  // Check maintenance bypass cookie
  const bypassCookie = request.cookies.get('maintenance-bypass');
  if (bypassCookie?.value && verifyMaintenanceBypassToken(bypassCookie.value)) {
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
  const currentPath = request.nextUrl.pathname + request.nextUrl.search;
  const origin = request.nextUrl.origin;

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
      max-width: 420px;
      width: 100%;
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
      margin: 2rem 0;
      text-align: left;
      font-size: 0.85rem;
      color: #888;
    }
    .details strong { color: #ccc; }
    .form-group {
      text-align: left;
      margin-bottom: 1.25rem;
    }
    label {
      display: block;
      font-size: 0.9rem;
      font-weight: 500;
      color: #ccc;
      margin-bottom: 0.5rem;
    }
    input[type="email"], input[type="password"] {
      width: 100%;
      padding: 0.875rem 1rem;
      background: rgba(255,255,255,0.05);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 6px;
      color: #fff;
      font-size: 1rem;
      font-family: inherit;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    input[type="email"]:focus, input[type="password"]:focus {
      outline: none;
      border-color: #fff;
      box-shadow: 0 0 0 3px rgba(255,255,255,0.15);
    }
    input[type="email"]::placeholder, input[type="password"]::placeholder { color: #666; }
    .btn {
      width: 100%;
      padding: 0.875rem 1.5rem;
      background: #fff;
      color: #0d0d0d;
      border: none;
      border-radius: 6px;
      font-size: 1rem;
      font-weight: 600;
      font-family: inherit;
      cursor: pointer;
      transition: opacity 0.2s, transform 0.1s;
    }
    .btn:hover { opacity: 0.9; }
    .btn:active { transform: scale(0.98); }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .error {
      color: #ff6b6b;
      font-size: 0.875rem;
      margin-top: 0.75rem;
      min-height: 1.25rem;
    }
    .success {
      color: #6bff9e;
      font-size: 0.875rem;
      margin-top: 0.75rem;
      min-height: 1.25rem;
    }
    @media (prefers-color-scheme: light) {
      body { background: #f8f8fa; color: #1a1a1a; }
      h1 { color: #1a1a1a; }
      p { color: #555; }
      .details { background: #f0f0f0; border-color: #ddd; color: #555; }
      .details strong { color: #333; }
      input[type="email"], input[type="password"] { background: #fff; border-color: #ddd; color: #1a1a1a; }
      input[type="email"]:focus, input[type="password"]:focus { border-color: #1a1a1a; box-shadow: 0 0 0 3px rgba(26,26,26,0.15); }
      .btn { background: #1a1a1a; color: #fff; }
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
      <strong>Path:</strong> ${currentPath}
    </div>
    <form id="bypassForm" autocomplete="off">
      <div class="form-group">
        <label for="email">Admin Email</label>
        <input type="email" id="email" name="email" placeholder="Enter admin email" required autocomplete="email">
      </div>
      <div class="form-group">
        <label for="password">Password</label>
        <input type="password" id="password" name="password" placeholder="Enter password" required autocomplete="current-password">
      </div>
      <button type="submit" class="btn" id="submitBtn">Access Site</button>
      <div id="message" class="error" aria-live="polite"></div>
    </form>
  </div>
  <script>
    (function() {
      const form = document.getElementById('bypassForm');
      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');
      const submitBtn = document.getElementById('submitBtn');
      const message = document.getElementById('message');
      const targetPath = ${JSON.stringify(currentPath)};
      const origin = ${JSON.stringify(origin)};

      form.addEventListener('submit', function(e) {
        e.preventDefault();
        message.textContent = '';
        message.className = 'error';

        const email = emailInput.value.trim().toLowerCase();
        const password = passwordInput.value;
        if (!email || !password) {
          message.textContent = 'Please enter both email and password';
          return;
        }

        submitBtn.disabled = true;
        submitBtn.textContent = 'Verifying...';

        // Verify credentials by calling the bypass API
        fetch(origin + '/api/maintenance/bypass', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'same-origin',
          body: JSON.stringify({ email, password, targetPath })
        })
        .then(function(response) {
          return response.json().then(function(data) {
            if (response.ok) {
              message.className = 'success';
              message.textContent = 'Access granted. Redirecting...';
              window.location.href = origin + data.targetPath;
            } else {
              throw new Error(data.error || 'Invalid credentials');
            }
          });
        })
        .catch(function(err) {
          message.textContent = err.message || 'Invalid email or password. Access denied.';
          submitBtn.disabled = false;
          submitBtn.textContent = 'Access Site';
        });
      });
    })();
  </script>
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