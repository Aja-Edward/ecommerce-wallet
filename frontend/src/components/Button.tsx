import React from "react";

interface ButtonProps {
  cta: React.ReactNode;
  onClick?: () => void; // optional click handler
}

const Button: React.FC<ButtonProps> = ({ cta, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="px-5 py-2 rounded-lg bg-blue-600 text-white font-medium shadow-md hover:bg-blue-700 hover:shadow-lg transition-all duration-300"
    >
      {cta}
    </button>
  );
};

export default Button;
