import React from "react";
export default function Loading() {
    return (
      <div className="absolute flex items-center justify-center h-full w-full z-50 bg-black/70">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      </div>
    );
  }