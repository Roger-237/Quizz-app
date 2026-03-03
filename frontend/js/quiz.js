// Logique du quiz : récupération des questions, gestion du timer et envoi des réponses
(function () {
  const token = window.localStorage.getItem('token');

  const startBtn = document.getElementById('startQuizBtn');
  const nextBtn = document.getElementById('nextBtn');
  const categorieSelect = document.getElementById('categorie-select');
  const difficulteSelect = document.getElementById('difficulte-select');
  const quizEmpty = document.getElementById('quiz-empty');
  const quizActive = document.getElementById('quiz-active');
  const quizResult = document.getElementById('quiz-result');
  const statusEl = document.getElementById('quiz-status');
  const enonceEl = document.getElementById('quiz-question-title');
  const choicesEl = document.getElementById('choices');
  const timerLabel = document.getElementById('timer-label');
  const timerBar = document.getElementById('timer-bar');
  const questionIndexEl = document.getElementById('question-index');
  const questionTotalEl = document.getElementById('question-total');
  const metaCategorie = document.getElementById('meta-categorie');
  const metaDifficulte = document.getElementById('meta-difficulte');
  const metaPoints = document.getElementById('meta-points');
  const quizProgress = document.getElementById('quiz-progress');
  const dotsContainer = document.getElementById('questions-dots');
  const sidebarScore = document.getElementById('sidebar-score');
  const navUsername = document.getElementById('nav-username-quiz');
  const logoutBtn = document.getElementById('logoutBtn');

  const QUESTION_DURATION = 15; // en secondes

  let questions = [];
  let currentIndex = 0;
  let timer = null;
  let remainingSeconds = QUESTION_DURATION;
  const selectedAnswers = new Map(); // questionId -> reponseId

  const authHeaders = token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};

  const setStatus = (message, type = 'info') => {
    if (!statusEl) return;
    statusEl.textContent = message || '';
    statusEl.className = 'status-message mt-3';
    if (type === 'error') {
      statusEl.classList.add('status-message--error');
    } else if (type === 'success') {
      statusEl.classList.add('status-message--success');
    }
  };

  const attachLogout = () => {
    if (!logoutBtn) return;
    logoutBtn.addEventListener('click', async () => {
      try {
        await fetch(`${window.API_BASE_URL}/auth/deconnexion`, {
          method: 'POST',
          credentials: 'include',
        });
      } catch {
        // silencieux
      }
      window.localStorage.removeItem('token');
      window.location.href = 'index.html';
    });
  };

  const initUserName = () => {
    fetch(`${window.API_BASE_URL}/auth/check-auth`, {
      method: 'GET',
      credentials: 'include',
      headers: authHeaders,
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data || !data.succes || !data.utilisateur) return;
        const name = data.utilisateur.nom;
        if (navUsername) navUsername.textContent = name;
      })
      .catch(() => {
        // silencieux
      });
  };

  const resetTimer = () => {
    if (timer) {
      window.clearInterval(timer);
      timer = null;
    }
    remainingSeconds = QUESTION_DURATION;
    if (timerLabel) {
      timerLabel.textContent = `${remainingSeconds} s`;
    }
    if (timerBar) {
      timerBar.style.transform = 'scaleX(1)';
    }
  };

  const startTimer = () => {
    resetTimer();
    const total = QUESTION_DURATION;

    timer = window.setInterval(() => {
      remainingSeconds -= 1;

      if (remainingSeconds < 0) {
        // Temps écoulé : on passe automatiquement à la question suivante
        window.clearInterval(timer);
        timer = null;
        handleNextQuestion();
        return;
      }

      if (timerLabel) {
        timerLabel.textContent = `${remainingSeconds} s`;
      }
      if (timerBar) {
        const progress = remainingSeconds / total;
        timerBar.style.transform = `scaleX(${progress})`;
      }
    }, 1000);
  };

  const renderDots = () => {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';

    questions.forEach((q, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'pill-dot';

      if (index === currentIndex) {
        dot.classList.add('pill-dot--active');
      } else if (selectedAnswers.has(q.id)) {
        dot.classList.add('pill-dot--answered');
      }

      dot.textContent = String(index + 1);
      dot.title = `Question ${index + 1}`;
      dot.addEventListener('click', () => {
        goToQuestion(index);
      });
      dotsContainer.appendChild(dot);
    });
  };

  const renderDotsWithResults = (reponsesCorrectes) => {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';

    questions.forEach((q, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'pill-dot';

      const userAnswerId = selectedAnswers.get(q.id);
      const correctAnswerId = reponsesCorrectes[index];

      if (userAnswerId === correctAnswerId) {
        dot.classList.add('pill-dot--correct');
      } else if (userAnswerId) {
        dot.classList.add('pill-dot--incorrect');
      } else {
        dot.classList.add('pill-dot--answered');
      }

      dot.textContent = String(index + 1);
      dot.title = `Question ${index + 1} - ${userAnswerId === correctAnswerId ? 'Correct' : userAnswerId ? 'Incorrect' : 'Non répondue'}`;
      dotsContainer.appendChild(dot);
    });
  };

  const renderQuestion = () => {
    if (!questions.length || !choicesEl || !enonceEl) return;
    const question = questions[currentIndex];

    enonceEl.textContent = question.enonce;
    if (metaPoints) metaPoints.textContent = question.points ?? 0;

    const total = questions.length;
    if (questionIndexEl) questionIndexEl.textContent = String(currentIndex + 1);
    if (questionTotalEl) questionTotalEl.textContent = String(total);

    const answeredCount = selectedAnswers.size;
    if (quizProgress) {
      quizProgress.textContent = `${answeredCount}/${total} questions marquées comme répondues.`;
    }

    choicesEl.innerHTML = '';

    const existingAnswerId = selectedAnswers.get(question.id);

    (question.choix || []).forEach((choix) => {
      const choice = document.createElement('button');
      choice.type = 'button';
      choice.className = 'choice';

      const circle = document.createElement('span');
      circle.className = 'choice-input';

      const label = document.createElement('span');
      label.className = 'choice-label';
      label.textContent = choix.libelle;

      choice.appendChild(circle);
      choice.appendChild(label);

      if (existingAnswerId === choix.id) {
        choice.classList.add('selected');
      }

      choice.addEventListener('click', () => {
        // On sélectionne cette réponse et on désélectionne les autres
        selectedAnswers.set(question.id, choix.id);

        Array.from(choicesEl.children).forEach((node) => {
          node.classList.remove('selected');
        });
        choice.classList.add('selected');

        renderDots();
      });

      choicesEl.appendChild(choice);
    });

    // Met à jour les métadonnées affichées
    if (metaCategorie) {
      metaCategorie.textContent = (categorieSelect && categorieSelect.value) || '—';
    }
    if (metaDifficulte) {
      const diffValue = difficulteSelect && difficulteSelect.value;
      const label =
        diffValue === '1' ? 'Débutant' : diffValue === '2' ? 'Intermédiaire' : 'Avancé';
      metaDifficulte.textContent = label;
    }

    renderDots();
    startTimer();
  };

  const goToQuestion = (index) => {
    if (index < 0 || index >= questions.length) return;
    currentIndex = index;
    renderQuestion();
  };

  const finishQuiz = async () => {
    resetTimer();

    const reponsesUtilisateur = Array.from(selectedAnswers.values());

    if (!reponsesUtilisateur.length) {
      setStatus(
        "Aucune réponse sélectionnée. La partie ne sera pas enregistrée, mais tu peux relancer un quiz.",
        'error'
      );
      if (quizResult) {
        quizResult.hidden = false;
        quizResult.innerHTML =
          "<p>Aucune réponse n'a été envoyée. Essaie une nouvelle partie pour enregistrer un score.</p>";
      }
      return;
    }

    try {
      const categorie = categorieSelect && categorieSelect.value;
      const difficulte = difficulteSelect && difficulteSelect.value;

      const response = await fetch(`${window.API_BASE_URL}/quiz/soumettre`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...authHeaders,
        },
        credentials: 'include',
        body: JSON.stringify({
          reponsesUtilisateur,
          categorie,
          difficulte,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.succes) {
        setStatus(
          data.message || 'Impossible denregistrer ton score. Réessaie dans quelques instants.',
          'error'
        );
        return;
      }

      const resultats = data.resultats || {};
      const score = resultats.score ?? 0;
      const points = resultats.points ?? 0;
      const total = resultats.totalQuestions ?? questions.length;
      const reponsesCorrectes = resultats.reponsesCorrectes || [];

      if (sidebarScore) sidebarScore.textContent = String(score);

      // Afficher les résultats avec les couleurs vert/rouge
      showQuizResults(reponsesCorrectes);

      if (quizResult) {
        quizResult.hidden = false;
        quizResult.innerHTML = `
          <div class="badge mb-2">
            Résultats enregistrés
          </div>
          <p class="mt-1">
            Tu as obtenu <span class="text-accent">${score}/${total}</span> bonnes réponses
            pour un total de <span class="text-accent">${points} points</span>.
          </p>
          <p class="mt-2 text-xs muted">
            Tes statistiques globales et le classement ont été mis à jour automatiquement.
          </p>
          <p class="mt-2 text-xs">
            <a href="dashboard.html" class="text-accent">Retourner au tableau de bord</a>
            ou <button type="button" id="replayBtn" class="btn btn-ghost text-xs">Relancer un quiz</button>.
          </p>
        `;

        const replayBtn = document.getElementById('replayBtn');
        if (replayBtn) {
          replayBtn.addEventListener('click', () => {
            window.location.reload();
          });
        }
      }

      setStatus('Score enregistré avec succès ✅', 'success');
    } catch (error) {
      console.error(error);
      setStatus("Erreur réseau lors de l'enregistrement du score.", 'error');
    }
  };

  const showQuizResults = (reponsesCorrectes) => {
    // Mettre à jour les points de progression avec les couleurs
    renderDotsWithResults(reponsesCorrectes);
    
    // Afficher toutes les questions avec les réponses correctes/incorrectes
    questions.forEach((question, index) => {
      const userAnswerId = selectedAnswers.get(question.id);
      const correctAnswerId = reponsesCorrectes[index];
      
      // Recréer les choix pour cette question
      const choicesContainer = document.createElement('div');
      choicesContainer.className = 'choices-list';
      choicesContainer.style.marginBottom = 'var(--space-lg)';
      
      (question.choix || []).forEach((choix) => {
        const choice = document.createElement('button');
        choice.type = 'button';
        choice.className = 'choice';
        
        const circle = document.createElement('span');
        circle.className = 'choice-input';
        
        const label = document.createElement('span');
        label.className = 'choice-label';
        label.textContent = choix.libelle;
        
        choice.appendChild(circle);
        choice.appendChild(label);
        
        // Appliquer les couleurs en fonction de la réponse
        if (choix.id === correctAnswerId) {
          choice.classList.add('correct');
        } else if (choix.id === userAnswerId && choix.id !== correctAnswerId) {
          choice.classList.add('incorrect');
        }
        
        // Désactiver les clics
        choice.style.cursor = 'default';
        choice.style.pointerEvents = 'none';
        
        choicesContainer.appendChild(choice);
      });
      
      // Ajouter un titre pour la question
      const questionTitle = document.createElement('h3');
      questionTitle.style.marginBottom = 'var(--space-md)';
      questionTitle.style.color = 'var(--color-text)';
      questionTitle.style.fontSize = 'var(--font-size-lg)';
      questionTitle.style.fontWeight = '600';
      questionTitle.textContent = `Question ${index + 1}: ${question.enonce}`;
      
      // Ajouter au conteneur de résultats
      if (quizResult) {
        quizResult.appendChild(questionTitle);
        quizResult.appendChild(choicesContainer);
      }
    });
  };

  const handleNextQuestion = () => {
    if (!questions.length) return;
    if (currentIndex < questions.length - 1) {
      currentIndex += 1;
      renderQuestion();
    } else {
      // Fin du quiz
      if (quizActive) {
        quizActive.hidden = true;
      }
      finishQuiz();
    }
  };

  const loadQuiz = async () => {
    if (!categorieSelect || !difficulteSelect) return;
    const categorie = categorieSelect.value;
    const difficulte = difficulteSelect.value;

    setStatus('Chargement des questions…');
    if (quizResult) {
      quizResult.hidden = true;
      quizResult.innerHTML = '';
    }

    try {
      const params = new URLSearchParams({
        categorie,
        difficulte,
      });

      const response = await fetch(`${window.API_BASE_URL}/quiz?${params.toString()}`, {
        headers: {
          ...authHeaders,
        },
        credentials: 'include',
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.succes) {
        setStatus(
          data.message ||
            "Impossible de charger les questions pour ces critères. Essaie une autre combinaison.",
          'error'
        );
        return;
      }

      questions = data.questions || [];
      selectedAnswers.clear();
      currentIndex = 0;

      if (!questions.length) {
        setStatus("Aucune question trouvée pour ces critères.", 'error');
        if (quizEmpty) {
          quizEmpty.hidden = false;
          quizEmpty.textContent =
            "Aucune question disponible pour cette catégorie / difficulté. Essaie une autre combinaison.";
        }
        return;
      }

      if (quizEmpty) quizEmpty.hidden = true;
      if (quizActive) quizActive.hidden = false;
      if (quizResult) quizResult.hidden = true;

      setStatus('');
      renderQuestion();
    } catch (error) {
      console.error(error);
      setStatus("Erreur réseau lors du chargement du quiz.", 'error');
    }
  };

  const initEvents = () => {
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        loadQuiz();
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        handleNextQuestion();
      });
    }
  };

  // Init
  attachLogout();
  initUserName();
  initEvents();
})();

