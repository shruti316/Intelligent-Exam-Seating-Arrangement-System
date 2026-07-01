import React from "react";
import clsx from "clsx";
import { Search } from "lucide-react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: boolean;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  icon = false,
  className,
  ...props
}) => {
  return (
    <div className="space-y-2">

      {label && (
        <label className="block text-sm font-medium text-[#5D5550]">
          {label}
        </label>
      )}

      <div className="relative">

        {icon && (
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A79F98]"
          />
        )}

        <input
          {...props}
          className={clsx(
            "w-full rounded-2xl border border-[#E8DFD8] bg-[#FCFBFA]",
            "px-5 py-3",
            "text-[15px]",
            "text-[#332E2B]",
            "placeholder:text-[#AAA39D]",
            "transition-all duration-300",
            "focus:border-[#C8B8AA]",
            "focus:bg-white",
            "focus:shadow-md",
            "focus:outline-none",
            icon && "pl-12",
            error && "border-[#D17C7C]",
            className
          )}
        />

      </div>

      {error && (
        <p className="text-sm text-[#B75A5A]">
          {error}
        </p>
      )}

    </div>
  );
};

export default Input;