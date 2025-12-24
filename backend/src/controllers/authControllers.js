import bcrypt from 'bcrypt';
import { User } from '../models/user.js';  // Importer le modèle User
import { generateTokens } from '../utils/generateTokens.js';
import { getResetPasswordEmailTemplate } from '../utils/emailTemplates.js';
import { verifyAccessToken,verifyRefreshToken } from '../utils/generateTokens.js';
import { validatePassword, passwordPolicyError } from '../utils/passwordPolicy.js';

import { sendEmail } from '../utils/sendEmail.js';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const isProd = process.env.NODE_ENV === 'production';

const accessCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
};

const sendAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('accessToken', accessToken, accessCookieOptions);
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);
};


// Inscription de l'utilisateur
export const register = async (req, res) => {
  const { nom, prenom, email, password, niveau, secretCode } = req.body;

  try {
    // Vérifier si l'email existe déjà
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: "L'email est déjà utilisé." });
    }
    const v = validatePassword(password, { minLength: 8 });
    if (!v.ok) return passwordPolicyError(res, v);
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
     // 🔐 Générer les tokens
    const { accessToken, refreshToken } = generateTokens(newUser);

    // 🔐 Mettre les tokens dans des cookies HTTP-only
    sendAuthCookies(res, accessToken, refreshToken);

    // Ne pas renvoyer le hash du mot de passe au frontend
    const userData = newUser.toJSON();
    delete userData.password;
    delete userData.resetPasswordToken;
    delete userData.resetPasswordExpires;

    return res
      .status(201)
      .json({ message: 'Utilisateur créé avec succès', user: userData });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Erreur du serveur', error: error.message });
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
 const { accessToken, refreshToken } = generateTokens(user);

    // 🔐 Mettre les tokens dans des cookies HTTP-only
    sendAuthCookies(res, accessToken, refreshToken);

    // Nettoyer l'objet user avant de le renvoyer
    const userData = user.toJSON();
    delete userData.password;
    delete userData.resetPasswordToken;
    delete userData.resetPasswordExpires;

    return res.status(200).json({ message: 'Connexion réussie', user: userData });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ message: 'Erreur du serveur', error: error.message });
  }
};
export const logout = (req, res) => {
  // Clear both cookies
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  });

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
  });

  return res.status(200).json({ message: 'Logged out successfully' });
};
export const refreshToken = async (req, res) => {
  const token = req.cookies?.refreshToken;

  if (!token) {
    return res.status(401).json({ message: 'Refresh token missing' });
  }

  try {
    const decoded = verifyRefreshToken(token); // { iduser: ... }

    // Optionally load user from DB to make sure they still exist
    const user = await User.findByPk(decoded.iduser);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate new pair of tokens
    const { accessToken, refreshToken } = generateTokens(user);

    // Send back in cookies
    sendAuthCookies(res, accessToken, refreshToken);

    const userData = user.toJSON();
    delete userData.password;
    delete userData.resetPasswordToken;
    delete userData.resetPasswordExpires;

    return res.status(200).json({
      message: 'Tokens refreshed successfully',
      user: userData,
    });
  } catch (error) {
    console.error('Refresh token error:', error.message);
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};
export const forgotPasswordByEmail = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      // For security, do not reveal if the email exists
      return res
        .status(200)
        .json({ message: 'If this email exists, a reset link has been sent.' });
    }

    // Generate a random token
    const resetToken = crypto.randomBytes(32).toString('hex');

    // Set token + expiration on user
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    // Frontend page that will handle the reset (React route)
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    const subject = 'Password Reset Instructions';
    const html = getResetPasswordEmailTemplate(
      user.prenom || user.nom || '',
      resetUrl
    );


    await sendEmail({ to: user.email, subject, html });

    return res
      .status(200)
      .json({ message: 'If this email exists, a reset link has been sent.' });
  } catch (error) {
    console.error('forgotPasswordByEmail error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
export const resetPasswordWithToken = async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).json({ message: 'Token and new password are required' });
  }

  try {
    const user = await User.findOne({ where: { resetPasswordToken: token } });

    if (
      !user ||
      !user.resetPasswordExpires ||
      user.resetPasswordExpires < new Date()
    ) {
      return res.status(400).json({ message: 'Token is invalid or has expired' });
    }
  
    const v = validatePassword(newPassword, { minLength: 8 });
   if (!v.ok) return passwordPolicyError(res, v);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('resetPasswordWithToken error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
export const resetPasswordWithSecretCode = async (req, res) => {
  const { email, secretCode, newPassword } = req.body;

  if (!email || !secretCode || !newPassword) {
    return res.status(400).json({
      message: 'Email, secretCode and newPassword are required',
    });
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // secretCode is stored as integer in DB
    if (Number(secretCode) !== user.secretCode) {
      return res.status(400).json({ message: 'Invalid secret code' });
    }
    const v = validatePassword(newPassword, { minLength: 8 });
   if (!v.ok) return passwordPolicyError(res, v);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    // We do not touch resetPasswordToken here
    await user.save();

    return res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    console.error('resetPasswordWithSecretCode error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
};
// Edit profile controller
export const editProfile = async (req, res) => {
  const userId = req.user.iduser;
  const { nom, prenom, email, niveau, bio, photo, currentPassword, newPassword } = req.body;

  try {
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    let changed = false;
    // Email change
    if (email && email !== user.email) {
      const existing = await User.findOne({ where: { email } });
      if (existing) {
        return res.status(400).json({ message: "L'email est déjà utilisé." });
      }
      user.email = email;
      changed = true;
    }
    // Name changes
    if (nom && nom !== user.nom) {
      user.nom = nom;
      changed = true;
    }
    if (prenom && prenom !== user.prenom) {
      user.prenom = prenom;
      changed = true;
    }
    // Niveau
    if (niveau && niveau !== user.niveau) {
      user.niveau = niveau;
      changed = true;
    }
    // Bio
    if (bio !== undefined && bio !== user.bio) {
      user.bio = bio;
      changed = true;
    }
    // Photo
    if (photo !== undefined && photo !== user.photo) {
      user.photo = photo;
      changed = true;
    }
    // Password change
   // Password change
if (currentPassword || newPassword) {
  if (!currentPassword || !newPassword) {
    return res.status(400).json({
      message: 'Both currentPassword and newPassword are required to change password.'
    });
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
  }

  // Politique mot de passe (backend)
  const v = validatePassword(newPassword, { minLength: 8 });
  if (!v.ok) return passwordPolicyError(res, v);

  // Vérifier que newPassword != ancien (comparaison correcte)
  const isSameAsOld = await bcrypt.compare(newPassword, user.password);
  if (isSameAsOld) {
    return res.status(400).json({
      message: "Le nouveau mot de passe doit être différent de l'ancien."
    });
  }

  const hashed = await bcrypt.hash(newPassword, 10);
  user.password = hashed;
  changed = true;
}


    if (!changed) {
      return res.status(200).json({ message: 'Aucune modification détectée.' });
    }

    await user.save();
    const userData = user.toJSON();
    delete userData.password;
    delete userData.resetPasswordToken;
    delete userData.resetPasswordExpires;
    return res.status(200).json({ message: 'Profil mis à jour avec succès', user: userData });
  } catch (error) {
    console.error('editProfile error:', error);
    return res.status(500).json({ message: 'Erreur du serveur', error: error.message });
  }
};

