import React from "react";
import clsx from "clsx";

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  children,
  className,
  ...props
}) => {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-2xl font-medium transition-all duration-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]";

  const variants = {
    primary:
      "bg-[#2F3E46] text-white shadow-soft hover:bg-[#3E515B] hover:shadow-float",

    secondary:
      "bg-[#F6F2EE] text-[#3E3A36] border border-[#E6DDD6] hover:bg-white hover:border-[#D8C9BC]",

    outline:
      "bg-transparent border border-[#D8C9BC] text-[#5B534C] hover:bg-[#F6F2EE]",

    danger:
      "bg-[#B85C5C] text-white hover:bg-[#A84E4E] shadow-soft",

    ghost:
      "bg-transparent text-[#6F675F] hover:bg-[#F6F2EE]",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",

    md: "px-5 py-2.5 text-sm",

    lg: "px-7 py-3.5 text-base",
  };

  return (
    <button
      className={clsx(
        base,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button; 