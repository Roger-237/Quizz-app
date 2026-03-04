export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vérifiez votre email</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Vérifiez votre email</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Bonjour,</p>
    <p>Merci de vous être inscrit ! Votre code de vérification est :</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4CAF50;">{verificationCode}</span>
    </div>
    <p>Entrez ce code sur la page de vérification pour compléter votre inscription.</p>
    <p>Ce code expirera dans 15 minutes pour des raisons de sécurité.</p>
    <p>Si vous n'avez pas créé de compte chez nous, veuillez ignorer cet email.</p>
    <p>Cordialement,<br>L'équipe QuizzApp</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>Ceci est un message automatique, merci de ne pas répondre à cet email.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisation du mot de passe réussie</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Réinitialisation du mot de passe réussie</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Bonjour,</p>
    <p>Nous vous confirmons que votre mot de passe a été réinitialisé avec succès.</p>
    <div style="text-align: center; margin: 30px 0;">
      <div style="background-color: #4CAF50; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; font-size: 30px;">
        ✓
      </div>
    </div>
    <p>Si vous n'avez pas initié cette réinitialisation, veuillez contacter notre équipe de support immédiatement.</p>
    <p>Pour des raisons de sécurité, nous vous recommandons de :</p>
    <ul>
      <li>Utiliser un mot de passe fort et unique</li>
      <li>Activer l'authentification à deux facteurs si disponible</li>
      <li>Éviter d'utiliser le même mot de passe sur plusieurs sites</li>
    </ul>
    <p>Merci de nous aider à maintenir la sécurité de votre compte.</p>
    <p>Cordialement,<br>L'équipe QuizzApp</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>Ceci est un message automatique, merci de ne pas répondre à cet email.</p>
  </div>
</body>
</html>
`;

export const PASSWORD_RESET_REQUEST_TEMPLATE = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Réinitialisez votre mot de passe</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(to right, #4CAF50, #45a049); padding: 20px; text-align: center;">
    <h1 style="color: white; margin: 0;">Réinitialisation du mot de passe</h1>
  </div>
  <div style="background-color: #f9f9f9; padding: 20px; border-radius: 0 0 5px 5px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
    <p>Bonjour,</p>
    <p>Nous avons reçu une demande de réinitialisation de votre mot de passe. Si vous n'avez pas fait cette demande, veuillez ignorer cet email.</p>
    <p>Pour réinitialiser votre mot de passe, cliquez sur le bouton ci-dessous :</p>
    <div style="text-align: center; margin: 30px 0;">
      <a href="{resetURL}" style="background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Réinitialiser le mot de passe</a>
    </div>
    <p>Ce lien expirera dans 1 heure pour des raisons de sécurité.</p>
    <p>Cordialement,<br>L'équipe QuizzApp</p>
  </div>
  <div style="text-align: center; margin-top: 20px; color: #888; font-size: 0.8em;">
    <p>Ceci est un message automatique, merci de ne pas répondre à cet email.</p>
  </div>
</body>
</html>
`;
