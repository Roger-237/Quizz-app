import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// On étend l'interface Request pour y inclure userId
declare global {
  namespace Express {
    interface Request {
      userId?: number; 
    }
  }
}





export const verifierToken = (req: Request, res: Response, next: NextFunction) => {
  // 1. Extraction du token depuis les cookies
  // Note : Assure-toi d'avoir configuré 'cookie-parser' dans ton index.ts
  const token = req.cookies.token;

  if (!token) {
    return res.status(401).json({ 
      succes: false, 
      message: "Accès refusé. Aucun jeton (token) fourni." 
    });
  }

  try {
    // 2. Vérification du jeton avec ta clé secrète
    const secret = process.env.JWT_SECRET || 'votre_cle_secrete_temporaire';
    const decode = jwt.verify(token, secret) as { userId: number };

    if (!decode) {
      return res.status(401).json({ 
        succes: false, 
        message: "Échec de l'authentification : Jeton invalide." 
      });
    }

    // 3. On stocke l'ID dans la requête pour l'utiliser plus tard
    // Ex: const utilisateurId = req.userId; dans tes contrôleurs
    req.userId = decode.userId;

    // 4. On passe à la fonction suivante (le contrôleur)
    next();

  } catch (error) {
    console.error("Erreur de vérification du JWT :", error);
    return res.status(500).json({ 
      succes: false, 
      message: "Erreur interne lors de la validation du jeton." 
    });
  }
};