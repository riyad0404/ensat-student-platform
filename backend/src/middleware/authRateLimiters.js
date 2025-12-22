import rateLimit from "express-rate-limit";
//Login
export const loginLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  max: 5,                  // 5 tentatives max dans ces 2 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message:
      "Too many login attempts. Please try again in 2 minutes.",
  },
});
//Sign Up
export const signupLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 3,                  // 3 inscriptions max
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many signup attempts. Please try again later.",
  },
});
// Forgot password (email request)
export const forgotPasswordLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 10 minutes
  max: 3,                  // 3 demandes max
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many password reset requests. Please try again later.",
  },
});
// Reset password (token OR secret code)
export const resetPasswordLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3,                 // 3 tentatives de saisie
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many reset attempts. Please try again later.",
  },
});