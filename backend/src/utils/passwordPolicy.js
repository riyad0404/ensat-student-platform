export const validatePassword = (password) => {
  if (typeof password !== "string") {
    return { ok: false, message: "Password must be a string." };
  }

  if (password.length < 8) {
    return { ok: false, message: "Password must be at least 8 characters." };
  }

  if (password.length > 64) {
    return { ok: false, message: "Password must be at most 64 characters." };
  }

  if (/\s/.test(password)) {
    return { ok: false, message: "Password must not contain spaces." };
  }

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  if (!hasLower) return { ok: false, message: "Password must include a lowercase letter." };
  if (!hasUpper) return { ok: false, message: "Password must include an uppercase letter." };
  if (!hasDigit) return { ok: false, message: "Password must include a number." };
  if (!hasSpecial) return { ok: false, message: "Password must include a special character." };

  return { ok: true };
};
