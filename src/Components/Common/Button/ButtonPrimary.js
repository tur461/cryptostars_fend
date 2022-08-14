import React from "react";
import './ButtonStyle.scss'

const ButtonPrimary = ({ className, title, onClick, disabled }) => {
  return (
    <button className={`buttonStyle ${className}`} onClick={onClick} disabled={disabled}>
      {title}
    </button>
  );
};

export default ButtonPrimary;
