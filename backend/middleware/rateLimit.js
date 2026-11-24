module.exports = function rateLimit(maxRequests, windowMs) {
  const requests = new Map();
  const cleanup = setInterval(() => {
    const now = Date.now();
    for (const [ip, entry] of requests) {
      if (entry.expires <= now) requests.delete(ip);
    }
  }, windowMs);
  cleanup.unref();

  return (req, res, next) => {
    const now = Date.now();
    let entry = requests.get(req.ip);
    if (!entry || entry.expires <= now) {
      entry = { count: 0, expires: now + windowMs };
      requests.set(req.ip, entry);
    }
    if (entry.count >= maxRequests) {
      res.set('Retry-After', String(Math.ceil((entry.expires - now) / 1000)));
      return res.status(429).json({ message: 'Too many requests. Try again later.' });
    }
    entry.count++;
    next();
  };
};
