// Dashboard professionnel avec interface moderne
class ProfessionalDashboardManager {
  constructor() {
    this.init();
  }

  async init() {
    // Injecter les styles professionnels
    this.injectStyles();
    
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

    this.updateUserInfo();
    this.loadStats();
    this.loadHistory();
  }

  injectStyles() {
    const styles = `
      <style>
        .dashboard-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .dashboard-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .dashboard-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .dashboard-subtitle {
          font-size: 1.1rem;
          color: #64748b;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          text-align: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
        }

        .stat-icon {
          width: 60px;
          height: 60px;
          margin: 0 auto 1rem;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 1rem;
          color: #64748b;
          font-weight: 500;
        }

        .history-section {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f1f5f9;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1e293b;
        }

        .history-table {
          width: 100%;
          border-collapse: collapse;
        }

        .history-table th {
          background: #f8fafc;
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
        }

        .history-table td {
          padding: 1rem;
          border-bottom: 1px solid #f1f5f9;
        }

        .history-table tr:hover {
          background: #f8fafc;
        }

        .score-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .score-good {
          background: #dcfce7;
          color: #166534;
        }

        .score-medium {
          background: #fef3c7;
          color: #92400e;
        }

        .score-low {
          background: #fee2e2;
          color: #991b1b;
        }

        .points-badge {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #64748b;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .empty-description {
          color: #94a3b8;
        }

        .loading-spinner {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid #f3f4f6;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .dashboard-container {
            padding: 1rem;
          }

          .dashboard-title {
            font-size: 2rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .stat-card {
            padding: 1.5rem;
          }

          .stat-value {
            font-size: 2rem;
          }

          .section-header {
            flex-direction: column;
            align-items: stretch;
            gap: 1rem;
          }

          .history-table {
            font-size: 0.9rem;
          }

          .history-table th,
          .history-table td {
            padding: 0.75rem 0.5rem;
          }

          .score-badge,
          .points-badge {
            font-size: 0.75rem;
            padding: 0.2rem 0.5rem;
          }
        }
      </style>
    `;
    document.head.insertAdjacentHTML('beforeend', styles);
  }

  showAuthError() {
    const container = document.querySelector('.page-main') || document.querySelector('main');
    if (container) {
      container.innerHTML = `
        <div class="dashboard-container"> 
          <div class="empty-state">
            <div class="empty-icon">🔒</div>
            <div class="empty-title" style="background: linear-gradient(135deg, #f87171 0%, #ef4444 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
              Accès Restreint
            </div>
            <div class="empty-description">Veuillez vous connecter pour accéder à votre tableau de bord</div>
            <button class="btn btn-primary" style="background: linear-gradient(135deg, black 0%, black 100%); color: white; padding: 0.5rem 1rem; border-radius: 8px; font-weight: 600; font-size: 0.875rem; border: none; cursor: pointer; transition: background 0.3s ease;" onclick="window.location.href='index.html'">
              Retour à l'accueil
            </button>
          </div>
        </div>
      `;
    }
  }

  updateUserInfo() {
    const user = window.authService.getCurrentUser();
    const navUsername = document.getElementById('nav-username');
    const heroName = document.getElementById('hero-name');

    if (user) {
      const name = user.nom || user.nomUtilisateur || 'Utilisateur';
      if (navUsername) navUsername.textContent = name;
      if (heroName) heroName.textContent = name;
    }
  }

