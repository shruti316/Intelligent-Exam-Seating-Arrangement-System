import React from "react";
import { X } from "lucide-react";
import clsx from "clsx";

interface ModalProps {
  open: boolean;
  onClose: () => void;

  title: string;
  subtitle?: string;

  children: React.ReactNode;

  footer?: React.ReactNode;

  size?: "sm" | "md" | "lg" | "xl";
}

const sizes = {
  sm: "max-w-md",
  md: "max-w-xl",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
};

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  size = "md",
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm p-6">

      {/* Backdrop */}
      <div
        className="absolute inset-0"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={clsx(
          "relative w-full overflow-hidden rounded-[32px] border border-[#E8DFD8] bg-white shadow-2xl",
          sizes[size]
        )}
      >
        {/* Header */}

        <div className="flex items-start justify-between border-b border-[#ECE4DD] px-8 py-7">

          <div>

            <h2 className="font-cormorant text-4xl text-[#2D2825]">

              {title}

            </h2>

            {subtitle && (

              <p className="mt-2 text-sm text-[#7A726B]">

                {subtitle}

              </p>

            )}

          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 transition hover:bg-[#F5F2EF]"
          >
            <X size={20} />
          </button>

        </div>

        {/* Content */}

        <div className="px-8 py-8">

          {children}

        </div>

        {/* Footer */}

        {footer && (

          <div className="flex justify-end gap-3 border-t border-[#ECE4DD] bg-[#FCFBFA] px-8 py-6">

            {footer}

          </div>

        )}

      </div>

    </div>
  );
};

export default Modal;