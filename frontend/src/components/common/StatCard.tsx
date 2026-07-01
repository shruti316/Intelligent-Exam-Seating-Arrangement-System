import React from "react";
import clsx from "clsx";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number | string;
  subtitle?: string;

  icon?: LucideIcon;

  accent?: "sage" | "rose" | "sky" | "sand";

  className?: string;
}

const accentMap = {
  sage: {
    bg: "bg-[#EEF4ED]",
    text: "text-[#6D8A66]",
    line: "bg-[#B7C9AE]",
  },

  rose: {
    bg: "bg-[#FAF0F1]",
    text: "text-[#B26B75]",
    line: "bg-[#E6BEC5]",
  },

  sky: {
    bg: "bg-[#EEF5F7]",
    text: "text-[#6B8795]",
    line: "bg-[#BFD7DF]",
  },

  sand: {
    bg: "bg-[#F8F4EF]",
    text: "text-[#A2896D]",
    line: "bg-[#DDCCB6]",
  },
};

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = "sage",
  className,
}) => {
  const colors = accentMap[accent];

  return (
    <div
      className={clsx(
        "relative overflow-hidden rounded-[28px] border border-[#ECE4DD] bg-white p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl",
        className
      )}
    >
      <div
        className={clsx(
          "absolute left-0 top-0 h-full w-1",
          colors.line
        )}
      />

      <div className="flex items-start justify-between">
        <div>

          <p className="text-xs uppercase tracking-[0.18em] text-[#8B847D]">

            {title}

          </p>

          <h2 className="mt-4 font-cormorant text-5xl text-[#2D2825]">

            {value}

          </h2>

          {subtitle && (

            <p className="mt-3 text-sm text-[#77706A]">

              {subtitle}

            </p>

          )}

        </div>

        {Icon && (

          <div
            className={clsx(
              "flex h-14 w-14 items-center justify-center rounded-2xl",
              colors.bg
            )}
          >
            <Icon
              className={colors.text}
              size={26}
            />
          </div>

        )}

      </div>
    </div>
  );
};

export default StatCard;