import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifierToken = (req: Request, res: Response, next: NextFunction) => {
  // 1. On essaie d'abord de lire le token depuis les cookies (comportement existant)
  let token = (req as any).cookies?.token as string | undefined;

  // 2. Si aucun cookie, on vérifie l'en-tête Authorization: Bearer <token>
  if (!token) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return res.status(401).json({ succes: false, message: "Accès refusé. Aucun jeton fourni." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    // On expose les infos de l'utilisateur de façon homogène pour tous les contrôleurs
    (req as any).utilisateur = decoded;
    (req as any).userId = (decoded as any).userId;
    next();
  } catch (error) {
    // Si la signature est invalide ou le token expiré
    return res.status(403).json({ 
      succes: false, 
      message: "Session invalide ou expirée. Veuillez vous reconnecter." 
    });
  }
};