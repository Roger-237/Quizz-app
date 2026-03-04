import { Request, Response } from 'express';
import { prisma } from '../db';


export const obtenirQuiz = async (req: Request, res: Response) => {
  // Exemple: /api/quiz?categorie=html&difficulte=1
  const { categorie, difficulte } = req.query;

  try {
    const questionsSelectionnees = await prisma.question.findMany({
      where: {
        categorie: categorie as string,
        difficulte: parseInt(difficulte as string),
      },
      take: 10,
    });

    if (questionsSelectionnees.length === 0) {
      return res.status(404).json({ 
        succes: false, 
        message: "Aucune question trouvée pour ces critères." 
      });
    }

    // 2. Pour chaque question, on récupère ses réponses
    // CRUCIAL : On ne renvoie PAS le champ 'estCorrecte' au client pour éviter la triche !
    const quizComplet = await Promise.all(
      questionsSelectionnees.map(async (q: any) => {
        const choix = await prisma.reponse.findMany({
          where: { questionId: q.id },
          select: {
            id: true,
            libelle: true,
          },
        });

        return {
          id: q.id,
          enonce: q.enonce,
          points: q.pointsValeur,
          categorie: q.categorie,
          difficulte: q.difficulte,
          choix,
        };
      })
    );

    res.status(200).json({
      succes: true,
      questions: quizComplet
    });

  } catch (error: any) {
    res.status(500).json({ succes: false, message: error.message });
  }
};

export const soumettreQuiz = async (req: any, res: Response) => {
    const { reponsesUtilisateur, categorie, difficulte } = req.body; 
    const userId = req.utilisateur.userId; 

    try {
        if (!reponsesUtilisateur || !Array.isArray(reponsesUtilisateur) || reponsesUtilisateur.length === 0) {
            return res.status(400).json({ succes: false, message: "Aucune réponse fournie." });
        }

        const detailsBonnesReponses = await prisma.reponse.findMany({
          where: {
            id: { in: reponsesUtilisateur },
            estCorrecte: true,
          },
          include: {
            question: true,
          },
        });

        const totalPointsGagnes = detailsBonnesReponses.reduce((acc: number, curr: { question: { pointsValeur: number } | null }) => {
          return acc + (curr.question?.pointsValeur || 0);
        }, 0);
        const nbBonnesReponses = detailsBonnesReponses.length;

        await prisma.partie.create({
          data: {
            utilisateurId: Number(userId),
            scoreObtenu: nbBonnesReponses,
            totalQuestions: reponsesUtilisateur.length,
            pointsGagnes: totalPointsGagnes,
            categorieJouee: categorie || "Général",
            niveauDifficulte: Number(difficulte) || 1,
          },
        });

        const resultatSomme = await prisma.partie.aggregate({
          _sum: { pointsGagnes: true },
          where: { utilisateurId: Number(userId) },
        });

        const nouveauTotalGlobal = resultatSomme._sum.pointsGagnes ?? 0;

        await prisma.utilisateur.update({
          where: { id: Number(userId) },
          data: { pointsTotaux: nouveauTotalGlobal },
        });
     
     
              // 5. IMPORTANT : Envoyer la réponse au client
        res.status(200).json({
            succes: true,
            message: "Score enregistré avec succès !",
            resultats: {
                score: nbBonnesReponses,
                points: totalPointsGagnes,
                totalQuestions: reponsesUtilisateur.length
            }
        });

    } catch (error: any) {
        console.error("Erreur insertion :", error);
        res.status(500).json({ succes: false, message: error.message });
    }
};



// --- CLASSEMENT top mondial---
export const obtenirClassement = async (req: Request, res: Response) => {
    try {
        const topJoueurs = await prisma.utilisateur.findMany({
          select: {
            nomUtilisateur: true,
            pointsTotaux: true,
          },
          orderBy: { pointsTotaux: 'desc' },
          take: 10,
        });

        res.status(200).json({
            succes: true,
            classement: topJoueurs.map((j: { nomUtilisateur: string; pointsTotaux: number | null }) => ({
              nom: j.nomUtilisateur,
              points: j.pointsTotaux,
            }))
        });
    } catch (error: any) {
        res.status(500).json({ succes: false, message: error.message });
    }
};

// --- HISTORIQUE DE MES PARTIES ---

export const obtenirMesParties = async (req: any, res: Response) => {
    const userId = req.utilisateur.userId; // Récupéré via le middleware verifierToken

    try {
        const historique = await prisma.partie.findMany({
          where: { utilisateurId: Number(userId) },
          orderBy: { joueLe: 'desc' },
        });

        res.status(200).json({
            succes: true,
            totalParties: historique.length,
            historique
        });
    } catch (error: any) {
        res.status(500).json({ succes: false, message: error.message });
    }
};


export const obtenirStatsUtilisateur = async (req: any, res: Response) => {
    const userId = req.utilisateur.userId;

    try {
        const aggregates = await prisma.partie.aggregate({
          _sum: {
            scoreObtenu: true,
            totalQuestions: true,
            pointsGagnes: true,
          },
          where: { utilisateurId: Number(userId) },
        });

        const scoreTotal = aggregates._sum.scoreObtenu ?? 0;
        const questionsTotales = aggregates._sum.totalQuestions ?? 0;
        const pointsTotaux = aggregates._sum.pointsGagnes ?? 0;

        const tauxReussite = questionsTotales > 0
          ? Math.round((scoreTotal / questionsTotales) * 100)
          : 0;

        const categoriePreferee = await prisma.partie.groupBy({
          by: ['categorieJouee'],
          where: { utilisateurId: Number(userId) },
          _count: {
            categorieJouee: true,
          },
          orderBy: {
            _count: {
              categorieJouee: 'desc',
            },
          },
          take: 1,
        });

        res.status(200).json({
            succes: true,
            stats: {
                pointsAccumules: pointsTotaux || 0,
                tauxReussite: `${tauxReussite}%`,
                partiesJouees: questionsTotales ? categoriePreferee.length : 0,
                categorieFavorite: categoriePreferee[0]?.categorieJouee || "Aucune"
            }
        });
    } catch (error: any) {
        res.status(500).json({ succes: false, message: error.message });
    }
};