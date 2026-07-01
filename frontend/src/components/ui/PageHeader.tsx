import React from "react";
import clsx from "clsx";

interface PageHeaderProps {
  title: string;
  subtitle?: string;

  actions?: React.ReactNode;

  badge?: string;

  align?: "left" | "center";

  className?: string;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  actions,
  badge,
  align = "left",
  className,
}) => {
  return (
    <section
      className={clsx(
        "mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between",
        align === "center" && "items-center text-center",
        className
      )}
    >
      <div>

        {badge && (
          <span className="inline-flex rounded-full border border-[#E8DDD6] bg-[#F8F4F0] px-4 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-[#8D827A]">
            {badge}
          </span>
        )}

        <h1 className="mt-4 font-cormorant text-[40px] leading-none text-[#2D2825]">
          {title}
        </h1>

        {subtitle && (
          <p className="mt-3 max-w-2xl text-[16px] leading-7 text-[#7A726B]">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-3">
          {actions}
        </div>
      )}
    </section>
  );
};

export default PageHeader; 