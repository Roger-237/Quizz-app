import { transporter, sender } from "./nodemailer";
import dotenv from 'dotenv';
import { VERIFICATION_EMAIL_TEMPLATE, PASSWORD_RESET_REQUEST_TEMPLATE, PASSWORD_RESET_SUCCESS_TEMPLATE } from "./emailTemplates";

dotenv.config();

// Fonction utilitaire pour envoyer un email avec tentatives
const sendEmailWithRetry = async (emailOptions: any, maxRetries = 3) => {
  const mailOptions = {
    from: `"${sender.name}" <${sender.email}>`,
    to: emailOptions.to,
    subject: emailOptions.subject,
    html: emailOptions.html,
  };

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log(`Email envoyé avec succès à la tentative ${attempt}:`, info.messageId);
      return info;
    } catch (error: any) {
      console.error(`Tentative ${attempt} échouée:`, error.message);
      
      if (attempt === maxRetries) {
        throw new Error(`Échec de l'envoi de l'email après ${maxRetries} tentatives: ${error.message}`);
      }
      
      // Attendre avant de réessayer (backoff exponentiel)
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, attempt)));
    }
  }
};

// Envoyer un email de vérification
export const sendVerificationEmail = async (email: string, verificationToken: string) => {
  try {
    await sendEmailWithRetry({
      to: email,
      subject: "Vérifiez votre email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
    });
  } catch (error: any) {
    console.error(`Erreur lors de l'envoi de l'email de vérification`, error);
    throw new Error(`Erreur lors de l'envoi de l'email de vérification: ${error}`);
  }
};

// Envoyer un email de bienvenue
export const sendWelcomeEmail = async (email: string, name: string) => {
  try {
    await sendEmailWithRetry({
      to: email,
      subject: "Bienvenue sur notre plateforme !",
      html: `<p>Bonjour ${name},</p><p>Bienvenue sur notre plateforme ! Nous sommes ravis de vous avoir parmi nous.</p>`,
    });
  } catch (error: any) {
    console.error(`Erreur lors de l'envoi de l'email de bienvenue`, error);
    throw new Error(`Erreur lors de l'envoi de l'email de bienvenue: ${error}`);
  }
};

// Envoyer un email de réinitialisation de mot de passe
export const sendPasswordResetEmail = async (email: string, resetURL: string) => {
  try {
    await sendEmailWithRetry({
      to: email,
      subject: "Réinitialisez votre mot de passe",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetURL),
    });
  } catch (error: any) {
    console.error(`Erreur lors de l'envoi de l'email de réinitialisation`, error);
    throw new Error(`Erreur lors de l'envoi de l'email de réinitialisation: ${error}`);
  }
};

// Envoyer un email lorsque la réinitialisation du mot de passe est réussie
export const sendResetSuccessEmail = async (email: string) => {
  try {
    await sendEmailWithRetry({
      to: email,
      subject: "Réinitialisation du mot de passe réussie",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
    });
  } catch (error: any) {
    console.error(`Erreur lors de l'envoi de l'email de confirmation de réinitialisation`, error);
    throw new Error(`Erreur lors de l'envoi de l'email de confirmation de réinitialisation: ${error}`);
  }
};
