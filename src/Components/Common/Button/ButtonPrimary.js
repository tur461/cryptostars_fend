import React from "react";
import './ButtonStyle.scss'

const ButtonPrimary = ({ className, title, onClick }) => {
  return (
    <button className={`buttonStyle ${className}`} onClick={onClick}>
      {title}
    </button>
  );
};

export default ButtonPrimary;
