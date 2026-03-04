import { pgTable, serial, text, integer, boolean, timestamp, foreignKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// 1. Table Utilisateurs
export const utilisateurs = pgTable('utilisateurs', {
  id: serial('id').primaryKey(),
  nomUtilisateur: text('nom_utilisateur').notNull().unique(),
  email: text('email').notNull().unique(),
  motDePasseHash: text('mot_de_passe_hash').notNull(),
  pointsTotaux: integer('points_totaux').default(0),
  dateInscription: timestamp('date_inscription').defaultNow(),
});

// 2. Table Questions
export const questions = pgTable('questions', {
  id: serial('id').primaryKey(),
  enonce: text('enonce').notNull(),
  categorie: text('categorie').notNull(),
  difficulte: integer('difficulte').notNull(), // 1, 2, 3
  pointsValeur: integer('points_valeur').notNull(),
});

// 3. Table Réponses
export const reponses = pgTable('reponses', {
  id: serial('id').primaryKey(),
  libelle: text('libelle').notNull(),
  estCorrecte: boolean('est_correcte').default(false),
  questionId: integer('question_id').references(() => questions.id, { onDelete: 'cascade' }),
});

// 4. Table Parties (Historique Dashboard)
export const parties = pgTable('parties', {
  id: serial('id').primaryKey(),
  scoreObtenu: integer('score_obtenu').notNull(),
  totalQuestions: integer('total_questions').notNull(),
  pointsGagnes: integer('points_gagnes').notNull(),
  categorieJouee: text('categorie_jouee').notNull(),
  niveauDifficulte: integer('niveau_difficulte').notNull(),
  joueLe: timestamp('joue_le').defaultNow(),
  utilisateurId: integer('utilisateur_id').references(() => utilisateurs.id),
});

// --- DÉFINITION DES RELATIONS (Pour faciliter les jointures avec Drizzle Queries) ---

export const utilisateursRelations = relations(utilisateurs, ({ many }) => ({
  parties: many(parties),
}));

export const questionsRelations = relations(questions, ({ many }) => ({
  reponses: many(reponses),
}));

export const reponsesRelations = relations(reponses, ({ one }) => ({
  question: one(questions, {
    fields: [reponses.questionId],
    references: [questions.id],
  }),
}));

export const partiesRelations = relations(parties, ({ one }) => ({
  utilisateur: one(utilisateurs, {
    fields: [parties.utilisateurId],
    references: [utilisateurs.id],
  }),
}));