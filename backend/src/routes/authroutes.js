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
router.get('/me', authMiddleware, (req, res) => {
  return res.status(200).json({ user: req.user });
});
// Password reset by email link
router.post('/forgot-password', forgotPasswordByEmail);
router.post('/reset-password-token', resetPasswordWithToken);

// Password reset using secretCode
router.post('/reset-password-secret', resetPasswordWithSecretCode);

export default router;