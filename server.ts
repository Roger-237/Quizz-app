import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import quizRoutes from './routes/quiz.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares de base
app.use(express.json()); // Pour lire le body des requêtes POST
app.use(cookieParser()); // Pour lire le JWT dans les cookies
app.use(cors({
    origin: "http://localhost:5501",
    credentials: true
}));

// Routes de l'API
app.use('/api/auth', authRoutes);

app.use('/api/quiz', quizRoutes);

app.listen(PORT, () => {
  console.log(` Serveur Quiz démarré sur : http://localhost:${PORT}`);
});

export default app;