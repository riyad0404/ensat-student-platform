import React from "react";

const Input = ({ 
  label, 
  type = "text", 
  placeholder, 
  icon, 
  value,           // ⭐ AJOUTÉ
  onChange,        // ⭐ AJOUTÉ
  ...props 
}) => {
  return (
    <div className="input-group">
      {label && <label>{label}</label>}
      <div className="input-box">
       <input
  type={type}
  placeholder={placeholder}
  value={value}
  onChange={onChange}
  {...props}
/>
        {icon && <span className="icon">{icon}</span>}
      </div>
    </div>
  );
};

export default Input;