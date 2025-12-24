// src/utils/authValidation.js

// 1) Politique minimale alignée backend
export const PASSWORD_RULES = {
  minLength: 8,
};

// 2) Validation frontend (simple) — tu peux garder uniquement minLength pour éviter divergences
export function validatePasswordField(value) {
  if (!value) return "Password required";
  if (value.length < PASSWORD_RULES.minLength) {
    return `Minimum ${PASSWORD_RULES.minLength} characters`;
  }
  return "";
}

// 3) Extraction d’erreurs backend standardisées
// Backend attendu:
// { message, code: "PASSWORD_POLICY_VIOLATION", details: [{code, message}, ...] }
export function extractPasswordPolicyError(data) {
  if (!data || data.code !== "PASSWORD_POLICY_VIOLATION") return null;

  const details = Array.isArray(data.details) ? data.details : [];
  const messages = details.map((d) => d?.message).filter(Boolean);

  return {
    message: data.message || "Password does not meet requirements.",
    messages: messages.length ? messages : [data.message || "Invalid password."],
  };
}

/**
 * Applique une erreur backend sur (setError + setFieldErrors)
 * sans casser la page.
 *
 * @param {object} params
 * @param {any} params.backendData err.response?.data
 * @param {(msg:string)=>void} params.setError
 * @param {(updater:any)=>void} params.setFieldErrors
 * @param {string} params.passwordFieldName "password" | "newPassword"
 * @returns {boolean} true si une erreur policy a été appliquée
 */
export function applyPasswordPolicyBackendError({
  backendData,
  setError,
  setFieldErrors,
  passwordFieldName,
}) {
  const policy = extractPasswordPolicyError(backendData);
  if (!policy) return false;

  const first = policy.messages[0];

  setError(first);

  // Afficher sous le champ password (clé variable selon page)
  setFieldErrors((prev) => ({
    ...prev,
    [passwordFieldName]: first,
  }));

  return true;
}
