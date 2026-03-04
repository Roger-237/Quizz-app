-- CreateTable
CREATE TABLE "utilisateurs" (
    "id" SERIAL NOT NULL,
    "nom_utilisateur" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "mot_de_passe_hash" TEXT NOT NULL,
    "points_totaux" INTEGER NOT NULL DEFAULT 0,
    "date_inscription" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "utilisateurs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questions" (
    "id" SERIAL NOT NULL,
    "enonce" TEXT NOT NULL,
    "categorie" TEXT NOT NULL,
    "difficulte" INTEGER NOT NULL,
    "points_valeur" INTEGER NOT NULL,

    CONSTRAINT "questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reponses" (
    "id" SERIAL NOT NULL,
    "libelle" TEXT NOT NULL,
    "est_correcte" BOOLEAN NOT NULL DEFAULT false,
    "question_id" INTEGER NOT NULL,

    CONSTRAINT "reponses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "parties" (
    "id" SERIAL NOT NULL,
    "score_obtenu" INTEGER NOT NULL,
    "total_questions" INTEGER NOT NULL,
    "points_gagnes" INTEGER NOT NULL,
    "categorie_jouee" TEXT NOT NULL,
    "niveau_difficulte" INTEGER NOT NULL,
    "joue_le" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "utilisateur_id" INTEGER NOT NULL,

    CONSTRAINT "parties_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_nom_utilisateur_key" ON "utilisateurs"("nom_utilisateur");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateurs_email_key" ON "utilisateurs"("email");

-- AddForeignKey
ALTER TABLE "reponses" ADD CONSTRAINT "reponses_question_id_fkey" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parties" ADD CONSTRAINT "parties_utilisateur_id_fkey" FOREIGN KEY ("utilisateur_id") REFERENCES "utilisateurs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
