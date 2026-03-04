// Service d'authentification simplifié et robuste
class AuthService {
  constructor() {
    this.baseURL = window.API_BASE_URL;
    this.user = null;
    this.isInitialized = false;
  }

  // Initialiser l'auth au chargement
  async init() {
    if (this.isInitialized) return;
    
    try {
      const data = await this.apiRequest('/auth/check-auth');
      if (data.succes && data.utilisateur) {
        this.user = data.utilisateur;
        console.log('Utilisateur authentifié:', this.user);
      }
    } catch (error) {
      console.log('Non authentifié:', error.message);
      this.user = null;
    }
    
    this.isInitialized = true;
    this.updateUI();
  }

  // Récupérer le token depuis les cookies
  getToken() {
    const cookies = document.cookie.split('; ');
    const tokenCookie = cookies.find(row => row.startsWith('token='));
    return tokenCookie?.split('=')[1];
  }

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated() {
    return this.user !== null;
  }

  // Obtenir l'utilisateur courant
  getCurrentUser() {
    return this.user;
  }

  // Configuration des en-têtes pour les requêtes API
  getHeaders() {
    const token = this.getToken();
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    return headers;
  }

  // Requête API générique
  async apiRequest(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: this.getHeaders(),
      credentials: 'include',
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erreur réseau');
      }
      
      return data;
    } catch (error) {
      console.error('Erreur API:', error);
      throw error;
    }
  }

  // Inscription
  async inscription(nom, email, motDePasse) {
    const data = await this.apiRequest('/auth/inscription', {
      method: 'POST',
      body: JSON.stringify({ nom, email, motDePasse }),
    });

    if (data.succes) {
      // Stocker l'email pour la vérification
      localStorage.setItem('pendingEmail', email);
    }

    return data;
  }

  // Connexion
  async connexion(email, motDePasse) {
    const data = await this.apiRequest('/auth/connexion', {
      method: 'POST',
      body: JSON.stringify({ email, motDePasse }),
    });

    if (data.succes && data.utilisateur) {
      this.user = data.utilisateur;
      this.updateUI();
      localStorage.removeItem('pendingEmail');
    }

    return data;
  }

  // Déconnexion
  async deconnexion() {
    try {
      await this.apiRequest('/auth/deconnexion', {
        method: 'POST',
      });
    } catch (error) {
      console.error('Erreur déconnexion API:', error);
    }
    
    this.user = null;
    this.updateUI();
  }

  // Vérification d'email
  async verifierEmail(code) {
    const data = await this.apiRequest('/auth/verifier-email', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });

    if (data.succes && data.utilisateur) {
      this.user = data.utilisateur;
      this.updateUI();
      localStorage.removeItem('pendingEmail');
    }

    return data;
  }

  // Mot de passe oublié
  async motDePasseOublie(email) {
    return this.apiRequest('/auth/mot-de-passe-oublie', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Réinitialiser mot de passe
  async reinitialiserMotDePasse(token, motDePasse) {
    return this.apiRequest(`/auth/reinitialiser-mot-de-passe/${token}`, {
      method: 'POST',
      body: JSON.stringify({ motDePasse }),
    });
  }

  // Mettre à jour l'interface utilisateur
  updateUI() {
    const isAuth = this.isAuthenticated();
    const user = this.getCurrentUser();

    // Masquer/afficher les éléments selon l'auth
    document.querySelectorAll('[data-auth-visible="guest"]').forEach(el => {
      if (isAuth) {
        el.classList.add('auth-cache');
        el.classList.remove('auth-visible');
      } else {
        el.classList.remove('auth-cache');
        el.classList.add('auth-visible');
      }
    });

    document.querySelectorAll('[data-auth-visible="auth"]').forEach(el => {
      if (isAuth) {
        el.classList.remove('auth-cache');
        el.classList.add('auth-visible');
      } else {
        el.classList.add('auth-cache');
        el.classList.remove('auth-visible');
      }
    });

    // Mettre à jour le nom d'utilisateur
    document.querySelectorAll('#nav-username-home, #nav-username').forEach(el => {
      el.textContent = isAuth && user ? (user.nom || user.nomUtilisateur || 'Utilisateur') : '';
    });
  }

  // Afficher une alerte simple
  showAlert(message, type = 'info') {
    const alert = document.createElement('div');
    alert.className = `js-alerte js-alerte--${type}`;
    alert.textContent = message;
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
      if (alert.parentNode) {
        alert.parentNode.removeChild(alert);
      }
    }, 4000);
  }
}

// Créer et exporter l'instance globale
window.authService = new AuthService();

// Initialiser au chargement du DOM
document.addEventListener('DOMContentLoaded', () => {
  window.authService.init();
});
