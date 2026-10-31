"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-text-primary flex flex-col items-center justify-center p-6 text-center select-none font-sans">
      <div className="w-full max-w-md bg-surface p-8 rounded-3xl flex flex-col items-center">
        <span className="text-xs font-mono text-brand mb-4 uppercase tracking-wider">
          404 Not Found
        </span>

        <h1 className="text-2xl font-light text-text-primary tracking-tight mb-2">
          Resource Not Found
        </h1>
        <p className="text-xs font-light text-text-muted mb-8 leading-relaxed max-w-xs">
          The requested route or asset record does not exist on the Eigenmark registry network.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link
            href="/"
            className="flex-1 py-3 px-4 bg-surface-active hover:bg-surface-active/80 text-xs font-light text-text-primary rounded-xl transition-colors duration-200"
          >
            Return to Homepage
          </Link>
          <Link
            href="/portal/register"
            className="flex-1 py-3 px-4 bg-brand hover:bg-text-primary hover:text-background text-xs font-light text-background rounded-xl transition-colors duration-200"
          >
            Launch Portal
          </Link>
        </div>
      </div>
    </div>
  );
}