  async loadStats() {
    const pointsEl = document.getElementById('points-accumules');
    const tauxEl = document.getElementById('taux-reussite');
    const categorieEl = document.getElementById('categorie-favorite');

    // Afficher l'état de chargement
    if (pointsEl) pointsEl.innerHTML = '<div class="loading-spinner"></div>';
    if (tauxEl) tauxEl.innerHTML = '<div class="loading-spinner"></div>';
    if (categorieEl) categorieEl.innerHTML = '<div class="loading-spinner"></div>';

    try {
      const data = await window.authService.apiRequest('/quiz/stats');

      if (data.succes) {
        const stats = data.stats || {};
        
        if (pointsEl) pointsEl.textContent = stats.pointsAccumules ?? '0';
        if (tauxEl) tauxEl.textContent = stats.tauxReussite ?? '0%';
        if (categorieEl) categorieEl.textContent = stats.categorieFavorite || 'Aucune';
      } else {
        // Afficher les valeurs par défaut en cas d'erreur
        if (pointsEl) pointsEl.textContent = '0';
        if (tauxEl) tauxEl.textContent = '0%';
        if (categorieEl) categorieEl.textContent = 'Aucune';
      }
    } catch (error) {
      console.error('Erreur stats:', error);
      
      // Afficher les valeurs par défaut en cas d'erreur
      if (pointsEl) pointsEl.textContent = '0';
      if (tauxEl) tauxEl.textContent = '0%';
      if (categorieEl) categorieEl.textContent = 'Aucune';
    }
  }

  async loadHistory() {
    const historyBody = document.getElementById('history-body');
    const historyEmpty = document.getElementById('history-empty');
    const historyTableShell = document.getElementById('history-table-shell');

    // Afficher l'état de chargement
    if (historyBody) {
      historyBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 2rem;"><div class="loading-spinner"></div> Chargement...</td></tr>';
    }

    try {
      const data = await window.authService.apiRequest('/quiz/mes-parties');

      if (data.succes) {
        this.displayHistory(data.historique || []);
      } else {
        this.displayEmptyHistory();
      }
    } catch (error) {
      console.error('Erreur historique:', error);
      this.displayEmptyHistory();
    }
  }

  displayHistory(historique) {
    const historyBody = document.getElementById('history-body');
    const historyEmpty = document.getElementById('history-empty');
    const historyTableShell = document.getElementById('history-table-shell');

    if (!historique.length) {
      this.displayEmptyHistory();
      return;
    }

    if (historyEmpty) historyEmpty.hidden = true;
    if (historyTableShell) historyTableShell.hidden = false;

    if (!historyBody) return;
    historyBody.innerHTML = '';

    historique.forEach((partie) => {
      const tr = document.createElement('tr');

      const dateCell = document.createElement('td');
      dateCell.textContent = this.formatDate(partie.joueLe);

      const categorieCell = document.createElement('td');
      categorieCell.textContent = partie.categorieJouee || '—';

      const scoreCell = document.createElement('td');
      const score = typeof partie.scoreObtenu === 'number' ? partie.scoreObtenu : 0;
      const total = typeof partie.totalQuestions === 'number' ? partie.totalQuestions : '?';
      
      const percentage = total !== '?' ? Math.round((score / total) * 100) : 0;
      let scoreClass = 'score-low';
      if (percentage >= 70) scoreClass = 'score-good';
      else if (percentage >= 40) scoreClass = 'score-medium';
      
      scoreCell.innerHTML = `<span class="score-badge ${scoreClass}">${score}/${total}</span>`;

      const pointsCell = document.createElement('td');
      pointsCell.innerHTML = `<span class="points-badge">${partie.pointsGagnes ?? 0} pts</span>`;

      tr.appendChild(dateCell);
      tr.appendChild(categorieCell);
      tr.appendChild(scoreCell);
      tr.appendChild(pointsCell);

      historyBody.appendChild(tr);
    });
  }

  displayEmptyHistory() {
    const historyBody = document.getElementById('history-body');
    const historyEmpty = document.getElementById('history-empty');
    const historyTableShell = document.getElementById('history-table-shell');

    if (historyEmpty) historyEmpty.hidden = false;
    if (historyTableShell) historyTableShell.hidden = true;

    if (historyBody) {
      historyBody.innerHTML = '';
    }
  }

  formatDate(value) {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}

// Initialiser le gestionnaire de dashboard professionnel
document.addEventListener('DOMContentLoaded', () => {
  new ProfessionalDashboardManager();
});
