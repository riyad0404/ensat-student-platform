// backend/src/utils/passwordPolicy.js

const DEFAULT_POLICY = {
  minLength: 8,
  maxLength: 72, // bonne pratique avec bcrypt
  requireLowercase: true,
  requireUppercase: true,
  requireNumber: true,
  requireSpecialChar: true,
  forbidSpaces: true,
  blacklist: [
    "password",
    "password123",
    "12345678",
    "123456789",
    "azerty123",
    "qwerty123",
    "admin123",
  ],
};

/**
 * Retourne une liste d'erreurs (stable pour le frontend)
 * @param {string} password
 * @param {object} policyOverride
 * @returns {{ok:boolean, errors:Array<{code:string, message:string}>}}
 */
export function validatePassword(password, policyOverride = {}) {
  const policy = { ...DEFAULT_POLICY, ...policyOverride };
  const errors = [];

  if (typeof password !== "string") {
    return {
      ok: false,
      errors: [{ code: "PASSWORD_TYPE", message: "Mot de passe invalide." }],
    };
  }

  const raw = password;

  if (raw.trim() !== raw) {
    errors.push({
      code: "PASSWORD_TRIM",
      message: "Le mot de passe ne doit pas contenir d’espaces au début ou à la fin.",
    });
  }

  if (policy.forbidSpaces && /\s/.test(raw)) {
    errors.push({
      code: "PASSWORD_SPACES",
      message: "Le mot de passe ne doit pas contenir d’espaces.",
    });
  }

  if (raw.length < policy.minLength) {
    errors.push({
      code: "PASSWORD_MIN_LENGTH",
      message: `Le mot de passe doit contenir au moins ${policy.minLength} caractères.`,
    });
  }

  if (raw.length > policy.maxLength) {
    errors.push({
      code: "PASSWORD_MAX_LENGTH",
      message: `Le mot de passe ne doit pas dépasser ${policy.maxLength} caractères.`,
    });
  }

  if (policy.requireLowercase && !/[a-z]/.test(raw)) {
    errors.push({
      code: "PASSWORD_LOWERCASE",
      message: "Le mot de passe doit contenir au moins une lettre minuscule.",
    });
  }

  if (policy.requireUppercase && !/[A-Z]/.test(raw)) {
    errors.push({
      code: "PASSWORD_UPPERCASE",
      message: "Le mot de passe doit contenir au moins une lettre majuscule.",
    });
  }

  if (policy.requireNumber && !/[0-9]/.test(raw)) {
    errors.push({
      code: "PASSWORD_NUMBER",
      message: "Le mot de passe doit contenir au moins un chiffre.",
    });
  }

  // Set raisonnable de spéciaux
  if (
    policy.requireSpecialChar &&
    !/[!@#$%^&*()_\-+={[}\]|\\:;"'<,>.?/`~]/.test(raw)
  ) {
    errors.push({
      code: "PASSWORD_SPECIAL",
      message: "Le mot de passe doit contenir au moins un caractère spécial.",
    });
  }

  const lower = raw.toLowerCase();
  if (policy.blacklist?.some((b) => b === lower)) {
    errors.push({
      code: "PASSWORD_BLACKLIST",
      message: "Mot de passe trop faible. Veuillez en choisir un autre.",
    });
  }

  return { ok: errors.length === 0, errors };
}

export function passwordPolicyError(res, validationResult) {
  return res.status(400).json({
    message: "Mot de passe non conforme à la politique.",
    code: "PASSWORD_POLICY_VIOLATION",
    details: validationResult.errors,
  });
}
