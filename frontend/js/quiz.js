// Quiz professionnel avec interface moderne et responsive
class ProfessionalQuizManager {
  constructor() {
    this.questions = [];
    this.currentIndex = 0;
    this.timer = null;
    this.remainingSeconds = 15;
    this.selectedAnswers = new Map();
    this.init();
  }

  async init() {
    // Attendre que l'auth soit initialisé
    if (!window.authService.isInitialized) {
      await new Promise(resolve => {
        const checkInit = () => {
          if (window.authService.isInitialized) {
            resolve();
          } else {
            setTimeout(checkInit, 100);
          }
        };
        checkInit();
      });
    }

    // Vérifier l'authentification
    if (!window.authService.isAuthenticated()) {
      this.showAuthError();
      return;
    }

    this.setupEventListeners();
    this.updateUserInfo();
    this.initializeUI();
  }

  showAuthError() {
    const container = document.querySelector('.page-main') || document.querySelector('main');
    if (container) {
      container.innerHTML = `
        <div class="quiz-container">
          <div class="quiz-result">
            <div class="result-title" style="background: linear-gradient(135deg, #f87171 0%, #ef4444 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">⚠️ Accès Restreint</div>
            <p>Veuillez vous connecter pour accéder au quiz</p>
            <button class="btn-restart" style="background: linear-gradient(135deg, black 0%, black 100%); color: white; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; font-size: 0.875rem; border: none; cursor: pointer; transition: background 0.3s ease;" onclick="window.location.href='index.html'">
              Retour à l'accueil
            </button>
          </div>
        </div>
      `;
    }
  }

  initializeUI() {
    // S'assurer que l'interface est correctement initialisée
    const quizEmpty = document.getElementById('quiz-empty');
    const quizActive = document.getElementById('quiz-active');
    const quizResult = document.getElementById('quiz-result');

    if (quizEmpty) quizEmpty.hidden = false;
    if (quizActive) quizActive.hidden = true;
    if (quizResult) quizResult.hidden = true;
  }

  updateUserInfo() {
    const user = window.authService.getCurrentUser();
    const navUsername = document.getElementById('nav-username-quiz');
    if (navUsername && user) {
      navUsername.textContent = user.nom || user.nomUtilisateur || 'Utilisateur';
    }
  }

