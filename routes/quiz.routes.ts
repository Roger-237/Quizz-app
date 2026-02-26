import { Router } from 'express';
import { obtenirQuiz } from '../controllers/quiz.controller';
import { verifierToken } from '../middlewares/verifierToken';

const router = Router();

// Route : GET /api/quiz
// On passe par le middleware de vérification avant d'accéder aux questions
router.get('/', verifierToken, obtenirQuiz);

export default router;