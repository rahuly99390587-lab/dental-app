/**
 * Simple API key middleware for admin routes.
 * Set ADMIN_KEY env variable on server; clients send it as
 *   Authorization: Bearer <key>
 * If ADMIN_KEY is not set the middleware is effectively a no-op
 * (dev-friendly default).
 */
const authMiddleware = (req, res, next) => {
  const adminKey = process.env.ADMIN_KEY;

  // If no key configured, skip auth (development mode)
  if (!adminKey) return next();

  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : null;

  if (!token || token !== adminKey) {
    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Invalid or missing API key.',
    });
  }

  next();
};

module.exports = authMiddleware;
