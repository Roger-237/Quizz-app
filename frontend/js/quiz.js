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
            <div class="result-title">⚠️ Accès Restreint</div>
            <p style="font-size: 1.2rem; margin: 1rem 0;">Veuillez vous connecter pour accéder au quiz</p>
            <button class="btn-restart" onclick="window.location.href='index.html'">
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

      if (!data.succes) {
        window.authService.showAlert(data.message || 'Impossible de charger les questions', 'error');
        return;
      }

      this.questions = data.questions || [];
      this.selectedAnswers.clear();
      this.currentIndex = 0;

      if (!this.questions.length) {
        window.authService.showAlert('Aucune question disponible', 'error');
        return;
      }

      this.showQuizInterface();
      this.displayQuestion();
    } catch (error) {
      console.error('Erreur chargement quiz:', error);
      window.authService.showAlert('Erreur lors du chargement du quiz', 'error');
    }
  }

  showQuizInterface() {
    const quizEmpty = document.getElementById('quiz-empty');
    const quizActive = document.getElementById('quiz-active');
    const quizResult = document.getElementById('quiz-result');

    if (quizEmpty) quizEmpty.hidden = true;
    if (quizActive) quizActive.hidden = false;
    if (quizResult) quizResult.hidden = true;
  }

  displayQuestion() {
    if (this.currentIndex >= this.questions.length) {
      this.submitQuiz();
      return;
    }

    const question = this.questions[this.currentIndex];
    const enonceEl = document.getElementById('quiz-question-title');
    const choicesEl = document.getElementById('choices');
    const questionIndexEl = document.getElementById('question-index');
    const questionTotalEl = document.getElementById('question-total');
    const metaCategorie = document.getElementById('meta-categorie');
    const metaDifficulte = document.getElementById('meta-difficulte');
    const metaPoints = document.getElementById('meta-points');

    if (enonceEl) enonceEl.textContent = question.enonce;
    if (questionIndexEl) questionIndexEl.textContent = this.currentIndex + 1;
    if (questionTotalEl) questionTotalEl.textContent = this.questions.length;
    if (metaCategorie) metaCategorie.textContent = question.categorie || '—';
    if (metaDifficulte) metaDifficulte.textContent = question.difficulte || '—';
    if (metaPoints) metaPoints.textContent = question.points || '—';

    // Afficher les choix avec le nouveau design
    if (choicesEl) {
      choicesEl.innerHTML = '';
      choicesEl.className = 'choix-liste';
      
      if (!question.choix || question.choix.length === 0) {
        console.error('Aucun choix trouvé pour la question:', question);
        const errorDiv = document.createElement('div');
        errorDiv.textContent = 'Aucune réponse disponible';
        errorDiv.style.padding = 'var(--space-md)';
        errorDiv.style.color = 'var(--color-danger)';
        choicesEl.appendChild(errorDiv);
        return;
      }
      
      question.choix.forEach((choix, index) => {
        const choiceDiv = document.createElement('div');
        choiceDiv.className = 'choix-item';
        choiceDiv.innerHTML = `
          <input type="radio" name="answer" value="${choix.id}" id="choice-${index}">
          <label for="choice-${index}">${choix.libelle}</label>
        `;
        
        choiceDiv.addEventListener('click', () => {
          // Désélectionner tous les autres choix
          document.querySelectorAll('.choix-item').forEach(item => {
            item.classList.remove('selected');
          });
          
          // Sélectionner le choix actuel
          choiceDiv.classList.add('selected');
          document.getElementById(`choice-${index}`).checked = true;
          this.selectedAnswers.set(question.id, choix.id);
        });

        choicesEl.appendChild(choiceDiv);
      });
    }

    this.startTimer();
    this.updateProgress();
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
      }

      if (timerBar) {
        const scale = this.remainingSeconds / total;
        timerBar.style.width = `${Math.max(0, scale * 100)}%`;
        timerBar.classList.add('barre-minuteur');
      }

      if (this.remainingSeconds <= 0) {
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
    
    if (timerLabel) timerLabel.textContent = '15 s';
    if (timerBar) {
      timerBar.style.width = '100%';
      timerBar.classList.add('barre-minuteur');
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
      quizResult.className = 'quiz-result';
      
      const score = resultats?.score || 0;
      const points = resultats?.points || 0;
      const total = this.questions.length;

      quizResult.innerHTML = `
        <div class="result-title">🎉 Quiz Terminé !</div>
        <div class="result-score">${score}/${total}</div>
        <div class="result-points">Points gagnés : ${points}</div>
        <button class="btn-restart" onclick="location.reload()">
          Nouveau quiz
        </button>
      `;
    }

    if (sidebarScore) sidebarScore.textContent = resultats?.score || 0;
  }
}

// Initialiser le gestionnaire de quiz professionnel
document.addEventListener('DOMContentLoaded', () => {
  new ProfessionalQuizManager();
});