  setupEventListeners() {
    const startBtn = document.getElementById('startQuizBtn');
    const nextBtn = document.getElementById('nextBtn');

    if (startBtn) {
      startBtn.addEventListener('click', () => this.startQuiz());
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.nextQuestion());
    }
  }

  async startQuiz() {
    const categorieSelect = document.getElementById('categorie-select');
    const difficulteSelect = document.getElementById('difficulte-select');
    const categorie = categorieSelect?.value;
    const difficulte = difficulteSelect?.value;

    if (!categorie || !difficulte) {
      window.authService.showAlert('Veuillez sélectionner une catégorie et une difficulté', 'error');
      return;
    }

    try {
      const params = new URLSearchParams({ categorie, difficulte });
      const data = await window.authService.apiRequest(`/quiz?${params.toString()}`);

      if (!data || !data.succes) {
        const errorMsg = data?.message || 'Impossible de charger les questions';
        console.error('Erreur API quiz:', data);
        window.authService.showAlert(errorMsg, 'error');
        return;
      }

      this.questions = data.questions || [];
      
      // Vérifier que les questions sont valides
      if (!Array.isArray(this.questions) || this.questions.length === 0) {
        console.error('Aucune question reçue de l\'API:', data);
        window.authService.showAlert('Aucune question disponible pour ces critères', 'error');
        return;
      }

      // Valider la structure des questions
      for (let i = 0; i < this.questions.length; i++) {
        const q = this.questions[i];
        if (!q.id || !q.enonce || !Array.isArray(q.choix) || q.choix.length === 0) {
          console.error(`Question invalide à l'index ${i}:`, q);
          window.authService.showAlert('Les données des questions sont invalides', 'error');
          return;
        }
      }

      this.selectedAnswers.clear();
      this.currentIndex = 0;

      console.log(`Quiz démarré avec ${this.questions.length} questions`);
      this.showQuizInterface();
      this.displayQuestion();
    } catch (error) {
      console.error('Erreur chargement quiz:', error);
      window.authService.showAlert('Erreur lors du chargement du quiz: ' + (error.message || 'Erreur inconnue'), 'error');
    }
  }

  showQuizInterface() {
    const quizEmpty = document.getElementById('quiz-empty');
    const quizActive = document.getElementById('quiz-active');
    const quizResult = document.getElementById('quiz-result');

    // Vérifier que les éléments existent
    if (!quizActive) {
      console.error('Élément quiz-active non trouvé dans le DOM');
      return;
    }

    if (quizEmpty) quizEmpty.hidden = true;
    if (quizActive) {
      quizActive.hidden = false;
      quizActive.style.display = 'block'; // S'assurer que l'élément est affiché
    }
    if (quizResult) quizResult.hidden = true;
  }

  displayQuestion() {
    if (this.currentIndex >= this.questions.length) {
      this.submitQuiz();
      return;
    }

    const question = this.questions[this.currentIndex];
    
    // Vérifier que la question existe
    if (!question) {
      console.error('Question non trouvée à l\'index:', this.currentIndex);
      this.nextQuestion();
      return;
    }

    const enonceEl = document.getElementById('quiz-question-title');
    const choicesEl = document.getElementById('choices');
    const questionIndexEl = document.getElementById('question-index');
    const questionTotalEl = document.getElementById('question-total');
    const metaCategorie = document.getElementById('meta-categorie');
    const metaDifficulte = document.getElementById('meta-difficulte');
    const metaPoints = document.getElementById('meta-points');

    // Vérifier que tous les éléments critiques existent
    if (!enonceEl || !choicesEl) {
      console.error('Éléments critiques manquants - quiz-question-title ou choices non trouvés');
      return;
    }

    // Afficher la question
    enonceEl.textContent = question.enonce || 'Question sans énoncé';
    
    if (questionIndexEl) questionIndexEl.textContent = this.currentIndex + 1;
    if (questionTotalEl) questionTotalEl.textContent = this.questions.length;
    if (metaCategorie) metaCategorie.textContent = question.categorie || '—';
    if (metaDifficulte) metaDifficulte.textContent = this.getDifficultyLabel(question.difficulte);
    if (metaPoints) metaPoints.textContent = question.points || '—';

    // Afficher les choix avec le nouveau design
    choicesEl.innerHTML = '';
    choicesEl.className = 'choix-liste';
    
    // Vérifier la structure des choix
    if (!question.choix || !Array.isArray(question.choix) || question.choix.length === 0) {
      console.error('Aucun choix trouvé pour la question:', question);
      const errorDiv = document.createElement('div');
      errorDiv.textContent = 'Aucune réponse disponible';
      errorDiv.style.padding = '1rem';
      errorDiv.style.color = '#ff5c6c';
      choicesEl.appendChild(errorDiv);
      this.startTimer();
      this.updateProgress();
      return;
    }
    
    // Créer les éléments de choix
    question.choix.forEach((choix, index) => {
      // Vérifier que le choix a un ID et un libellé
      if (!choix.id || !choix.libelle) {
        console.warn('Choix invalide:', choix);
        return;
      }

      const choiceDiv = document.createElement('div');
      choiceDiv.className = 'choix-item';
      
      // Créer le contenu HTML
      const radioInput = document.createElement('input');
      radioInput.type = 'radio';
      radioInput.name = 'answer';
      radioInput.value = String(choix.id);
      radioInput.id = `choice-${index}`;
      
      const label = document.createElement('label');
      label.htmlFor = `choice-${index}`;
      label.textContent = choix.libelle;
      label.style.flex = '1';
      label.style.cursor = 'pointer';
      label.style.marginLeft = '0.5rem';
      
      choiceDiv.appendChild(radioInput);
      choiceDiv.appendChild(label);
      
      // Ajouter les styles de hover
      choiceDiv.addEventListener('mouseenter', () => {
        choiceDiv.style.backgroundColor = 'var(--color-surface-hover)';
        choiceDiv.style.borderColor = 'var(--color-primary)';
      });
      
      choiceDiv.addEventListener('mouseleave', () => {
        if (!choiceDiv.classList.contains('selected')) {
          choiceDiv.style.backgroundColor = 'var(--color-surface)';
          choiceDiv.style.borderColor = 'var(--color-border)';
        }
      });
      
      choiceDiv.addEventListener('click', () => {
        // Désélectionner tous les autres choix
        document.querySelectorAll('.choix-item').forEach(item => {
          item.classList.remove('selected');
        });
        
        // Sélectionner le choix actuel
        choiceDiv.classList.add('selected');
        radioInput.checked = true;
        this.selectedAnswers.set(question.id, choix.id);
      });

      choicesEl.appendChild(choiceDiv);
    });

    this.startTimer();
    this.updateProgress();
  }

  getDifficultyLabel(difficulty) {
    const labels = {
      '1': 'Débutant',
      '2': 'Intermédiaire',
      '3': 'Avancé',
      1: 'Débutant',
      2: 'Intermédiaire',
      3: 'Avancé'
    };
    return labels[difficulty] || `Niveau ${difficulty}`;
  }

  startTimer() {
    this.resetTimer();
    const total = 15;

    this.timer = window.setInterval(() => {
      this.remainingSeconds -= 1;

      const timerLabel = document.getElementById('timer-label');
      const timerBar = document.getElementById('timer-bar');

      if (timerLabel) {
        timerLabel.textContent = `${this.remainingSeconds} s`;
        // Changer la couleur du timer si le temps s'écoule
        if (this.remainingSeconds <= 5) {
          timerLabel.style.color = 'var(--color-danger)';
        } else if (this.remainingSeconds <= 10) {
          timerLabel.style.color = 'var(--color-warning)';
        }
      }

      if (timerBar) {
        const scale = this.remainingSeconds / total;
        timerBar.style.width = `${Math.max(0, scale * 100)}%`;
        // Changer la couleur de la barre si le temps s'écoule
        if (this.remainingSeconds <= 5) {
          timerBar.style.backgroundColor = 'var(--color-danger)';
        } else if (this.remainingSeconds <= 10) {
          timerBar.style.backgroundColor = 'var(--color-warning)';
        }
      }

      if (this.remainingSeconds <= 0) {
        clearInterval(this.timer);
        this.nextQuestion();
      }
    }, 1000);
  }

  resetTimer() {
    if (this.timer) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
    this.remainingSeconds = 15;
    
    const timerLabel = document.getElementById('timer-label');
    const timerBar = document.getElementById('timer-bar');
    
    if (timerLabel) {
      timerLabel.textContent = '15 s';
      timerLabel.style.color = 'var(--color-warning)';
    }
    if (timerBar) {
      timerBar.style.width = '100%';
      timerBar.style.backgroundColor = 'var(--color-warning)';
      timerBar.style.transition = 'width 1s linear';
    }
  }

  nextQuestion() {
    this.resetTimer();
    this.currentIndex++;
    this.displayQuestion();
  }

  updateProgress() {
    const progressEl = document.getElementById('quiz-progress');
    if (progressEl) {
      progressEl.textContent = `Question ${this.currentIndex + 1} sur ${this.questions.length}`;
    }
  }

  async submitQuiz() {
    const answers = Array.from(this.selectedAnswers.values());
    
    if (answers.length === 0) {
      window.authService.showAlert('Veuillez répondre à au moins une question', 'error');
      return;
    }

    try {
      const categorieSelect = document.getElementById('categorie-select');
      const difficulteSelect = document.getElementById('difficulte-select');
      const categorie = categorieSelect?.value;
      const difficulte = difficulteSelect?.value;

      const data = await window.authService.apiRequest('/quiz/soumettre', {
        method: 'POST',
        body: JSON.stringify({
          reponsesUtilisateur: answers,
          categorie,
          difficulte,
        }),
      });

      if (!data.succes) {
        window.authService.showAlert(data.message || 'Erreur lors de la soumission', 'error');
        return;
      }

      this.showResults(data.resultats);
    } catch (error) {
      console.error('Erreur soumission:', error);
      window.authService.showAlert('Erreur lors de la soumission', 'error');
    }
  }

  showResults(resultats) {
    this.resetTimer();

    const quizActive = document.getElementById('quiz-active');
    const quizResult = document.getElementById('quiz-result');
    const sidebarScore = document.getElementById('sidebar-score');

    if (quizActive) quizActive.hidden = true;
    if (quizResult) {
      quizResult.hidden = false;
      quizResult.className = 'texte-centre';
      quizResult.style.padding = '3rem 1rem';
      
      const score = resultats?.score || 0;
      const points = resultats?.points || 0;
      const total = this.questions.length;
      const percentage = Math.round((score / total) * 100);

      // Créer les éléments pour les résultats
      quizResult.innerHTML = '';
      
      // Titre
      const title = document.createElement('div');
      title.style.fontSize = '2.5rem';
      title.style.fontWeight = '700';
      title.style.marginBottom = '1.5rem';
      title.style.color = 'var(--color-success)';
      title.textContent = '🎉 Quiz Terminé !';
      quizResult.appendChild(title);
      
      // Score
      const scoreDiv = document.createElement('div');
      scoreDiv.style.fontSize = '3rem';
      scoreDiv.style.fontWeight = '700';
      scoreDiv.style.marginBottom = '1rem';
      scoreDiv.style.color = 'var(--color-primary)';
      scoreDiv.textContent = `${score}/${total}`;
      quizResult.appendChild(scoreDiv);
      
      // Pourcentage
      const percentageDiv = document.createElement('div');
      percentageDiv.style.fontSize = '1.25rem';
      percentageDiv.style.marginBottom = '1.5rem';
      percentageDiv.style.color = 'var(--color-text-secondary)';
      percentageDiv.textContent = `${percentage}% de bonnes réponses`;
      quizResult.appendChild(percentageDiv);
      
      // Points gagnés
      const pointsDiv = document.createElement('div');
      pointsDiv.style.fontSize = '1.5rem';
      pointsDiv.style.fontWeight = '600';
      pointsDiv.style.marginBottom = '2rem';
      pointsDiv.style.color = 'var(--color-success)';
      pointsDiv.textContent = `+${points} points gagnés`;
      quizResult.appendChild(pointsDiv);
      
      // Bouton Nouveau quiz
      const button = document.createElement('button');
      button.className = 'bouton bouton--primaire bouton--grand';
      button.textContent = 'Nouveau quiz';
      button.style.marginTop = '1rem';
      button.onclick = () => location.reload();
      quizResult.appendChild(button);
    }

    if (sidebarScore) sidebarScore.textContent = resultats?.score || 0;
  }
}

// Initialiser le gestionnaire de quiz professionnel
document.addEventListener('DOMContentLoaded', () => {
  new ProfessionalQuizManager();
});
