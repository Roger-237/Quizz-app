import { prisma } from "./index";

const questionsData = [

/* =====================================================
   HTML (25)
===================================================== */

{
enonce: "Quelle balise est utilisée pour créer un lien hypertexte ?",
categorie: "html",
difficulte: 1,
pointsValeur: 10,
choix: [
{ libelle: "<a>", estCorrecte: true },
{ libelle: "<link>", estCorrecte: false },
{ libelle: "<href>", estCorrecte: false },
{ libelle: "<nav>", estCorrecte: false },
],
},
{
enonce: "Quelle balise permet d'insérer une image ?",
categorie: "html",
difficulte: 1,
pointsValeur: 10,
choix: [
{ libelle: "<img>", estCorrecte: true },
{ libelle: "<image>", estCorrecte: false },
{ libelle: "<picture>", estCorrecte: false },
{ libelle: "<src>", estCorrecte: false },
],
},
{
enonce: "Quelle balise contient les métadonnées ?",
categorie: "html",
difficulte: 1,
pointsValeur: 10,
choix: [
{ libelle: "<head>", estCorrecte: true },
{ libelle: "<meta>", estCorrecte: false },
{ libelle: "<header>", estCorrecte: false },
{ libelle: "<body>", estCorrecte: false },
],
},
{
enonce: "Quelle balise définit un paragraphe ?",
categorie: "html",
difficulte: 1,
pointsValeur: 10,
choix: [
{ libelle: "<p>", estCorrecte: true },
{ libelle: "<para>", estCorrecte: false },
{ libelle: "<text>", estCorrecte: false },
{ libelle: "<span>", estCorrecte: false },
],
},
{
enonce: "Quelle balise crée une liste non ordonnée ?",
categorie: "html",
difficulte: 1,
pointsValeur: 10,
choix: [
{ libelle: "<ul>", estCorrecte: true },
{ libelle: "<ol>", estCorrecte: false },
{ libelle: "<li>", estCorrecte: false },
{ libelle: "<list>", estCorrecte: false },
],
},
{
enonce: "Quelle balise crée une liste ordonnée ?",
categorie: "html",
difficulte: 1,
pointsValeur: 10,
choix: [
{ libelle: "<ol>", estCorrecte: true },
{ libelle: "<ul>", estCorrecte: false },
{ libelle: "<li>", estCorrecte: false },
{ libelle: "<order>", estCorrecte: false },
],
},
{
enonce: "Quelle balise représente le contenu principal ?",
categorie: "html",
difficulte: 2,
pointsValeur: 15,
choix: [
{ libelle: "<main>", estCorrecte: true },
{ libelle: "<section>", estCorrecte: false },
{ libelle: "<article>", estCorrecte: false },
{ libelle: "<div>", estCorrecte: false },
],
},
{
enonce: "Quel attribut rend un champ obligatoire ?",
categorie: "html",
difficulte: 2,
pointsValeur: 15,
choix: [
{ libelle: "required", estCorrecte: true },
{ libelle: "validate", estCorrecte: false },
{ libelle: "mandatory", estCorrecte: false },
{ libelle: "checked", estCorrecte: false },
],
},
{
enonce: "Quel attribut définit un texte alternatif pour une image ?",
categorie: "html",
difficulte: 1,
pointsValeur: 10,
choix: [
{ libelle: "alt", estCorrecte: true },
{ libelle: "title", estCorrecte: false },
{ libelle: "src", estCorrecte: false },
{ libelle: "name", estCorrecte: false },
],
},
{
enonce: "Quelle balise permet d'insérer une vidéo ?",
categorie: "html",
difficulte: 2,
pointsValeur: 15,
choix: [
{ libelle: "<video>", estCorrecte: true },
{ libelle: "<media>", estCorrecte: false },
{ libelle: "<movie>", estCorrecte: false },
{ libelle: "<mp4>", estCorrecte: false },
],
},

/* (HTML continue jusqu’à 25…) */

/* =====================================================
   CSS (25)
===================================================== */

{
enonce: "Quelle propriété change la couleur du texte ?",
categorie: "css",
difficulte: 1,
pointsValeur: 10,
choix: [
{ libelle: "color", estCorrecte: true },
{ libelle: "font-color", estCorrecte: false },
{ libelle: "text-style", estCorrecte: false },
{ libelle: "background-color", estCorrecte: false },
],
},
{
enonce: "Quelle propriété change la couleur de fond ?",
categorie: "css",
difficulte: 1,
pointsValeur: 10,
choix: [
{ libelle: "background-color", estCorrecte: true },
{ libelle: "color", estCorrecte: false },
{ libelle: "bgcolor", estCorrecte: false },
{ libelle: "fill", estCorrecte: false },
],
},
{
enonce: "Quelle propriété active Flexbox ?",
categorie: "css",
difficulte: 2,
pointsValeur: 15,
choix: [
{ libelle: "display: flex", estCorrecte: true },
{ libelle: "position: flex", estCorrecte: false },
{ libelle: "flex: true", estCorrecte: false },
{ libelle: "layout: flex", estCorrecte: false },
],
},
{
enonce: "Quelle propriété définit la taille du texte ?",
categorie: "css",
difficulte: 1,
pointsValeur: 10,
choix: [
{ libelle: "font-size", estCorrecte: true },
{ libelle: "text-size", estCorrecte: false },
{ libelle: "size", estCorrecte: false },
{ libelle: "font-style", estCorrecte: false },
],
},
{
enonce: "Quelle propriété centre horizontalement avec flex ?",
categorie: "css",
difficulte: 2,
pointsValeur: 15,
choix: [
{ libelle: "justify-content: center", estCorrecte: true },
{ libelle: "align-text: center", estCorrecte: false },
{ libelle: "text-align: center", estCorrecte: false },
{ libelle: "margin: center", estCorrecte: false },
],
},

/* CSS continue jusqu’à 25 */

/* =====================================================
   JAVASCRIPT (25)
===================================================== */

{
enonce: "Comment déclare-t-on une constante ?",
categorie: "javascript",
difficulte: 1,
pointsValeur: 10,
choix: [
{ libelle: "const", estCorrecte: true },
{ libelle: "let", estCorrecte: false },
{ libelle: "var", estCorrecte: false },
{ libelle: "constant", estCorrecte: false },
],
},
{
enonce: "Quelle méthode convertit un objet en JSON ?",
categorie: "javascript",
difficulte: 2,
pointsValeur: 15,
choix: [
{ libelle: "JSON.stringify()", estCorrecte: true },
{ libelle: "JSON.parse()", estCorrecte: false },
{ libelle: "JSON.object()", estCorrecte: false },
{ libelle: "JSON.convert()", estCorrecte: false },
],
},
{
enonce: "Quelle méthode sélectionne un élément par ID ?",
categorie: "javascript",
difficulte: 1,
pointsValeur: 10,
choix: [
{ libelle: "document.getElementById()", estCorrecte: true },
{ libelle: "querySelectorAll()", estCorrecte: false },
{ libelle: "getElement()", estCorrecte: false },
{ libelle: "document.id()", estCorrecte: false },
],
},
{
enonce: "Quel mot-clé crée une fonction fléchée ?",
categorie: "javascript",
difficulte: 2,
pointsValeur: 15,
choix: [
{ libelle: "=>", estCorrecte: true },
{ libelle: "function", estCorrecte: false },
{ libelle: "arrow", estCorrecte: false },
{ libelle: "->", estCorrecte: false },
],
},

/* JS continue jusqu’à 25 */

/* =====================================================
   TYPESCRIPT (25)
===================================================== */

{
enonce: "Quel mot-clé définit une interface ?",
categorie: "typescript",
difficulte: 1,
pointsValeur: 10,
choix: [
{ libelle: "interface", estCorrecte: true },
{ libelle: "type", estCorrecte: false },
{ libelle: "class", estCorrecte: false },
{ libelle: "implements", estCorrecte: false },
],
},
{
enonce: "Comment définit-on un type union ?",
categorie: "typescript",
difficulte: 2,
pointsValeur: 15,
choix: [
{ libelle: "string | number", estCorrecte: true },
{ libelle: "string & number", estCorrecte: false },
{ libelle: "union<string, number>", estCorrecte: false },
{ libelle: "string, number", estCorrecte: false },
],
},
{
enonce: "Quel mot-clé rend une propriété optionnelle ?",
categorie: "typescript",
difficulte: 2,
pointsValeur: 15,
choix: [
{ libelle: "?", estCorrecte: true },
{ libelle: "optional", estCorrecte: false },
{ libelle: "nullable", estCorrecte: false },
{ libelle: "void", estCorrecte: false },
],
},

/* TypeScript continue jusqu’à 25 */

];

async function seed() {
  console.log("Début du remplissage...");

  try {
    for (const q of questionsData) {
      const question = await prisma.question.create({
        data: {
          enonce: q.enonce,
          categorie: q.categorie,
          difficulte: q.difficulte,
          pointsValeur: q.pointsValeur,
        },
      });

      await prisma.reponse.createMany({
        data: q.choix.map((c) => ({
          libelle: c.libelle,
          estCorrecte: c.estCorrecte,
          questionId: question.id,
        })),
      });
    }

    console.log("Base remplie avec succès !");
  } catch (error) {
    console.error(error);
  } finally {
    await prisma.$disconnect();
    process.exit();
  }
}

seed();