import express from 'express';
import {
  register,
  login,
  logout,
  refreshToken,
  forgotPasswordByEmail,
  resetPasswordWithToken,
  resetPasswordWithSecretCode,
  editProfile,
} from '../controllers/authControllers.js';
import {authMiddleware} from '../middleware/authMiddleware.js'
import { loginLimiter ,signupLimiter} from "../middleware/authRateLimiters.js";
const router=express.Router();
// Edit profile route (protected)
router.put('/edit-profile', authMiddleware, editProfile);



// Route pour l'inscription
router.post('/signup', signupLimiter, register);
// Route pour la connexion
router.post("/login",loginLimiter,login);

router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

// Example protected route: current authenticated user
import { User } from '../models/user.js';
// ...existing code...
// Example protected route: current authenticated user
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.iduser, {
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpires'] }
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    return res.status(200).json({ user });
  } catch (err) {
    return res.status(500).json({ error: 'Server error', details: err.message });
  }
});
// Password reset by email link
router.post('/forgot-password', forgotPasswordByEmail);
router.post('/reset-password-token', resetPasswordWithToken);

// Password reset using secretCode
router.post('/reset-password-secret', resetPasswordWithSecretCode);

export default router;