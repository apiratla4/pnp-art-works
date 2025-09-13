// middleware/auth.js
import jwt from 'jsonwebtoken';

export function authenticateJWT(req, res, next) {
  const auth = req.headers.authorization || '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  const token = req.cookies?.token || bearer;
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid token' });
  }
}
