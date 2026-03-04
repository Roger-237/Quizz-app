// Gestionnaire unifié des formulaires d'authentification
class FormManager {
  constructor() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Formulaire de connexion
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin(loginForm);
      });
    }

    // Formulaire d'inscription
    const signupForm = document.getElementById('signup-form');
    if (signupForm && signupForm.querySelector('#signup-name')) {
      signupForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSignup(signupForm);
      });
    }

    // Formulaire de vérification
    const verifyForm = document.getElementById('verification-form');
    if (verifyForm) {
      verifyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleVerification(verifyForm);
      });

      // Renvoyer le code
      const resendBtn = document.getElementById('resend-code');
      if (resendBtn) {
        resendBtn.addEventListener('click', () => this.resendCode());
      }
    }

    // Formulaire mot de passe oublié
    const forgotForm = document.getElementById('forgot-form');
    if (forgotForm) {
      forgotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleForgotPassword(forgotForm);
      });
    }

    // Formulaire réinitialisation
    const resetForm = document.getElementById('reset-form');
    if (resetForm) {
      resetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleResetPassword(resetForm);
      });
    }

    // Boutons de déconnexion
    document.querySelectorAll('#logoutHome, #logout').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleLogout();
      });
    });
  }

  async handleLogin(form) {
    const formData = new FormData(form);
    const email = formData.get('email');
    const motDePasse = formData.get('password');

    if (!email || !motDePasse) {
      window.authService.showAlert('Veuillez remplir tous les champs', 'error');
      return;
    }

    try {
      const data = await window.authService.connexion(email, motDePasse);
      
      if (data.succes) {
        window.authService.showAlert('Connexion réussie!', 'success');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1500);
      } else {
        let message = data.message || 'Erreur de connexion';
        if (message.toLowerCase().includes('verifi')) {
          message = 'Veuillez d\'abord vérifier votre email. Regardez dans votre boîte de réception.';
        }
        window.authService.showAlert(message, 'error');
      }
    } catch (error) {
      window.authService.showAlert(error.message || 'Erreur de connexion', 'error');
    }
  }

  async handleSignup(form) {
    const formData = new FormData(form);
    const nom = formData.get('nom');
    const email = formData.get('email');
    const motDePasse = formData.get('password');
    const confirmation = formData.get('confirmation');

    if (!nom || !email || !motDePasse || !confirmation) {
      window.authService.showAlert('Veuillez remplir tous les champs', 'error');
      return;
    }

    if (motDePasse !== confirmation) {
      window.authService.showAlert('Les mots de passe ne correspondent pas', 'error');
      return;
    }

    if (motDePasse.length < 6) {
      window.authService.showAlert('Le mot de passe doit contenir au moins 6 caractères', 'error');
      return;
    }

    try {
      const data = await window.authService.inscription(nom, email, motDePasse);
      
      if (data.succes) {
        window.authService.showAlert('Inscription réussie! Vérifiez votre email.', 'success');
        setTimeout(() => {
          window.location.href = 'verification-email.html';
        }, 2000);
      } else {
        window.authService.showAlert(data.message || 'Erreur lors de l\'inscription', 'error');
      }
    } catch (error) {
      window.authService.showAlert(error.message || 'Erreur lors de l\'inscription', 'error');
    }
  }

  async handleVerification(form) {
    const formData = new FormData(form);
    const code = formData.get('code');

    if (!code || code.length !== 6) {
      window.authService.showAlert('Veuillez entrer un code à 6 chiffres valide', 'error');
      return;
    }

    try {
      const data = await window.authService.verifierEmail(code);
      
      if (data.succes) {
        window.authService.showAlert('Email vérifié! Redirection...', 'success');
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 2000);
      } else {
        window.authService.showAlert(data.message || 'Code invalide', 'error');
      }
    } catch (error) {
      window.authService.showAlert(error.message || 'Erreur lors de la vérification', 'error');
    }
  }

  async handleForgotPassword(form) {
    const formData = new FormData(form);
    const email = formData.get('email');

    if (!email) {
      window.authService.showAlert('Veuillez entrer votre email', 'error');
      return;
    }

    try {
      const data = await window.authService.motDePasseOublie(email);
      
      if (data.succes) {
        window.authService.showAlert('Email de réinitialisation envoyé!', 'success');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 2000);
      } else {
        window.authService.showAlert(data.message || 'Erreur lors de l\'envoi', 'error');
      }
    } catch (error) {
      window.authService.showAlert(error.message || 'Erreur lors de l\'envoi', 'error');
    }
  }

  async handleResetPassword(form) {
    const formData = new FormData(form);
    const motDePasse = formData.get('password');
    const confirmation = formData.get('confirmation');

    if (!motDePasse || !confirmation) {
      window.authService.showAlert('Veuillez remplir tous les champs', 'error');
      return;
    }

    if (motDePasse !== confirmation) {
      window.authService.showAlert('Les mots de passe ne correspondent pas', 'error');
      return;
    }

    if (motDePasse.length < 6) {
      window.authService.showAlert('Le mot de passe doit contenir au moins 6 caractères', 'error');
      return;
    }

    // Récupérer le token depuis l'URL
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token') || window.location.pathname.split('/').pop();

    if (!token || token === 'reset-password.html') {
      window.authService.showAlert('Lien de réinitialisation invalide', 'error');
      setTimeout(() => {
        window.location.href = 'forgot-password.html';
      }, 2000);
      return;
    }

    try {
      const data = await window.authService.reinitialiserMotDePasse(token, motDePasse);
      
      if (data.succes) {
        window.authService.showAlert('Mot de passe réinitialisé!', 'success');
        setTimeout(() => {
          window.location.href = 'index.html';
        }, 2000);
      } else {
        window.authService.showAlert(data.message || 'Erreur lors de la réinitialisation', 'error');
      }
    } catch (error) {
      window.authService.showAlert(error.message || 'Erreur lors de la réinitialisation', 'error');
    }
  }

  async handleLogout() {
    try {
      await window.authService.deconnexion();
      window.authService.showAlert('Déconnexion réussie', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    } catch (error) {
      window.authService.showAlert('Erreur lors de la déconnexion', 'error');
    }
  }

  async resendCode() {
    const email = localStorage.getItem('pendingEmail');
    if (!email) {
      window.authService.showAlert('Email non trouvé. Veuillez vous réinscrire.', 'error');
      return;
    }

    const resendBtn = document.getElementById('resend-code');
    if (resendBtn) {
      resendBtn.disabled = true;
      resendBtn.textContent = 'Envoi en cours...';
    }

    try {
      const data = await window.authService.motDePasseOublie(email);
      
      if (data.succes) {
        window.authService.showAlert('Code renvoyé avec succès!', 'success');
      } else {
        window.authService.showAlert(data.message || 'Erreur lors de l\'envoi', 'error');
      }
    } catch (error) {
      window.authService.showAlert(error.message || 'Erreur lors de l\'envoi', 'error');
    } finally {
      if (resendBtn) {
        resendBtn.disabled = false;
        resendBtn.textContent = 'Renvoyer';
      }
    }
  }
}

// Initialiser le gestionnaire de formulaires
document.addEventListener('DOMContentLoaded', () => {
  new FormManager();
});
