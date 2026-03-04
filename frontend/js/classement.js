// Classement avec nouveau système d'authentification
class ClassementManager {
  constructor() {
    this.init();
  }

  async init() {
    this.loadClassement();
  }

  async loadClassement() {
    try {
      const data = await window.authService.apiRequest('/quiz/classement');

      if (data.succes) {
        this.displayClassement(data.classement || []);
      }
    } catch (error) {
      console.error('Erreur classement:', error);
      window.authService.showAlert('Erreur lors du chargement du classement', 'error');
    }
  }

  displayClassement(classement) {
    const leaderboardBody = document.getElementById('leaderboard-body');
    const leaderboardEmpty = document.getElementById('leaderboard-empty');
    const leaderboardTableShell = document.getElementById('leaderboard-table-shell');

    if (!classement.length) {
      if (leaderboardEmpty) leaderboardEmpty.hidden = false;
      if (leaderboardTableShell) leaderboardTableShell.hidden = true;
      return;
    }

    if (leaderboardEmpty) leaderboardEmpty.hidden = true;
    if (leaderboardTableShell) leaderboardTableShell.hidden = false;

    if (!leaderboardBody) return;
    leaderboardBody.innerHTML = '';

    classement.forEach((joueur, index) => {
      const tr = document.createElement('tr');

      const rankCell = document.createElement('td');
      rankCell.textContent = index + 1;

      const nameCell = document.createElement('td');
      nameCell.textContent = joueur.nom;

      const pointsCell = document.createElement('td');
      pointsCell.textContent = joueur.points;

      tr.appendChild(rankCell);
      tr.appendChild(nameCell);
      tr.appendChild(pointsCell);

      leaderboardBody.appendChild(tr);
    });
  }
}

// Initialiser le gestionnaire de classement
document.addEventListener('DOMContentLoaded', () => {
  new ClassementManager();
});
