import bcrypt from 'bcrypt';
import { User } from '../models/user.js';  // Importer le modèle User

// Inscription de l'utilisateur
export const register = async (req, res) => {
  const { nom, prenom, email, password, niveau, secretCode } = req.body;

  try {
    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "L'email est déjà utilisé." });
    }

    // Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur dans la base de données
    const newUser = await User.create({
      nom,
      prenom,
      email,
      password: hashedPassword,
      niveau,
      secretCode
    });

    // Retourner un message de succès avec l'utilisateur créé
    res.status(201).json({ message: 'Utilisateur créé avec succès', user: newUser });
  } catch (error) {
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};

// Connexion de l'utilisateur
export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe dans la base de données
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({ message: 'Utilisateur non trouvé' });
    }

    // Comparer le mot de passe envoyé avec celui de la base de données
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Mot de passe incorrect' });
    }

    // Si l'email et le mot de passe sont corrects
    // (Pour l'instant, on ne génère pas de JWT, c'est à ton collègue de le faire)
    res.status(200).json({ message: 'Connexion réussie', user });
  } catch (error) {
    res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};
