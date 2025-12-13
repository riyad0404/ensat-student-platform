import React from "react";

const Button = ({ 
  text, 
  className, 
  onClick, 
  type = "button", 
  disabled,      // ⭐ AJOUTÉ
  ...props 
}) => {
  return (
    <button 
      type={type} 
      className={className} 
      onClick={onClick}
      disabled={disabled}           // ⭐ UTILISE disabled
      style={{
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        ...props.style
      }}
      {...props}
    >
      {text}
    </button>
  );
};

export default Button;