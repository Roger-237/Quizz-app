import { Request, Response } from 'express';
import { db } from '../db';
import { questions, reponses } from '../db/schema';
import { eq, and, sql } from 'drizzle-orm';

export const obtenirQuiz = async (req: Request, res: Response) => {
  // On récupère les préférences de l'utilisateur depuis les paramètres d'URL
  // Exemple: /api/quiz?categorie=html&difficulte=1
  const { categorie, difficulte } = req.query;

  try {
    // 1. On récupère 10 questions aléatoires selon les filtres
    const questionsSelectionnees = await db.select()
      .from(questions)
      .where(
        and(
          eq(questions.categorie, categorie as string),
          eq(questions.difficulte, parseInt(difficulte as string))
        )
      )
      .orderBy(sql`RANDOM()`) // Mélange pour ne pas avoir toujours les mêmes
      .limit(10);

    if (questionsSelectionnees.length === 0) {
      return res.status(404).json({ 
        succes: false, 
        message: "Aucune question trouvée pour ces critères." 
      });
    }

    // 2. Pour chaque question, on récupère ses réponses
    // CRUCIAL : On ne renvoie PAS le champ 'estCorrecte' au client pour éviter la triche !
    const quizComplet = await Promise.all(questionsSelectionnees.map(async (q) => {
      const choix = await db.select({
        id: reponses.id,
        libelle: reponses.libelle
        // On omet volontairement 'estCorrecte'
      })
      .from(reponses)
      .where(eq(reponses.questionId, q.id));
      
      return {
        id: q.id,
        enonce: q.enonce,
        points: q.pointsValeur,
        choix: choix
      };
    }));

    res.status(200).json({
      succes: true,
      questions: quizComplet
    });

  } catch (error: any) {
    res.status(500).json({ succes: false, message: error.message });
  }
};