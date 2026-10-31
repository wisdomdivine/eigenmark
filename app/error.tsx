"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Application error boundary caught error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col items-center justify-center p-6 text-center select-none font-sans">
      <div className="w-full max-w-md bg-surface p-8 rounded-3xl flex flex-col items-center">
        <span className="text-xs font-mono text-error mb-4 uppercase tracking-wider">
          Runtime Exception
        </span>

        <h1 className="text-2xl font-light text-text-primary tracking-tight mb-2">
          Something went wrong
        </h1>
        <p className="text-xs font-light text-text-muted mb-6 leading-relaxed max-w-xs">
          An unexpected error occurred while executing the transaction or loading the registry.
        </p>

        {error.message && (
          <div className="w-full p-3 bg-surface-active/50 rounded-xl mb-6 text-left">
            <span className="text-[9px] uppercase tracking-wider text-text-muted font-mono block mb-1">
              Error Details
            </span>
            <p className="text-[11px] font-mono text-text-primary break-all leading-tight">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <button
            onClick={() => reset()}
            className="flex-1 py-3 px-4 bg-surface-active hover:bg-surface-active/80 text-xs font-light text-text-primary rounded-xl cursor-pointer transition-colors duration-200"
          >
            Try Again
          </button>
          <Link
            href="/"
            className="flex-1 py-3 px-4 bg-brand hover:bg-text-primary hover:text-background text-xs font-light text-background rounded-xl transition-colors duration-200"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
