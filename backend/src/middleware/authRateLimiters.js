import rateLimit from "express-rate-limit";

// Helper: no-op middleware for test env
const noop = (req, res, next) => next();

const isTest = process.env.NODE_ENV === 'test';

//Login
export const loginLimiter = isTest
  ? noop
  : rateLimit({
      windowMs: 2 * 60 * 1000, // 2 minutes
      max: 5, // 5 tentatives max dans ces 2 minutes
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        message: "Too many login attempts. Please try again in 2 minutes.",
      },
    });

//Sign Up
export const signupLimiter = isTest
  ? noop
  : rateLimit({
      windowMs: 10 * 60 * 1000, // 10 minutes
      max: 3, // 3 inscriptions max
      standardHeaders: true,
      legacyHeaders: false,
      skipFailedRequests: true,
      message: {
        message: "Too many signup attempts. Please try again later.",
      },
    });
