import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Créer le transporter en utilisant SMTP
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true' || false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Vérifier la configuration de connexion
transporter.verify((error, success) => {
  if (error) {
    console.log('Erreur de connexion SMTP:', error);
  } else {
    console.log('Serveur SMTP prêt à recevoir nos messages');
  }
});

// Informations de l'expéditeur
export const sender = {
  email: process.env.SMTP_USER,
  name: "QuizzApp",
};
