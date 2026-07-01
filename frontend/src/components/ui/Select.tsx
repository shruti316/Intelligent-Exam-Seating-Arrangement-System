import React from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";

interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  error,
  className,
  children,
  ...props
}) => {
  return (
    <div className="space-y-2">

      {label && (
        <label className="text-sm font-medium text-[#59514A]">
          {label}
        </label>
      )}

      <div className="relative">

        <select
          {...props}
          className={clsx(
            "w-full appearance-none rounded-2xl border border-[#E6DDD6]",
            "bg-[#FCFBFA]",
            "px-5 py-3",
            "pr-12",
            "text-[15px]",
            "transition-all duration-300",
            "focus:border-[#CDB9A9]",
            "focus:bg-white",
            "focus:outline-none",
            error && "border-red-400",
            className
          )}
        >
          {children}
        </select>

        <ChevronDown
          size={18}
          className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[#9A918A]"
        />

      </div>

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}

    </div>
  );
};

export default Select;