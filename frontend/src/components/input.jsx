import React from "react";

const Input = ({ 
  label, 
  type = "text", 
  placeholder, 
  icon, 
  value,           
  onChange,
  error, // ⭐ NOUVEAU : prop pour erreur
  required,
  ...props 
}) => {
  return (
    <div className="input-group">
      {label && (
        <label>
          {label}
          {required && <span className="required-star"> *</span>}
        </label>
      )}
      <div className="input-box">
        <input
          type={type}
          placeholder={placeholder}
          value={value || ""}
          onChange={onChange}
          className={error ? "input-error" : ""}
          required={required}
          {...props}
        />
        {icon && <span className="icon">{icon}</span>}
      </div>
      {/* ⭐ Afficher l'erreur sous l'input */}
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
};

export default Input;