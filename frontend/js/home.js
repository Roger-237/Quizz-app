(function () {
  const token = window.localStorage.getItem('token');

  const guestEls = document.querySelectorAll('[data-auth-visible="guest"]');
  const authEls = document.querySelectorAll('[data-auth-visible="auth"]');
  const logoutBtn = document.getElementById('logoutHome');
  const navUsername = document.getElementById('nav-username-home');
  const startQuizBtn = document.querySelector('.hero__actions .btn--primary');

  const showGuest = !token;

  guestEls.forEach((el) => {
    if (showGuest) {
      el.removeAttribute('hidden');
      if (el.style && el.style.display === 'none') el.style.display = '';
    } else {
      el.setAttribute('hidden', 'true');
    }
  });

  authEls.forEach((el) => {
    if (showGuest) {
      el.setAttribute('hidden', 'true');
    } else {
      el.removeAttribute('hidden');
      if (el.style && el.style.display === 'none') el.style.display = '';
    }
  });

  if (!showGuest) {
    // Optionnel : récupérer le nom via /auth/check-auth
    fetch(`${window.API_BASE_URL}/auth/check-auth`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data || !data.succes || !data.utilisateur || !navUsername) return;
        navUsername.textContent = data.utilisateur.nom;
      })
      .catch(() => {});
  }

  if (logoutBtn) {
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
      window.location.reload();
    });
  }

  // Logique simple pour le bouton "Commencer le Quiz"
  if (startQuizBtn) {
    startQuizBtn.addEventListener('click', (e) => {
      if (showGuest) {
        // Non connecté : rediriger vers le formulaire de login
        e.preventDefault();
        window.location.href = '#login';
      } else {
        // Connecté : laisser la redirection normale vers quiz.html
      }
    });
  }
})();

