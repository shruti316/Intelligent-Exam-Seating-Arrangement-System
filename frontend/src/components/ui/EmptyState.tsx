import React from "react";
import { Database } from "lucide-react";
import Button from "../common/Button";

interface Props {
  title: string;
  description: string;
  buttonText?: string;
  onClick?: () => void;
}

export default function EmptyState({
  title,
  description,
  buttonText,
  onClick,
}: Props) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[28px] border border-[#ECE4DD] bg-white px-10 py-20">

      <Database
        size={56}
        className="mb-6 text-[#B9ADA3]"
      />

      <h2 className="font-cormorant text-4xl text-[#302B27]">
        {title}
      </h2>

      <p className="mt-4 max-w-md text-center text-[#817972]">
        {description}
      </p>

      {buttonText && (
        <Button
          className="mt-8"
          onClick={onClick}
        >
          {buttonText}
        </Button>
      )}

    </div>
  );
}