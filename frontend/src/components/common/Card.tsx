import React from "react";
import clsx from "clsx";

interface CardProps {
  children: React.ReactNode;

  title?: string;
  subtitle?: string;

  actions?: React.ReactNode;

  className?: string;

  hover?: boolean;

  hero?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  actions,
  className,
  hover = true,
  hero = false,
}) => {
  return (
    <div
      className={clsx(
        "overflow-hidden rounded-[28px] border transition-all duration-300",

        hero
          ? "border-[#E5D8CD] bg-white shadow-lg"
          : "border-[#ECE4DD] bg-white shadow-sm",

        hover &&
          "hover:-translate-y-1 hover:shadow-xl hover:border-[#D9C8BC]",

        className
      )}
    >
      {(title || subtitle || actions) && (
        <div className="flex items-start justify-between px-8 pt-7 pb-5">
          <div>
            {title && (
              <h2 className="font-cormorant text-[34px] leading-none text-[#2C2623]">
                {title}
              </h2>
            )}

            {subtitle && (
              <p className="mt-2 text-sm leading-6 text-[#7B746F] max-w-xl">
                {subtitle}
              </p>
            )}
          </div>

          {actions && <div>{actions}</div>}
        </div>
      )}

      <div className="px-8 pb-8">{children}</div>
    </div>
  );
};

export default Card;