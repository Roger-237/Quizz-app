import jwt from 'jsonwebtoken';
import { Response } from 'express';

// Créer un JWT et le définir comme cookie
export const generateTokenAndSetCookie = (res: Response, userId: number) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'secret_par_defaut', { expiresIn: '7d' });

  res.cookie('token', token, {
    httpOnly: true, // Protège contre les attaques XSS
    secure: process.env.NODE_ENV === 'production', // Nécessite HTTPS en production
    sameSite: 'strict', // Prévient les attaques CSRF
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
  });
  return token;
};
