import React from "react";

export default function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-24">

      <div className="mb-6 h-12 w-12 animate-spin rounded-full border-[3px] border-[#E7DDD5] border-t-[#2F3E46]" />

      <h3 className="font-cormorant text-4xl">
        Loading
      </h3>

      <p className="mt-3 text-[#7E756F]">
        Please wait...
      </p>

    </div>
  );
} 