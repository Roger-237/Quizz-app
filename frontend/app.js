const btnSignIn = document.getElementById('openAuth');
const authModal = document.getElementById('authModal');
const loginForm = document.getElementById('loginForm');

// 1. Afficher la modale
btnSignIn.addEventListener('click', () => {
    authModal.style.display = 'block';
});

// 2. Gérer la soumission
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const motDePasse = document.getElementById('loginPassword').value;
    const messageElt = document.getElementById('authMessage');

    try {
        const response = await fetch('http://localhost:3000/api/auth/connexion', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ email, motDePasse })
        });

        const data = await response.json();

        if (response.ok) {
            messageElt.style.color = "#00d1b2";
            messageElt.innerText = "Connecté ! Redirection...";
            
            // Le cookie JWT est maintenant stocké par le navigateur
            console.log("Utilisateur connecté :", data.utilisateur);
            
            // On ferme la modale après 1.5s
            setTimeout(() => { authModal.style.display = 'none'; }, 1500);
        } else {
            messageElt.style.color = "red";
            messageElt.innerText = data.message || "Identifiants incorrects";
        }
    } catch (error) {
        messageElt.innerText = "Erreur : Impossible de joindre l'API.";
    }
});
