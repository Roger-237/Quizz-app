import { db } from './index';
import { questions, reponses } from './schema';
import dotenv from 'dotenv';

dotenv.config();

const questionsData = [
  // --- HTML ( questions) ---
  {
    enonce: "Quelle balise est utilisée pour créer un lien hypertexte ?",
    categorie: "html",
    difficulte: 1,
    pointsValeur: 10,
    choix: [
      { libelle: "<a>", estCorrecte: true },
      { libelle: "<link>", estCorrecte: false },
      { libelle: "<href>", estCorrecte: false },
      { libelle: "<url>", estCorrecte: false },
    ]
  },
  {
    enonce: "Que signifie l'attribut 'alt' dans une balise <img> ?",
    categorie: "html",
    difficulte: 1,
    pointsValeur: 10,
    choix: [
      { libelle: "Texte alternatif pour l'accessibilité", estCorrecte: true },
      { libelle: "L'alignement de l'image", estCorrecte: false },
      { libelle: "Le lien de l'image", estCorrecte: false },
      { libelle: "La taille de l'image", estCorrecte: false },
    ]
  },
  // --- CSS ( questions) ---
  {
    enonce: "Quelle propriété permet de changer la couleur de fond ?",
    categorie: "css",
    difficulte: 1,
    pointsValeur: 10,
    choix: [
      { libelle: "background-color", estCorrecte: true },
      { libelle: "color", estCorrecte: false },
      { libelle: "bgcolor", estCorrecte: false },
      { libelle: "fill", estCorrecte: false },
    ]
  },
  // --- JAVASCRIPT ( questions) ---
  {
    enonce: "Comment déclare-t-on une constante en JS moderne ?",
    categorie: "javascript",
    difficulte: 1,
    pointsValeur: 10,
    choix: [
      { libelle: "const", estCorrecte: true },
      { libelle: "let", estCorrecte: false },
      { libelle: "var", estCorrecte: false },
      { libelle: "constant", estCorrecte: false },
    ]
  },
  // --- API ---
  {
    enonce: "Quelle méthode HTTP est utilisée pour créer une ressource ?",
    categorie: "api",
    difficulte: 2,
    pointsValeur: 20,
    choix: [
      { libelle: "POST", estCorrecte: true },
      { libelle: "GET", estCorrecte: false },
      { libelle: "PUT", estCorrecte: false },
      { libelle: "DELETE", estCorrecte: false },
    ]
  }
  // ... Ajoute ici le reste des 50 questions sur le même modèle
];

async function seed() {
  console.log(" Début du remplissage de la base de données...");

  try {
    for (const q of questionsData) {
      // 1. Insertion de la question
      const resQuestion = await db.insert(questions).values({
        enonce: q.enonce,
        categorie: q.categorie,
        difficulte: q.difficulte,
        pointsValeur: q.pointsValeur,
      }).returning({ id: questions.id });

      const questionId = resQuestion[0].id;

      // 2. Insertion des réponses liées à cette question
      await db.insert(reponses).values(
        q.choix.map(c => ({
          libelle: c.libelle,
          estCorrecte: c.estCorrecte,
          questionId: questionId
        }))
      );
    }

    console.log(" Base de données remplie avec succès !");
  } catch (error) {
    console.error("Erreur lors du seeding :", error);
  } finally {
    process.exit();
  }
}

seed();