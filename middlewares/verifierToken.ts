import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export const verifierToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies.token; // Vérifie que tu utilises bien cookie-parser

  if (!token) {
    return res.status(401).json({ succes: false, message: "Accès refusé. Aucun jeton fourni." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    (req as any).utilisateur = decoded;
    next();
  } catch (error) {
    // Si la signature est invalide ou le token expiré
    return res.status(403).json({ 
      succes: false, 
      message: "Session invalide ou expirée. Veuillez vous reconnecter." 
    });
  }
};