import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, className, ...props }) => {
  return (
    <button
      className={`
        font-mono text-base text-off-white bg-off-black 
        border border-off-black px-4 py-2 
        transition-all duration-150 
        hover:bg-off-white hover:text-off-black hover:shadow-[4px_4px_0_#1A1A1A]
        focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-black
        active:translate-x-px active:translate-y-px active:shadow-none
        disabled:bg-light-gray disabled:text-off-white disabled:cursor-not-allowed disabled:shadow-none
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;