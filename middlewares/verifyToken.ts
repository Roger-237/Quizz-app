import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import dotenv from 'dotenv';

dotenv.config();

export interface AuthRequest extends Request {
  userId?: number;
}

export const verifyToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ auth: false, message: 'Aucun token fourni.' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret_par_defaut') as { userId: number };
    
    if (!decoded) {
      return res.status(401).json({ auth: false, message: 'Échec de l\'authentification du token.' });
    }
    
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(500).json({ auth: false, message: 'Échec de l\'authentification du token.' });
  }
};
