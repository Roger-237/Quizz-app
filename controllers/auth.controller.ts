import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { utilisateurs } from '../db/schema';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

// --- Fonction pour générer le cookie (utilitaire interne) ---
const genererCookie = (res: Response, userId: number) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'secret_par_defaut', {
    expiresIn: '7d',
  });

  res.cookie('token', token, {
    httpOnly: true, // Sécurité contre les attaques XSS
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
  });
};

// --- INSCRIPTION ---
export const inscription = async (req: Request, res: Response) => {
  const { nom, email, motDePasse } = req.body;

  try {
    if (!nom || !email || !motDePasse) {
      return res.status(400).json({ succes: false, message: "Tous les champs sont requis." });
    }

    const existeDeja = await db.select().from(utilisateurs).where(eq(utilisateurs.email, email)).limit(1);
    if (existeDeja.length > 0) {
      return res.status(400).json({ succes: false, message: "Email déjà utilisé." });
    }

    const hash = await bcrypt.hash(motDePasse, 10);
    
    const result = await db.insert(utilisateurs).values({
      nomUtilisateur: nom,
      email: email,
      motDePasseHash: hash,
    }).returning();

    const user = result[0];
    genererCookie(res, user.id);

    res.status(201).json({
      succes: true,
      utilisateur: { id: user.id, nom: user.nomUtilisateur, email: user.email }
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ succes: false, message: error.message });
  }
};

// --- CONNEXION ---
export const connexion = async (req: Request, res: Response) => {
  const { email, motDePasse } = req.body;

  try {
    const result = await db.select().from(utilisateurs).where(eq(utilisateurs.email, email)).limit(1);
    const user = result[0];

    if (!user || !(await bcrypt.compare(motDePasse, user.motDePasseHash))) {
      return res.status(400).json({ succes: false, message: "Identifiants incorrects." });
    }

    genererCookie(res, user.id);

    res.status(200).json({
      succes: true,
      utilisateur: { id: user.id, nom: user.nomUtilisateur, points: user.pointsTotaux }
    });
  } catch (error: any) {
    res.status(500).json({ succes: false, message: error.message });
  }
};

// --- DÉCONNEXION ---
export const deconnexion = (req: Request, res: Response) => {
  res.clearCookie('token');
  res.status(200).json({ succes: true, message: "Déconnecté." });
};

// --- CHECK AUTH ---
export const verifierAuthentification = async (req: any, res: Response) => {
  try {
    const result = await db.select().from(utilisateurs).where(eq(utilisateurs.id, req.userId)).limit(1);
    const user = result[0];

    if (!user) return res.status(404).json({ succes: false, message: "Utilisateur non trouvé." });

    res.status(200).json({ succes: true, utilisateur: { id: user.id, nom: user.nomUtilisateur } });
  } catch (error: any) {
    res.status(500).json({ succes: false, message: error.message });
  }
};