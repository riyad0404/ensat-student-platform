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
