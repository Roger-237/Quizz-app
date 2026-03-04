import { Router } from 'express';
import { inscription, connexion, deconnexion, verifierAuthentification, verifierEmail, motDePasseOublie, reinitialiserMotDePasse } from '../controllers/auth.controller';
import { verifyToken } from '../middlewares/verifyToken';

const router = Router();

router.post('/inscription', inscription);
router.post('/connexion', connexion);
router.post('/deconnexion', deconnexion);
router.post('/verifier-email', verifierEmail);
router.post('/mot-de-passe-oublie', motDePasseOublie);
router.post('/reinitialiser-mot-de-passe/:token', reinitialiserMotDePasse);


// Route pour que le frontend sache si l'utilisateur est loggé au rafraîchissement
router.get('/check-auth', verifyToken, verifierAuthentification);

export default router;