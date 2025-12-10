import { verifyAccessToken } from '../utils/generateTokens.js';

export const authMiddleware = (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ message: 'Not authenticated' });
  }

  try {
    const payload = verifyAccessToken(token); // throws if invalid/expired
    // Attach user data from token to request object
    req.user = payload;
    return next();
  } catch (error) {
    console.error('Access token error:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
