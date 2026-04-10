const crypto = require('crypto');

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

function getClientIp(req) {
  const cfConnectingIp = req.get('cf-connecting-ip');
  if (cfConnectingIp) {
    return cfConnectingIp.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

function ensureCsrfToken(req) {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  return req.session.csrfToken;
}

function isApiRequest(req) {
  return req.originalUrl.startsWith('/api/')
    || req.xhr
    || req.accepts(['html', 'json']) === 'json';
}

function respondSecurityError(req, res, status, message) {
  if (isApiRequest(req)) {
    return res.status(status).json({ error: message });
  }

  req.session.error = message;
  return res.redirect(req.get('referer') || '/');
}

function attachSecurityLocals(req, res, next) {
  res.locals.csrfToken = ensureCsrfToken(req);
  res.locals.turnstileEnabled = Boolean(process.env.TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY);
  res.locals.turnstileSiteKey = res.locals.turnstileEnabled ? process.env.TURNSTILE_SITE_KEY : '';
  next();
}

function tokensMatch(a, b) {
  if (!a || !b) return false;
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

function requireCsrf(req, res, next) {
  const requestToken = (req.body && req.body._csrf)
    || req.query._csrf
    || req.get('x-csrf-token')
    || req.get('csrf-token');

  if (!tokensMatch(ensureCsrfToken(req), requestToken)) {
    return respondSecurityError(req, res, 403, 'Phiên làm việc đã hết hạn hoặc yêu cầu không hợp lệ.');
  }

  return next();
}

function createRateLimiter(options) {
  const {
    windowMs,
    max,
    keyGenerator = getClientIp,
    message = 'Bạn thao tác quá nhanh. Vui lòng thử lại sau.',
    onLimit,
  } = options;
  const store = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = keyGenerator(req);
    const timestamps = store.get(key) || [];
    const freshTimestamps = timestamps.filter((timestamp) => now - timestamp < windowMs);

    freshTimestamps.push(now);
    store.set(key, freshTimestamps);
    req.rateLimit = {
      count: freshTimestamps.length,
      key,
      reset: () => store.delete(key),
    };

    if (freshTimestamps.length > max) {
      if (onLimit) {
        return onLimit(req, res);
      }
      return respondSecurityError(req, res, 429, message);
    }

    return next();
  };
}

async function verifyTurnstileToken(token, req) {
  const turnstileEnabled = Boolean(process.env.TURNSTILE_SITE_KEY && process.env.TURNSTILE_SECRET_KEY);

  if (!turnstileEnabled) {
    return { success: true, skipped: true };
  }

  if (!token) {
    return { success: false };
  }

  const formData = new URLSearchParams({
    secret: process.env.TURNSTILE_SECRET_KEY,
    response: token,
    remoteip: getClientIp(req),
  });

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!response.ok) {
      return { success: false };
    }

    return response.json();
  } catch (error) {
    return { success: false };
  }
}

module.exports = {
  attachSecurityLocals,
  createRateLimiter,
  getClientIp,
  requireCsrf,
  respondSecurityError,
  verifyTurnstileToken,
};
