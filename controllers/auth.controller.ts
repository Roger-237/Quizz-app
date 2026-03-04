import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import jwt from 'jsonwebtoken';
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie';
import {
	sendVerificationEmail,
	sendPasswordResetEmail,
	sendResetSuccessEmail,
	sendWelcomeEmail,
} from "../utils/emails";
import crypto from 'crypto';

// --- Fonction pour générer le JWT + cookie (utilitaire interne) ---
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

  // On retourne aussi le token pour que le frontend puisse le stocker dans le localStorage
  return token;
};

// --- INSCRIPTION ---
export const inscription = async (req: Request, res: Response) => {
  const { nom, email, motDePasse } = req.body;

  try {
    if (!nom || !email || !motDePasse) {
      return res.status(400).json({ succes: false, message: "Tous les champs sont requis." });
    }

    const existeDeja = await prisma.utilisateur.findUnique({
      where: { email },
    });
    if (existeDeja) {
      return res.status(400).json({ succes: false, message: "Email déjà utilisé." });
    }

    const hash = await bcrypt.hash(motDePasse, 10);
    
    const verificationToken = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await prisma.utilisateur.create({
      data: {
        nomUtilisateur: nom,
        email,
        motDePasseHash: hash,
        verificationToken: verificationToken,
        verificationTokenExpiresAt: new Date(Date.now() + 3600000), // 1 heure
      },
    });
    
    generateTokenAndSetCookie(res, user.id);
    await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      succes: true,
      message: 'Utilisateur créé avec succès. Veuillez vérifier votre email.',
      utilisateur: { 
        id: user.id, 
        nom: user.nomUtilisateur, 
        email: user.email,
        isVerified: user.isVerified
      }
    });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ succes: false, message: error.message });
  }
};

// --- VÉRIFICATION EMAIL ---
export const verifierEmail = async (req: Request, res: Response) => {
  const { code } = req.body;
  
  try {
    const user = await prisma.utilisateur.findFirst({
      where: {
        verificationToken: code,
        verificationTokenExpiresAt: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      return res.status(400).json({ succes: false, message: 'Code de vérification invalide ou expiré.' });
    }

    await prisma.utilisateur.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpiresAt: null
      }
    });

    await sendWelcomeEmail(user.email, user.nomUtilisateur);
    
    res.status(200).json({ succes: true, message: 'Email vérifié avec succès.' });
  } catch (error: any) {
    console.error("Erreur lors de la vérification de l'email:", error);
    res.status(500).json({ succes: false, message: error.message });
  }
};

// --- CONNEXION ---
export const connexion = async (req: Request, res: Response) => {
  const { email, motDePasse } = req.body;

  try {
    const user = await prisma.utilisateur.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(motDePasse, user.motDePasseHash))) {
      return res.status(400).json({ succes: false, message: "Identifiants incorrects." });
    }

    const token = genererCookie(res, user.id);

    // Mettre à jour la date de dernière connexion
    await prisma.utilisateur.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    res.status(200).json({
      succes: true,
      token,
      utilisateur: { 
        id: user.id, 
        nom: user.nomUtilisateur, 
        points: user.pointsTotaux,
        isVerified: user.isVerified
      }
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

// --- MOT DE PASSE OUBLIÉ ---
export const motDePasseOublie = async (req: Request, res: Response) => {
  const { email } = req.body;
  
  try {
    const user = await prisma.utilisateur.findUnique({
      where: { email },
    });
    
    if (!user) {
      return res.status(400).json({ succes: false, message: 'Utilisateur non trouvé.' });
    }

    // Générer un token de réinitialisation
    const resetToken = crypto.randomBytes(20).toString('hex');
    const resetPasswordTokenExpireAt = new Date(Date.now() + 3600000); // 1 heure
    
    await prisma.utilisateur.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordTokenExpiresAt: resetPasswordTokenExpireAt
      }
    });

    // Envoyer l'email de réinitialisation
    await sendPasswordResetEmail(user.email, `${process.env.CLIENT_URL}/reset-password/${resetToken}`);
    
    res.status(200).json({ succes: true, message: 'Email de réinitialisation envoyé avec succès.' });
  } catch (error: any) {
    console.error("Erreur lors de l'envoi de l'email de réinitialisation:", error);
    
    if (error.message.includes("limit")) {
      res.status(500).json({ 
        succes: false, 
        message: 'Impossible d\'envoyer l\'email en raison de limitations du service. Veuillez contacter le support.' 
      });
    } else {
      res.status(500).json({ succes: false, message: 'Échec de l\'envoi de l\'email de réinitialisation. Veuillez réessayer plus tard.' });
    }
  }
};

// --- RÉINITIALISER MOT DE PASSE ---
export const reinitialiserMotDePasse = async (req: Request, res: Response) => {
  try {
    const { motDePasse } = req.body;
    const { token } = req.params;
    const tokenString = Array.isArray(token) ? token[0] : token;
    
    const user = await prisma.utilisateur.findFirst({
      where: {
        resetPasswordToken: tokenString,
        resetPasswordTokenExpiresAt: {
          gt: new Date()
        }
      }
    });
    
    if (!user) {
      return res.status(400).json({ succes: false, message: 'Token de réinitialisation invalide ou expiré.' });
    }
    
    const hashedPassword = await bcrypt.hash(motDePasse, 10);
    
    await prisma.utilisateur.update({
      where: { id: user.id },
      data: {
        motDePasseHash: hashedPassword,
        resetPasswordToken: null,
        resetPasswordTokenExpiresAt: null
      }
    });
    
    await sendResetSuccessEmail(user.email);
    
    res.status(200).json({ succes: true, message: 'Mot de passe réinitialisé avec succès.' });
  } catch (error: any) {
    console.error("Erreur lors de la réinitialisation du mot de passe:", error);
    res.status(500).json({ succes: false, message: error.message });
  }
};

// --- CHECK AUTH ---
export const verifierAuthentification = async (req: any, res: Response) => {
  try {
    const user = await prisma.utilisateur.findUnique({
      where: { id: req.userId },
    });

    if (!user) return res.status(404).json({ succes: false, message: "Utilisateur non trouvé." });

    res.status(200).json({ 
      succes: true, 
      utilisateur: { 
        id: user.id, 
        nom: user.nomUtilisateur,
        email: user.email,
        isVerified: user.isVerified,
        points: user.pointsTotaux
      } 
    });
  } catch (error: any) {
    res.status(500).json({ succes: false, message: error.message });
  }
};

