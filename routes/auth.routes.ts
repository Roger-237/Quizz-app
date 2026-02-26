import { Router } from 'express';
import { inscription, connexion, deconnexion, verifierAuthentification } from '../controllers/auth.controller';
import { verifierToken } from '../middlewares/verifierToken';

const router = Router();

router.post('/inscription', inscription);
router.post('/connexion', connexion);
router.post('/deconnexion', deconnexion);

// Route pour que le frontend sache si l'utilisateur est loggé au rafraîchissement
router.get('/check-auth', verifierToken, verifierAuthentification);

export default router;