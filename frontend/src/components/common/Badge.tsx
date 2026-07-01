import React from "react";
import clsx from "clsx";

interface BadgeProps {
  children: React.ReactNode;
  color?: "rose" | "sage" | "sky" | "sand";
}

const colors = {
  rose: "bg-[#FAF1F2] text-[#A8616B]",
  sage: "bg-[#EEF4ED] text-[#607C5A]",
  sky: "bg-[#EEF5F8] text-[#5F8193]",
  sand: "bg-[#F8F3EE] text-[#8A7156]",
};

const Badge: React.FC<BadgeProps> = ({
  children,
  color = "sage",
}) => {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        colors[color]
      )}
    >
      {children}
    </span>
  );
};

export default Badge; 